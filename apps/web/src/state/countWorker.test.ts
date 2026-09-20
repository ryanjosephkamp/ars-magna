import { describe, expect, it } from 'vitest';
import { DEFAULT_QUERY, type EngineStatus } from '@ars-magna/engine';

import { clock } from '../lib/testClock.ts';
import { CountWorker, type Counter } from './countWorker.ts';

const QUERY = { ...DEFAULT_QUERY, input: 'William Shakespeare the playwright' };
const READY: EngineStatus = { state: 'ready', counts: { common: 1, standard: 1, full: 1, extended: 1, signatures: 1 }, builtAt: '', forms: [] };

/**
 * Engines started on demand, each counting `rate` nodes a millisecond: exact
 * once a budget reaches `needs`, a floor of the budget before that. Each keeps
 * whether it was stopped.
 */
function engines(c: ReturnType<typeof clock>, { rate = 50, needs = 30, startMs = 0, status = READY, textLeftOut = false } = {}) {
  const started: { stopped: boolean; asked: number[] }[] = [];
  const create = async (): Promise<Counter> => {
    const engine = { stopped: false, asked: [] as number[] };
    started.push(engine);
    if (startMs > 0) await c.wait(startMs);
    return {
      status,
      count: async (_query, maxNodes = 0) => {
        engine.asked.push(maxNodes);
        await c.wait(Math.min(maxNodes, needs) / rate);
        return { total: maxNodes >= needs ? '116' : `>${maxNodes}`, textLeftOut };
      },
      terminate: () => {
        engine.stopped = true;
      },
    } as Counter;
  };
  return { create, started };
}

describe('a count in a worker of its own', () => {
  it('keeps one worker for counts that finish in time, and stops it when closed', async () => {
    const c = clock();
    const e = engines(c);
    const worker = new CountWorker({ create: e.create, wait: c.wait });
    for (let i = 0; i < 3; i++) {
      const done = worker.count(QUERY);
      expect(worker.busy).toBe(true);
      await c.advance(10);
      expect(await done).toEqual({ count: { kind: 'exact', total: '116' }, timedOut: false, textLeftOut: false });
      expect(worker.busy).toBe(false);
    }
    expect(e.started).toHaveLength(1);
    expect(e.started[0]!.stopped).toBe(false);
    worker.close();
    expect(e.started[0]!.stopped).toBe(true);
  });

  it('stops a worker whose count ran out of time, and starts a fresh one for the next', async () => {
    const c = clock();
    // 10 nodes a millisecond, never exact: the 4-second limit ends it mid-rung with a floor.
    const e = engines(c, { rate: 10, needs: Number.MAX_SAFE_INTEGER });
    const worker = new CountWorker({ create: e.create, wait: c.wait, limitMs: 4_000 });
    const first = worker.count(QUERY);
    await c.advance(4_000);
    expect(await first).toEqual({ count: { kind: 'floor', total: '10000' }, timedOut: true, textLeftOut: false });
    expect(e.started[0]!.stopped).toBe(true);
    const second = worker.count(QUERY);
    await c.advance(1);
    expect(e.started).toHaveLength(2);
    expect(e.started[1]!.stopped).toBe(false);
    worker.close();
    await c.advance(4_000);
    expect(await second).toBeNull();
  });

  it('abandons a count when closed: it answers nothing, and the worker is stopped at once', async () => {
    const c = clock();
    const e = engines(c, { rate: 10, needs: Number.MAX_SAFE_INTEGER });
    const worker = new CountWorker({ create: e.create, wait: c.wait });
    const running = worker.count(QUERY);
    await c.advance(500);
    worker.close();
    expect(e.started[0]!.stopped).toBe(true);
    await c.advance(4_000);
    expect(await running).toBeNull();
    // Closed for good.
    expect(await worker.count(QUERY)).toBeNull();
    expect(e.started).toHaveLength(1);
  });

  it('passes on that the engine left the text itself out', async () => {
    const c = clock();
    const e = engines(c, { textLeftOut: true });
    const worker = new CountWorker({ create: e.create, wait: c.wait });
    const done = worker.count(QUERY);
    await c.advance(10);
    expect(await done).toEqual({ count: { kind: 'exact', total: '116' }, timedOut: false, textLeftOut: true });
  });

  it('stops an engine that arrives after the count was abandoned', async () => {
    const c = clock();
    const e = engines(c, { startMs: 300 });
    const worker = new CountWorker({ create: e.create, wait: c.wait });
    const running = worker.count(QUERY);
    await c.advance(100);
    worker.close();
    await c.advance(300);
    expect(await running).toBeNull();
    expect(e.started[0]!.stopped).toBe(true);
  });

  it('says the count failed when the dictionary did not load, and tries a fresh worker next time', async () => {
    const c = clock();
    const e = engines(c, { status: { state: 'failed', code: 'FETCH_FAILED', message: 'no' } });
    const worker = new CountWorker({ create: e.create, wait: c.wait });
    expect(await worker.count(QUERY)).toEqual({ count: { kind: 'failed' }, timedOut: false, textLeftOut: false });
    expect(e.started[0]!.stopped).toBe(true);
    await worker.count(QUERY);
    expect(e.started).toHaveLength(2);
  });
});
