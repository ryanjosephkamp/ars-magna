import { describe, expect, it } from 'vitest';
import type { RowTag } from '@ars-magna/engine';

import { formsFrom } from './forms.ts';
import { classesOf, leetReadingText, rowTerms, termClassesOf, termPhrase } from './rowTerms.ts';
import { isNumeral, termsFrom, writtenTerm, type Term } from './terms.ts';

const TERMS = termsFrom([
  { term: 'b8', class: 'blends', reads: 'bait', gloss: 'Text-messaging spelling of bait.', trace: 'https://en.wiktionary.org/wiki/b8' },
  { term: 'wtf', class: 'acronyms', reads: 'what the fuck', gloss: 'Initialism.', trace: 'https://en.wiktionary.org/wiki/WTF', tone: 'crude', written: 'WTF' },
] satisfies Term[]);

const FORMS = formsFrom([{ letters: 'dont', form: "don't", shown: true }]);

const tag = (classes: RowTag['classes'], written: string[], reading: Record<string, string> = {}): RowTag => ({ classes, written, reading });

describe('a row’s terms', () => {
  it('leaves every word a word when the row has no tag', () => {
    const list = rowTerms({ row: ['dirty', 'room'], shown: ['dirty', 'room'], tag: null, forms: FORMS, terms: TERMS });
    expect(list).toEqual([
      { word: 'dirty', display: 'dirty', termClass: null },
      { word: 'room', display: 'room', termClass: null },
    ]);
    expect(termPhrase(list)).toBe('dirty room');
    expect(classesOf(list)).toEqual([]);
  });

  it('shows a listed form for a word that has one', () => {
    const list = rowTerms({ row: ['dont'], shown: ['dont'], tag: null, forms: FORMS, terms: TERMS });
    expect(termPhrase(list)).toBe("don't");
  });

  it('names each term’s class and writes a term as its class writes it', () => {
    const row = ['1', '2', 'link', 'b8'];
    const list = rowTerms({
      row,
      shown: row,
      tag: tag(['shorthand', 'shorthand', null, 'blends'], ['1', '2', 'link', 'b8']),
      forms: FORMS,
      terms: TERMS,
    });
    expect(list.map((t) => t.termClass)).toEqual(['shorthand', 'shorthand', null, 'blends']);
    expect(termPhrase(list)).toBe('1 2 link b8');
    expect(classesOf(list)).toEqual(['shorthand', 'blends']);
    // What a promotion of the row records, keyed by the term, as a hit carries it.
    expect(termClassesOf(list)).toEqual({ '1': 'shorthand', '2': 'shorthand', b8: 'blends' });
  });

  it('gives an acronym the capitals its class file names', () => {
    const list = rowTerms({ row: ['wtf', 'a'], shown: ['a', 'wtf'], tag: tag(['acronyms', null], ['wtf', 'a']), forms: FORMS, terms: TERMS });
    expect(termPhrase(list)).toBe('a WTF');
    expect(list[1]).toEqual({ word: 'wtf', display: 'WTF', termClass: 'acronyms' });
  });

  it('follows the order the reader chose, taking each word’s own written form with it', () => {
    const row = ['shake', 'hakes'];
    const written = ['$hake', 'hakes'];
    const list = rowTerms({ row, shown: ['hakes', 'shake'], tag: tag(['leet', null], written), forms: FORMS, terms: TERMS });
    expect(termPhrase(list)).toBe('hakes $hake');
    expect(list.map((t) => t.termClass)).toEqual([null, 'leet']);
    // A word that carries a leet character is recorded under its own letters.
    expect(termClassesOf(list)).toEqual({ shake: 'leet' });
  });

  it('keeps two of the same word apart, the one that carries the character and the one that does not', () => {
    const row = ['as', 'as'];
    const list = rowTerms({ row, shown: row, tag: tag(['leet', null], ['a$', 'as']), forms: FORMS, terms: TERMS });
    expect(termPhrase(list)).toBe('a$ as');
  });

  it('says which character stands for which letter in a word the search wrote with one', () => {
    expect(leetReadingText('shake', '$hake')).toBe('$ as s');
    expect(leetReadingText('seven', 'se7en')).toBe('7 as v');
    expect(leetReadingText('assess', 'a$$e$$')).toBe('$ as s');
    expect(leetReadingText('shake', 'shake')).toBe('');
    expect(leetReadingText('shake', 'sh')).toBe('');
  });
});

describe('the class files as the page reads them', () => {
  it('knows a numeral from a listed term', () => {
    expect(isNumeral('182')).toBe(true);
    expect(isNumeral('0')).toBe(true);
    expect(isNumeral('b8')).toBe(false);
    expect(isNumeral('&')).toBe(false);
    expect(isNumeral('')).toBe(false);
  });

  it('writes a term as its file does, and leaves one it does not carry alone', () => {
    expect(writtenTerm(TERMS, 'wtf')).toBe('WTF');
    expect(writtenTerm(TERMS, 'b8')).toBe('b8');
    expect(writtenTerm(TERMS, '$hake')).toBe('$hake');
  });
});
