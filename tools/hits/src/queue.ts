/**
 * Queue folders: one per run under data/queue/<date>, holding the raw
 * enumeration and the prefiltered rows (neither committed since settings s2),
 * the screen's input and output, the judge's input and output, and the
 * ingest report.
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

import type { Prefiltered } from './prefilter.ts';
import { QUEUE_DIR, today } from './schema.ts';

export const RAW = 'raw.jsonl';
export const SUMMARY = 'summary.json';
export const PREFILTERED = 'prefiltered.jsonl';
export const SCREEN_SCORES = 'screen-scores.txt';
export const SCREEN_OUTPUT = 'screen-output.jsonl';
/** The rows the screen kept, rebuilt by `pnpm hits:judge`: what the judge saw. */
export const SCREENED = 'screened.jsonl';
export const JUDGE_OUTPUT = 'judge-output.jsonl';
export const INGEST_REPORT = 'ingest-report.md';

/**
 * The rows a queue's judge was shown: `screened.jsonl` for a screened queue,
 * `prefiltered.jsonl` for an older one, none when the folder has neither.
 */
export async function readJudgedRows(dir: string): Promise<Prefiltered[]> {
  for (const name of [SCREENED, PREFILTERED]) {
    let text: string;
    try {
      text = await readFile(resolve(dir, name), 'utf8');
    } catch {
      continue;
    }
    return text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l) as Prefiltered);
  }
  return [];
}

/**
 * The date a queue folder is named for: `2026-09-13` for `2026-09-13m`. The
 * nightly names a folder for the day it enumerated, and the routine judges it
 * that morning, so this is the day its verdicts were written unless a verdict
 * says otherwise.
 */
export function queueDate(dir: string): string {
  const match = /^\d{4}-\d{2}-\d{2}/.exec(basename(dir));
  if (!match) throw new Error(`${dir} is not a queue folder: its name does not start with a date`);
  return match[0];
}

export function queueDir(date: string = today()): string {
  return resolve(QUEUE_DIR, date);
}

/** Queue folders by name, newest last. */
export async function queueDates(): Promise<string[]> {
  let names: string[];
  try {
    names = await readdir(QUEUE_DIR);
  } catch {
    return [];
  }
  const dates = names.filter((n) => /^\d{4}-\d{2}-\d{2}/.test(n));
  const dirs: string[] = [];
  for (const name of dates) {
    if ((await stat(resolve(QUEUE_DIR, name))).isDirectory()) dirs.push(name);
  }
  return dirs.sort();
}

/** The newest queue folder, or the one named by `--date=`. */
export async function pickQueue(argv: readonly string[]): Promise<string> {
  const flag = argv.find((a) => a.startsWith('--date='));
  if (flag) return queueDir(flag.slice('--date='.length));
  const dates = await queueDates();
  const last = dates.at(-1);
  if (!last) throw new Error(`no queue under ${QUEUE_DIR}; run pnpm hits:enumerate first`);
  return queueDir(last);
}

export function flag(argv: readonly string[], name: string): string | undefined {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

export function has(argv: readonly string[], name: string): boolean {
  return argv.includes(`--${name}`);
}
