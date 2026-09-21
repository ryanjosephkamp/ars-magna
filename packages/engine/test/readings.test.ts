/**
 * The item finder has to agree with the Rust `read_input()` string for
 * string, so both walk the cases generated from `scripts/readings.json`.
 * Under the literal rule nothing is converted: every item is left out.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { foldLetters, foldWords, legacyLetters, normalizeLetters } from '../src/fold.ts';
import {
  describeReading,
  formatReading,
  fullReading,
  isReading,
  nonDefaultReading,
  parseReading,
  readInput,
  readItems,
  readText,
  readingProblem,
} from '../src/readings.ts';
import * as table from '../src/readingsTable.ts';

const source = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../../scripts/readings.json'), 'utf8')) as {
  symbols: Record<string, { insideWordOnly: boolean }>;
  defaults: Record<string, string>;
  cases: [string, string, string][];
};

describe('the generated table', () => {
  it('is what scripts/readings.json says, so it was not hand-edited or left stale', () => {
    expect(table.SYMBOLS).toEqual(source.symbols);
    expect(table.READING_DEFAULTS).toEqual(source.defaults);
    expect(table.READING_CASES).toEqual(source.cases);
    expect(Object.values(table.READING_DEFAULTS).every((d) => d === 'drop')).toBe(true);
  });
});

describe('readInput', () => {
  it.each(table.READING_CASES)('reads %j with %j', (input, overrides, expected) => {
    expect(readInput(input, parseReading(overrides)!)).toBe(expected);
  });

  it('leaves no item behind and is idempotent', () => {
    for (const [input, overrides] of table.READING_CASES) {
      const read = readInput(input, parseReading(overrides)!);
      expect(readItems(read), read).toEqual([]);
      expect(readInput(read)).toBe(read);
    }
  });

  it('counts the characters an item spans', () => {
    expect(readText('Beverly Hills 90210')).toEqual({ text: 'Beverly Hills ', dropped: 5 });
    expect(readText('Charles Spencer, 9th Earl Spencer').dropped).toBe(3);
    expect(readText('1,000,000').dropped).toBe(9);
    expect(readText('the 10,000th man').dropped).toBe(8);
    expect(readText('Test 3 and 3').dropped).toBe(2);
    expect(readText('Ke$ha').dropped).toBe(1);
    expect(readText('Hello!').dropped).toBe(0);
    expect(readText('no items').dropped).toBe(0);
  });
});

describe('readItems', () => {
  it('lists each distinct item once, in order, left out', () => {
    const [two] = readItems('2 Fast 2 Furious');
    expect(two).toMatchObject({ key: '2', count: 2, chars: 2, reading: 'drop', default: 'drop' });
    expect(two!.offered).toEqual([{ name: 'drop', text: 'left out', letters: '' }]);
    expect(readItems('Blink-182', { '182': 'digits' })[0]!.reading).toBe('drop');
    expect(readItems('1,000')[0]).toMatchObject({ key: '1000', chars: 5 });
    expect(readItems('Hello! Ke$ha wh?t @ AT&T C++ 50% #1 9th').map((i) => i.key)).toEqual(['$', '?', '@', '&', '+', '50', '%', '#', '1', '9th']);
    expect(readItems('1000th 10,000th 100,000th').map((i) => [i.key, i.chars])).toEqual([['1000th', 6], ['10000th', 8], ['100000th', 9]]);
    expect(readItems('no items')).toEqual([]);
  });

  it('records the full reading and never writes a non-default', () => {
    expect(fullReading('2 Fast 2 Furious')).toEqual({ '2': 'drop' });
    expect(fullReading('Blink-182 vs 2', { '2': 'too' })).toEqual({ '182': 'drop', '2': 'drop' });
    expect(fullReading('nothing')).toBeNull();
    expect(nonDefaultReading('Blink-182 vs 2', { '2': 'drop' })).toEqual({});
    expect(nonDefaultReading('Blink-182', { '5': 'drop', '182': 'spell' })).toEqual({});
  });
});

describe('the written form', () => {
  it('parses and formats item:name pairs', () => {
    expect(parseReading('')).toEqual({});
    expect(parseReading(' 2:drop , 182:drop ')).toEqual({ '2': 'drop', '182': 'drop' });
    expect(parseReading('182')).toBeNull();
    expect(parseReading(':x')).toBeNull();
    expect(parseReading('2:')).toBeNull();
    expect(formatReading({ '182': 'drop', '@': 'drop' })).toBe('182:drop,@:drop');
    expect(isReading({ '4': 'drop' })).toBe(true);
    expect(isReading({})).toBe(true);
    expect(isReading(['4'])).toBe(false);
    expect(isReading({ '4': 5 })).toBe(false);
    expect(isReading(null)).toBe(false);
  });

  it('names the problem with a pair, and says the reading in words', () => {
    expect(readingProblem('Blink-182', { '182': 'drop' })).toBeNull();
    expect(readingProblem('Blink-182', { '5': 'drop' })).toBe('the input has no 5 to read');
    expect(readingProblem('Blink-182', { '182': 'spell' })).toBe('182 cannot be read as spell; it offers drop');
    expect(readingProblem('Blink-182', { '182': 'digits' })).toBe('182 cannot be read as digits; it offers drop');
    expect(describeReading('Blink-182 & 2')).toBe('182 left out · & left out · 2 left out');
    expect(describeReading('plain')).toBe('');
  });
});

describe('the fold leaves items out', () => {
  it('folds the letters and counts the items as skipped', () => {
    expect(normalizeLetters('Blink-182')).toBe('blink');
    expect(normalizeLetters('the 10,000th man')).toBe('theman');
    expect(normalizeLetters('Reacher season 4', { '4': 'drop' })).toBe('reacherseason');
    expect(foldLetters('Beverly Hills 90210')).toEqual({ letters: 'beverlyhills', skipped: 5 });
    expect(foldLetters('Ke$ha')).toEqual({ letters: 'keha', skipped: 1 });
    expect(foldWords('Area 51')).toEqual(['area']);
    expect(foldWords('2 Fast 2 Furious')).toEqual(['fast', 'furious']);
    expect(foldWords('AT&T')).toEqual(['att']);
  });

  it('keeps the fold from before phase N for records and the dictionary build', () => {
    expect(legacyLetters('18th BRICS summit')).toBe('thbricssummit');
    expect(legacyLetters('2nd')).toBe('nd');
    expect(legacyLetters('AT&T')).toBe('att');
    expect(legacyLetters('Ke$ha')).toBe('keha');
    expect(legacyLetters('Bl1nk 9/11')).toBe('blnk');
    expect(legacyLetters('Reacher season 4')).toBe('reacherseason');
  });
});
