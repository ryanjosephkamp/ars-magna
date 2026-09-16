/**
 * Builds the definition shards.
 *
 *   pnpm dict:shards
 *
 * Definitions are fetched only when a user expands a word, so they are sharded
 * by a hash of the word rather than shipped whole: 10 MB of glosses would
 * triple the app's download for something most visitors never open.
 *
 * Each shard also carries **provenance** for the words in it. English OpenList
 * deliberately includes machine-derived forms (`abacteremicer`, `nonlivabler`)
 * and unusual-but-real Scrabble words, and a result built from one of those
 * looks like a bug unless the interface can say where the word came from.
 * Attested words are the unremarkable case and are left out to save space.
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { gzipSync, constants as zlib } from 'node:zlib';

import { OPENLIST, WORDNET } from './pins.ts';
import { DEFS_DIR, FACTS_CACHE, META_PATH, WORDNET_DICT, WORDS_PATH } from './paths.ts';
import { normalize } from './normalize.ts';
import { loadFacts } from './facts.ts';
import { loadSenses, type Sense } from './wordnet.ts';
import { readAdditions } from './vocab.ts';
import { shardOf } from './hash.ts';

/** 512 keeps each shard around 20–40 KB — one fetch, no meaningful latency. */
const SHARD_COUNT = 512;

/** Beyond three, a definition popover becomes a dictionary page. */
const MAX_SENSES = 3;

/**
 * Provenance codes. `a` (attested by the verification pipeline) is the default
 * and is never written.
 */
const PROVENANCE = {
  twl: 't',
  generated: 'g',
  other: 'o',
  /** A word the site added; its gloss is written from the additions file. */
  addition: 'x',
} as const;

type Shard = {
  /** Words by provenance code; attested words are absent. */
  p: Record<string, string[]>;
  /**
   * Word -> senses. Each is `[partOfSpeech, definition]`, with a third element
   * naming the base form when the definition was reached through one
   * (`dormitories` -> `dormitory`) so the interface can say so rather than
   * implying the gloss was written about the inflected word.
   */
  d: Record<string, ([string, string] | [string, string, string])[]>;
};

function human(bytes: number): string {
  return bytes >= 1e6 ? `${(bytes / 1e6).toFixed(2)} MB` : `${(bytes / 1e3).toFixed(1)} KB`;
}

