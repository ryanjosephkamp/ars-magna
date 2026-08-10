/**
 * Drives the real WASM engine against the real dictionary through the actual
 * worker protocol — just with the port and `fetch` swapped for local stand-ins.
 *
 * This is the test that would catch a broken WASM boundary, a protocol drift
 * between the two sides, or a dictionary artifact that decodes but is wrong.
 */
import { describe, expect, it, beforeAll } from 'vitest';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { EngineCore } from '../src/engineCore.ts';
import { DEFAULT_QUERY, type Query, type Response } from '../src/protocol.ts';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');
const dictDir = resolve(repoRoot, 'apps/web/public/dict');
const wasmPath = resolve(repoRoot, 'packages/engine/src/wasm/anagram_bg.wasm');

const built = existsSync(resolve(dictDir, 'manifest.json')) && existsSync(wasmPath);

/** Serves `apps/web/public/dict` off disk so the core's real fetch path runs. */
const fileFetch: typeof fetch = async (input) => {
  const url = typeof input === 'string' ? input : String(input);
  const path = resolve(dictDir, url.replace(/^\/dict\//, ''));
  const body = await readFile(path);
  return new Response(body as unknown as BodyInit, { status: 200 });
};

class Collector {
  messages: Response[] = [];
  post = (message: Response) => {
    this.messages.push(message);
  };
  last<K extends Response['k']>(kind: K): Extract<Response, { k: K }> | undefined {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const m = this.messages[i]!;
      if (m.k === kind) return m as Extract<Response, { k: K }>;
    }
    return undefined;
  }
  all<K extends Response['k']>(kind: K): Extract<Response, { k: K }>[] {
    return this.messages.filter((m): m is Extract<Response, { k: K }> => m.k === kind);
  }
  reset() {
    this.messages = [];
  }
}

describe.skipIf(!built)('EngineCore', () => {
  let core: EngineCore;
  let port: Collector;

  const solve = async (input: string, overrides: Partial<Query> = {}, first = 50) => {
    port.reset();
    await core.handle({
      k: 'solve',
      id: 2,
      query: { ...DEFAULT_QUERY, input, ...overrides },
      first,
    });
    return port;
  };

  const rowsOf = (p: Collector) => p.all('batch').flatMap((b) => b.rows.map((r) => [...r].sort()));

  beforeAll(async () => {
    port = new Collector();
    core = new EngineCore(port, {
      wasmInput: await readFile(wasmPath),
      fetchImpl: fileFetch,
    });
    await core.handle({ k: 'init', id: 1, baseUrl: '/dict' });
  });

  it('loads the dictionary and reports its counts', () => {
    const ready = port.last('ready');
    expect(ready).toBeDefined();
    expect(ready!.counts.full).toBe(378_844);
    expect(ready!.counts.signatures).toBe(350_469);
    expect(ready!.counts.common).toBeLessThan(ready!.counts.standard);
    expect(ready!.counts.standard).toBeLessThan(ready!.counts.full);
  });

  it('solves the name it is named after', async () => {
    const p = await solve('Ars Magna', { tier: 'common', minWordLen: 3 });
    expect(rowsOf(p)).toContainEqual(['anagrams']);
  });

  it('solves the classics', async () => {
    expect(rowsOf(await solve('dormitory', { tier: 'common', minWordLen: 3, maxWords: 2 })))
      .toContainEqual(['dirty', 'room']);

    // `starer` and `arrest` are one anagram class, so the engine returns the
    // commoner spelling. Assert on the class, not the surface form.
    const astronomer = rowsOf(await solve('astronomer', { minWordLen: 4, maxWords: 2 }, 500));
    expect(astronomer.some((r) => r.includes('moon') && r.length === 2)).toBe(true);
  });

  it('reports an exact count before any results', async () => {
    const p = await solve('dormitory', { tier: 'common', minWordLen: 3 });
    const countIndex = p.messages.findIndex((m) => m.k === 'count');
    const batchIndex = p.messages.findIndex((m) => m.k === 'batch');
    expect(countIndex).toBeGreaterThanOrEqual(0);
    expect(countIndex).toBeLessThan(batchIndex);

    // The count must agree with what enumeration actually produces.
    const total = Number(p.last('count')!.total);
    expect(rowsOf(p)).toHaveLength(total);
  });

  it('counts far past what it could ever enumerate', async () => {
    const p = await solve('conversationalpiece', { minWordLen: 3 }, 10);
    const total = BigInt(p.last('count')!.total.replace('>', ''));
    expect(total).toBeGreaterThan(1_000_000n);
    // Only the requested handful was materialized.
    expect(rowsOf(p)).toHaveLength(10);
  });

  it('strips digits, punctuation and case', async () => {
    const plain = rowsOf(await solve('dormitory', { tier: 'common', minWordLen: 3 }));
    for (const variant of ['DORMITORY', "Dor-mit'ory", 'dormitory 123', ' d o r m i t o r y ']) {
      expect(rowsOf(await solve(variant, { tier: 'common', minWordLen: 3 }))).toEqual(plain);
    }
  });

  it('uses exactly the input letters in every result', async () => {
    const letters = (s: string) => [...s.replace(/[^a-z]/g, '')].sort().join('');
    for (const input of ['ryanjosephkamp', 'astronomer', 'banana']) {
      const p = await solve(input, { minWordLen: 2 }, 300);
      const expected = letters(input);
      for (const row of p.all('batch').flatMap((b) => b.rows)) {
        expect(letters(row.join(''))).toBe(expected);
      }
    }
  });

  it('pages without repeating or skipping results', async () => {
    await solve('ryanjosephkamp', { minWordLen: 3 }, 40);
    const first = rowsOf(port).map((r) => r.join(' '));

    port.reset();
    await core.handle({ k: 'page', id: 9, offset: 40, len: 40 });
    const second = rowsOf(port).map((r) => r.join(' '));

    expect(second).toHaveLength(40);
    expect(new Set([...first, ...second]).size).toBe(80);
  });

  it('jumps to an arbitrary result by unranking', async () => {
    await solve('ryanjosephkamp', { minWordLen: 3 }, 1);
    port.reset();
    await core.handle({ k: 'random', id: 11, index: '1500' });
    const row = port.last('batch')!.rows[0];
    expect(row).toBeDefined();
    expect([...row!.join('').replace(/[^a-z]/g, '')].sort().join('')).toBe(
      [...'ryanjosephkamp'].sort().join(''),
    );
  });

  it('returns nothing for input with no letters', async () => {
    for (const input of ['', '1234', '!!!', '   ']) {
      const p = await solve(input);
      expect(rowsOf(p)).toHaveLength(0);
      expect(p.last('count')!.total).toBe('0');
    }
  });

  it('returns nothing for letters no word can cover', async () => {
    for (const input of ['q', 'zzzz', 'bcdfg']) {
      expect(rowsOf(await solve(input, { minWordLen: 3 }))).toHaveLength(0);
    }
  });

  it('honours minWordLen and maxWords monotonically', async () => {
    // Subset checks are only meaningful on complete result sets — comparing two
    // truncated prefixes proves nothing, since the looser query's first N are
    // not a superset of the stricter query's first N. So this uses an input
    // small enough to enumerate exhaustively, and asserts that it did.
    const at = async (minWordLen: number, maxWords: number) => {
      const p = await solve('astronomer', { tier: 'common', minWordLen, maxWords }, 20_000);
      const rows = rowsOf(p).map((r) => r.join(' '));
      expect(rows).toHaveLength(Number(p.last('count')!.total));
      return new Set(rows);
    };

    const loose = await at(2, 8);
    const tighter = await at(3, 8);
    const tightest = await at(3, 3);

    expect([...tighter].every((r) => loose.has(r))).toBe(true);
    expect([...tightest].every((r) => tighter.has(r))).toBe(true);
    expect([...tightest].every((r) => r.split(' ').length <= 3)).toBe(true);
    expect([...tighter].every((r) => r.split(' ').every((w) => w.length >= 3))).toBe(true);
  });

  it('restricts results to the selected tier', async () => {
    const at = async (tier: Query['tier']) =>
      new Set(
        rowsOf(await solve('ryanjosephkamp', { tier, minWordLen: 3, maxWords: 3 }, 2000)).map((r) =>
          r.join(' '),
        ),
      );
    const common = await at('common');
    const full = await at('full');
    expect(common.size).toBeLessThan(full.size);
    expect([...common].every((r) => full.has(r))).toBe(true);
  });

  it('surfaces the other spellings of a class', async () => {
    port.reset();
    await core.handle({ k: 'spellings', id: 20, word: 'arrest', tier: 'standard' });
    expect(port.last('spellings')!.words).toContain('starer');

    port.reset();
    await core.handle({ k: 'spellings', id: 21, word: 'listen', tier: 'standard' });
    const words = port.last('spellings')!.words;
    expect(words).toEqual(expect.arrayContaining(['listen', 'silent', 'tinsel', 'enlist']));
  });

  it('reports must-include words it cannot use', async () => {
    port.reset();
    await core.handle({
      k: 'solve',
      id: 30,
      query: { ...DEFAULT_QUERY, input: 'dormitory', mustInclude: ['zzzzz'] },
      first: 10,
    });
    expect(port.last('error')!.code).toBe('UNKNOWN_WORD');

    port.reset();
    await core.handle({
      k: 'solve',
      id: 31,
      query: { ...DEFAULT_QUERY, input: 'dormitory', mustInclude: ['elephant'] },
      first: 10,
    });
    expect(port.last('error')!.code).toBe('NOT_A_SUBSET');
  });

  it('pins every result to a must-include word', async () => {
    const p = await solve('astronomer', { minWordLen: 3, mustInclude: ['moon'] }, 100);
    const rows = rowsOf(p);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.includes('moon'))).toBe(true);
  });
});
