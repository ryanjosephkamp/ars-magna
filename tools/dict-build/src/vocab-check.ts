/**
 * The vocabulary tripwire.
 *
 *   pnpm vocab:check
 *
 * Runs in CI on every pull request, so it deliberately reads the committed
 * artifacts rather than the pinned sources: no 330 MB download, a second or two,
 * and it still catches a word that English OpenList already carries.
 *
 * It covers both lists, the additions and the forms, under their one cap. What
 * it cannot check is the part that matters most — whether a word belongs in
 * the vocabulary at all. That is the operator's judgement, made by merging.
 */
import { ADDITIONS_CAP, ADDITIONS_PATH, FORMS_PATH, pinnedWords, problemsWith, readAdditions, readForms } from './vocab.ts';

async function main(): Promise<void> {
  const additions = await readAdditions();
  const forms = await readForms();
  const pinned = await pinnedWords();

  console.log(`Ars Magna vocabulary check`);
  console.log(`  ${ADDITIONS_PATH}`);
  console.log(`  ${FORMS_PATH}`);
  console.log(
    `  ${additions.length} addition${additions.length === 1 ? '' : 's'} and ${forms.length} form${forms.length === 1 ? '' : 's'} of ${ADDITIONS_CAP} together`,
  );
  console.log(
    pinned
      ? `  ${pinned.size.toLocaleString()} pinned words to check against`
      : `  no committed dictionary to check against; the duplicate rule was skipped`,
  );

  const problems = problemsWith(additions, pinned, forms);
  if (problems.length > 0) {
    console.error(`\n✗ ${problems.length} problem${problems.length === 1 ? '' : 's'}:`);
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
  }

  for (const addition of additions) {
    console.log(`  ✓ ${addition.word.padEnd(20)} ${addition.kind.padEnd(18)} ${addition.trace}`);
  }
  for (const form of forms) {
    // Whether the letters are a word of the pin (the form adds a spelling) or
    // not (it adds a word), which is what decides how a row reads.
    const what = pinned === null ? form.kind : `${form.kind}, ${pinned.has(form.letters) ? 'a spelling' : 'a word'}`;
    console.log(`  ✓ ${form.form.padEnd(20)} ${what.padEnd(18)} ${form.trace}`);
  }
  console.log(`\n✓ the additions and the forms are admissible`);
}

await main();
