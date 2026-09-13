/**
 * `pnpm hits:prefilter [--date=YYYY-MM-DD] [--per-input=500|all]`
 *
 * From everything the engine enumerated, keep what could possibly be a hit,
 * put each phrase in the order that reads best, and score it — with no model.
 * Hundreds of thousands of rows go in; what comes out goes to the screen
 * (`pnpm hits:screen`), where a model keeps the phrases with any link to
 * their input.
 *
 * The rules are deliberately blunt: everyday words only, a word under three
 * letters only when `short-words.txt` lists it, at most five words, no word
 * twice, and never the input re-spaced. They judge form, not meaning, so
 * nothing apt is cut for reading awkwardly. `--per-input` bounds how many
 * phrases of one input go to the screen, in `screenOrder`. Each phrase's word
 * order is the one the site itself uses to display a result (`bestOrder`), so
 * the screen sees the phrase the way a reader would.
 */
import { createReadStream } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline';

import { bestOrder, scoreOrder } from '@ars-magna/engine';
import { normalizeLetters } from '@ars-magna/engine/fold';

import { hitId, alphagram, isCategory, type Category } from './ids.ts';
import { PREFILTERED, RAW, SUMMARY, flag, pickQueue } from './queue.ts';
import { CANDIDATES_PATH, candidateSchema, readJsonl, today, writeJsonl, type Candidate, type CandidateRun } from './schema.ts';
import { rubric } from './judge.ts';
import { PRESETS, addRun, queueName, queueSettings, readShortWords } from './settings.ts';

/** One line of raw.jsonl, as `anagram batch` writes it. */
export type RawRow = {
  id: string;
  input: string;
  category: string;
  count: string;
  count_is_floor: boolean;
  index: string;
  sampled: boolean;
  /** The anchor word the row's search required, when it came from one. */
  anchor?: string;
  words: string[];
  zipf: number[];
  tiers: ('common' | 'standard' | 'full')[];
  pos: number[];
};

/**
 * One line of prefiltered.jsonl: a candidate hit, ordered and scored. A row
 * rebuilt from the screen (`screened.jsonl`) has no `count`, `index` or
 * `sampled`: the compact screen input does not carry them.
 */
export type Prefiltered = {
  /** The hit id: candidate id plus the words as a multiset. */
  id: string;
  candidate_id: string;
  input: string;
  category: Category;
  words: string[];
  display: string;
  letters: string;
  prefilter_score: number;
  tier: 'common' | 'standard' | 'full';
  count?: string;
  index?: string;
  sampled?: boolean;
  /** The anchor word of the search that found it, when one did. */
  anchor?: string;
};

export const RULES = {
  maxWords: 5,
  /** Shorter words pass only when the short-word allowlist names them. */
  minWordLength: 3,
  /** Every word must be in this tier. */
  tier: 'common' as const,
};

/**
 * Why a row was dropped, or `null` to keep it. Exposed so the tests can
 * name the rule that fired. `allow` is the short-word allowlist.
 */
export function reject(row: RawRow, allow: ReadonlySet<string> = new Set()): string | null {
  if (row.words.length === 0 || row.words.length > RULES.maxWords) return 'word count';
  if (row.words.some((w) => w.length < RULES.minWordLength && !allow.has(w))) return 'short word';
  if (new Set(row.words).size !== row.words.length) return 'repeated word';
  if (row.tiers.some((t) => t !== RULES.tier)) return 'rare word';
  if (!isCategory(row.category)) return 'category';
  // "Star Wars" -> "star wars", "The Godfather" -> "the god father": the
  // input's own letters in the input's own order, in some arrangement of the
  // words. A re-spacing, not an anagram.
  if (isRespacing(row.words, normalizeLetters(row.input))) return 'identity';
  return null;
}

