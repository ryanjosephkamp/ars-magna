/**
 * Builds the shipped dictionary artifacts from the pinned sources.
 *
 *   pnpm dict:build     emit apps/web/public/dict/
 *   pnpm dict:verify    rebuild and assert the committed artifacts still match
 *
 * Deterministic: same pins in, byte-identical artifacts out. That property is
 * what `--verify` checks in CI, and it is the reason nothing here reads the
 * clock except the manifest's `builtAt` (which is excluded from the compare).
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { brotliCompressSync, constants as zlib } from 'node:zlib';

import { EXPECTED, FREQUENCY, OPENLIST } from './pins.ts';
import { DIST_DIR, FACTS_CACHE, FREQ_PATH, META_PATH, WORDS_PATH } from './paths.ts';
import { normalize, signature } from './normalize.ts';
import { loadFacts } from './facts.ts';
import { COMMON_RANK_CUTOFF, inCommon, inStandard, zipfByte, type WordFacts } from './tiers.ts';
import {
  bitsetCount,
  bitsetSet,
  decodeDict,
  encodeBitsets,
  encodeDict,
  makeBitset,
} from './format.ts';

const TIER_COMMON = 0;
const TIER_FULL = 2;

const verifyOnly = process.argv.includes('--verify');

function sha256(data: Uint8Array): string {
  return createHash('sha256').update(data).digest('hex');
}

function human(bytes: number): string {
  return bytes >= 1e6 ? `${(bytes / 1e6).toFixed(2)} MB` : `${(bytes / 1e3).toFixed(1)} KB`;
}

function brotli(data: Uint8Array): Buffer {
  return brotliCompressSync(data, {
    params: {
      [zlib.BROTLI_PARAM_QUALITY]: 11,
      [zlib.BROTLI_PARAM_SIZE_HINT]: data.length,
    },
  });
}

// ---------------------------------------------------------------- word list

type WordList = {
  words: string[];
  indexOf: Map<string, number>;
  hyphenated: number;
  nonAscii: string[];
  collisions: number;
};

async function loadWords(): Promise<WordList> {
  const text = await readFile(WORDS_PATH, 'utf8');
  const surfaces = text.split('\n').filter((line) => line.length > 0);

  if (surfaces.length !== EXPECTED.rawLines) {
    throw new Error(
      `expected ${EXPECTED.rawLines} raw lines, got ${surfaces.length}. ` +
        `The pin may have moved — review before updating EXPECTED.`,
    );
  }

  const seen = new Set<string>();
  let hyphenated = 0;
  const nonAscii: string[] = [];
  let collisions = 0;

  for (const surface of surfaces) {
    if (surface.includes('-')) hyphenated++;
    // eslint-disable-next-line no-control-regex
    if (/[^\x00-\x7F]/.test(surface)) nonAscii.push(surface);

    const word = normalize(surface);
    if (word.length === 0) continue;
    if (seen.has(word)) collisions++;
    else seen.add(word);
  }

  const words = [...seen].sort();
  const indexOf = new Map<string, number>();
  words.forEach((w, i) => indexOf.set(w, i));

  return { words, indexOf, hyphenated, nonAscii, collisions };
}

// ---------------------------------------------------------------- frequency

type Frequency = {
  /** 1-based rank among dictionary words, 0 = absent from the corpus. */
  rank: Int32Array;
  zipf: Uint8Array;
  attested: number;
};

async function loadFrequency(indexOf: ReadonlyMap<string, number>, size: number): Promise<Frequency> {
  const text = await readFile(FREQ_PATH, 'utf8');

  const occurrences = new Float64Array(size);
  let corpusTotal = 0;

  for (const line of text.split('\n')) {
    if (line.length === 0) continue;
    const space = line.indexOf(' ');
    if (space <= 0) continue;

    const count = Number(line.slice(space + 1));
    if (!Number.isFinite(count) || count <= 0) continue;
    corpusTotal += count;

    // Several surface forms collapse onto one search form ("don't" -> "dont");
    // their occurrences belong to the same word.
    const index = indexOf.get(normalize(line.slice(0, space)));
    if (index !== undefined) occurrences[index]! += count;
  }

  const present: number[] = [];
  for (let i = 0; i < size; i++) if (occurrences[i]! > 0) present.push(i);
  present.sort((a, b) => occurrences[b]! - occurrences[a]! || (a < b ? -1 : 1));

  const rank = new Int32Array(size);
  present.forEach((index, position) => {
    rank[index] = position + 1;
  });

  const zipf = new Uint8Array(size);
  for (let i = 0; i < size; i++) zipf[i] = zipfByte(occurrences[i]!, corpusTotal);

  return { rank, zipf, attested: present.length };
}

