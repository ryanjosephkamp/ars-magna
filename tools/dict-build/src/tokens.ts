/**
 * The tokens of a name's label, as the names list folds them (phase Q1, and
 * the names class from phase N4).
 *
 * Shared by `names.ts`, which builds the list from its sources, and by
 * `vocab.ts`, which holds the committed list to the same rule: a name with a
 * `from` label must be one of that label's tokens.
 */
import { normalize } from './normalize.ts';

/**
 * The fewest letters a name may have (decision D63: the names class enters
 * with a floor of three letters). A two-letter token of a label (`BP`, `AC`
 * Sparta Prague, Port-`au`-Prince) is not a name the search should spell.
 */
export const NAME_FLOOR = 3;

/**
 * The pieces of a name that are not names: particles, articles and
 * prepositions of the languages names come in, and the abbreviations that
 * follow a person. Most are English words already and would fall to the
 * dictionary rule anyway; these are the ones that are not.
 */
export const PARTICLES: ReadonlySet<string> = new Set([
  'da', 'das', 'de', 'dei', 'del', 'della', 'delle', 'dello', 'dem', 'den', 'der', 'des', 'di', 'do', 'dos', 'du',
  'el', 'la', 'las', 'le', 'les', 'lo', 'los',
  'van', 'von', 'vom', 'zu', 'zum', 'zur', 'ter', 'ten',
  'al', 'bin', 'ibn', 'bint', 'abu', 'ben', 'bar',
  'san', 'santa', 'santo', 'sao', 'saint', 'sainte', 'st', 'ste',
  'jr', 'sr', 'mc', 'mac',
  'und', 'et', 'och', 'og',
]);

/** A Roman numeral, as a regnal number is written: `II`, `XIV`, `MDCCLXXVI`. */
export function isRomanNumeral(token: string): boolean {
  return /^m{0,3}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$/.test(token) && token.length > 0;
}

/** Where one token of a label ends and the next begins. */
const SEPARATOR = /[\s\-‐-―'‘’.,()/&:;"“”!?]+/u;

/**
 * The tokens of a label, as the search would fold them: each piece between
 * separators, lowercase with accents folded, kept when it is three letters or
 * more (`NAME_FLOOR`) and neither a particle nor a Roman numeral. `Rio de
 * Janeiro` gives `rio` and `janeiro`; `Louis XIV` gives `louis`. A name is
 * its letters, and a piece with a digit in it yields no token at all: `3M`,
 * `TF1`, `20th Century Studios` and `Se7en` give nothing for that piece,
 * since the search reads a digit as a character of the text, never as part
 * of a word (the literal rule, D62); the other pieces of `Boeing 747` and
 * `6th of October City` stand. A symbol is dropped before the fold (`Canal+`
 * gives `canal`).
 */
export function tokensOf(label: string): string[] {
  const out: string[] = [];
  for (const piece of label.split(SEPARATOR)) {
    if (/\p{Nd}/u.test(piece)) continue;
    const token = normalize(piece.replace(/[^\p{L}\p{M}]+/gu, ''));
    if (token.length < NAME_FLOOR || token.length > 45) continue;
    if (PARTICLES.has(token) || isRomanNumeral(token)) continue;
    if (!out.includes(token)) out.push(token);
  }
  return out;
}
