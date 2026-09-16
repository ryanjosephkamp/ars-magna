/**
 * `pnpm vocab:publish [--out=DIR] [--dry-run] [--repo=owner/name]`
 *
 * Build the vocabulary dataset and push it to Hugging Face.
 *
 * The site's promise is that its vocabulary is stated, not implied. This is
 * where it is stated: the union it actually searches (`vocabulary.txt`) and
 * the short list of words it adds on top of the pin (`additions.jsonl`),
 * with the pinned revision named in both the card and every addition row.
 *
 * It reads the committed dictionary artifacts rather than the pinned sources,
 * so it needs no 330 MB fetch and publishes exactly what the site ships. A
 * checkout whose artifacts are older than `additions.jsonl` is refused: the
 * two would disagree, and a dataset that disagrees with the site is worse
 * than no dataset.
 *
 * The token comes from `HF_TOKEN`, or from the file the `hf` CLI writes at
 * ~/.cache/huggingface/token, exactly as `hits:publish` does.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { REPO_ROOT } from './paths.ts';
import { committedDictionary, readAdditions, type Addition } from './vocab.ts';

const here = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = resolve(here, '../templates/vocabulary-card.md');

export const DEFAULT_REPO = 'ryanjosephkamp/ars-magna-vocabulary';
export const DEFAULT_OUT = resolve(REPO_ROOT, 'dataset-vocabulary');

/** An addition as published: its own fields, plus the pin it sits on top of. */
export type PublishedAddition = Addition & { pinned_repo: string; pinned_rev: string };

export function publishAddition(addition: Addition, source: { repo: string; rev: string }): PublishedAddition {
  return { ...addition, pinned_repo: source.repo, pinned_rev: source.rev };
}

/**
 * Every word the additions claim, checked against the artifact that will be
 * published beside them.
 *
 * An addition missing from the built dictionary means the artifacts predate
 * it: publishing then would announce a word the site cannot actually find.
 */
export function missingFromDictionary(additions: readonly Addition[], words: ReadonlySet<string>): string[] {
  return additions.map((a) => a.word).filter((word) => !words.has(word));
}

export async function renderCard(options: {
  total: number;
  pinned: number;
  additions: number;
  source: { repo: string; rev: string };
  datasetId: string;
  date: string;
}): Promise<string> {
  const template = await readFile(TEMPLATE_PATH, 'utf8');
  return template
    .replaceAll('{{TOTAL}}', options.total.toLocaleString('en-US'))
    .replaceAll('{{PINNED}}', options.pinned.toLocaleString('en-US'))
    .replaceAll('{{ADDITIONS}}', String(options.additions))
    .replaceAll('{{SOURCE_REPO}}', options.source.repo)
    .replaceAll('{{REV_SHORT}}', options.source.rev.slice(0, 7))
    .replaceAll('{{REV}}', options.source.rev)
    .replaceAll('{{DATASET_ID}}', options.datasetId)
    .replaceAll('{{DATE}}', options.date);
}

/** Write the dataset folder. Returns the files written, relative to `out`. */
export async function buildDataset(options: {
  words: readonly string[];
  pinned: ReadonlySet<string>;
  additions: readonly Addition[];
  source: { repo: string; rev: string };
  out: string;
  datasetId: string;
  date: string;
}): Promise<string[]> {
  await mkdir(options.out, { recursive: true });

  const sorted = [...options.words].sort();
  await writeFile(resolve(options.out, 'vocabulary.txt'), sorted.map((w) => `${w}\n`).join(''));
  await writeFile(
    resolve(options.out, 'additions.jsonl'),
    options.additions.map((a) => JSON.stringify(publishAddition(a, options.source)) + '\n').join(''),
  );
  await writeFile(
    resolve(options.out, 'README.md'),
    await renderCard({
      total: sorted.length,
      pinned: options.pinned.size,
      additions: options.additions.length,
      source: options.source,
      datasetId: options.datasetId,
      date: options.date,
    }),
  );
  return ['vocabulary.txt', 'additions.jsonl', 'README.md'];
}

async function token(): Promise<string> {
  const env = process.env['HF_TOKEN'];
  if (env) return env;
  try {
    const stored = (await readFile(resolve(homedir(), '.cache/huggingface/token'), 'utf8')).trim();
    if (stored) {
      console.log('using the token from ~/.cache/huggingface/token');
      return stored;
    }
  } catch {
    // Not logged in through the CLI.
  }
  throw new Error('no Hugging Face token: set HF_TOKEN or run `hf auth login`');
}

function flag(argv: readonly string[], name: string): string | undefined {
  return argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const out = flag(argv, 'out') ?? DEFAULT_OUT;
  const repo = flag(argv, 'repo') ?? DEFAULT_REPO;
  const dryRun = argv.includes('--dry-run');

  const dictionary = await committedDictionary();
  if (!dictionary) {
    console.error('no committed dictionary in apps/web/public/dict/; run pnpm dict:build first');
    process.exit(1);
  }
  const additions = await readAdditions();

  const missing = missingFromDictionary(additions, new Set(dictionary.words));
  if (missing.length > 0) {
    console.error(`the committed dictionary does not carry ${missing.join(', ')}`);
    console.error('the artifacts are older than additions.jsonl; run pnpm dict:build && pnpm dict:shards first');
    process.exit(1);
  }

  const date = new Date().toISOString().slice(0, 10);
  const files = await buildDataset({
    words: dictionary.words,
    pinned: dictionary.pinned,
    additions,
    source: dictionary.source,
    out,
    datasetId: repo,
    date,
  });

  console.log(
    `${dictionary.words.length.toLocaleString('en-US')} words ` +
      `(${dictionary.pinned.size.toLocaleString('en-US')} pinned at ${dictionary.source.rev.slice(0, 7)} + ${additions.length} added) ` +
      `-> ${out}/{${files.join(',')}}`,
  );
  if (dryRun) {
    console.log('dry run: nothing uploaded');
    return;
  }

  const { uploadFiles, createRepo, repoExists } = await import('@huggingface/hub');
  const accessToken = await token();
  const repoRef = { type: 'dataset' as const, name: repo };
  if (!(await repoExists({ repo: repoRef, accessToken }))) {
    await createRepo({ repo: repoRef, accessToken, license: 'mit' });
    console.log(`created https://huggingface.co/datasets/${repo}`);
  }
  await uploadFiles({
    repo: repoRef,
    accessToken,
    commitTitle: `Publish ${dictionary.words.length} words, ${additions.length} of them the site's own (${date})`,
    files: await Promise.all(
      files.map(async (file) => ({
        path: file,
        content: new Blob([await readFile(resolve(out, file))]),
      })),
    ),
  });
  console.log(`published https://huggingface.co/datasets/${repo}`);
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  await main();
}
