/**
 * `pnpm promotions:apply --from=<private dir> [--date=YYYY-MM-DD]`
 *
 * Publishes the reviews the operator merged in the private repository, into
 * this repository's working tree, for the pull request the operator merges:
 *
 * - each anagram to place becomes a hit, placed on its shelf now, against the
 *   hits of today (`shelve`, with D40 and the alternates cap): three to an
 *   input on the shelves, five more as alternates, the rest near misses;
 * - its input becomes a candidate where it has none, source `promotion` or
 *   `submission`, and takes what the input is from the reader when the review
 *   kept it, or from the model;
 * - the words the review forwarded become word requests, source `submission`;
 * - every review line becomes one line of data/promotions/decisions.jsonl, by
 *   code, with no text; a private person's is `withheld`, with no scores;
 * - data/promotions/reviews/<date>.md lists what it published, for the pull
 *   request body.
 *
 * A review line is applied once: one already in decisions.jsonl on main, or
 * on the branch of any `hits/*` pull request still open, is skipped. Nothing
 * in it needs a model. It prints counts only.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { aboutProblem, candidateOf, syncAbout, tidySentence } from '../about.ts';
import { alphagram, candidateId, hitId } from '../ids.ts';
import { alternateCounts, tagsFor, takenCounts } from '../ingest.ts';
import { flag } from '../queue.ts';
import { mergeRequests, readRequests, writeRequests, type WordRequest } from '../requests.ts';
import {
  CANDIDATES_PATH,
  HITS_PATH,
  REPO_ROOT,
  appendJsonl,
  candidateSchema,
  dictionaryPin,
  hitSchema,
  readJsonl,
  today,
  writeJsonl,
  type Candidate,
  type Hit,
  type JudgementV2,
  type Tone,
} from '../schema.ts';
import { readAdditionWords } from '../settings.ts';
import { assess, shelve } from '../shelf.ts';
import {
  DECISIONS_PATH,
  PUBLIC_REPORTS_DIR,
  failQuietly,
  readDecisions,
  readReviews,
  shortCode,
  validators,
  writeLines,
  type Decision,
  type DecisionOutcome,
  type ReviewLine,
} from './files.ts';

/** The tag a placed promotion carries: promoted from a search, or submitted from Build. */
const KIND_TAG = { search: 'promoted', submission: 'submitted' } as const;

export type Applied = {
  hits: Hit[];
  candidates: Candidate[];
  requests: WordRequest[];
  decisions: Decision[];
  /** Placed hits by where they went. */
  placed: { hit: Hit; shelf: 'interesting' | 'stretch' | 'alternate'; line: ReviewLine }[];
  /** Reader-written sentences that reached the files, to list in the report: an input's about by candidate id, a credit by hit id. */
  fromReaders: { id: string; about?: string; credit?: string }[];
};

/**
 * What the merged review lines publish. `known` is every hit now, `candidates`
 * every candidate now; `applied` names the review lines already published,
 * as `<code>|<decided>`. Pure.
 */
