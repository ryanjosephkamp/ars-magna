/**
 * Propose a word for the vocabulary.
 *
 *   pnpm vocab:add doomer --kind=slang --gloss="…" --trace=https://…
 *
 * Appends one line through the schema and every rule `vocab:check` enforces.
 * It does not admit the word: the dictionary changes when the rebuilt artifacts
 * are committed and the operator merges the pull request that carries them.
 */
import { appendFile, mkdir } from 'node:fs/promises';

import {
  ADDITIONS_PATH,
  VOCAB_DIR,
  additionSchema,
  explain,
  pinnedWords,
  problemsWith,
  readAdditions,
  type Addition,
} from './vocab.ts';

function flag(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function main(): Promise<void> {
  const word = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
  if (!word) {
    console.error(
      'usage: pnpm vocab:add <word> --kind=slang|coinage|name|abbreviation|later-in-openlist \\\n' +
        '         --gloss="One sentence." --trace=<url or note> [--proposed-by=<who>] [--note=<text>]',
    );
    process.exit(1);
  }

  const candidate = {
    word,
    kind: flag('kind'),
    gloss: flag('gloss'),
    trace: flag('trace'),
    proposed_by: flag('proposed-by') ?? 'ryanjosephkamp',
    added: flag('added') ?? today(),
    ...(flag('note') === undefined ? {} : { note: flag('note') }),
  };

  const check = await additionSchema();
  if (!check(candidate)) {
    console.error(`✗ ${word}: ${explain(check)}`);
    process.exit(1);
  }

  const additions = await readAdditions();
  const problems = problemsWith([...additions, candidate as Addition], await pinnedWords());
  if (problems.length > 0) {
    console.error(`✗ ${problems.join('\n  ')}`);
    process.exit(1);
  }

  await mkdir(VOCAB_DIR, { recursive: true });
  await appendFile(ADDITIONS_PATH, `${JSON.stringify(candidate)}\n`);

  console.log(`✓ ${word} proposed (${candidate.kind})`);
  console.log(`  ${candidate.gloss}`);
  console.log(`  ${candidate.trace}`);
  console.log(
    `\nIt is not in the dictionary yet. Rebuild and commit the artifacts:\n` +
      `  pnpm dict:fetch && pnpm dict:build && pnpm dict:shards\n` +
      `then open a pull request with "[dict]" in the commit message.`,
  );
}

await main();
