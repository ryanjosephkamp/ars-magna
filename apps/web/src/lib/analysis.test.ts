import { describe, expect, it } from 'vitest';
import { TAG_BIT, scoreOrder } from '@ars-magna/engine';
import { BANDS, bandOf, comparison, letterFigures, partsOf, wordFigures } from './analysis.ts';

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

  it('names the letter that is rarest in English, counting y as a consonant', () => {
    expect(letterFigures('dimoorrty').rarest).toBe('y');
    expect(letterFigures('quiz').rarest).toBe('z');
    expect(letterFigures('jazz').rarest).toBe('z');
    expect(letterFigures('aeiou').rarest).toBe('u');
    expect(letterFigures('').rarest).toBeNull();
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