async function main(): Promise<void> {
  console.log('Ars Magna definition shards\n');

  console.log('1. word list');
  const surfaces = (await readFile(WORDS_PATH, 'utf8')).split('\n').filter((l) => l.length > 0);
  const pinned = [...new Set(surfaces.map(normalize).filter((w) => w.length > 0))];
  // The same union `build.ts` ships. A word's shard is a hash of the word alone,
  // but the provenance written beside it comes from arrays parallel to this
  // list, so the two have to be built the same way.
  const additions = await readAdditions();
  const glossOf = new Map(additions.map((a) => [a.word, a.gloss]));
  const words = [...new Set([...pinned, ...glossOf.keys()])].sort();
  const indexOf = new Map(words.map((w, i) => [w, i]));
  console.log(
    `   ${words.length.toLocaleString()} words ` +
      `(${glossOf.size} site addition${glossOf.size === 1 ? '' : 's'})`,
  );

  console.log('\n2. provenance');
  const facts = await loadFacts({
    metaPath: META_PATH,
    metaSha256: OPENLIST.files.meta.sha256,
    cachePath: resolve(FACTS_CACHE, `${OPENLIST.files.meta.sha256.slice(0, 16)}.bin`),
    indexOf,
    wordCount: words.length,
  });

  console.log('\n3. wordnet');
  const { senses, direct, derived, curated } = await loadSenses({
    dir: WORDNET_DICT,
    keep: new Set(words),
    maxSenses: MAX_SENSES,
  });
  const senseTotal = [...senses.values()].reduce((n, list) => n + list.length, 0);
  console.log(
    `   ${senses.size.toLocaleString()} words defined ` +
      `(${((senses.size / words.length) * 100).toFixed(1)}% of the list), ` +
      `${senseTotal.toLocaleString()} senses`,
  );
  console.log(
    `   ${direct.toLocaleString()} matched WordNet directly · ` +
      `${derived.toLocaleString()} via an inflected base form · ` +
      `${curated.toLocaleString()} carry a curated gloss`,
  );

  console.log('\n4. sharding');
  const shards: Shard[] = Array.from({ length: SHARD_COUNT }, () => ({ p: {}, d: {} }));
  let defined = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i]!;
    const shard = shards[shardOf(word, SHARD_COUNT)]!;
    const fact = facts[i]!;
    const gloss = glossOf.get(word);

    const code =
      gloss !== undefined
        ? PROVENANCE.addition
        : fact.generated
          ? PROVENANCE.generated
          : fact.twl
            ? PROVENANCE.twl
            : fact.nValid > 0
              ? null // attested — the default, not written
              : PROVENANCE.other;

    if (code !== null) (shard.p[code] ??= []).push(word);

    // An addition's gloss is its definition, and it carries no part of speech:
    // `kind` — slang, a coinage, an abbreviation — is not one, and asking a
    // proposer to supply one would invite a wrong answer. The word panel names
    // it a site addition instead.
    if (gloss !== undefined) {
      shard.d[word] = [['', gloss]];
      defined++;
      continue;
    }

    const list = senses.get(word);
    if (list) {
      shard.d[word] = list.map((sense: Sense) =>
        sense.base === undefined
          ? ([sense.pos, sense.gloss] as [string, string])
          : ([sense.pos, sense.gloss, sense.base] as [string, string, string]),
      );
      defined++;
    }
  }

  await rm(DEFS_DIR, { recursive: true, force: true });
  await mkdir(DEFS_DIR, { recursive: true });

  let raw = 0;
  let compressed = 0;
  let largest = 0;

  for (let i = 0; i < SHARD_COUNT; i++) {
    const json = JSON.stringify(shards[i]);
    const gz = gzipSync(json, { level: zlib.Z_BEST_COMPRESSION });
    await writeFile(resolve(DEFS_DIR, `${i}.json`), json);
    raw += json.length;
    compressed += gz.length;
    largest = Math.max(largest, gz.length);
  }

  await writeFile(
    resolve(DEFS_DIR, 'manifest.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        shards: SHARD_COUNT,
        maxSenses: MAX_SENSES,
        definedWords: defined,
        totalWords: words.length,
        source: { name: 'WordNet 3.1', url: WORDNET.url, sha256: WORDNET.sha256 },
        // 'a' never appears in a shard; it is what absence means.
        provenance: {
          t: 'twl_scrabble',
          g: 'machine_generated',
          o: 'unattested',
          x: 'site_addition',
          a: 'attested',
        },
      },
      null,
      2,
    )}\n`,
  );

  await writeFile(resolve(DEFS_DIR, 'LICENSE'), WORDNET_LICENSE);

  console.log(
    `   ${SHARD_COUNT} shards · ${human(raw)} raw → ${human(compressed)} gzip · ` +
      `largest ${human(largest)}`,
  );

  const files = await readdir(DEFS_DIR);
  console.log(`\n✓ ${DEFS_DIR} (${files.length} files)`);
}

const WORDNET_LICENSE = `WordNet 3.1 Copyright 2011 The Trustees of Princeton University.
All rights reserved.

THIS SOFTWARE AND DATABASE IS PROVIDED "AS IS" AND PRINCETON UNIVERSITY MAKES
NO REPRESENTATIONS OR WARRANTIES, EXPRESS OR IMPLIED. By way of example, but
not limitation, PRINCETON UNIVERSITY MAKES NO REPRESENTATIONS OR WARRANTIES OF
MERCHANT-ABILITY OR FITNESS FOR ANY PARTICULAR PURPOSE OR THAT THE USE OF THE
LICENSED SOFTWARE, DATABASE OR DOCUMENTATION WILL NOT INFRINGE ANY THIRD PARTY
PATENTS, COPYRIGHTS, TRADEMARKS OR OTHER RIGHTS.

The name of Princeton University or Princeton may not be used in advertising or
publicity pertaining to distribution of the software and/or database. Title to
copyright in this software, database and any associated documentation shall at
all times remain with Princeton University and LICENSEE agrees to preserve
same.

The definitions in apps/web/public/defs are derived from this database.
`;

await main();