export function applyReviews(
  lines: readonly ReviewLine[],
  context: {
    known: readonly Hit[];
    candidates: readonly Candidate[];
    applied: ReadonlySet<string>;
    date: string;
    dictionary: Hit['dictionary'];
  },
): Applied {
  const fresh = lines.filter((l) => !context.applied.has(`${l.key_sha256}|${l.decided}`));
  const candidates = context.candidates.map((c) => ({ ...c }));
  const byCandidate = new Map(candidates.map((c) => [c.id, c]));
  const knownIds = new Set(context.known.map((h) => h.id));
  const decisions: Decision[] = [];
  const requests: WordRequest[] = [];
  const hits: Hit[] = [];
  const placed: Applied['placed'] = [];
  const fromReaders: Applied['fromReaders'] = [];

  const decision = (line: ReviewLine, outcome: DecisionOutcome, hit?: string): Decision => ({
    key_sha256: line.key_sha256,
    decided: line.decided,
    promotions: line.promotions,
    outcome,
    ...(outcome === 'withheld' ? {} : { relation: line.verdict!.relation, reads: line.verdict!.reads, category: line.verdict!.category }),
    ...(hit ? { hit_id: hit } : {}),
    model: line.model,
    rubric_version: line.rubric_version,
    review_version: line.review_version,
    judged_by: line.judged_by,
    applied: context.date,
  });

  // Placement is per input, so group what is to be placed by candidate.
  const toPlace = new Map<string, ReviewLine[]>();
  for (const line of fresh) {
    if (line.outcome === 'private') decisions.push(decision(line, 'withheld'));
    else if (line.outcome === 'near' || line.outcome === 'none') decisions.push(decision(line, line.outcome));
    else if (line.outcome === 'words-missing') {
      decisions.push(decision(line, 'words-missing'));
      for (const word of line.verdict!.requests ?? []) {
        requests.push({
          word,
          source: 'submission',
          from: `promotion ${shortCode(line.key_sha256)}`,
          why: 'A reader’s submission needed it, and the review judged it a real English word.',
          seen: line.decided,
          status: 'open',
        });
      }
    } else {
      const id = candidateId(line.row!.input, line.verdict!.category);
      toPlace.set(id, [...(toPlace.get(id) ?? []), line]);
    }
  }

  const taken = takenCounts(context.known);
  const alternates = alternateCounts(context.known);
  const scores = (l: ReviewLine) => ({ relation: l.verdict!.relation, reads: l.verdict!.reads });
  for (const [cid, group] of toPlace) {
    const shelved = shelve(group, scores, (l) => l.key_sha256, taken.get(cid) ?? 0, alternates.get(cid) ?? 0);
    const existing = byCandidate.get(cid);
    // The input reads as the candidate already has it; a new candidate takes the reader's spelling.
    const input = existing?.input ?? group[0]!.row!.input;
    const idOf = (line: ReviewLine) => hitId(input, line.verdict!.category, line.row!.words);
    const make = (line: ReviewLine, status: Hit['status'], alternate: boolean): Hit | null => {
      const v = line.verdict!;
      const row = line.row!;
      const id = idOf(line);
      if (knownIds.has(id) || hits.some((h) => h.id === id)) return null;
      const judgement: JudgementV2 = {
        model: line.model,
        rubric_version: line.rubric_version,
        relation: v.relation,
        reads: v.reads,
        tone: v.tone as Tone[],
        subjects: v.subjects,
        rationale: v.rationale,
        judged_at: line.decided,
        judged_by: line.judged_by,
        ...(v.justification ? { justification: v.justification } : {}),
        ...(v.senses ? { senses: v.senses } : {}),
        ...(v.display ? { display: v.display } : {}),
      };
      const credit = row.kind === 'submission' && v.credit === 'keep' && row.credit_reader?.trim() ? row.credit_reader.trim() : null;
      if (credit) fromReaders.push({ id, credit });
      return {
        id,
        input,
        category: v.category,
        words: row.words,
        // The review's checked display, else the words in order.
        display: v.display ?? row.words.join(' '),
        letters: alphagram(input),
        prefilter_score: 0,
        judge: [judgement],
        added: context.date,
        dictionary: context.dictionary,
        tier: row.tier ?? 'extended',
        tags: [...tagsFor(judgement, alternate, existing?.subjects), KIND_TAG[row.kind]],
        status,
        ...(v.justification ? { justification: v.justification } : {}),
        ...(v.senses ? { senses: v.senses } : {}),
        ...(credit ? { submitter: credit } : {}),
      };
    };
    const wrote: Hit[] = [];
    const place = (line: ReviewLine, shelf: 'interesting' | 'stretch' | 'alternate') => {
      const hit = make(line, shelf === 'alternate' ? 'proposed' : 'accepted', shelf === 'alternate');
      if (hit) {
        wrote.push(hit);
        placed.push({ hit, shelf, line });
      }
      decisions.push(decision(line, shelf, idOf(line)));
    };
    for (const line of shelved.accepted) place(line, assess(scores(line)) as 'interesting' | 'stretch');
    for (const line of shelved.alternates) place(line, 'alternate');
    for (const line of shelved.near) decisions.push(decision(line, 'near'));
    if (wrote.length === 0) continue;
    hits.push(...wrote);

    // A new input becomes a candidate, now that it has a hit.
    const candidate: Candidate = existing ?? {
      id: cid,
      input,
      category: group[0]!.verdict!.category,
      source: group[0]!.row!.kind === 'search' ? 'promotion' : 'submission',
      first_seen: context.date,
      status: 'enumerated',
    };
    if (!existing) {
      candidates.push(candidate);
      byCandidate.set(cid, candidate);
    }
    // What the input is: the reader's sentence when the review kept it, else the model's; never over one it has.
    if (!candidate.about) {
      for (const line of group) {
        const reader = line.verdict!.reader_about === 'keep' && line.row!.about_reader ? tidySentence(line.row!.about_reader) : null;
        const model = line.verdict!.about ? tidySentence(line.verdict!.about) : null;
        if (reader && !aboutProblem(reader)) {
          candidate.about = reader;
          fromReaders.push({ id: cid, about: reader });
          break;
        }
        if (model && !aboutProblem(model)) {
          candidate.about = model;
          break;
        }
      }
    }
  }
  return { hits, candidates, requests, decisions, placed, fromReaders };
}

