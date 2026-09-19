/**
 * `pnpm hits:monthly [--month=YYYY-MM]`
 * `pnpm hits:monthly --ingest --judged-by=routine|hand [--model=<id>]`
 *
 * The monthly vote review (voting plan R9, roadmap F3). Votes never move an
 * anagram by themselves; once a month they nominate:
 *
 * - The top tenth of A stretch by votes, each with at least five, is read
 *   again by a model, which may move one to Interesting with the tag
 *   `shelf:interesting`. Every row gets a decision and a sentence, and the
 *   rows that stay are kept in the record, never discarded.
 * - The top tenth of Interesting by votes, each with at least five, is listed
 *   as Greatest Hits suggestions for the operator. Nothing here makes a hit
 *   featured: that is the operator's named decision alone.
 *
 * Votes are read from the newest daily counts in data/counts/, which the
 * Export promotions Action commits, so the review needs no network.
 *
 * Whose turn it is: the review writes data/votes/monthly/<YYYY-MM>.md and
 * .jsonl, which the routine's pull request carries. A run is the month's turn
 * when neither main nor any open `hits/*` branch holds that month's record,
 * so the first run of a UTC month does it, later runs that month find it,
 * and a pull request closed unmerged leaves the turn for the next run. It
 * needs no schedule of its own.
 *
 * The first form picks the rows and writes them for the model to answer into
 * the gitignored .cache/monthly/. The second checks the answers, makes the one
 * move, and writes the month's record.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { REPEAT_CAP, repeatMessage, repeatedJustifications } from './guards.ts';
import { judgedByFlag } from './ingest.ts';
import { newestVotes, validators, writeLines } from './promotions/files.ts';
import { flag } from './queue.ts';
import { DATA_DIR, HITS_PATH, REPO_ROOT, hitSchema, readJsonl, today, writeJsonl, type Hit, type JudgedBy } from './schema.ts';
import { SHELF_TAG, bestJudgement, judgedShelf, scoresOf, shelfOf } from './shelf.ts';

export const MONTHLY_DIR = resolve(DATA_DIR, 'votes/monthly');
export const MONTHLY_LOCAL = resolve(REPO_ROOT, '.cache/monthly');
export const MONTHLY_PROMPT = resolve(REPO_ROOT, 'tools/hits/prompts/monthly.md');

/** The share of a section, most voted first, that the review reads. A number the operator may tune. */
export const MONTHLY_SHARE = 0.1;
/** The fewest votes a hit needs to be read or suggested. A number the operator may tune. */
export const MONTHLY_MIN_VOTES = 5;
/** The most A stretch hits one month's review may move to Interesting. */
export const MONTHLY_MOVES = 1;
/** The longest sentence a decision may carry, as for a justification. */
export const REASON_MAX = 300;

export const monthOf = (date: string): string => date.slice(0, 7);

export type MonthlyRow = {
  id: string;
  input: string;
  category: string;
  display: string;
  votes: number;
  /** Its place in its section by votes, as the site orders a section. */
  rank: number;
  relation: number | null;
  reads: number | null;
  justification: string;
  about: string;
  senses: Record<string, string>;
  /** Whether the operator placed it in A stretch by hand (the tag shelf:stretch). */
  placed: boolean;
};

/** One section's share: how many hits it has, how many the top tenth is, and the rows in it with enough votes. */
export type MonthlySection = { total: number; top: number; rows: MonthlyRow[] };
export type MonthlySelection = { month: string; counts: string | null; stretch: MonthlySection; interesting: MonthlySection };
export type MonthlyAnswer = { id: string; decision: 'move' | 'stay'; reason: string };

export type MonthlyLine = {
  month: string;
  decided: string;
  counts: string;
  kind: 'reread' | 'suggestion';
  hit_id: string;
  votes: number;
  rank: number;
  decision?: 'move' | 'stay';
  reason?: string;
  model?: string;
  judged_by?: JudgedBy;
  monthly_version?: string;
};

const byName = (a: Hit, b: Hit): number =>
  a.input.localeCompare(b.input, 'en', { sensitivity: 'base' }) || a.display.localeCompare(b.display, 'en') || a.id.localeCompare(b.id);

