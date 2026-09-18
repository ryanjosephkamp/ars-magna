import { describe, expect, it } from 'vitest';

import { countStep, figureWidth, holdsLetter, letterFigure, letterName, moveFocus, share } from './letterChart.ts';

describe('the step a count takes', () => {
  it('puts one use at the lightest step and the largest count at full ink', () => {
    // dormitory: the largest count is 2.
    expect([1, 2].map((n) => countStep(n, 2))).toEqual([1, 5]);
    expect([1, 2, 3].map((n) => countStep(n, 3))).toEqual([1, 3, 5]);
    expect([1, 2, 3, 4, 5].map((n) => countStep(n, 5))).toEqual([1, 2, 3, 4, 5]);
    // The 194-letter Dickens text: e, s and t are used 24 times.
    expect([1, 6, 12, 18, 24].map((n) => countStep(n, 24))).toEqual([1, 2, 3, 4, 5]);
  });

  it('makes once full ink when once is the most there is, and gives a missing letter no step', () => {
    expect(countStep(1, 1)).toBe(5);
    expect(countStep(0, 2)).toBe(0);
  });
});

describe('the figure', () => {
  it('reads count, of the side, and the share', () => {
    expect(letterFigure(2, 5)).toBe('2 of 5 · 40%');
    expect(letterFigure(2, 9)).toBe('2 of 9 · 22%');
    expect(letterFigure(0, 10)).toBe('0 of 10 · 0%');
  });

  it('gives a share under one percent a decimal, and groups thousands', () => {
    expect(share(1, 194)).toBe('0.5%');
    expect(share(1, 1000)).toBe('0.1%');
    expect(share(96, 10000)).toBe('1%');
    expect(share(1, 3)).toBe('33%');
    expect(share(0, 0)).toBe('0%');
    expect(letterFigure(12, 1024)).toBe('12 of 1,024 · 1%');
  });

  it('names the bar for a screen reader with its letter', () => {
    expect(letterName('l', 2, 5)).toBe('l, 2 of 5 letters, 40%');
    expect(letterName('a', 1, 1)).toBe('a, 1 of 1 letter, 100%');
  });

  it('keeps the figure column as wide as the longest figure either chart can show', () => {
    const rows = [
      { text: 1, anagram: 0 },
      { text: 24, anagram: 2 },
    ];
    // "24 of 194 · 12%" is the longest.
    expect(figureWidth(rows, { text: 194, anagram: 9 })).toBe('24 of 194 · 12%'.length);
    expect(figureWidth([], { text: 0, anagram: 0 })).toBe(0);
  });
});

describe('the arrow keys', () => {
  it('move one bar at a time, stop at the ends, and jump with Home and End', () => {
    expect(moveFocus('ArrowDown', 0, 3)).toBe(1);
    expect(moveFocus('ArrowDown', 2, 3)).toBe(2);
    expect(moveFocus('ArrowUp', 0, 3)).toBe(0);
    expect(moveFocus('ArrowUp', 2, 3)).toBe(1);
    expect(moveFocus('Home', 2, 3)).toBe(0);
    expect(moveFocus('End', 0, 3)).toBe(2);
  });

  it('leaves every other key alone', () => {
    expect(moveFocus('Enter', 1, 3)).toBeNull();
    expect(moveFocus('ArrowLeft', 1, 3)).toBeNull();
    expect(moveFocus('ArrowDown', 0, 0)).toBeNull();
  });
});

describe('an occurrence of the selected letter', () => {
  it('is found through accents and folds, and never when nothing is selected', () => {
    expect(holdsLetter('e', 'e')).toBe(true);
    expect(holdsLetter('É', 'e')).toBe(true);
    expect(holdsLetter('ß', 's')).toBe(true);
    expect(holdsLetter("'", 's')).toBe(false);
    expect(holdsLetter('e', null)).toBe(false);
  });
});
