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

import { EngineCore, parseTag } from '../src/engineCore.ts';
import { DEFAULT_QUERY, type Query, type Response } from '../src/protocol.ts';
import { encodeClasses } from '../../../tools/dict-build/src/format.ts';

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

const rowsOf = (p: Collector) => p.all('batch').flatMap((b) => b.rows.map((r) => [...r].sort()));

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

  beforeAll(async () => {
    port = new Collector();
    core = new EngineCore(port, {
      wasmInput: await readFile(wasmPath),
      fetchImpl: fileFetch,
    });
    await core.handle({ k: 'init', id: 1, baseUrl: '/dict' });
  });

  it('holds a request that arrives while the dictionary loads until it has loaded', async () => {
    // A replacement worker is sent `init` and the next request back to back.
    const fresh = new Collector();
    const replacement = new EngineCore(fresh, { wasmInput: await readFile(wasmPath), fetchImpl: fileFetch });
    const loading = replacement.handle({ k: 'init', id: 1, baseUrl: '/dict' });
    const counting = replacement.handle({ k: 'count', id: 2, query: { ...DEFAULT_QUERY, input: 'dormitory' } });
    const looking = replacement.handle({ k: 'lookup', id: 3, word: 'dormitory', tier: 'standard' });
    await Promise.all([loading, counting, looking]);
    expect(fresh.all('error')).toEqual([]);
    expect(fresh.messages.map((m) => m.k)).toEqual(['ready', 'count', 'lookup']);
    expect(fresh.last('count')?.total).toBe('115');
  });

  it('loads the dictionary and reports its counts', () => {
    const ready = port.last('ready');
    expect(ready).toBeDefined();
    // The pin's 378,844 plus the 35 listed forms whose letters are no word without their apostrophe.
    expect(ready!.counts.full).toBe(378_879);
    expect(ready!.counts.formOnly).toBe(35);
    // 20 of those open a class of their own (`dont`); the rest join one (`im` with `mi`).
    expect(ready!.counts.signatures).toBe(350_489);
    expect(ready!.counts.common).toBeLessThan(ready!.counts.standard);
    expect(ready!.counts.standard).toBeLessThan(ready!.counts.full);
  });

  it('sends the listed forms with ready, and keeps every result letters-only', async () => {
    const ready = port.last('ready')!;
    expect(ready.forms).toHaveLength(53);
    expect(ready.forms).toContainEqual({ letters: 'dont', form: "don't", shown: true });
    expect(ready.forms).toContainEqual({ letters: 'its', form: "it's", shown: false });
    // A search whose letters fit don't lists dont, at Common, as letters.
    const rows = rowsOf(await solve("don't do it", { tier: 'common', minWordLen: 2 }));
    expect(rows.some((row) => row.includes('dont'))).toBe(true);
    for (const row of rows) for (const word of row) expect(word).toMatch(/^[a-z]+$/);
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

  it('strips punctuation and case, and counts a digit as a character of the pool', async () => {
    const plain = rowsOf(await solve('dormitory', { tier: 'common', minWordLen: 3 }));
    for (const variant of ['DORMITORY', "Dor-mit'ory", 'dormitory!!']) {
      expect(rowsOf(await solve(variant, { tier: 'common', minWordLen: 3 }))).toEqual(plain);
    }
    // A digit is a character of the pool (the literal rule): no word has one, so with words
    // alone the text has no anagram, and the count says which characters nothing uses. A
    // number is never read as its name.
    const digits = await solve('dormitory 123', { tier: 'common', minWordLen: 3 });
    expect(rowsOf(digits)).toEqual([]);
    expect(digits.last('count')).toMatchObject({ total: '0', unused: '123', leet: [] });
    expect(rowsOf(await solve('dormitory 2', { tier: 'common', minWordLen: 3 })).some((row) => row.includes('two'))).toBe(false);
    // Left out by the reader, the digits change nothing.
    expect(rowsOf(await solve('dormitory 123', { tier: 'common', minWordLen: 3, reading: { '1': 'drop', '2': 'drop', '3': 'drop' } }))).toEqual(plain);
    // Spaces are the one thing that is kept: they say what the text's words are. The same
    // letters typed apart are not the word `dormitory`, so the word is an anagram of theirs.
    const apart = rowsOf(await solve(' d o r m i t o r y ', { tier: 'common', minWordLen: 3 }));
    expect(plain).not.toContainEqual(['dormitory']);
    expect(apart).toContainEqual(['dormitory']);
    expect(apart.filter((row) => row.join() !== 'dormitory')).toEqual(plain);
  });

  it('folds accented letters to their base letters', async () => {
    for (const [accented, plain] of [
      ['Beyoncé Knowles', 'beyonce knowles'],
      ['Björk', 'bjork'],
      ['Straße', 'strasse'],
      ['Motörhead', 'motorhead'],
    ] as const) {
      const a = await solve(accented, { minWordLen: 3, maxWords: 3 }, 200);
      const total = a.last('count')!.total;
      const rows = rowsOf(a);
      const b = await solve(plain, { minWordLen: 3, maxWords: 3 }, 200);
      expect(b.last('count')!.total).toBe(total);
      expect(rowsOf(b)).toEqual(rows);
    }

    // A pinned word is folded too.
    const pinned = await solve('Beyoncé', { minWordLen: 3, mustInclude: ['Beyoncé'] }, 5);
    // "beyonce" is not a word, so this must fail as unknown, not as a subset
    // problem caused by the accent being dropped from one side only.
    expect(pinned.last('error')!.code).toBe('UNKNOWN_WORD');
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

  it('serves a page at any offset, and export does not move the paging cursor', async () => {
    await solve('scarlett johansson', { minWordLen: 3, maxWords: 4 }, 10);
    const total = Number(port.last('count')!.total);
    expect(total).toBeGreaterThan(50_000);

    // A page deep in the list equals the same positions fetched one by one.
    const offset = Math.floor(total * 0.7);
    port.reset();
    await core.handle({ k: 'page', id: 50, offset, len: 5 });
    const page = rowsOf(port).map((r) => r.join(' '));
    expect(page).toHaveLength(5);
    for (let i = 0; i < 5; i++) {
      port.reset();
      await core.handle({ k: 'random', id: 60 + i, index: String(offset + i) });
      expect([...port.last('batch')!.rows[0]!].sort().join(' ')).toBe(page[i]);
    }

    // The next sequential page continues from there without a seek, and an
    // export in between does not disturb it.
    port.reset();
    await core.handle({ k: 'collect', id: 70, limit: 100 });
    expect(port.last('collected')!.rows).toHaveLength(100);
    port.reset();
    await core.handle({ k: 'page', id: 51, offset: offset + 5, len: 5 });
    const next = rowsOf(port).map((r) => r.join(' '));
    expect(next).toHaveLength(5);
    expect(new Set([...page, ...next]).size).toBe(10);
    port.reset();
    await core.handle({ k: 'random', id: 80, index: String(offset + 5) });
    expect([...port.last('batch')!.rows[0]!].sort().join(' ')).toBe(next[0]);
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
    for (const input of ['', '1234', '!!!', '   ', '?.,']) {
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

  it('reports more than 127 of one letter as an error, not as one empty result', async () => {
    const under = await solve('a'.repeat(127) + 'dormitory', { minWordLen: 2 }, 5);
    expect(under.last('error')).toBeUndefined();
    expect(Number(under.last('count')!.total)).toBeGreaterThan(0);

    const over = await solve('a'.repeat(128) + 'dormitory', { minWordLen: 2 }, 5);
    expect(over.last('error')!.code).toBe('TOO_MANY_REPEATS');
    expect(over.last('count')).toBeUndefined();
  });

  it('says so when the search runs out of budget instead of results', async () => {
    // A node budget this small guarantees the search is cut off. The engine must
    // report the count as a floor and mark the batch truncated — presenting a
    // budget-limited count as exact would be the site lying about the one number
    // it exists to produce.
    port.reset();
    await core.handle({
      k: 'solve',
      id: 40,
      query: { ...DEFAULT_QUERY, input: 'conversationalpiece', minWordLen: 3 },
      first: 50,
      maxNodes: 200,
    });

    expect(port.last('count')!.total.startsWith('>')).toBe(true);
    expect(port.last('batch')!.truncated).toBe(true);
    // Truncated implies done: more answers exist, but no further page can
    // reach them — a re-page walks to the same budget and returns nothing,
    // at the full cost of the budget each time. The truncated flag is what
    // tells the interface to say the list is incomplete.
    expect(port.last('batch')!.done).toBe(true);

    // And a page request after that yields nothing further and stays done.
    port.reset();
    await core.handle({ k: 'page', id: 41, offset: 0, len: 50 });
    expect(port.last('batch')!.done).toBe(true);
    expect(port.last('batch')!.truncated).toBe(true);
  });

  it('reports an exact count and a finished list when it does complete', async () => {
    const p = await solve('dormitory', { tier: 'common', minWordLen: 3 });
    expect(p.last('count')!.total.startsWith('>')).toBe(false);
    expect(p.last('batch')!.truncated).toBe(false);
    expect(p.last('batch')!.done).toBe(true);
  });

  it('counts a query on its own, leaving the list it is paging through where it was', async () => {
    const p = await solve('Demis Hassabis', {}, 250);
    expect(p.last('count')!.total).toBe('15202');
    const count = async (id: number, mustInclude: string[], maxNodes?: number) => {
      port.reset();
      await core.handle({ k: 'count', id, query: { ...DEFAULT_QUERY, input: 'Demis Hassabis', mustInclude }, ...(maxNodes ? { maxNodes } : {}) });
      return port.messages;
    };

    // The operator's case: eleven anagrams contain `shamed`.
    expect(await count(90, ['shamed'])).toEqual([{ k: 'count', id: 90, total: '11', candidates: 0, textLeftOut: false, unused: '', leet: [] }]);
    // The same answer a search with Must include gives.
    const pinned = await solve('Demis Hassabis', { mustInclude: ['shamed'] }, 50);
    expect(pinned.last('count')!.total).toBe('11');
    expect(rowsOf(pinned)).toHaveLength(11);
    // A word that fits the letters but is in no anagram of them.
    expect((await count(91, ['amebiasis']))[0]).toMatchObject({ k: 'count', total: '0' });
    // A floor when the budget runs out, as a search's count is.
    expect(((await count(92, ['shamed'], 1))[0] as { total: string }).total.startsWith('>')).toBe(true);
    // Refusals come back as the search's do.
    expect((await count(93, ['zzzzz']))[0]).toMatchObject({ k: 'error', id: 93, code: 'UNKNOWN_WORD' });
    expect((await count(94, ['elephant']))[0]).toMatchObject({ k: 'error', id: 94, code: 'NOT_A_SUBSET' });

    // The session is still the search without Must include: the next page and
    // an unranked result come from its 15,202, not from the counts.
    await solve('Demis Hassabis', {}, 250);
    port.reset();
    await core.handle({ k: 'random', id: 95, index: '251' });
    const expected = [...port.last('batch')!.rows[0]!].sort().join(' ');
    await count(96, ['shamed']);
    port.reset();
    await core.handle({ k: 'page', id: 97, offset: 250, len: 5 });
    const page = port.last('batch')!;
    expect(page.id).toBe(2);
    expect(page.rows).toHaveLength(5);
    expect([...page.rows[1]!].sort().join(' ')).toBe(expected);
  });

  it('takes Must exclude words out of the dictionary for one query, and counts exactly', async () => {
    const everything = async () => {
      port.reset();
      await core.handle({ k: 'collect', id: 100, limit: 100_000 });
      const collected = port.last('collected')!;
      expect(collected.complete).toBe(true);
      return collected.rows;
    };
    expect((await solve('Demis Hassabis', {}, 0)).last('count')!.total).toBe('15202');

    // `ai` is the only spelling of its class at Standard, so the class goes,
    // and with it every result that used it: an exact count, and no `ai`.
    const ai = await solve('Demis Hassabis', { mustExclude: ['AI'] }, 0);
    expect(ai.last('count')!.total).toBe('14312');
    const withoutAi = await everything();
    expect(withoutAi).toHaveLength(14_312);
    expect(withoutAi.some((r) => r.includes('ai'))).toBe(false);

    // `is` shares its class with `si`, which spells it instead: every result
    // stays, and none shows `is`.
    const is = await solve('Demis Hassabis', { mustExclude: ['is'] }, 0);
    expect(is.last('count')!.total).toBe('15202');
    const withoutIs = await everything();
    expect(withoutIs).toHaveLength(15_202);
    expect(withoutIs.some((r) => r.includes('is'))).toBe(false);
    expect(withoutIs.some((r) => r.includes('si'))).toBe(true);

    // A count on its own excludes the same way.
    port.reset();
    await core.handle({ k: 'count', id: 102, query: { ...DEFAULT_QUERY, input: 'Demis Hassabis', mustExclude: ['ai'] } });
    expect(port.last('count')!.total).toBe('14312');

    // Excluding a word the dictionary lacks changes nothing.
    expect((await solve('Demis Hassabis', { mustExclude: ['zzqx'] }, 0)).last('count')!.total).toBe('15202');

    // A word in both fields is refused rather than searched.
    const both = await solve('Demis Hassabis', { mustInclude: ['ai'], mustExclude: ['ai'] }, 0);
    expect(both.last('error')!.message).toContain('both included and excluded');
  });

  it('never lists the text as its own anagram, and says when that left a row out', async () => {
    // No other word has these letters, so the text's own row goes: 116 became 115.
    const dormitory = await solve('Dormitory', {}, 200);
    expect(dormitory.last('count')).toMatchObject({ total: '115', textLeftOut: true });
    expect(rowsOf(dormitory)).toHaveLength(115);
    expect(rowsOf(dormitory)).not.toContainEqual(['dormitory']);
    const all = rowsOf(dormitory).map((r) => r.join(' '));

    // Every view agrees. Go to and Surprise me: result 115 is the last, and there is no 116th.
    port.reset();
    await core.handle({ k: 'random', id: 120, index: '114' });
    expect(port.last('batch')!.rows).toHaveLength(1);
    port.reset();
    await core.handle({ k: 'random', id: 121, index: '115' });
    expect(port.last('batch')!.rows).toEqual([]);
    // Paging from any offset, and the export.
    port.reset();
    await core.handle({ k: 'page', id: 122, offset: 40, len: 200 });
    expect(port.last('batch')!.rows.map((r) => [...r].sort().join(' '))).toEqual(all.slice(40));
    expect(port.last('batch')!.done).toBe(true);
    port.reset();
    await core.handle({ k: 'collect', id: 123, limit: 1000 });
    const collected = port.last('collected')!;
    expect(collected.complete).toBe(true);
    expect(collected.rows.map((r) => [...r].sort().join(' '))).toEqual(all);
    // And the count asked on its own, as Build and the filter ask it.
    port.reset();
    await core.handle({ k: 'count', id: 124, query: { ...DEFAULT_QUERY, input: 'dormitory' } });
    expect(port.last('count')).toMatchObject({ total: '115', textLeftOut: true });

    // The same letters typed apart are not the word, so the word is a result of theirs.
    const spaced = await solve('dormitor y', {}, 200);
    expect(spaced.last('count')).toMatchObject({ total: '116', textLeftOut: false });
    expect(rowsOf(spaced)).toContainEqual(['dormitory']);

    // A word that shares its letters with others: the row stays and shows the next of them.
    const below = await solve('below', {}, 50);
    expect(below.last('count')).toMatchObject({ total: '6', textLeftOut: false });
    expect(rowsOf(below)).toContainEqual(['elbow']);
    expect(rowsOf(below)).not.toContainEqual(['below']);
    expect(rowsOf(await solve('listen', {}, 50))).toContainEqual(['silent']);

    // Two words. "apple house" appeared as typed; now `appel` stands in. "apple sauce"
    // never did: `cause` is commoner than `sauce`. Both counts are what they were.
    const house = await solve('Apple  house', {}, 2000);
    expect(house.last('count')).toMatchObject({ total: '1288', textLeftOut: false });
    expect(rowsOf(house)).toContainEqual(['appel', 'house']);
    expect(rowsOf(house)).not.toContainEqual(['apple', 'house']);
    const sauce = await solve('apple sauce', {}, 1000);
    expect(sauce.last('count')).toMatchObject({ total: '588', textLeftOut: false });
    expect(rowsOf(sauce)).toContainEqual(['apple', 'cause']);
    expect(rowsOf(sauce)).toContainEqual(['applesauce']);

    // Must include keeps its word as typed. Holding every word of the text leaves only the text.
    const pinned = await solve('apple house', { mustInclude: ['house'] }, 2000);
    expect(rowsOf(pinned)).toContainEqual(['appel', 'house']);
    expect(rowsOf(pinned)).not.toContainEqual(['apple', 'house']);
    const both = await solve('apple house', { mustInclude: ['apple', 'house'] }, 50);
    expect(both.last('count')).toMatchObject({ total: '0', textLeftOut: true });
    expect(rowsOf(both)).toEqual([]);

    // A text whose only anagram was itself has none.
    expect((await solve('rhythm', {}, 50)).last('count')).toMatchObject({ total: '0', textLeftOut: true });
  });

  it('gives each word its frequency byte, and zero for one the dictionary lacks', async () => {
    port.reset();
    const words = ['the', 'room', 'dirty', 'dormitory', 'onsen', 'doomer', 'oradio'];
    await core.handle({ k: 'zipf', id: 110, words });
    const zipf = port.last('zipf')!.zipf;
    expect(zipf).toHaveLength(words.length);
    // The byte is (zipf + 1) * 24, so a commoner word carries a bigger one.
    const [the, room, dirty, dormitory, onsen, doomer, oradio] = zipf as number[];
    expect(the!).toBeGreaterThan(room!);
    expect(room!).toBeGreaterThan(dirty!);
    expect(dirty!).toBeGreaterThan(dormitory!);
    expect(dormitory!).toBeGreaterThan(onsen!);
    // A site addition has no frequency at all, and nor has a word that is not a word.
    expect([doomer, oradio]).toEqual([0, 0]);

    port.reset();
    await core.handle({ k: 'zipf', id: 111, words: [] });
    expect(port.last('zipf')!.zipf).toEqual([]);
  });

  it('reports the terms of each class with ready: none, for a dictionary of words alone', async () => {
    const fresh = new Collector();
    const again = new EngineCore(fresh, { wasmInput: await readFile(wasmPath), fetchImpl: fileFetch });
    await again.handle({ k: 'init', id: 1, baseUrl: '/dict' });
    const ready = fresh.last('ready')!;
    expect(ready.classes).toEqual({ numerals: 0, symbols: 0, shorthand: 0, blends: 0, acronyms: 0, leet: 0, names: 0, slang: 0 });
  });

  it('refuses more than six different digits and symbols with its own code', async () => {
    const p = await solve('abc 1234567');
    expect(p.last('error')).toMatchObject({ code: 'TOO_MANY_CHARACTERS' });
    expect(p.last('count')).toBeUndefined();
  });

  it('pins every result to a must-include word', async () => {
    const p = await solve('astronomer', { minWordLen: 3, mustInclude: ['moon'] }, 100);
    const rows = rowsOf(p);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.includes('moon'))).toBe(true);
  });
});

/**
 * The same core over the same dictionary, plus a `classes` artifact of a few
 * dozen terms served in the manifest's place: the fixture N3 tests against
 * until N4 seeds the class files. The shipped manifest names no classes, so
 * the site's own dictionary is words alone.
 */
describe.skipIf(!built)('EngineCore with the term classes', () => {
  let core: EngineCore;
  let port: Collector;

  const BITS = { numerals: 1, symbols: 2, shorthand: 4, blends: 8, acronyms: 16, leet: 32, names: 64, slang: 128 };
  const fixture = encodeClasses([
    ...['&', '@', '%', '+', '#', '$'].map((term) => ({ term, bits: BITS.symbols })),
    ...['u', 'r', 'b', 'c', 'y', 'k', 'n', '2', '4', '8', '1'].map((term) => ({ term, bits: BITS.shorthand })),
    ...['b8', 'l8', 'gr8', 'm8', 'h8', 'sk8', 'str8', 'w8', '2day', '2nite', 'b4', '4ever', '1der', '10q'].map((term) => ({ term, bits: BITS.blends })),
    ...['wtf', 'btw', 'omg', 'idk', 'brb', 'tbh', 'fyi', 'asap', 'rsvp', 'diy', 'thx', 'pls', 'ur'].map((term) => ({ term, bits: BITS.acronyms })),
    ...['eiffel', 'berne', 'taft', 'amy'].map((term) => ({ term, bits: BITS.names })),
    ...['rizz', 'sus', 'yeet'].map((term) => ({ term, bits: BITS.slang })),
  ]);

  /** The shipped dictionary's files, plus the fixture under a manifest that names it. */
  const classedFetch: typeof fetch = async (input) => {
    const url = typeof input === 'string' ? input : String(input);
    if (url.endsWith('/manifest.json')) {
      const manifest = JSON.parse(await readFile(resolve(dictDir, 'manifest.json'), 'utf8')) as { files: Record<string, unknown> };
      manifest.files['classes'] = { name: 'classes.fixture.bin', bytes: fixture.length, sha256: 'fixture' };
      return new Response(JSON.stringify(manifest), { status: 200 });
    }
    if (url.endsWith('/classes.fixture.bin')) return new Response(fixture as unknown as BodyInit, { status: 200 });
    return fileFetch(input);
  };

  const solve = async (input: string, overrides: Partial<Query> = {}, first = 50) => {
    port.reset();
    await core.handle({ k: 'solve', id: 2, query: { ...DEFAULT_QUERY, input, ...overrides }, first });
    return port;
  };

  /** Every row with its tag: `[words, tag]`, the words sorted. */
  const tagged = (p: Collector) =>
    p.all('batch').flatMap((b) => b.rows.map((r, i) => [[...r].sort(), b.tags?.[i] ?? null] as const));

  beforeAll(async () => {
    port = new Collector();
    core = new EngineCore(port, { wasmInput: await readFile(wasmPath), fetchImpl: classedFetch });
    await core.handle({ k: 'init', id: 1, baseUrl: '/dict' });
  });

  it('loads the terms and says how many each class has', () => {
    expect(port.last('error')).toBeUndefined();
    // A term that is a word of the list already is dropped, as the build refuses it: `b`, `c` and `n`
    // are words of English OpenList, and so are `yeet` and `rizz` at the pinned revision.
    expect(port.last('ready')!.classes).toEqual({ numerals: 0, symbols: 6, shorthand: 8, blends: 14, acronyms: 13, leet: 0, names: 4, slang: 1 });
  });

  it('counts dormitory exactly as without them, with no class on', async () => {
    const p = await solve('dormitory');
    expect(p.last('count')).toMatchObject({ total: '115', unused: '', leet: [] });
    expect(p.all('batch').every((b) => b.tags === undefined)).toBe(true);
    expect(rowsOf(await solve('Demis Hassabis')).length).toBeGreaterThan(0);
    expect((await solve('Demis Hassabis')).last('count')!.total).toBe('15202');
  });

  it('finds nothing for Blink-182 with words alone and says which characters nothing uses', async () => {
    const p = await solve('Blink-182');
    expect(p.last('count')).toMatchObject({ total: '0', textLeftOut: false, unused: '182', leet: [] });
    expect(rowsOf(p)).toEqual([]);
  });

  it('lists 1 2 link b8 with shorthand and blends on, each term tagged', async () => {
    const p = await solve('Blink-182', { classes: ['shorthand', 'blends'] });
    expect(p.last('count')!.unused).toBe('');
    const rows = tagged(p);
    const row = rows.find(([words]) => words.join(' ') === '1 2 b8 link');
    expect(row, JSON.stringify(rows)).toBeDefined();
    const [words, tag] = row!;
    expect(tag).not.toBeNull();
    // The tag travels with its word whatever order the row reads in.
    const batch = p.all('batch').find((b) => b.rows.some((r) => [...r].sort().join(' ') === words.join(' ')))!;
    const index = batch.rows.findIndex((r) => [...r].sort().join(' ') === words.join(' '));
    const shown = batch.rows[index]!;
    const byWord = Object.fromEntries(shown.map((w, i) => [w, tag!.classes[i]]));
    expect(byWord).toEqual({ '1': 'shorthand', '2': 'shorthand', b8: 'blends', link: null });
    expect(tag!.written).toEqual([...shown]);
    expect(tag!.reading).toEqual({});
    // Never a numeral without its class, and never `two`.
    for (const [w] of rows) expect(w.some((word) => word === '182' || word === 'two')).toBe(false);
  });

  it('reads $ as s with leet on, writes the $ where the s went, and tags the reading', async () => {
    const plain = await solve('Ke$ha');
    expect(plain.last('count')).toMatchObject({ total: '0', unused: '$' });
    const p = await solve('Ke$ha', { leet: ['$'] });
    expect(p.last('count')).toMatchObject({ total: '5', unused: '', leet: ['$'] });
    const rows = tagged(p);
    expect(rows).toHaveLength(5);
    for (const [words, tag] of rows) {
      expect(tag).not.toBeNull();
      expect(tag!.reading).toEqual({ $: 's' });
      expect(tag!.classes.filter((c) => c === 'leet')).toHaveLength(1);
      expect(tag!.written.join('').replace('$', 's').split('').sort().join('')).toBe(words.join('').split('').sort().join(''));
      expect(tag!.written.some((w) => w.includes('$'))).toBe(true);
    }
    // The commonest spelling of the class is shown, so the $ lands on its s.
    expect(rows.some(([, tag]) => tag!.written.join(' ') === '$hake')).toBe(true);
    // A fixed reading is the reader's own: one search, the rows as words, no tag.
    const fixed = await solve('Ke$ha', { reading: { $: 's' } });
    expect(fixed.last('count')).toMatchObject({ total: '5', unused: '', leet: [] });
    expect(fixed.all('batch').every((b) => b.tags === undefined)).toBe(true);
    expect(rowsOf(fixed)).toContainEqual(['shake']);
  });

  it('never lists the text itself, and makes numerals from the digits in the text\'s order', async () => {
    const p = await solve('2 Fast 2 Furious', { classes: ['numerals'] });
    const rows = tagged(p);
    expect(rows.length).toBeGreaterThan(0);
    for (const [words] of rows) {
      expect(words).not.toEqual(['2', '2', 'fast', 'furious']);
      expect(words.includes('two')).toBe(false);
    }
    expect(rows.some(([words, tag]) => words.includes('22') && tag!.classes[tag!.written.indexOf('22')] === 'numerals')).toBe(true);
    const digits = await solve('182', { classes: ['numerals'] });
    expect(digits.last('count')).toMatchObject({ textLeftOut: true });
    const texts = tagged(digits).map(([words]) => words.join(' '));
    expect(texts).not.toContain('182');
    expect(texts).toContain('18 2');
    expect(texts.some((t) => t.includes('28'))).toBe(false);
  });

  it('parses a packed tag line as the engine writes it', () => {
    expect(parseTag('')).toBeNull();
    expect(parseTag('$:s|leet -|hake$ x')).toEqual({ reading: { $: 's' }, classes: ['leet', null], written: ['hake$', 'x'] });
    expect(parseTag('|shorthand shorthand - blends|1 2 link b8')).toEqual({
      reading: {},
      classes: ['shorthand', 'shorthand', null, 'blends'],
      written: ['1', '2', 'link', 'b8'],
    });
  });
});
