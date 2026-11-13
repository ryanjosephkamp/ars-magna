/**
 * `pnpm hits:glosses [--all]`
 *
 * Each word's first dictionary gloss, read off the definition shards the site
 * serves from /defs.
 *
 * A sense on a hit is written only where the first gloss would not explain the
 * reading, so whoever writes one needs to see that gloss: the review desk and
 * the audit show it beside each word's field, and the judge's batch beside
 * each phrase. Free of the engine, so the judge routine's sandbox can read it.
 *
 * Run as a command, it lists every published hit (every hit with `--all`),
 * each word with its first gloss or `no definition` and any sense the hit
 * already carries, for a person or an agent reviewing where a sense is
 * wanted. It writes nothing.
 */
import { Definitions, type WordInfo } from '@ars-magna/engine/definitions';
import { DEFS_DIR, fileFetch } from '@ars-magna/engine/files';

import { HITS_PATH, hitSchema, readJsonl, type Hit } from './schema.ts';

/** The first gloss the dictionary gives a word, or null when it has none. */
export function firstGloss(info: WordInfo): string | null {
  return info.senses[0]?.gloss ?? null;
}

/** Definitions read off disk, with every shard kept once read. */
export function shardDefinitions(): Definitions {
  return new Definitions('/defs', 512, 512, fileFetch(DEFS_DIR, /^\/defs\//));
}

/** Each distinct word's first gloss, or null, in the order the words were first given. */
export async function firstGlosses(words: Iterable<string>, definitions: Definitions = shardDefinitions()): Promise<Map<string, string | null>> {
  const distinct = [...new Set(words)];
  const infos = await definitions.lookupAll(distinct);
  return new Map(distinct.map((word, i) => [word, firstGloss(infos[i]!)]));
}

/** The listing the command prints: each hit, then each distinct word with its first gloss and any sense. Pure. */
export function renderGlossList(hits: readonly Pick<Hit, 'id' | 'input' | 'display' | 'words' | 'senses'>[], glosses: ReadonlyMap<string, string | null>): string {
  const lines: string[] = [];
  let uses = 0;
  let senses = 0;
  for (const hit of hits) {
    const words = [...new Set(hit.words)];
    const width = Math.max(...words.map((w) => w.length));
    lines.push(`${hit.id}  ${hit.input} → ${hit.display}`);
    for (const word of words) {
      uses++;
      lines.push(`  ${word.padEnd(width)}  ${glosses.get(word) ?? 'no definition'}`);
      const sense = hit.senses?.[word];
      if (sense !== undefined) {
        senses++;
        lines.push(`  ${' '.repeat(width)}  sense: ${sense}`);
      }
    }
  }
  const distinct = new Set(hits.flatMap((h) => h.words));
  const undefinedCount = [...distinct].filter((w) => (glosses.get(w) ?? null) === null).length;
  lines.push(
    '',
    `${hits.length} ${hits.length === 1 ? 'hit' : 'hits'}, ${uses} words, ${distinct.size} distinct (${undefinedCount} with no definition), ${senses} ${senses === 1 ? 'sense' : 'senses'} set`,
  );
  return `${lines.join('\n')}\n`;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const stray = argv.find((a) => a !== '--all');
  if (stray) throw new Error(`unknown argument ${stray}`);
  const all = await readJsonl(HITS_PATH, await hitSchema());
  const hits = argv.includes('--all') ? all : all.filter((h) => h.status === 'accepted' || h.status === 'featured');
  process.stdout.write(renderGlossList(hits, await firstGlosses(hits.flatMap((h) => h.words))));
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  try {
    await main();
  } catch (error) {
    console.error(`hits:glosses: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
