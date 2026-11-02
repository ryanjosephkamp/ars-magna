/**
 * What a typed filter can honestly cover.
 *
 * A filter that is one or more whole dictionary words that fit the letters is
 * a question about every result, so the engine answers it, however much of the
 * list is loaded: every result is counted with those words as Must include, the
 * line leads with how many contain them (`11 of 15,202 contain “shamed”`), and
 * Show them switches the list to them, spelled with the words asked for. The
 * order the words are typed in does not matter. The count leaves the list
 * alone, and nothing switches it while the reader types: `sham` is a word on
 * the way to `shamed`.
 *
 * The rows on screen still narrow as the reader types, by what they display:
 * a result shows one spelling for each set of words sharing letters, so on a
 * list of "apple sauce" the row holding sauce shows cause, and the filter
 * `sauce` narrows it away while the engine counts it. On a list that is all
 * loaded, the line says so beside the engine's count when the two differ
 * (`12 of 588 contain “sauce” · 0 shown as typed`). A filter that is part of a
 * word, or a phrase fragment, narrows the rows on screen alone: every result
 * when they are all loaded, the loaded ones otherwise, labelled that way, and
 * a short list loads the rest first.
 *
 * The count runs in a worker of its own (`state/countWorker.ts`), never on the
 * one the list pages, jumps and opens rows with, and for at most
 * `FILTER_COUNT_LIMIT_MS`; past it the line gives the floor it reached.
 */
import { formatCount, type Query } from '@ars-magna/engine';

import type { TextCount } from './textCount.ts';

/** Below this exact total, a typed filter loads the rest of the list. A number the operator may tune. */
export const AUTO_LOAD_LIMIT = 5_000;

/** How long a filter's count may run, in milliseconds, before the line gives what it reached. A number the operator may tune. */
export const FILTER_COUNT_LIMIT_MS = 4_000;

export type FilterScope =
  /** No filter, or a fragment over a list that is all loaded: the rows on screen are every result it can match. */
  | { kind: 'all' }
  /**
   * The filter is dictionary words that fit: the engine counts every result
   * containing them, and offers to show those. `everyLoaded` says the list on
   * screen holds every result, so its own narrowing can be set beside the count.
   */
  | { kind: 'must-include'; words: string[]; everyLoaded: boolean }
  /** A fragment over a partial list: it covers the loaded rows only, and says so. */
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
  /** Must exclude as it stands: those words are not in this search's dictionary. */
  mustExclude?: readonly string[];
  /** The filter's words the dictionary tier carries, once looked up; null until then. */
  known: readonly string[] | null;
}): FilterScope {
  const { filter, loaded, total, letters, mustInclude, mustExclude = [], known } = options;
  if (filter.trim().length === 0) return { kind: 'all' };
  const exact = total.startsWith('>') ? null : Number(total);
  const everyLoaded = exact !== null && loaded >= exact;
  const words = engineWords(filter, letters, mustInclude, mustExclude, known);
  if (words) return { kind: 'must-include', words, everyLoaded };
  return everyLoaded ? { kind: 'all' } : { kind: 'loaded' };
}

/**
 * The filter's words the engine is asked about: every word is one the
 * dictionary carries, not taken out by Must exclude, and they fit the letters
 * beside Must include. Words Must include already holds add nothing, since
 * every row contains them. Null when any word fails, or none is left.
 */
function engineWords(
  filter: string,
  letters: string,
  mustInclude: readonly string[],
  mustExclude: readonly string[],
  known: readonly string[] | null,
): string[] | null {
  const words = filterWords(filter);
  if (!words || !known) return null;
  const pending = [...mustInclude];
  const extra = words.filter((w) => {
    const at = pending.indexOf(w);
    if (at === -1) return true;
    pending.splice(at, 1);
    return false;
  });
  if (extra.length === 0) return null;
  // An excluded word is out of this search's dictionary, so no result has it.
  if (!extra.every((w) => known.includes(w) && !mustExclude.includes(w))) return null;
  if (!fitsLetters(letters, [...mustInclude, ...extra])) return null;
  return extra;
}

