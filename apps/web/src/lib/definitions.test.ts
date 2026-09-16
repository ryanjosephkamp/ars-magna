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

import { Definitions, PROVENANCE_LABEL, fnv1a, shouldExplain } from './definitions.ts';
import { fnv1a as buildFnv1a, shardOf } from '../../../../tools/dict-build/src/hash.ts';

const here = dirname(fileURLToPath(import.meta.url));
const defsDir = resolve(here, '../../public/defs');
const built = existsSync(resolve(defsDir, 'manifest.json'));

describe('provenance labels', () => {
  it('answer the question the reader asked, then say why the word is in the list', () => {
    // Each label stands in for a definition, so it carries the "no definition"
    // half itself, and reads as a sentence like every other message.
    expect(PROVENANCE_LABEL.attested).toBeNull();
    expect(PROVENANCE_LABEL.twl).toBe('No definition found — valid in tournament play.');
    expect(PROVENANCE_LABEL.generated).toBe('No definition found — a machine-derived form in English OpenList.');
    expect(PROVENANCE_LABEL.unattested).toBe('No definition found — and no source confirms this word.');
  });
});

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

  it('leads with the sense the word is actually used in', async () => {
    // Senses used to be collected noun-first and truncated at three, so a word
    // with three noun senses never reached its verb however common that verb
    // was. `be` was defined as beryllium, `come` as semen, `more` as Thomas
    // More. Ranking by WordNet's corpus tag count fixes all of them at once —
    // the verb `be` is tagged 10,742 times, beryllium not once.
    const expected: Record<string, { pos: string; contains: string }> = {
      be: { pos: 'v', contains: 'quality of being' },
      come: { pos: 'v', contains: 'move toward' },
      say: { pos: 'v', contains: 'express in words' },
      have: { pos: 'v', contains: 'possess' },
      see: { pos: 'v', contains: 'perceive' },
      go: { pos: 'v', contains: 'change location' },
      more: { pos: 'adv', contains: 'comparative' },
      begin: { pos: 'v', contains: 'first step' },
      add: { pos: 'v', contains: 'addition' },
    };

    for (const [word, want] of Object.entries(expected)) {
      const info = await defs.lookup(word);
      expect(info.senses.length, word).toBeGreaterThan(0);
      expect(info.senses[0]!.pos, word).toBe(want.pos);
      expect(info.senses[0]!.gloss.toLowerCase(), word).toContain(want.contains);
    }
  });

  it('reaches a common verb even when the noun senses outnumber it', async () => {
    // `do` has three noun senses — a party, the musical note, and a doctorate —
    // which used to consume the entire budget and leave the verb unreachable.
    const info = await defs.lookup('do');
    expect(info.senses.some((s) => s.pos === 'v')).toBe(true);
  });

  it('defines the words WordNet structurally cannot', async () => {
    // WordNet has no pronouns, determiners, prepositions or conjunctions, so
    // `you`, `the`, `of` and `and` — four of the commonest words in English —
    // arrived with nothing at all.
    for (const [word, pos] of [
      ['you', 'pron'],
      ['the', 'det'],
      ['of', 'prep'],
      ['and', 'conj'],
      ['sh', 'interj'],
    ] as const) {
      const info = await defs.lookup(word);
      expect(info.senses.length, word).toBeGreaterThan(0);
      expect(info.senses[0]!.pos, word).toBe(pos);
    }
  });

  it('puts a curated gloss in front of WordNet rather than instead of it', async () => {
    // `me` was defined as a state in New England and nothing else. Prepending
    // rather than replacing keeps the abbreviation, which is real, behind the
    // pronoun, which is what a reader meant.
    const me = await defs.lookup('me');
    expect(me.senses[0]!.pos).toBe('pron');
    expect(me.senses.map((s) => s.gloss).join(' ')).toContain('New England');

    // The same mechanism is why `ar` no longer opens on argon.
    const ar = await defs.lookup('ar');
    expect(ar.senses[0]!.gloss).toContain('letter R');
    expect(ar.senses.map((s) => s.gloss).join(' ')).toContain('inert gas');

    // And it must not clobber a WordNet definition that was already good.
    const mine = await defs.lookup('mine');
    expect(mine.senses[0]!.pos).toBe('pron');
    expect(mine.senses.map((s) => s.gloss).join(' ')).toContain('excavation');
  });

  it('reaches an -ly adverb through its adjective', async () => {
    // These rules sit under `adj`, not `adv`, because that is where the base
    // form is. Filed under `adv` they matched nothing at all.
    for (const [word, base] of [
      ['bizarrely', 'bizarre'],
      ['awesomely', 'awesome'],
      ['seamlessly', 'seamless'],
    ] as const) {
      const info = await defs.lookup(word);
      expect(info.senses.length, word).toBeGreaterThan(0);
      expect(info.senses[0]!.base, word).toBe(base);
    }
  });

  it('leaves an agent noun undefined rather than calling it its own root', async () => {
    // Stripping `-er` was tried and reverted: it made `carer` "a motor vehicle
    // with four wheels". A missing definition beats a confident wrong one.
    for (const word of ['carer', 'baller', 'basher']) {
      const info = await defs.lookup(word);
      expect(info.senses.length, word).toBe(0);
    }
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