/** A section's published hits, most votes first, a tie going A to Z by input and then by anagram, as the site orders it. */
export function ranked(hits: readonly Hit[], shelf: 'stretch' | 'interesting', votes: ReadonlyMap<string, number>): Hit[] {
  const count = (h: Hit) => votes.get(h.id) ?? 0;
  return hits.filter((h) => h.status === 'accepted' && shelfOf(h) === shelf).sort((a, b) => count(b) - count(a) || byName(a, b));
}

function section(hits: readonly Hit[], shelf: 'stretch' | 'interesting', votes: ReadonlyMap<string, number>): MonthlySection {
  const all = ranked(hits, shelf, votes);
  const top = Math.ceil(all.length * MONTHLY_SHARE);
  const rows = all.slice(0, top).flatMap((h, i): MonthlyRow[] => {
    const n = votes.get(h.id) ?? 0;
    if (n < MONTHLY_MIN_VOTES) return [];
    const best = bestJudgement(h.judge);
    const scores = best ? scoresOf(best) : null;
    return [
      {
        id: h.id,
        input: h.input,
        category: h.category,
        display: h.display,
        votes: n,
        rank: i + 1,
        relation: scores?.relation ?? null,
        reads: scores?.reads ?? null,
        justification: h.justification ?? '',
        about: h.about ?? '',
        senses: { ...h.senses },
        placed: h.tags.includes(SHELF_TAG.stretch),
      },
    ];
  });
  return { total: all.length, top, rows };
}

/** What a month's review reads and suggests, from the hits and the newest daily vote counts. */
export function selectMonthly(hits: readonly Hit[], votes: ReadonlyMap<string, number>, month: string, counts: string | null): MonthlySelection {
  return { month, counts, stretch: section(hits, 'stretch', votes), interesting: section(hits, 'interesting', votes) };
}

export async function monthlyPrompt(): Promise<{ text: string; version: string }> {
  const text = await readFile(MONTHLY_PROMPT, 'utf8');
  const version = /monthly_version:\s*(v\d+)/.exec(text)?.[1];
  if (!version) throw new Error(`${MONTHLY_PROMPT} has no monthly_version line`);
  return { text, version };
}

/** The file the model answers: its instructions, then each A stretch row to read again. */
export function renderMonthlyInput(selection: MonthlySelection, prompt: string): string {
  const rows = selection.stretch.rows.map((r) => {
    const lines = [
      `- id: ${r.id}`,
      `  input: ${r.input} (${r.category})`,
      `  anagram: ${r.display}`,
      `  votes: ${r.votes}, the ${ordinal(r.rank)} most voted in A stretch`,
      `  judged: ${r.relation === null ? 'not judged' : `relation ${r.relation}, reads ${r.reads}`}${r.placed ? '; placed in A stretch by the operator' : ''}`,
      `  justification: ${r.justification || '(none)'}`,
      `  about: ${r.about || '(none)'}`,
    ];
    for (const [word, sense] of Object.entries(r.senses)) lines.push(`  sense of ${word}: ${sense}`);
    return lines.join('\n');
  });
  return `${prompt.trimEnd()}\n\n## ${selection.month}: ${rows.length} ${rows.length === 1 ? 'row' : 'rows'}\n\n${rows.join('\n')}\n`;
}

