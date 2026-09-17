/**
 * `pnpm hits:ingest [--date=YYYY-MM-DD] [--model=NAME] [--threshold=11] [--no-engine-check]`
 * `pnpm hits:ingest --from-issue=N`
 * `pnpm hits:ingest --date=YYYY-MM-DD --model=NAME --only=id,… [--status=accepted|proposed]`
 *
 * The second form takes a submission from the GitHub issue form: it reads the
 * issue, checks the phrase with the engine, and records a candidate and a
 * proposed hit credited to the submitter. A person still promotes it.
 *
 * Turn the judge's answers into hits. Nothing is trusted: every verdict must
 * name a candidate from the batch, score inside the rubric, carry a
 * rationale, and describe a phrase that really is an anagram of its input at
 * its tier — re-checked here with the engine, because the judge never sees
 * letters and a copy-paste can garble a line.
 *
 * Rubric v2 answers are shelved (`shelf.ts`). Up to three rows per input are
 * written `accepted`, counting the hits that input already has on a shelf.
 * Further qualifying rows are `proposed` alternates. Near misses stay in the
 * queue's `judge-output.jsonl`. The operator's merge of the pull request is
 * the approval. Rubric v1 answers, from older queues, keep the v1 rule: a
 * total of 11 or more is `proposed`. The candidates that were judged move to
 * `enumerated` so the next run skips them.
 *
 * The third form is the operator's promotion of named rows from a judged
 * queue's verdicts, usually near misses: it writes exactly those rows, past
 * the shelves, and changes neither the candidates nor the ingest report.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { execFileSync } from 'node:child_process';

// The engine is imported only where it boots: loading it needs the WASM
// build, which the judge routine's sandbox does not have (--no-engine-check).
import { aboutProblem, candidateOf, syncAbout, tidySentence } from './about.ts';
import { checkAnagram, sameLetters } from './check.ts';
import { alphagram, candidateId, hitId } from './ids.ts';
import { parseIssueForm } from './submission.ts';
import { isV2Verdict, rubric, type Verdict, type VerdictV1, type VerdictV2 } from './judge.ts';
import type { Prefiltered } from './prefilter.ts';
import { INGEST_REPORT, JUDGE_OUTPUT, flag, has, pickQueue, queueDate, readJudgedRows } from './queue.ts';
import {
  CANDIDATES_PATH,
  HITS_PATH,
  TONES,
  appendJsonl,
  candidateSchema,
  dictionaryPin,
  hitSchema,
  isV2,
  readJsonl,
  today,
  writeJsonl,
  type Candidate,
  type Hit,
  type Judgement,
  type JudgementV1,
  type JudgementV2,
  type Tone,
} from './schema.ts';
import {
  fromVerdicts,
  mergeRequests,
  readRequests,
  renderRequests,
  writeRequests,
  type WordRequest,
} from './requests.ts';
import { screenedCandidateIds } from './screen.ts';
import { addRun, queueName, queueSettings, readAdditionWords } from './settings.ts';
import { assess, bestJudgement, scoresOf, shelve, type Scores } from './shelf.ts';

async function fromIssue(number: string): Promise<void> {
  const raw = execFileSync('gh', ['issue', 'view', number, '--json', 'body,author,url'], { encoding: 'utf8' });
  const issue = JSON.parse(raw) as { body: string; author: { login: string }; url: string };
  const parsed = parseIssueForm(issue.body);
  if ('error' in parsed) throw new Error(`issue #${number}: ${parsed.error}`);

  const { Engine } = await import('./engine.ts');
  const engine = await Engine.boot();
  const verdict = await checkAnagram(engine, parsed.input, parsed.words, parsed.tier);
  if (!verdict.ok) throw new Error(`issue #${number}: not an anagram: ${verdict.reason}`);

  const date = today();
  const cv = await candidateSchema();
  const hv = await hitSchema();
  const candidates = await readJsonl(CANDIDATES_PATH, cv);
  const hits = await readJsonl(HITS_PATH, hv);
  const id = hitId(parsed.input, parsed.category, parsed.words);
  const submitted = fromSubmission(parsed, {
    candidates,
    hits,
    date,
    url: issue.url,
    credit: parsed.credit || issue.author.login,
    dictionary: await dictionaryPin(),
  });
  if (submitted.newCandidate || submitted.aboutWritten) await writeJsonl(CANDIDATES_PATH, submitted.candidates, cv);
  if (submitted.newHit || submitted.synced) await writeJsonl(HITS_PATH, submitted.hits, hv);
  console.log(submitted.newHit ? `proposed ${id} from issue #${number}` : `${id} was already in data/hits.jsonl`);
  for (const note of submitted.notes) console.log(`  ${note}`);
}

/** Emoji have no place in a sentence a reader sees. */
const PICTOGRAPH = /\p{Extended_Pictographic}/u;

