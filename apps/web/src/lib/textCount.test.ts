import { describe, expect, it } from 'vitest';

import { BUILD_COUNT_LIMIT_MS, COUNT_STEPS, climb, countLine, exportTotal, limitNote, readTotal, stoppedAny, tierLine, tierOrder } from './textCount.ts';

/**
 * A clock the test moves by hand: `wait` resolves once `advance` has passed
 * its time, and an engine answers a rung after as long as that rung costs.
 */
function clock() {
  let now = 0;
  const timers: { at: number; resolve: () => void }[] = [];
  const settle = async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  };
  return {
    wait: (ms: number) => new Promise<void>((resolve) => timers.push({ at: now + ms, resolve })),
    async advance(ms: number) {
      const until = now + ms;
      for (;;) {
        const next = timers.filter((t) => t.at <= until).sort((a, b) => a.at - b.at)[0];
        if (!next) break;
        now = next.at;
        timers.splice(timers.indexOf(next), 1);
        next.resolve();
        await settle();
      }
      now = until;
      await settle();
    },
  };
}

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
    expect(readTotal('116')).toEqual({ kind: 'exact', total: '116' });
    expect(readTotal('>39233467955')).toEqual({ kind: 'floor', total: '39233467955' });
    expect(readTotal('>0')).toEqual({ kind: 'too-long' });
  });
});

describe('climbing the ladder', () => {
  it('answers a short text on the first rung', async () => {
    const c = clock();
    const e = engine(c, 1000, 30, '116', () => '0');
    const done = climb(e.ask, { wait: c.wait });
    await c.advance(1);
    expect(await done).toEqual({ count: { kind: 'exact', total: '116' }, timedOut: false });
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
    expect(countLine({ kind: 'exact', total: '116' }, 'standard')).toBe('116 in Standard');
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
    expect(exportTotal({ kind: 'exact', total: '116' })).toBe('116');
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
    expect(tierLine({ kind: 'exact', total: '116' })).toBe('116');
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
