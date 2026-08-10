/**
 * Extracts per-word provenance from `merged_valid_dict.json`.
 *
 * That file is 290 MB and holds one enormous top-level object keyed by surface
 * word, so it is streamed rather than parsed. Memory discipline is the whole
 * game here: each record is reduced to three scalars and dropped immediately —
 * retaining the parsed values would need multiple gigabytes.
 *
 * The result is cached to a compact binary keyed by the source file's sha256,
 * because a full stream costs a couple of minutes and nothing about it changes
 * until the pin moves.
 */
import { createReadStream } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { chain } from 'stream-chain';
import StreamObject from 'stream-json/streamers/StreamObject.js';
import { normalize } from './normalize.ts';
import type { WordFacts } from './tiers.ts';

const CACHE_MAGIC = 'ARSMFCTS';
const CACHE_VERSION = 1;

const FLAG_TWL = 1 << 0;
const FLAG_SEEN = 1 << 1;
const FLAG_ATTESTED = 1 << 2; // at least one surface was NOT machine-generated

type RawRecord = {
  source?: unknown;
  candidate_source?: unknown;
  generation_method?: unknown;
};

function readRecord(value: unknown): { twl: boolean; generated: boolean; nValid: number } {
  const record = (value ?? {}) as RawRecord;

  const twl = record.source === 'twl_scrabble_dictionary';
  const generated = record.generation_method !== undefined;

  let nValid = 0;
  const sources = record.candidate_source;
  if (Array.isArray(sources)) {
    for (const entry of sources) {
      // Entries are suffixed `_valid` or `_unlikely`; only the former counts.
      if (typeof entry === 'string' && entry.endsWith('_valid')) nValid++;
    }
  }

  return { twl, generated, nValid };
}

async function streamFacts(
  metaPath: string,
  indexOf: ReadonlyMap<string, number>,
  wordCount: number,
  onProgress?: (seen: number) => void,
): Promise<{ flags: Uint8Array; nValid: Uint8Array }> {
  const flags = new Uint8Array(wordCount);
  const nValid = new Uint8Array(wordCount);

  const pipeline = chain([
    createReadStream(metaPath),
    StreamObject.withParser({ packKeys: true, packStrings: true, packNumbers: true }),
  ]);

  let seen = 0;

  for await (const { key, value } of pipeline as AsyncIterable<{ key: string; value: unknown }>) {
    seen++;
    if (onProgress && seen % 25_000 === 0) onProgress(seen);

    const index = indexOf.get(normalize(key));
    if (index === undefined) continue;

    const record = readRecord(value);

    let bits = flags[index]! | FLAG_SEEN;
    if (record.twl) bits |= FLAG_TWL;
    // A normalized word counts as generated only if *every* surface that maps
    // onto it was generated. There are 43 such collisions (`ad-lib` -> `adlib`).
    if (!record.generated) bits |= FLAG_ATTESTED;
    flags[index] = bits;

    if (record.nValid > nValid[index]!) nValid[index] = Math.min(255, record.nValid);
  }

  onProgress?.(seen);
  return { flags, nValid };
}

function encodeCache(flags: Uint8Array, nValid: Uint8Array, sha256: string): Uint8Array {
  const out = new Uint8Array(16 + 64 + flags.length * 2);
  const view = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) out[i] = CACHE_MAGIC.charCodeAt(i);
  view.setUint16(8, CACHE_VERSION, true);
  view.setUint32(12, flags.length, true);
  for (let i = 0; i < 64; i++) out[16 + i] = sha256.charCodeAt(i) || 0;
  out.set(flags, 80);
  out.set(nValid, 80 + flags.length);
  return out;
}

function decodeCache(
  buf: Uint8Array,
  wordCount: number,
  sha256: string,
): { flags: Uint8Array; nValid: Uint8Array } | null {
  if (buf.length < 80) return null;
  for (let i = 0; i < 8; i++) if (buf[i] !== CACHE_MAGIC.charCodeAt(i)) return null;

  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (view.getUint16(8, true) !== CACHE_VERSION) return null;
  if (view.getUint32(12, true) !== wordCount) return null;

  let storedSha = '';
  for (let i = 0; i < 64; i++) storedSha += String.fromCharCode(buf[16 + i]!);
  if (storedSha !== sha256) return null;
  if (buf.length !== 80 + wordCount * 2) return null;

  return {
    flags: buf.slice(80, 80 + wordCount),
    nValid: buf.slice(80 + wordCount, 80 + wordCount * 2),
  };
}

export async function loadFacts(options: {
  metaPath: string;
  metaSha256: string;
  cachePath: string;
  indexOf: ReadonlyMap<string, number>;
  wordCount: number;
  onProgress?: (seen: number) => void;
}): Promise<WordFacts[]> {
  const { metaPath, metaSha256, cachePath, indexOf, wordCount, onProgress } = options;

  let tables: { flags: Uint8Array; nValid: Uint8Array } | null = null;

  try {
    tables = decodeCache(await readFile(cachePath), wordCount, metaSha256);
  } catch {
    tables = null;
  }

  if (tables) {
    process.stdout.write(`   facts: reusing cache ${cachePath}\n`);
  } else {
    process.stdout.write(`   facts: streaming ${metaPath} (a few minutes)\n`);
    tables = await streamFacts(metaPath, indexOf, wordCount, onProgress);
    await mkdir(dirname(cachePath), { recursive: true });
    await writeFile(cachePath, encodeCache(tables.flags, tables.nValid, metaSha256));
  }

  const { flags, nValid } = tables;
  const out: WordFacts[] = new Array(wordCount);
  for (let i = 0; i < wordCount; i++) {
    const bits = flags[i]!;
    out[i] = {
      twl: (bits & FLAG_TWL) !== 0,
      generated: (bits & FLAG_SEEN) !== 0 && (bits & FLAG_ATTESTED) === 0,
      nValid: nValid[i]!,
    };
  }
  return out;
}
