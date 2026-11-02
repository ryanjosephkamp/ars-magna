import { describe, expect, it } from 'vitest';

import type { Tier } from '@ars-magna/engine';

import {
  BUILD_COUNT_LIMIT_MS,
  COUNT_STEPS,
  addsNone,
  climb,
  countLine,
  countNotes,
  exportTotal,
  limitNote,
  nestCounts,
  nextTier,
  readTotal,
  stoppedAny,
  tierLine,
  tierOrder,
  type TextCount,
} from './textCount.ts';
import { clock } from './testClock.ts';

/** An engine that counts `rate` nodes a millisecond and finds `found(nodes)` anagrams in a budget, exactly `total` once `needs` nodes suffice. */
function engine(c: ReturnType<typeof clock>, rate: number, needs: number, total: string, found: (nodes: number) => string) {
  const asked: number[] = [];
  const ask = async (maxNodes: number) => {
    asked.push(maxNodes);
    await c.wait(Math.min(maxNodes, needs) / rate);
    return maxNodes >= needs ? total : `>${found(maxNodes)}`;
  };
  return { ask, asked };
}

describe('reading a rung', () => {
  it('tells an exact total from a floor, and a floor of nothing from both', () => {
    expect(readTotal('115')).toEqual({ kind: 'exact', total: '115' });
    expect(readTotal('>39233467955')).toEqual({ kind: 'floor', total: '39233467955' });
    expect(readTotal('>0')).toEqual({ kind: 'too-long' });
  });
});

describe('climbing the ladder', () => {
  it('answers a short text on the first rung', async () => {
    const c = clock();
    const e = engine(c, 1000, 30, '115', () => '0');
    const done = climb(e.ask, { wait: c.wait });
    await c.advance(1);
    expect(await done).toEqual({ count: { kind: 'exact', total: '115' }, timedOut: false });
    expect(e.asked).toEqual([COUNT_STEPS[0]]);
  });

  it('climbs past floors to the exact figure when it comes in time', async () => {
    const c = clock();
    // 100,000 nodes needed at 50 a millisecond: rungs of 10,000 and 40,000 leave floors.
    const e = engine(c, 50, 100_000, '119160863553', (n) => String(n * 10));
    const done = climb(e.ask, { wait: c.wait });
    await c.advance(BUILD_COUNT_LIMIT_MS);
    expect(await done).toEqual({ count: { kind: 'exact', total: '119160863553' }, timedOut: false });
    expect(e.asked).toEqual([10_000, 40_000, 160_000]);
  });

  it('keeps the last floor when the time runs out mid-rung, and says a rung is still running', async () => {
    const c = clock();
    // 50 nodes a millisecond, never exact: 10,000 at 200 ms, 40,000 at 1 s, 160,000 would end at 4.2 s.
    const e = engine(c, 50, Number.MAX_SAFE_INTEGER, '0', (n) => String(n * 1000));
    const done = climb(e.ask, { wait: c.wait });
    await c.advance(BUILD_COUNT_LIMIT_MS);
    expect(await done).toEqual({ count: { kind: 'floor', total: '40000000' }, timedOut: true });
    expect(e.asked).toEqual([10_000, 40_000, 160_000]);
  });

  it('says the text is too long when no rung found an anagram before the time ran out', async () => {
    const c = clock();
    // 160 letters: 10 nodes a millisecond, and not one whole anagram in 40,000 nodes.
    const e = engine(c, 10, Number.MAX_SAFE_INTEGER, '0', () => '0');
    const done = climb(e.ask, { wait: c.wait });
    await c.advance(BUILD_COUNT_LIMIT_MS);
    expect(await done).toEqual({ count: { kind: 'too-long' }, timedOut: true });
  });

  it('gives the floor of the last rung when every rung ends in time and none is exact', async () => {
    const c = clock();
    const e = engine(c, 1_000_000, Number.MAX_SAFE_INTEGER, '0', (n) => String(n));
    const done = climb(e.ask, { wait: c.wait, steps: [10, 20] });
    await c.advance(1);
    expect(await done).toEqual({ count: { kind: 'floor', total: '20' }, timedOut: false });
  });

  it('stops when the engine cannot say, or the count was abandoned', async () => {
    const c = clock();
    const asked: number[] = [];
    const done = climb(
      async (n) => {
        asked.push(n);
        return null;
      },
      { wait: c.wait },
    );
    expect(await done).toEqual({ count: { kind: 'failed' }, timedOut: false });
    expect(asked).toEqual([COUNT_STEPS[0]]);
  });
});

