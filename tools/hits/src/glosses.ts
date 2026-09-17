/**
 * Each word's first dictionary gloss, read off the definition shards the site
 * serves from /defs.
 *
 * A sense on a hit is written only where the first gloss would not explain the
 * reading, so whoever writes one needs to see that gloss: the review desk and
 * the audit show it beside each word's field. Free of the engine, so the judge
 * routine's sandbox can read it too.
 */
import { Definitions, type WordInfo } from '@ars-magna/engine/definitions';
import { DEFS_DIR, fileFetch } from '@ars-magna/engine/files';

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
