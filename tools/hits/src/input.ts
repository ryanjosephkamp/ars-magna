/**
 * `pnpm hits:input id "The input as it should read"`
 *
 * Set how a hit's input reads, when the letters stay exactly the same: "Big
 * Brother 28" to "Big Brother", since digits are not letters. The new input
 * must fold to the letters, in order, that the id already starts with, so the
 * id, the letters, the votes and the hit's page address all stay as they are;
 * only `input` changes. An unknown id, or an input that would change the id,
 * writes nothing. The file is rewritten through the schema in its existing
 * order, so the diff is the one line.
 */
import { candidateId, recordReading } from './ids.ts';
import { HITS_PATH, hitSchema, readJsonl, writeJsonl, type Hit } from './schema.ts';

export function parseInputArgs(argv: readonly string[]): { id: string; input: string } {
  const stray = argv.find((a) => a.startsWith('--'));
  if (stray) throw new Error(`unknown option ${stray}`);
  const [id, ...rest] = argv;
  if (!id) throw new Error('name a hit id, then its input in quotes');
  const input = rest.join(' ').trim();
  if (input.length === 0) throw new Error(`give ${id} its input, in quotes`);
  return { id, input };
}

export type InputResult = { hits: Hit[]; from: string; changed: boolean };

/**
 * Pure: the hits with the input set. Throws on an unknown id or an input that
 * would change the id. The new input is read as the hit's reading says (a hit
 * without one was made before phase N, when every number was dropped), so
 * "Big Brother 28" can become "Big Brother" and not "Big Brother 29"; a hit
 * with a reading keeps the part of it the new input still has.
 */
export function setInput(hits: readonly Hit[], id: string, input: string): InputResult {
  const hit = hits.find((h) => h.id === id);
  if (!hit) throw new Error(`no such hit: ${id}`);
  const expected = candidateId(hit.input, hit.category, hit.reading);
  const next = candidateId(input, hit.category, hit.reading);
  if (next !== expected) {
    throw new Error(`"${input}" reads as ${next}, not ${expected}; an input that changes the letters or their order would change the id`);
  }
  const from = hit.input;
  if (from === input) return { hits: [...hits], from, changed: false };
  const changed = { ...hit, input };
  if (hit.reading) {
    const reading = recordReading(input, hit.reading);
    if (reading) changed.reading = reading;
    else delete changed.reading;
  }
  return { hits: hits.map((h) => (h.id === id ? changed : h)), from, changed: true };
}

/** Read the file, set the input, and rewrite it only if it changed. */
export async function applyInput(path: string, id: string, input: string): Promise<InputResult> {
  const validator = await hitSchema();
  const result = setInput(await readJsonl(path, validator), id, input);
  if (result.changed) await writeJsonl(path, result.hits, validator);
  return result;
}

async function main(): Promise<void> {
  const { id, input } = parseInputArgs(process.argv.slice(2));
  const { from, changed } = await applyInput(HITS_PATH, id, input);
  if (!changed) {
    console.log(`${id}  already reads "${from}" · data/hits.jsonl left as it was`);
    return;
  }
  console.log(`${id}\n  was: ${from}\n  now: ${input}\ndata/hits.jsonl rewritten`);
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  try {
    await main();
  } catch (error) {
    console.error(`hits:input: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
