/**
 * Propose a form for the vocabulary.
 *
 *   pnpm vocab:form "don't" --kind=contraction --gloss="Contraction of do not." --trace=https://…
 *
 * A form is a spelling with an apostrophe or hyphen whose letters are one
 * word: the letters are derived here, never typed, so `don't` is listed as the
 * word `dont`. Appends one line through the schema and every rule `vocab:check`
 * enforces. It does not admit the form: the dictionary changes when the
 * rebuilt artifacts are committed and the operator merges the pull request
 * that carries them. A possessive is never a form.
 */
import { appendFile, mkdir } from 'node:fs/promises';

import { normalize } from './normalize.ts';
import {
  FORMS_PATH,
  VOCAB_DIR,
  explain,
  formSchema,
  pinnedWords,
  problemsWith,
  readAdditions,
  readForms,
  type Form,
} from './vocab.ts';

function flag(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function main(): Promise<void> {
  const form = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
  if (!form) {
    console.error(
      'usage: pnpm vocab:form "<form>" --kind=contraction|hyphenated \\\n' +
        '         --gloss="One sentence." --trace=<url> [--pos=verb,pron] [--proposed-by=<who>] [--note=<text>]',
    );
    process.exit(1);
  }

  const pos = flag('pos');
  const candidate = {
    form,
    letters: normalize(form),
    kind: flag('kind'),
    gloss: flag('gloss'),
    trace: flag('trace'),
    proposed_by: flag('proposed-by') ?? 'ryanjosephkamp',
    added: flag('added') ?? today(),
    ...(pos === undefined ? {} : { pos: pos.split(',').map((p) => p.trim()).filter((p) => p.length > 0) }),
    ...(flag('note') === undefined ? {} : { note: flag('note') }),
  };

  const check = await formSchema();
  if (!check(candidate)) {
    console.error(`✗ ${form}: ${explain(check)}`);
    process.exit(1);
  }

  const pinned = await pinnedWords();
  const problems = problemsWith(await readAdditions(), pinned, [...(await readForms()), candidate as Form]);
  if (problems.length > 0) {
    console.error(`✗ ${problems.join('\n  ')}`);
    process.exit(1);
  }

  await mkdir(VOCAB_DIR, { recursive: true });
  await appendFile(FORMS_PATH, `${JSON.stringify(candidate)}\n`);

  console.log(`✓ ${form} proposed (${candidate.kind}), the word ${candidate.letters}`);
  console.log(`  ${candidate.gloss}`);
  console.log(`  ${candidate.trace}`);
  console.log(
    pinned?.has(candidate.letters)
      ? `  ${candidate.letters} is a word of English OpenList already: the form adds a spelling, and counts do not change.`
      : `  ${candidate.letters} is not in English OpenList: the form adds a word to every tier, and counts change where its letters fit.`,
  );
  console.log(
    `\nIt is not in the dictionary yet. Rebuild and commit the artifacts:\n` +
      `  pnpm dict:fetch && pnpm dict:build && pnpm dict:shards\n` +
      `then open a pull request with "[dict]" in the commit message.`,
  );
}

await main();
