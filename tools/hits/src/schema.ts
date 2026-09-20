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

export type CandidateSource = 'manual' | 'trending' | 'submission' | 'promotion';
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
  /** One factual sentence saying what the input is; copied to each of its hits. */
  about?: string;
  /** The input's English Wikipedia article; copied to each of its hits. */
  wikipedia?: string;
  notes?: string;
  /** Words to search around when the input has more results than the enumeration limit. */
  anchors?: string[];
  /** Subject slugs (actor, airline…), copied onto the input's hits as subject: tags. */
  subjects?: string[];
  /** Each queue this candidate went through, oldest first. None means settings s1 and rubric v1. */
  runs?: CandidateRun[];
};

/** One pass of a candidate through a queue, with the versions it was processed under. */
export type CandidateRun = {
  queue: string;
  settings: string;
  rubric: string;
  date: string;
  /** The model that screened and judged the queue. From F0 on. */
  model?: string;
  /** Whether the judge routine or a session a person started judged the queue. From F0 on. */
  judged_by?: JudgedBy;
};

/** Who judged a queue: the scheduled judge routine, or a session a person started (by hand, a deep run). */
export const JUDGED_BY = ['routine', 'hand'] as const;
export type JudgedBy = (typeof JUDGED_BY)[number];

/** Labels a v2 judge may put on a phrase. They never change a score. */
export const TONES = ['literal', 'ironic', 'pun', 'self-referential', 'uncanny', 'rude'] as const;
export type Tone = (typeof TONES)[number];

/** A rubric v1 score: three axes and their total. Older queues keep these. */
export type JudgementV1 = {
  model: string;
  rubric_version: string;
  aptness: number;
  grammar: number;
  memorability: number;
  total: number;
  rationale: string;
  judged_at: string;
  judged_by?: JudgedBy;
};

/**
 * A rubric v2 score. Relation to the input decides the shelf; reads, tone and
 * subjects label; the justification explains the link to a reader, and is
 * present from relation 3 up.
 */
export type JudgementV2 = {
  model: string;
  rubric_version: string;
  relation: number;
  reads: number;
  tone: Tone[];
  subjects: string[];
  justification?: string;
  /** The senses the judge proposed, keyed by word of the phrase. */
  senses?: Record<string, string>;
  /** The display the judge proposed, kept only when it passed the display rule. */
  display?: string;
  rationale: string;
  judged_at: string;
  /** Whether the judge routine or a session a person started judged it. From F0 on. */
  judged_by?: JudgedBy;
};

export type Judgement = JudgementV1 | JudgementV2;

export function isV2(judgement: Judgement): judgement is JudgementV2 {
  return 'relation' in judgement;
}

export type Tier = 'common' | 'standard' | 'full' | 'extended';
export const HIT_STATUSES = ['proposed', 'accepted', 'featured', 'retired'] as const;
export type HitStatus = (typeof HIT_STATUSES)[number];

export type Hit = {
  id: string;
  input: string;
  category: Category;
  words: string[];
  /** How the hit reads on Discover: the words in order, as themselves or listed forms, with the allowed marks and capitals. */
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
  /** One plain sentence for a reader; the operator can edit it. */
  justification?: string;
  /** A copy of its candidate's `about`. */
  about?: string;
  /** A copy of its candidate's `wikipedia`. */
  wikipedia?: string;
  /** The sense a word reads in, in this anagram, keyed by one of the hit's own words. */
  senses?: Record<string, string>;
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
  readonly line: number;
  // No parameter properties: Node's strip-types mode refuses them.
  constructor(message: string, line: number) {
    super(message);
    this.line = line;
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
