/**
 * The reading step has to agree with the Rust `read_input()` string for
 * string, so both walk the cases generated from `scripts/readings.json`.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { foldLetters, foldWords, normalizeLetters } from '../src/fold.ts';
import {
  cardinal,
  formatReading,
  fullReading,
  isReading,
  nonDefaultReading,
  ordinal,
  parseReading,
  readInput,
  readItems,
  readText,
  readingProblem,
  showWords,
  year,
} from '../src/readings.ts';
import * as table from '../src/readingsTable.ts';

const source = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../../scripts/readings.json'), 'utf8')) as {
  digits: Record<string, { names: string[]; letter?: string }>;
  teens: string[];
  tens: string[];
  hundred: string;
  thousand: string;
  ordinals: Record<string, string>;
  symbols: Record<string, { letter?: string; spell?: string; default: string; insideWordOnly: boolean }>;
  maxSpelledDigits: number;
  defaults: Record<string, string>;
  cases: [string, string, string][];
};

describe('the generated table', () => {
  it('is what scripts/readings.json says, so it was not hand-edited or left stale', () => {
    expect(table.DIGIT_NAMES).toEqual([...'0123456789'].map((d) => source.digits[d]!.names));
    expect(table.DIGIT_LETTERS).toEqual([...'0123456789'].map((d) => source.digits[d]!.letter ?? null));
    expect(table.TEENS).toEqual(source.teens);
    expect(table.TENS).toEqual(source.tens);
    expect(table.HUNDRED).toBe(source.hundred);
    expect(table.THOUSAND).toBe(source.thousand);
    expect(table.ORDINAL_IRREGULAR).toEqual(source.ordinals);
    expect(table.SYMBOLS).toEqual(source.symbols);
    expect(table.MAX_SPELLED_DIGITS).toBe(source.maxSpelledDigits);
    expect(table.READING_DEFAULTS).toEqual(source.defaults);
    expect(table.READING_CASES).toEqual(source.cases);
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

  it('counts the characters a dropped item spans', () => {
    expect(readText('Beverly Hills 90210')).toEqual({ text: 'Beverly Hills ', dropped: 5 });
    expect(readText('Charles Spencer, 9th Earl Spencer', { '9th': 'drop' }).dropped).toBe(3);
    expect(readText('1,000,000').dropped).toBe(9);
    expect(readText('Test 3 and 3', { '3': 'drop' }).dropped).toBe(2);
    expect(readText('Blink-182').dropped).toBe(0);
  });
});

describe('the names of numbers', () => {
  it('agree with a second, table-free spelling over 0 to 9999', () => {
    const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const belowHundred = (v: number) =>
      v < 10 ? ones[v]! : v < 20 ? teens[v - 10]! : v % 10 === 0 ? tens[v / 10]! : `${tens[Math.floor(v / 10)]} ${ones[v % 10]}`;
    for (let v = 0; v <= 9999; v++) {
      const parts: string[] = [];
      if (v >= 1000) parts.push(`${ones[Math.floor(v / 1000)]} thousand`);
      if (v % 1000 >= 100) parts.push(`${ones[Math.floor((v % 1000) / 100)]} hundred`);
      if (v % 100 > 0 || v === 0) parts.push(belowHundred(v % 100));
      expect(cardinal(v).join(' '), String(v)).toBe(parts.join(' '));
    }
  });

  it('make ordinals and years', () => {
    expect(ordinal(1).join(' ')).toBe('first');
    expect(ordinal(12).join(' ')).toBe('twelfth');
    expect(ordinal(20).join(' ')).toBe('twentieth');
    expect(ordinal(21).join(' ')).toBe('twenty first');
    expect(ordinal(100).join(' ')).toBe('one hundredth');
    expect(ordinal(1000).join(' ')).toBe('one thousandth');
    expect(year(1907)!.join(' ')).toBe('nineteen oh seven');
    expect(year(2026)!.join(' ')).toBe('twenty twenty six');
    expect(year(1900)!.join(' ')).toBe('nineteen hundred');
    expect(year(2005)!.join(' ')).toBe('twenty oh five');
    expect(year(1050)!.join(' ')).toBe('ten fifty');
    expect(year(2000)).toBeNull();
    expect(year(1000)).toBeNull();
  });

  it('are shown with the hyphen English writes', () => {
    expect(showWords(cardinal(182))).toBe('one hundred eighty-two');
    expect(showWords(cardinal(51))).toBe('fifty-one');
    expect(showWords(cardinal(20))).toBe('twenty');
    expect(showWords(ordinal(78))).toBe('seventy-eighth');
    expect(showWords(ordinal(21))).toBe('twenty-first');
    expect(showWords(year(2026)!)).toBe('twenty twenty-six');
    expect(showWords(year(2005)!)).toBe('twenty oh five');
    expect(showWords(year(1907)!)).toBe('nineteen oh seven');
    expect(showWords(cardinal(2020))).toBe('two thousand twenty');
  });
});

describe('readItems', () => {
  it('lists each distinct item once, in order, with what it offers', () => {
    const [two] = readItems('2 Fast 2 Furious');
    expect(two).toMatchObject({ key: '2', count: 2, chars: 2, reading: 'spell', default: 'spell' });
    expect(two!.offered.map((o) => [o.name, o.text, o.letters])).toEqual([
      ['spell', 'two', 'two'],
      ['to', 'to', 'to'],
      ['too', 'too', 'too'],
      ['drop', 'left out', ''],
    ]);

    const [blink] = readItems('Blink-182', { '182': 'digits' });
    expect(blink!.reading).toBe('digits');
    expect(blink!.offered.map((o) => o.text)).toEqual(['one hundred eighty-two', 'one eight two', 'left out']);

    expect(readItems('Como 1907')[0]!.offered.map((o) => o.text)).toEqual([
      'one thousand nine hundred seven',
      'one nine zero seven',
      'nineteen oh seven',
      'left out',
    ]);
    expect(readItems('1337')[0]!.offered.map((o) => o.name)).toEqual(['spell', 'digits', 'year', 'letter', 'drop']);
    expect(readItems('1337')[0]!.offered[3]).toEqual({ name: 'letter', text: 'ieet', letters: 'ieet' });
    expect(readItems('Bl1nk')[0]).toMatchObject({ reading: 'letter', default: 'letter' });
    expect(readItems('Beverly Hills 90210')[0]).toMatchObject({ reading: 'drop', offered: [{ name: 'digits' }, { name: 'drop' }], chars: 5 });
    expect(readItems('1,000')[0]).toMatchObject({ key: '1000', chars: 5 });
    expect(readItems('Hello! Ke$ha @ AT&T C++ 9th').map((i) => i.key)).toEqual(['$', '@', '&', '+', '9th']);
    expect(readItems('Ke$ha')[0]!.offered.map((o) => o.text)).toEqual(['s', 'left out']);
    expect(readItems('AT&T')[0]!.offered.map((o) => o.text)).toEqual(['and', 'left out']);
    expect(readItems('Me@Home')[0]!.offered.map((o) => o.text)).toEqual(['a', 'at', 'left out']);
    expect(readItems('9th')[0]!.offered.map((o) => o.text)).toEqual(['ninth', 'left out']);
    expect(readItems('no items')).toEqual([]);
  });

  it('records the full reading and writes the non-defaults', () => {
    expect(fullReading('2 Fast 2 Furious')).toEqual({ '2': 'spell' });
    expect(fullReading('Blink-182 vs 2', { '2': 'too' })).toEqual({ '182': 'spell', '2': 'too' });
    expect(fullReading('nothing')).toBeNull();
    expect(nonDefaultReading('Blink-182 vs 2', { '2': 'too' })).toEqual({ '2': 'too' });
    expect(nonDefaultReading('Blink-182', { '182': 'spell' })).toEqual({});
    // A pair the input lacks or the item does not offer is dropped, not kept.
    expect(nonDefaultReading('Blink-182', { '5': 'drop', '182': 'year' })).toEqual({});
  });
});

describe('the written form', () => {
  it('parses and formats item:name pairs', () => {
    expect(parseReading('')).toEqual({});
    expect(parseReading(' 2:too , 182:digits ')).toEqual({ '2': 'too', '182': 'digits' });
    expect(parseReading('182')).toBeNull();
    expect(parseReading(':x')).toBeNull();
    expect(parseReading('2:')).toBeNull();
    expect(formatReading({ '182': 'digits', '@': 'spell' })).toBe('182:digits,@:spell');
    expect(isReading({ '4': 'drop' })).toBe(true);
    expect(isReading({})).toBe(true);
    expect(isReading(['4'])).toBe(false);
    expect(isReading({ '4': 5 })).toBe(false);
    expect(isReading(null)).toBe(false);
  });

  it('names the problem with a pair', () => {
    expect(readingProblem('Blink-182', { '182': 'digits' })).toBeNull();
    expect(readingProblem('Blink-182', { '5': 'drop' })).toBe('the input has no 5 to read');
    expect(readingProblem('Blink-182', { '182': 'year' })).toBe('182 cannot be read as year; it offers spell, digits, drop');
  });
});

describe('the fold reads first', () => {
  it('folds the read text and counts the dropped items as skipped', () => {
    expect(normalizeLetters('Blink-182')).toBe('blinkonehundredeightytwo');
    expect(normalizeLetters('Reacher season 4', { '4': 'drop' })).toBe('reacherseason');
    expect(foldLetters('Beverly Hills 90210')).toEqual({ letters: 'beverlyhills', skipped: 5 });
    expect(foldLetters('Ke$ha', { $: 'drop' })).toEqual({ letters: 'keha', skipped: 1 });
    expect(foldWords('Area 51')).toEqual(['area', 'fifty', 'one']);
    expect(foldWords('2 Fast 2 Furious', { '2': 'too' })).toEqual(['too', 'fast', 'too', 'furious']);
    expect(foldWords('AT&T')).toEqual(['at', 'and', 't']);
  });
});
