/**
 * `pnpm vocab:publish [--out=DIR] [--dry-run] [--repo=owner/name]`
 *
 * Build the vocabulary dataset and push it to Hugging Face.
 *
 * The site's promise is that its vocabulary is stated, not implied. This is
 * where it is stated: the union it actually searches (`vocabulary.txt`), the
 * short list of words it adds on top of the pin (`additions.jsonl`), its
 * listed forms, and the term classes it can admit beside the words (the
 * class files, one dataset file each), with the pinned revision named in the
 * card and in every row.
 *
 * It reads the committed dictionary artifacts rather than the pinned sources,
 * so it needs no 330 MB fetch and publishes exactly what the site ships. A
 * checkout whose artifacts are older than `additions.jsonl` is refused: the
 * two would disagree, and a dataset that disagrees with the site is worse
 * than no dataset. A checkout whose `classes` artifact is older than a class
 * file is refused the same way, since publishing a term the site cannot admit
 * announces a vocabulary the search does not have.
 *
 * The token comes from `HF_TOKEN`, or from the file the `hf` CLI writes at
 * ~/.cache/huggingface/token, exactly as `hits:publish` does.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { REPO_ROOT } from './paths.ts';
import {
  CLASS_FILES,
  classArtifactProblems,
  committedClasses,
  committedDictionary,
  readAdditions,
  readClassFiles,
  readForms,
  type Addition,
  type ClassTermLine,
  type Form,
  type TermClass,
} from './vocab.ts';
import { classTerms, readClassEntries } from './classes.ts';

const here = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = resolve(here, '../templates/vocabulary-card.md');

export const DEFAULT_REPO = 'ryanjosephkamp/ars-magna-vocabulary';
export const DEFAULT_OUT = resolve(REPO_ROOT, 'dataset-vocabulary');

/** An addition as published: its own fields, plus the pin it sits on top of. */
export type PublishedAddition = Addition & { pinned_repo: string; pinned_rev: string };
/** A form as published, the same way. */
export type PublishedForm = Form & { pinned_repo: string; pinned_rev: string };

export function publishAddition(addition: Addition, source: { repo: string; rev: string }): PublishedAddition {
  return { ...addition, pinned_repo: source.repo, pinned_rev: source.rev };
}

export function publishForm(form: Form, source: { repo: string; rev: string }): PublishedForm {
  return { ...form, pinned_repo: source.repo, pinned_rev: source.rev };
}

/** A term of a class as published: its line, the class, and the pin it was refused as a word against. */
export type PublishedTerm = ClassTermLine & { class: TermClass; pinned_repo: string; pinned_rev: string };

export function publishTerm(term: ClassTermLine, name: TermClass, source: { repo: string; rev: string }): PublishedTerm {
  return { ...term, class: name, pinned_repo: source.repo, pinned_rev: source.rev };
}

/** The class files the dataset always carries, empty where the class has no terms, so every config resolves. */
export const PUBLISHED_CLASSES: readonly TermClass[] = ['symbols', 'shorthand', 'blends', 'acronyms'];

/**
 * Every word the additions claim, and every letters-word the forms spell,
 * checked against the artifact that will be published beside them.
 *
 * One missing from the built dictionary means the artifacts predate it:
 * publishing then would announce a word the site cannot actually find.
 */
export function missingFromDictionary(
  additions: readonly Addition[],
  words: ReadonlySet<string>,
  forms: readonly Form[] = [],
): string[] {
  return [...additions.map((a) => a.word), ...forms.map((f) => f.letters)].filter((word) => !words.has(word));
}

