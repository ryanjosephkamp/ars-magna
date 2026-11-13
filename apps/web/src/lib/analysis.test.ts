import { describe, expect, it } from 'vitest';
import { TAG_BIT, scoreOrder } from '@ars-magna/engine';
import {
  BANDS,
  BAND_EDGES,
  bandOf,
  commonnessByWord,
  comparison,
  letterFigures,
  letterRows,
  mostUsedLine,
  partsOf,
  rarestLine,
  wordFigures,
  wordLengthRows,
  zipfPosition,
} from './analysis.ts';

/** The masks and frequency bytes the real dictionary gives these words. */
const MASK = {
  dirty: TAG_BIT.adj | TAG_BIT.noun | TAG_BIT.verb,
  room: TAG_BIT.noun | TAG_BIT.verb,
  moor: TAG_BIT.noun | TAG_BIT.verb,
  the: TAG_BIT.det,
  doomer: 0,
};
const ZIPF = { the: 204, room: 158, dirty: 139, dormitory: 100, onsen: 78, doomer: 0 };

describe('the letters', () => {
  it('counts them, the distinct ones and the vowels', () => {
    const f = letterFigures('dimoorrty');
    expect([f.count, f.distinct, f.vowels]).toEqual([9, 7, 3]);
    expect(letterFigures('').count).toBe(0);
  });

  it('names the letters that are rarest in English, ties and all, counting y as a consonant', () => {
    expect(letterFigures('dimoorrty').rarest).toEqual({ letters: ['y'], percent: 1.97 });
    expect(letterFigures('quiz').rarest).toEqual({ letters: ['z'], percent: 0.074 });
    expect(letterFigures('aeiou').rarest).toEqual({ letters: ['u'], percent: 2.76 });
    // j and x share a figure in the table: neither wins.
    expect(letterFigures('jinx').rarest).toEqual({ letters: ['j', 'x'], percent: 0.15 });
    // l is the rarest in English of h, e, l and o, whatever the text does with it.
    expect(letterFigures('hello').rarest).toEqual({ letters: ['l'], percent: 4.03 });
    expect(letterFigures('').rarest).toBeNull();
  });

  it('names the letters used most, ties and all, with the count', () => {
    expect(letterFigures('hello').mostUsed).toEqual({ letters: ['l'], count: 2 });
    expect(letterFigures('dormitory').mostUsed).toEqual({ letters: ['o', 'r'], count: 2 });
    // No letter of listen repeats, so none is named.
    expect(letterFigures('listen').mostUsed).toEqual({ letters: [], count: 1 });
    expect(letterFigures('').mostUsed).toBeNull();
  });

  it('reads the two letter lines as the page and the export show them', () => {
    expect(rarestLine(letterFigures('jinx'))).toBe('j x · 0.15%');
    expect(rarestLine(letterFigures('hello'))).toBe('l · 4.03%');
    expect(mostUsedLine(letterFigures('hello'))).toBe('l · 2');
    expect(mostUsedLine(letterFigures('dormitory'))).toBe('o r · 2');
    expect(mostUsedLine(letterFigures('listen'))).toBe('no letter repeats');
    expect(mostUsedLine(letterFigures('a'))).toBe('no letter repeats');
    expect(rarestLine(letterFigures(''))).toBe('—');
    expect(mostUsedLine(letterFigures(''))).toBe('—');
  });

  it('gives both charts the same rows, every letter of either side, and one scale', () => {
    // dormitory against "dirty rooms": the anagram has an s the text lacks.
    const { rows, most } = letterRows(letterFigures('dormitory'), letterFigures('dirtyrooms'));
    expect(rows.map((r) => r.letter)).toEqual(['d', 'i', 'm', 'o', 'r', 's', 't', 'y']);
    expect(rows.find((r) => r.letter === 's')).toEqual({ letter: 's', text: 0, anagram: 1 });
    expect(rows.find((r) => r.letter === 'o')).toEqual({ letter: 'o', text: 2, anagram: 2 });
    expect(most).toBe(2);
    // The scale is the larger side's: three a on the right against one on the left.
    expect(letterRows(letterFigures('ab'), letterFigures('aaab')).most).toBe(3);
    expect(letterRows(letterFigures(''), letterFigures(''))).toEqual({ rows: [], most: 0 });
  });

  it('lists every letter present, alphabetical, with its count', () => {
    expect(letterFigures('dirtyroom').histogram).toEqual([
      { letter: 'd', count: 1 },
      { letter: 'i', count: 1 },
      { letter: 'm', count: 1 },
      { letter: 'o', count: 2 },
      { letter: 'r', count: 2 },
      { letter: 't', count: 1 },
      { letter: 'y', count: 1 },
    ]);
  });
});

describe('how common a word is', () => {
  it('puts the dictionary’s frequency byte in a band a reader can read', () => {
    expect(bandOf(ZIPF.the)).toBe('everyday');
    expect(bandOf(ZIPF.room)).toBe('everyday');
    expect(bandOf(ZIPF.dirty)).toBe('common');
    expect(bandOf(ZIPF.dormitory)).toBe('uncommon');
    expect(bandOf(ZIPF.onsen)).toBe('rare');
    // A site addition has no frequency at all.
    expect(bandOf(ZIPF.doomer)).toBe('unknown');
    expect(BANDS).toEqual(['everyday', 'common', 'uncommon', 'rare', 'unknown']);
  });

  it('bands at the zipf boundaries the dictionary’s byte encodes', () => {
    // byte = (zipf + 1) * 24, so zipf 5, 4 and 3 are 144, 120 and 96.
    expect([bandOf(144), bandOf(143)]).toEqual(['everyday', 'common']);
    expect([bandOf(120), bandOf(119)]).toEqual(['common', 'uncommon']);
    expect([bandOf(96), bandOf(95)]).toEqual(['uncommon', 'rare']);
    expect(bandOf(1)).toBe('rare');
  });
});

