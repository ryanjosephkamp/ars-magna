import { describe, expect, it } from 'vitest';
import { TAG_BIT } from '@ars-magna/engine';

import { HIT_ORDERINGS, countOrderings, hitOrderings, nextOrdering, orderings } from './orderings.ts';

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

describe('a published hit\'s orderings', () => {
  it('lead with the hit\'s own order, rank the rest, stop at eight, and are none for words that read one way', () => {
    // Its own reading order first, even where another would score higher.
    expect(hitOrderings(['loser', 'natural'], [TAG_BIT.noun, TAG_BIT.adj | TAG_BIT.noun])).toEqual(['loser natural', 'natural loser']);
    const four = hitOrderings(['i', 'da', 'ai', 'doomer'], [0, 0, 0, 0]);
    expect(four).toHaveLength(HIT_ORDERINGS);
    expect(four[0]).toBe('i da ai doomer');
    expect(new Set(four).size).toBe(HIT_ORDERINGS);
    expect(hitOrderings(['married'], [TAG_BIT.verb])).toEqual([]);
    expect(hitOrderings(['pa', 'pa'], [0, 0])).toEqual([]);
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

describe('nextOrdering', () => {
  it('walks every ordering once and wraps back to the first', () => {
    const words = ['moon', 'star', 'er'];
    const seen: string[] = [];
    let current: readonly string[] = words;
    for (let i = 0; i < countOrderings(words); i++) {
      current = nextOrdering(words, current, 48);
      seen.push(current.join(' '));
    }
    expect(new Set(seen).size).toBe(6);
    expect(seen.at(-1)).toBe(words.join(' '));
    expect(seen.sort()).toEqual(phrases(orderings(words, 48)).sort());
  });

  it('starts from the front when the current order is not in the list', () => {
    const words = ['f', 'e', 'd', 'c', 'b', 'a'];
    const list = orderings(words, 3);
    // `b a c d e f` is a real arrangement but not among the first three.
    expect(phrases(list)).not.toContain('b a c d e f');
    expect(nextOrdering(words, ['b', 'a', 'c', 'd', 'e', 'f'], 3)).toEqual(list[0]);
  });

  it('follows the ranked order when masks are given, and skips nothing', () => {
    const words = ['dirty', 'room'];
    const masks = [1 << 4, 1 << 6];
    const first = nextOrdering(words, words, 48, masks);
    const second = nextOrdering(words, first, 48, masks);
    expect(first).toEqual(['room', 'dirty']);
    expect(second).toEqual(['dirty', 'room']);
  });

  it('is a copy, never the row itself', () => {
    const words = ['solo'];
    const next = nextOrdering(words, words, 48);
    expect(next).toEqual(['solo']);
    expect(next).not.toBe(words);
  });
});
