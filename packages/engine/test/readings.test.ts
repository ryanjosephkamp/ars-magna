/**
 * The item finder has to agree with the Rust `read_input()` string for
 * string, so both walk the cases generated from `scripts/readings.json`.
 * Under the literal rule nothing is converted: an item is one distinct digit
 * or symbol of the pool, read as itself, as one of its leet letters, or left
 * out.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { foldLetters, foldWords, isSkipped, legacyLetters, normalizeLetters } from '../src/fold.ts';
import {
  describeReading,
  formatReading,
  fullReading,
  isPoolChar,
  isReading,
  lettersOf,
  nonDefaultReading,
  parseReading,
  readInput,
  readItems,
  readText,
  readingProblem,
  readingText,
} from '../src/readings.ts';
import * as table from '../src/readingsTable.ts';

const source = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../../scripts/readings.json'), 'utf8')) as {
  characters: Record<string, { insideWordOnly: boolean; letters: string[] }>;
  defaults: Record<string, string>;
  cases: [string, string, string][];
};

describe('the generated table', () => {
  it('is what scripts/readings.json says, so it was not hand-edited or left stale', () => {
    expect(table.CHARACTERS).toEqual(source.characters);
    expect(table.READING_DEFAULTS).toEqual(source.defaults);
    expect(table.READING_CASES).toEqual(source.cases);
    expect(Object.values(table.READING_DEFAULTS).every((d) => d === 'self')).toBe(true);
  });

  it('holds the ten digits and the symbols of the set, with the leet letters the plan lists', () => {
    expect(Object.keys(table.CHARACTERS).sort().join('')).toBe('!#$%&+0123456789?@');
    expect(lettersOf('1')).toEqual(['i', 'l']);
    expect(lettersOf('7')).toEqual(['t', 'v']);
    expect(lettersOf('6')).toEqual(['g', 'b']);
    expect(lettersOf('$')).toEqual(['s']);
    expect(lettersOf('&')).toEqual([]);
    expect(lettersOf('a')).toEqual([]);
    for (const [char, spec] of Object.entries(table.CHARACTERS)) {
      expect(isPoolChar(char), char).toBe(true);
      // `@ $ & % + #` are items wherever they stand (D62); `!` and `?` only inside a word.
      expect(spec.insideWordOnly, char).toBe('!?'.includes(char));
    }
    for (const char of ['a', '|', '~', '-', ' ', '©']) expect(isPoolChar(char), char).toBe(false);
  });
});

describe('readInput', () => {
  it.each(table.READING_CASES)('reads %j with %j', (input, overrides, expected) => {
    expect(readInput(input, parseReading(overrides)!)).toBe(expected);
  });

  it('is idempotent and keeps only the items read as themselves', () => {
    for (const [input, overrides] of table.READING_CASES) {
      const reading = parseReading(overrides)!;
      const read = readInput(input, reading);
      expect(readInput(read), read).toBe(read);
      for (const item of readItems(read)) {
        expect(item.reading, read).toBe('self');
        expect(readItems(input, reading).some((i) => i.key === item.key && i.reading === 'self'), `${read} kept ${item.key}`).toBe(true);
      }
    }
  });

  it('counts the characters a reading leaves out, and none it keeps', () => {
    expect(readText('Beverly Hills 90210')).toEqual({ text: 'Beverly Hills 90210', dropped: 0 });
    expect(readText('Beverly Hills 90210', { '0': 'drop' })).toEqual({ text: 'Beverly Hills 921', dropped: 2 });
    expect(readText('1,000,000', { '0': 'drop', '1': 'drop' })).toEqual({ text: ',,', dropped: 7 });
    expect(readText('Ke$ha', { $: 's' })).toEqual({ text: 'Kesha', dropped: 0 });
    expect(readText('Ke$ha', { $: 'drop' })).toEqual({ text: 'Keha', dropped: 1 });
    // Punctuation is not an item and not counted.
    expect(readText('Hello! World?')).toEqual({ text: 'Hello World', dropped: 0 });
    expect(readText('no items')).toEqual({ text: 'no items', dropped: 0 });
  });
});

describe('readItems', () => {
  it('lists each distinct character once, in order, as itself by default', () => {
    const [two] = readItems('2 Fast 2 Furious');
    expect(two).toMatchObject({ key: '2', count: 2, chars: 2, reading: 'self', default: 'self' });
    expect(two!.offered).toEqual([
      { name: 'self', text: 'as itself' },
      { name: 'z', text: 'as z' },
      { name: 'drop', text: 'left out' },
    ]);
    expect(readItems('Blink-182').map((i) => i.key)).toEqual(['1', '8', '2']);
    expect(readItems('Blink-182', { '8': 'drop', '1': 'l' }).map((i) => i.reading)).toEqual(['l', 'drop', 'self']);
    expect(readItems('Blink-182', { '182': 'drop' })[0]!.reading).toBe('self');
    expect(readItems('1,000').map((i) => [i.key, i.count])).toEqual([['1', 1], ['0', 3]]);
    // A run is its distinct digits; separators and an ordinal's suffix are letters or nothing.
    expect(readItems('Hello! Ke$ha wh?t @ AT&T C++ 50% #1 9th').map((i) => i.key)).toEqual(['$', '?', '@', '&', '+', '5', '0', '%', '#', '1', '9']);
    // A `$` is an item wherever it stands, offered as itself, as s, or left out; `!` and `?` only inside a word.
    expect(readItems('$5 off $h!t').map((i) => [i.key, i.count])).toEqual([['$', 2], ['5', 1], ['!', 1]]);
    expect(readItems('$5 off')[0]!.offered.map((o) => o.name)).toEqual(['self', 's', 'drop']);
    expect(readItems('Hello! what?')).toEqual([]);
    expect(readItems('1000th 10,000th 100,000th').map((i) => [i.key, i.count])).toEqual([['1', 3], ['0', 12]]);
    expect(readItems('no items')).toEqual([]);
  });

  it('records the full reading, and only the non-defaults for a link', () => {
    expect(fullReading('2 Fast 2 Furious')).toEqual({ '2': 'self' });
    expect(fullReading('Blink-182 vs 2', { '2': 'z' })).toEqual({ '1': 'self', '8': 'self', '2': 'z' });
    expect(fullReading('Blink-182', { '182': 'drop' })).toEqual({ '1': 'self', '8': 'self', '2': 'self' });
    expect(fullReading('nothing')).toBeNull();
    expect(nonDefaultReading('Blink-182 vs 2', { '2': 'self' })).toEqual({});
    expect(nonDefaultReading('Blink-182', { '5': 'drop', '1': 'spell' })).toEqual({});
    expect(nonDefaultReading('Blink-182', { '8': 'drop', '1': 'i' })).toEqual({ '1': 'i', '8': 'drop' });
    expect(nonDefaultReading('Reacher season 4', { '4': 'drop' })).toEqual({ '4': 'drop' });
  });
});

describe('the written form', () => {
  it('parses and formats item:name pairs', () => {
    expect(parseReading('')).toEqual({});
    expect(parseReading(' 2:drop , $:s ')).toEqual({ '2': 'drop', $: 's' });
    expect(parseReading('182')).toBeNull();
    expect(parseReading(':x')).toBeNull();
    expect(parseReading('2:')).toBeNull();
    expect(formatReading({ '1': 'i', '@': 'drop' })).toBe('1:i,@:drop');
    expect(isReading({ '4': 'drop' })).toBe(true);
    expect(isReading({})).toBe(true);
    expect(isReading(['4'])).toBe(false);
    expect(isReading({ '4': 5 })).toBe(false);
    expect(isReading(null)).toBe(false);
  });

  it('names the problem with a pair, and says the reading in words', () => {
    expect(readingProblem('Blink-182', { '1': 'drop', '8': 'b' })).toBeNull();
    expect(readingProblem('Blink-182', { '5': 'drop' })).toBe('the input has no 5 to read');
    expect(readingProblem('Blink-182', { '182': 'drop' })).toBe('the input has no 182 to read');
    expect(readingProblem('Blink-182', { '1': 'spell' })).toBe('1 cannot be read as spell; it offers self, i, l, drop');
    expect(readingProblem('Ke$ha', { $: 'z' })).toBe('$ cannot be read as z; it offers self, s, drop');
    expect(readingProblem('AT&T', { '&': 'a' })).toBe('& cannot be read as a; it offers self, drop');
    expect(describeReading('Blink-182 & 2')).toBe('1 as itself · 8 as itself · 2 as itself · & as itself');
    expect(describeReading('Ke$ha 4 4', { $: 's', '4': 'drop' })).toBe('$ as s · 4 left out');
    expect(describeReading('plain')).toBe('');
    expect([readingText('self'), readingText('s'), readingText('drop')]).toEqual(['as itself', 'as s', 'left out']);
  });
});

describe('the fold follows the reading', () => {
  it('keeps a character read as itself, folds a letter it is read as, and counts one left out as skipped', () => {
    expect(normalizeLetters('Blink-182')).toBe('blink182');
    expect(normalizeLetters('the 10,000th man')).toBe('the10000thman');
    expect(normalizeLetters('Reacher season 4', { '4': 'drop' })).toBe('reacherseason');
    expect(normalizeLetters('Ke$ha', { $: 's' })).toBe('kesha');
    expect(normalizeLetters('$5 off')).toBe('$5off');
    expect(normalizeLetters('$5 off', { $: 'drop' })).toBe('5off');
    expect(normalizeLetters('$hake', { $: 's' })).toBe('shake');
    expect(foldLetters('$5 off', { $: 'drop' })).toEqual({ letters: '5off', skipped: 1 });
    expect(normalizeLetters('h3llo l33t', { '3': 'e' })).toBe('helloleet');
    expect(foldLetters('Beverly Hills 90210')).toEqual({ letters: 'beverlyhills90210', skipped: 0 });
    expect(foldLetters('Beverly Hills 90210', { '0': 'drop' })).toEqual({ letters: 'beverlyhills921', skipped: 2 });
    expect(foldLetters('Ke$ha')).toEqual({ letters: 'ke$ha', skipped: 0 });
    expect(foldLetters('Ke$ha', { $: 'drop' })).toEqual({ letters: 'keha', skipped: 1 });
    expect(foldWords('Area 51')).toEqual(['area', '51']);
    expect(foldWords('Area 51', { '5': 'drop' })).toEqual(['area', '1']);
    expect(foldWords('2 Fast 2 Furious', { '2': 'drop' })).toEqual(['fast', 'furious']);
    expect(foldWords('AT&T')).toEqual(['at&t']);
    expect(isSkipped('4')).toBe(false);
  });

  it('keeps the fold from before phase N for records and the dictionary build', () => {
    expect(legacyLetters('18th BRICS summit')).toBe('thbricssummit');
    expect(legacyLetters('2nd')).toBe('nd');
    expect(legacyLetters('AT&T')).toBe('att');
    expect(legacyLetters('Vishwanath & Sons')).toBe('vishwanathsons');
    expect(legacyLetters('Ke$ha')).toBe('keha');
    expect(legacyLetters('$5 off')).toBe('off');
    expect(legacyLetters('P!nk wh?t')).toBe('pnkwht');
    expect(legacyLetters('Bl1nk 9/11 C++ 50% #1 @home')).toBe('blnkchome');
    expect(legacyLetters('Reacher season 4')).toBe('reacherseason');
  });
});