/** Can the words be arranged to spell `letters` exactly? At most 5 words, so at most 120 orders. */
export function isRespacing(words: readonly string[], letters: string): boolean {
  if (words.join('').length !== letters.length) return false;
  const walk = (remaining: string, used: boolean[]): boolean => {
    if (remaining.length === 0) return true;
    for (let i = 0; i < words.length; i++) {
      if (used[i] || !remaining.startsWith(words[i]!)) continue;
      used[i] = true;
      if (walk(remaining.slice(words[i]!.length), used)) return true;
      used[i] = false;
    }
    return false;
  };
  return walk(letters, words.map(() => false));
}

/**
 * The score: how well the words read in their best order, plus how common
 * they are, minus a little for every extra word. Only the gaps matter — it is
 * a sort key for the judge's queue and a tie-breaker in the dataset, not a
 * grade. The zipf byte is `(zipf + 1) * 24`, so dividing by 24 puts it back
 * on the zipf scale, where everyday words sit around 4 to 6.
 */
export function score(words: readonly string[], masks: readonly number[], zipf: readonly number[]): number {
  const order = scoreOrder(words, masks);
  const meanZipf = zipf.reduce((a, b) => a + b, 0) / Math.max(1, zipf.length) / 24 - 1;
  const lengthPenalty = 2 * (words.length - 1);
  return Math.round((order + 2 * meanZipf - lengthPenalty) * 100) / 100;
}

export function prefilterRow(row: RawRow, allow: ReadonlySet<string> = new Set()): Prefiltered | null {
  if (reject(row, allow) !== null || !isCategory(row.category)) return null;
  const ordered = bestOrder(row.words, row.pos);
  const masks = ordered.map((w) => row.pos[row.words.indexOf(w)] ?? 0);
  return {
    id: hitId(row.input, row.category, row.words),
    candidate_id: row.id,
    input: row.input,
    category: row.category,
    words: ordered,
    display: ordered.join(' '),
    letters: alphagram(row.input),
    prefilter_score: score(ordered, masks, row.zipf),
    tier: row.tiers.includes('full') ? 'full' : row.tiers.includes('standard') ? 'standard' : 'common',
    count: row.count,
    index: row.index,
    sampled: row.sampled,
    ...(row.anchor ? { anchor: row.anchor } : {}),
  };
}

const byScore = (a: Prefiltered, b: Prefiltered) => b.prefilter_score - a.prefilter_score || a.id.localeCompare(b.id);

/**
 * The order one input's phrases go to the screen in, and so which of them
 * survive `--per-input`. Phrases from an anchor search come first, since each
 * anchor was chosen for its link to the input. The rest take turns by word
 * count, best-reading first within each count. The score favors fewer, more
 * common words, so ranking by score alone pushes apt longer phrases far down:
 * in the s2 gate run, "no untidy clothes" was 4,096th of 17,892 by score and
 * 93rd taking turns, and 10 of 12 traced classics sat in the first 500
 * taking turns against 5 by score.
 */
export function screenOrder(rows: readonly Prefiltered[]): Prefiltered[] {
  const anchored = rows.filter((r) => r.anchor).sort(byScore);
  const byLength = new Map<number, Prefiltered[]>();
  for (const row of rows) {
    if (row.anchor) continue;
    byLength.set(row.words.length, [...(byLength.get(row.words.length) ?? []), row]);
  }
  const lists = [...byLength.entries()].sort((a, b) => a[0] - b[0]).map(([, list]) => list.sort(byScore));
  const out = [...anchored];
  const longest = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++) {
    for (const list of lists) if (i < list.length) out.push(list[i]!);
  }
  return out;
}

/**
 * Every row that passed, deduplicated by hit id (two spellings of one word
 * are two hits, but two orderings of one multiset are one), grouped by
 * candidate in the order they arrived, each group in `screenOrder`. At most
 * `perInput` per candidate go on to the screen.
 */
export function select(rows: readonly Prefiltered[], perInput = Infinity): Prefiltered[] {
  const byCandidate = new Map<string, Map<string, Prefiltered>>();
  for (const row of rows) {
    const group = byCandidate.get(row.candidate_id) ?? new Map<string, Prefiltered>();
    const existing = group.get(row.id);
    if (!existing || existing.prefilter_score < row.prefilter_score) group.set(row.id, row);
    byCandidate.set(row.candidate_id, group);
  }
  const out: Prefiltered[] = [];
  for (const group of byCandidate.values()) out.push(...screenOrder([...group.values()]).slice(0, perInput));
  return out;
}

