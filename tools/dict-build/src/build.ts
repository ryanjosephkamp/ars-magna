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
import {
  DIST_DIR,
  FACTS_CACHE,
  FREQ_PATH,
  META_PATH,
  WORDNET_DICT,
  WORDS_PATH,
} from './paths.ts';
import { normalize, signature } from './normalize.ts';
import { loadFacts } from './facts.ts';
import { COMMON_RANK_CUTOFF, frequencyRanks, inCommon, inFull, inStandard, zipfByte, type WordFacts } from './tiers.ts';
import { buildPos } from './pos.ts';
import { ADDITIONS_CAP, readAdditions, readForms } from './vocab.ts';
import {
  bitsetCount,
  bitsetGet,
  bitsetSet,
  decodeDict,
  encodeBitsets,
  encodeDict,
  makeBitset,
  type DictForm,
} from './format.ts';

/**
 * Which list the artifact carries. It was Full until the site had words of its
 * own; the shipped list is the union now, and Full became a bitset over it.
 * Nothing reads this byte — it is provenance for anyone opening the file — but
 * leaving it at the old value would be a lie in the header.
 */
const TIER_EXTENDED = 3;

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
  /** 1-based rank among the pinned list's words, 0 = absent from the corpus or a site addition. */
  rank: Int32Array;
  zipf: Uint8Array;
  attested: number;
};

