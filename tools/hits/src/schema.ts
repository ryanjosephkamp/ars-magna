/**
 * The two record types, their validators, and the JSONL files that hold them.
 *
 * The JSON Schemas under data/schema/ are the contract: the published dataset
 * card points at them, the ingest step refuses anything they refuse, and the
 * tests check every committed line against them. The TypeScript types here
 * mirror the schemas by hand; `schema.test.ts` catches a drift between the two
 * by validating fixtures built from the types.
 */
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020, { type ValidateFunction } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

import type { Category } from './ids.ts';

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(here, '../../..');
export const DATA_DIR = resolve(REPO_ROOT, 'data');
export const SCHEMA_DIR = resolve(DATA_DIR, 'schema');
export const QUEUE_DIR = resolve(DATA_DIR, 'queue');
export const CANDIDATES_PATH = resolve(DATA_DIR, 'candidates.jsonl');
export const HITS_PATH = resolve(DATA_DIR, 'hits.jsonl');

export type CandidateSource = 'manual' | 'trending' | 'submission';
export type CandidateStatus = 'new' | 'enumerated' | 'unclassified' | 'rejected';

export type Candidate = {
  id: string;
  input: string;
  category: Category;
  source: CandidateSource;
  /** ISO date. */
  first_seen: string;
  status: CandidateStatus;
  wikidata_qid?: string;
  notes?: string;
};

export type Judgement = {
  model: string;
  rubric_version: string;
  aptness: number;
  grammar: number;
  memorability: number;
  total: number;
  rationale: string;
  judged_at: string;
};

export type Tier = 'common' | 'standard' | 'full';
export type HitStatus = 'proposed' | 'accepted' | 'featured' | 'retired';

export type Hit = {
  id: string;
  input: string;
  category: Category;
  words: string[];
  display: string;
  letters: string;
  prefilter_score: number;
  judge: Judgement[];
  submitter?: string;
  added: string;
  dictionary: { repo: string; rev: string };
  tier: Tier;
  tags: string[];
  status: HitStatus;
};

let candidateValidator: ValidateFunction<Candidate> | null = null;
let hitValidator: ValidateFunction<Hit> | null = null;

async function compile<T>(file: string): Promise<ValidateFunction<T>> {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const schema = JSON.parse(await readFile(resolve(SCHEMA_DIR, file), 'utf8')) as object;
  return ajv.compile<T>(schema);
}

export async function candidateSchema(): Promise<ValidateFunction<Candidate>> {
  candidateValidator ??= await compile<Candidate>('candidate.schema.json');
  return candidateValidator;
}

export async function hitSchema(): Promise<ValidateFunction<Hit>> {
  hitValidator ??= await compile<Hit>('hit.schema.json');
  return hitValidator;
}

/** A readable one-line summary of why a record failed. */
export function explain(validator: ValidateFunction): string {
  return (validator.errors ?? [])
    .map((e) => `${e.instancePath || '/'} ${e.message ?? ''}`.trim())
    .join('; ');
}

export class RecordError extends Error {
  constructor(
    message: string,
    public readonly line: number,
  ) {
    super(message);
  }
}

/**
 * Read a JSONL file of validated records. Blank lines are allowed; anything
 * else that does not parse or validate is an error naming the line, and a
 * repeated id is an error too, since both files are keyed by it.
 */
export async function readJsonl<T extends { id: string }>(
  path: string,
  validator: ValidateFunction<T>,
): Promise<T[]> {
  let text: string;
  try {
    text = await readFile(path, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  const out: T[] = [];
  const seen = new Set<string>();
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (line.length === 0) continue;
    let value: unknown;
    try {
      value = JSON.parse(line);
    } catch {
      throw new RecordError(`${path}:${i + 1}: not JSON`, i + 1);
    }
    if (!validator(value)) {
      throw new RecordError(`${path}:${i + 1}: ${explain(validator)}`, i + 1);
    }
    if (seen.has(value.id)) {
      throw new RecordError(`${path}:${i + 1}: duplicate id ${value.id}`, i + 1);
    }
    seen.add(value.id);
    out.push(value);
  }
  return out;
}

export function toJsonl(records: readonly object[]): string {
  return records.map((r) => JSON.stringify(r)).join('\n') + (records.length > 0 ? '\n' : '');
}

/** Rewrite a file from validated records, in the order given. */
export async function writeJsonl<T extends { id: string }>(
  path: string,
  records: readonly T[],
  validator: ValidateFunction<T>,
): Promise<void> {
  const seen = new Set<string>();
  for (const record of records) {
    const id = record.id;
    if (!validator(record)) throw new Error(`refusing to write ${id}: ${explain(validator)}`);
    if (seen.has(id)) throw new Error(`refusing to write duplicate id ${id}`);
    seen.add(id);
  }
  await writeFile(path, toJsonl(records));
}

/**
 * Append records that are not already present, by id. Returns the ones that
 * were actually added, so a caller can say "12 new" honestly.
 */
export async function appendJsonl<T extends { id: string }>(
  path: string,
  records: readonly T[],
  validator: ValidateFunction<T>,
): Promise<T[]> {
  const existing = new Set((await readJsonl(path, validator)).map((r) => r.id));
  const fresh: T[] = [];
  for (const record of records) {
    const id = record.id;
    if (existing.has(id) || fresh.some((f) => f.id === id)) continue;
    if (!validator(record)) throw new Error(`refusing to append ${id}: ${explain(validator)}`);
    fresh.push(record);
  }
  if (fresh.length > 0) await appendFile(path, toJsonl(fresh));
  return fresh;
}

/** Today as an ISO date, in UTC, so a nightly job and a laptop agree. */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** The dictionary revision the site is built against, from the manifest. */
export async function dictionaryPin(): Promise<{ repo: string; rev: string }> {
  const manifest = JSON.parse(
    await readFile(resolve(REPO_ROOT, 'apps/web/public/dict/manifest.json'), 'utf8'),
  ) as { source: { repo: string; rev: string } };
  return { repo: manifest.source.repo, rev: manifest.source.rev };
}
