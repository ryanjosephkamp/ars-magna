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
 * s2: the presets below. Common tier, words of 3+ letters plus the short-word
 * allowlist, at most 5 words, every spelling, complete enumeration up to a
 * limit with a sample and anchor searches above it, and a model screen in
 * place of the fluency cap.
 */
import { readFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Candidate, CandidateRun } from './schema.ts';

const here = dirname(fileURLToPath(import.meta.url));

export const SETTINGS_VERSION = 's2';

/** A candidate processed before runs were recorded counts as this. */
export const LEGACY_RUN: Pick<CandidateRun, 'settings' | 'rubric'> = { settings: 's1', rubric: 'v1' };

export const SHORT_WORDS_PATH = resolve(here, 'short-words.txt');

export type Preset = {
  tier: 'common' | 'standard' | 'full';
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
 * for a deep run in a local session. The numbers come from the gate run
 * recorded in the pull request that introduced s2.
 */
export const PRESETS: Record<'routine' | 'deep', Preset> = {
  routine: { tier: 'common', minLength: 3, maxWords: 5, spellings: 'all', expandCap: 64, limit: 5_000, sample: 1_000, perInput: 1_000 },
  deep: { tier: 'common', minLength: 3, maxWords: 5, spellings: 'all', expandCap: 64, limit: 50_000, sample: 5_000, perInput: null },
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
