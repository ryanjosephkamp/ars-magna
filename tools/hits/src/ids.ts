/**
 * Identity for candidates and hits.
 *
 * A candidate is its letters and its category: "Beyoncé", "beyonce" and
 * "BEYONCE KNOWLES" with the spaces removed are one input, and the same
 * letters as a company and as a person are two candidates, because the
 * judge scores aptness *to the entity*. A hit is its candidate plus its words
 * as a multiset, so `dirty room` and `room dirty` are one hit.
 */
import { normalizeLetters } from '@ars-magna/engine/fold';

export const CATEGORIES = ['people', 'companies', 'products', 'titles', 'places', 'phrases'] as const;
export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function candidateId(input: string, category: Category): string {
  return `${normalizeLetters(input)}:${category}`;
}

/** The sorted letters an input and its anagrams share. */
export function alphagram(text: string): string {
  return [...normalizeLetters(text)].sort().join('');
}

export function hitId(input: string, category: Category, words: readonly string[]): string {
  return `${candidateId(input, category)}:${[...words].sort().join('-')}`;
}
