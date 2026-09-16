/**
 * What a typed filter can honestly cover.
 *
 * The filter works on the rows in memory. When those are every result, it
 * covers everything. When they are not, there are two better answers than
 * filtering a fraction and saying so: a short list simply loads the rest, and
 * a filter that is one or more dictionary words can become Must include, which
 * asks the engine for every anagram containing them, however many there are.
 * A filter that is part of a word, or a phrase fragment, stays on the loaded
 * rows and is labelled that way.
 */
import { formatCount } from '@ars-magna/engine';

/** Below this exact total, a typed filter loads the rest of the list. A number the operator may tune. */
export const AUTO_LOAD_LIMIT = 5_000;

export type FilterScope =
  /** No filter, or every result is loaded: the filter covers everything. */
  | { kind: 'all' }
  /** The list is short enough to load the rest now, after which the filter covers everything. */
  | { kind: 'load-rest' }
  /** The filter is dictionary words: offer to search every result for anagrams containing them. */
  | { kind: 'must-include'; words: string[] }
  /** The filter covers the loaded rows only, and says so. */
  | { kind: 'loaded' };

/** The filter as whole words, lowercase, when it is nothing but letters and spaces; otherwise null. */
export function filterWords(filter: string): string[] | null {
  const words = filter.trim().toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0 || !words.every((w) => /^[a-z]+$/.test(w))) return null;
  return words;
}

/** Whether `letters` hold every letter of `words` together, repeats counted. */
export function fitsLetters(letters: string, words: readonly string[]): boolean {
  const left = new Map<string, number>();
  for (const c of letters) left.set(c, (left.get(c) ?? 0) + 1);
  for (const c of words.join('')) {
    const n = left.get(c) ?? 0;
    if (n === 0) return false;
    left.set(c, n - 1);
  }
  return true;
}

export function filterScope(options: {
  filter: string;
  /** Rows in memory. */
  loaded: number;
  /** The engine's total: digits, `>`-prefixed when a floor. */
  total: string;
  /** The search's letters, folded. */
  letters: string;
  /** Must include as it stands. */
  mustInclude: readonly string[];
  /** The filter's words the dictionary tier carries, once looked up; null until then. */
  known: readonly string[] | null;
  limit?: number;
}): FilterScope {
  const { filter, loaded, total, letters, mustInclude, known, limit = AUTO_LOAD_LIMIT } = options;
  if (filter.trim().length === 0) return { kind: 'all' };

  const exact = total.startsWith('>') ? null : Number(total);
  if (exact !== null && loaded >= exact) return { kind: 'all' };
  if (exact !== null && exact < limit) return { kind: 'load-rest' };

  const words = filterWords(filter);
  if (!words || !known) return { kind: 'loaded' };
  // Words Must include already holds add nothing: every row contains them.
  const pending = [...mustInclude];
  const extra = words.filter((w) => {
    const at = pending.indexOf(w);
    if (at === -1) return true;
    pending.splice(at, 1);
    return false;
  });
  if (extra.length === 0) return { kind: 'loaded' };
  if (!extra.every((w) => known.includes(w))) return { kind: 'loaded' };
  if (!fitsLetters(letters, [...mustInclude, ...extra])) return { kind: 'loaded' };
  return { kind: 'must-include', words: extra };
}

/** “dirty”, or “dirty” and “room”, or “a”, “b” and “c”. */
function quoted(words: readonly string[]): string {
  const each = words.map((w) => `“${w}”`);
  return each.length <= 1 ? (each[0] ?? '') : `${each.slice(0, -1).join(', ')} and ${each.at(-1)}`;
}

/** The offer's label: `Search all 12,345 for anagrams containing “room”`, or `Search them all …` when the total is a floor. */
export function searchAllLabel(total: string, words: readonly string[]): string {
  const how = total.startsWith('>') ? 'them all' : `all ${formatCount(total)}`;
  return `Search ${how} for anagrams containing ${quoted(words)}`;
}
