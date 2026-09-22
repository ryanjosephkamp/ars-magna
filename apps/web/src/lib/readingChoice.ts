/**
 * What one digit or symbol of the text may be read as, as the line under the
 * field offers it.
 *
 * The literal rule (D62): a character is itself by default, and nothing is
 * replaced unless the reader chooses it. Search offers one choice more than
 * Build does: a character may stand as itself *and* as its leet letter, two
 * searches merged, which is what `Query.leet` asks for (`$ as itself or s`).
 * Build checks one anagram, so there is one reading at a time and no such
 * choice. A fixed reading (`$ as s`) and `left out` are the same on both.
 *
 * The values are what a `<select>` carries; `readingOf` and `leetOf` turn the
 * chosen one back into the query's `reading` and `leet`.
 */
import { DROP, SEARCH_LEET_DEFAULT, SELF, lettersOf, readItems, type ReadItem, type Reading } from '@ars-magna/engine';

/** The value of the choice that reads a character as itself and as its letters. */
export const LEET = 'leet';

export type ReadingChoice = {
  /** `self`, `leet`, one of the character's letters, or `drop`. */
  readonly value: string;
  /** How the line reads it: `as itself`, `as itself or s`, `as s`, `left out`. */
  readonly text: string;
};

/** The leet choice's own line: `as itself or s`, `as itself, t or v`. */
function bothWays(letters: readonly string[]): string {
  if (letters.length === 1) return `as itself or ${letters[0]}`;
  return `as itself, ${letters.slice(0, -1).join(', ')} or ${letters.at(-1)}`;
}

/**
 * Every reading the line offers, in order: itself, itself with its letters
 * (Search only, and only where the character has one), each letter on its own,
 * and left out.
 */
export function choicesFor(item: ReadItem, leetOffered: boolean): ReadingChoice[] {
  const letters = item.offered.filter((o) => o.name !== SELF && o.name !== DROP).map((o) => o.name);
  const out: ReadingChoice[] = [{ value: SELF, text: item.offered[0]?.text ?? 'as itself' }];
  if (leetOffered && letters.length > 0) out.push({ value: LEET, text: bothWays(letters) });
  for (const o of item.offered.slice(1)) out.push({ value: o.name, text: o.text });
  return out;
}

/** Which choice the line shows: the reading in force, or the leet choice where the character stands as itself and as its letters. */
export function valueOf(item: ReadItem, leetOn: boolean): string {
  return item.reading === SELF && leetOn ? LEET : item.reading;
}

/** The reading a chosen value asks for: `self` for both of the itself choices. */
export function readingOf(value: string): string {
  return value === LEET ? SELF : value;
}

/** Whether a chosen value asks for the character's leet letters too. */
export function leetOf(value: string): boolean {
  return value === LEET;
}

/** The characters of the input that stand as themselves and could stand as a letter too. */
function leetable(input: string, reading: Reading): string[] {
  return readItems(input, reading)
    .filter((item) => item.reading === SELF && lettersOf(item.key).length > 0)
    .map((item) => item.key);
}

/**
 * The characters Search reads as themselves and as their leet letters before
 * the reader chooses otherwise: the accepted default is the three symbols
 * whose letter is plain (`$ ! @`), and digits off, since a digit in a text is
 * usually a number. Only characters the input has, and only where the reading
 * in force leaves them as themselves — a reader who fixed `$` as s, or left it
 * out, has chosen already.
 */
export function defaultLeet(input: string, reading: Reading = {}): string[] {
  return leetable(input, reading).filter((char) => SEARCH_LEET_DEFAULT.includes(char));
}

/**
 * The characters the query reads both ways: the reader's own choices where
 * they made one, this text's defaults everywhere else. Keeping the choices
 * rather than the set is what lets a new text take its own defaults while a
 * character the reader turned off stays off.
 */
export function leetFor(input: string, reading: Reading, chosen: Readonly<Record<string, boolean>>): string[] {
  return leetable(input, reading).filter((char) => chosen[char] ?? SEARCH_LEET_DEFAULT.includes(char));
}

/**
 * The choices behind a set of leet characters, for a link that names one:
 * nothing when the set is exactly this text's default, so a later text takes
 * its own, and every leetable character either way when it is not.
 */
export function chosenLeet(input: string, reading: Reading, leet: readonly string[]): Record<string, boolean> {
  const able = leetable(input, reading);
  const on = able.filter((char) => leet.includes(char));
  const fallback = defaultLeet(input, reading);
  if (on.length === fallback.length && on.every((char) => fallback.includes(char))) return {};
  return Object.fromEntries(able.map((char) => [char, on.includes(char)]));
}
