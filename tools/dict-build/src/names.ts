/**
 * The names list, `data/vocabulary/names.jsonl` (phase Q1, the names experiment).
 *
 *   pnpm names:build            fetch the pinned sources into .cache/names/, extract, write the list
 *   pnpm names:build --verify   rebuild from the cached sources and compare with the committed list
 *   pnpm names:build --refresh  fetch every source again, whatever the cache holds, and print the pins
 *                               for what came back, for `NAMES` in pins.ts
 *
 * The vocabulary has no names: English OpenList leaves them out by rule, and a
 * name enters today only as an addition of kind `name`, one at a time. This
 * list is the other side of the experiment that decides whether names should
 * be admitted as a set: about ten thousand single tokens the dictionary lacks,
 * from Wikidata by prominence (people, places, companies and brands, notable
 * entities only), the US Census surname and given-name lists, and GeoNames,
 * each with its kind and its source. A deep run admits it with
 * `pnpm hits:enumerate --names`; nothing on the site reads it, and it is in no
 * tier.
 *
 * Deterministic from the cached sources: same answers in, byte-identical list
 * out, which `--verify` checks. Two sources move (see `NAMES` in pins.ts), so
 * the cached answers are what reproduces the list, and a fresh fetch is a new
 * day's Wikidata and GeoNames.
 */
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

import { CACHE_DIR } from './paths.ts';
import { normalize } from './normalize.ts';
import { NAMES } from './pins.ts';
import { NAMES_PATH, committedDictionary, nameProblems, readNames, type Name, type NameKind, type NameSource } from './vocab.ts';

const run = promisify(execFile);

export const NAMES_CACHE = resolve(CACHE_DIR, 'names');

// ------------------------------------------------------------------ tokens

/**
 * The pieces of a name that are not names: particles, articles and
 * prepositions of the languages names come in, and the abbreviations that
 * follow a person. Most are English words already and would fall to the
 * dictionary rule anyway; these are the ones that are not.
 */
export const PARTICLES: ReadonlySet<string> = new Set([
  'da', 'das', 'de', 'dei', 'del', 'della', 'delle', 'dello', 'dem', 'den', 'der', 'des', 'di', 'do', 'dos', 'du',
  'el', 'la', 'las', 'le', 'les', 'lo', 'los',
  'van', 'von', 'vom', 'zu', 'zum', 'zur', 'ter', 'ten',
  'al', 'bin', 'ibn', 'bint', 'abu', 'ben', 'bar',
  'san', 'santa', 'santo', 'sao', 'saint', 'sainte', 'st', 'ste',
  'jr', 'sr', 'mc', 'mac',
  'und', 'et', 'och', 'og',
]);

/** A Roman numeral, as a regnal number is written: `II`, `XIV`, `MDCCLXXVI`. */
export function isRomanNumeral(token: string): boolean {
  return /^m{0,3}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$/.test(token) && token.length > 0;
}

