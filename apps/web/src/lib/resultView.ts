/**
 * Filtering and sorting a loaded result set.
 *
 * Both operate on the rows currently in memory, not on the whole answer space —
 * sorting eleven million results the engine has not enumerated is not a thing
 * that can be done. The interface says which of the two it is doing, and offers
 * to load everything when the total is small enough for that to be honest.
 */
import type { Row } from '../state/resultBuffer.ts';

export type SortMode = 'default' | 'az' | 'za' | 'fewest' | 'most' | 'longest';

export const SORT_LABEL: Record<SortMode, string> = {
  default: 'Best first',
  az: 'A to Z',
  za: 'Z to A',
  fewest: 'Fewest words',
  most: 'Most words',
  longest: 'Longest word',
};

export const SORT_MODES = Object.keys(SORT_LABEL) as SortMode[];

export function isSortMode(value: string): value is SortMode {
  return (SORT_MODES as string[]).includes(value);
}

function longestWord(row: Row): number {
  let longest = 0;
  for (const word of row) if (word.length > longest) longest = word.length;
  return longest;
}

/**
 * Substring match against the whole phrase, case-insensitive.
 *
 * Matching the phrase rather than individual words means a query like
 * `dirty ro` still finds `dirty room` — people type what they remember seeing,
 * spaces included. Non-letters in the filter are kept, so a space is meaningful.
 *
 * This matches what a row displays, which is one spelling for each set of words
 * sharing letters: the row holding `sauce` displays `cause`, so a filter of
 * whole dictionary words is answered by the engine instead, and the line sets
 * the two beside each other (`filterScope.ts`).
 */
export function matches(row: Row, filter: string): boolean {
  if (filter.length === 0) return true;
  return row.join(' ').includes(filter);
}

export function applyView(
  rows: readonly Row[],
  options: { filter: string; sort: SortMode },
): readonly Row[] {
  const filter = options.filter.trim().toLowerCase();

  // The engine's own order is longest-word-first, which is the most useful
  // default; avoid copying when nothing has to change.
  if (filter.length === 0 && options.sort === 'default') return rows;

  // `filter` skips holes, which matters: the result buffer writes rows by index,
  // so a batch still in flight leaves gaps. Sorting a sparse array would spread
  // those holes into `undefined` and the comparator would throw on them.
  const filtered = rows.filter((row) => row !== undefined && matches(row, filter));

  if (options.sort === 'default') return filtered;

  // Ties break alphabetically so the order is total — otherwise two runs of the
  // same sort could disagree and rows would appear to shuffle themselves.
  const byPhrase = (a: Row, b: Row) => a.join(' ').localeCompare(b.join(' '));

  const compare: Record<Exclude<SortMode, 'default'>, (a: Row, b: Row) => number> = {
    az: byPhrase,
    za: (a, b) => byPhrase(b, a),
    fewest: (a, b) => a.length - b.length || byPhrase(a, b),
    most: (a, b) => b.length - a.length || byPhrase(a, b),
    longest: (a, b) => longestWord(b) - longestWord(a) || byPhrase(a, b),
  };

  return [...filtered].sort(compare[options.sort]);
}
