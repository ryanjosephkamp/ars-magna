import { describe, expect, it } from 'vitest';
import { countOrderings, orderings } from './orderings.ts';

const phrases = (rows: string[][]) => rows.map((row) => row.join(' '));

describe('countOrderings', () => {
  it('is k! when every word differs', () => {
    expect(countOrderings(['a'])).toBe(1);
    expect(countOrderings(['a', 'b'])).toBe(2);
    expect(countOrderings(['a', 'b', 'c'])).toBe(6);
    expect(countOrderings(['a', 'b', 'c', 'd'])).toBe(24);
    expect(countOrderings(['a', 'b', 'c', 'd', 'e', 'f'])).toBe(720);
  });

  it('divides out repeats', () => {
    // "pa pa" reads the same both ways round.
    expect(countOrderings(['pa', 'pa'])).toBe(1);
    expect(countOrderings(['a', 'a', 'b'])).toBe(3);
    expect(countOrderings(['a', 'a', 'b', 'b'])).toBe(6);
    expect(countOrderings(['a', 'a', 'a', 'b'])).toBe(4);
  });

  it('reports Infinity rather than an inexact number', () => {
    expect(countOrderings(Array.from({ length: 25 }, (_, i) => `w${i}`))).toBe(Infinity);
  });

  it('always agrees with what the generator produces', () => {
    const cases = [
      ['dirty', 'room'],
      ['a', 'b', 'c'],
      ['pa', 'pa'],
      ['x', 'x', 'y'],
      ['x', 'x', 'y', 'y'],
      ['moon', 'star', 'er'],
      ['q', 'q', 'q'],
    ];
    for (const words of cases) {
      expect(orderings(words, 10_000)).toHaveLength(countOrderings(words));
    }
  });
});

describe('orderings', () => {
  it('lists every arrangement once', () => {
    expect(phrases(orderings(['dirty', 'room'], 10)).sort()).toEqual([
      'dirty room',
      'room dirty',
    ]);
  });

  it('never repeats a phrase when words repeat', () => {
    const rows = phrases(orderings(['pa', 'pa'], 10));
    expect(rows).toEqual(['pa pa']);

    const mixed = phrases(orderings(['a', 'a', 'b'], 10));
    expect(mixed).toHaveLength(3);
    expect(new Set(mixed).size).toBe(3);
  });

  it('produces no duplicates for any input', () => {
    for (const words of [
      ['a', 'a', 'b', 'b'],
      ['x', 'x', 'x', 'y'],
      ['one', 'two', 'two', 'three'],
    ]) {
      const rows = phrases(orderings(words, 10_000));
      expect(new Set(rows).size).toBe(rows.length);
    }
  });

  it('leads with the order the row already shows', () => {
    // Alphabetically `room` sorts first, so without the reordering step the
    // user would see their row jump on open.
    expect(orderings(['dirty', 'room'], 10)[0]).toEqual(['dirty', 'room']);
    expect(orderings(['room', 'dirty'], 10)[0]).toEqual(['room', 'dirty']);
    expect(orderings(['zebra', 'apple', 'mango'], 10)[0]).toEqual(['zebra', 'apple', 'mango']);
  });

  it('keeps the row visible even when the cap truncates', () => {
    const words = ['f', 'e', 'd', 'c', 'b', 'a'];
    const rows = orderings(words, 3);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual(words);
  });

  it('preserves the exact words, only their order', () => {
    const words = ['moon', 'starer'];
    for (const row of orderings(words, 100)) {
      expect([...row].sort()).toEqual([...words].sort());
    }
  });

  it('handles the degenerate cases', () => {
    expect(orderings([], 10)).toEqual([]);
    expect(orderings(['solo'], 10)).toEqual([['solo']]);
    expect(orderings(['a', 'b'], 0)).toEqual([]);
  });
});
