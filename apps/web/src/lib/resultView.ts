/**
 * Filtering and sorting a loaded result set.
 *
 * Both operate on the rows currently in memory, not on the whole answer space —
 * sorting eleven million results the engine has not enumerated is not a thing
 * that can be done. The interface says which of the two it is doing, and offers
 * to load everything when the total is small enough for that to be honest.
 */
import type { ErrorCode } from '@ars-magna/engine';
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

/**
 * What the count line shows: the total once the engine has answered the
 * query, with `Nothing spells …` in place of the list when that total is 0
 * and nothing went wrong; and until then the searching state alone, in the
 * number's place. A query not yet answered is not a zero: the 0 in the buffer
 * is the reset's, and on a page load it stood for the 180 milliseconds
 * between the dictionary arriving and the first search.
 */
export function countLineOf(state: {
  readonly answered: boolean;
  readonly searching: boolean;
  readonly total: string;
  readonly error: unknown;
}): { readonly kind: 'unanswered' } | { readonly kind: 'answered'; readonly total: string; readonly empty: boolean } {
  if (!state.answered) return { kind: 'unanswered' };
  return { kind: 'answered', total: state.total, empty: !state.searching && state.total === '0' && state.error === null };
}

/**
 * What the notice reads when the query as a whole failed, in place of the
 * results: a sentence of the page's own for each refusal the engine can
 * make of a text, and the engine's message after a plain sentence for
 * anything else. A must-include problem never gets here; it sits on its
 * control.
 */
export function queryNotice(error: { readonly code: ErrorCode; readonly message: string }): string {
  switch (error.code) {
    case 'TOO_MANY_REPEATS':
      return 'A letter appears more than 127 times, which is more of one letter than the search can hold.';
    case 'TOO_MANY_CHARACTERS':
      return 'The text has more than six different digits and symbols, which is more than the search can hold.';
    case 'TOO_MANY_NUMERALS':
      return "The text's digits make more numerals than the search can hold.";
    default:
      return `The search failed. ${error.message}`;
  }
}