/** `--per-input=N`, or `all` for no bound. */
export function perInputFlag(value: string | undefined): number {
  if (value === undefined) return PRESETS.routine.perInput ?? Infinity;
  if (value === 'all') return Infinity;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new Error(`--per-input must be a positive whole number or all, not ${value}`);
  return n;
}

/**
 * A candidate the engine ran that left nothing for the judge is done: it
 * moves to `enumerated` with a note, so the next night does not enumerate it
 * again and again. Only candidates this run actually enumerated count
 * (`ran`, from the batch summary), and only rows that passed the rules
 * matter (`kept`), not the global cap, which guarantees every candidate its
 * best row anyway. Returns the candidates it changed.
 */
export function settleEmpty(
  candidates: Candidate[],
  ran: ReadonlySet<string>,
  kept: ReadonlySet<string>,
  date: string,
  run?: CandidateRun,
): Candidate[] {
  const settled: Candidate[] = [];
  for (const c of candidates) {
    if (c.status !== 'new' || !ran.has(c.id) || kept.has(c.id)) continue;
    c.status = 'enumerated';
    const note = `nothing keepable ${date}`;
    c.notes = c.notes ? `${c.notes}; ${note}` : note;
    if (run) addRun(c, run);
    settled.push(c);
  }
  return settled;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dir = await pickQueue(argv);
  const perInput = perInputFlag(flag(argv, 'per-input'));
  const allow = await readShortWords();

  const kept: Prefiltered[] = [];
  const dropped = new Map<string, number>();
  let seen = 0;

  const lines = createInterface({ input: createReadStream(resolve(dir, RAW), 'utf8') });
  for await (const line of lines) {
    if (line.trim().length === 0) continue;
    seen++;
    const row = JSON.parse(line) as RawRow;
    const why = reject(row, allow);
    if (why !== null) {
      dropped.set(why, (dropped.get(why) ?? 0) + 1);
      continue;
    }
    const pre = prefilterRow(row, allow);
    if (pre) kept.push(pre);
  }

  const selected = select(kept, perInput);
  const out = resolve(dir, PREFILTERED);
  await writeFile(out, selected.map((r) => JSON.stringify(r)).join('\n') + (selected.length ? '\n' : ''));

  const candidates = new Set(selected.map((r) => r.candidate_id)).size;
  const unique = new Set(kept.map((r) => r.id)).size;
  console.log(
    `${seen.toLocaleString()} rows in · ${kept.length.toLocaleString()} pass the rules (${unique.toLocaleString()} distinct) · ` +
      `${selected.length.toLocaleString()} kept for the screen across ${candidates} candidates` +
      (Number.isFinite(perInput) ? ` (at most ${perInput} per input)` : ''),
  );
  for (const [why, n] of [...dropped.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  dropped ${n.toLocaleString().padStart(10)}  ${why}`);
  }
  console.log(`-> ${out}`);

  // Close out the candidates that produced nothing keepable.
  const summary = JSON.parse(await readFile(resolve(dir, SUMMARY), 'utf8')) as { candidates: { id: string }[] };
  const ran = new Set(summary.candidates.map((c) => c.id));
  const keptIds = new Set(kept.map((r) => r.candidate_id));
  const validate = await candidateSchema();
  const all = await readJsonl(CANDIDATES_PATH, validate);
  const date = today();
  const { version } = await rubric();
  const settled = settleEmpty(all, ran, keptIds, date, { queue: queueName(dir), settings: await queueSettings(dir), rubric: version, date });
  if (settled.length > 0) {
    await writeJsonl(CANDIDATES_PATH, all, validate);
    console.log(`${settled.length} candidates produced nothing keepable and moved to enumerated: ${settled.map((c) => c.input).join(', ')}`);
  }
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  await main();
}