/**
 * A submission as the data files record it: a candidate (the input, with the
 * form's "What the input is" as its `about` when it has none), and a proposed
 * hit crediting the submitter, with "Why it is good" as its justification.
 * A sentence that breaks its rule is left off and named in `notes` with the
 * command that sets one. Pure: `fromIssue` reads the issue and writes the files.
 */
export function fromSubmission(
  parsed: { input: string; category: Candidate['category']; words: string[]; tier: Hit['tier']; why: string; about: string },
  context: {
    candidates: readonly Candidate[];
    hits: readonly Hit[];
    date: string;
    url: string;
    credit: string;
    dictionary: Hit['dictionary'];
  },
): { candidates: Candidate[]; hits: Hit[]; newCandidate: boolean; newHit: boolean; aboutWritten: boolean; synced: boolean; notes: string[] } {
  const notes: string[] = [];
  const cid = candidateId(parsed.input, parsed.category);
  const id = hitId(parsed.input, parsed.category, parsed.words);
  const existing = context.candidates.find((c) => c.id === cid);
  const candidate: Candidate = existing
    ? { ...existing }
    : { id: cid, input: parsed.input, category: parsed.category, source: 'submission', first_seen: context.date, status: 'enumerated', notes: context.url };

  const about = tidySentence(parsed.about);
  let aboutWritten = false;
  if (about) {
    const problem = aboutProblem(about);
    if (problem) notes.push(`"What the input is" left off (${problem}); set one with pnpm hits:describe ${cid} "One sentence."`);
    else if (candidate.about) notes.push(`"What the input is" left off: ${cid} already reads "${candidate.about}"`);
    else {
      candidate.about = about;
      aboutWritten = Boolean(existing);
    }
  }

  const why = tidySentence(parsed.why);
  let justification: string | undefined;
  if (why) {
    if ([...why].length > 300) notes.push(`"Why it is good" left off (over 300 characters); set a justification with pnpm hits:justify ${id} "One plain sentence."`);
    else if (PICTOGRAPH.test(why)) notes.push(`"Why it is good" left off (it has emoji); set a justification with pnpm hits:justify ${id} "One plain sentence."`);
    else justification = why;
  }

  const candidates = existing ? context.candidates.map((c) => (c.id === cid ? candidate : c)) : [...context.candidates, candidate];
  const known = context.hits.some((h) => h.id === id);
  const hit: Hit = {
    id,
    input: parsed.input,
    category: parsed.category,
    words: parsed.words,
    display: parsed.words.join(' '),
    letters: alphagram(parsed.input),
    prefilter_score: 0,
    judge: [],
    submitter: context.credit,
    added: context.date,
    dictionary: context.dictionary,
    tier: parsed.tier,
    tags: ['submitted'],
    status: 'proposed',
    ...(justification ? { justification } : {}),
  };
  const { hits, changed } = syncAbout(known ? context.hits : [...context.hits, hit], candidates, [cid]);
  return {
    candidates,
    hits,
    newCandidate: !existing,
    newHit: !known,
    aboutWritten,
    synced: changed.length > 0,
    notes,
  };
}

export const DEFAULT_THRESHOLD = 11;

/** A subject label: lowercase words joined with hyphens. */
const SUBJECT = /^[a-z][a-z0-9-]*$/;
const JUSTIFICATION_MAX = 300;

export type Rejection = { id: string; reason: string };

const between = (n: unknown, lo: number, hi: number) => Number.isInteger(n) && (n as number) >= lo && (n as number) <= hi;
const hasText = (s: unknown): s is string => typeof s === 'string' && s.trim().length > 0;

function problemV1(v: VerdictV1): string | null {
  if (!between(v.aptness, 1, 5) || !between(v.grammar, 1, 5) || !between(v.memorability, 1, 5)) return 'score outside 1-5';
  if (!hasText(v.rationale)) return 'no rationale';
  return null;
}

