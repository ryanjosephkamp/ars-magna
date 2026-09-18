/**
 * Build's letter charts, apart from how they are drawn: which of the five
 * steps of grey a count takes, the figure a bar shows on hover, focus or
 * selection, the name a screen reader gives it, and where the arrow keys move.
 *
 * Darkness carries the count and the one accent carries the reader's
 * selection (PRODUCT.md). Pure, so the tests run it without a page.
 */
import { foldChar } from '@ars-magna/engine';

/** How many steps the grey ramp has: `--color-count-1` (lightest) to `--color-count-5` (full ink). */
export const COUNT_STEPS = 5;

/**
 * The step a count takes, 1 to 5, against the largest count on either side:
 * one use is always the lightest, the largest count always full ink, and the
 * rest fall between in proportion. When every letter is used once, once is
 * the most there is, so it is full ink. 0 for a letter a side lacks: no bar.
 */
export function countStep(count: number, most: number): number {
  if (count <= 0) return 0;
  if (most <= 1) return COUNT_STEPS;
  return 1 + Math.round(((count - 1) / (most - 1)) * (COUNT_STEPS - 1));
}

/** A share of the side's letters: a whole percent, and one decimal under 1% (`0.5%`), which would otherwise read as 1% or 0%. */
export function share(count: number, total: number): string {
  if (total <= 0) return '0%';
  const percent = (count / total) * 100;
  // From 0.95 up, one decimal would read 1.0; it is 1% then.
  return `${percent > 0 && percent < 0.95 ? percent.toFixed(1) : Math.round(percent)}%`;
}

const number = (n: number) => n.toLocaleString('en-US');

/** What a bar's row shows on hover, focus or selection: `2 of 5 · 40%`. The row already begins with its letter. */
export function letterFigure(count: number, total: number): string {
  return `${number(count)} of ${number(total)} · ${share(count, total)}`;
}

/**
 * The bar's name for a screen reader: `l, 2 of 5 letters, 40%`, and, when the
 * English expectation is given, what the tick marks: `English would have 0.2`.
 */
export function letterName(letter: string, count: number, total: number, english?: number): string {
  const figure = `${letter}, ${number(count)} of ${number(total)} ${total === 1 ? 'letter' : 'letters'}, ${share(count, total)}`;
  return english === undefined ? figure : `${figure}, English would have ${englishFigure(english)}`;
}

/**
 * How wide, in characters, the figure column must be for every row of both
 * charts to show its figure without moving anything: the longest figure any
 * row can show.
 */
export function figureWidth(rows: readonly { readonly text: number; readonly anagram: number }[], totals: { readonly text: number; readonly anagram: number }): number {
  let widest = 0;
  for (const r of rows) {
    widest = Math.max(widest, letterFigure(r.text, totals.text).length, letterFigure(r.anagram, totals.anagram).length);
  }
  return widest;
}

/**
 * Where focus goes in a chart of `length` bars, from `at`, for a key: ↑ and ↓
 * move one, Home and End go to the ends, and it stops at the ends rather than
 * wrapping. Null for any other key, which the chart leaves alone.
 */
export function moveFocus(key: string, at: number, length: number): number | null {
  if (length === 0) return null;
  switch (key) {
    case 'ArrowDown':
      return Math.min(length - 1, at + 1);
    case 'ArrowUp':
      return Math.max(0, at - 1);
    case 'Home':
      return 0;
    case 'End':
      return length - 1;
    default:
      return null;
  }
}

/**
 * Whether a typed character is an occurrence of `letter`, folded as the search
 * folds it: `É` is an e, and `ß`, which folds to ss, is an s. The read-back
 * lines mark every occurrence of the selected letter with this.
 */
export function holdsLetter(char: string, letter: string | null): boolean {
  return letter !== null && foldChar(char).includes(letter);
}

/**
 * How many of `letter` English would put in `total` letters: its share of
 * English letters (`LETTER_FREQUENCY`) times the side's letters. The chart
 * marks it with a tick on the bar, so a letter used more or less than English
 * would use it stands out.
 */
export function englishCount(letter: string, total: number, frequency: Readonly<Record<string, number>>): number {
  return (total * (frequency[letter] ?? 0)) / 100;
}

/** `0.7`: an English expectation to one decimal, as the export and a screen reader give it. */
export function englishFigure(expected: number): string {
  return expected.toFixed(1);
}

/**
 * The scale both letter charts share, now with the English ticks on it: the
 * largest count on either side, or the largest English expectation when that
 * is larger, so every bar and every tick fits the same track.
 */
export function letterScale(
  rows: readonly { readonly letter: string; readonly text: number; readonly anagram: number }[],
  totals: { readonly text: number; readonly anagram: number },
  frequency: Readonly<Record<string, number>>,
): number {
  let top = 0;
  for (const r of rows) {
    top = Math.max(
      top,
      r.text,
      r.anagram,
      totals.text > 0 ? englishCount(r.letter, totals.text, frequency) : 0,
      totals.anagram > 0 ? englishCount(r.letter, totals.anagram, frequency) : 0,
    );
  }
  return top;
}
