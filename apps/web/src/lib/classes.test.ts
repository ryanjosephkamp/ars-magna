import { describe, expect, it } from 'vitest';

import {
  CLASS_CHIP,
  CLASS_HINT,
  CLASS_LABEL,
  CLASS_ONE,
  CLASS_WORD,
  countUnit,
  inTableOrder,
  listOf,
  offerFor,
  offerWords,
  shownClasses,
} from './classes.ts';
import type { Term } from './terms.ts';

/** The class files as terms.json carries them, cut to what these tests need. */
const TERMS: Term[] = [
  { term: '&', class: 'symbols', reads: 'and', gloss: 'The ampersand, read as the word and.', trace: 'https://en.wiktionary.org/wiki/%26' },
  { term: '$', class: 'symbols', reads: 'dollars', gloss: 'The dollar sign.', trace: 'https://en.wiktionary.org/wiki/$' },
  { term: 'u', class: 'shorthand', reads: 'you', gloss: 'The letter u standing for you.', trace: 'https://en.wiktionary.org/wiki/u' },
  { term: '2', class: 'shorthand', reads: 'to', gloss: 'The digit 2 standing for to.', trace: 'https://en.wiktionary.org/wiki/2' },
  { term: 'b8', class: 'blends', reads: 'bait', gloss: 'Text-messaging spelling of bait.', trace: 'https://en.wiktionary.org/wiki/b8' },
  { term: 'wtf', class: 'acronyms', reads: 'what the fuck', gloss: 'Initialism.', trace: 'https://en.wiktionary.org/wiki/WTF', tone: 'crude', written: 'WTF' },
];

describe('the Terms control', () => {
  it('lists every class the dictionary carries terms of, in the plan’s table order, leet aside', () => {
    expect(shownClasses({ symbols: 6, shorthand: 9, blends: 15, acronyms: 13, names: 9463 })).toEqual([
      'numerals',
      'symbols',
      'shorthand',
      'blends',
      'acronyms',
      'names',
    ]);
    // Numerals need no terms: the engine makes them from the text's own digits.
    expect(shownClasses({})).toEqual(['numerals']);
    // Slang waits for its file; a class with no terms is not offered.
    expect(shownClasses({ slang: 0, names: 1 })).toEqual(['numerals', 'names']);
    expect(shownClasses({ slang: 3 })).toEqual(['numerals', 'slang']);
  });

  it('keeps the table’s order whatever order they were turned on in', () => {
    expect(inTableOrder(['names', 'numerals', 'blends'])).toEqual(['numerals', 'blends', 'names']);
  });

  it('names every class, for the control, the count line, a sentence and the panel’s chip', () => {
    for (const name of ['numerals', 'symbols', 'shorthand', 'blends', 'acronyms', 'leet', 'names', 'slang'] as const) {
      expect(CLASS_LABEL[name]).toMatch(/^[A-Z]/);
      // The count line's word is the class's own name, lowercase and without an article.
      expect(CLASS_WORD[name]).toBe(name === 'numerals' ? 'numerals' : CLASS_LABEL[name].toLowerCase());
      expect(CLASS_ONE[name]).toMatch(/^(a |an )?[a-z]/);
      expect(CLASS_CHIP[name]).not.toMatch(/^(a|an) /);
      // Every hint is a sentence, as PRODUCT.md asks of anything a reader sees.
      expect(CLASS_HINT[name]).toMatch(/^[A-Z].*\.$/);
      expect(CLASS_HINT[name]).not.toContain('!');
    }
  });
});

describe('the count line’s unit', () => {
  it('says anagrams alone for a search of words, and the classes once any is on', () => {
    expect(countUnit({ total: '115', classes: [], leet: [], offered: false })).toBe('anagrams');
    expect(countUnit({ total: '1', classes: [], leet: [], offered: false })).toBe('anagram');
    expect(countUnit({ total: '16', classes: ['shorthand', 'blends'], leet: [], offered: false })).toBe('anagrams with shorthand and blends');
    expect(countUnit({ total: '5', classes: [], leet: ['$'], offered: false })).toBe('anagrams with leet');
    expect(countUnit({ total: '5', classes: ['names'], leet: ['$'], offered: false })).toBe('anagrams with names and leet');
    // In the table's order, whatever order they were turned on in.
    expect(countUnit({ total: '5', classes: ['blends', 'numerals'], leet: [], offered: false })).toBe('anagrams with numerals and blends');
  });

  it('says which words the figure is of when a second figure sits beside it', () => {
    expect(countUnit({ total: '0', classes: [], leet: [], offered: true })).toBe('anagrams with known words');
    expect(countUnit({ total: '1', classes: [], leet: [], offered: true })).toBe('anagram with known words');
  });
});

describe('what the count line offers', () => {
  const base = { classes: [], leet: [], terms: TERMS, leetable: [] } as const;

  it('offers every class that could use a character nothing uses, and nothing else', () => {
    // "Blink-182": numerals make 182, shorthand lists 2, blends have b8.
    const offer = offerFor({ ...base, unused: '182', leetable: ['1', '8', '2'] });
    expect(offer).toEqual({ classes: ['numerals', 'shorthand', 'blends'], leet: [] });
    expect(offerWords(offer!)).toBe('numerals, shorthand or blends');
    // Names and acronyms are letters, so they can never answer a stranded digit.
    expect(offer?.classes).not.toContain('names');
    expect(offer?.classes).not.toContain('acronyms');
  });

  it('offers a symbol’s own class, and says so in the singular', () => {
    const offer = offerFor({ ...base, unused: '&' });
    expect(offer).toEqual({ classes: ['symbols'], leet: [] });
    expect(offerWords(offer!)).toBe('symbols');
  });

  it('offers nothing when every character is used, and nothing a class already on would add', () => {
    expect(offerFor({ ...base, unused: '' })).toBeNull();
    expect(offerFor({ ...base, unused: '&', classes: ['symbols'] })).toBeNull();
  });

  it('reaches for a leet reading only where no class could use the character', () => {
    // `!` is in no class file, so its letter is the one thing left to offer.
    const offer = offerFor({ ...base, unused: '!', leetable: ['!'] });
    expect(offer).toEqual({ classes: [], leet: ['!'] });
    expect(offerWords(offer!)).toBe('! as i');
    // With a class that can use the character, the offer does not also read it as a letter.
    expect(offerFor({ ...base, unused: '2', leetable: ['2'] })).toEqual({ classes: ['numerals', 'shorthand'], leet: [] });
    // A character already read both ways is not offered again.
    expect(offerFor({ ...base, unused: '!', leetable: ['!'], leet: ['!'] })).toBeNull();
  });

  it('names several leet characters together, and a character with two letters by both', () => {
    expect(offerWords({ classes: [], leet: ['1'] })).toBe('1 as i or l');
    expect(offerWords({ classes: ['numerals'], leet: ['!', '?'] })).toBe('numerals or ! and ? as letters');
  });
});

describe('a list of names', () => {
  it('joins with commas and a last word, and reads as one on its own', () => {
    expect(listOf(['shorthand', 'blends', 'leet'], 'or')).toBe('shorthand, blends or leet');
    expect(listOf(['shorthand', 'blends'], 'and')).toBe('shorthand and blends');
    expect(listOf(['blends'], 'and')).toBe('blends');
    expect(listOf([], 'and')).toBe('');
  });
});