function problemV2(v: VerdictV2): string | null {
  if (!between(v.relation, 1, 5)) return 'relation outside 1-5';
  if (!between(v.reads, 1, 3)) return 'reads outside 1-3';
  if (!hasText(v.rationale)) return 'no rationale';
  const tones = TONES as readonly string[];
  if (v.tone !== undefined && (!Array.isArray(v.tone) || v.tone.some((t) => !tones.includes(t)))) return 'unknown tone';
  if (v.subjects !== undefined && (!Array.isArray(v.subjects) || v.subjects.some((s) => typeof s !== 'string' || !SUBJECT.test(s)))) {
    return 'bad subject';
  }
  if (v.relation >= 3 && !hasText(v.justification)) return 'no justification';
  if (hasText(v.justification) && v.justification.trim().length > JUSTIFICATION_MAX) {
    return `justification over ${JUSTIFICATION_MAX} characters`;
  }
  return null;
}

/**
 * Validate verdicts against the batch they answer. Pure: the anagram check
 * happens separately because it needs the engine.
 */
export function validateVerdicts(
  verdicts: readonly Verdict[],
  batch: ReadonlyMap<string, Prefiltered>,
): { ok: Verdict[]; rejected: Rejection[] } {
  const ok: Verdict[] = [];
  const rejected: Rejection[] = [];
  const seen = new Set<string>();
  for (const v of verdicts) {
    if (typeof v.id !== 'string' || !batch.has(v.id)) {
      rejected.push({ id: String(v.id), reason: 'not in this batch' });
      continue;
    }
    const problem = isV2Verdict(v) ? problemV2(v) : problemV1(v);
    if (problem) {
      rejected.push({ id: v.id, reason: problem });
      continue;
    }
    // Only a verdict that passed counts as seen, so a garbled line followed
    // by a good one does not cost the good one its place.
    const key = `${v.id}|${v.model ?? ''}`;
    if (seen.has(key)) {
      rejected.push({ id: v.id, reason: 'duplicate verdict' });
      continue;
    }
    seen.add(key);
    ok.push(v);
  }
  return { ok, rejected };
}

const DAY = /^\d{4}-\d{2}-\d{2}/;

/**
 * The day a verdict was judged: the date its line carries, or else the date of
 * the queue it answers. Never the day ingest runs, which differs on any replay:
 * #47 replayed a queue judged on 2026-09-15 after midnight UTC and stamped its
 * nine hits 2026-09-16.
 */
export function judgedAt(v: Pick<Verdict, 'judged_at'>, queueDay: string): string {
  return typeof v.judged_at === 'string' && DAY.test(v.judged_at) ? v.judged_at.slice(0, 10) : queueDay;
}

export function toJudgement(v: Verdict, model: string, version: string, queueDay: string): Judgement {
  const date = judgedAt(v, queueDay);
  if (isV2Verdict(v)) {
    const judgement: JudgementV2 = {
      model: v.model ?? model,
      rubric_version: v.rubric_version ?? version,
      relation: v.relation,
      reads: v.reads,
      tone: [...new Set(v.tone ?? [])] as Tone[],
      subjects: [...new Set(v.subjects ?? [])],
      rationale: v.rationale.trim(),
      judged_at: date,
    };
    if (hasText(v.justification)) judgement.justification = v.justification.trim();
    return judgement;
  }
  return {
    model: v.model ?? model,
    // A v1-shaped line is a v1 score, whatever the rubric file says today.
    rubric_version: v.rubric_version ?? 'v1',
    aptness: v.aptness,
    grammar: v.grammar,
    memorability: v.memorability,
    total: v.aptness + v.grammar + v.memorability,
    rationale: v.rationale.trim(),
    judged_at: date,
  };
}

export type IngestOptions = {
  model: string;
  version: string;
  /** The day ingest runs: a new hit's `added`. */
  date: string;
  /** The queue's date: a judgement's `judged_at` when its verdict carries none. */
  queueDay: string;
  threshold: number;
  dictionary: { repo: string; rev: string };
  /** Hits each candidate already has on a shelf (accepted or featured), by candidate id. */
  taken?: ReadonlyMap<string, number>;
  /**
   * Ids already in data/hits.jsonl. Those rows keep the status the file gives
   * them: they are not placed again, and they do not use a second slot.
   */
  existing?: ReadonlySet<string>;
  /** Each candidate's subject slugs (from Wikidata or by hand), added to its hits as subject: tags. */
  subjects?: ReadonlyMap<string, readonly string[]>;
  /** Each candidate's sentence and link, copied onto its new hits. */
  about?: ReadonlyMap<string, { about?: string; wikipedia?: string }>;
};

