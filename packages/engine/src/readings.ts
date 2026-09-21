/**
 * The reading of numbers and symbols: what turns `Blink-182` into the letters
 * of *blink one hundred eighty two* before the search sees it (roadmap phase
 * N, decisions D19 to D21).
 *
 * An **item** is a run of ASCII digits (`182`, `1,000` with its thousands
 * separators), a run of digits with its ordinal suffix (`9th`, `21st`), or one
 * of the symbols in the table (`@ $ ! & +`). Each item has a few **readings**
 * and a default:
 *
 * - on its own, a number is spelled as a whole (`spell`: one hundred eighty
 *   two), with digit by digit (`digits`), a year for four digits (`year`:
 *   nineteen oh seven), the keyboard letters where every digit has one
 *   (`letter`: 1337 → ieet), a homophone for a single digit (`to`, `too`,
 *   `for`, `ate`, `won`, `oh`) and `drop` as the alternatives;
 * - inside a word, with a letter on both sides, a digit stands for its
 *   keyboard letter (`Bl1nk` → blink), as `$` and `!` do (`Ke$ha`, `P!nk`);
 *   elsewhere those two are punctuation and not items at all;
 * - `@` stands for *a*, or is spelled *at*; `&` and `+` are spelled *and* and
 *   *plus*;
 * - a number of more than four digits is dropped unless read digit by digit.
 *
 * A spelled reading enters the text as its words, with a space on either side
 * wherever the neighbour is not one, so the text's own words are known (the
 * text itself is never its own result); a letter reading joins its
 * neighbours; a dropped item leaves nothing and counts as skipped. The result
 * is text with no items left in it, which `fold.ts` then folds as it always
 * has. `readInput` with no overrides is what `normalizeLetters`, `foldLetters`
 * and `foldWords` apply.
 *
 * The table (`readingsTable.ts`) is generated from `scripts/readings.json`,
 * and the Rust side (`crates/anagram-core/src/readings.rs`) implements the
 * same step over the same table; both walk the JSON's cases, so the two
 * cannot drift. Overrides are keyed by the item as `key` writes it: the digits
 * without separators plus the suffix, or the symbol itself; the written form
 * everywhere (a URL's `r=`, a record's `reading`, the CLI's `--read=`) is
 * `182:digits,2:too`.
 *
 * No imports but the two generated tables, and nothing but strings: the
 * review desk inlines this file into its page after them.
 */
import { FOLD_TABLE } from './foldTable.ts';
import {
  DIGIT_LETTERS,
  DIGIT_NAMES,
  HUNDRED,
  MAX_SPELLED_DIGITS,
  ORDINAL_IRREGULAR,
  SYMBOLS,
  TEENS,
  TENS,
  THOUSAND,
  type SymbolSpec,
} from './readingsTable.ts';

/** Item → reading name. Only what the reader chose; the defaults fill the rest. */
export type Reading = Readonly<Record<string, string>>;

export const NO_READING: Reading = Object.freeze({});

/** One reading an item offers, as the interface lists it. */
export type Offered = {
  /** `spell`, `digits`, `year`, `letter`, `drop`, or the homophone word. */
  readonly name: string;
  /** How it reads: `one hundred eighty-two`, `nineteen oh seven`, `ieet`, `a`, `left out`. */
  readonly text: string;
  /** The letters it contributes, `[a-z]` only. */
  readonly letters: string;
};

/** One distinct item of the input, with the reading in force. */
export type ReadItem = {
  /** The item as the written form names it: `182`, `9th`, `1000` for `1,000`, `@`. */
  readonly key: string;
  /** The reading in force: the override if it names one offered, else the default. */
  readonly reading: string;
  /** The default reading for this item where it stands. */
  readonly default: string;
  /** Every reading the item offers, in the order the interface lists them, `drop` last. */
  readonly offered: readonly Offered[];
  /** How many times the item occurs in the input. */
  readonly count: number;
  /** Characters the item spans, summed over its occurrences: what `drop` skips. */
  readonly chars: number;
};

/** The reading name of a dropped item, and the text the interface shows for it. */
export const DROP = 'drop';
export const LEFT_OUT = 'left out';

const A = 0x61;
const Z = 0x7a;
const UPPER_A = 0x41;
const UPPER_Z = 0x5a;

/** Whether a character carries a letter: ASCII, or one the fold table maps. */
export function isLetter(char: string): boolean {
  const code = char.charCodeAt(0);
  if (code < 0x80) return (code >= A && code <= Z) || (code >= UPPER_A && code <= UPPER_Z);
  return FOLD_TABLE[char] !== undefined;
}

