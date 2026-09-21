/**
 * The files the promotions review reads and writes, on both sides of the line.
 *
 * Public, in this repository, with nothing a reader typed:
 *   data/counts/<date>/          each day's counts (`count.schema.json`)
 *   data/promotions/decisions.jsonl  what the review decided, by code (`decision.schema.json`)
 *   data/promotions/blocks.jsonl     blocked anagrams, by code (`block.schema.json`)
 *   data/promotions/reviews/<date>.md  what an apply published, for the pull request
 *
 * Private, in the repository ars-magna-promotions, or a folder on this Mac:
 *   export/<date>.jsonl   every promotion, with what readers typed (`promotion-export.schema.json`)
 *   reviews/<date>.jsonl  the review, merged by the operator (`promotion-review.schema.json`)
 *   reviews/<date>.md     the review in plain words, for that merge
 *
 * Local, gitignored: .cache/promotions/, the review's input and answers.
 *
 * An anagram is named publicly by its code, `keySha256` of its key, never by
 * its words. Messages these tools print name codes and counts only, since a
 * workflow log on a public repository is public.
 */
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import Ajv2020, { type ValidateFunction } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

import type { Tier } from '@ars-magna/engine/protocol';

import { DATA_DIR, REPO_ROOT, SCHEMA_DIR, explain, type JudgedBy } from '../schema.ts';
import type { Category } from '../ids.ts';

export { keySha256, promotionKey } from '../../../../apps/web/src/votes/core.ts';

export const COUNTS_DIR = resolve(DATA_DIR, 'counts');
export const DECISIONS_PATH = resolve(DATA_DIR, 'promotions/decisions.jsonl');
export const BLOCKS_PATH = resolve(DATA_DIR, 'promotions/blocks.jsonl');
export const PUBLIC_REPORTS_DIR = resolve(DATA_DIR, 'promotions/reviews');
export const LOCAL_DIR = resolve(REPO_ROOT, '.cache/promotions');

/** The version of the review's own instructions, `tools/hits/prompts/review.md`. */
export const REVIEW_PROMPT_PATH = resolve(REPO_ROOT, 'tools/hits/prompts/review.md');

/** The most promoted anagrams one review reads. A number the operator may tune. */
export const REVIEW_LIMIT = 100;

/** An anagram decided before is read again once its promotions reach this many times its count then. */
export const REREVIEW_FACTOR = 2;

/** The first characters of a code, enough to name an anagram in a message or a review file. */
export const shortCode = (code: string): string => code.slice(0, 12);

export type Dictionary = { repo: string; rev: string };

export type ExportSearch = { input: string; words: string[]; tier: Tier; n: number; at_tier: boolean; reading?: Record<string, string> };
export type ExportSubmission = {
  input: string;
  /** How the input's numbers and symbols were read, when it has any: the reader's choice as the API stored it. */
  reading?: Record<string, string>;
  words: string[];
  tier: Tier;
  category: Category | null;
  about: string | null;
  why: string | null;
  credit: string | null;
  missing: string[];
  created: string;
  at_tier: boolean;
};
export type ExportCheck = {
  ok: boolean;
  reason: 'letters' | 'unknown-word' | null;
  narrowest: Tier | null;
  unknown: string[];
  dictionary: Dictionary;
};
/** A line of the private export: one promoted anagram. */
export type ExportLine = {
  key: string;
  key_sha256: string;
  count: number;
  first: string;
  last: string;
  via: { result: number; typed: number };
  searches: ExportSearch[];
  submissions: ExportSubmission[];
  check: ExportCheck;
  blocked: boolean;
};

export type ReviewOutcome = 'place' | 'near' | 'none' | 'private' | 'words-missing';
export type ReviewVerdict = {
  relation: number;
  reads: number;
  tone: string[];
  subjects: string[];
  category: Category;
  justification?: string;
  rationale: string;
  senses?: Record<string, string>;
  /** How the anagram reads on Discover, kept only when it passed the display rule with possessives refused. */
  display?: string;
  about?: string;
  reader_about?: 'keep' | 'drop';
  credit?: 'keep' | 'drop';
  requests?: string[];
};
export type ReviewRow = {
  kind: 'search' | 'submission';
  input: string;
  /** How the input's numbers and symbols were read, when it has any. */
  reading?: Record<string, string>;
  words: string[];
  tier: Tier | null;
  missing: string[];
  about_reader: string | null;
  credit_reader: string | null;
};
/** A line of a private review file. A private person's keeps only its code, count and outcome. */
export type ReviewLine = {
  key?: string;
  key_sha256: string;
  decided: string;
  promotions: number;
  outcome: ReviewOutcome;
  row?: ReviewRow;
  verdict?: ReviewVerdict;
  model: string;
  rubric_version: string;
  review_version: string;
  judged_by: JudgedBy;
};

export type DecisionOutcome = 'interesting' | 'stretch' | 'alternate' | 'near' | 'none' | 'withheld' | 'words-missing';
/** A line of data/promotions/decisions.jsonl: a decision as published, with no text. */
export type Decision = {
  key_sha256: string;
  decided: string;
  promotions: number;
  outcome: DecisionOutcome;
  relation?: number;
  reads?: number;
  category?: Category;
  hit_id?: string;
  model: string;
  rubric_version: string;
  review_version: string;
  judged_by: JudgedBy;
  applied: string;
};