/** Where a written hit came from: a v2 shelf, an alternate, or the v1 threshold. */
export type Placement = 'interesting' | 'stretch' | 'alternate' | 'v1';
export type Placed = { hit: Hit; placement: Placement };
export type NearMiss = { id: string; input: string; display: string; relation: number; reads: number; rationale: string };

/** A hit from a prefiltered row and its judges. */
export function hitFromRow(
  row: Prefiltered,
  judge: Judgement[],
  options: Pick<IngestOptions, 'date' | 'dictionary' | 'about'>,
  status: Hit['status'],
  tags: string[],
  justification?: string,
): Hit {
  const hit: Hit = {
    id: row.id,
    input: row.input,
    category: row.category,
    words: row.words,
    display: row.display,
    letters: row.letters,
    prefilter_score: row.prefilter_score,
    judge,
    added: options.date,
    dictionary: options.dictionary,
    tier: row.tier,
    tags,
    status,
  };
  if (justification) hit.justification = justification;
  const known = options.about?.get(row.candidate_id);
  if (known?.about) hit.about = known.about;
  if (known?.wikipedia) hit.wikipedia = known.wikipedia;
  return hit;
}

function tagsFor(best: JudgementV2, alternate: boolean, candidateSubjects: readonly string[] = []): string[] {
  return [
    ...(best.relation === 5 ? ['greatest-candidate'] : []),
    ...(alternate ? ['alternate'] : []),
    ...best.tone.map((t) => `tone:${t}`),
    ...[...new Set([...best.subjects, ...candidateSubjects])].map((s) => `subject:${s}`),
  ];
}

/** Shelved hits sort before alternates, and within a group by score, then id. */
function weight(placed: Placed): number {
  const best = bestJudgement(placed.hit.judge);
  if (!best) return 0;
  return isV2(best) ? best.relation * 10 + best.reads : best.total;
}

/**
 * Decide what each verdict becomes: shelved hits, alternates and near misses
 * under rubric v2; proposed hits at or above the threshold under rubric v1.
 * Every judge column on a row is kept; the best one decides.
 */
export function assessBatch(
  batch: ReadonlyMap<string, Prefiltered>,
  verdicts: readonly Verdict[],
  options: IngestOptions,
): { hits: Placed[]; near: NearMiss[] } {
  const byId = new Map<string, Judgement[]>();
  for (const v of verdicts) {
    const list = byId.get(v.id) ?? [];
    list.push(toJudgement(v, options.model, options.version, options.queueDay));
    byId.set(v.id, list);
  }

  type Entry = { row: Prefiltered; judge: Judgement[]; best: JudgementV2; scores: Scores };
  const placed: Placed[] = [];
  const near: NearMiss[] = [];
  const byCandidate = new Map<string, Entry[]>();
  for (const [id, judge] of byId) {
    if (options.existing?.has(id)) continue;
    const row = batch.get(id)!;
    const v2 = judge.filter(isV2);
    if (v2.length === 0) {
      // Rubric v1: the primary judge decides; a second column is recorded, not averaged.
      const best = Math.max(...judge.map((j) => (j as JudgementV1).total));
      if (best >= options.threshold) placed.push({ hit: hitFromRow(row, judge, options, 'proposed', []), placement: 'v1' });
      continue;
    }
    const best = bestJudgement(v2) as JudgementV2;
    const list = byCandidate.get(row.candidate_id) ?? [];
    list.push({ row, judge, best, scores: scoresOf(best) });
    byCandidate.set(row.candidate_id, list);
  }

  for (const [candidate, entries] of byCandidate) {
    const shelved = shelve(entries, (e) => e.scores, (e) => e.row.id, options.taken?.get(candidate) ?? 0);
    const subjects = options.subjects?.get(candidate);
    for (const e of shelved.accepted) {
      const placement = assess(e.scores) as 'interesting' | 'stretch';
      placed.push({ hit: hitFromRow(e.row, e.judge, options, 'accepted', tagsFor(e.best, false, subjects), e.best.justification), placement });
    }
    for (const e of shelved.alternates) {
      placed.push({ hit: hitFromRow(e.row, e.judge, options, 'proposed', tagsFor(e.best, true, subjects), e.best.justification), placement: 'alternate' });
    }
    for (const e of shelved.near) {
      near.push({ id: e.row.id, input: e.row.input, display: e.row.display, ...e.scores, rationale: e.best.rationale });
    }
  }

  const rank: Record<Placement, number> = { interesting: 0, stretch: 1, alternate: 2, v1: 3 };
  placed.sort((a, b) => rank[a.placement] - rank[b.placement] || weight(b) - weight(a) || a.hit.id.localeCompare(b.hit.id));
  near.sort((a, b) => b.relation - a.relation || b.reads - a.reads || a.id.localeCompare(b.id));
  return { hits: placed, near };
}

