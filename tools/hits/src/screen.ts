/**
 * `pnpm hits:screen [--date=YYYY-MM-DD] [--chunk=3000]`
 *
 * The first model step. The prefilter passes on thousands of phrases per
 * input, judged only on form; a model reads them and keeps the ones with
 * any link to their input, so the judge scores tens of phrases, not
 * thousands, and nothing apt is lost to a fluency cutoff.
 *
 * This writes `screen-input-N.md`: the screen prompt, then each input's
 * phrases numbered one per line, at most `--chunk` phrases per file. That
 * compact text, with `screen-scores.txt` (each phrase's prefilter score, in
 * number order), is what the nightly commits; `prefiltered.jsonl` is too big
 * to. A session answers every file into `screen-output.jsonl`, one line per
 * section: `{"candidate_id": …, "keep": [numbers]}`. `pnpm hits:judge` then
 * rebuilds the kept rows from the phrase text (`screened.jsonl`) and writes
 * the judge's input from those alone.
 */
import { existsSync } from 'node:fs';
import { readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatReading, parseReading } from '@ars-magna/engine/readings';

import { SCREEN_KEEP_CAP, screenKeepProblems } from './guards.ts';
import { alphagram, hitId, isCategory, type Category } from './ids.ts';
import type { Prefiltered } from './prefilter.ts';
import { PREFILTERED, SCREENED, SCREEN_OUTPUT, SCREEN_SCORES, flag, pickQueue } from './queue.ts';
import { isDeepQueue } from './settings.ts';

const here = dirname(fileURLToPath(import.meta.url));
export const SCREEN_PROMPT_PATH = resolve(here, '../prompts/screen.md');
export const DEFAULT_CHUNK = 3_000;
const INPUT_FILE = /^screen-input-(\d+)\.md$/;

export type ScreenGroup = {
  candidate_id: string;
  input: string;
  category: Category;
  /** How the input's numbers and symbols were read, when it has any. */
  reading?: Record<string, string>;
  /** Numbered from 1, best-reading first. */
  phrases: { display: string; score: number }[];
};

/** A run of one group's phrases in one file, numbered `from` to `to` inclusive. */
export type ScreenPart = { group: ScreenGroup; from: number; to: number };

/** Prefiltered rows by candidate, in the order they arrive. */
export function groupForScreen(rows: readonly Prefiltered[]): ScreenGroup[] {
  const groups = new Map<string, ScreenGroup>();
  for (const row of rows) {
    const group =
      groups.get(row.candidate_id) ??
      { candidate_id: row.candidate_id, input: row.input, category: row.category, ...(row.reading ? { reading: row.reading } : {}), phrases: [] };
    group.phrases.push({ display: row.display, score: row.prefilter_score });
    groups.set(row.candidate_id, group);
  }
  return [...groups.values()];
}

/**
 * Files of at most `chunk` phrases. An input that fits in a file is never
 * split across two; a bigger one continues from file to file.
 */
export function chunkScreen(groups: readonly ScreenGroup[], chunk: number): ScreenPart[][] {
  const files: ScreenPart[][] = [];
  let current: ScreenPart[] = [];
  let room = chunk;
  const flush = () => {
    files.push(current);
    current = [];
    room = chunk;
  };
  for (const group of groups) {
    const total = group.phrases.length;
    if (total === 0) continue;
    if (total <= chunk && total > room && current.length > 0) flush();
    let from = 1;
    while (from <= total) {
      if (room === 0) flush();
      const to = Math.min(total, from + room - 1);
      current.push({ group, from, to });
      room -= to - from + 1;
      from = to + 1;
    }
  }
  if (current.length > 0) flush();
  return files;
}

export function renderScreen(parts: readonly ScreenPart[], promptText: string, n: number, of: number): string {
  const phrases = parts.reduce((sum, p) => sum + p.to - p.from + 1, 0);
  const sections = parts.map((p) => {
    const lines = p.group.phrases.slice(p.from - 1, p.to).map((phrase, i) => `${p.from + i} ${phrase.display}`);
    return [
      `### ${p.group.candidate_id}`,
      '',
      `input: ${p.group.input}`,
      ...(p.group.reading ? [`reading: ${formatReading(p.group.reading)}`] : []),
      `category: ${p.group.category}`,
      `phrases ${p.from} to ${p.to} of ${p.group.phrases.length}`,
      '',
      ...lines,
    ].join('\n');
  });
  return `${promptText.trimEnd()}\n\n## File ${n} of ${of}: ${phrases} phrases\n\n${sections.join('\n\n')}\n`;
}

