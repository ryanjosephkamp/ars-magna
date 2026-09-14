/**
 * `pnpm hits:order id word word …`
 *
 * Set the order a hit's words read in. The words must be the hit's own, each
 * as many times, so the id (its words sorted) and the letters stay the same;
 * only `words` and `display` change. An unknown id, or words that are not the
 * hit's, writes nothing. The file is rewritten through the schema in its
 * existing order, so the diff is the one line.
 */
import { HITS_PATH, hitSchema, readJsonl, writeJsonl, type Hit } from './schema.ts';

export function parseOrderArgs(argv: readonly string[]): { id: string; words: string[] } {
  const stray = argv.find((a) => a.startsWith('--'));
  if (stray) throw new Error(`unknown option ${stray}`);
  const [id, ...rest] = argv;
  if (!id) throw new Error('name a hit id, then its words in the order they should read');
  const words = rest.join(' ').split(/\s+/).filter((w) => w.length > 0).map((w) => w.toLowerCase());
  if (words.length === 0) throw new Error(`give the words of ${id} in the order they should read`);
  const bad = words.filter((w) => !/^[a-z]+$/.test(w));
  if (bad.length > 0) throw new Error(`a word is lowercase letters only: ${bad.join(', ')}`);
  return { id, words };
}

export type OrderResult = { hits: Hit[]; from: string; changed: boolean };

const sorted = (words: readonly string[]) => [...words].sort().join(' ');

/** Pure: the hits with the word order set. Throws on an unknown id or words that are not the hit's. */
export function setOrder(hits: readonly Hit[], id: string, words: readonly string[]): OrderResult {
  const hit = hits.find((h) => h.id === id);
  if (!hit) throw new Error(`no such hit: ${id}`);
  if (sorted(words) !== sorted(hit.words)) {
    throw new Error(`the words of ${id} are ${hit.words.join(' ')}; give those words, each once, in any order`);
  }
  const from = hit.display;
  if (hit.words.join(' ') === words.join(' ')) return { hits: [...hits], from, changed: false };
  return { hits: hits.map((h) => (h.id === id ? { ...h, words: [...words], display: words.join(' ') } : h)), from, changed: true };
}

/** Read the file, set the order, and rewrite it only if it changed. */
export async function applyOrder(path: string, id: string, words: readonly string[]): Promise<OrderResult> {
  const validator = await hitSchema();
  const result = setOrder(await readJsonl(path, validator), id, words);
  if (result.changed) await writeJsonl(path, result.hits, validator);
  return result;
}

async function main(): Promise<void> {
  const { id, words } = parseOrderArgs(process.argv.slice(2));
  const { from, changed } = await applyOrder(HITS_PATH, id, words);
  if (!changed) {
    console.log(`${id}  already reads "${from}" · data/hits.jsonl left as it was`);
    return;
  }
  console.log(`${id}\n  was: ${from}\n  now: ${words.join(' ')}\ndata/hits.jsonl rewritten`);
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  try {
    await main();
  } catch (error) {
    console.error(`hits:order: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