function digitName(d: number): string {
  return DIGIT_NAMES[d]![0]!;
}

/** The cardinal's words, no "and": 182 → one hundred eighty two. Up to 9999. */
export function cardinal(value: number): string[] {
  let v = value;
  if (v === 0) return [digitName(0)];
  const words: string[] = [];
  if (v >= 1000) {
    words.push(digitName(Math.floor(v / 1000)), THOUSAND);
    v %= 1000;
  }
  if (v >= 100) {
    words.push(digitName(Math.floor(v / 100)), HUNDRED);
    v %= 100;
  }
  if (v >= 20) {
    words.push(TENS[Math.floor(v / 10) - 2]!);
    if (v % 10 !== 0) words.push(digitName(v % 10));
  } else if (v >= 10) {
    words.push(TEENS[v - 10]!);
  } else if (v > 0) {
    words.push(digitName(v));
  }
  return words;
}

/** The ordinal's words: the cardinal with its last word made ordinal. */
export function ordinal(value: number): string[] {
  const words = cardinal(value);
  const last = words.pop() ?? '';
  const irregular = ORDINAL_IRREGULAR[last];
  words.push(irregular ?? (last.endsWith('y') ? `${last.slice(0, -1)}ieth` : `${last}th`));
  return words;
}

/**
 * A four-digit number read as a year, or null where that reads as the
 * cardinal does (2000 is *two thousand* either way).
 */
export function year(value: number): string[] | null {
  const hi = Math.floor(value / 100);
  const lo = value % 100;
  const words = cardinal(hi);
  if (hi % 10 === 0) {
    // 1000, 2000, …: the cardinal already says "two thousand".
    if (lo === 0) return null;
  } else if (lo === 0) {
    words.push(HUNDRED);
    return words;
  }
  if (lo < 10) words.push(DIGIT_NAMES[0]![1]!, digitName(lo));
  else words.push(...cardinal(lo));
  return words;
}

/** The ordinal suffix a number takes: 1st, 2nd, 3rd, 4th, 11th, 12th, 13th, 21st. */
function suffixFor(digits: string): string {
  const lastTwo = Number(digits.slice(-2));
  const last = Number(digits.slice(-1));
  if (lastTwo >= 11 && lastTwo <= 13) return 'th';
  return last === 1 ? 'st' : last === 2 ? 'nd' : last === 3 ? 'rd' : 'th';
}

/**
 * How a spelled reading is shown: the tens and units joined with a hyphen
 * (`eighty-two`, `twenty-first`, `twenty twenty-six`), as English writes them.
 * The text the engine reads keeps them as two words.
 */
export function showWords(words: readonly string[]): string {
  const out: string[] = [];
  for (const word of words) {
    const previous = out[out.length - 1];
    if (previous && TENS.includes(previous) && !TENS.includes(word) && word !== HUNDRED && word !== THOUSAND && word !== 'oh') {
      out[out.length - 1] = `${previous}-${word}`;
    } else {
      out.push(word);
    }
  }
  return out.join(' ');
}

type Found = {
  /** Code unit range in the input. */
  start: number;
  end: number;
  /** The digits without separators, or empty for a symbol. */
  digits: string;
  /** The lowercase ordinal suffix, if the item is an ordinal. */
  suffix: string | null;
  symbol: SymbolSpec | null;
  symbolChar: string;
  /** A letter directly before and directly after. */
  insideWord: boolean;
};

function keyOf(f: Found): string {
  return f.symbol ? f.symbolChar : `${f.digits}${f.suffix ?? ''}`;
}