export type Block = { key_sha256: string; blocked: string };
export type PromotionCount = { key_sha256: string; count: number };
export type VoteCount = { hit_id: string; count: number };
export type CountsMeta = {
  date: string;
  taken_at: string;
  convention: string;
  promotions: { anagrams: number; listed: number; total: number; left_out: { unchecked: number; blocked: number } };
  votes: { hits: number; total: number };
  dictionary: Dictionary;
};

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const compiled = new Map<string, ValidateFunction>();

async function schema(file: string, def?: string): Promise<ValidateFunction> {
  const name = def ? `${file}#/$defs/${def}` : file;
  let validator = compiled.get(name);
  if (!validator) {
    if (!ajv.getSchema(file)) ajv.addSchema(JSON.parse(await readFile(resolve(SCHEMA_DIR, file), 'utf8')) as object, file);
    validator = ajv.getSchema(name)!;
    compiled.set(name, validator);
  }
  return validator;
}

export const validators = {
  exportLine: () => schema('promotion-export.schema.json'),
  reviewLine: () => schema('promotion-review.schema.json'),
  decision: () => schema('decision.schema.json'),
  block: () => schema('block.schema.json'),
  promotionCount: () => schema('count.schema.json', 'promotion'),
  voteCount: () => schema('count.schema.json', 'vote'),
  countsMeta: () => schema('count.schema.json', 'meta'),
  monthly: () => schema('monthly.schema.json'),
};

/**
 * Lines of a JSONL file, each checked. A problem names the file and the line
 * number only: the line itself may hold what a reader typed.
 */
export async function readLines<T>(path: string, validator: ValidateFunction): Promise<T[]> {
  let text: string;
  try {
    text = await readFile(path, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  const out: T[] = [];
  for (const [i, line] of text.split('\n').entries()) {
    if (line.trim().length === 0) continue;
    let value: unknown;
    try {
      value = JSON.parse(line);
    } catch {
      throw new Error(`${path}:${i + 1}: not JSON`);
    }
    if (!validator(value)) throw new Error(`${path}:${i + 1}: does not fit its schema (${explain(validator)})`);
    out.push(value as T);
  }
  return out;
}

/** Write lines, each checked first; nothing is written if one fails. */
export async function writeLines(path: string, records: readonly object[], validator: ValidateFunction): Promise<void> {
  for (const [i, record] of records.entries()) {
    if (!validator(record)) throw new Error(`refusing to write line ${i + 1} of ${path}: it does not fit its schema (${explain(validator)})`);
  }
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, records.map((r) => JSON.stringify(r)).join('\n') + (records.length > 0 ? '\n' : ''));
}

/** The dated files in a folder, `<date>.<ext>`, oldest first. */
export async function datedFiles(dir: string, ext: string): Promise<{ date: string; path: string }[]> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }
  const pattern = new RegExp(`^(\\d{4}-\\d{2}-\\d{2})\\.${ext}$`);
  return names
    .flatMap((name) => {
      const match = pattern.exec(name);
      return match ? [{ date: match[1]!, path: resolve(dir, name) }] : [];
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Votes by hit from the newest folder in data/counts/, and its date; empty when there is none. */
export async function newestVotes(dir: string = COUNTS_DIR): Promise<{ date: string | null; votes: Map<string, number> }> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return { date: null, votes: new Map() };
  }
  const date = names.filter((n) => /^\d{4}-\d{2}-\d{2}$/.test(n)).sort().at(-1);
  if (!date) return { date: null, votes: new Map() };
  const lines = await readLines<VoteCount>(resolve(dir, date, 'votes.jsonl'), await validators.voteCount());
  return { date, votes: new Map(lines.map((l) => [l.hit_id, l.count])) };
}

/** The blocked anagrams' codes. */
export async function readBlocks(path: string = BLOCKS_PATH): Promise<Block[]> {
  return readLines<Block>(path, await validators.block());
}

/** The published decisions. */
export async function readDecisions(path: string = DECISIONS_PATH): Promise<Decision[]> {
  return readLines<Decision>(path, await validators.decision());
}

/** Every line of every review file in a private folder, oldest first. */
export async function readReviews(from: string): Promise<{ date: string; lines: ReviewLine[] }[]> {
  const validator = await validators.reviewLine();
  const out: { date: string; lines: ReviewLine[] }[] = [];
  for (const file of await datedFiles(resolve(from, 'reviews'), 'jsonl')) {
    out.push({ date: file.date, lines: await readLines<ReviewLine>(file.path, validator) });
  }
  return out;
}

/** A fixed sentence for a command that failed, and the exit code; the error itself is printed only with --debug. */
export function failQuietly(command: string, argv: readonly string[]): (error: unknown) => never {
  return (error) => {
    if (argv.includes('--debug')) console.error(error);
    else console.error(`${command} failed. Nothing it read is printed here; run it again with --debug on a laptop to see why.`);
    process.exit(1);
  };
}
