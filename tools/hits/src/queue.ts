/**
 * Queue folders: one per run under data/queue/<date>, holding the raw
 * enumeration (not committed), the prefiltered rows, the judge's input and
 * output, and the ingest report.
 */
import { readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

import { QUEUE_DIR, today } from './schema.ts';

export const RAW = 'raw.jsonl';
export const SUMMARY = 'summary.json';
export const PREFILTERED = 'prefiltered.jsonl';
export const JUDGE_OUTPUT = 'judge-output.jsonl';
export const INGEST_REPORT = 'ingest-report.md';

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
