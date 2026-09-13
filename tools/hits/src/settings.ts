/**
 * The versions a candidate is processed under, and the ledger entry that
 * records them.
 *
 * `SETTINGS_VERSION` names what enumerate and prefilter do to an input. Bump
 * it when a change there would give a candidate different rows, so
 * `pnpm hits:requeue --settings-before=…` can send older candidates round
 * again. The rubric's version lives in the rubric's own header
 * (`tools/hits/prompts/judge.md`).
 */
import { basename } from 'node:path';

import type { Candidate, CandidateRun } from './schema.ts';

export const SETTINGS_VERSION = 's1';

/** A candidate processed before runs were recorded counts as this. */
export const LEGACY_RUN: Pick<CandidateRun, 'settings' | 'rubric'> = { settings: 's1', rubric: 'v1' };

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
