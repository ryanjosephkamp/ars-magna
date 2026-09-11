import { normalizeLetters } from '../../../packages/engine/src/fold.ts';

/**
 * Surface form -> search form.
 *
 * The pinned list contains 188 hyphenated surfaces (`across-the-board`,
 * `avant-garde`, and one trailing-hyphen artifact `behind-`) plus two accented
 * entries (`norteño`, `peléan`). Accents fold to their base letter and
 * everything that is not a Latin letter is dropped, so both cases fall out of
 * one rule: `norteño` -> `norteno`, `across-the-board` -> `acrosstheboard`.
 *
 * This is the *same function* the app applies to user input — imported, not
 * copied — which is what makes "Ryan Joseph Kamp", "ryanjosephkamp" and
 * "Beyoncé" line up with the dictionary. The Rust engine's `normalize()` is
 * held to the same table by its own tests.
 */
export function normalize(surface: string): string {
  return normalizeLetters(surface);
}

/** 26-slot letter-count vector. Index 0 = 'a'. */
export function letterCounts(normalized: string): Uint8Array {
  const v = new Uint8Array(26);
  for (let i = 0; i < normalized.length; i++) {
    // Safe: `normalized` is [a-z] only by construction.
    v[normalized.charCodeAt(i) - 97]!++;
  }
  return v;
}

/** Sorted-letter signature ("alphagram"). All anagrams of each other share one. */
export function signature(normalized: string): string {
  return [...normalized].sort().join('');
}