/** The hits `assessBatch` would write, in order. */
export function buildHits(
  batch: ReadonlyMap<string, Prefiltered>,
  verdicts: readonly Verdict[],
  options: IngestOptions,
): Hit[] {
  return assessBatch(batch, verdicts, options).hits.map((p) => p.hit);
}

/**
 * `--only`: the named rows as hits, whatever shelf their scores would give
 * them. Refuses, naming each, a row not in the queue, one already in the file,
 * one without a valid verdict, and one to be accepted without a
 * justification to publish with.
 */
export function promoteOnly(
  batch: ReadonlyMap<string, Prefiltered>,
  verdicts: readonly Verdict[],
  only: readonly string[],
  status: 'accepted' | 'proposed',
  options: IngestOptions,
): { hits: Hit[]; refused: Rejection[] } {
  const hits: Hit[] = [];
  const refused: Rejection[] = [];
  for (const id of only) {
    const row = batch.get(id);
    if (!row) {
      refused.push({ id, reason: 'not in this queue' });
      continue;
    }
    if (options.existing?.has(id)) {
      refused.push({ id, reason: 'already in data/hits.jsonl; change it with pnpm hits:set' });
      continue;
    }
    const judge = verdicts.filter((v) => v.id === id).map((v) => toJudgement(v, options.model, options.version, options.queueDay));
    const best = bestJudgement(judge);
    if (!best) {
      refused.push({ id, reason: 'no valid verdict in this queue' });
      continue;
    }
    const v2 = isV2(best) ? best : null;
    const justification = v2?.justification;
    if (status === 'accepted' && !justification) {
      refused.push({ id, reason: 'no justification to publish with; add it as proposed, then pnpm hits:justify and pnpm hits:set' });
      continue;
    }
    const tags = v2 ? tagsFor(v2, false, options.subjects?.get(row.candidate_id)) : [];
    hits.push(hitFromRow(row, judge, options, status, tags, justification));
  }
  return { hits, refused };
}

/** How many hits each candidate already has on a shelf. */
export function takenCounts(hits: readonly Hit[]): Map<string, number> {
  const taken = new Map<string, number>();
  for (const hit of hits) {
    if (hit.status !== 'accepted' && hit.status !== 'featured') continue;
    const candidate = candidateOf(hit.id);
    taken.set(candidate, (taken.get(candidate) ?? 0) + 1);
  }
  return taken;
}

/** A sentence about an input, as the report lists it. */
export type AboutLine = { candidate: string; input: string; text: string; from: string };

/**
 * The judge's sentences about the inputs of a batch: the first that follows
 * the rule for each input that has none, from the verdicts that passed. A
 * sentence that breaks the rule is skipped, and its verdict still counts.
 * Pure.
 */
export function aboutsFromVerdicts(
  verdicts: readonly Verdict[],
  batch: ReadonlyMap<string, Prefiltered>,
  candidates: readonly Candidate[],
  model: string,
): { written: AboutLine[]; skipped: Rejection[] } {
  const has = new Set(candidates.filter((c) => c.about).map((c) => c.id));
  const written: AboutLine[] = [];
  const skipped: Rejection[] = [];
  for (const v of verdicts) {
    if (!isV2Verdict(v) || v.about === undefined || v.about === null) continue;
    const row = batch.get(v.id);
    if (!row) continue;
    const text = typeof v.about === 'string' ? tidySentence(v.about) : '';
    const problem = typeof v.about === 'string' ? aboutProblem(text) : 'not a sentence';
    if (problem) {
      skipped.push({ id: v.id, reason: `about: ${problem}` });
      continue;
    }
    if (has.has(row.candidate_id)) continue;
    has.add(row.candidate_id);
    written.push({ candidate: row.candidate_id, input: row.input, text, from: `the judge, ${v.model ?? model}` });
  }
  return { written, skipped };
}

const NEAR_SHOWN = 30;
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const cell = (text: string) => text.replace(/\|/g, '/').replace(/\s*\n\s*/g, ' ');

