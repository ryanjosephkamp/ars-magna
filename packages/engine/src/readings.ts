/**
 * The items of an input, and how each stands: a run of digits (`182`, `1,000`
 * with its separators), a run of digits with its ordinal suffix (`9th`,
 * `21st`), or one of the symbols in the table (`@ $ ! ? & % + #`; `!` and `?`
 * only inside a word, where they are characters rather than marks).
 *
 * The literal rule (roadmap phase N, decisions D62 and D63, accepted
 * 2026-09-21): an anagram rearranges what was typed, and nothing is converted.
 * A number is never read as its name, and a symbol never as a letter or a
 * word. Until the literal phase (N3) counts digits and symbols as characters
 * of the pool, every item is **left out** of the letters, and the line under
 * the field says so (`182 left out`); that is `drop`, the one reading this
 * module offers. The written form (`182:drop`, comma-joined), the record
 * field (`reading`, every item of the input) and the item finder stay for
 * N3, which adds `self` and the leet readings.
 *
 * `readText` is what `fold.ts` folds; `readItems` is what the interface
 * lists and a record stores. The table (`readingsTable.ts`) is generated from
 * `scripts/readings.json`, and the Rust side (`crates/anagram-core/src/
 * readings.rs`) implements the same finder over the same table; both walk the
 * JSON's cases, so the two cannot drift. Overrides are keyed by the item as
 * `key` writes it: the digits without separators plus the suffix, or the
 * symbol itself.
 *
 * No imports but the two generated tables, and nothing but strings: the
 * review desk inlines this file into its page after them.
 */
import { FOLD_TABLE } from './foldTable.ts';
import { SYMBOLS, type SymbolSpec } from './readingsTable.ts';

/** Item → reading name. Only what was chosen; the defaults fill the rest. */
export type Reading = Readonly<Record<string, string>>;

export const NO_READING: Reading = Object.freeze({});

/** One reading an item offers, as the interface lists it. */
export type Offered = {
  /** `drop`; the literal phase adds `self` and the leet letters. */
  readonly name: string;
  /** How it reads: `left out`. */
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
  /** Every reading the item offers, in the order the interface lists them. */
  readonly offered: readonly Offered[];
  /** How many times the item occurs in the input. */
  readonly count: number;
  /** Characters the item spans, summed over its occurrences: what `drop` skips. */
  readonly chars: number;
};

/** The reading name of an item left out, and the text the interface shows for it. */
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

/** The ordinal suffix a number takes: 1st, 2nd, 3rd, 4th, 11th, 12th, 13th, 21st. */
function suffixFor(digits: string): string {
  const lastTwo = Number(digits.slice(-2));
  const last = Number(digits.slice(-1));
  if (lastTwo >= 11 && lastTwo <= 13) return 'th';
  return last === 1 ? 'st' : last === 2 ? 'nd' : last === 3 ? 'rd' : 'th';
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
      found.push({ start: offsets[start]!, end: offsets[i]!, digits, suffix, symbol: null, symbolChar: '' });
      continue;
    }
    const symbol = SYMBOLS[c];
    if (symbol) {
      const insideWord = letterAt(i - 1) && letterAt(i + 1);
      if (!symbol.insideWordOnly || insideWord) {
        found.push({ start: offsets[i]!, end: offsets[i + 1]!, digits: '', suffix: null, symbol, symbolChar: c });
      }
    }
    i++;
  }
  return found;
}

/** The one reading every item offers today. */
const ONLY_DROP: readonly Offered[] = Object.freeze([{ name: DROP, text: LEFT_OUT, letters: '' }]);

/**
 * The reading in force for an item: an override that names a reading the item
 * offers, else the default. Today both are `drop`; an override naming anything
 * else is ignored here (a link cannot make the page convert) and refused by
 * `readingProblem` (the CLI, the API and the tools).
 */
function chosen(_f: Found, overrides: Reading, key: string): { reading: string; offered: readonly Offered[]; default: string } {
  const wanted = overrides[key];
  const reading = wanted !== undefined && ONLY_DROP.some((o) => o.name === wanted) ? wanted : DROP;
  return { reading, offered: ONLY_DROP, default: DROP };
}

/**
 * The input with every item left out: no digits and no symbols of the set
 * left, everything else as typed. What the fold then folds. `dropped` counts
 * the characters of the items left out, for the skipped count under the field.
 */
export function readText(input: string, overrides: Reading = NO_READING): { text: string; dropped: number } {
  const found = findItems(input);
  if (found.length === 0) return { text: input, dropped: 0 };
  let out = '';
  let dropped = 0;
  let at = 0;
  for (const f of found) {
    out += input.slice(at, f.start);
    chosen(f, overrides, keyOf(f));
    dropped += [...input.slice(f.start, f.end)].length;
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
    const { reading, offered, default: fallback } = chosen(f, overrides, key);
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

/** Only the pairs that differ from the defaults: what a URL carries. Empty today, since the one reading is the default. */
export function nonDefaultReading(input: string, overrides: Reading): Record<string, string> {
  return Object.fromEntries(
    readItems(input, overrides)
      .filter((item) => item.reading !== item.default)
      .map((item) => [item.key, item.reading]),
  );
}

/**
 * `182:drop,2:drop` → the pairs, or null when the text is not written that
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
 * The reading in words, for a person: `182 left out · $ left out`. Empty for
 * an input without items.
 */
export function describeReading(input: string, overrides: Reading = NO_READING): string {
  return readItems(input, overrides)
    .map((item) => `${item.key} ${LEFT_OUT}`)
    .join(' · ');
}
