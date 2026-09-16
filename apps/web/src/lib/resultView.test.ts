import { describe, expect, it } from 'vitest';
import { applyView, isSortMode, matches, SORT_MODES, type SortMode } from './resultView.ts';
import { AUTO_LOAD_LIMIT, filterScope, filterWords, fitsLetters, searchAllLabel } from './filterScope.ts';

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

describe('filterScope', () => {
  const base = { filter: 'man', loaded: 250, total: '12345', letters: 'agentlemanxyz', mustInclude: [] as string[], known: ['man'] };

  it('covers everything when there is no filter or every result is loaded', () => {
    expect(filterScope({ ...base, filter: '   ' })).toEqual({ kind: 'all' });
    expect(filterScope({ ...base, loaded: 12345 })).toEqual({ kind: 'all' });
  });

  it('loads the rest of a list under the limit, whatever the filter is', () => {
    expect(filterScope({ ...base, total: '4999' })).toEqual({ kind: 'load-rest' });
    expect(filterScope({ ...base, total: '4999', filter: 'dirty ro' })).toEqual({ kind: 'load-rest' });
    expect(AUTO_LOAD_LIMIT).toBe(5000);
    expect(filterScope({ ...base, total: '5000' })).toEqual({ kind: 'must-include', words: ['man'] });
    expect(filterScope({ ...base, total: '5000', limit: 6000 })).toEqual({ kind: 'load-rest' });
  });

  it('offers Must include for a partial list when the filter is dictionary words that fit', () => {
    expect(filterScope({ ...base, filter: '  Elegant MAN ', known: ['elegant', 'man'] })).toEqual({ kind: 'must-include', words: ['elegant', 'man'] });
    // A floor is partial too.
    expect(filterScope({ ...base, total: '>1000000' })).toEqual({ kind: 'must-include', words: ['man'] });
  });

  it('keeps a substring filter on the loaded rows', () => {
    expect(filterScope({ ...base, filter: 'ma' , known: [] })).toEqual({ kind: 'loaded' });
    expect(filterScope({ ...base, filter: 'dirty ro', known: ['dirty'] })).toEqual({ kind: 'loaded' });
    expect(filterScope({ ...base, filter: "don't" })).toEqual({ kind: 'loaded' });
    // Not looked up yet: say what is true now.
    expect(filterScope({ ...base, known: null })).toEqual({ kind: 'loaded' });
  });

  it('offers only words the letters hold alongside Must include, and nothing Must include already has', () => {
    expect(filterScope({ ...base, filter: 'zebra', known: ['zebra'] })).toEqual({ kind: 'loaded' });
    expect(filterScope({ ...base, filter: 'man man', known: ['man'] })).toEqual({ kind: 'loaded' });
    expect(filterScope({ ...base, mustInclude: ['man'] })).toEqual({ kind: 'loaded' });
    expect(filterScope({ ...base, filter: 'man gent', mustInclude: ['man'], known: ['man', 'gent'] })).toEqual({ kind: 'must-include', words: ['gent'] });
  });
});

describe('filter words and the offer', () => {
  it('reads a filter as words only when it is letters and spaces', () => {
    expect(filterWords(' Dirty  room ')).toEqual(['dirty', 'room']);
    expect(filterWords('dirty-room')).toBeNull();
    expect(filterWords('')).toBeNull();
  });

  it('counts repeated letters when fitting words', () => {
    expect(fitsLetters('aaeeglmnnt', ['elegant', 'man'])).toBe(true);
    expect(fitsLetters('aaeeglmnnt', ['man', 'man'])).toBe(false);
  });

  it('names the words and the total exactly', () => {
    expect(searchAllLabel('12345', ['room'])).toBe('Search all 12,345 for anagrams containing “room”');
    expect(searchAllLabel('>1000000', ['dirty', 'room'])).toBe('Search them all for anagrams containing “dirty” and “room”');
    expect(searchAllLabel('9000', ['a', 'b', 'c'])).toBe('Search all 9,000 for anagrams containing “a”, “b” and “c”');
  });
});
