import { describe, expect, it } from 'vitest';

import { MAP_LIMIT, letterMap, mapFits, mapLine } from './letterMap.ts';

describe('the letter map', () => {
  it('joins each letter of the text to its place in the anagram, repeats in order', () => {
    const map = letterMap('Dormitory', 'dirty room');
    // D o r m i t o r y  →  d i r t y _ r o o m
    expect(map.links.map((l) => [l.letter, l.fromChar, l.toChar])).toEqual([
      ['d', 0, 0],
      ['o', 1, 7],
      ['r', 2, 2],
      ['m', 3, 9],
      ['i', 4, 1],
      ['t', 5, 3],
      ['o', 6, 8],
      ['r', 7, 6],
      ['y', 8, 4],
    ]);
    expect(map.missing).toEqual([]);
    expect(map.extra).toEqual([]);
  });

  it('never crosses one letter’s own lines: the first o goes to the first o', () => {
    const map = letterMap('oo', 'oo');
    expect(map.links.map((l) => [l.fromChar, l.toChar])).toEqual([
      [0, 0],
      [1, 1],
    ]);
  });

  it('counts letters apart from spaces and punctuation, from 0', () => {
    const map = letterMap("it's", 'tis');
    expect(map.text[2]).toEqual({ char: "'", letters: '' });
    expect(map.links.find((l) => l.letter === 's')).toMatchObject({ fromChar: 3, from: 2, toChar: 2, to: 2 });
  });

  it('leaves a letter with no partner unjoined, on whichever side it is', () => {
    const map = letterMap('Dormitory', 'dirty rooms');
    expect(map.extra).toEqual([10]);
    expect(letterMap('Dormitory', 'dirty rom').missing).toEqual([6]);
  });

  it('folds accents and a letter that folds to two', () => {
    const map = letterMap('Café', 'face');
    expect(map.links.find((l) => l.letter === 'e')).toMatchObject({ fromChar: 3, toChar: 3 });
    const sharp = letterMap('ß', 'ss');
    expect(sharp.links.map((l) => [l.fromChar, l.toChar])).toEqual([
      [0, 0],
      [0, 1],
    ]);
  });

  it('is drawn for texts of up to 60 letters on either side', () => {
    expect(MAP_LIMIT).toBe(60);
    expect(mapFits(9, 9)).toBe(true);
    expect(mapFits(60, 60)).toBe(true);
    expect(mapFits(61, 60)).toBe(false);
    expect(mapFits(9, 0)).toBe(false);
  });

  it('writes the export’s line, counting letters from 1', () => {
    // The space in "dirty room" is not a letter: the o of room is the anagram's 7th letter.
    expect(mapLine(letterMap('Dormitory', 'dirty room'))).toBe('d 1→1 · o 2→7 · r 3→3 · m 4→9 · i 5→2 · t 6→4 · o 7→8 · r 8→6 · y 9→5');
    expect(mapLine(letterMap('ab', 'cd'))).toBe('—');
  });
});
