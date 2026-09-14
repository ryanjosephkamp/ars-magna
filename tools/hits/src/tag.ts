/**
 * `pnpm hits:tag id +subject:actor -tone:rude …`
 *
 * Add and remove a hit's tags by id: `+tag` adds, `-tag` removes. A tag added
 * must be one the hit schema allows, and the id must be in data/hits.jsonl;
 * otherwise nothing is written. The file is rewritten through the schema in
 * its existing order, so the diff is the one line.
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { HITS_PATH, SCHEMA_DIR, hitSchema, readJsonl, writeJsonl, type Hit } from './schema.ts';

/** The tag pattern, read from the hit schema so it is defined once. */
export async function tagPattern(): Promise<RegExp> {
  const schema = JSON.parse(await readFile(resolve(SCHEMA_DIR, 'hit.schema.json'), 'utf8')) as {
    properties: { tags: { items: { pattern: string } } };
  };
  return new RegExp(schema.properties.tags.items.pattern);
}

export type TagArgs = { id: string; add: string[]; remove: string[] };

export function parseTagArgs(argv: readonly string[]): TagArgs {
  const stray = argv.find((a) => a.startsWith('--'));
  if (stray) throw new Error(`unknown option ${stray}`);
  const ids = argv.filter((a) => !a.startsWith('+') && !a.startsWith('-'));
  if (ids.length !== 1) {
    throw new Error('name one hit id, then +tag to add and -tag to remove, e.g. dormitory:phrases:dirty-room +tone:pun');
  }
  const add = [...new Set(argv.filter((a) => a.startsWith('+')).map((a) => a.slice(1)))];
  const remove = [...new Set(argv.filter((a) => a.startsWith('-')).map((a) => a.slice(1)))];
  if (add.length + remove.length === 0) throw new Error(`name at least one +tag or -tag for ${ids[0]}`);
  const both = add.filter((t) => remove.includes(t));
  if (both.length > 0) throw new Error(`both added and removed: ${both.join(', ')}`);
  return { id: ids[0]!, add, remove };
}

export type TagResult = { hits: Hit[]; added: string[]; removed: string[]; unchanged: string[] };

/** Pure: the hits with the tags changed. Throws on a tag the schema refuses or an unknown id. */
export function applyTags(hits: readonly Hit[], args: TagArgs, pattern: RegExp): TagResult {
  const bad = args.add.filter((t) => !pattern.test(t));
  if (bad.length > 0) {
    throw new Error(
      `not a tag the schema allows: ${bad.join(', ')}. Use classic, submitted, alternate, greatest-candidate, note:<text>, ` +
        'shelf:<interesting|stretch>, subject:<lowercase-slug> or tone:<literal|ironic|pun|self-referential|uncanny|rude>',
    );
  }
  const hit = hits.find((h) => h.id === args.id);
  if (!hit) throw new Error(`no such hit: ${args.id}`);
  const added = args.add.filter((t) => !hit.tags.includes(t));
  const removed = args.remove.filter((t) => hit.tags.includes(t));
  const unchanged = [...args.add.filter((t) => hit.tags.includes(t)), ...args.remove.filter((t) => !hit.tags.includes(t))];
  if (added.length + removed.length === 0) return { hits: [...hits], added, removed, unchanged };
  const tags = [...hit.tags.filter((t) => !removed.includes(t)), ...added];
  return { hits: hits.map((h) => (h.id === args.id ? { ...h, tags } : h)), added, removed, unchanged };
}

/** Read the file, change the tags, and rewrite it only if something changed. */
export async function applyTagFile(path: string, args: TagArgs): Promise<TagResult> {
  const validator = await hitSchema();
  const result = applyTags(await readJsonl(path, validator), args, await tagPattern());
  if (result.added.length + result.removed.length > 0) await writeJsonl(path, result.hits, validator);
  return result;
}

async function main(): Promise<void> {
  const args = parseTagArgs(process.argv.slice(2));
  const { added, removed, unchanged } = await applyTagFile(HITS_PATH, args);
  for (const t of added) console.log(`${args.id}  +${t}`);
  for (const t of removed) console.log(`${args.id}  -${t}`);
  for (const t of unchanged) console.log(`${args.id}  ${args.add.includes(t) ? `already has ${t}` : `has no ${t}`}`);
  console.log(added.length + removed.length > 0 ? 'data/hits.jsonl rewritten' : 'nothing changed · data/hits.jsonl left as it was');
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  try {
    await main();
  } catch (error) {
    console.error(`hits:tag: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
