/**
 * Turn data/hits.jsonl into what the site serves: public/hits.json for the
 * gallery and one static page per hit under public/hits/<slug>/ for shared
 * links. Runs before `vite` in both dev and build, so the folder is always
 * derived, never edited, and never committed.
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { hitPage, ordered, publishable, toPublic, type HitRecord } from '../src/hits/build.ts';

const here = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(here, '../../..');
const HITS_PATH = resolve(REPO_ROOT, 'data/hits.jsonl');
const PUBLIC = resolve(here, '../public');
const ORIGIN = process.env['SITE_ORIGIN'] ?? 'https://ars-magna.pages.dev';

async function main(): Promise<void> {
  const text = await readFile(HITS_PATH, 'utf8');
  const records = text
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l) as HitRecord);
  const rows = ordered(publishable(records).map(toPublic));

  await writeFile(resolve(PUBLIC, 'hits.json'), `${JSON.stringify({ generated: new Date().toISOString(), hits: rows })}\n`);

  const dir = resolve(PUBLIC, 'hits');
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  for (const hit of rows) {
    await mkdir(resolve(dir, hit.slug), { recursive: true });
    await writeFile(resolve(dir, hit.slug, 'index.html'), hitPage(hit, ORIGIN));
  }
  const pages = (await readdir(dir)).length;
  console.log(`hits: ${rows.length} published of ${records.length} -> public/hits.json and ${pages} pages`);
}

await main();