function ordinal(n: number): string {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${suffix}`;
}

/** The answers, parsed; a line that is not JSON is a problem, named by its number. */
export function parseAnswers(text: string): { answers: unknown[]; problems: string[] } {
  const answers: unknown[] = [];
  const problems: string[] = [];
  for (const [i, line] of text.split('\n').entries()) {
    if (!line.trim()) continue;
    try {
      answers.push(JSON.parse(line));
    } catch {
      problems.push(`line ${i + 1} is not JSON`);
    }
  }
  return { answers, problems };
}

/**
 * Why the answers cannot be taken, or none. Every row is answered once, with
 * `move` or `stay` and one sentence of its own; at most MONTHLY_MOVES move;
 * no sentence, its quoted words masked, answers more than REPEAT_CAP rows.
 */
export function answerProblems(answers: readonly unknown[], rows: readonly MonthlyRow[]): string[] {
  const problems: string[] = [];
  const wanted = new Set(rows.map((r) => r.id));
  const seen = new Set<string>();
  for (const [i, raw] of answers.entries()) {
    const a = raw as Partial<MonthlyAnswer> | null;
    const at = `answer ${i + 1}`;
    if (!a || typeof a !== 'object' || typeof a.id !== 'string') {
      problems.push(`${at} has no id`);
      continue;
    }
    if (!wanted.has(a.id)) problems.push(`${at}: ${a.id} is not a row of this review`);
    else if (seen.has(a.id)) problems.push(`${at}: ${a.id} is answered twice`);
    seen.add(a.id);
    if (a.decision !== 'move' && a.decision !== 'stay') problems.push(`${at}: decision must be move or stay`);
    const reason = typeof a.reason === 'string' ? a.reason.trim() : '';
    if (!reason) problems.push(`${at}: give one sentence for ${a.id}`);
    else if ([...reason].length > REASON_MAX) problems.push(`${at}: the sentence for ${a.id} is over ${REASON_MAX} characters`);
    else if (/\n/.test(reason)) problems.push(`${at}: the sentence for ${a.id} is on more than one line`);
    const extra = Object.keys(a).filter((k) => !['id', 'decision', 'reason'].includes(k));
    if (extra.length > 0) problems.push(`${at}: unknown ${extra.join(', ')}`);
  }
  for (const id of wanted) if (!seen.has(id)) problems.push(`${id} has no answer`);
  const moves = answers.filter((a) => (a as Partial<MonthlyAnswer> | null)?.decision === 'move').length;
  if (moves > MONTHLY_MOVES) problems.push(`${moves} rows move; at most ${MONTHLY_MOVES} may`);
  const repeats = repeatedJustifications(
    answers.map((a) => {
      const x = a as Partial<MonthlyAnswer> | null;
      return { id: x?.id, justification: x?.reason };
    }),
    REPEAT_CAP,
  );
  if (repeats.length > 0) problems.push(repeatMessage(repeats, '.cache/monthly/review-output.jsonl'));
  return problems;
}

/**
 * The hits with one A stretch hit moved to Interesting: `shelf:stretch` comes
 * off, and `shelf:interesting` goes on unless the judge's scores already put
 * it there.
 */
export function applyMove(hits: readonly Hit[], id: string): { hits: Hit[]; add: string[]; remove: string[] } {
  const hit = hits.find((h) => h.id === id);
  if (!hit) throw new Error(`no such hit: ${id}`);
  if (hit.status !== 'accepted' || shelfOf(hit) !== 'stretch') throw new Error(`${id} is not in A stretch`);
  const remove: string[] = hit.tags.includes(SHELF_TAG.stretch) ? [SHELF_TAG.stretch] : [];
  const add: string[] = judgedShelf(hit) === 'interesting' ? [] : [SHELF_TAG.interesting];
  const tags = [...hit.tags.filter((t) => !remove.includes(t)), ...add.filter((t) => !hit.tags.includes(t))];
  return { hits: hits.map((h) => (h.id === id ? { ...h, tags } : h)), add, remove };
}

/** The month's record: every row read again with its decision, then every suggestion. */
export function monthlyLines(
  selection: MonthlySelection,
  answers: readonly MonthlyAnswer[],
  meta: { decided: string; model: string | null; judgedBy: JudgedBy; version: string },
): MonthlyLine[] {
  const counts = selection.counts ?? meta.decided;
  const byId = new Map(answers.map((a) => [a.id, a]));
  const base = { month: selection.month, decided: meta.decided, counts };
  return [
    ...selection.stretch.rows.map((r): MonthlyLine => {
      const a = byId.get(r.id)!;
      return {
        ...base,
        kind: 'reread',
        hit_id: r.id,
        votes: r.votes,
        rank: r.rank,
        decision: a.decision,
        reason: a.reason.trim(),
        model: meta.model ?? 'unknown',
        judged_by: meta.judgedBy,
        monthly_version: meta.version,
      };
    }),
    ...selection.interesting.rows.map((r): MonthlyLine => ({ ...base, kind: 'suggestion', hit_id: r.id, votes: r.votes, rank: r.rank })),
  ];
}

/** The month's report, for the record and the routine's pull request body. */
export function renderMonthlyReport(selection: MonthlySelection, answers: readonly MonthlyAnswer[], meta: { decided: string; model: string | null; judgedBy: JudgedBy }): string {
  const { month, counts, stretch, interesting } = selection;
  const byId = new Map(answers.map((a) => [a.id, a]));
  const moved = stretch.rows.filter((r) => byId.get(r.id)?.decision === 'move');
  const rule = `the top tenth by votes, with at least ${MONTHLY_MIN_VOTES} votes each`;
  const out = [
    `## Monthly vote review ${month}`,
    '',
    `Votes from the daily counts of ${counts ?? 'no day (there were none)'}. Each section's share is ${rule}. Votes nominate; they move nothing by themselves.`,
    '',
    `### A stretch, read again`,
    '',
  ];
  if (stretch.rows.length === 0) {
    out.push(`None: A stretch has ${stretch.total} hits, and none of its top ${stretch.top} has ${MONTHLY_MIN_VOTES} votes.`);
  } else {
    out.push(
      moved.length > 0
        ? `**Moves to Interesting:** ${moved.map((r) => `\`${r.id}\` "${r.display}"`).join(', ')}. Merging this pull request approves it; to keep it in A stretch, run \`pnpm hits:tag ${moved[0]!.id} -shelf:interesting\` on the branch${moved[0]!.placed ? ' and put back `+shelf:stretch`' : ''}.`
        : 'Nothing moves: every row stays in A stretch.',
      '',
      '| Rank | Votes | Input | Anagram | Decision | Why |',
      '|---|---|---|---|---|---|',
      ...stretch.rows.map((r) => {
        const a = byId.get(r.id)!;
        return `| ${r.rank} | ${r.votes} | ${cell(r.input)} | ${cell(r.display)}${r.placed ? ' (placed by you)' : ''} | ${a.decision === 'move' ? '**to Interesting**' : 'stays'} | ${cell(a.reason)} |`;
      }),
      '',
      `Read again by ${meta.model ?? 'no model'} (${meta.judgedBy}).`,
    );
  }
  out.push('', '### Greatest Hits suggestions', '');
  if (interesting.rows.length === 0) {
    out.push(`None: Interesting has ${interesting.total} hits, and none of its top ${interesting.top} has ${MONTHLY_MIN_VOTES} votes.`);
  } else {
    out.push(
      'The most voted in Interesting. Nothing here is promoted: a hit joins Greatest Hits only by your named decision, `pnpm hits:set --status=featured <id>`.',
      '',
      '| Rank | Votes | Input | Anagram | Id |',
      '|---|---|---|---|---|',
      ...interesting.rows.map((r) => `| ${r.rank} | ${r.votes} | ${cell(r.input)} | ${cell(r.display)} | \`${r.id}\` |`),
    );
  }
  return `${out.join('\n')}\n`;
}

