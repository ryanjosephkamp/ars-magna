/**
 * Turn data/hits.jsonl into what the site serves: public/hits.json for the
 * gallery and one static page per hit under public/hits/<slug>/ for shared
 * links. Runs before `vite` in both dev and build, so the folder is always
 * derived, never edited, and never committed.
 *
 * Each hit's orderings are ranked here with the engine under Node, which needs
 * `pnpm wasm:build` and the committed dictionary, so Discover can show them
 * without loading the engine at all.
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Engine } from '@ars-magna/engine/node';

import { hitPage, ordered, publishable, toPublic, type HitRecord, type PublicHit } from '../src/hits/build.ts';
import { hitOrderings } from '../src/lib/orderings.ts';

const here = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(here, '../../..');
const HITS_PATH = resolve(REPO_ROOT, 'data/hits.jsonl');
const BLOCKS_PATH = resolve(REPO_ROOT, 'data/promotions/blocks.jsonl');
const PUBLIC = resolve(here, '../public');
const ORIGIN = process.env['SITE_ORIGIN'] ?? 'https://ars-magna.pages.dev';

async function main(): Promise<void> {
  const text = await readFile(HITS_PATH, 'utf8');
  const records = text
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l) as HitRecord);
  // Each hit's orderings, ranked once here with the engine's part-of-speech masks, so the page needs no
  // engine. One call at a time: the engine under Node answers on a single port.
  const engine = await Engine.boot();
  const published: PublicHit[] = [];
  for (const hit of publishable(records)) {
    const masks = hit.words.length > 1 ? await engine.masks(hit.words) : [];
    published.push({ ...toPublic(hit), orderings: hitOrderings(hit.words, masks) });
  }
  const rows = ordered(published);

  // The codes of the blocked anagrams (their keys' SHA-256), which the API refuses and the pages hide Promote for.
  const blocked = (await readFile(BLOCKS_PATH, 'utf8'))
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l) => (JSON.parse(l) as { key_sha256: string }).key_sha256)
    .sort();
  await writeFile(resolve(PUBLIC, 'hits.json'), `${JSON.stringify({ generated: new Date().toISOString(), hits: rows, blocked })}\n`);

  const dir = resolve(PUBLIC, 'hits');
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  for (const hit of rows) {
    await mkdir(resolve(dir, hit.slug), { recursive: true });
    await writeFile(resolve(dir, hit.slug, 'index.html'), hitPage(hit, ORIGIN));
  }
  const pages = (await readdir(dir)).length;
  console.log(`hits: ${rows.length} published of ${records.length} -> public/hits.json and ${pages} pages; ${blocked.length} blocked`);
}

await main();
