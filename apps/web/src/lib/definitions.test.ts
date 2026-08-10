/**
 * Runs the real client against the real shard files off disk.
 *
 * The load-bearing check is hash parity: the browser and the build script each
 * compute FNV-1a to decide which shard a word lives in, and if they ever
 * disagree nothing throws — the app just quietly reports "no definition" for
 * almost every word. That failure is invisible without a test like this.
 */
import { describe, expect, it, beforeAll, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { Definitions, fnv1a, shouldExplain } from './definitions.ts';
import { fnv1a as buildFnv1a, shardOf } from '../../../../tools/dict-build/src/hash.ts';

const here = dirname(fileURLToPath(import.meta.url));
const defsDir = resolve(here, '../../public/defs');
const built = existsSync(resolve(defsDir, 'manifest.json'));

describe('fnv1a', () => {
  it('matches the build script on every kind of input', () => {
    const words = [
      '',
      'a',
      'dormitory',
      'anagrams',
      'abacteremicer',
      'zzzzzzzz',
      'ryanjosephkamp',
      'qi',
      'internationalization',
    ];
    for (const word of words) {
      expect(fnv1a(word)).toBe(buildFnv1a(word));
      expect(fnv1a(word) % 512).toBe(shardOf(word, 512));
    }
  });

  it('produces the documented FNV-1a values', () => {
    // Reference vectors, so a change to either implementation is caught even if
    // both were changed the same wrong way.
    expect(fnv1a('')).toBe(0x811c9dc5);
    expect(fnv1a('a')).toBe(0xe40c292c);
    expect(fnv1a('foobar')).toBe(0xbf9cf968);
  });

  it('stays inside 32 bits', () => {
    for (const word of ['dormitory', 'a'.repeat(200), 'ünïcodé']) {
      const hash = fnv1a(word);
      expect(Number.isInteger(hash)).toBe(true);
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThanOrEqual(0xffffffff);
    }
  });
});

describe.skipIf(!built)('Definitions', () => {
  let defs: Definitions;
  let fetches: string[];

  beforeAll(() => {
    // Serve the shard files off disk through the client's real fetch path.
    vi.stubGlobal('fetch', async (input: string) => {
      fetches.push(String(input));
      const path = resolve(defsDir, String(input).replace(/^\/defs\//, ''));
      if (!existsSync(path)) return new Response(null, { status: 404 });
      return new Response(await readFile(path, 'utf8'), { status: 200 });
    });
    fetches = [];
    defs = new Definitions('/defs');
  });

  it('finds a definition for an ordinary word', async () => {
    const info = await defs.lookup('dormitory');
    expect(info.senses.length).toBeGreaterThan(0);
    expect(info.senses[0]!.base).toBeUndefined();
    // Note `dormitory` is a TWL entry, not a verification-pipeline one — 46% of
    // the list is. That is exactly why `shouldExplain` suppresses the Scrabble
    // label whenever a definition is present.
    expect(info.provenance).toBe('twl');
    expect(shouldExplain(info)).toBe(false);
  });

  it('orders senses by frequency, not by file position', async () => {
    // This is the whole reason the build parses `index.*` rather than reading
    // glosses straight out of `data.*`. WordNet's commonest sense of
    // `dormitory` is the residence building; the sleeping room is second.
    const info = await defs.lookup('dormitory');
    expect(info.senses[0]!.gloss.toLowerCase()).toContain('students');
    expect(info.senses.map((s) => s.gloss.toLowerCase()).join(' ')).toContain('sleep');
  });

  it('reaches an inflected word through its base form', async () => {
    const info = await defs.lookup('dormitories');
    expect(info.senses.length).toBeGreaterThan(0);
    // The gloss is about `dormitory`, and the interface must be able to say so.
    expect(info.senses[0]!.base).toBe('dormitory');
  });

  it('never claims a gloss was written about the word when it was not', async () => {
    for (const word of ['abandoning', 'abbots', 'runs']) {
      const info = await defs.lookup(word);
      for (const sense of info.senses) {
        if (sense.base !== undefined) expect(sense.base).not.toBe(word);
      }
    }
  });

  it('flags machine-derived words rather than presenting them as ordinary', async () => {
    const info = await defs.lookup('abacteremicer');
    expect(info.provenance).toBe('generated');
    // No definition and an odd word — this is precisely when an explanation earns
    // its place.
    expect(shouldExplain(info)).toBe(true);
  });

  it('explains an undefined word by where it came from', async () => {
    // `qi` is a real tournament word most people will not recognize, and
    // WordNet has no entry for it.
    const info = await defs.lookup('qi');
    if (info.senses.length === 0) expect(shouldExplain(info)).toBe(true);
  });

  it('returns an empty result for a word with no definition', async () => {
    const info = await defs.lookup('abacteremicer');
    expect(info.senses).toEqual([]);
    expect(info.word).toBe('abacteremicer');
  });

  it('fetches each shard once however many words hit it', async () => {
    const fresh = new Definitions('/defs');
    fetches = [];
    // Same word twice, plus two more — at most one request per distinct shard.
    await fresh.lookupAll(['dormitory', 'dormitory', 'anagrams', 'moon']);
    const distinct = new Set(fetches);
    expect(fetches.length).toBe(distinct.size);
    expect(fetches.length).toBeLessThanOrEqual(3);
  });

  it('degrades quietly when a shard cannot be fetched', async () => {
    const broken = new Definitions('/nowhere');
    const info = await broken.lookup('dormitory');
    expect(info.senses).toEqual([]);
    expect(info.provenance).toBe('attested');
  });

  it('evicts old shards instead of growing without bound', async () => {
    const small = new Definitions('/defs', 512, 2);
    fetches = [];
    // Four words chosen to land in four different shards.
    const words = ['dormitory', 'anagrams', 'moon', 'starer'];
    const shards = new Set(words.map((w) => fnv1a(w) % 512));
    expect(shards.size).toBe(4);

    // Sequentially, not via lookupAll: parallel lookups all start before any
    // finishes, so which two shards survive eviction would depend on completion
    // order and the assertion below would be a coin flip.
    for (const word of words) await small.lookup(word);

    fetches = [];
    // With a cap of 2, the first word's shard is long gone and must refetch.
    await small.lookup(words[0]!);
    expect(fetches.length).toBe(1);

    // ...while the most recent one is still cached.
    fetches = [];
    await small.lookup(words[0]!);
    expect(fetches.length).toBe(0);
  });
});
