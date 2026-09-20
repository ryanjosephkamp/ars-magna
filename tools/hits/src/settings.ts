/**
 * The versions a candidate is processed under, the settings that define
 * them, and the ledger entry that records them.
 *
 * `SETTINGS_VERSION` names what enumerate and prefilter do to an input. Bump
 * it when a change there would give a candidate different rows, so
 * `pnpm hits:requeue --settings-before=…` can send older candidates round
 * again. The rubric's version lives in the rubric's own header
 * (`tools/hits/prompts/judge.md`).
 *
 * s1 (to 2026-09-13): standard tier, words of 3+ letters, at most 4 words,
 * the first spelling of each letter group, the first 2,000 results plus 500
 * sampled, and the best 25 per input by fluency.
 *
 * s2 (to 2026-09-16): the presets below. Common tier, words of 3+ letters plus
 * the short-word allowlist, at most 5 words, every spelling, complete
 * enumeration up to a limit with a sample and anchor searches above it, and a
 * model screen in place of the fluency cap.
 *
 * s3 (to 2026-09-20): s2 plus the site's own additions, searched beside
 * Common. An addition lives only in Extended, so before s3 no
 * machine-generated candidate could contain one. Adding a word to
 * `data/vocabulary/additions.jsonl` therefore changes what enumeration finds,
 * which is why the queue keeps its own copy of the list it used.
 *
 * s4: s3 plus the listed forms (`data/vocabulary/forms.jsonl`), whose
 * letters-words are in every tier, Common included: `dont`, `youre`, `thats`
 * can appear in a phrase from this version on (`im` cannot: the short-word
 * allowlist is unchanged). The queue's `summary.json` also records the
 * dictionary it was enumerated with, its pinned revision and the built list's
 * hash, from this version on.
 */
import { readFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { REPO_ROOT, type Candidate, type CandidateRun } from './schema.ts';

const here = dirname(fileURLToPath(import.meta.url));

export const SETTINGS_VERSION = 's4';

/** A candidate processed before runs were recorded counts as this. */
export const LEGACY_RUN: Pick<CandidateRun, 'settings' | 'rubric'> = { settings: 's1', rubric: 'v1' };

export const SHORT_WORDS_PATH = resolve(here, 'short-words.txt');

export type Preset = {
  tier: 'common' | 'standard' | 'full' | 'extended';
  minLength: number;
  maxWords: number;
  spellings: 'first' | 'all';
  /** Most spellings written for one result. */
  expandCap: number;
  /** Inputs with at most this many results are enumerated completely. */
  limit: number;
  /** Results sampled beyond the limit. */
  sample: number;
  /** Most phrases of one input sent to the screen; null for all of them. */
  perInput: number | null;
};

/**
 * `routine` is what the nightly runs and the judge routine screens; `deep` is
 * for a deep run in a local session. The numbers come from the s2 gate run
 * (pull request #16): taking turns by word count, every traced classic that
 * reached the screen ranked 214th or better in its input, so 300 per input
 * keeps them all, and screening runs about 6.3 minutes per 1,000 phrases.
 */
export const PRESETS: Record<'routine' | 'deep', Preset> = {
  routine: { tier: 'common', minLength: 3, maxWords: 5, spellings: 'all', expandCap: 64, limit: 5_000, sample: 1_000, perInput: 500 },
  deep: { tier: 'common', minLength: 3, maxWords: 5, spellings: 'all', expandCap: 64, limit: 50_000, sample: 5_000, perInput: 300 },
};

export function presetFlag(value: string | undefined): Preset {
  const name = value ?? 'routine';
  if (name !== 'routine' && name !== 'deep') throw new Error(`--preset must be routine or deep, not ${name}`);
  return PRESETS[name];
}

/** The short-word allowlist: one word per line, `#` starts a comment. */
export function parseShortWords(text: string): Set<string> {
  return new Set(
    text
      .split('\n')
      .map((line) => line.split('#')[0]!.trim().toLowerCase())
      .filter((word) => word.length > 0),
  );
}

export async function readShortWords(path: string = SHORT_WORDS_PATH): Promise<Set<string>> {
  return parseShortWords(await readFile(path, 'utf8'));
}

/** The reviewed list of site additions, the same file `vocab:add` appends to. */
export const ADDITIONS_PATH = resolve(REPO_ROOT, 'data/vocabulary/additions.jsonl');

/** The copy a queue keeps of the additions it was enumerated with. */
export const QUEUE_ADDITIONS = 'additions.txt';

/**
 * The words in `additions.jsonl`, for handing to the engine.
 *
 * Only the `word` of each line is taken; the schema, the cap and the
 * duplicate rules are `pnpm vocab:check`'s job, and CI runs it on every pull
 * request. A missing file means no additions, which is how this repository
 * stood before phase V.
 */
export async function readAdditionWords(path: string = ADDITIONS_PATH): Promise<string[]> {
  let text: string;
  try {
    text = await readFile(path, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  return text
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line, i) => {
      const word = (JSON.parse(line) as { word?: unknown }).word;
      if (typeof word !== 'string') throw new Error(`${path}:${i + 1}: no word`);
      return word;
    });
}

/**
 * The additions a queue was enumerated with, read back from its own copy.
 *
 * The prefilter has to judge rows against the vocabulary that produced them,
 * not against today's list: re-running it after a word was added would
 * otherwise keep rows the engine never could have written. A queue from
 * before s3 has no copy, and no additions.
 */
export async function readQueueAdditions(dir: string): Promise<Set<string>> {
  try {
    return parseShortWords(await readFile(resolve(dir, QUEUE_ADDITIONS), 'utf8'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return new Set();
    throw error;
  }
}

/**
 * The settings a queue was enumerated under, from its `summary.json`. A
 * summary without the field predates s2; a queue with no summary was not
 * enumerated by the batch, and counts as today's settings.
 */
export async function queueSettings(dir: string): Promise<string> {
  let text: string;
  try {
    text = await readFile(resolve(dir, 'summary.json'), 'utf8');
  } catch {
    return SETTINGS_VERSION;
  }
  return (JSON.parse(text) as { settings?: string }).settings ?? 's1';
}

/**
 * Whether a queue was enumerated with the deep preset, read from the limit
 * its `summary.json` records: a deep run's limit is ten times the routine's.
 * The summary is committed before anyone screens, so changing it to pass for
 * a deep run shows in the pull request. A queue with no summary is not deep.
 */
export async function isDeepQueue(dir: string): Promise<boolean> {
  let text: string;
  try {
    text = await readFile(resolve(dir, 'summary.json'), 'utf8');
  } catch {
    return false;
  }
  const limit = (JSON.parse(text) as { limit?: unknown }).limit;
  return typeof limit === 'number' && limit >= PRESETS.deep.limit;
}

/** The queue a folder names: its last path segment, such as 2026-09-12c. */
export function queueName(dir: string): string {
  return basename(dir);
}

/** Record a run on a candidate, once per queue. Returns whether it was added. */
export function addRun(candidate: Candidate, run: CandidateRun): boolean {
  if (candidate.runs?.some((r) => r.queue === run.queue)) return false;
  candidate.runs = [...(candidate.runs ?? []), run];
  return true;
}

/** The versions a candidate was last processed under. */
export function lastRun(candidate: Candidate): Pick<CandidateRun, 'settings' | 'rubric'> {
  return candidate.runs?.at(-1) ?? LEGACY_RUN;
}

/** The number in a version such as s2 or v2. */
export function versionNumber(version: string): number {
  return Number(version.slice(1));
}
