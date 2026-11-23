import { describe, expect, it } from 'vitest';
import { DEFAULT_QUERY, type Query, type SolveHandlers } from '@ars-magna/engine';

import { clock } from '../lib/testClock.ts';
import { timedSearch, type Searcher } from './timedSearch.ts';

const QUERY: Query = { ...DEFAULT_QUERY, input: 'The quick brown fox jumps over the lazy dog' };

/**
 * An engine that answers each search after `ms(maxNodes)` milliseconds, or
 * never when that is Infinity, with `answer(maxNodes)` as its count. Keeps
 * every search asked for and every cancel.
 */
function engine(c: ReturnType<typeof clock>, ms: (maxNodes?: number) => number, answer: (maxNodes?: number) => string) {
  const asked: (number | undefined)[] = [];
  let cancels = 0;
  let current = 0;
  const client: Searcher = {
    solve: (_query: Query, handlers: SolveHandlers, _first?: number, maxNodes?: number) => {
      asked.push(maxNodes);
      const id = ++current;
      const delay = ms(maxNodes);
      if (Number.isFinite(delay)) {
        void c.wait(delay).then(() => {
          // A search the client has moved past (replaced or canceled) says nothing more.
          if (id !== current) return;
          handlers.onCount?.(answer(maxNodes), 9, false, '', []);
          handlers.onBatch?.(0, [['few', 'qi', 'jog', 'kudzu', 'vex', 'bronchothermoplasty']], true, maxNodes !== undefined);
          handlers.onDone?.({ candidates: 9, elapsedMs: delay });
        });
      }
      return id;
    },
    cancel: () => {
      cancels++;
      current++;
    },
  };
  return { client, asked, cancels: () => cancels };
}

/** The handlers a page would pass, recording what reached them. */
function page() {
  const seen: string[] = [];
  return {
    seen,
    handlers: {
      onCount: (total: string) => seen.push(`count ${total}`),
      onBatch: (_offset: number, rows: readonly (readonly string[])[], _done: boolean, truncated: boolean) =>
        seen.push(`rows ${rows.length}${truncated ? ' truncated' : ''}`),
      onDone: () => seen.push('done'),
      onLimit: () => seen.push('limit'),
      onStopped: () => seen.push('stopped'),
    },
  };
}

describe('a search under a time limit', () => {
  it('leaves a search that answers in time alone', async () => {
    const c = clock();
    const e = engine(c, () => 1_800, () => '116576660306');
    const p = page();
    timedSearch(e.client, QUERY, p.handlers, 250, { wait: c.wait, limitMs: 10_000 });
    await c.advance(30_000);
    expect(p.seen).toEqual(['count 116576660306', 'rows 1', 'done']);
    expect(e.asked).toEqual([undefined]);
    expect(e.cancels()).toBe(0);
  });

  it('runs a short search when the full one passes the limit, and shows its floor and rows', async () => {
    const c = clock();
    // The pangram: the full count never arrives; 20,000 nodes answer in 0.7 seconds.
    const e = engine(c, (n) => (n === undefined ? Infinity : 700), (n) => (n === undefined ? '0' : '>237'));
    const p = page();
    timedSearch(e.client, QUERY, p.handlers, 250, { wait: c.wait, limitMs: 10_000, fallbackNodes: 20_000 });
    await c.advance(9_999);
    expect(p.seen).toEqual([]);
    await c.advance(1);
    expect(p.seen).toEqual(['limit']);
    expect(e.asked).toEqual([undefined, 20_000]);
    await c.advance(700);
    expect(p.seen).toEqual(['limit', 'count >237', 'rows 1 truncated', 'done']);
    // The short search answered in time, so nothing is stopped later.
    await c.advance(20_000);
    expect(e.cancels()).toBe(0);
    expect(p.seen.at(-1)).toBe('done');
  });

  it('stops when the short search passes the limit too', async () => {
    const c = clock();
    const e = engine(c, () => Infinity, () => '0');
    const p = page();
    timedSearch(e.client, QUERY, p.handlers, 250, { wait: c.wait, limitMs: 10_000 });
    await c.advance(20_000);
    expect(p.seen).toEqual(['limit', 'stopped']);
    expect(e.cancels()).toBe(1);
  });

  it('stops, with no count, when the short search finds no whole anagram', async () => {
    const c = clock();
    const e = engine(c, (n) => (n === undefined ? Infinity : 400), (n) => (n === undefined ? '0' : '>0'));
    const p = page();
    timedSearch(e.client, QUERY, p.handlers, 250, { wait: c.wait, limitMs: 10_000 });
    await c.advance(10_400);
    expect(p.seen).toEqual(['limit', 'stopped']);
    expect(e.cancels()).toBe(1);
  });

  it('stops a search the page has moved past, and never acts on it again', async () => {
    const c = clock();
    const e = engine(c, () => Infinity, () => '0');
    const p = page();
    const abandon = timedSearch(e.client, QUERY, p.handlers, 250, { wait: c.wait, limitMs: 10_000 });
    await c.advance(5_000);
    // Abandoned mid-search: its worker is stopped once, and its limit later does nothing.
    abandon();
    expect(e.cancels()).toBe(1);
    await c.advance(30_000);
    abandon();
    expect(p.seen).toEqual([]);
    expect(e.asked).toEqual([undefined]);
    expect(e.cancels()).toBe(1);
  });
});
