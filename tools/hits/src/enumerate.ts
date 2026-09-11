/**
 * `pnpm hits:enumerate [--date=YYYY-MM-DD] [--status=new|all] [--first=N] [--sample=N] [--seed=N]`
 *
 * Runs `anagram batch` over data/candidates.jsonl into data/queue/<date>/.
 * The Rust CLI does the work; this finds or builds the binary and passes the
 * flags through, so the Action, the routine and a laptop all run the same
 * command.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { CANDIDATES_PATH, REPO_ROOT, today } from './schema.ts';
import { flag, queueDir } from './queue.ts';

const BINARY = resolve(REPO_ROOT, 'target/release/anagram');

function ensureBinary(): string {
  if (existsSync(BINARY)) return BINARY;
  console.log('building the anagram CLI (cargo build --release -p anagram-cli)…');
  const build = spawnSync('cargo', ['build', '--release', '-p', 'anagram-cli'], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  });
  if (build.status !== 0 || !existsSync(BINARY)) {
    throw new Error('could not build the anagram CLI; is the Rust toolchain installed?');
  }
  return BINARY;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const date = flag(argv, 'date') ?? today();
  const out = queueDir(date);
  await mkdir(out, { recursive: true });

  const args = [
    'batch',
    `--in=${CANDIDATES_PATH}`,
    `--out=${out}`,
    `--tier=${flag(argv, 'tier') ?? 'standard'}`,
    `--min-len=${flag(argv, 'min-len') ?? '3'}`,
    `--max-words=${flag(argv, 'max-words') ?? '4'}`,
    `--first=${flag(argv, 'first') ?? '2000'}`,
    `--sample=${flag(argv, 'sample') ?? '500'}`,
    `--seed=${flag(argv, 'seed') ?? '1'}`,
    `--status=${flag(argv, 'status') ?? 'new'}`,
  ];
  console.log(`anagram ${args.join(' ')}`);
  const run = spawnSync(ensureBinary(), args, { cwd: REPO_ROOT, stdio: 'inherit' });
  if (run.status !== 0) throw new Error(`anagram batch exited with ${run.status}`);
  console.log(`\nqueue: ${out}`);
}

await main();