export async function renderCard(options: {
  total: number;
  pinned: number;
  additions: number;
  forms: number;
  /** How many terms each published class file carries. */
  classes?: Partial<Record<TermClass, number>>;
  source: { repo: string; rev: string };
  datasetId: string;
  date: string;
}): Promise<string> {
  const template = await readFile(TEMPLATE_PATH, 'utf8');
  const classes = options.classes ?? {};
  const terms = PUBLISHED_CLASSES.reduce((n, name) => n + (classes[name] ?? 0), 0);
  return template
    .replaceAll('{{TOTAL}}', options.total.toLocaleString('en-US'))
    .replaceAll('{{PINNED}}', options.pinned.toLocaleString('en-US'))
    .replaceAll('{{ADDITIONS}}', String(options.additions))
    .replaceAll('{{FORMS}}', String(options.forms))
    .replaceAll('{{SYMBOLS}}', String(classes.symbols ?? 0))
    .replaceAll('{{SHORTHAND}}', String(classes.shorthand ?? 0))
    .replaceAll('{{BLENDS}}', String(classes.blends ?? 0))
    .replaceAll('{{ACRONYMS}}', String(classes.acronyms ?? 0))
    .replaceAll('{{TERMS}}', String(terms))
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
  forms?: readonly Form[];
  /** The class files' lines, by class; a class absent here is published empty. */
  classes?: ReadonlyMap<TermClass, readonly ClassTermLine[]>;
  source: { repo: string; rev: string };
  out: string;
  datasetId: string;
  date: string;
}): Promise<string[]> {
  await mkdir(options.out, { recursive: true });
  const forms = options.forms ?? [];
  const classes = options.classes ?? new Map<TermClass, readonly ClassTermLine[]>();

  const sorted = [...options.words].sort();
  await writeFile(resolve(options.out, 'vocabulary.txt'), sorted.map((w) => `${w}\n`).join(''));
  await writeFile(
    resolve(options.out, 'additions.jsonl'),
    options.additions.map((a) => JSON.stringify(publishAddition(a, options.source)) + '\n').join(''),
  );
  await writeFile(
    resolve(options.out, 'forms.jsonl'),
    forms.map((f) => JSON.stringify(publishForm(f, options.source)) + '\n').join(''),
  );
  const counts: Partial<Record<TermClass, number>> = {};
  for (const name of PUBLISHED_CLASSES) {
    const lines = classes.get(name) ?? [];
    counts[name] = lines.length;
    await writeFile(
      resolve(options.out, CLASS_FILES[name]),
      lines.map((t) => JSON.stringify(publishTerm(t, name, options.source)) + '\n').join(''),
    );
  }
  await writeFile(
    resolve(options.out, 'README.md'),
    await renderCard({
      total: sorted.length,
      pinned: options.pinned.size,
      additions: options.additions.length,
      forms: forms.length,
      classes: counts,
      source: options.source,
      datasetId: options.datasetId,
      date: options.date,
    }),
  );
  return ['vocabulary.txt', 'additions.jsonl', 'forms.jsonl', ...PUBLISHED_CLASSES.map((name) => CLASS_FILES[name]), 'README.md'];
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
  const forms = await readForms();
  const classes = await readClassFiles();

  const missing = missingFromDictionary(additions, new Set(dictionary.words), forms);
  if (missing.length > 0) {
    console.error(`the committed dictionary does not carry ${missing.join(', ')}`);
    console.error('the artifacts are older than additions.jsonl or forms.jsonl; run pnpm dict:build && pnpm dict:shards first');
    process.exit(1);
  }

  // The same guard for the terms: the class files and the names list against
  // the committed `classes` artifact, which is what the site actually loads.
  const classArtifact = await committedClasses();
  const classTrouble = classArtifactProblems(classTerms(await readClassEntries()), classArtifact);
  if (classTrouble.length > 0) {
    console.error(
      `the committed classes artifact and the class files disagree over ${classTrouble.length} term${classTrouble.length === 1 ? '' : 's'}:`,
    );
    for (const problem of classTrouble.slice(0, 20)) console.error(`  ${problem}`);
    if (classTrouble.length > 20) console.error(`  … and ${classTrouble.length - 20} more`);
    console.error('publishing now would announce a term the site cannot admit');
    process.exit(1);
  }
  console.log(
    classArtifact === null
      ? 'no classes artifact, and no term in the class files or the names list to carry'
      : `${classArtifact.length.toLocaleString('en-US')} terms in the committed classes artifact, the class files and the names list term for term and bit for bit`,
  );

  const date = new Date().toISOString().slice(0, 10);
  const files = await buildDataset({
    words: dictionary.words,
    pinned: dictionary.pinned,
    additions,
    forms,
    classes,
    source: dictionary.source,
    out,
    datasetId: repo,
    date,
  });

  const formOnly = dictionary.forms.filter((f) => f.shown).length;
  const terms = [...classes.values()].reduce((n, lines) => n + lines.length, 0);
  console.log(
    `${dictionary.words.length.toLocaleString('en-US')} words ` +
      `(${dictionary.pinned.size.toLocaleString('en-US')} pinned at ${dictionary.source.rev.slice(0, 7)} + ${additions.length} added + ` +
      `${formOnly} from the ${forms.length} listed forms), ${terms} terms of ${classes.size} classes ` +
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
    commitTitle: `Publish ${dictionary.words.length} words, ${additions.length} of them the site's own, with ${forms.length} listed forms and ${terms} terms of the classes (${date})`,
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