describe('the line', () => {
  it('reads as the page shows it', () => {
    expect(countLine({ kind: 'exact', total: '115' }, 'standard')).toBe('115 in Standard');
    expect(countLine({ kind: 'floor', total: '39233467955' }, 'common')).toBe('more than 39,233,467,955 in Common');
    expect(countLine({ kind: 'too-long' }, 'standard')).toBe(
      'The text is too long to count here; the page stops counting after 4 seconds.',
    );
    expect(countLine({ kind: 'too-long' }, 'standard', 1000)).toBe(
      'The text is too long to count here; the page stops counting after 1 second.',
    );
    expect(countLine({ kind: 'counting' }, 'standard')).toBe('Counting…');
    expect(countLine({ kind: 'none' }, 'standard')).toBe('—');
    expect(countLine({ kind: 'failed' }, 'standard')).toBe('Not counted');
  });

  it('exports a figure only when there is one', () => {
    expect(exportTotal({ kind: 'exact', total: '115' })).toBe('115');
    expect(exportTotal({ kind: 'floor', total: '5000' })).toBe('>5000');
    expect(exportTotal({ kind: 'too-long' })).toBeNull();
    expect(exportTotal({ kind: 'counting' })).toBeNull();
  });
});

describe('every dictionary', () => {
  it('counts the chosen dictionary first, then the rest narrowest first', () => {
    expect(tierOrder('standard')).toEqual(['standard', 'common', 'full', 'extended']);
    expect(tierOrder('extended')).toEqual(['extended', 'common', 'standard', 'full']);
  });

  it('gives each dictionary its figure alone, the label naming the dictionary', () => {
    expect(tierLine({ kind: 'exact', total: '115' })).toBe('115');
    expect(tierLine({ kind: 'floor', total: '1065799' })).toBe('more than 1,065,799');
    expect(tierLine({ kind: 'too-long' })).toBe('Too long to count here.');
    expect(tierLine({ kind: 'counting' })).toBe('Counting…');
  });

  it('says how long each count may take only when one stopped', () => {
    expect(stoppedAny([{ kind: 'exact', total: '1' }, { kind: 'counting' }])).toBe(false);
    expect(stoppedAny([{ kind: 'exact', total: '1' }, { kind: 'floor', total: '9' }])).toBe(true);
    expect(stoppedAny([{ kind: 'too-long' }])).toBe(true);
    expect(limitNote()).toBe('Each count stops after 4 seconds; “more than” means it stopped first.');
  });
});

const exact = (total: string): TextCount => ({ kind: 'exact', total });
const floor = (total: string, from?: Tier): TextCount => (from ? { kind: 'floor', total, from } : { kind: 'floor', total });
/** A narrower dictionary's exact count carried to one that was not counted, or stopped before it: at least this many. */
const atLeast = (total: string, from: Tier): TextCount => ({ kind: 'floor', total, from, inclusive: true });