/** One line per input: its id, then each phrase's prefilter score in number order. */
export function renderScores(groups: readonly ScreenGroup[]): string {
  const lines = groups.map((g) => [g.candidate_id, ...g.phrases.map((p) => String(p.score))].join(' '));
  return `# candidate_id, then each phrase's prefilter score in phrase-number order\n${lines.join('\n')}\n`;
}

export type ScreenSection = {
  candidate_id: string;
  input: string;
  category: string;
  /** The input's reading, as its `reading:` line had it; absent when the input has no numbers or symbols. */
  reading?: Record<string, string>;
  phrases: Map<number, string>;
};

/** The sections of every screen input file, merged by input. */
export function parseScreenInputs(texts: readonly string[]): Map<string, ScreenSection> {
  const sections = new Map<string, ScreenSection>();
  for (const text of texts) {
    const lines = text.split('\n');
    const start = lines.findLastIndex((l) => /^## File \d+ of \d+/.test(l));
    let current: ScreenSection | null = null;
    for (const line of lines.slice(start + 1)) {
      const heading = /^### (\S+)$/.exec(line);
      if (heading) {
        const id = heading[1]!;
        current = sections.get(id) ?? { candidate_id: id, input: '', category: '', phrases: new Map() };
        sections.set(id, current);
        continue;
      }
      if (!current) continue;
      if (line.startsWith('input: ')) current.input = line.slice('input: '.length);
      else if (line.startsWith('reading: ')) {
        const reading = parseReading(line.slice('reading: '.length));
        if (reading) current.reading = reading;
      }
      else if (line.startsWith('category: ')) current.category = line.slice('category: '.length);
      else {
        const phrase = /^(\d+) (\S.*)$/.exec(line);
        if (phrase) current.phrases.set(Number(phrase[1]), phrase[2]!);
      }
    }
  }
  return sections;
}

export function parseScores(text: string): Map<string, number[]> {
  const out = new Map<string, number[]>();
  for (const line of text.split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const [id, ...scores] = line.trim().split(/\s+/);
    out.set(id!, scores.map(Number));
  }
  return out;
}

export type ScreenAnswer = { candidate_id: string; keep: number[] };

/** Parse screen output leniently on whitespace and fences, strictly on shape. */
export function parseScreenOutput(text: string): ScreenAnswer[] {
  const out: ScreenAnswer[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line.startsWith('{')) continue;
    out.push(JSON.parse(line) as ScreenAnswer);
  }
  return out;
}

/**
 * Check the answers against the inputs. Every section needs an answer, every
 * number must be one of its phrases; two answers for one input (it spanned
 * two files) are merged.
 */
export function validateScreen(
  answers: readonly ScreenAnswer[],
  sections: ReadonlyMap<string, ScreenSection>,
): { kept: Map<string, Set<number>>; problems: string[] } {
  const kept = new Map<string, Set<number>>();
  const problems: string[] = [];
  for (const answer of answers) {
    const section = sections.get(answer.candidate_id);
    if (!section) {
      problems.push(`${answer.candidate_id}: not an input in these files`);
      continue;
    }
    if (!Array.isArray(answer.keep) || answer.keep.some((n) => !Number.isInteger(n))) {
      problems.push(`${answer.candidate_id}: keep must be a list of phrase numbers`);
      continue;
    }
    const set = kept.get(answer.candidate_id) ?? new Set<number>();
    for (const n of answer.keep) {
      if (section.phrases.has(n)) set.add(n);
      else problems.push(`${answer.candidate_id}: no phrase ${n}`);
    }
    kept.set(answer.candidate_id, set);
  }
  for (const id of sections.keys()) {
    if (!kept.has(id)) problems.push(`${id}: no answer`);
  }
  return { kept, problems };
}

/** The kept phrases as rows, rebuilt from the text, in input and number order. */
export function rebuildRows(
  sections: ReadonlyMap<string, ScreenSection>,
  scores: ReadonlyMap<string, readonly number[]>,
  kept: ReadonlyMap<string, ReadonlySet<number>>,
): Prefiltered[] {
  const rows: Prefiltered[] = [];
  for (const [id, section] of sections) {
    const numbers = [...(kept.get(id) ?? [])].sort((a, b) => a - b);
    if (numbers.length === 0) continue;
    if (!isCategory(section.category)) throw new Error(`${id}: unknown category ${section.category}`);
    const category = section.category;
    const scoreList = scores.get(id);
    if (!scoreList || scoreList.length !== section.phrases.size) {
      throw new Error(`${id}: ${SCREEN_SCORES} has ${scoreList?.length ?? 0} scores for ${section.phrases.size} phrases`);
    }
    for (const n of numbers) {
      const display = section.phrases.get(n)!;
      const words = display.split(' ');
      rows.push({
        id: hitId(section.input, category, words, section.reading ?? null),
        candidate_id: id,
        input: section.input,
        category,
        words,
        display,
        letters: alphagram(section.input, section.reading ?? null),
        ...(section.reading ? { reading: section.reading } : {}),
        prefilter_score: scoreList[n - 1]!,
        // The s2 prefilter keeps common-tier words only.
        tier: 'common',
      });
    }
  }
  return rows;
}

