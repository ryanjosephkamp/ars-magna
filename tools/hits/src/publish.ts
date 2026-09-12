/**
 * `pnpm hits:publish [--out=DIR] [--dry-run] [--repo=owner/name]`
 *
 * Build the dataset from data/hits.jsonl and push it to Hugging Face.
 *
 * Only accepted and featured hits are published; proposed ones are waiting
 * for a person and retired ones are kept in the file so their ids are never
 * reused. One JSONL file per category plus `all`, and a card whose `configs`
 * block makes each a loadable subset. The upload goes through the
 * `@huggingface/hub` package, so the whole pipeline stays inside the pnpm
 * workspace: no Python, no CLI.
 *
 * The token comes from `HF_TOKEN`, or from the file the `hf` CLI writes at
 * ~/.cache/huggingface/token when that is present, so a laptop that has
 * logged in once needs no extra setup.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CATEGORIES, type Category } from './ids.ts';
import { flag, has } from './queue.ts';
import { HITS_PATH, REPO_ROOT, dictionaryPin, hitSchema, readJsonl, today, toJsonl, type Hit } from './schema.ts';
import { rubric } from './judge.ts';

const here = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = resolve(here, '../templates/dataset-card.md');
export const DEFAULT_REPO = 'ryanjosephkamp/ars-magna-greatest-hits';
export const DEFAULT_OUT = resolve(REPO_ROOT, 'dataset');
const SOURCE_URL = 'https://huggingface.co/datasets/ryanjosephkamp/english-openlist';

export type Config = { name: string; file: string; rows: Hit[] };

/**
 * A row as it is published. The repository file leaves `submitter` out of a
 * mined hit, but a dataset reader infers one schema for the whole file and
 * the JSON loader in the `datasets` library fails outright on a key that
 * some rows have and others lack. So every published row carries every
 * field, with `null` where the file has nothing.
 */
export type PublishedRow = Omit<Hit, 'submitter'> & { submitter: string | null };

export function publishRow(hit: Hit): PublishedRow {
  const { submitter, ...rest } = hit;
  return { ...rest, submitter: submitter ?? null };
}

/** The rows that are published: accepted and featured, nothing else. */
export function publishable(hits: readonly Hit[]): Hit[] {
  return hits.filter((h) => h.status === 'accepted' || h.status === 'featured');
}

export function configs(hits: readonly Hit[]): Config[] {
  const rows = publishable(hits);
  const out: Config[] = [{ name: 'all', file: 'all.jsonl', rows }];
  for (const category of CATEGORIES) {
    out.push({ name: category, file: `${category}.jsonl`, rows: rows.filter((h) => h.category === category) });
  }
  return out;
}

function describe(category: Category | 'all'): string {
  return {
    all: 'Every published hit.',
    people: 'People: performers, athletes, politicians, public figures.',
    companies: 'Companies and organisations.',
    products: 'Products, software, devices, brands.',
    titles: 'Films, shows, albums, books, games.',
    places: 'Cities, countries, regions, landmarks.',
    phrases: 'Phrases and the classics.',
  }[category];
}

export async function renderCard(options: {
  configs: readonly Config[];
  dictionary: { repo: string; rev: string };
  rubricVersion: string;
  datasetId: string;
  date: string;
  previousChangelog?: string;
}): Promise<string> {
  const template = await readFile(TEMPLATE_PATH, 'utf8');
  // An empty file cannot be loaded (`datasets` infers the schema from the
  // rows and stops on none), so a category with no rows keeps its file and
  // its line in the table but is not offered as a config until it has one.
  const loadable = options.configs.filter((c) => c.rows.length > 0);
  const configYaml = loadable
    .map((c) => `  - config_name: ${c.name}\n    data_files: ${c.file}`)
    .join('\n');
  const table = options.configs
    .map((c) => `| \`${c.name}\` | ${describe(c.name as Category | 'all')} | ${c.rows.length} |`)
    .join('\n');
  // The card's example loads the fullest category, so it works as printed.
  const example = [...loadable.slice(1)].sort((a, b) => b.rows.length - a.rows.length)[0]?.name ?? 'all';
  const all = options.configs[0]!.rows.length;
  const entry = `- ${options.date}: ${all} rows across ${options.configs.length - 1} categories, dictionary \`${options.dictionary.rev.slice(0, 12)}\`, rubric ${options.rubricVersion}.`;
  const changelog = options.previousChangelog ? `${entry}\n${options.previousChangelog}` : entry;

  return template
    .replace('{{CONFIGS}}', configYaml)
    .replace('{{SOURCE_URL}}', SOURCE_URL)
    .replace('{{DICT_REV}}', options.dictionary.rev)
    .replace('{{SUBSET_TABLE}}', table)
    .replace('{{DATASET_ID}}', options.datasetId)
    .replaceAll('{{EXAMPLE_CONFIG}}', example)
    .replace('{{RUBRIC}}', options.rubricVersion)
    .replace('{{CHANGELOG}}', changelog);
}

/** Write the dataset folder. Returns the files written, relative to `out`. */
export async function buildDataset(options: {
  hits: readonly Hit[];
  out: string;
  dictionary: { repo: string; rev: string };
  rubricVersion: string;
  datasetId: string;
  date: string;
}): Promise<string[]> {
  const built = configs(options.hits);
  await mkdir(options.out, { recursive: true });
  const files: string[] = [];
  for (const config of built) {
    await writeFile(resolve(options.out, config.file), toJsonl(config.rows.map(publishRow)));
    files.push(config.file);
  }
  let previousChangelog: string | undefined;
  try {
    const existing = await readFile(resolve(options.out, 'README.md'), 'utf8');
    previousChangelog = existing.split('## Changelog\n\n')[1]?.trim();
  } catch {
    // First build.
  }
  const card = await renderCard({
    configs: built,
    dictionary: options.dictionary,
    rubricVersion: options.rubricVersion,
    datasetId: options.datasetId,
    date: options.date,
    ...(previousChangelog ? { previousChangelog } : {}),
  });
  await writeFile(resolve(options.out, 'README.md'), card);
  files.push('README.md');
  return files;
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

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const out = flag(argv, 'out') ?? DEFAULT_OUT;
  const repo = flag(argv, 'repo') ?? DEFAULT_REPO;
  const dryRun = has(argv, 'dry-run');

  const hits = await readJsonl(HITS_PATH, await hitSchema());
  const { version } = await rubric();
  const files = await buildDataset({
    hits,
    out,
    dictionary: await dictionaryPin(),
    rubricVersion: version,
    datasetId: repo,
    date: today(),
  });
  const published = publishable(hits);
  console.log(`${published.length} of ${hits.length} hits are publishable -> ${out}/{${files.join(',')}}`);
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
    commitTitle: `Publish ${published.length} hits (${today()})`,
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
