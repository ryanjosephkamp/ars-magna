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

/** A client that can replace its worker, with every worker it ever made. */
function connectRespawning(): { client: ArsMagnaClient; workers: FakeWorker[] } {
  const workers: FakeWorker[] = [];
  const spawn = () => {
    const worker = new FakeWorker();
    workers.push(worker);
    return worker as unknown as Worker;
  };
  const client = new ArsMagnaClient(spawn(), spawn);
  return { client, workers };
}

const QUERY = { input: 'dormitory', tier: 'standard', minWordLen: 2, maxWords: 64, mustInclude: [], mustExclude: [] } as const;

const ready = (worker: FakeWorker, id: number) =>
  worker.reply({
    k: 'ready',
    id,
    counts: { common: 1, standard: 2, full: 3, extended: 4, signatures: 4 },
    builtAt: 'now',
    loadMs: 1,
    forms: [],
  });

describe('ArsMagnaClient', () => {
  it('fails the active query when the worker itself crashes', () => {
    const { client, worker } = connect();
    ready(worker, 0);

    const errors: [string, string][] = [];
    let batches = 0;
    client.solve(
      { input: 'dormitory', tier: 'standard', minWordLen: 2, maxWords: 64, mustInclude: [], mustExclude: [] },
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

  it('kills and replaces a worker that is still busy when a new query arrives', async () => {
    const { client, workers } = connectRespawning();
    const [first] = workers;
    ready(first!, 0);

    let firstDone = 0;
    client.solve({ ...QUERY, input: 'the quick brown fox jumps over the lazy dog' }, {
      onDone: () => firstDone++,
    });
    expect(client.busy).toBe(true);
    const pendingJump = client.nth(3n);

    // The reader keeps typing before the pangram search answers.
    let secondCount = '';
    let secondLeftOut: boolean | null = null;
    const secondId = client.solve({ ...QUERY, input: 'dormitory' }, {
      onCount: (total, _candidates, textLeftOut) => {
        secondCount = total;
        secondLeftOut = textLeftOut;
      },
    });

    expect(first!.terminated).toBe(true);
    expect(workers).toHaveLength(2);
    const second = workers[1]!;
    expect(second.sent.map((m) => m.k)).toEqual(['init', 'solve']);
    expect(second.sent[0]).toMatchObject({ k: 'init', baseUrl: '/dict' });
    await expect(pendingJump).rejects.toThrow('cancelled');

    // The new worker answers; the old query's handlers are gone.
    ready(second, second.sent[0]!.id);
    second.reply({ k: 'count', id: secondId, total: '3', candidates: 9, textLeftOut: true });
    second.reply({ k: 'solved', id: secondId, stats: { candidates: 9, elapsedMs: 1 } });
    expect(secondCount).toBe('3');
    // The page is told when the text's own row was left out of the count.
    expect(secondLeftOut).toBe(true);
    expect(client.busy).toBe(false);
    expect(firstDone).toBe(0);

    // An idle worker is kept: a third query does not respawn.
    client.solve({ ...QUERY, input: 'listen' }, {});
    expect(workers).toHaveLength(2);
    expect(second.terminated).toBe(false);
  });

  it('asks for a page once until its batch arrives, then again, and afresh for a new query', () => {
    const { client, worker } = connect();
    ready(worker, 0);

    const offsets: number[] = [];
    const solveId = client.solve(QUERY, { onBatch: (offset) => offsets.push(offset) });
    const pages = () => worker.sent.filter((m) => m.k === 'page');

    // The list asks on every frame it draws near its end; one scroll to the end
    // of "Demis Hassabis" asked for offset 250 twelve times before this.
    for (let frame = 0; frame < 12; frame++) client.page(250, 250);
    expect(pages()).toHaveLength(1);
    expect(pages()[0]).toMatchObject({ k: 'page', offset: 250, len: 250 });

    // Its batch answers with the query's id. The list, longer now, asks for the
    // next offset on every frame; that is one question too.
    worker.reply({ k: 'batch', id: solveId, offset: 250, rows: [['x']], done: false, truncated: false });
    expect(offsets).toEqual([250]);
    for (let frame = 0; frame < 12; frame++) client.page(500, 250);
    expect(pages()).toHaveLength(2);
    expect(pages()[1]).toMatchObject({ k: 'page', offset: 500 });

    // Answered, an offset may be asked for again.
    worker.reply({ k: 'batch', id: solveId, offset: 500, rows: [['y']], done: false, truncated: false });
    client.page(500, 250);
    expect(pages()).toHaveLength(3);

    // A new query starts afresh: its first page is a new question, whatever
    // the last query was still waiting for.
    client.solve({ ...QUERY, input: 'listen' }, {});
    client.page(500, 250);
    expect(pages()).toHaveLength(4);
  });

  it('does not respawn when it has no way to', () => {
    const { client, worker } = connect();
    ready(worker, 0);
    client.solve(QUERY, {});
    client.solve(QUERY, {});
    expect(worker.terminated).toBe(false);
    expect(worker.sent.filter((m) => m.k === 'solve')).toHaveLength(2);
  });

  it('answers a count on its own, and drops the answer to a count a later one replaced', async () => {
    const { client, worker } = connect();
    ready(worker, 0);

    let batches = 0;
    const solveId = client.solve(QUERY, { onBatch: () => batches++ });

    // The reader types `sham`, then `shamed`, before the first count is answered.
    const sham = client.count({ ...QUERY, mustInclude: ['sham'] });
    const shamed = client.count({ ...QUERY, mustInclude: ['shamed'] });
    const [first, second] = worker.sent.filter((m) => m.k === 'count');
    expect(first).toMatchObject({ k: 'count', query: { mustInclude: ['sham'] } });
    expect(second).toMatchObject({ k: 'count', query: { mustInclude: ['shamed'] } });
    expect(first).not.toHaveProperty('maxNodes');

    worker.reply({ k: 'count', id: first!.id, total: '40', candidates: 0, textLeftOut: false });
    worker.reply({ k: 'count', id: second!.id, total: '11', candidates: 0, textLeftOut: false });
    await expect(sham).resolves.toBeNull();
    await expect(shamed).resolves.toEqual({ total: '11', textLeftOut: false });

    // A count that pins every word of the text: its only result would be the text, so the engine says it left that out.
    const itself = client.count({ ...QUERY, mustInclude: ['dormitory'] });
    worker.reply({ k: 'count', id: worker.sent.at(-1)!.id, total: '0', candidates: 0, textLeftOut: true });
    await expect(itself).resolves.toEqual({ total: '0', textLeftOut: true });

    // Neither count is the search: the list keeps its own id and its batches.
    worker.reply({ k: 'batch', id: solveId, offset: 0, rows: [['x']], done: true, truncated: false });
    expect(batches).toBe(1);

    // A count the engine refuses rejects, and says why.
    const refused = client.count({ ...QUERY, mustInclude: ['zz'] });
    worker.reply({ k: 'error', id: worker.sent.at(-1)!.id, code: 'UNKNOWN_WORD', message: '"zz" is not in this dictionary tier' });
    await expect(refused).rejects.toThrow('not in this dictionary tier');
  });

  it('does not make a new search wait behind a count that is still running', async () => {
    const { client, workers } = connectRespawning();
    const [first] = workers;
    ready(first!, 0);

    // A search that has finished, then a filter's count on it.
    const searchId = client.solve(QUERY, {});
    first!.reply({ k: 'solved', id: searchId, stats: { candidates: 9, elapsedMs: 1 } });
    expect(client.busy).toBe(false);
    const filter = client.count({ ...QUERY, mustInclude: ['a'] });

    // The reader changes the text before the count is answered.
    client.solve({ ...QUERY, input: 'listen' }, {});
    expect(first!.terminated).toBe(true);
    await expect(filter).rejects.toThrow('cancelled');
    expect(workers[1]!.sent.map((m) => m.k)).toEqual(['init', 'solve']);

    // Once a count is answered, the worker is idle again and is kept.
    const second = workers[1]!;
    ready(second, second.sent[0]!.id);
    second.reply({ k: 'solved', id: second.sent[1]!.id, stats: { candidates: 9, elapsedMs: 1 } });
    const answered = client.count({ ...QUERY, mustInclude: ['lens'] });
    second.reply({ k: 'count', id: second.sent.at(-1)!.id, total: '2', candidates: 0, textLeftOut: false });
    await expect(answered).resolves.toEqual({ total: '2', textLeftOut: false });
    client.solve({ ...QUERY, input: 'silent' }, {});
    expect(workers).toHaveLength(2);
  });

  it('still routes ordinary per-request errors to their own handler', () => {
    const { client, worker } = connect();
    ready(worker, 0);

    const errors: string[] = [];
    client.solve(
      { input: 'dormitory', tier: 'standard', minWordLen: 2, maxWords: 64, mustInclude: ['zz'], mustExclude: [] },
      { onError: (code) => errors.push(code) },
    );
    const solveId = worker.sent.at(-1)!.id;
    worker.reply({ k: 'error', id: solveId, code: 'UNKNOWN_WORD', message: 'nope' });
    expect(errors).toEqual(['UNKNOWN_WORD']);
  });
});