async function loadFrequency(
  indexOf: ReadonlyMap<string, number>,
  size: number,
  isAddition: (index: number) => boolean,
): Promise<Frequency> {
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

  // An addition keeps its frequency, which orders results, but takes no rank.
  const rank = frequencyRanks(occurrences, (index) => !isAddition(index));

  const zipf = new Uint8Array(size);
  let attested = 0;
  for (let i = 0; i < size; i++) {
    zipf[i] = zipfByte(occurrences[i]!, corpusTotal);
    if (occurrences[i]! > 0) attested++;
  }

  return { rank, zipf, attested };
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
  const pinned = await loadWords();
  const { hyphenated, nonAscii, collisions } = pinned;
  console.log(
    `   ${pinned.words.length.toLocaleString()} words ` +
      `(${hyphenated} hyphenated, ${nonAscii.length} accented, ${collisions} collisions)`,
  );

  if (pinned.words.length !== EXPECTED.normalizedWords) {
    throw new Error(
      `expected ${EXPECTED.normalizedWords} normalized words, got ${pinned.words.length}`,
    );
  }
  if (hyphenated !== EXPECTED.hyphenatedSurfaces) {
    throw new Error(`expected ${EXPECTED.hyphenatedSurfaces} hyphenated surfaces, got ${hyphenated}`);
  }
  if (nonAscii.join(',') !== EXPECTED.nonAsciiSurfaces.join(',')) {
    throw new Error(`unexpected non-ASCII surfaces: ${nonAscii.join(', ')}`);
  }

  console.log('\n2. signatures');
  const signatures = new Set<string>();
  for (const word of pinned.words) signatures.add(signature(word));
  console.log(`   ${signatures.size.toLocaleString()} distinct anagram classes`);
  if (signatures.size !== EXPECTED.signatures) {
    throw new Error(`expected ${EXPECTED.signatures} signatures, got ${signatures.size}`);
  }

  // Every tripwire above is measured against the pin alone, before the site's
  // own words join it. A pin that moved has to be caught, and it would not be if
  // the lists were counted together.
  console.log('\n3. additions and forms');
  const additions = await readAdditions();
  const forms = await readForms();
  const [fewest, most] = EXPECTED.additionsRange;
  if (additions.length < fewest || additions.length > most) {
    throw new Error(`${additions.length} additions outside the expected band ${fewest}–${most}`);
  }
  const [fewestForms, mostForms] = EXPECTED.formsRange;
  if (forms.length < fewestForms || forms.length > mostForms) {
    throw new Error(`${forms.length} forms outside the expected band ${fewestForms}–${mostForms}`);
  }
  if (additions.length + forms.length > ADDITIONS_CAP) {
    throw new Error(`${additions.length} additions and ${forms.length} forms are over the cap of ${ADDITIONS_CAP} together`);
  }

  const pinnedSet = new Set(pinned.words);
  for (const addition of additions) {
    if (pinnedSet.has(addition.word)) {
      throw new Error(`${addition.word} is already in English OpenList at the pinned revision`);
    }
  }

  const isAddition = new Set(additions.map((a) => a.word));
  // A form whose letters the pin already has (`it's`, `its`) adds a spelling
  // and nothing to the list; one whose letters it lacks (`don't`, `dont`) adds
  // the letters-word, in every tier. Rows show the form only for the latter.
  const isFormOnly = new Set(forms.map((f) => f.letters).filter((letters) => !pinnedSet.has(letters)));
  for (const form of forms) {
    if (isAddition.has(form.letters)) {
      throw new Error(`${form.form}: its letters ${form.letters} are a site addition, not a word a form can spell`);
    }
  }
  const dictForms: DictForm[] = forms.map((f) => ({ letters: f.letters, form: f.form, shown: isFormOnly.has(f.letters) }));
  const formPos = new Map<string, readonly string[]>();
  for (const f of forms) if (isFormOnly.has(f.letters) && f.pos) formPos.set(f.letters, f.pos);

  const words = [...pinned.words, ...isAddition, ...isFormOnly].sort();
  const indexOf = new Map<string, number>();
  words.forEach((w, i) => indexOf.set(w, i));
  // An addition usually joins a class that already exists — `doomer` lands with
  // `moored` — but it may open a new one, so the count the manifest reports is
  // taken over the union while the tripwire above stays on the pin.
  for (const word of isAddition) signatures.add(signature(word));
  for (const word of isFormOnly) signatures.add(signature(word));
  console.log(
    additions.length === 0
      ? '   no additions'
      : `   ${additions.length} site addition${additions.length === 1 ? '' : 's'}: ` +
          additions.map((a) => a.word).join(', '),
  );
  console.log(
    forms.length === 0
      ? '   no forms'
      : `   ${forms.length} listed form${forms.length === 1 ? '' : 's'}, ${isFormOnly.size} of them ` +
          `word${isFormOnly.size === 1 ? '' : 's'} the pin lacks: ${[...isFormOnly].join(', ')}`,
  );

  console.log('\n4. provenance');
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

  console.log('\n5. frequency');
  // Neither an addition nor a form's letters-word takes a rank: Common's top
  // 40,000 are the pin's own, and `dont` at 9,523 occurrences would push the
  // 40,000th out. A form is in Common by listing instead.
  const { rank, zipf, attested } = await loadFrequency(
    indexOf,
    words.length,
    (index) => isAddition.has(words[index]!) || isFormOnly.has(words[index]!),
  );
  console.log(
    `   ${attested.toLocaleString()} words carry frequency data ` +
      `(${FREQUENCY.repo}@${FREQUENCY.rev.slice(0, 8)})`,
  );

  console.log('\n6. tiers');
  const commonSet = makeBitset(words.length);
  const standardSet = makeBitset(words.length);
  const fullSet = makeBitset(words.length);

  for (let i = 0; i < words.length; i++) {
    const word = words[i]!;
    const input = { word, facts: facts[i]!, freqRank: rank[i]!, addition: isAddition.has(word), form: isFormOnly.has(word) };
    if (inCommon(input)) bitsetSet(commonSet, i);
    if (inStandard(input)) bitsetSet(standardSet, i);
    if (inFull(input)) bitsetSet(fullSet, i);
  }

  const commonCount = bitsetCount(commonSet);
  const standardCount = bitsetCount(standardSet);
  const fullCount = bitsetCount(fullSet);
  console.log(`   common   ${commonCount.toLocaleString()} (rank ≤ ${COMMON_RANK_CUTOFF.toLocaleString()})`);
  console.log(`   standard ${standardCount.toLocaleString()}`);
  console.log(`   full     ${fullCount.toLocaleString()}`);
  console.log(`   extended ${words.length.toLocaleString()}`);

  const [low, high] = EXPECTED.standardRange;
  if (standardCount < low || standardCount > high) {
    throw new Error(`standard tier ${standardCount} outside expected band ${low}–${high}`);
  }
  // Full is the pin plus the forms' letters-words the pin lacks, exactly.
  if (fullCount !== EXPECTED.normalizedWords + isFormOnly.size) {
    throw new Error(
      `full tier ${fullCount} is not the pinned list's ${EXPECTED.normalizedWords} plus the ${isFormOnly.size} form-only words`,
    );
  }
  // Counts alone would let a word slip sideways between tiers unnoticed, so the
  // nesting is checked word by word: Common ⊆ Standard ⊆ Full. Extended is the
  // whole list and so has nothing to check.
  for (let i = 0; i < words.length; i++) {
    if (bitsetGet(commonSet, i) && !bitsetGet(standardSet, i)) {
      throw new Error(`tier nesting violated: ${words[i]} is common but not standard`);
    }
    if (bitsetGet(standardSet, i) && !bitsetGet(fullSet, i)) {
      throw new Error(`tier nesting violated: ${words[i]} is standard but not full`);
    }
  }

  console.log('\n7. parts of speech');
  const pos = await buildPos({ dir: WORDNET_DICT, words, formPos });
  console.log(
    `   ${pos.fromCurated.toLocaleString()} curated · ` +
      `${pos.fromWordNet.toLocaleString()} WordNet · ` +
      `${pos.fromForms.toLocaleString()} forms · ` +
      `${pos.fromSuffix.toLocaleString()} suffix · ` +
      `${pos.unknown.toLocaleString()} unknown`,
  );

  console.log('\n8. artifacts');
  await mkdir(DIST_DIR, { recursive: true });

  // One word list plus three bitsets. A standalone Common artifact used to be
  // emitted as well; nothing ever loaded it, since switching tiers is a
  // bitset lookup over the one list. The artifact keys stay `full` and `tiers`:
  // they name files the engine and the CLI already ask for, and renaming them
  // would buy nothing.
  const fullBin = encodeDict({ words, zipf, pos: pos.bytes, forms: dictForms, tier: TIER_EXTENDED });
  const bits = encodeBitsets(words.length, [commonSet, standardSet, fullSet]);

  // Round-trip every artifact before it is written. A silent encoder bug here
  // would be invisible until the worker tried to solve with a corrupt list.
  const roundTrip = decodeDict(fullBin);
  if (roundTrip.words.length !== words.length) throw new Error('round-trip: word count differs');
  for (let i = 0; i < words.length; i++) {
    if (roundTrip.words[i] !== words[i]) {
      throw new Error(`round-trip: word ${i} "${roundTrip.words[i]}" != "${words[i]}"`);
    }
  }
  if (JSON.stringify(roundTrip.forms) !== JSON.stringify(dictForms)) throw new Error('round-trip: the forms differ');
  console.log('   round-trip ✓');

  const artifacts = [await emit('full', 'bin', fullBin), await emit('tiers', 'bits', bits)];

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
      full: fullCount,
      extended: words.length,
      signatures: signatures.size,
      withFrequency: attested,
      /** The listed forms, and how many of them are words the pin lacks, which every tier gains. */
      forms: forms.length,
      formOnly: isFormOnly.size,
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