const cell = (text: string) => text.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

/**
 * Where this month's review already is: on main (this checkout) or on an open
 * `hits/*` branch. A problem when the branches cannot be seen, so the review
 * is never run twice in one month blind.
 */
export function monthlyDone(month: string): { where: string | null; problem: string | null } {
  if (existsSync(resolve(MONTHLY_DIR, `${month}.md`))) return { where: 'main', problem: null };
  const git = (...args: string[]) => execFileSync('git', ['-C', REPO_ROOT, ...args], { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
  try {
    git('fetch', '-q', 'origin', '+refs/heads/hits/*:refs/remotes/origin/hits/*');
  } catch {
    return { where: null, problem: 'the open pull requests could not be fetched, so a review on one cannot be ruled out' };
  }
  for (const branch of git('for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin/hits/').split('\n').filter(Boolean)) {
    try {
      git('cat-file', '-e', `${branch}:data/votes/monthly/${month}.md`);
      return { where: branch.replace(/^origin\//, ''), problem: null };
    } catch {
      /* not on this branch */
    }
  }
  return { where: null, problem: null };
}

const SELECTION = resolve(MONTHLY_LOCAL, 'selection.json');
const INPUT = resolve(MONTHLY_LOCAL, 'review-input.md');
const OUTPUT = resolve(MONTHLY_LOCAL, 'review-output.jsonl');

async function prepare(argv: readonly string[]): Promise<void> {
  const month = flag(argv, 'month') ?? monthOf(today());
  if (!/^\d{4}-\d{2}$/.test(month)) throw new Error('--month is YYYY-MM');
  const { where, problem } = monthlyDone(month);
  if (problem) {
    console.log(`hits:monthly: ${problem}; not run this time.`);
    return;
  }
  if (where) {
    console.log(`hits:monthly: the review for ${month} is ${where === 'main' ? 'done' : `on ${where}, waiting for its merge`}; nothing to do.`);
    return;
  }
  const hits = await readJsonl(HITS_PATH, await hitSchema());
  const { date, votes } = await newestVotes();
  const selection = selectMonthly(hits, votes, month, date);
  await mkdir(MONTHLY_LOCAL, { recursive: true });
  for (const name of await readdir(MONTHLY_LOCAL)) await rm(resolve(MONTHLY_LOCAL, name));
  await writeFile(SELECTION, `${JSON.stringify(selection, null, 2)}\n`);
  const s = selection.stretch;
  const i = selection.interesting;
  const summary =
    `hits:monthly ${month}: it is this month's turn. Votes from the counts of ${date ?? 'no day yet'}. ` +
    `A stretch: ${s.rows.length} of its top ${s.top} (of ${s.total}) have ${MONTHLY_MIN_VOTES} votes; ` +
    `Interesting: ${i.rows.length} of its top ${i.top} (of ${i.total}) are suggested.`;
  if (s.rows.length > 0) {
    await writeFile(INPUT, renderMonthlyInput(selection, (await monthlyPrompt()).text));
    console.log(
      `${summary} Read .cache/monthly/review-input.md, answer every row into .cache/monthly/review-output.jsonl, ` +
        'then run pnpm hits:monthly --ingest --model=<your model id> --judged-by=<routine or hand>.',
    );
  } else {
    console.log(`${summary} Nothing to read again; run pnpm hits:monthly --ingest --judged-by=<routine or hand> to record the month.`);
  }
}

async function ingest(argv: readonly string[]): Promise<void> {
  const judgedBy = judgedByFlag(flag(argv, 'judged-by'));
  if (!existsSync(SELECTION)) throw new Error('run pnpm hits:monthly first; there is no .cache/monthly/selection.json');
  const selection = JSON.parse(await readFile(SELECTION, 'utf8')) as MonthlySelection;
  const { where } = monthlyDone(selection.month);
  if (where) throw new Error(`the review for ${selection.month} is already ${where === 'main' ? 'on main' : `on ${where}`}`);
  const rows = selection.stretch.rows;
  let answers: MonthlyAnswer[] = [];
  const model = flag(argv, 'model') ?? null;
  if (rows.length > 0) {
    if (!model) throw new Error('say --model=<your model id>: the rows read again record who read them');
    if (!existsSync(OUTPUT)) throw new Error('answer every row into .cache/monthly/review-output.jsonl first');
    const parsed = parseAnswers(await readFile(OUTPUT, 'utf8'));
    const problems = [...parsed.problems, ...answerProblems(parsed.answers, rows)];
    if (problems.length > 0) {
      console.error(`hits:monthly: the answers were not taken; nothing was written. Answer again:\n${problems.map((p) => `- ${p}`).join('\n')}`);
      process.exitCode = 1;
      return;
    }
    answers = parsed.answers as MonthlyAnswer[];
  }
  const decided = today();
  const validator = await hitSchema();
  let hits = await readJsonl(HITS_PATH, validator);
  const moved = answers.find((a) => a.decision === 'move');
  if (moved) {
    const result = applyMove(hits, moved.id);
    hits = result.hits;
    await writeJsonl(HITS_PATH, hits, validator);
    console.log(`${moved.id}  ${[...result.add.map((t) => `+${t}`), ...result.remove.map((t) => `-${t}`)].join(' ') || 'no tag changes'}  to Interesting`);
  }
  const version = (await monthlyPrompt()).version;
  const lines = monthlyLines(selection, answers, { decided, model, judgedBy, version });
  await writeLines(resolve(MONTHLY_DIR, `${selection.month}.jsonl`), lines, await validators.monthly());
  await writeFile(resolve(MONTHLY_DIR, `${selection.month}.md`), renderMonthlyReport(selection, answers, { decided, model, judgedBy }));
  console.log(
    `hits:monthly ${selection.month}: ${rows.length} read again, ${moved ? '1 moves to Interesting' : 'none moves'}, ` +
      `${selection.interesting.rows.length} Greatest Hits suggestions. Wrote data/votes/monthly/${selection.month}.md and .jsonl.`,
  );
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  const argv = process.argv.slice(2);
  try {
    await (argv.includes('--ingest') ? ingest(argv) : prepare(argv));
  } catch (error) {
    console.error(`hits:monthly: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
