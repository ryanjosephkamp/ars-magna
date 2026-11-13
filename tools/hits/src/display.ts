/**
 * `pnpm hits:display id "<display>"`
 * `pnpm hits:display id --clear`
 *
 * Set how a hit reads on Discover: its words, in the order they read, as
 * themselves or as listed forms (`I'm`, `don't`), with the punctuation the
 * site allows (apostrophe, hyphen, comma, full stop, question mark, colon,
 * semicolon, quotation marks; never an exclamation mark) and capitals for I,
 * names, acronyms and the start of a sentence (decision D27). The words, the
 * id, the letters and the search's rows never change: the display is shown by
 * Discover, the per-hit page and the anagram of the day, and nowhere else.
 * `--clear` returns it to the words joined with spaces.
 *
 * A possessive (`dog's` for `dogs`) is accepted here and nowhere else: the
 * judge may suggest a listed form, and ingest refuses the rest.
 *
 * The rule is `displayProblem` in `desk/compose.ts`, which the desk applies
 * as the reader types; this file adds the forms file and the hit file. Pure
 * apart from `applyDisplay` and `main`, and free of the engine, so ingest in
 * the routine's sandbox can import it.
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { displayProblem } from './desk/compose.ts';
import { HITS_PATH, REPO_ROOT, hitSchema, readJsonl, writeJsonl, type Hit } from './schema.ts';

export const FORMS_PATH = resolve(REPO_ROOT, 'data/vocabulary/forms.jsonl');

/** The most characters a display may hold: the words with their marks, never a sentence about them. */
export const DISPLAY_MAX = 200;

/** The listed forms by their spelling, each to the word its letters spell: `it's` to `its`. Empty when the file is absent. */
export async function readFormsMap(path: string = FORMS_PATH): Promise<Record<string, string>> {
  let text: string;
  try {
    text = await readFile(path, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw error;
  }
  const forms: Record<string, string> = {};
  for (const line of text.split('\n')) {
    if (line.trim().length === 0) continue;
    const { form, letters } = JSON.parse(line) as { form: string; letters: string };
    forms[form] = letters;
  }
  return forms;
}

/** A display as it is kept: runs of whitespace as one space, none at either end. */
export function tidyDisplay(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Why a display cannot be set on a hit, or null. `possessives` lets a token
 * with an apostrophe or hyphen through when its letters are a word of the
 * hit though no form lists it: the operator's command alone.
 */
export function displayProblemFor(
  display: string,
  words: readonly string[],
  forms: Readonly<Record<string, string>>,
  options: { possessives?: boolean } = {},
): string | null {
  const text = tidyDisplay(display);
  if ([...text].length > DISPLAY_MAX) return `the display is ${[...text].length} characters; keep it to ${DISPLAY_MAX}`;
  return displayProblem(text, words, forms, options);
}

/** A display the judge proposed that could not be kept, and why. */
export type SkippedDisplay = { reason: string };

/**
 * The display a judge's verdict proposes for a phrase, read strictly: kept
 * only when it passes the rule with possessives refused; otherwise `skipped`
 * with the reason, and the verdict keeps its place, as a sense that breaks the
 * sentence rule does. A display equal to the words in order is nothing to keep.
 */
export function readJudgeDisplay(
  value: unknown,
  words: readonly string[],
  forms: Readonly<Record<string, string>>,
): { display: string | null; skipped: SkippedDisplay | null } {
  if (value === undefined || value === null) return { display: null, skipped: null };
  if (typeof value !== 'string') return { display: null, skipped: { reason: 'display is not a string' } };
  const text = tidyDisplay(value);
  const problem = displayProblemFor(text, words, forms);
  if (problem) return { display: null, skipped: { reason: problem } };
  return { display: text === words.join(' ') ? null : text, skipped: null };
}

export type DisplayArgs = { id: string; text: string | null };

export function parseDisplayArgs(argv: readonly string[]): DisplayArgs {
  const stray = argv.find((a) => a.startsWith('--') && a !== '--clear');
  if (stray) throw new Error(`unknown option ${stray}`);
  const clear = argv.includes('--clear');
  const [id, ...rest] = argv.filter((a) => a !== '--clear');
  if (!id) throw new Error('name a hit id, then how it should read in quotes, or --clear');
  const text = tidyDisplay(rest.join(' '));
  if (clear) {
    if (text.length > 0) throw new Error('--clear returns the display to the words; give a display or --clear, not both');
    return { id, text: null };
  }
  if (text.length === 0) throw new Error(`give ${id} a display in quotes, or --clear`);
  return { id, text };
}

export type DisplayResult = { hits: Hit[]; from: string; changed: boolean };

/**
 * Pure: the hits with the display set, or returned to the words when `text`
 * is null. Throws on an unknown id or a display that breaks the rule; a
 * possessive passes here, by the operator's command.
 */
export function setDisplay(hits: readonly Hit[], id: string, text: string | null, forms: Readonly<Record<string, string>>): DisplayResult {
  const hit = hits.find((h) => h.id === id);
  if (!hit) throw new Error(`no such hit: ${id}`);
  const wanted = text === null ? hit.words.join(' ') : tidyDisplay(text);
  if (text !== null) {
    const problem = displayProblemFor(wanted, hit.words, forms, { possessives: true });
    if (problem) throw new Error(`${problem}; the words of ${id} are ${hit.words.join(' ')}`);
  }
  const from = hit.display;
  if (from === wanted) return { hits: [...hits], from, changed: false };
  return { hits: hits.map((h) => (h.id === id ? { ...h, display: wanted } : h)), from, changed: true };
}

/** Read the file, set the display, and rewrite it only if it changed. */
export async function applyDisplay(path: string, id: string, text: string | null): Promise<DisplayResult> {
  const validator = await hitSchema();
  const result = setDisplay(await readJsonl(path, validator), id, text, await readFormsMap());
  if (result.changed) await writeJsonl(path, result.hits, validator);
  return result;
}

async function main(): Promise<void> {
  const { id, text } = parseDisplayArgs(process.argv.slice(2));
  const { from, changed } = await applyDisplay(HITS_PATH, id, text);
  if (!changed) {
    console.log(`${id}  already reads "${from}" · data/hits.jsonl left as it was`);
    return;
  }
  console.log(`${id}\n  was: ${from}\n  now: ${text ?? '(the words in order)'}\ndata/hits.jsonl rewritten`);
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  try {
    await main();
  } catch (error) {
    console.error(`hits:display: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
