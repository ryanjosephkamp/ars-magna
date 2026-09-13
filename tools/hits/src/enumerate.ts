/**
 * `pnpm hits:enumerate [--date=YYYY-MM-DD] [--preset=routine|deep] [--status=new|all] [--limit=N] [--sample=N] [--seed=N] [--in=FILE]`
 *
 * Runs `anagram batch` over data/candidates.jsonl into data/queue/<date>/.
 * The Rust CLI does the work; this finds or builds the binary and passes the
 * preset's flags through, so the Action, a deep run and a laptop all run the
 * same command. `--limit` and `--sample` override the preset's; the queue's
 * `summary.json` records the settings version either way.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { CANDIDATES_PATH, REPO_ROOT, today } from './schema.ts';
import { flag, queueDir } from './queue.ts';
import { SETTINGS_VERSION, SHORT_WORDS_PATH, presetFlag } from './settings.ts';

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

/** The `anagram batch` arguments for a preset, with any overrides. Pure. */
export function batchArgs(argv: readonly string[], out: string): string[] {
  const preset = presetFlag(flag(argv, 'preset'));
  const input = flag(argv, 'in');
  return [
    'batch',
    `--in=${input ? resolve(process.env['INIT_CWD'] ?? process.cwd(), input) : CANDIDATES_PATH}`,
    `--out=${out}`,
    `--settings=${SETTINGS_VERSION}`,
    `--tier=${preset.tier}`,
    `--min-len=${preset.minLength}`,
    `--short-words=${SHORT_WORDS_PATH}`,
    `--max-words=${preset.maxWords}`,
    `--spellings=${preset.spellings}`,
    `--expand-cap=${preset.expandCap}`,
    `--limit=${flag(argv, 'limit') ?? preset.limit}`,
    `--sample=${flag(argv, 'sample') ?? preset.sample}`,
    `--seed=${flag(argv, 'seed') ?? '1'}`,
    `--status=${flag(argv, 'status') ?? 'new'}`,
  ];
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const date = flag(argv, 'date') ?? today();
  const out = queueDir(date);
  await mkdir(out, { recursive: true });

  const args = batchArgs(argv, out);
  console.log(`anagram ${args.join(' ')}`);
  const run = spawnSync(ensureBinary(), args, { cwd: REPO_ROOT, stdio: 'inherit' });
  if (run.status !== 0) throw new Error(`anagram batch exited with ${run.status}`);
  console.log(`\nqueue: ${out}`);
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  await main();
}
