/**
 * Propose a term for one of the term classes (decision D63).
 *
 *   pnpm vocab:term blends b8 "bait" "Text-messaging spelling of bait." --trace=https://en.wiktionary.org/wiki/b8
 *   pnpm vocab:term acronyms wtf "what the fuck" "Initialism of what the fuck." --trace=… --written=WTF --tone=crude
 *
 * Appends one line to the class's file through its schema and every rule
 * `vocab:check` enforces: a term of the pool's characters, never a word of the
 * dictionary, never twice, and in another class or the names list only when
 * `--also=` says so. It does not admit the term: the `classes` artifact
 * changes when the rebuilt dictionary is committed with `[dict]` and the
 * operator merges the pull request that carries it.
 */
import { appendFile, mkdir } from 'node:fs/promises';

import {
  TERM_CLASSES,
  VOCAB_DIR,
  classFilePath,
  classSchema,
  committedDictionary,
  explain,
  isTermClass,
  readClassFiles,
  readNames,
  termProblems,
  type ClassTermLine,
} from './vocab.ts';

function flag(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function main(): Promise<void> {
  const [className, term, readsAs, gloss] = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
  if (!className || !term || !readsAs || !gloss || !isTermClass(className)) {
    console.error(
      `usage: pnpm vocab:term <${TERM_CLASSES.join('|')}> <term> "<reads as>" "<One sentence.>" --trace=<url> \\\n` +
        '         [--tone=crude] [--written=WTF] [--also=names,acronyms] [--proposed-by=<who>] [--note=<text>]',
    );
    process.exit(1);
  }

  const also = flag('also');
  const candidate = {
    term,
    reads_as: readsAs,
    gloss,
    trace: flag('trace'),
    proposed_by: flag('proposed-by') ?? 'ryanjosephkamp',
    added: flag('added') ?? today(),
    ...(flag('tone') === undefined ? {} : { tone: flag('tone') }),
    ...(also === undefined ? {} : { also: also.split(',').map((c) => c.trim()).filter((c) => c.length > 0) }),
    ...(flag('written') === undefined ? {} : { written: flag('written') }),
    ...(flag('note') === undefined ? {} : { note: flag('note') }),
  };

  const check = await classSchema(className);
  if (!check(candidate)) {
    console.error(`✗ ${className}: ${term}: ${explain(check)}`);
    process.exit(1);
  }

  const files = await readClassFiles();
  files.set(className, [...(files.get(className) ?? []), candidate as ClassTermLine]);
  const dictionary = await committedDictionary();
  if (!dictionary) console.log('no committed dictionary to check against; the word rule was skipped');
  const names = new Set((await readNames()).map((n) => n.name));
  const problems = termProblems(files, dictionary ? new Set(dictionary.words) : null, names);
  if (problems.length > 0) {
    console.error(`✗ ${problems.join('\n  ')}`);
    process.exit(1);
  }

  await mkdir(VOCAB_DIR, { recursive: true });
  await appendFile(classFilePath(className), `${JSON.stringify(candidate)}\n`);

  console.log(`✓ ${term} proposed as ${className}, reads as ${readsAs}${candidate.tone ? ' (crude)' : ''}`);
  console.log(`  ${gloss}`);
  console.log(`  ${candidate.trace}`);
  console.log(
    `\nIt is not in the dictionary yet. Rebuild and commit the artifacts:\n` +
      `  pnpm dict:fetch && pnpm dict:build\n` +
      `then open a pull request with "[dict]" in the commit message.`,
  );
}

await main();
