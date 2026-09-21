/**
 * `pnpm hits:enumerate [--date=YYYY-MM-DD] [--preset=routine|deep] [--status=new|all] [--limit=N] [--sample=N] [--seed=N] [--in=FILE] [--names]`
 *
 * Runs `anagram batch` over data/candidates.jsonl into data/queue/<date>/.
 * The Rust CLI does the work; this finds or builds the binary and passes the
 * preset's flags through, so the Action, a deep run and a laptop all run the
 * same command. `--limit` and `--sample` override the preset's; the queue's
 * `summary.json` records the settings version either way.
 *
 * First, a candidate from before phase N (no `reading`) whose input has a
 * number or a symbol, and whose turn it is (`status: new`), is read afresh by
 * the defaults and takes the id its letters now give, with a note naming the
 * old one: only a queue changes what a candidate is, and this is the queue
 * that does. One that is already enumerated keeps its id until it is
 * requeued; one read as its hits are (`hits:read`) has a reading and moves
 * not at all.
 *
 * `--names` is the names experiment (phase Q1): the names list joins the
 * queue's copy of the additions, so the engine admits the names beside Common
 * and the prefilter lets them through. The engine can only admit a word its
 * dictionary carries, so this needs the artifacts `pnpm dict:build --names`
 * writes in place, and refuses to run against the site's own.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { candidateId, recordReading } from './ids.ts';
import { CANDIDATES_PATH, REPO_ROOT, candidateSchema, readJsonl, today, writeJsonl, type Candidate } from './schema.ts';
import { flag, has, queueDir } from './queue.ts';
import {
  QUEUE_ADDITIONS,
  SETTINGS_VERSION,
  SHORT_WORDS_PATH,
  presetFlag,
  readAdditionWords,
  readNameWords,
} from './settings.ts';

const BINARY = resolve(REPO_ROOT, 'target/release/anagram');
const MANIFEST = resolve(REPO_ROOT, 'apps/web/public/dict/manifest.json');

/** How many names the dictionary in place carries: the names build's count, or none. */
function namesInDictionary(): number {
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as { counts?: { names?: number } };
  return manifest.counts?.names ?? 0;
}

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
 * Pure: the candidates with every `new` one from before phase N whose input
 * has items read by the defaults and re-id'd, and the ids that moved, old to
 * new. A candidate whose new id another line already holds is left as it is
 * and named in `clashes`, for a person to settle.
 */
export function rereadCandidates(
  candidates: readonly Candidate[],
  date: string,
): { candidates: Candidate[]; moved: [string, string][]; clashes: [string, string][]; changed: number } {
  const ids = new Set(candidates.map((c) => c.id));
  const moved: [string, string][] = [];
  const clashes: [string, string][] = [];
  let changed = 0;
  const out = candidates.map((c) => {
    if (c.status !== 'new' || c.reading) return c;
    const reading = recordReading(c.input);
    if (!reading) return c;
    const id = candidateId(c.input, c.category, reading);
    changed++;
    // The letters are as they were (every item dropped by default): the reading alone is written.
    if (id === c.id) return { ...c, reading };
    if (ids.has(id)) {
      changed--;
      clashes.push([c.id, id]);
      return c;
    }
    ids.add(id);
    moved.push([c.id, id]);
    const note = `re-read ${date} from ${c.id}`;
    return { ...c, id, reading, notes: c.notes ? `${c.notes}; ${note}` : note };
  });
  return { candidates: out, moved, clashes, changed };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const date = flag(argv, 'date') ?? today();
  const out = queueDir(date);
  await mkdir(out, { recursive: true });

  // Candidates from before phase N with a number or a symbol, whose turn it is, read afresh.
  if (!flag(argv, 'in')) {
    const validator = await candidateSchema();
    const reread = rereadCandidates(await readJsonl(CANDIDATES_PATH, validator), date);
    if (reread.changed > 0) {
      await writeJsonl(CANDIDATES_PATH, reread.candidates, validator);
      for (const [from, to] of reread.moved) console.log(`re-read: ${from} -> ${to}`);
    }
    for (const [from, to] of reread.clashes) console.log(`not re-read: ${from} would become ${to}, which exists; settle it by hand`);
  }

  // Written before the engine runs, and kept: the prefilter reads it back so
  // it judges rows against the vocabulary that produced them.
  const additions = await readAdditionWords();
  const names = has(argv, 'names') ? await readNameWords() : [];
  if (has(argv, 'names')) {
    const carried = namesInDictionary();
    if (carried !== names.length) {
      throw new Error(
        `--names needs the names build in place: the dictionary at apps/web/public/dict carries ${carried} names and the list has ${names.length}.\n` +
          `  run pnpm dict:build --names first, and git checkout -- apps/web/public/dict afterwards`,
      );
    }
  }
  await writeFile(
    resolve(out, QUEUE_ADDITIONS),
    `# The site additions this queue was enumerated with, from\n` +
      `# data/vocabulary/additions.jsonl. Written by hits:enumerate; do not edit.\n` +
      additions.map((word) => `${word}\n`).join('') +
      (names.length > 0
        ? `# The names list admitted for this run (the names experiment, phase Q1), from\n` +
          `# data/vocabulary/names.jsonl; in no tier, so every row with one is labelled extended.\n` +
          names.map((word) => `${word}\n`).join('')
        : ''),
  );
  console.log(`additions: ${additions.length}${names.length > 0 ? ` · names: ${names.length}` : ''}`);

  const args = batchArgs(argv, out);
  console.log(`anagram ${args.join(' ')}`);
  const run = spawnSync(ensureBinary(), args, { cwd: REPO_ROOT, stdio: 'inherit' });
  if (run.status !== 0) throw new Error(`anagram batch exited with ${run.status}`);
  console.log(`\nqueue: ${out}`);
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  await main();
}