/** Every item in the input, in order. */
function findItems(input: string): Found[] {
  const chars = [...input];
  const found: Found[] = [];
  const letterAt = (j: number): boolean => j >= 0 && j < chars.length && isLetter(chars[j]!);
  // Code unit offsets, since the pieces are cut from the string.
  const offsets: number[] = [];
  let offset = 0;
  for (const c of chars) {
    offsets.push(offset);
    offset += c.length;
  }
  offsets.push(offset);
  let i = 0;
  while (i < chars.length) {
    const c = chars[i]!;
    if (c >= '0' && c <= '9') {
      const start = i;
      let digits = '';
      while (i < chars.length && chars[i]! >= '0' && chars[i]! <= '9') digits += chars[i++]!;
      // Thousands separators: `1,000`, `12,345,678`, never `1,2` or `1,2345`.
      if (digits.length <= 3) {
        const isDigit = (j: number) => j < chars.length && chars[j]! >= '0' && chars[j]! <= '9';
        while (i + 3 < chars.length && chars[i] === ',' && isDigit(i + 1) && isDigit(i + 2) && isDigit(i + 3) && !isDigit(i + 4)) {
          digits += chars[i + 1]! + chars[i + 2]! + chars[i + 3]!;
          i += 4;
        }
      }
      // An ordinal: the suffix the number takes, followed by no letter.
      let suffix: string | null = null;
      if (i + 1 < chars.length) {
        const two = (chars[i]! + chars[i + 1]!).toLowerCase();
        const wanted = suffixFor(digits);
        if (two === wanted && !letterAt(i + 2)) {
          suffix = wanted;
          i += 2;
        }
      }
      const insideWord = suffix === null && letterAt(start - 1) && letterAt(i);
      found.push({ start: offsets[start]!, end: offsets[i]!, digits, suffix, symbol: null, symbolChar: '', insideWord });
      continue;
    }
    const symbol = SYMBOLS[c];
    if (symbol) {
      const insideWord = letterAt(i - 1) && letterAt(i + 1);
      if (!symbol.insideWordOnly || insideWord) {
        found.push({ start: offsets[i]!, end: offsets[i + 1]!, digits: '', suffix: null, symbol, symbolChar: c, insideWord });
      }
    }
    i++;
  }
  return found;
}

/** What an item's reading puts into the text. */
type Piece = { words: string[] } | { letters: string } | null;

function pieceOf(f: Found, reading: string): Piece {
  if (f.symbol) {
    if (reading === 'letter') return { letters: f.symbol.letter ?? '' };
    if (reading === 'spell') return { words: [f.symbol.spell ?? ''] };
    return null;
  }
  const value = Number(f.digits);
  switch (reading) {
    case 'spell':
      return { words: f.suffix ? ordinal(value) : cardinal(value) };
    case 'digits':
      return { words: [...f.digits].map((d) => digitName(Number(d))) };
    case 'year':
      return { words: year(value) ?? [] };
    case 'letter':
      return { letters: [...f.digits].map((d) => DIGIT_LETTERS[Number(d)] ?? '').join('') };
    case DROP:
      return null;
    default:
      return { words: [reading] };
  }
}

function textOf(piece: Piece): string {
  if (piece === null) return LEFT_OUT;
  return 'words' in piece ? showWords(piece.words) : piece.letters;
}

function lettersOf(piece: Piece): string {
  if (piece === null) return '';
  return 'words' in piece ? piece.words.join('') : piece.letters;
}

/** The readings an item offers, in order, and its default. */
function offeredFor(f: Found): { offered: Offered[]; default: string } {
  const names: string[] = [];
  let fallback: string;
  if (f.symbol) {
    if (f.symbol.letter) names.push('letter');
    if (f.symbol.spell) names.push('spell');
    names.push(DROP);
    fallback = f.symbol.default;
  } else if (f.suffix) {
    names.push('spell', DROP);
    fallback = 'spell';
  } else {
    const n = f.digits.length;
    const spellable = n <= MAX_SPELLED_DIGITS;
    if (spellable) names.push('spell');
    if (n === 1) names.push(...DIGIT_NAMES[Number(f.digits)]!.slice(1));
    else names.push('digits');
    if (n === 4 && !f.digits.startsWith('0') && year(Number(f.digits)) !== null) names.push('year');
    const lettered = [...f.digits].every((d) => DIGIT_LETTERS[Number(d)] !== null);
    if (lettered) names.push('letter');
    names.push(DROP);
    fallback = f.insideWord && lettered ? 'letter' : spellable ? 'spell' : DROP;
  }
  return {
    offered: names.map((name) => {
      const piece = pieceOf(f, name);
      return { name, text: textOf(piece), letters: lettersOf(piece) };
    }),
    default: fallback,
  };
}

function chosen(f: Found, overrides: Reading): { reading: string; offered: Offered[]; default: string } {
  const { offered, default: fallback } = offeredFor(f);
  const wanted = overrides[keyOf(f)];
  const reading = wanted !== undefined && offered.some((o) => o.name === wanted) ? wanted : fallback;
  return { reading, offered, default: fallback };
}

/**
 * The input with every item read: no digits and no symbols of the set left,
 * the words of a spelled item set off by spaces. What the fold then folds.
 * `dropped` counts the characters of the items left out, for the skipped
 * count under the field.
 */
