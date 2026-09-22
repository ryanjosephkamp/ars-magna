/**
 * The items of an input, and how each stands: every distinct digit or symbol
 * of the pool. A digit is always an item; `@ $ & % + #` are items wherever
 * they stand (`$5` as `Ke$ha`), and `! ?` only inside a word, with a letter
 * on both sides, where they are characters rather than marks.
 *
 * The literal rule (roadmap phase N, decisions D62 and D63, accepted
 * 2026-09-21): an anagram rearranges what was typed, and nothing is
 * converted. An item reads as itself by default (`self`: the character is a
 * character of the pool, and a term of an anagram uses it as itself, the line
 * under the field saying `1 as itself`), as one of its leet letters (`$` as
 * s, `7` as t or v: the search puts the character back where the letter went
 * and says so), or as `drop`, left out, which is how every item was read
 * between the fix pull request and N3 and how the records made then still
 * read. A number is never read as its name, and a symbol never as a word.
 *
 * `readText` is what `fold.ts` folds; `readItems` is what the interface
 * lists and a record stores. The table (`readingsTable.ts`) is generated from
 * `scripts/readings.json`, and the Rust side (`crates/anagram-core/src/
 * readings.rs`) implements the same finder over the same table; both walk the
 * JSON's cases, so the two cannot drift. Overrides are keyed by the character
 * itself.
 *
 * No imports but the two generated tables, and nothing but strings: the
 * review desk inlines this file into its page after them.
 */
import { FOLD_TABLE } from './foldTable.ts';
import { CHARACTERS, type CharacterSpec } from './readingsTable.ts';

/** Item → reading name. Only what was chosen; the defaults fill the rest. */
export type Reading = Readonly<Record<string, string>>;

export const NO_READING: Reading = Object.freeze({});

/** One reading an item offers, as the interface lists it. */
export type Offered = {
  /** `self`, one of the character's letters, or `drop`. */
  readonly name: string;
  /** How it reads: `as itself`, `as s`, `left out`. */
  readonly text: string;
};

/** One distinct item of the input, with the reading in force. */
export type ReadItem = {
  /** The character, as the written form names it: `1`, `$`. */
  readonly key: string;
  /** The reading in force: the override if it names one offered, else the default. */
  readonly reading: string;
  /** The default reading for this item: `self`. */
  readonly default: string;
  /** Every reading the item offers, in the order the interface lists them: `self`, its letters, `drop`. */
  readonly offered: readonly Offered[];
  /** How many times the item occurs in the input. */
  readonly count: number;
  /** Characters the item spans, summed over its occurrences: what `drop` skips. One per occurrence, so the same as `count`. */
  readonly chars: number;
};

/** The reading that keeps the character as itself, the default, and its text. */
export const SELF = 'self';
export const AS_ITSELF = 'as itself';
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

/** The table's entry for a digit or symbol of the set, whatever stands around it. */
function symbol(char: string): CharacterSpec | undefined {
  return CHARACTERS[char];
}

/** Whether a character is a digit or a symbol of the pool's set, whatever stands around it. */
export function isPoolChar(char: string): boolean {
  return CHARACTERS[char] !== undefined;
}

/** The leet letters a pool character offers: `$` → `s`, `7` → `t v`, `&` → none. */
export function lettersOf(char: string): readonly string[] {
  return CHARACTERS[char]?.letters ?? [];
}

/** The text a reading shows: `as itself`, `as s`, `left out`. */
export function readingText(name: string): string {
  return name === SELF ? AS_ITSELF : name === DROP ? LEFT_OUT : `as ${name}`;
}

type Found = {
  /** Code unit range in the input. */
  start: number;
  end: number;
  char: string;
  spec: CharacterSpec;
};