/**
 * Whether a typed filter loads the rest of the list first: a short list under
 * `limit` that is not all loaded, so the rows on screen narrow over every
 * result, whatever the filter is.
 */
export function loadsRest(options: { filter: string; loaded: number; total: string; limit?: number }): boolean {
  const { filter, loaded, total, limit = AUTO_LOAD_LIMIT } = options;
  if (filter.trim().length === 0 || total.startsWith('>')) return false;
  const exact = Number(total);
  return loaded < exact && exact < limit;
}

/** “dirty”, or “dirty” and “room”, or “a”, “b” and “c”. */
function quoted(words: readonly string[]): string {
  const each = words.map((w) => `“${w}”`);
  return each.length <= 1 ? (each[0] ?? '') : `${each.slice(0, -1).join(', ')} and ${each.at(-1)}`;
}

/**
 * The query whose total is how many results contain the filter's words: the
 * search as it stands, with the words added to Must include.
 */
export function containingQuery(query: Query, words: readonly string[]): Query {
  return { ...query, mustInclude: [...query.mustInclude, ...words] };
}

/**
 * What a count is for, so an answer is only ever shown against the filter and
 * the search it was asked for. Two filters, or two searches, that would ask the
 * engine the same question share a key, whatever order their words are in.
 */
export function containingKey(query: Query, words: readonly string[]): string {
  const { input, tier, minWordLen, maxWords, mustInclude, mustExclude } = containingQuery(query, words);
  // Word order is no part of the question: `sauce apple` asks what `apple sauce` does.
  return JSON.stringify([input, tier, minWordLen, maxWords, [...mustInclude].sort(), [...mustExclude].sort()]);
}

/**
 * The status line once the engine has counted: `11 of 15,202 contain “shamed”`,
 * `1 of 15,202 contains “shamed”`, or, for a true zero, `None of 15,202 contain
 * “shamed”`. Either figure may be a floor (`>` in front), which reads `more than`.
 */
export function containingLabel(count: string, total: string, words: readonly string[]): string {
  const of = `of ${formatCount(total)}`;
  if (count === '0') return `None ${of} contain ${quoted(words)}`;
  return `${formatCount(count)} ${of} ${count === '1' ? 'contains' : 'contain'} ${quoted(words)}`;
}

/**
 * The status line for a filter's count as far as it has got: `Counting which
 * of 15,202 contain “shamed”…` while it runs; `11 of 15,202 contain “shamed”`
 * once counted; `more than 438,623,680,172 of 144,632,962,364,130 contain
 * “wheat”` when the time ran out after it had found some; a sentence saying
 * the count stopped when it ran out before finding one. Null when the engine
 * could not count, so the line falls back to the loaded rows.
 */
export function containingLine(count: TextCount, total: string, words: readonly string[], limitMs = FILTER_COUNT_LIMIT_MS): string | null {
  switch (count.kind) {
    case 'counting':
      return `Counting which of ${formatCount(total)} contain ${quoted(words)}…`;
    case 'exact':
      return containingLabel(count.total, total, words);
    case 'floor':
      return containingLabel(`>${count.total}`, total, words);
    case 'too-long': {
      const seconds = limitMs / 1000;
      return `Counting which of ${formatCount(total)} contain ${quoted(words)} stopped after ${seconds} ${seconds === 1 ? 'second' : 'seconds'}.`;
    }
    case 'none':
    case 'failed':
      return null;
  }
}

/**
 * Beside the engine's count on a list that is all loaded: how many rows the
 * screen shows for the filter as typed, when that is not the count. The screen
 * matches what each row displays, and a row shows one spelling for each set of
 * words sharing letters, so `sauce` can count 12 while the rows show `cause`
 * and none is shown. Null when the two agree, or the count has no figure yet.
 */
export function shownAsTyped(count: TextCount, shown: number): string | null {
  if (count.kind !== 'exact' && count.kind !== 'floor') return null;
  if (count.kind === 'exact' && count.total === String(shown)) return null;
  return `${formatCount(String(shown))} shown as typed`;
}