// ---------------------------------------------------------------- artifacts

type Artifact = { key: string; name: string; bytes: number; brotliBytes: number; sha256: string };

async function emit(key: string, extension: string, data: Uint8Array): Promise<Artifact> {
  const digest = sha256(data);
  const name = `${key}.${digest.slice(0, 12)}.${extension}`;
  const compressed = brotli(data);

  await writeFile(resolve(DIST_DIR, name), data);
  await writeFile(resolve(DIST_DIR, `${name}.br`), compressed);

  return { key, name, bytes: data.length, brotliBytes: compressed.length, sha256: digest };
}

async function clearStale(keep: ReadonlySet<string>): Promise<void> {
  let existing: string[];
  try {
    existing = await readdir(DIST_DIR);
  } catch {
    return;
  }
  for (const file of existing) {
    const base = file.endsWith('.br') ? file.slice(0, -3) : file;
    if (base === 'manifest.json' || keep.has(base)) continue;
    await unlink(resolve(DIST_DIR, file));
  }
}

// ---------------------------------------------------------------- pipeline

async function main(): Promise<void> {
  console.log(`Ars Magna dictionary build${verifyOnly ? ' (verify)' : ''}`);
  console.log(`  openlist ${OPENLIST.repo}@${OPENLIST.rev.slice(0, 12)}\n`);

  console.log('1. word list');
  const { words, indexOf, hyphenated, nonAscii, collisions } = await loadWords();
  console.log(
    `   ${words.length.toLocaleString()} words ` +
      `(${hyphenated} hyphenated, ${nonAscii.length} accented, ${collisions} collisions)`,
  );

  if (words.length !== EXPECTED.normalizedWords) {
    throw new Error(`expected ${EXPECTED.normalizedWords} normalized words, got ${words.length}`);
  }
  if (hyphenated !== EXPECTED.hyphenatedSurfaces) {
    throw new Error(`expected ${EXPECTED.hyphenatedSurfaces} hyphenated surfaces, got ${hyphenated}`);
  }
  if (nonAscii.join(',') !== EXPECTED.nonAsciiSurfaces.join(',')) {
    throw new Error(`unexpected non-ASCII surfaces: ${nonAscii.join(', ')}`);
  }

  console.log('\n2. signatures');
  const signatures = new Set<string>();
  for (const word of words) signatures.add(signature(word));
  console.log(`   ${signatures.size.toLocaleString()} distinct anagram classes`);
  if (signatures.size !== EXPECTED.signatures) {
    throw new Error(`expected ${EXPECTED.signatures} signatures, got ${signatures.size}`);
  }

  console.log('\n3. provenance');
  const facts: WordFacts[] = await loadFacts({
    metaPath: META_PATH,
    metaSha256: OPENLIST.files.meta.sha256,
    cachePath: resolve(FACTS_CACHE, `${OPENLIST.files.meta.sha256.slice(0, 16)}.bin`),
    indexOf,
    wordCount: words.length,
    onProgress: (seen) => process.stdout.write(`\r   ${seen.toLocaleString()} records…`),
  });
  process.stdout.write('\r');
  const twlCount = facts.filter((f) => f.twl).length;
  const generatedCount = facts.filter((f) => f.generated).length;
  console.log(
    `   ${twlCount.toLocaleString()} TWL · ${generatedCount.toLocaleString()} machine-generated`,
  );

  console.log('\n4. frequency');
  const { rank, zipf, attested } = await loadFrequency(indexOf, words.length);
  console.log(
    `   ${attested.toLocaleString()} words carry frequency data ` +
      `(${FREQUENCY.repo}@${FREQUENCY.rev.slice(0, 8)})`,
  );

  console.log('\n5. tiers');
  const commonSet = makeBitset(words.length);
  const standardSet = makeBitset(words.length);
  const commonWords: string[] = [];
  const commonZipf: number[] = [];

  for (let i = 0; i < words.length; i++) {
    const input = { word: words[i]!, facts: facts[i]!, freqRank: rank[i]! };
    if (inCommon(input)) {
      bitsetSet(commonSet, i);
      commonWords.push(words[i]!);
      commonZipf.push(zipf[i]!);
    }
    if (inStandard(input)) bitsetSet(standardSet, i);
  }

  const commonCount = bitsetCount(commonSet);
  const standardCount = bitsetCount(standardSet);
  console.log(`   common   ${commonCount.toLocaleString()} (rank ≤ ${COMMON_RANK_CUTOFF.toLocaleString()})`);
  console.log(`   standard ${standardCount.toLocaleString()}`);
  console.log(`   full     ${words.length.toLocaleString()}`);

  const [low, high] = EXPECTED.standardRange;
  if (standardCount < low || standardCount > high) {
    throw new Error(`standard tier ${standardCount} outside expected band ${low}–${high}`);
  }
  if (commonCount > standardCount) {
    throw new Error('tier nesting violated: common ⊄ standard');
  }

  console.log('\n6. artifacts');
  await mkdir(DIST_DIR, { recursive: true });

  const fullBin = encodeDict({ words, zipf, tier: TIER_FULL });
  const commonBin = encodeDict({
    words: commonWords,
    zipf: Uint8Array.from(commonZipf),
    tier: TIER_COMMON,
  });
  const bits = encodeBitsets(words.length, [commonSet, standardSet]);

  // Round-trip every artifact before it is written. A silent encoder bug here
  // would be invisible until the worker tried to solve with a corrupt list.
  const roundTrip = decodeDict(fullBin);
  if (roundTrip.words.length !== words.length) throw new Error('round-trip: word count differs');
  for (let i = 0; i < words.length; i++) {
    if (roundTrip.words[i] !== words[i]) {
      throw new Error(`round-trip: word ${i} "${roundTrip.words[i]}" != "${words[i]}"`);
    }
  }
  const commonRoundTrip = decodeDict(commonBin);
  for (let i = 0; i < commonWords.length; i++) {
    if (commonRoundTrip.words[i] !== commonWords[i]) {
      throw new Error(`round-trip: common word ${i} differs`);
    }
  }
  console.log('   round-trip ✓');

  const artifacts = [
    await emit('full', 'bin', fullBin),
    await emit('common', 'bin', commonBin),
    await emit('tiers', 'bits', bits),
  ];

  for (const a of artifacts) {
    console.log(`   ${a.name.padEnd(28)} ${human(a.bytes).padStart(9)} → ${human(a.brotliBytes)} br`);
  }

  const manifest = {
    schemaVersion: 1,
    builtAt: new Date().toISOString(),
    source: {
      repo: OPENLIST.repo,
      rev: OPENLIST.rev,
      wordsSha256: OPENLIST.files.words.sha256,
    },
    frequency: { repo: FREQUENCY.repo, rev: FREQUENCY.rev },
    counts: {
      common: commonCount,
      standard: standardCount,
      full: words.length,
      signatures: signatures.size,
      withFrequency: attested,
    },
    files: Object.fromEntries(
      artifacts.map((a) => [
        a.key,
        { name: a.name, bytes: a.bytes, brotliBytes: a.brotliBytes, sha256: a.sha256 },
      ]),
    ),
  };

  const manifestPath = resolve(DIST_DIR, 'manifest.json');

  if (verifyOnly) {
    const previous = JSON.parse(await readFile(manifestPath, 'utf8')) as typeof manifest;
    const drift: string[] = [];
    for (const a of artifacts) {
      const before = previous.files[a.key];
      if (!before) drift.push(`${a.key}: missing from committed manifest`);
      else if (before.sha256 !== a.sha256) {
        drift.push(`${a.key}: ${before.sha256.slice(0, 12)} → ${a.sha256.slice(0, 12)}`);
      }
    }
    if (drift.length) {
      console.error(`\n✗ artifacts drifted:\n  ${drift.join('\n  ')}`);
      process.exit(1);
    }
    console.log('\n✓ artifacts match the committed manifest');
    return;
  }

  await clearStale(new Set(artifacts.map((a) => a.name)));
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`\n✓ ${DIST_DIR}`);
}

await main();
