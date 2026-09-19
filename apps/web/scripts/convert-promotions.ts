/**
 * `pnpm votes:convert [--remote|--local|--print]`
 *
 * Turns the promotions of every published anagram into votes (voting plan R4):
 * the statements `apps/web/src/votes/convert.ts` builds from data/hits.jsonl,
 * run against the votes database one at a time with wrangler. Deploy runs it
 * with `--remote` after each upload; `--local` runs it against the database
 * `wrangler pages dev` uses; `--print` prints the statements and runs nothing.
 *
 * It prints only how many statements ran. Wrangler's own output is kept from
 * the log, and a failure is reported in a fixed sentence.
 */
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { conversionPairs, conversionStatements, type PublishedHit } from '../src/votes/convert.ts';
import { keySha256, promotionKey } from '../src/votes/core.ts';

const here = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(here, '..');
const REPO_ROOT = resolve(WEB, '../..');

async function lines<T>(path: string): Promise<T[]> {
  const text = await readFile(path, 'utf8').catch((error: NodeJS.ErrnoException) => (error.code === 'ENOENT' ? '' : Promise.reject(error)));
  return text
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l) as T);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const where = argv.includes('--remote') ? '--remote' : argv.includes('--local') ? '--local' : null;
  if (!where && !argv.includes('--print')) throw new Error('say --remote, --local or --print');

  const hits = await lines<PublishedHit>(resolve(REPO_ROOT, 'data/hits.jsonl'));
  const codes = new Set((await lines<{ key_sha256: string }>(resolve(REPO_ROOT, 'data/promotions/blocks.jsonl'))).map((b) => b.key_sha256));
  const blocked = new Set<string>();
  for (const hit of hits) {
    const key = promotionKey(hit.words);
    if (codes.has(await keySha256(key))) blocked.add(key);
  }
  const statements = conversionStatements(conversionPairs(hits, blocked));

  if (!where) {
    for (const sql of statements) console.log(`${sql};`);
    return;
  }
  for (let i = 0; i < statements.length; i++) {
    try {
      execFileSync('pnpm', ['dlx', 'wrangler@4.121.0', 'd1', 'execute', 'ars-magna-discoveries', where, '--json', '--command', statements[i]!], {
        cwd: WEB,
        env: { ...process.env, CI: '1' },
        stdio: ['ignore', 'pipe', 'pipe'],
        maxBuffer: 64 * 1024 * 1024,
      });
    } catch {
      console.error(`votes:convert: statement ${i + 1} of ${statements.length} failed; running it again is safe.`);
      process.exit(1);
    }
  }
  console.log(`votes:convert: ${statements.length} statements ran ${where === '--remote' ? 'against the live database' : 'locally'}.`);
}

await main();