const cell = (text: string): string => text.replace(/\|/g, '/').replace(/\s+/g, ' ').trim();

/** What an apply published, for the public pull request. Only what the operator already approved. */
export function renderPublicReport(date: string, applied: Applied, requestsAdded: readonly WordRequest[]): string {
  const count = (o: DecisionOutcome) => applied.decisions.filter((d) => d.outcome === o).length;
  const table = (rows: Applied['placed']) => [
    '| shelf | relation | reads | input | anagram | promotions | justification |',
    '|---|---|---|---|---|---|---|',
    ...rows.map(
      (p) =>
        `| ${p.shelf === 'stretch' ? 'A stretch' : p.shelf === 'interesting' ? 'Interesting' : 'alternate'} | ${p.line.verdict!.relation === 5 ? '5, flagged for Greatest Hits' : p.line.verdict!.relation} | ${p.line.verdict!.reads} | ${cell(p.hit.input)} | ${cell(p.hit.display)} | ${p.line.promotions} | ${cell(p.hit.justification ?? '')} |`,
    ),
  ];
  return [
    `# Promotions applied, ${date}`,
    '',
    `From the reviews merged in the private repository. ${applied.placed.length} ${applied.placed.length === 1 ? 'anagram' : 'anagrams'} placed; ` +
      `${count('near')} near, ${count('none')} with no link, ${count('withheld')} withheld, ${count('words-missing')} waiting on words, by code in data/promotions/decisions.jsonl.`,
    '',
    ...(applied.placed.length
      ? ['Merging this pull request publishes the Interesting and A stretch rows below; alternates are proposed. Once published, each promotion of them becomes a vote.', '', ...table(applied.placed), '']
      : []),
    ...(applied.fromReaders.length
      ? [
          '## Written by readers',
          '',
          'A reader wrote these; the review kept them, and merging publishes them. Change one with `pnpm hits:describe` or `pnpm hits:justify` on the branch.',
          '',
          ...applied.fromReaders.map((r) => (r.about ? `- \`${r.id}\`: what the input is: ${cell(r.about)}` : `- \`${r.id}\`: credit: ${cell(r.credit ?? '')}`)),
          '',
        ]
      : []),
    ...(requestsAdded.length
      ? ['## Word requests', '', 'Words readers’ submissions needed, forwarded by the review. A proposal only; see "Word requests" in docs/OPERATOR.md.', '', ...requestsAdded.map((r) => `- ${r.word}`), '']
      : []),
  ].join('\n');
}

