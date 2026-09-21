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
 * Numbers and the symbols `@ $ ! & +` are read as letters first (`readings.ts`,
 * roadmap phase N): "Blink-182" has the letters of *blink one hundred eighty
 * two* and "Ke$ha" those of *kesha*, by the default readings unless the
 * reader chose others (`reading`). Everything else that is not a Latin letter
 * — punctuation, spaces, other scripts, emoji — is ignored. Letters of other
 * scripts, other symbols and the items a reading leaves out are *counted* as
 * skipped so the interface can say so; spaces and punctuation are not,
 * because "O'Brien-Smith" losing its apostrophe and hyphen is what everyone
 * expects and "2 characters skipped" would be noise.
 *
 * This must agree exactly with `normalize()` in `crates/anagram-core` and with
 * `tools/dict-build/src/normalize.ts`, which delegates here.
 */
import { FOLD_TABLE } from './foldTable.ts';
import { NO_READING, readText, type Reading } from './readings.ts';

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

/**
 * Whether one code point carries something the search ignores and the page
 * should say so: a digit, a symbol, a letter of another script. Spaces,
 * punctuation, apostrophes and hyphens are ignored without a word, and a
 * letter that folds is not skipped at all.
 */
export function isSkipped(char: string): boolean {
  return foldChar(char).length === 0 && COUNTS_AS_SKIPPED.test(char);
}

export function foldLetters(input: string, reading: Reading = NO_READING): Folded {
  const read = readText(input, reading);
  let letters = '';
  let skipped = read.dropped;
  for (const char of read.text) {
    const folded = foldChar(char);
    if (folded.length > 0) letters += folded;
    else if (COUNTS_AS_SKIPPED.test(char)) skipped++;
  }
  return { letters, skipped };
}

/** The common case: just the letters. */
export function normalizeLetters(input: string, reading: Reading = NO_READING): string {
  return foldLetters(input, reading).letters;
}

/**
 * Where a text's words end: Unicode White_Space plus U+FEFF. Spelled out
 * rather than `\s`, which leaves out U+0085, so that `text_words()` in
 * `crates/anagram-core` splits on exactly the same characters.
 */
const WORD_BREAK = /[\u0009-\u000d\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/u;

/**
 * Text -> its words, each folded to its letters: what the engine is sent, so
 * it knows what the text's own words are. The text itself, its words in any
 * order, is never one of its results, while the same letters spaced
 * differently are.
 *
 * Split on whitespace only, after the reading step, so a spelled number is
 * its words ("Area 51" is `area`, `fifty`, `one`). A hyphen or an apostrophe
 * carries no letters, so "apple-sauce" is the one word `applesauce`; a piece
 * that folds to nothing ("!!") is not a word and is left out. Joined back
 * together the words are exactly `normalizeLetters(input)`.
 */
export function foldWords(input: string, reading: Reading = NO_READING): string[] {
  return readText(input, reading)
    .text.split(WORD_BREAK)
    .map((word) => normalizeLetters(word))
    .filter((word) => word.length > 0);
}