describe('the words', () => {
  it('reads every part of speech a word can be, and none for a word the dictionary lacks', () => {
    expect(partsOf(MASK.dirty)).toEqual(['adj', 'noun', 'verb']);
    expect(partsOf(MASK.the)).toEqual(['det']);
    expect(partsOf(0)).toEqual([]);
    expect(partsOf(TAG_BIT.unknown)).toEqual([]);
  });

  it('counts the words, their average length, their parts of speech and their commonness', () => {
    const figures = wordFigures(['dirty', 'room'], [MASK.dirty, MASK.room], [ZIPF.dirty, ZIPF.room]);
    expect(figures.count).toBe(2);
    expect(figures.averageLength).toBe(4.5);
    // A word that can be two parts of speech is counted in both, commonest first.
    expect(figures.parts).toEqual([
      { tag: 'noun', count: 2 },
      { tag: 'verb', count: 2 },
      { tag: 'adj', count: 1 },
    ]);
    expect(figures.unknown).toBe(0);
    expect(figures.commonness).toEqual([
      { band: 'everyday', count: 1 },
      { band: 'common', count: 1 },
    ]);
  });

  it('counts a word with no part of speech as unknown, and missing answers as nothing known', () => {
    const figures = wordFigures(['i', 'da', 'ai', 'doomer'], [MASK.the, 0, 0, MASK.doomer], [0, 134, 115, ZIPF.doomer]);
    expect(figures.unknown).toBe(3);
    expect(figures.parts).toEqual([{ tag: 'det', count: 1 }]);
    expect(figures.commonness).toEqual([
      { band: 'common', count: 1 },
      { band: 'uncommon', count: 1 },
      { band: 'unknown', count: 2 },
    ]);
    // No answers yet: every word is unknown, and nothing throws.
    expect(wordFigures(['dirty'], [], []).unknown).toBe(1);
    expect(wordFigures([], [], [])).toMatchObject({ count: 0, averageLength: 0, parts: [], unknown: 0, commonness: [] });
  });
});

describe('the comparison', () => {
  const text = { words: ['dormitory'], masks: [MASK.room], zipf: [ZIPF.dormitory] };
  const anagram = { words: ['dirty', 'room'], masks: [MASK.dirty, MASK.room], zipf: [ZIPF.dirty, ZIPF.room] };

  it('puts the two side by side', () => {
    const c = comparison(text, anagram);
    expect(c.words).toEqual({ text: 1, anagram: 2 });
    expect(c.parts).toEqual([
      { tag: 'adj', text: 0, anagram: 1 },
      { tag: 'noun', text: 1, anagram: 2 },
      { tag: 'verb', text: 1, anagram: 2 },
    ]);
  });

  it('scores how each side reads by the same measure the engine orders results with', () => {
    const c = comparison(text, anagram);
    expect(c.reads.anagram).toBe(scoreOrder(anagram.words, anagram.masks));
    expect(c.reads.text).toBe(scoreOrder(text.words, text.masks));
    // `dirty room` is an adjective before a noun, which the table likes.
    expect(c.reads.anagram).toBeGreaterThan(0);
  });

  it('names the words both sides use, once each, in the text’s order', () => {
    const shared = comparison(
      { words: ['the', 'dirty', 'room', 'the'], masks: [], zipf: [] },
      { words: ['room', 'the', 'tidy'], masks: [], zipf: [] },
    ).shared;
    expect(shared).toEqual(['the', 'room']);
    expect(comparison(text, anagram).shared).toEqual([]);
  });
});

describe('word lengths', () => {
  it('runs from the shortest word on either side to the longest, with 0 for a length neither uses', () => {
    const { rows, most } = wordLengthRows(['dormitory'], ['dirty', 'room']);
    expect(rows.map((r) => r.length)).toEqual([4, 5, 6, 7, 8, 9]);
    expect(rows[0]).toEqual({ length: 4, text: 0, anagram: 1 });
    expect(rows.at(-1)).toEqual({ length: 9, text: 1, anagram: 0 });
    expect(rows[2]).toEqual({ length: 6, text: 0, anagram: 0 });
    expect(most).toBe(1);
    // One scale for both: three two-letter words on the right.
    expect(wordLengthRows(['ab'], ['ab', 'cd', 'ef']).most).toBe(3);
    expect(wordLengthRows([], [])).toEqual({ rows: [], most: 0 });
  });
});

describe('commonness word by word', () => {
  it('places each distinct word, in the order typed, from rare at 0 to everyday at 1', () => {
    const words = commonnessByWord(['the', 'dirty', 'room', 'the', 'doomer'], [204, 139, 158, 204, 0]);
    expect(words.map((w) => [w.word, w.band])).toEqual([
      ['the', 'everyday'],
      ['dirty', 'common'],
      ['room', 'everyday'],
      ['doomer', 'unknown'],
    ]);
    expect(words[0]!.position).toBeCloseTo(0.9375);
    expect(words[3]!.position).toBeNull();
  });

  it('keeps the scale fixed, whatever the text, with the band edges on it', () => {
    expect(zipfPosition(24)).toBe(0);
    expect(zipfPosition(216)).toBe(1);
    expect(zipfPosition(240)).toBe(1);
    expect(zipfPosition(120)).toBe(0.5);
    expect(BAND_EDGES).toEqual([0.375, 0.5, 0.625]);
  });
});