/** The report ingest writes next to the queue; the routine's pull request body. Pure. */
export function renderReport(r: {
  date: string;
  dir: string;
  empty: boolean;
  read: number;
  valid: number;
  rejected: readonly Rejection[];
  rubric: 'v1' | 'v2';
  placed: readonly Placed[];
  addedIds: ReadonlySet<string>;
  near: readonly NearMiss[];
  moved: number;
  threshold: number;
  /** Defaults to `Ingest <date>`. */
  heading?: string;
  /** Defaults to the count of candidates moved to enumerated. */
  ledger?: string;
  /** Words this queue proposed for the vocabulary. */
  requests?: readonly WordRequest[];
  /** Every request on file, so the report can name the ones still waiting. */
  openRequests?: readonly WordRequest[];
  /** Sentences about inputs that reached a hit in this run. */
  about?: readonly AboutLine[];
  /** Sentences the judge wrote that break the rule, left off. */
  aboutSkipped?: readonly Rejection[];
}): string {
  const head = [
    `# ${r.heading ?? `Ingest ${r.date}`}`,
    '',
    `Queue: ${r.dir}`,
    ...(r.empty ? ['Nothing to judge: the queue was empty.'] : []),
    `Verdicts: ${r.read} read · ${r.valid} valid · ${r.rejected.length} rejected`,
  ];
  const ledger = r.ledger ?? `Candidates moved to enumerated: ${r.moved}`;
  const rejected = r.rejected.length ? ['## Rejected', '', ...r.rejected.map((x) => `- ${x.id}: ${x.reason}`), ''] : [];
  const added = r.placed.filter((p) => r.addedIds.has(p.hit.id));

  if (r.rubric === 'v1') {
    return [
      ...head,
      `Hits: ${r.placed.length} at or above ${r.threshold} of 15 · ${added.length} new in data/hits.jsonl`,
      ledger,
      '',
      '| total | input | anagram | rationale |',
      '|---|---|---|---|',
      ...added.map((p) => {
        const j = p.hit.judge[0] as JudgementV1;
        return `| ${j.total} | ${p.hit.input} | ${p.hit.display} | ${cell(j.rationale)} |`;
      }),
      '',
      ...rejected,
    ].join('\n');
  }

  const of = (placement: Placement) => added.filter((p) => p.placement === placement);
  const accepted = added.filter((p) => p.placement === 'interesting' || p.placement === 'stretch').length;
  const table = (rows: readonly Placed[], byId: boolean) => [
    `| relation | reads | ${byId ? 'id' : 'input'} | anagram | justification |`,
    '|---|---|---|---|---|',
    ...rows.map((p) => {
      const s = scoresOf(bestJudgement(p.hit.judge)!);
      const relation = s.relation === 5 ? '5, flagged for Greatest Hits' : String(s.relation);
      const who = byId ? p.hit.id : cell(p.hit.input);
      return `| ${relation} | ${s.reads} | ${who} | ${cell(p.hit.display)} | ${cell(p.hit.justification ?? '')} |`;
    }),
  ];
  const section = (title: string, intro: string | null, rows: readonly Placed[], byId = false) =>
    rows.length ? [`## ${title}`, '', ...(intro ? [intro, ''] : []), ...table(rows, byId), ''] : [];
  const shown = r.near.slice(0, NEAR_SHOWN);
  const nearIntro =
    r.near.length > NEAR_SHOWN
      ? `Not added; kept in \`judge-output.jsonl\`. The first ${NEAR_SHOWN} of ${r.near.length}, by relation and reads:`
      : 'Not added; kept in `judge-output.jsonl`.';

  return [
    ...head,
    `Hits: ${added.length} new in data/hits.jsonl (${accepted} accepted, ${plural(of('alternate').length, 'alternate', 'alternates')} proposed) · ${plural(r.near.length, 'near miss', 'near misses')} kept in judge-output.jsonl`,
    ledger,
    '',
    'Merging this pull request accepts every hit under Interesting and A stretch. Greatest Hits changes only when the operator promotes a hit by name.',
    '',
    ...section('Interesting', null, of('interesting')),
    ...section('A stretch', null, of('stretch')),
    ...section(
      'Alternates',
      'These qualify, but their input already has three hits on a shelf. They are proposed; accept one with `pnpm hits:set --status=accepted <id>`.',
      of('alternate'),
      true,
    ),
    ...(r.near.length
      ? [
          '## Near misses',
          '',
          nearIntro,
          '',
          '| relation | reads | input | anagram | rationale |',
          '|---|---|---|---|---|',
          ...shown.map((n) => `| ${n.relation} | ${n.reads} | ${cell(n.input)} | ${cell(n.display)} | ${cell(n.rationale)} |`),
          '',
        ]
      : []),
    ...renderAbout(r.about ?? [], r.aboutSkipped ?? []),
    ...renderRequests(r.requests ?? [], r.openRequests ?? []),
    ...rejected,
  ].join('\n');
}