describe('the dictionaries nest', () => {
  it('counts the chosen dictionary first, then narrowest to widest, skipping what a stop settles', () => {
    // Standard chosen and exact: the rest are counted in turn.
    expect(nextTier('standard', {})).toBe('standard');
    expect(nextTier('standard', { standard: exact('115') })).toBe('common');
    expect(nextTier('standard', { standard: exact('115'), common: exact('97') })).toBe('full');
    expect(nextTier('standard', { standard: exact('115'), common: exact('97'), full: exact('115'), extended: exact('115') })).toBeNull();
    // Standard stops: Common may still finish, and Full and Extended are settled.
    expect(nextTier('standard', { standard: floor('107') })).toBe('common');
    expect(nextTier('standard', { standard: floor('107'), common: floor('717903484') })).toBeNull();
    // Full stops once Common and Standard were exact: Extended is settled.
    expect(nextTier('common', { common: exact('58'), standard: exact('999'), full: { kind: 'too-long' } })).toBeNull();
  });

  it('still counts the narrower dictionaries when a wide one chosen stops, until one of them stops too', () => {
    expect(nextTier('extended', { extended: { kind: 'too-long' } })).toBe('common');
    expect(nextTier('extended', { extended: { kind: 'too-long' }, common: floor('717903484') })).toBeNull();
    expect(nextTier('extended', { extended: floor('4'), common: exact('2') })).toBe('standard');
    expect(nextTier('full', { full: floor('4'), common: exact('2'), standard: floor('3') })).toBeNull();
  });

  it('raises a wider floor to the narrower figure, and carries it to what was not counted', () => {
    // The 190-letter text as it read before: Common far past Standard, Full nothing.
    const before = nestCounts({ common: floor('7231191941'), standard: floor('4240612'), full: floor('4'), extended: { kind: 'too-long' } });
    expect(before).toEqual({
      common: floor('7231191941'),
      standard: floor('7231191941', 'common'),
      full: floor('7231191941', 'common'),
      extended: floor('7231191941', 'common'),
    });
    // Standard chosen and stopped, Common stopped: Full and Extended were never counted.
    expect(nestCounts({ standard: floor('107'), common: floor('717903484') })).toEqual({
      common: floor('717903484'),
      standard: floor('717903484', 'common'),
      full: floor('717903484', 'common'),
      extended: floor('717903484', 'common'),
    });
  });

  it('keeps a wider floor that is already larger, and never changes an exact count', () => {
    expect(nestCounts({ common: floor('10'), standard: floor('20'), full: exact('999'), extended: exact('999') })).toEqual({
      common: floor('10'),
      standard: floor('20'),
      full: exact('999'),
      extended: exact('999'),
    });
    expect(nestCounts({ common: exact('58'), standard: exact('999'), full: exact('999'), extended: exact('1000') }).standard).toEqual(exact('999'));
  });

  it('gives a stopped dictionary the narrower exact figure as at least, and none from a count of 0', () => {
    // The wider dictionary holds Common's 58 and may add nothing to them, so it has at least 58, not more than.
    expect(nestCounts({ common: exact('58'), standard: { kind: 'too-long' } })).toEqual({
      common: exact('58'),
      standard: atLeast('58', 'common'),
      full: atLeast('58', 'common'),
      extended: atLeast('58', 'common'),
    });
    expect(nestCounts({ common: exact('0'), standard: { kind: 'too-long' } })).toEqual({
      common: exact('0'),
      standard: { kind: 'too-long' },
      full: { kind: 'too-long', from: 'standard' },
      extended: { kind: 'too-long', from: 'standard' },
    });
  });

  it('keeps more than for an engine floor, own or carried, and at least only for an exact count carried', () => {
    // "the tragedy of king richard" at Extended on 2026-09-20: Standard exact, Full and Extended not counted.
    const carried = nestCounts({ extended: { kind: 'too-long' }, common: exact('306950980'), standard: exact('2479528284'), full: { kind: 'too-long' } });
    expect(carried.full).toEqual(atLeast('2479528284', 'standard'));
    expect(carried.extended).toEqual(atLeast('2479528284', 'standard'));
    expect(tierLine(carried.full)).toBe('at least 2,479,528,284');
    expect(countLine(carried.extended, 'extended')).toBe('at least 2,479,528,284 in Extended');
    // A floor the engine passed stays more than, and so does a floor carried from it.
    const floors = nestCounts({ standard: floor('107'), common: floor('717903484') });
    expect(floors.full).toEqual(floor('717903484', 'common'));
    expect(tierLine(floors.full)).toBe('more than 717,903,484');
    // A dictionary's own floor past the exact figure above it says more, and is what the next one reads.
    const past = nestCounts({ common: exact('58'), standard: floor('58'), full: { kind: 'too-long' } });
    expect(past.standard).toEqual(floor('58'));
    expect(past.full).toEqual(floor('58', 'standard'));
    expect(past.extended).toEqual(floor('58', 'standard'));
    // A dictionary's own floor short of the exact figure above it reads at least that figure.
    expect(nestCounts({ common: exact('58'), standard: floor('40') }).standard).toEqual(atLeast('58', 'common'));
    // The sentence under the lines says what at least means.
    expect(countNotes(carried)).toEqual([
      'Each count stops after 4 seconds; “more than” means it stopped first.',
      'Each dictionary holds every anagram of the ones above it.',
      'Once a count stops, the dictionaries below it are not counted and read its figure.',
      'A line that reads “at least” has the exact count of the one above, and may add nothing to it.',
    ]);
    expect(countNotes(floors)).not.toContain('A line that reads “at least” has the exact count of the one above, and may add nothing to it.');
  });

  it('reads counting for a dictionary still to come, and too long when the narrowest stopped with nothing', () => {
    expect(nestCounts({ standard: exact('115') })).toEqual({
      common: { kind: 'counting' },
      standard: exact('115'),
      full: { kind: 'counting' },
      extended: { kind: 'counting' },
    });
    expect(nestCounts({ extended: { kind: 'too-long' }, common: { kind: 'too-long' } })).toEqual({
      common: { kind: 'too-long' },
      standard: { kind: 'too-long', from: 'common' },
      full: { kind: 'too-long', from: 'common' },
      extended: { kind: 'too-long' },
    });
  });

  it('says a wider dictionary adds none when its exact count is the narrower one’s', () => {
    // "this is a test": 999 at Standard, Full and Extended is the exact count, not a cap.
    const counts = nestCounts({ common: exact('58'), standard: exact('999'), full: exact('999'), extended: exact('999') });
    expect(['common', 'standard', 'full', 'extended'].map((t) => addsNone(counts, t as Tier))).toEqual([false, false, true, true]);
    expect(tierLine(counts.full, addsNone(counts, 'full'))).toBe('999 · adds none');
    expect(tierLine(counts.standard, addsNone(counts, 'standard'))).toBe('999');
    // Floors say nothing about what a dictionary adds, and neither do two zeros.
    const floors = nestCounts({ common: floor('10'), standard: floor('10'), full: exact('0'), extended: exact('0') });
    expect(addsNone(floors, 'standard')).toBe(false);
    expect(addsNone(nestCounts({ common: exact('0'), standard: exact('0'), full: exact('0'), extended: exact('0') }), 'standard')).toBe(false);
  });

  it('writes the sentences the figures need, and none when every count is exact and different', () => {
    expect(countNotes(nestCounts({ common: exact('97'), standard: exact('115'), full: exact('120'), extended: exact('121') }))).toEqual([]);
    expect(countNotes(nestCounts({ common: exact('58'), standard: exact('999'), full: exact('999'), extended: exact('999') }))).toEqual([
      'Each dictionary holds every anagram of the ones above it.',
      'A line that reads “adds none” has no anagram the one above lacks.',
    ]);
    expect(countNotes(nestCounts({ standard: floor('107'), common: floor('717903484') }))).toEqual([
      'Each count stops after 4 seconds; “more than” means it stopped first.',
      'Each dictionary holds every anagram of the ones above it.',
      'Once a count stops, the dictionaries below it are not counted and read its figure.',
    ]);
    // A stop with nothing carried: the limit alone.
    expect(countNotes(nestCounts({ common: exact('97'), standard: exact('115'), full: exact('120'), extended: floor('121') }))).toEqual([
      'Each count stops after 4 seconds; “more than” means it stopped first.',
    ]);
  });

  it('exports a carried floor in the engine’s form', () => {
    expect(exportTotal(floor('717903484', 'common'))).toBe('>717903484');
    expect(exportTotal({ kind: 'too-long', from: 'common' })).toBeNull();
  });
});
