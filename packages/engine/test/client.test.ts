/**
 * The main-thread client, driven with a stand-in for the Worker so the
 * message routing can be tested without a browser. The case that matters is
 * the one no request owns: the worker itself dying.
 */
import { describe, expect, it } from 'vitest';

import { ArsMagnaClient } from '../src/index.ts';
import type { Request, Response } from '../src/protocol.ts';

/** A Worker that records what it is sent and lets the test answer. */
class FakeWorker {
  sent: Request[] = [];
  onmessage: ((event: MessageEvent<Response>) => void) | null = null;
  terminated = false;
  postMessage(request: Request): void {
    this.sent.push(request);
  }
  terminate(): void {
    this.terminated = true;
  }
  /** Deliver a message as if the worker had posted it. */
  reply(message: Response): void {
    this.onmessage?.({ data: message } as MessageEvent<Response>);
  }
}

function connect(): { client: ArsMagnaClient; worker: FakeWorker } {
  const worker = new FakeWorker();
  const client = new ArsMagnaClient(worker as unknown as Worker);
  return { client, worker };
}

const ready = (worker: FakeWorker, id: number) =>
  worker.reply({
    k: 'ready',
    id,
    counts: { common: 1, standard: 2, full: 3, signatures: 3 },
    builtAt: 'now',
    loadMs: 1,
  });

describe('ArsMagnaClient', () => {
  it('fails the active query when the worker itself crashes', () => {
    const { client, worker } = connect();
    ready(worker, 0);

    const errors: [string, string][] = [];
    let batches = 0;
    client.solve(
      { input: 'dormitory', tier: 'standard', minWordLen: 2, maxWords: 64, mustInclude: [] },
      { onError: (code, message) => errors.push([code, message]), onBatch: () => batches++ },
    );
    const solveId = worker.sent.at(-1)!.id;

    // A WebAssembly panic surfaces through the worker's onerror with no
    // request id at all.
    worker.reply({ k: 'error', id: -1, code: 'INTERNAL', message: 'unreachable executed' });

    expect(errors).toEqual([['INTERNAL', 'unreachable executed']]);

    // The dead query's handlers are gone: a late batch for it is dropped.
    worker.reply({ k: 'batch', id: solveId, offset: 0, rows: [['x']], done: true, truncated: false });
    expect(batches).toBe(0);
  });

  it('rejects every one-shot request that was waiting on the crashed worker', async () => {
    const { client, worker } = connect();
    ready(worker, 0);

    const spelling = client.spellings('listen', 'standard');
    const lookup = client.has('listen', 'standard');
    const nth = client.nth(5n);

    worker.reply({ k: 'error', id: -1, code: 'INTERNAL', message: 'worker crashed' });

    await expect(spelling).rejects.toThrow('worker crashed');
    await expect(lookup).rejects.toThrow('worker crashed');
    await expect(nth).rejects.toThrow('worker crashed');
  });

  it('turns a crash during dictionary load into a failed engine status', () => {
    // Before `ready` arrives the client is loading and no query is active.
    const { client, worker } = connect();
    const statuses: string[] = [];
    client.onStatus((status) => statuses.push(status.state));

    // Nothing has claimed the crash: no active query, engine still loading.
    worker.reply({ k: 'error', id: -1, code: 'INTERNAL', message: 'out of memory' });

    expect(statuses.at(-1)).toBe('failed');
    expect(client.status).toEqual({ state: 'failed', code: 'INTERNAL', message: 'out of memory' });
  });

  it('still routes ordinary per-request errors to their own handler', () => {
    const { client, worker } = connect();
    ready(worker, 0);

    const errors: string[] = [];
    client.solve(
      { input: 'dormitory', tier: 'standard', minWordLen: 2, maxWords: 64, mustInclude: ['zz'] },
      { onError: (code) => errors.push(code) },
    );
    const solveId = worker.sent.at(-1)!.id;
    worker.reply({ k: 'error', id: solveId, code: 'UNKNOWN_WORD', message: 'nope' });
    expect(errors).toEqual(['UNKNOWN_WORD']);
  });
});