export function readText(input: string, overrides: Reading = NO_READING): { text: string; dropped: number } {
  const found = findItems(input);
  if (found.length === 0) return { text: input, dropped: 0 };
  let out = '';
  let dropped = 0;
  let at = 0;
  for (const f of found) {
    out += input.slice(at, f.start);
    const piece = pieceOf(f, chosen(f, overrides).reading);
    if (piece === null) {
      dropped += [...input.slice(f.start, f.end)].length;
    } else if ('letters' in piece) {
      out += piece.letters;
    } else {
      if (out.length > 0 && !/\s$/u.test(out)) out += ' ';
      out += piece.words.join(' ');
      if (f.end < input.length && !/^\s/u.test(input.slice(f.end))) out += ' ';
    }
    at = f.end;
  }
  return { text: out + input.slice(at), dropped };
}

/**
 * The distinct items of the input, in order of first occurrence, each with
 * the reading in force: what a record stores and the interface lists.
 */
export function readItems(input: string, overrides: Reading = NO_READING): ReadItem[] {
  const out: ReadItem[] = [];
  for (const f of findItems(input)) {
    const key = keyOf(f);
    const chars = [...input.slice(f.start, f.end)].length;
    const index = out.findIndex((item) => item.key === key);
    if (index >= 0) {
      const item = out[index]!;
      out[index] = { ...item, count: item.count + 1, chars: item.chars + chars };
      continue;
    }
    const { reading, offered, default: fallback } = chosen(f, overrides);
    out.push({ key, reading, default: fallback, offered, count: 1, chars });
  }
  return out;
}

/**
 * Why `overrides` cannot be the reading of `input`: an item the input lacks,
 * or a reading the item does not offer. Null when every pair is in order. The
 * interface ignores such a pair; the CLI, the API and the tools refuse it.
 */
export function readingProblem(input: string, overrides: Reading): string | null {
  const items = readItems(input, NO_READING);
  for (const [key, name] of Object.entries(overrides)) {
    const item = items.find((i) => i.key === key);
    if (!item) return `the input has no ${key} to read`;
    if (!item.offered.some((o) => o.name === name)) {
      return `${key} cannot be read as ${name}; it offers ${item.offered.map((o) => o.name).join(', ')}`;
    }
  }
  return null;
}

/**
 * The reading of every item the input has, defaults included: what a record
 * stores, so a later change of defaults cannot change what it means. Null
 * when the input has no items.
 */
export function fullReading(input: string, overrides: Reading = NO_READING): Record<string, string> | null {
  const items = readItems(input, overrides);
  if (items.length === 0) return null;
  return Object.fromEntries(items.map((item) => [item.key, item.reading]));
}

/** Only the pairs that differ from the defaults: what a URL carries. */
export function nonDefaultReading(input: string, overrides: Reading): Record<string, string> {
  return Object.fromEntries(
    readItems(input, overrides)
      .filter((item) => item.reading !== item.default)
      .map((item) => [item.key, item.reading]),
  );
}

/**
 * `182:digits,2:too` → the pairs, or null when the text is not written that
 * way (a pair without a colon, an empty item or name). An empty string is no
 * overrides.
 */
export function parseReading(text: string): Record<string, string> | null {
  const out: Record<string, string> = {};
  for (const pair of text.split(',')) {
    const trimmed = pair.trim();
    if (trimmed.length === 0) continue;
    const colon = trimmed.indexOf(':');
    if (colon < 0) return null;
    const key = trimmed.slice(0, colon).trim();
    const name = trimmed.slice(colon + 1).trim();
    if (key.length === 0 || name.length === 0) return null;
    out[key] = name;
  }
  return out;
}

/** The pairs as the written form has them, in the order given. */
export function formatReading(reading: Reading): string {
  return Object.entries(reading)
    .map(([key, name]) => `${key}:${name}`)
    .join(',');
}

/**
 * A reading object as a record may carry it: a plain object of strings, or
 * absent. Anything else is not a reading.
 */
export function isReading(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((v) => typeof v === 'string' && v.length > 0) &&
    Object.keys(value).every((k) => k.length > 0)
  );
}

/** The read text alone: the common case. */
export function readInput(input: string, overrides: Reading = NO_READING): string {
  return readText(input, overrides).text;
}

/**
 * The reading in words, for a person: `182 read as one hundred eighty-two ·
 * $ read as s · 90210 left out`. Empty for an input without items.
 */
export function describeReading(input: string, overrides: Reading = NO_READING): string {
  return readItems(input, overrides)
    .map((item) => {
      const chosen = item.offered.find((o) => o.name === item.reading);
      return chosen && chosen.text !== LEFT_OUT ? `${item.key} read as ${chosen.text}` : `${item.key} ${LEFT_OUT}`;
    })
    .join(' · ');
}
