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
import {
  ADDITIONS_CAP,
  ADDITIONS_PATH,
  FORMS_PATH,
  NAMES_PATH,
  committedDictionary,
  nameProblems,
  problemsWith,
  readAdditions,
  readForms,
  readNames,
} from './vocab.ts';

async function main(): Promise<void> {
  const additions = await readAdditions();
  const forms = await readForms();
  const dictionary = await committedDictionary();
  const pinned = dictionary?.pinned ?? null;

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

  // The names list is not vocabulary: no tier reads it, and it counts against
  // no cap. It is held to its own rules, so a hand edit or a build from moved
  // sources that broke one shows here rather than in a deep run.
  const names = await readNames();
  const nameTrouble = nameProblems(names, dictionary ? new Set(dictionary.words) : null);
  if (nameTrouble.length > 0) {
    console.error(`\n✗ ${NAMES_PATH}: ${nameTrouble.length} problem${nameTrouble.length === 1 ? '' : 's'}:`);
    for (const problem of nameTrouble.slice(0, 20)) console.error(`  ${problem}`);
    process.exit(1);
  }
  const kinds = new Map<string, number>();
  for (const name of names) kinds.set(name.kind, (kinds.get(name.kind) ?? 0) + 1);
  console.log(
    `✓ ${names.length.toLocaleString()} names in the names list, in no tier` +
      (names.length > 0 ? ` (${[...kinds].map(([k, n]) => `${n.toLocaleString()} ${k}`).join(', ')})` : ''),
  );
}

await main();