/** Where one token of a label ends and the next begins. */
const SEPARATOR = /[\s\-\u2010-\u2015'\u2018\u2019.,()/&:;"\u201c\u201d!?]+/u;

/**
 * The tokens of a label, as the search would fold them: each piece between
 * separators, lowercase with accents folded, kept when it is two letters or
 * more and neither a particle nor a Roman numeral. `Rio de Janeiro` gives
 * `rio` and `janeiro`; `Louis XIV` gives `louis`. A name is its letters: the
 * digits and symbols of `3M`, `Boeing 747` or `Canal+` are dropped before the
 * fold rather than read as words, which the search does for a text since
 * phase N.
 */
export function tokensOf(label: string): string[] {
  const out: string[] = [];
  for (const piece of label.split(SEPARATOR)) {
    const token = normalize(piece.replace(/[^\p{L}\p{M}]+/gu, ''));
    if (token.length < 2 || token.length > 45) continue;
    if (PARTICLES.has(token) || isRomanNumeral(token)) continue;
    if (!out.includes(token)) out.push(token);
  }
  return out;
}

// -------------------------------------------------------------- attestation

/** One place a token turned up: which source, as what kind, from which label, how prominent. */
export type Attestation = {
  kind: NameKind;
  source: NameSource;
  from?: string;
  trace: string;
  prominence: number;
};

/** The order sources decide a token's kind in, first wins. */
const SOURCE_ORDER: readonly NameSource[] = ['wikidata', 'census-surnames-2000', 'census-given-1990', 'geonames'];

/**
 * Whether `a` is the more prominent attestation of the two, within one
 * source. Surnames rank from 1 up, so a lower figure is the more prominent
 * one there; everywhere else it is the higher figure.
 */
function moreProminent(a: Attestation, b: Attestation): boolean {
  if (a.source === 'census-surnames-2000') return a.prominence < b.prominence;
  return a.prominence > b.prominence;
}

/**
 * Every token's attestations gathered into lines: one line per token the
 * dictionary lacks, its kind and source from the first source in
 * `SOURCE_ORDER` that carries it, its most prominent attestation there, and
 * under `also` the other sources, and the other kinds within the first, that
 * carry it too. Sorted by name. Pure, so the test can hold it to the rule.
 */
export function mergeNames(attestations: ReadonlyMap<string, readonly Attestation[]>, dictionary: ReadonlySet<string>): Name[] {
  const lines: Name[] = [];
  for (const [name, list] of attestations) {
    if (dictionary.has(name) || list.length === 0) continue;
    // The best attestation of each (source, kind), then the sources in order.
    const best = new Map<string, Attestation>();
    for (const a of list) {
      const key = `${a.source}|${a.kind}`;
      const have = best.get(key);
      if (!have || moreProminent(a, have)) best.set(key, a);
    }
    const ordered = [...best.values()].sort((a, b) => {
      const bySource = SOURCE_ORDER.indexOf(a.source) - SOURCE_ORDER.indexOf(b.source);
      if (bySource !== 0) return bySource;
      return moreProminent(a, b) ? -1 : moreProminent(b, a) ? 1 : a.kind.localeCompare(b.kind);
    });
    const [primary, ...rest] = ordered;
    if (!primary) continue;
    const line: Name = {
      name,
      kind: primary.kind,
      source: primary.source,
      ...(primary.from === undefined ? {} : { from: primary.from }),
      trace: primary.trace,
      prominence: primary.prominence,
    };
    if (rest.length > 0) {
      line.also = rest.map((a) => ({
        kind: a.kind,
        source: a.source,
        ...(a.from === undefined ? {} : { from: a.from }),
        prominence: a.prominence,
      }));
    }
    lines.push(line);
  }
  return lines.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

function attest(into: Map<string, Attestation[]>, token: string, attestation: Attestation): void {
  const list = into.get(token) ?? [];
  list.push(attestation);
  into.set(token, list);
}

// ------------------------------------------------------------------ sources

type WikidataAnswer = { results: { bindings: { item: { value: string }; label: { value: string }; sl: { value: string } }[] } };

/** The entities a Wikidata answer names, by item id, each with its English label and sitelink count. */
export function parseWikidata(json: string): { id: string; label: string; sitelinks: number }[] {
  const answer = JSON.parse(json) as WikidataAnswer;
  const rows = answer.results.bindings.map((b) => ({
    id: b.item.value.split('/').pop() ?? b.item.value,
    label: b.label.value,
    sitelinks: Number(b.sl.value),
  }));
  // The service answers in no fixed order; the list must not depend on it.
  return rows.sort((a, b) => a.id.localeCompare(b.id));
}

/** The surnames of the 2000 Census file (`name,rank,count,…`), the first `take` by rank. */
export function parseSurnames(csv: string, take: number): { name: string; rank: number }[] {
  const out: { name: string; rank: number }[] = [];
  for (const line of csv.split('\n').slice(1)) {
    const [name, rank] = line.split(',');
    if (!name || !rank || !/^\d+$/.test(rank)) continue;
    // The file ends with a row for every other name together.
    if (name.includes(' ')) continue;
    out.push({ name, rank: Number(rank) });
  }
  return out.sort((a, b) => a.rank - b.rank).slice(0, take);
}

/** The given names of a 1990 Census file (`NAME percent cumulative rank`), from `minPercent` up. */
export function parseGiven(text: string, minPercent: number): { name: string; percent: number }[] {
  const out: { name: string; percent: number }[] = [];
  for (const line of text.split('\n')) {
    const [name, percent] = line.trim().split(/\s+/);
    if (!name || percent === undefined) continue;
    const share = Number(percent);
    if (!Number.isFinite(share) || share < minPercent) continue;
    out.push({ name, percent: share });
  }
  return out;
}

/** The places of a GeoNames dump, from `minPopulation` up: id, name and population. */
export function parseGeonames(text: string, minPopulation: number): { id: string; name: string; population: number }[] {
  const out: { id: string; name: string; population: number }[] = [];
  for (const line of text.split('\n')) {
    const fields = line.split('\t');
    const [id, name] = fields;
    const population = Number(fields[14] ?? '');
    if (!id || !name || !Number.isFinite(population) || population < minPopulation) continue;
    out.push({ id, name, population });
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

// ---------------------------------------------------------------- fetching

function sha256(data: Uint8Array): string {
  return createHash('sha256').update(data).digest('hex');
}

function human(bytes: number): string {
  return bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${(bytes / 1e3).toFixed(0)} KB`;
}

const refresh = process.argv.includes('--refresh');
const verifyOnly = process.argv.includes('--verify');

/** The pins as the fetch found them, printed when one is not set yet or on `--refresh`. */
const found: { what: string; bytes: number; sha256: string; pinned: boolean }[] = [];

/**
 * A cached source is used when its sha256 matches the pin. Without a cached
 * copy, or with `--refresh`, the source is fetched; a fetched answer whose
 * hash differs from a set pin is refused, unless refreshing, when the new
 * hash is reported for the pins.
 */
async function ensureSource(what: string, dest: string, pin: { bytes: number; sha256: string }, get: () => Promise<Uint8Array>): Promise<Uint8Array> {
  const label = dest.split('/').pop() ?? dest;
  if (!refresh) {
    try {
      await stat(dest);
      const bytes = await readFile(dest);
      const digest = sha256(bytes);
      if (pin.sha256 === '' || digest === pin.sha256) {
        console.log(`  ✓ ${label} — cached (${human(bytes.length)})${pin.sha256 === '' ? ' — no pin yet' : ''}`);
        found.push({ what, bytes: bytes.length, sha256: digest, pinned: pin.sha256 !== '' });
        return bytes;
      }
      throw new Error(
        `${label} in .cache/names does not match its pin\n  expected ${pin.sha256}\n  actual   ${digest}\n` +
          `The cached answer is not the one the list was built from. Move it away to fetch again, or run with --refresh.`,
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
  console.log(`  ↓ ${label}`);
  await mkdir(NAMES_CACHE, { recursive: true });
  const bytes = await get();
  const digest = sha256(bytes);
  if (pin.sha256 !== '' && digest !== pin.sha256 && !refresh) {
    throw new Error(
      `${label}: the answer differs from the pin\n  expected ${pin.sha256}\n  actual   ${digest}\n` +
        `The source has moved since ${NAMES.fetched}. Rebuild from the cached answers, or run with --refresh to take today's and review the list's diff.`,
    );
  }
  await writeFile(dest, bytes);
  console.log(`    ${human(bytes.length)} · sha256 ${digest.slice(0, 16)}…${pin.sha256 !== '' && digest !== pin.sha256 ? ' (moved)' : ''}`);
  found.push({ what, bytes: bytes.length, sha256: digest, pinned: pin.sha256 !== '' });
  return bytes;
}

async function download(url: string): Promise<Uint8Array> {
  const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': NAMES.userAgent } });
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}`);
  const type = response.headers.get('content-type') ?? '';
  if (type.startsWith('text/html')) throw new Error(`${url} answered a web page, not the file`);
  return new Uint8Array(await response.arrayBuffer());
}

/**
 * One SPARQL query, answered as JSON. The service cuts an answer off at its
 * time limit and still says 200, so an answer that does not parse as a
 * complete result is tried again, a few times, before the build gives up.
 */
async function sparql(query: string): Promise<Uint8Array> {
  const url = `${NAMES.wikidata.endpoint}?query=${encodeURIComponent(query)}`;
  let last = '';
  for (let attempt = 1; attempt <= 4; attempt++) {
    const response = await fetch(url, {
      headers: { accept: 'application/sparql-results+json', 'user-agent': NAMES.userAgent },
    });
    const body = new Uint8Array(await response.arrayBuffer());
    if (response.ok) {
      try {
        const rows = parseWikidata(Buffer.from(body).toString('utf8'));
        if (rows.length > 0) return body;
        last = 'an empty answer';
      } catch {
        last = 'an answer cut off before its end';
      }
    } else {
      last = `HTTP ${response.status}`;
    }
    console.log(`    attempt ${attempt}: ${last}; waiting before the next`);
    await new Promise((done) => setTimeout(done, 15_000 * attempt));
  }
  throw new Error(`the query service gave ${last} four times`);
}

async function unzipMember(zip: string, member: string): Promise<string> {
  const { stdout } = await run('unzip', ['-p', zip, member], { maxBuffer: 64 * 1024 * 1024, encoding: 'utf8' });
  return stdout;
}

// ------------------------------------------------------------------- build

/** Every source read, every token attested. */
export async function gatherAttestations(): Promise<Map<string, Attestation[]>> {
  const into = new Map<string, Attestation[]>();

  console.log('1. Wikidata');
  for (const q of NAMES.wikidata.queries) {
    const bytes = await ensureSource(`wikidata ${q.key}`, resolve(NAMES_CACHE, `wikidata-${q.key}.json`), q, () => sparql(q.sparql));
    const rows = parseWikidata(Buffer.from(bytes).toString('utf8'));
    let tokens = 0;
    for (const row of rows) {
      for (const token of tokensOf(row.label)) {
        tokens++;
        attest(into, token, {
          kind: q.kind,
          source: 'wikidata',
          from: row.label,
          trace: `https://www.wikidata.org/wiki/${row.id}`,
          prominence: row.sitelinks,
        });
      }
    }
    console.log(`    ${q.key}: ${rows.length.toLocaleString()} entities with ${q.threshold}+ sitelinks, ${tokens.toLocaleString()} tokens`);
  }

  console.log('2. US Census surnames');
  const surnamesZip = resolve(NAMES_CACHE, 'census-2000-surnames.zip');
  await ensureSource('census surnames', surnamesZip, NAMES.census.surnames, () => download(NAMES.census.surnames.url));
  const surnames = parseSurnames(await unzipMember(surnamesZip, NAMES.census.surnames.member), NAMES.census.surnames.take);
  for (const s of surnames) {
    for (const token of tokensOf(s.name)) {
      attest(into, token, { kind: 'surname', source: 'census-surnames-2000', trace: NAMES.census.surnames.url, prominence: s.rank });
    }
  }
  console.log(`    the first ${surnames.length.toLocaleString()} by rank`);

  console.log('3. US Census given names');
  let givenCount = 0;
  for (const file of NAMES.census.given) {
    const dest = resolve(NAMES_CACHE, `census-1990-${file.url.split('.').at(-2)}-first.txt`);
    const bytes = await ensureSource(`census given ${file.url.split('/').pop()}`, dest, file, () => download(file.url));
    const given = parseGiven(Buffer.from(bytes).toString('utf8'), NAMES.census.minPercent);
    for (const g of given) {
      for (const token of tokensOf(g.name)) {
        attest(into, token, { kind: 'given', source: 'census-given-1990', trace: file.url, prominence: g.percent });
      }
    }
    givenCount += given.length;
  }
  console.log(`    ${givenCount.toLocaleString()} names borne by ${NAMES.census.minPercent}% of the population or more`);

  console.log('4. GeoNames');
  const geoZip = resolve(NAMES_CACHE, 'geonames-cities15000.zip');
  await ensureSource('geonames', geoZip, NAMES.geonames, () => download(NAMES.geonames.url));
  const places = parseGeonames(await unzipMember(geoZip, NAMES.geonames.member), NAMES.geonames.minPopulation);
  for (const p of places) {
    for (const token of tokensOf(p.name)) {
      attest(into, token, {
        kind: 'place',
        source: 'geonames',
        from: p.name,
        trace: `https://www.geonames.org/${p.id}`,
        prominence: p.population,
      });
    }
  }
  console.log(`    ${places.length.toLocaleString()} places of ${NAMES.geonames.minPopulation.toLocaleString()} people or more`);

  return into;
}

function render(lines: readonly Name[]): string {
  return lines.map((line) => JSON.stringify(line)).join('\n') + (lines.length ? '\n' : '');
}

async function main(): Promise<void> {
  console.log(`Ars Magna names list${verifyOnly ? ' (verify)' : refresh ? ' (refresh)' : ''}`);
  console.log(`  sources fetched ${NAMES.fetched}; cache ${NAMES_CACHE}\n`);

  const dictionary = await committedDictionary();
  if (!dictionary) throw new Error('no committed dictionary to check the names against; run pnpm dict:build first');
  const words = new Set(dictionary.words);

  const attestations = await gatherAttestations();
  const lines = mergeNames(attestations, words);
  const excluded = [...attestations.keys()].filter((token) => words.has(token)).length;

  console.log('\n5. the list');
  const byKind = new Map<string, number>();
  const bySource = new Map<string, number>();
  for (const line of lines) {
    byKind.set(line.kind, (byKind.get(line.kind) ?? 0) + 1);
    bySource.set(line.source, (bySource.get(line.source) ?? 0) + 1);
  }
  console.log(`    ${attestations.size.toLocaleString()} distinct tokens; ${excluded.toLocaleString()} are words the dictionary carries and are left out`);
  console.log(`    ${lines.length.toLocaleString()} names`);
  console.log(`    by kind:   ${[...byKind].map(([k, n]) => `${k} ${n.toLocaleString()}`).join(' · ')}`);
  console.log(`    by source: ${[...bySource].map(([k, n]) => `${k} ${n.toLocaleString()}`).join(' · ')}`);

  const problems = nameProblems(lines, words);
  if (problems.length > 0) throw new Error(`the list breaks its own rules:\n  ${problems.slice(0, 10).join('\n  ')}`);

  const text = render(lines);
  if (verifyOnly) {
    const committed = render(await readNames());
    if (committed !== text) {
      const before = new Set(committed.split('\n'));
      const after = new Set(text.split('\n'));
      const added = [...after].filter((l) => l && !before.has(l)).length;
      const gone = [...before].filter((l) => l && !after.has(l)).length;
      console.error(`\n✗ the list drifted: ${added.toLocaleString()} lines would be added and ${gone.toLocaleString()} removed`);
      process.exit(1);
    }
    console.log('\n✓ the list matches the committed names.jsonl');
    return;
  }

  await writeFile(NAMES_PATH, text);
  console.log(`\n✓ ${NAMES_PATH} (${human(Buffer.byteLength(text))})`);

  if (refresh || found.some((f) => !f.pinned)) {
    console.log('\nPins for NAMES in tools/dict-build/src/pins.ts, as fetched:');
    for (const f of found) console.log(`  ${f.what.padEnd(36)} bytes: ${f.bytes.toLocaleString().padStart(12)}  sha256: '${f.sha256}'`);
  }
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  await main();
}
