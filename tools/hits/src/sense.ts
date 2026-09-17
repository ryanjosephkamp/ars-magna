/**
 * `pnpm hits:sense id word "One sentence."`
 * `pnpm hits:sense id word --clear`
 *
 * Set or clear the sense one of a hit's words reads in, in that anagram. The
 * Discoveries page shows it first, above the dictionary's senses, which stay
 * in their own order: `ai` is a sloth first everywhere else. A sense is
 * written only where the dictionary's first sense would not explain the
 * reading, or the word has no definition.
 *
 * An unknown id, a word that is not the hit's, and an empty sentence, one over
 * 120 characters or one without a full stop write nothing. The file is
 * rewritten through the schema in its existing order, so the diff is the one
 * line.
 *
 * Pure apart from `applySense` and `main`, and free of the engine, so ingest
 * in the routine's sandbox can import it.
 */
import { ABOUT_PATTERN, tidySentence } from './about.ts';
import { HITS_PATH, hitSchema, readJsonl, writeJsonl, type Hit } from './schema.ts';

export const SENSE_MAX = 120;

/**
 * Why a sentence cannot be a sense, or null when it can. The schema holds a
 * sense to the same one-sentence pattern as what an input is, at most 120
 * characters counted in code points. Give it a tidied sentence.
 */
export function senseProblem(text: string): string | null {
  const length = [...text].length;
  if (length === 0) return 'the sense is empty';
  if (length > SENSE_MAX) return `the sense is ${length} characters; keep it to ${SENSE_MAX}`;
  if (!ABOUT_PATTERN.test(text)) return 'write one sentence on one line, ending with a full stop';
  return null;
}

/**
 * Why a hit's senses are not all its own, or null when they are. The schema
 * checks each sentence but cannot see the hit's words, so every tool that
 * writes senses, and the test over the committed file, asks this.
 */
export function sensesProblem(hit: Pick<Hit, 'id' | 'words' | 'senses'>): string | null {
  const foreign = Object.keys(hit.senses ?? {}).filter((word) => !hit.words.includes(word));
  if (foreign.length === 0) return null;
  return `${hit.id} has a sense for ${foreign.join(', ')}, which ${foreign.length === 1 ? 'is not one of its words' : 'are not among its words'}: ${hit.words.join(' ')}`;
}

export type SenseArgs = { id: string; word: string; text: string | null };

export function parseSenseArgs(argv: readonly string[]): SenseArgs {
  const stray = argv.find((a) => a.startsWith('--') && a !== '--clear');
  if (stray) throw new Error(`unknown option ${stray}`);
  const clear = argv.includes('--clear');
  const [id, word, ...rest] = argv.filter((a) => a !== '--clear');
  if (!id || !word) throw new Error('name a hit id and one of its words, then one sentence in quotes or --clear');
  const lower = word.toLowerCase();
  if (!/^[a-z]+$/.test(lower)) throw new Error(`a word is lowercase letters only, not ${word}`);
  const text = tidySentence(rest.join(' '));
  if (clear) {
    if (text.length > 0) throw new Error('--clear removes the sense; give a sentence or --clear, not both');
    return { id, word: lower, text: null };
  }
  if (text.length === 0) throw new Error(`give ${lower} in ${id} a sense: one sentence in quotes, or --clear`);
  const problem = senseProblem(text);
  if (problem) throw new Error(problem);
  return { id, word: lower, text };
}

export type SenseResult = { hits: Hit[]; from: string | null; changed: boolean };

/**
 * Pure: the hits with the sense set, or cleared when `text` is null. Senses
 * keep the order the hit's words read in, and a hit left with none loses the
 * field. Throws on an unknown id or a word that is not the hit's.
 */
export function setSense(hits: readonly Hit[], id: string, word: string, text: string | null): SenseResult {
  const hit = hits.find((h) => h.id === id);
  if (!hit) throw new Error(`no such hit: ${id}`);
  if (!hit.words.includes(word)) throw new Error(`${word} is not a word of ${id}; its words are ${hit.words.join(' ')}`);
  const from = hit.senses?.[word] ?? null;
  if (from === text) return { hits: [...hits], from, changed: false };

  const wanted = { ...hit.senses };
  if (text === null) delete wanted[word];
  else wanted[word] = text;
  const senses: Record<string, string> = {};
  for (const w of hit.words) {
    const sense = wanted[w];
    if (sense !== undefined) senses[w] = sense;
  }

  const { senses: _old, ...rest } = hit;
  const next: Hit = Object.keys(senses).length > 0 ? { ...rest, senses } : rest;
  return { hits: hits.map((h) => (h.id === id ? next : h)), from, changed: true };
}

/** Read the file, set the sense, and rewrite it only if it changed. */
export async function applySense(path: string, id: string, word: string, text: string | null): Promise<SenseResult> {
  const validator = await hitSchema();
  const result = setSense(await readJsonl(path, validator), id, word, text);
  if (result.changed) await writeJsonl(path, result.hits, validator);
  return result;
}

async function main(): Promise<void> {
  const { id, word, text } = parseSenseArgs(process.argv.slice(2));
  const { from, changed } = await applySense(HITS_PATH, id, word, text);
  if (!changed) {
    const already = text === null ? `has no sense for ${word}` : `already reads ${word} that way`;
    console.log(`${id}  ${already} · data/hits.jsonl left as it was`);
    return;
  }
  console.log(`${id}  ${word}\n  was: ${from ?? '(none)'}\n  now: ${text ?? '(none)'}\ndata/hits.jsonl rewritten`);
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  try {
    await main();
  } catch (error) {
    console.error(`hits:sense: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
