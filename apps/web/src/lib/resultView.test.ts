import { describe, expect, it } from 'vitest';
import { applyView, isSortMode, matches, SORT_MODES, type SortMode } from './resultView.ts';

const rows = [
  ['dormitory'],
  ['dirty', 'room'],
  ['moor', 'dirty'],
  ['rid', 'moo', 'try'],
  ['torrid', 'yom'],
];

const phrases = (result: readonly (readonly string[])[]) => result.map((r) => r.join(' '));

describe('matches', () => {
  it('matches anywhere in the phrase, spaces included', () => {
    expect(matches(['dirty', 'room'], 'dirty ro')).toBe(true);
    expect(matches(['dirty', 'room'], 'room')).toBe(true);
    expect(matches(['dirty', 'room'], 'yroom')).toBe(false);
  });

  it('treats an empty filter as no filter', () => {
    expect(matches(['anything'], '')).toBe(true);
  });
});

describe('applyView', () => {
  it('returns the rows untouched when nothing is asked of it', () => {
    const result = applyView(rows, { filter: '', sort: 'default' });
    expect(result).toBe(rows);
  });

  it('filters case-insensitively', () => {
    expect(phrases(applyView(rows, { filter: 'DIRTY', sort: 'default' }))).toEqual([
      'dirty room',
      'moor dirty',
    ]);
  });

  it('trims the filter so a stray space does not blank the list', () => {
    expect(applyView(rows, { filter: '  room  ', sort: 'default' })).toHaveLength(1);
  });

  it('sorts alphabetically both ways', () => {
    const az = phrases(applyView(rows, { filter: '', sort: 'az' }));
    expect(az[0]).toBe('dirty room');
    expect(az).toEqual([...az].sort());
    expect(phrases(applyView(rows, { filter: '', sort: 'za' }))).toEqual([...az].reverse());
  });

  it('sorts by word count', () => {
    expect(applyView(rows, { filter: '', sort: 'fewest' }).map((r) => r.length)).toEqual([
      1, 2, 2, 2, 3,
    ]);
    expect(applyView(rows, { filter: '', sort: 'most' }).map((r) => r.length)).toEqual([
      3, 2, 2, 2, 1,
    ]);
  });

  it('sorts by the longest word in each result', () => {
    const result = applyView(rows, { filter: '', sort: 'longest' });
    expect(result[0]).toEqual(['dormitory']);
    const longest = result.map((r) => Math.max(...r.map((w) => w.length)));
    expect(longest).toEqual([...longest].sort((a, b) => b - a));
  });

  it('breaks ties deterministically', () => {
    // Same sort applied to a shuffled input must land in the same order, or
    // rows would appear to reshuffle themselves between renders.
    const shuffled = [rows[3]!, rows[0]!, rows[4]!, rows[2]!, rows[1]!];
    for (const sort of SORT_MODES.filter((m) => m !== 'default')) {
      expect(phrases(applyView(shuffled, { filter: '', sort }))).toEqual(
        phrases(applyView(rows, { filter: '', sort })),
      );
    }
  });

  it('never invents or loses rows', () => {
    for (const sort of SORT_MODES) {
      const result = applyView(rows, { filter: '', sort: sort as SortMode });
      expect(result).toHaveLength(rows.length);
      expect(phrases(result).sort()).toEqual(phrases(rows).sort());
    }
  });

  it('does not mutate the input', () => {
    const original = phrases(rows);
    applyView(rows, { filter: '', sort: 'za' });
    expect(phrases(rows)).toEqual(original);
  });

  it('combines filtering and sorting', () => {
    expect(phrases(applyView(rows, { filter: 'o', sort: 'az' }))).toEqual([
      'dirty room',
      'dormitory',
      'moor dirty',
      'rid moo try',
      'torrid yom',
    ]);
  });

  it('copes with a sparse array from an out-of-order batch', () => {
    // The result buffer writes by index, so a gap is possible mid-load. Sorting
    // is the dangerous case: spreading a sparse array yields `undefined` holes
    // that would throw inside the comparator.
    const sparse: (readonly string[])[] = [];
    sparse[0] = ['dirty', 'room'];
    sparse[3] = ['torrid', 'yom'];

    for (const sort of SORT_MODES) {
      for (const filter of ['', 'o']) {
        expect(() => applyView(sparse, { filter, sort })).not.toThrow();
      }
    }

    expect(phrases(applyView(sparse, { filter: 'o', sort: 'az' }))).toEqual([
      'dirty room',
      'torrid yom',
    ]);
    expect(phrases(applyView(sparse, { filter: '', sort: 'az' }))).toEqual([
      'dirty room',
      'torrid yom',
    ]);
  });
});

describe('isSortMode', () => {
  it('accepts only real modes', () => {
    expect(isSortMode('az')).toBe(true);
    expect(isSortMode('default')).toBe(true);
    expect(isSortMode('sideways')).toBe(false);
  });
});
