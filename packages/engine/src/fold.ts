/**
 * Text -> the letters the search actually uses.
 *
 * Every accented letter is forced to its unaccented base letter, so "Beyoncé"
 * has three e's and "Björk" is searched as "bjork". The mapping is a generated
 * table (`foldTable.ts`) derived from Unicode NFKD over the Latin blocks —
 * decompose, drop the combining marks, keep the ASCII letters — plus a
 * hand-written list for the Latin letters that have no decomposition:
 * ß -> ss, æ -> ae, œ -> oe, ø -> o, đ -> d, ł -> l, þ -> th, ð -> d, ı -> i.
 *
 * A table rather than `String.prototype.normalize` because the Rust engine
 * has to fold identically and a full normalization library would add ~50 KB
 * to the compressed WASM payload. The same generated table lives on both
 * sides, and `fold.test.ts` checks it against the browser's own NFKD over the
 * covered ranges, so the two cannot drift.
 *
 * Everything else that is not a Latin letter — punctuation, spaces, digits,
 * symbols, other scripts, emoji — is ignored. Digits, symbols and letters of
 * other scripts are *counted* as skipped so the interface can say so; spaces
 * and punctuation are not, because "O'Brien-Smith" losing its apostrophe and
 * hyphen is what everyone expects and "2 characters skipped" would be noise.
 *
 * This must agree exactly with `normalize()` in `crates/anagram-core` and with
 * `tools/dict-build/src/normalize.ts`, which delegates here.
 */
import { FOLD_TABLE } from './foldTable.ts';

/** Letters of any script, digits, and "other symbols" (which is where emoji live). */
const COUNTS_AS_SKIPPED = /^[\p{L}\p{N}\p{So}]$/u;

export type Folded = {
  /** Lowercase `[a-z]` only, in input order. */
  readonly letters: string;
  /** Characters that carried something and were ignored (see above). */
  readonly skipped: number;
};

/** Fold one code point to its `[a-z]` letters, or `''` if it has none. */
export function foldChar(char: string): string {
  const code = char.charCodeAt(0);
  // ASCII letters, the overwhelmingly common case.
  if (code >= 0x61 && code <= 0x7a) return char;
  if (code >= 0x41 && code <= 0x5a) return String.fromCharCode(code + 32);
  if (code < 0x80) return '';
  return FOLD_TABLE[char] ?? '';
}

export function foldLetters(input: string): Folded {
  let letters = '';
  let skipped = 0;
  for (const char of input) {
    const folded = foldChar(char);
    if (folded.length > 0) letters += folded;
    else if (COUNTS_AS_SKIPPED.test(char)) skipped++;
  }
  return { letters, skipped };
}

/** The common case: just the letters. */
export function normalizeLetters(input: string): string {
  return foldLetters(input).letters;
}
