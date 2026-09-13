/**
 * `pnpm hits:justify id "One plain sentence for a reader."`
 *
 * Set a hit's justification, the sentence the gallery and the dataset show
 * with it. An unknown id, an empty sentence or one over 300 characters writes
 * nothing. The file is rewritten through the schema in its existing order, so
 * the diff is the one line.
 */
import { HITS_PATH, hitSchema, readJsonl, writeJsonl, type Hit } from './schema.ts';

export const JUSTIFICATION_MAX = 300;

export function parseJustifyArgs(argv: readonly string[]): { id: string; text: string } {
  const stray = argv.find((a) => a.startsWith('--'));
  if (stray) throw new Error(`unknown option ${stray}`);
  const [id, ...rest] = argv;
  if (!id) throw new Error('name a hit id, then its justification in quotes');
  const text = rest.join(' ').trim();
  if (text.length === 0) throw new Error(`give ${id} a justification: one plain sentence, in quotes`);
  if (text.length > JUSTIFICATION_MAX) {
    throw new Error(`the justification is ${text.length} characters; keep it to ${JUSTIFICATION_MAX}`);
  }
  return { id, text };
}

export type JustifyResult = { hits: Hit[]; from: string | null; changed: boolean };

/** Pure: the hits with the justification set. Throws on an unknown id. */
export function setJustification(hits: readonly Hit[], id: string, text: string): JustifyResult {
  const hit = hits.find((h) => h.id === id);
  if (!hit) throw new Error(`no such hit: ${id}`);
  const from = hit.justification ?? null;
  if (from === text) return { hits: [...hits], from, changed: false };
  return { hits: hits.map((h) => (h.id === id ? { ...h, justification: text } : h)), from, changed: true };
}

/** Read the file, set the justification, and rewrite it only if it changed. */
export async function applyJustification(path: string, id: string, text: string): Promise<JustifyResult> {
  const validator = await hitSchema();
  const result = setJustification(await readJsonl(path, validator), id, text);
  if (result.changed) await writeJsonl(path, result.hits, validator);
  return result;
}

async function main(): Promise<void> {
  const { id, text } = parseJustifyArgs(process.argv.slice(2));
  const { from, changed } = await applyJustification(HITS_PATH, id, text);
  if (!changed) {
    console.log(`${id}  already has that justification · data/hits.jsonl left as it was`);
    return;
  }
  console.log(`${id}\n  was: ${from ?? '(none)'}\n  now: ${text}\ndata/hits.jsonl rewritten`);
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  try {
    await main();
  } catch (error) {
    console.error(`hits:justify: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
