import { legacyLetters } from '../../../packages/engine/src/fold.ts';

/**
 * Surface form -> search form.
 *
 * The pinned list contains 188 hyphenated surfaces (`across-the-board`,
 * `avant-garde`, and one trailing-hyphen artifact `behind-`) plus two accented
 * entries (`norteño`, `peléan`). Accents fold to their base letter and
 * everything that is not a Latin letter is dropped, so both cases fall out of
 * one rule: `norteño` -> `norteno`, `across-the-board` -> `acrosstheboard`.
 *
 * This is the app's own fold — imported, not copied — which is what makes
 * "Ryan Joseph Kamp", "ryanjosephkamp" and "Beyoncé" line up with the
 * dictionary. The Rust engine's `normalize()` is held to the same table by
 * its own tests. It is the fold as it was before phase N (2026-09-21): a
 * digit removed, a symbol dropped, the letters kept. The frequency list has
 * 55,000 entries with a digit or a symbol (`2nd`, `80s`, `1st`), and folding
 * them any other way moves their counts onto other words (measured on
 * 2026-09-21: 26 words would cross the Common cutoff), so the artifact is
 * held to this fold and `dict:verify` proves it byte for byte.
 */
export function normalize(surface: string): string {
  return legacyLetters(surface);
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
