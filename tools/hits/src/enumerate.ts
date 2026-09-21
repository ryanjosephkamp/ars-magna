/**
 * `pnpm hits:enumerate [--date=YYYY-MM-DD] [--preset=routine|deep] [--status=new|all] [--limit=N] [--sample=N] [--seed=N] [--in=FILE]`
 *
 * Runs `anagram batch` over data/candidates.jsonl into data/queue/<date>/.
 * The Rust CLI does the work; this finds or builds the binary and passes the
 * preset's flags through, so the Action, a deep run and a laptop all run the
 * same command. `--limit` and `--sample` override the preset's; the queue's
 * `summary.json` records the settings version either way.
 *
 * First, a `new` candidate whose input has a number or a symbol is set aside
 * with a note (`setAsideCandidates`): under the literal rule nothing is
 * converted, and the literal phase will enumerate those inputs with their
 * digits and symbols as characters of the pool. Until then the batch runs
 * over the rest.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { readItems } from '@ars-magna/engine/readings';

import { CANDIDATES_PATH, REPO_ROOT, candidateSchema, readJsonl, today, writeJsonl, type Candidate } from './schema.ts';
import { flag, queueDir } from './queue.ts';
import {
  QUEUE_ADDITIONS,
  SETTINGS_VERSION,
  SHORT_WORDS_PATH,
  presetFlag,
  readAdditionWords,
} from './settings.ts';

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
    // The queue's own copy, written just before this runs, so the queue
    // records the vocabulary it was built with rather than pointing at a
    // file that changes underneath it.
    `--additions=${resolve(out, QUEUE_ADDITIONS)}`,
    `--max-words=${preset.maxWords}`,
    `--spellings=${preset.spellings}`,
    `--expand-cap=${preset.expandCap}`,
    `--limit=${flag(argv, 'limit') ?? preset.limit}`,
    `--sample=${flag(argv, 'sample') ?? preset.sample}`,
    `--seed=${flag(argv, 'seed') ?? '1'}`,
    `--status=${flag(argv, 'status') ?? 'new'}`,
  ];
}

/**
 * Pure: the candidates the batch may run, and the ones set aside. Under the
 * literal rule (settings s6) nothing is converted, and until the literal
 * phase counts digits and symbols as characters of the pool, a `new`
 * candidate whose input has one (a run of digits, an ordinal, one of the
 * symbols `@ $ ! ? & % + #`) waits: it is left out of the run, keeps its
 * status, and gets one note saying why. Those are the first inputs the
 * literal phase enumerates.
 */
export const WAITS_NOTE = 'waits for the literal rule';

export function setAsideCandidates(candidates: readonly Candidate[]): { run: Candidate[]; aside: Candidate[]; noted: Candidate[] } {
  const run: Candidate[] = [];
  const aside: Candidate[] = [];
  const noted: Candidate[] = [];
  for (const c of candidates) {
    if (c.status === 'new' && readItems(c.input).length > 0) {
      const withNote = c.notes?.includes(WAITS_NOTE) ? c : { ...c, notes: c.notes ? `${c.notes}; ${WAITS_NOTE}` : WAITS_NOTE };
      aside.push(withNote);
      noted.push(withNote);
      continue;
    }
    run.push(c);
    noted.push(c);
  }
  return { run, aside, noted };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const date = flag(argv, 'date') ?? today();
  const out = queueDir(date);
  await mkdir(out, { recursive: true });

  // A candidate whose input has a digit or a symbol waits for the literal rule
  // (s6): the batch runs over a copy of the file without it, and the file gets
  // the note once, so the desk and a reader of the data can see why it waits.
  let runList: string | null = null;
  if (!flag(argv, 'in')) {
    const validator = await candidateSchema();
    const all = await readJsonl(CANDIDATES_PATH, validator);
    const { run, aside, noted } = setAsideCandidates(all);
    if (aside.length > 0) {
      if (noted.some((c, i) => c !== all[i])) await writeJsonl(CANDIDATES_PATH, noted, validator);
      console.log(`set aside, waiting for the literal rule: ${aside.map((c) => c.id).join(', ')}`);
      runList = resolve(tmpdir(), `ars-magna-run-${date}-${process.pid}.jsonl`);
      await writeFile(runList, run.map((c) => JSON.stringify(c)).join('\n') + (run.length ? '\n' : ''));
    }
  }

  // Written before the engine runs, and kept: the prefilter reads it back so
  // it judges rows against the vocabulary that produced them.
  const additions = await readAdditionWords();
  await writeFile(
    resolve(out, QUEUE_ADDITIONS),
    `# The site additions this queue was enumerated with, from\n` +
      `# data/vocabulary/additions.jsonl. Written by hits:enumerate; do not edit.\n` +
      additions.map((word) => `${word}\n`).join(''),
  );
  console.log(`additions: ${additions.length}`);

  const args = batchArgs(runList ? [...argv, `--in=${runList}`] : argv, out);
  console.log(`anagram ${args.join(' ')}`);
  const run = spawnSync(ensureBinary(), args, { cwd: REPO_ROOT, stdio: 'inherit' });
  if (run.status !== 0) throw new Error(`anagram batch exited with ${run.status}`);
  console.log(`\nqueue: ${out}`);
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  await main();
}
