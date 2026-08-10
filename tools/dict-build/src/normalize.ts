/**
 * Surface form -> search form.
 *
 * The pinned list contains 188 hyphenated surfaces (`across-the-board`,
 * `avant-garde`, and one trailing-hyphen artifact `behind-`) plus two accented
 * entries (`norteño`, `peléan`). NFKD decomposition splits the accent into a
 * combining mark, which the `[^a-z]` strip then removes, so both cases fall out
 * of one rule: `norteño` -> `norteno`, `across-the-board` -> `acrosstheboard`.
 *
 * This is the same transform applied to user input, which is what makes
 * "Ryan Joseph Kamp" and "ryanjosephkamp" the same query.
 */
export function normalize(surface: string): string {
  return surface.normalize('NFKD').toLowerCase().replace(/[^a-z]/g, '');
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
