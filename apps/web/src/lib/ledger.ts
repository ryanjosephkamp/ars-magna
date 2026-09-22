/**
 * The Build page's ledger: the letters of a text, what an anagram of it has
 * used, and what is left over or missing.
 *
 * Both boxes fold as the search folds letters (`@ars-magna/engine`'s fold):
 * accents to their base letters; spaces, apostrophes, hyphens and punctuation
 * carry no letters and are ignored without a word; letters of other scripts
 * and other symbols are ignored too, and listed as skipped so the reader can
 * see they did not count. A digit or a symbol of the pool is a character the
 * search uses as itself (the literal rule); until the page's map and checks
 * count the pool (roadmap N5), the ledger lists each as skipped, so a reader
 * sees it did not count here, and a reading that leaves one out lists it too.
 * But an anagram counted over the letters alone has not used such a
 * character, and the search and the API refuse it, so the boxes do not match
 * while the text has one as itself: `unused` names them and the verdict says
 * so, and no submission is offered. Pure, so the tests run it without a page.
 */
import { NO_READING, foldChar, isPoolChar, isSkipped, readItems, readText, type Reading } from '@ars-magna/engine';

export type FoldedText = {
  /** Lowercase `[a-z]` only, in the order typed. */
  readonly letters: string;
  /**
   * The characters that carried something and were ignored, each once, in the
   * order first typed: a run of digits and symbols as typed (`90210`, `&`), a
   * character a reading left out (`4`), a letter of another script.
   */
  readonly skipped: readonly string[];
  /** How many characters of the text were skipped in all, every occurrence counted. */
  readonly skippedCount: number;
};

export function foldText(input: string, reading: Reading = NO_READING): FoldedText {
  let letters = '';
  const skipped: string[] = [];
  const read = readText(input, reading);
  let skippedCount = read.dropped;
  // A character a reading left out is listed once, as typed: `4`, `$`.
  for (const item of readItems(input, reading)) if (item.reading === 'drop' && !skipped.includes(item.key)) skipped.push(item.key);
  // A run of digits and symbols the search uses as itself is listed once, as typed (`90210`).
  let run = '';
  const endRun = () => {
    if (run.length > 0 && !skipped.includes(run)) skipped.push(run);
    run = '';
  };
  for (const char of read.text) {
    const folded = foldChar(char);
    if (isPoolChar(char)) {
      run += char;
      skippedCount++;
      continue;
    }
    endRun();
    if (folded.length > 0) letters += folded;
    else if (isSkipped(char)) {
      skippedCount++;
      if (!skipped.includes(char)) skipped.push(char);
    }
  }
  endRun();
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
  /**
   * The text's digits and symbols read as themselves, each once, in the order
   * first typed (`1 8 2` for "Blink-182"): characters an anagram must use
   * that the ledger, counting letters until N5, cannot see it use. One left
   * out by the reading is not here; it is skipped, and the anagram owes it nothing.
   */
  readonly unused: readonly string[];
  /** Both boxes have letters, they are the same letters, and the text has no character as itself the anagram cannot use. */
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
  const unused = readItems(text, reading)
    .filter((item) => item.reading === 'self')
    .map((item) => item.key);
  const match = t.letters.length > 0 && a.letters.length > 0 && extra.length === 0 && missing.length === 0 && unused.length === 0;
  return { text: t, anagram: a, tray, extra, missing, unused, match };
}

/** `1, 8 and 2`: the characters of the text an anagram must use, for a sentence. */
function listUnused(unused: readonly string[]): string {
  if (unused.length <= 1) return unused.join('');
  return `${unused.slice(0, -1).join(', ')} and ${unused.at(-1)}`;
}

/** The verdict when the letters match but the text has a character as itself the anagram has not used. */
export function unusedSentence(unused: readonly string[]): string {
  return `The anagram does not use the text's ${listUnused(unused)}.`;
}

/**
 * The one line under the anagram that says what is wrong: `2 extra a · 1
 * missing t`, extras first, a to z within each. With the letters right but a
 * digit or symbol of the text standing as itself, which no anagram of the
 * letters uses, the sentence that names them (`The anagram does not use the
 * text's 1, 8 and 2.`). On a match it says so with the count, `All 11 letters
 * used`; with no anagram yet, nothing.
 */
export function verdict(l: Ledger): string {
  if (l.anagram.letters.length === 0) return '';
  if (l.match) {
    const n = l.text.letters.length;
    return `All ${n.toLocaleString('en-US')} ${n === 1 ? 'letter' : 'letters'} used`;
  }
  if (l.extra.length === 0 && l.missing.length === 0 && l.unused.length > 0) return unusedSentence(l.unused);
  return [...l.extra.map((e) => `${e.count} extra ${e.letter}`), ...l.missing.map((m) => `${m.count} missing ${m.letter}`)].join(' · ');
}

/**
 * `11 letters`, with ` · 2 characters skipped: 4 &` when anything was skipped:
 * the characters counted, the entries listed (an item left out is one entry,
 * `90210`, of five characters). Empty for a box with nothing in it.
 */
export function lettersLine(f: FoldedText): string {
  const n = f.letters.length;
  if (n === 0 && f.skipped.length === 0) return '';
  const letters = `${n.toLocaleString('en-US')} ${n === 1 ? 'letter' : 'letters'}`;
  if (f.skipped.length === 0) return letters;
  const k = f.skippedCount;
  return `${letters} · ${k} ${k === 1 ? 'character' : 'characters'} skipped: ${f.skipped.join(' ')}`;
}

/**
 * The anagram as typed, character by character, each marked `extra` when it
 * spends a letter the text has run out of. Counted left to right, so of two
 * `a`s against one in the text, the second is the extra one. A character that
 * folds to two letters (`ß` is `ss`) is extra if either is.
 */
export function readBack(text: string, anagram: string): { char: string; extra: boolean }[] {
  const left = counts(foldText(text).letters);
  return [...anagram].map((char) => {
    let extra = false;
    for (const c of foldChar(char)) {
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