/** Every item in the input, in order. */
function findItems(input: string): Found[] {
  const chars = [...input];
  const found: Found[] = [];
  const letterAt = (j: number): boolean => j >= 0 && j < chars.length && isLetter(chars[j]!);
  let offset = 0;
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]!;
    const start = offset;
    offset += c.length;
    const spec = symbol(c);
    if (!spec) continue;
    if (spec.insideWordOnly && !(letterAt(i - 1) && letterAt(i + 1))) continue;
    found.push({ start, end: offset, char: c, spec });
  }
  return found;
}

/** What the character offers, in the order the interface lists them. */
function offeredFor(spec: CharacterSpec): Offered[] {
  return [
    { name: SELF, text: AS_ITSELF },
    ...spec.letters.map((letter) => ({ name: letter, text: `as ${letter}` })),
    { name: DROP, text: LEFT_OUT },
  ];
}

/**
 * The reading in force for an item: an override that names a reading the item
 * offers, else `self`. An override naming anything else is ignored here (a
 * link cannot make the page convert) and refused by `readingProblem` (the
 * CLI, the API and the tools).
 */
function chosen(f: Found, overrides: Reading): { reading: string; offered: readonly Offered[] } {
  const offered = offeredFor(f.spec);
  const wanted = overrides[f.char];
  const reading = wanted !== undefined && offered.some((o) => o.name === wanted) ? wanted : SELF;
  return { reading, offered };
}

/**
 * The input with every item read: kept as itself, replaced by its letter, or
 * left out; a `!` or `?` that is punctuation dropped; everything else as
 * typed. What the fold then folds, so after this step every digit or symbol
 * of the set left in the text is an item read as itself. `dropped` counts the
 * characters of the items left out, for the skipped count under the field.
 */
export function readText(input: string, overrides: Reading = NO_READING): { text: string; dropped: number } {
  const chars = [...input];
  const letterAt = (j: number): boolean => j >= 0 && j < chars.length && isLetter(chars[j]!);
  let out = '';
  let dropped = 0;
  let changed = false;
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]!;
    const spec = symbol(c);
    if (!spec) {
      out += c;
      continue;
    }
    if (spec.insideWordOnly && !(letterAt(i - 1) && letterAt(i + 1))) {
      // Punctuation: a mark, not a character of the pool.
      changed = true;
      continue;
    }
    const { reading } = chosen({ start: 0, end: 0, char: c, spec }, overrides);
    if (reading === SELF) out += c;
    else {
      changed = true;
      if (reading === DROP) dropped++;
      else out += reading;
    }
  }
  return { text: changed ? out : input, dropped };
}

/**
 * The distinct items of the input, in order of first occurrence, each with
 * the reading in force: what a record stores and the interface lists.
 */
export function readItems(input: string, overrides: Reading = NO_READING): ReadItem[] {
  const out: ReadItem[] = [];
  for (const f of findItems(input)) {
    const index = out.findIndex((item) => item.key === f.char);
    if (index >= 0) {
      const item = out[index]!;
      out[index] = { ...item, count: item.count + 1, chars: item.chars + 1 };
      continue;
    }
    const { reading, offered } = chosen(f, overrides);
    out.push({ key: f.char, reading, default: SELF, offered, count: 1, chars: 1 });
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

/** Only the pairs that differ from the defaults: what a URL carries (`$:s`, `4:drop`). */
export function nonDefaultReading(input: string, overrides: Reading): Record<string, string> {
  return Object.fromEntries(
    readItems(input, overrides)
      .filter((item) => item.reading !== item.default)
      .map((item) => [item.key, item.reading]),
  );
}

/**
 * `$:s,4:drop` → the pairs, or null when the text is not written that way (a
 * pair without a colon, an empty item or name). An empty string is no
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
 * The reading in words, for a person: `1 as itself · $ as s · 4 left out`.
 * Empty for an input without items.
 */
export function describeReading(input: string, overrides: Reading = NO_READING): string {
  return readItems(input, overrides)
    .map((item) => `${item.key} ${readingText(item.reading)}`)
    .join(' · ');
}
