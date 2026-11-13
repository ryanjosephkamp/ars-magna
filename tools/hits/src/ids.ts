/**
 * Identity for candidates and hits.
 *
 * A candidate is its letters and its category: "Beyoncé", "beyonce" and
 * "BEYONCE KNOWLES" with the spaces removed are one input, and the same
 * letters as a company and as a person are two candidates, because the
 * judge scores aptness *to the entity*. A hit is its candidate plus its words
 * as a multiset, so `dirty room` and `room dirty` are one hit.
 *
 * The letters of an input with a number or a symbol in it depend on how it
 * is read (roadmap phase N, `@ars-magna/engine/readings`): "Reacher season 4"
 * is the letters of *reacher season four* by the default readings, and of
 * *reacher season* when the 4 is left out. So a record's `reading` is part of
 * its identity, and every id here is computed with it. A record with no
 * `reading` was made before phase N, when every number and symbol was
 * dropped: `null` here means that, and keeps such ids as they were.
 */
import { legacyLetters, normalizeLetters } from '@ars-magna/engine/fold';
import { DROP, fullReading, readItems, type Reading } from '@ars-magna/engine/readings';

export const CATEGORIES = ['people', 'companies', 'products', 'titles', 'places', 'phrases'] as const;
export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

/**
 * A record's reading, or `null` for a record made before phase N, whose
 * numbers and symbols were all dropped. Undefined on a record means the same
 * as absent.
 */
export type RecordReading = Reading | null | undefined;

/**
 * The letters of an input as the fold gave them before phase N: every digit
 * and every symbol dropped, and the letters kept, an ordinal's suffix among
 * them ("18th BRICS summit" was `thbricssummit`). What a record with no
 * `reading` was made with, and so what its id and its letters still are. The
 * engine's, so the dictionary build folds the frequency list the same way.
 */
export { legacyLetters };

/**
 * The nearest reading to the legacy fold, for a link: every item left out.
 * Exact but for an ordinal, whose suffix the old fold kept.
 */
export function legacyReading(input: string): Reading {
  return Object.fromEntries(readItems(input).map((item) => [item.key, DROP]));
}

/**
 * The reading a new record stores: every item's reading, defaults filled in,
 * or nothing for an input without items. `overrides` is what was chosen for
 * it, if anything.
 */
export function recordReading(input: string, overrides: Reading = {}): Record<string, string> | undefined {
  return fullReading(input, overrides) ?? undefined;
}

/** The input's letters as the record reads them: by its reading, or, with none, as before phase N. */
export function lettersOf(input: string, reading: RecordReading): string {
  return reading ? normalizeLetters(input, reading) : legacyLetters(input);
}

export function candidateId(input: string, category: Category, reading: RecordReading): string {
  return `${lettersOf(input, reading)}:${category}`;
}

/**
 * The sorted letters an input and its anagrams share. `reading` is the
 * record's; `{}` for words, which have no items to read.
 */
export function alphagram(text: string, reading: RecordReading): string {
  return [...lettersOf(text, reading)].sort().join('');
}

export function hitId(input: string, category: Category, words: readonly string[], reading: RecordReading): string {
  return `${candidateId(input, category, reading)}:${[...words].sort().join('-')}`;
}
