/**
 * Turn the class files into what the site serves: public/terms.json, the
 * labelled terms of decision D63 with what each reads as, its gloss and its
 * trace. Runs before `vite` in both dev and build, beside build-hits.ts, so
 * the file is always derived, never edited, and never committed.
 *
 * The `classes` artifact the engine loads carries a term and its class bits
 * and nothing else, by design, so the word panel, the Build page's checks and
 * `/api/promote` read the terms here instead. The names list is not among
 * them: a name is letters, the row's tag says it is a name, and the panel has
 * its own sentence for one.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CLASS_FILE, type Term } from '../src/lib/terms.ts';

const here = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(here, '../../..');
const VOCAB = resolve(REPO_ROOT, 'data/vocabulary');
const PUBLIC = resolve(here, '../public');

/** One line of a class file, as `data/schema/{symbol,shorthand,blend,acronym}.schema.json` has it. */
type Line = {
  term: string;
  reads_as: string;
  gloss: string;
  trace: string;
  tone?: 'crude';
  written?: string;
};

async function readClassFile(path: string): Promise<Line[]> {
  try {
    const text = await readFile(path, 'utf8');
    return text
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line) as Line);
  } catch (error) {
    // A class whose file does not exist yet (slang, until G1) has no terms.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

async function main(): Promise<void> {
  const terms: Term[] = [];
  for (const [name, file] of Object.entries(CLASS_FILE)) {
    for (const line of await readClassFile(resolve(VOCAB, file))) {
      terms.push({
        term: line.term,
        class: name as Term['class'],
        reads: line.reads_as,
        gloss: line.gloss,
        trace: line.trace,
        ...(line.tone ? { tone: line.tone } : {}),
        ...(line.written ? { written: line.written } : {}),
      });
    }
  }
  terms.sort((a, b) => (a.term < b.term ? -1 : a.term > b.term ? 1 : 0));
  await writeFile(resolve(PUBLIC, 'terms.json'), `${JSON.stringify({ generated: new Date().toISOString(), terms })}\n`);
  console.log(`terms: ${terms.length} of ${Object.keys(CLASS_FILE).length} classes -> public/terms.json`);
}

await main();
