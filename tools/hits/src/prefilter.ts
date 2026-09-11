/**
 * `pnpm hits:prefilter [--date=YYYY-MM-DD] [--per-candidate=25]`
 *
 * From everything the engine enumerated, keep what could possibly be a hit,
 * put each phrase in the order that reads best, and score it — with no model.
 * Millions of rows go in; a few hundred come out for the judge.
 *
 * The rules are deliberately blunt. A hit built from a Full-only word or a
 * two-letter filler is never going to be memorable, and a five-word phrase is
 * a list, not a comment. The ordering score is the one the site itself uses
 * to display a result (`bestOrder`), so the judge sees the phrase the way a
 * reader would.
 */
import { createReadStream } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline';

import { bestOrder, scoreOrder } from '@ars-magna/engine';
import { normalizeLetters } from '@ars-magna/engine/fold';

import { hitId, alphagram, isCategory, type Category } from './ids.ts';
import { PREFILTERED, RAW, flag, pickQueue } from './queue.ts';

/** One line of raw.jsonl, as `anagram batch` writes it. */
export type RawRow = {
  id: string;
  input: string;
  category: string;
  count: string;
  count_is_floor: boolean;
  index: string;
  sampled: boolean;
  words: string[];
  zipf: number[];
  tiers: ('common' | 'standard' | 'full')[];
  pos: number[];
};

/** One line of prefiltered.jsonl: a candidate hit, ordered and scored. */
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
  count: string;
  index: string;
  sampled: boolean;
};

export const RULES = {
  maxWords: 4,
  minWordLength: 3,
  /** Every word must be in this tier. */
  tier: 'common' as const,
};

/**
 * Why a row was dropped, or `null` to keep it. Exposed so the tests can
 * name the rule that fired.
 */
export function reject(row: RawRow): string | null {
  if (row.words.length === 0 || row.words.length > RULES.maxWords) return 'word count';
  if (row.words.some((w) => w.length < RULES.minWordLength)) return 'short word';
  if (new Set(row.words).size !== row.words.length) return 'repeated word';
  if (row.tiers.some((t) => t !== RULES.tier)) return 'rare word';
  if (!isCategory(row.category)) return 'category';
  // "Star Wars" -> "star wars", "The Godfather" -> "the god father": the
  // input's own letters in the input's own order, in some arrangement of the
  // words. A re-spacing, not an anagram.
  if (isRespacing(row.words, normalizeLetters(row.input))) return 'identity';
  return null;
}

/** Can the words be arranged to spell `letters` exactly? At most 4 words, so at most 24 orders. */
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

export function prefilterRow(row: RawRow): Prefiltered | null {
  if (reject(row) !== null || !isCategory(row.category)) return null;
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
  };
}

/**
 * Keep the best `perCandidate` rows per candidate, deduplicated by hit id
 * (the head and the sample can overlap only by accident, but two orderings
 * of one multiset never survive as two rows).
 */
export function select(rows: readonly Prefiltered[], perCandidate: number): Prefiltered[] {
  const byCandidate = new Map<string, Map<string, Prefiltered>>();
  for (const row of rows) {
    const group = byCandidate.get(row.candidate_id) ?? new Map<string, Prefiltered>();
    const existing = group.get(row.id);
    if (!existing || existing.prefilter_score < row.prefilter_score) group.set(row.id, row);
    byCandidate.set(row.candidate_id, group);
  }
  const out: Prefiltered[] = [];
  for (const group of byCandidate.values()) {
    const best = [...group.values()]
      .sort((a, b) => b.prefilter_score - a.prefilter_score || a.id.localeCompare(b.id))
      .slice(0, perCandidate);
    out.push(...best);
  }
  return out;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dir = await pickQueue(argv);
  const perCandidate = Number(flag(argv, 'per-candidate') ?? 25);

  const kept: Prefiltered[] = [];
  const dropped = new Map<string, number>();
  let seen = 0;

  const lines = createInterface({ input: createReadStream(resolve(dir, RAW), 'utf8') });
  for await (const line of lines) {
    if (line.trim().length === 0) continue;
    seen++;
    const row = JSON.parse(line) as RawRow;
    const why = reject(row);
    if (why !== null) {
      dropped.set(why, (dropped.get(why) ?? 0) + 1);
      continue;
    }
    const pre = prefilterRow(row);
    if (pre) kept.push(pre);
  }

  const selected = select(kept, perCandidate);
  const out = resolve(dir, PREFILTERED);
  await writeFile(out, selected.map((r) => JSON.stringify(r)).join('\n') + (selected.length ? '\n' : ''));

  const candidates = new Set(selected.map((r) => r.candidate_id)).size;
  console.log(`${seen.toLocaleString()} rows in · ${kept.length.toLocaleString()} pass the rules · ${selected.length} kept for the judge across ${candidates} candidates`);
  for (const [why, n] of [...dropped.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  dropped ${n.toLocaleString().padStart(10)}  ${why}`);
  }
  console.log(`-> ${out}`);
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  await main();
}