/** Decisions already published: on main, and on the branch of any open `hits/*` pull request. */
function appliedOnBranches(): { applied: Set<string>; problem: string | null } {
  const applied = new Set<string>();
  const git = (...args: string[]) => execFileSync('git', ['-C', REPO_ROOT, ...args], { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  try {
    git('fetch', '-q', 'origin', '+refs/heads/hits/*:refs/remotes/origin/hits/*');
  } catch {
    return { applied, problem: 'the open pull requests could not be fetched, so a review applied on one cannot be ruled out' };
  }
  for (const branch of git('for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin/hits/').split('\n').filter(Boolean)) {
    let text = '';
    try {
      text = git('show', `${branch}:data/promotions/decisions.jsonl`);
    } catch {
      continue;
    }
    for (const line of text.split('\n').filter((l) => l.trim())) {
      const d = JSON.parse(line) as Decision;
      applied.add(`${d.key_sha256}|${d.decided}`);
    }
  }
  return { applied, problem: null };
}

async function main(argv: readonly string[]): Promise<void> {
  const from = flag(argv, 'from');
  if (!from) throw new Error('say --from=<the private checkout>');
  if (!existsSync(from)) {
    console.log('promotions:apply: there is no private checkout; nothing to apply.');
    return;
  }
  if (existsSync(resolve(from, '.git'))) {
    const branch = execFileSync('git', ['-C', from, 'rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    if (branch !== 'main') {
      console.log(`promotions:apply: the private checkout is on ${branch}, not main; only merged reviews are applied. Nothing applied.`);
      return;
    }
  }
  const date = flag(argv, 'date') ?? today();
  const decisions = await readDecisions();
  const onBranches = argv.includes('--no-branches') ? { applied: new Set<string>(), problem: null } : appliedOnBranches();
  if (onBranches.problem) {
    console.log(`promotions:apply: ${onBranches.problem}; nothing applied.`);
    return;
  }
  const applied = new Set([...decisions.map((d) => `${d.key_sha256}|${d.decided}`), ...onBranches.applied]);
  const lines = (await readReviews(from)).flatMap((r) => r.lines);
  const hv = await hitSchema();
  const cv = await candidateSchema();
  const known = await readJsonl(HITS_PATH, hv);
  const result = applyReviews(lines, { known, candidates: await readJsonl(CANDIDATES_PATH, cv), applied, date, dictionary: await dictionaryPin() });
  if (result.decisions.length === 0) {
    console.log('promotions:apply: every merged review is applied already; nothing to do.');
    return;
  }

  // Write everything through its schema: a line that does not fit stops the apply before any file changes.
  const dv = await validators.decision();
  for (const decision of result.decisions) {
    const code = shortCode(decision.key_sha256);
    if (!dv(decision)) throw new Error(`the decision for ${code} does not fit its schema`);
  }
  for (const hit of result.hits) {
    const id = hit.id;
    if (!hv(hit)) throw new Error(`the hit ${id} does not fit its schema`);
  }
  for (const candidate of result.candidates) {
    const id = candidate.id;
    if (!cv(candidate)) throw new Error(`the candidate ${id} does not fit its schema`);
  }

  await writeJsonl(CANDIDATES_PATH, result.candidates, cv);
  const touched = new Set(result.hits.map((h) => candidateOf(h.id)));
  const synced = syncAbout([...known, ...result.hits], result.candidates, touched);
  if (synced.changed.length > 0) await writeJsonl(HITS_PATH, synced.hits, hv);
  else await appendJsonl(HITS_PATH, synced.hits.slice(known.length), hv);
  const onFile = await readRequests();
  const merged = mergeRequests(onFile, result.requests, new Set(await readAdditionWords()));
  if (merged.added.length > 0) await writeRequests(merged.next);
  await writeLines(DECISIONS_PATH, [...decisions, ...result.decisions], await validators.decision());
  await mkdir(PUBLIC_REPORTS_DIR, { recursive: true });
  await writeFile(resolve(PUBLIC_REPORTS_DIR, `${date}.md`), renderPublicReport(date, result, merged.added));
  console.log(
    `promotions:apply ${date}: ${result.decisions.length} decisions published; ${result.placed.filter((p) => p.shelf !== 'alternate').length} placed on a shelf, ` +
      `${result.placed.filter((p) => p.shelf === 'alternate').length} alternates, ${merged.added.length} word requests. Wrote data/promotions/reviews/${date}.md.`,
  );
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  const argv = process.argv.slice(2);
  await main(argv).catch(failQuietly('promotions:apply', argv));
}

