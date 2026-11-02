/**
 * The Build page's ledger: the characters of a text, what an anagram of it has
 * used, and what is left over or missing.
 *
 * Both boxes fold as the search folds a text (`@ars-magna/engine`'s fold):
 * accents to their base letters; spaces, apostrophes, hyphens and punctuation
 * carry nothing and are ignored without a word; letters of other scripts and
 * symbols outside the set are ignored too, and listed as skipped so the reader
 * can see they did not count. A digit or a symbol of the pool is a character
 * of the text as itself (the literal rule, D62), so the ledger counts it as it
 * counts a letter: "Blink-182" has eight characters, and an anagram of it must
 * use the 1, the 8 and the 2 — as a numeral, as shorthand, or in a blend. A
 * character a reading leaves out is skipped, and the anagram owes it nothing.
 * Pure, so the tests run it without a page.
 */
import { NO_READING, isPoolChar, isSkipped, poolChars, readItems, readText, type Reading } from '@ars-magna/engine';

export type FoldedText = {
  /** The pool: lowercase `[a-z]`, and the digits and symbols of the set as themselves, in the order typed. */
  readonly letters: string;
  /**
   * The characters that carried something and were ignored, each once, in the
   * order first typed: a character a reading left out (`4`), a letter of
   * another script, a symbol outside the set.
   */
  readonly skipped: readonly string[];
  /** How many characters of the text were skipped in all, every occurrence counted. */
  readonly skippedCount: number;
};

export function foldText(input: string, reading: Reading = NO_READING): FoldedText {
  const skipped: string[] = [];
  const read = readText(input, reading);
  let skippedCount = read.dropped;
  // A character a reading left out is listed once, as typed: `4`, `$`.
  for (const item of readItems(input, reading)) if (item.reading === 'drop' && !skipped.includes(item.key)) skipped.push(item.key);
  let letters = '';
  for (const { char, pool } of poolChars(input, reading)) {
    if (pool.length > 0) {
      letters += pool;
      continue;
    }
    if (isSkipped(char)) {
      skippedCount++;
      if (!skipped.includes(char)) skipped.push(char);
    }
  }
  return { letters, skipped, skippedCount };
}

/** One letter of the tray: how many the text has, and how many are left once the anagram has used some. */
export type TrayLetter = {
  readonly letter: string;
  /** In the text. */
  readonly have: number;
  /** `have` less what the anagram used; below zero when the anagram uses more than the text has. */
  readonly left: number;
};

export type LetterCount = { readonly letter: string; readonly count: number };

export type Ledger = {
  readonly text: FoldedText;
  readonly anagram: FoldedText;
  /** Every letter the text has or the anagram uses, a to z. */
  readonly tray: readonly TrayLetter[];
  /** Letters the anagram uses beyond what the text has, a to z. */
  readonly extra: readonly LetterCount[];
  /** Letters of the text the anagram has not used, a to z. */
  readonly missing: readonly LetterCount[];
  /** Both boxes have characters, and they are the same characters. */
  readonly match: boolean;
};

function counts(letters: string): Map<string, number> {
  const out = new Map<string, number>();
  for (const c of letters) out.set(c, (out.get(c) ?? 0) + 1);
  return out;
}

export function ledger(text: string, anagram: string, reading: Reading = NO_READING): Ledger {
  const t = foldText(text, reading);
  const a = foldText(anagram);
  const have = counts(t.letters);
  const used = counts(a.letters);
  const letters = [...new Set([...have.keys(), ...used.keys()])].sort();
  const tray = letters.map((letter) => {
    const n = have.get(letter) ?? 0;
    return { letter, have: n, left: n - (used.get(letter) ?? 0) };
  });
  const extra = tray.filter((l) => l.left < 0).map((l) => ({ letter: l.letter, count: -l.left }));
  const missing = tray.filter((l) => l.left > 0).map((l) => ({ letter: l.letter, count: l.left }));
  const match = t.letters.length > 0 && a.letters.length > 0 && extra.length === 0 && missing.length === 0;
  return { text: t, anagram: a, tray, extra, missing, match };
}

/**
 * The one line under the anagram that says what is wrong: `2 extra a · 1
 * missing t`, extras first, a to z within each, and a digit or a symbol of the
 * text named the same way (`1 missing 8`), since it is a character an anagram
 * must use. On a match it says so with the count, `All 11 characters used`;
 * with no anagram yet, nothing.
 */
export function verdict(l: Ledger): string {
  if (l.anagram.letters.length === 0) return '';
  if (l.match) {
    const n = l.text.letters.length;
    return `All ${n.toLocaleString('en-US')} ${characterWord(l.text.letters, n)} used`;
  }
  return [...l.extra.map((e) => `${e.count} extra ${e.letter}`), ...l.missing.map((m) => `${m.count} missing ${m.letter}`)].join(' · ');
}

/** `letters` or `characters`: a text with a digit or a symbol among them has characters, as the search field's line says. */
function characterWord(pool: string, n: number): string {
  const word = [...pool].some(isPoolChar) ? 'character' : 'letter';
  return n === 1 ? word : `${word}s`;
}

/**
 * `11 letters`, `8 characters` where a digit or a symbol is among them, with
 * ` · 2 characters skipped: 4 &` when anything was skipped: the characters
 * counted, the entries listed. Empty for a box with nothing in it.
 */
export function lettersLine(f: FoldedText): string {
  const n = f.letters.length;
  if (n === 0 && f.skipped.length === 0) return '';
  const letters = `${n.toLocaleString('en-US')} ${characterWord(f.letters, n)}`;
  if (f.skipped.length === 0) return letters;
  const k = f.skippedCount;
  return `${letters} · ${k} ${k === 1 ? 'character' : 'characters'} skipped: ${f.skipped.join(' ')}`;
}

/**
 * The anagram as typed, character by character, each marked `extra` when it
 * spends a character the text has run out of. Counted left to right, so of two
 * `a`s against one in the text, the second is the extra one. A character that
 * folds to two letters (`ß` is `ss`) is extra if either is, and a digit or a
 * symbol of the pool is counted as itself, since the text has it as itself.
 */
export function readBack(text: string, anagram: string, reading: Reading = NO_READING): { char: string; extra: boolean }[] {
  const left = counts(foldText(text, reading).letters);
  return poolChars(anagram).map(({ char, pool }) => {
    let extra = false;
    for (const c of pool) {
      const n = left.get(c) ?? 0;
      if (n > 0) left.set(c, n - 1);
      else extra = true;
    }
    return { char, extra };
  });
}

/**
 * `value` with `insert` put in place of the selection `start`..`end`, and where
 * the caret goes after it. Offsets are the textarea's, in UTF-16 units.
 */
export function insertAt(value: string, start: number, end: number, insert: string): { value: string; caret: number } {
  const from = Math.max(0, Math.min(start, end, value.length));
  const to = Math.min(value.length, Math.max(start, end, from));
  return { value: value.slice(0, from) + insert + value.slice(to), caret: from + insert.length };
}
