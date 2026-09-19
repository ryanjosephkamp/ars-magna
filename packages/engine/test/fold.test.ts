/**
 * The fold has to agree with the Rust `normalize()` byte for byte, so the
 * table here is the same one `crates/anagram-core/src/counts.rs` checks.
 */
import { describe, expect, it } from 'vitest';

import { foldChar, foldLetters, foldWords, isSkipped, normalizeLetters } from '../src/fold.ts';
import { FOLD_RANGES, FOLD_TABLE } from '../src/foldTable.ts';

/** `[input, letters, skipped]` — mirrored in the Rust unit tests. */
export const FOLD_CASES: readonly (readonly [string, string, number])[] = [
  ['Beyoncé Knowles', 'beyonceknowles', 0],
  ['Penélope Cruz', 'penelopecruz', 0],
  ['Zoë Kravitz', 'zoekravitz', 0],
  ['Renée Zellweger', 'reneezellweger', 0],
  ['Björk', 'bjork', 0],
  ['Motörhead', 'motorhead', 0],
  ['Straße', 'strasse', 0],
  ['Ærø', 'aero', 0],
  ['Łódź', 'lodz', 0],
  ['Þórður', 'thordur', 0],
  ['İstanbul', 'istanbul', 0],
  ['Ryan Joseph Kamp', 'ryanjosephkamp', 0],
  ["O'Brien-Smith", 'obriensmith', 0],
  ['Route 66!', 'route', 2],
  ['Ben Shelton 🎾 2026', 'benshelton', 5],
  ['Владимир', '', 8],
  ['東京', '', 2],
  ['', '', 0],
  ['1234!!', '', 4],
];

describe('foldLetters', () => {
  it.each(FOLD_CASES)('folds %j', (input, letters, skipped) => {
    expect(foldLetters(input)).toEqual({ letters, skipped });
  });

  it('gives an accented spelling the same letters as its plain one', () => {
    expect(normalizeLetters('Beyoncé')).toBe(normalizeLetters('Beyonce'));
    expect(normalizeLetters('Straße')).toBe(normalizeLetters('Strasse'));
    expect(normalizeLetters('Björk')).toBe(normalizeLetters('Bjork'));
  });

  it('matches the dictionary build for its two accented surfaces', () => {
    expect(normalizeLetters('norteño')).toBe('norteno');
    expect(normalizeLetters('peléan')).toBe('pelean');
  });

  it('agrees with the browser NFKD over every code point the table covers', () => {
    // The table is generated, so this is the check that it was generated
    // right and has not been hand-edited since.
    const special: Record<string, string> = {
      ß: 'ss', ẞ: 'ss', æ: 'ae', Æ: 'ae', œ: 'oe', Œ: 'oe', ø: 'o', Ø: 'o',
      đ: 'd', Đ: 'd', ł: 'l', Ł: 'l', þ: 'th', Þ: 'th', ð: 'd', Ð: 'd', ı: 'i',
    };
    let checked = 0;
    for (const [lo, hi] of FOLD_RANGES) {
      for (let cp = lo; cp <= hi; cp++) {
        const char = String.fromCodePoint(cp);
        let expected = special[char];
        if (expected === undefined) {
          expected = '';
          for (const piece of char.normalize('NFKD')) {
            if (/^\p{M}$/u.test(piece)) continue;
            const lower = piece.toLowerCase();
            if (/^[a-z]$/.test(lower)) expected += lower;
          }
        }
        expect(foldChar(char), `U+${cp.toString(16)} ${char}`).toBe(expected);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(600);
    for (const char of Object.keys(FOLD_TABLE)) {
      const cp = char.codePointAt(0)!;
      expect(FOLD_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi), char).toBe(true);
    }
  });

  it('does not count spaces or punctuation as skipped', () => {
    expect(foldLetters('  d o r m i t o r y  ').skipped).toBe(0);
    expect(foldLetters("Dor-mit'ory").skipped).toBe(0);
  });

  it('says which single characters are skipped, as foldLetters counts them', () => {
    for (const char of ['4', '½', 'Ж', '中', '\u{263A}']) expect(isSkipped(char), char).toBe(true);
    for (const char of ['a', 'Z', 'é', 'ß', ' ', "'", '-', '.', ',', '&', '’', '—']) expect(isSkipped(char), char).toBe(false);
    for (const [input, , skipped] of FOLD_CASES) {
      expect([...input].filter(isSkipped).length, input).toBe(skipped);
    }
  });
});

/** Code points, so no editor or tool can turn an escape into the character it names. */
const at = (code: number) => String.fromCodePoint(code);

/** `[input, words]` — mirrored in `text_words_are_split_on_whitespace_alone` in `counts.rs`. */
export const WORD_CASES: readonly (readonly [string, readonly string[]])[] = [
  ['apple sauce', ['apple', 'sauce']],
  ['  Apple\tSAUCE\n', ['apple', 'sauce']],
  ['applesauce', ['applesauce']],
  // A hyphen and an apostrophe carry no letters and end no word.
  ['apple-sauce', ['applesauce']],
  ["O'Brien Smith", ['obrien', 'smith']],
  // A piece that folds to nothing is not a word.
  ['apple & sauce 2026', ['apple', 'sauce']],
  ['Beyoncé Knowles', ['beyonce', 'knowles']],
  ['Straße 9', ['strasse']],
  [`apple${at(0xa0)}sauce`, ['apple', 'sauce']],
  [`apple${at(0x85)}sauce`, ['apple', 'sauce']],
  [`apple${at(0x2028)}sauce`, ['apple', 'sauce']],
  [`apple${at(0x3000)}sauce`, ['apple', 'sauce']],
  [`apple${at(0xfeff)}sauce`, ['apple', 'sauce']],
  // A zero-width space is not whitespace to Unicode, so it ends no word.
  [`apple${at(0x200b)}sauce`, ['applesauce']],
  ['', []],
  ['1234 !!', []],
];

/** Unicode White_Space, plus U+FEFF: the same list `counts.rs` checks Rust's against. */
const WORD_BREAKS = [
  0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x20, 0x85, 0xa0, 0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006,
  0x2007, 0x2008, 0x2009, 0x200a, 0x2028, 0x2029, 0x202f, 0x205f, 0x3000, 0xfeff,
];

describe('foldWords', () => {
  it.each(WORD_CASES)('splits %j', (input, words) => {
    expect(foldWords(input)).toEqual(words);
  });

  it('joins back to exactly the letters the search uses', () => {
    for (const [input] of [...FOLD_CASES, ...WORD_CASES]) {
      expect(foldWords(input).join('')).toBe(normalizeLetters(input));
    }
  });

  it('ends a word at the characters the engine ends one at, and no others', () => {
    const breaks = new Set(WORD_BREAKS);
    for (let code = 0; code <= 0xffff; code++) {
      if (code >= 0xd800 && code <= 0xdfff) continue;
      const words = foldWords(`a${at(code)}b`);
      expect(words.length === 2, `U+${code.toString(16).padStart(4, '0')}`).toBe(breaks.has(code));
    }
  });
});