/** The screen input files in a queue folder, in number order. */
export async function screenInputFiles(dir: string): Promise<string[]> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }
  return names
    .filter((n) => INPUT_FILE.test(n))
    .sort((a, b) => Number(INPUT_FILE.exec(a)![1]) - Number(INPUT_FILE.exec(b)![1]))
    .map((n) => resolve(dir, n));
}

/** The inputs a screened queue covers: every section heading in its screen input, whatever the screen kept. */
export async function screenedCandidateIds(dir: string): Promise<string[]> {
  const files = await screenInputFiles(dir);
  if (files.length === 0) return [];
  return [...parseScreenInputs(await Promise.all(files.map((f) => readFile(f, 'utf8')))).keys()];
}

/**
 * Read a screened queue's answers, check them, and write the kept rows to
 * `screened.jsonl`. Throws, naming every problem, when the answers are
 * missing or do not fit the inputs, or when an input keeps more than
 * `SCREEN_KEEP_CAP` phrases in a queue that is not a deep run's.
 */
export async function applyScreen(dir: string): Promise<Prefiltered[]> {
  const files = await screenInputFiles(dir);
  const outputPath = resolve(dir, SCREEN_OUTPUT);
  if (!existsSync(outputPath)) {
    throw new Error(`answer every screen-input-N.md into ${outputPath} first`);
  }
  const sections = parseScreenInputs(await Promise.all(files.map((f) => readFile(f, 'utf8'))));
  const { kept, problems } = validateScreen(parseScreenOutput(await readFile(outputPath, 'utf8')), sections);
  if (problems.length > 0) throw new Error(`${SCREEN_OUTPUT} does not fit the screen inputs:\n  ${problems.join('\n  ')}`);
  const over = (await isDeepQueue(dir)) ? [] : screenKeepProblems(kept);
  if (over.length > 0) {
    throw new Error(
      `${SCREEN_OUTPUT} keeps too many phrases. The screen keeps a phrase only for a link to its input; the routine's ` +
        `nights before 2026-09-18 never kept more than 3 for one input, and ${SCREEN_KEEP_CAP} is the most allowed.\n  ${over.join('\n  ')}\n` +
        `Read those inputs' phrases again and keep only the strongest links. Nothing was written.`,
    );
  }
  const rows = rebuildRows(sections, parseScores(await readFile(resolve(dir, SCREEN_SCORES), 'utf8')), kept);
  await writeFile(resolve(dir, SCREENED), rows.map((r) => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : ''));
  return rows;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dir = await pickQueue(argv);
  const chunk = Number(flag(argv, 'chunk') ?? DEFAULT_CHUNK);
  if (!Number.isInteger(chunk) || chunk < 1) throw new Error(`--chunk must be a positive whole number`);
  if (existsSync(resolve(dir, SCREEN_OUTPUT))) {
    throw new Error(`${resolve(dir, SCREEN_OUTPUT)} already exists; the inputs it answers must not change`);
  }

  const text = await readFile(resolve(dir, PREFILTERED), 'utf8');
  const rows = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l) as Prefiltered);
  for (const old of await screenInputFiles(dir)) await rm(old);
  if (rows.length === 0) {
    console.log(`nothing to screen: ${resolve(dir, PREFILTERED)} is empty`);
    return;
  }

  const prompt = await readFile(SCREEN_PROMPT_PATH, 'utf8');
  const groups = groupForScreen(rows);
  const files = chunkScreen(groups, chunk);
  let bytes = 0;
  for (let i = 0; i < files.length; i++) {
    const body = renderScreen(files[i]!, prompt, i + 1, files.length);
    bytes += Buffer.byteLength(body);
    await writeFile(resolve(dir, `screen-input-${i + 1}.md`), body);
  }
  const scores = renderScores(groups);
  bytes += Buffer.byteLength(scores);
  await writeFile(resolve(dir, SCREEN_SCORES), scores);
  console.log(
    `${rows.length.toLocaleString()} phrases from ${groups.length} inputs -> ${files.length} screen-input files ` +
      `and ${SCREEN_SCORES} (${(bytes / 1024).toFixed(0)} KB) in ${dir}\n` +
      `Answer each file into ${resolve(dir, SCREEN_OUTPUT)}, then run pnpm hits:judge.`,
  );
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  await main();
}