/** The report's About section: what each input is, as its hits now say it. */
export function renderAbout(lines: readonly AboutLine[], skipped: readonly Rejection[]): string[] {
  if (lines.length === 0 && skipped.length === 0) return [];
  return [
    '## About',
    '',
    ...(lines.length
      ? [
          'What each input is, as its hits now carry it. Merging accepts these sentences; change one with `pnpm hits:describe <candidate> "One sentence."`.',
          '',
          '| candidate | input | sentence | from |',
          '|---|---|---|---|',
          ...lines.map((l) => `| ${l.candidate} | ${cell(l.input)} | ${cell(l.text)} | ${cell(l.from)} |`),
          '',
        ]
      : []),
    ...(skipped.length ? ['Left off, breaking the rule:', '', ...skipped.map((x) => `- ${x.id}: ${x.reason}`), ''] : []),
  ];
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const issue = flag(argv, 'from-issue');
  if (issue) return fromIssue(issue);
  const dir = await pickQueue(argv);
  const model = flag(argv, 'model') ?? 'claude-code-session';
  const threshold = Number(flag(argv, 'threshold') ?? DEFAULT_THRESHOLD);
  const date = today();
  const only = flag(argv, 'only');
  const onlyStatus = flag(argv, 'status');
  if (onlyStatus !== undefined && only === undefined) throw new Error('--status goes with --only');
  if (onlyStatus !== undefined && onlyStatus !== 'accepted' && onlyStatus !== 'proposed') {
    throw new Error(`--status must be accepted or proposed, not ${onlyStatus}`);
  }
  const onlyIds = only === undefined ? null : [...new Set(only.split(',').map((s) => s.trim()).filter((s) => s.length > 0))];
  if (onlyIds && onlyIds.length === 0) throw new Error('--only needs at least one hit id');

  // The rows the judge saw: screened.jsonl for a screened queue, else prefiltered.jsonl.
  const batch = new Map<string, Prefiltered>((await readJudgedRows(dir)).map((row) => [row.id, row]));
  // An empty queue may have no answer file at all; that is the same as an
  // empty one. A missing answer to a real queue is still an error.
  let raw = '';
  try {
    raw = await readFile(resolve(dir, JUDGE_OUTPUT), 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT' || batch.size > 0) throw error;
  }
  const { parseVerdicts } = await import('./judge.ts');
  const verdicts = parseVerdicts(raw);
  const { version } = await rubric();

  const { ok, rejected } = validateVerdicts(verdicts, batch);

  // Re-check every phrase before anything is written. The rows came from
  // the engine, so this guards against a garbled file, not a wrong search;
  // with --no-engine-check (a sandbox without the WASM build) the letters
  // are still compared and only the dictionary lookup is skipped.
  const engine = has(argv, 'no-engine-check') ? null : await (await import('./engine.ts')).Engine.boot();
  const verified: Verdict[] = [];
  for (const v of ok) {
    const row = batch.get(v.id)!;
    const verdict = engine
      ? await checkAnagram(engine, row.input, row.words, row.tier)
      : sameLetters(row.input, row.words)
        ? { ok: true as const }
        : { ok: false as const, reason: 'the letters differ' };
    if (verdict.ok) verified.push(v);
    else rejected.push({ id: v.id, reason: `not an anagram: ${verdict.reason}` });
  }

  const cv = await candidateSchema();
  const candidates = await readJsonl(CANDIDATES_PATH, cv);
  const hitValidator = await hitSchema();
  const known = await readJsonl(HITS_PATH, hitValidator);

  // The judge's sentences about inputs that have none go on the candidates
  // before any hit is built, so the new hits carry them, and each is checked
  // against the schema before either file is written.
  const abouts = onlyIds ? { written: [], skipped: [] } : aboutsFromVerdicts(verified, batch, candidates, model);
  const byCandidate = new Map(candidates.map((c) => [c.id, c]));
  abouts.written = abouts.written.filter((line) => byCandidate.has(line.candidate));
  for (const line of abouts.written) {
    const c = byCandidate.get(line.candidate)!;
    c.about = line.text;
    if (!cv(c)) throw new Error(`refusing the judge's sentence about ${line.candidate}: ${line.text}`);
  }

  const options: IngestOptions = {
    model,
    version,
    date,
    queueDay: queueDate(dir),
    threshold,
    dictionary: await dictionaryPin(),
    taken: takenCounts(known),
    existing: new Set(known.map((h) => h.id)),
    subjects: new Map(candidates.flatMap((c) => (c.subjects?.length ? [[c.id, c.subjects] as const] : []))),
    about: new Map(
      candidates.flatMap((c) =>
        c.about || c.wikipedia ? [[c.id, { ...(c.about ? { about: c.about } : {}), ...(c.wikipedia ? { wikipedia: c.wikipedia } : {}) }] as const] : [],
      ),
    ),
  };

  if (onlyIds) {
    const status = onlyStatus === 'proposed' ? 'proposed' : 'accepted';
    const { hits, refused } = promoteOnly(batch, verified, onlyIds, status, options);
    if (refused.length > 0) {
      for (const r of refused) console.error(`${r.id}: ${r.reason}`);
      console.error('nothing written');
      process.exitCode = 1;
      return;
    }
    const written = await appendJsonl(HITS_PATH, hits, hitValidator);
    for (const h of written) console.log(`${h.id}  ${h.status}`);
    console.log(`${written.length} added to data/hits.jsonl from ${queueName(dir)}; the candidates and the ingest report are unchanged`);
    return;
  }

  const assessed = assessBatch(batch, verified, options);
  // Every input the queue covered is done for now: the ones with rows the
  // judge saw and, for a screened queue, the ones the screen kept nothing of.
  const judgedCandidates = new Set([...[...batch.values()].map((r) => r.candidate_id), ...(await screenedCandidateIds(dir))]);
  // The hits these inputs already had take the sentence too. Only when one
  // changes is the file rewritten; otherwise the new hits are appended.
  const synced = syncAbout(known, candidates, judgedCandidates);
  const fresh = assessed.hits.map((p) => p.hit);
  let added: Hit[];
  if (synced.changed.length > 0) {
    await writeJsonl(HITS_PATH, [...synced.hits, ...fresh], hitValidator);
    added = fresh;
  } else {
    added = await appendJsonl(HITS_PATH, fresh, hitValidator);
  }
  const reached = new Map(abouts.written.map((line) => [line.candidate, line]));
  for (const id of [...added.filter((h) => h.about).map((h) => candidateOf(h.id)), ...synced.changed.map(candidateOf)]) {
    const c = byCandidate.get(id);
    if (!reached.has(id) && c?.about) reached.set(id, { candidate: id, input: c.input, text: c.about, from: 'already on the input' });
  }

  // Candidates that were judged are done for now, and the ledger records
  // the queue and the versions they went through.
  const rubricKind = verified.length > 0 ? (verified.some(isV2Verdict) ? 'v2' : 'v1') : version === 'v1' ? 'v1' : 'v2';
  const run = { queue: queueName(dir), settings: await queueSettings(dir), rubric: rubricKind, date };
  let moved = 0;
  for (const c of candidates) {
    if (!judgedCandidates.has(c.id)) continue;
    addRun(c, run);
    if (c.status === 'new') {
      c.status = 'enumerated';
      moved++;
    }
  }
  await writeJsonl(CANDIDATES_PATH, candidates, cv);

  // Word requests. Nothing here changes the vocabulary: the list is a
  // proposal the operator accepts by name. A word the dictionary already
  // carries at Extended is refused, since the remedy there is a wider tier,
  // not a new word.
  const proposed = fromVerdicts(verdicts, queueName(dir), date);
  const onFile = await readRequests();
  const vocabulary = new Set(await readAdditionWords());
  if (engine) {
    for (const r of proposed.requests) {
      if (await engine.has(r.word, 'extended')) vocabulary.add(r.word);
    }
  }
  const merged = mergeRequests(onFile, proposed.requests, vocabulary);
  if (merged.added.length > 0) await writeRequests(merged.next);
  for (const s of proposed.skipped) console.error(`request skipped: ${s.id}: ${s.reason}`);
  for (const r of merged.refused) console.error(`request refused: ${r.word}: ${r.reason}`);

  const report = renderReport({
    date,
    dir,
    empty: batch.size === 0,
    read: verdicts.length,
    valid: verified.length,
    rejected,
    rubric: rubricKind,
    placed: assessed.hits,
    addedIds: new Set(added.map((h) => h.id)),
    near: assessed.near,
    moved,
    threshold,
    requests: merged.added,
    openRequests: merged.next,
    about: [...reached.values()],
    aboutSkipped: abouts.skipped,
  });
  await writeFile(resolve(dir, INGEST_REPORT), report);
  console.log(report);
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  await main();
}
