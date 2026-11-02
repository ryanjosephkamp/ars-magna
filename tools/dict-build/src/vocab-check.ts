/**
 * The vocabulary tripwire.
 *
 *   pnpm vocab:check
 *
 * Runs in CI on every pull request, so it deliberately reads the committed
 * artifacts rather than the pinned sources: no 330 MB download, a second or two,
 * and it still catches a word that English OpenList already carries.
 *
 * It covers both lists, the additions and the forms, under their one cap; the
 * term class files under theirs (a term of the pool's characters, never a
 * word of the dictionary, never twice unless its line says so); the names
 * list under its floor; and the class files and that list against the
 * committed `classes` artifact, term for term and bit for bit, since a term
 * the artifact lacks is one the site cannot admit however well the line
 * reads. What it cannot check is the part that matters most — whether a word
 * or a term belongs in the vocabulary at all. That is the operator's
 * judgement, made by merging.
 */
import {
  ADDITIONS_CAP,
  ADDITIONS_PATH,
  FORMS_PATH,
  NAMES_PATH,
  TERMS_CAP,
  classArtifactProblems,
  classFilePath,
  committedClasses,
  committedDictionary,
  nameProblems,
  problemsWith,
  readAdditions,
  readClassFiles,
  readForms,
  readNames,
  termProblems,
} from './vocab.ts';
import { classTerms, readClassEntries } from './classes.ts';
import { NAME_FLOOR } from './tokens.ts';

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

  // The names list is in no tier and counts against no cap. It is held to its
  // own rules, so a hand edit or a build from moved sources that broke one
  // shows here rather than in a deep run; since N4 it is the names class too.
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
    `✓ ${names.length.toLocaleString()} names in the names list, the names class, in no tier, ${NAME_FLOOR} letters or more` +
      (names.length > 0 ? ` (${[...kinds].map(([k, n]) => `${n.toLocaleString()} ${k}`).join(', ')})` : ''),
  );

  // The term classes: every class file that exists, each line through its
  // schema, then the rules across the files together.
  const files = await readClassFiles();
  let total = 0;
  for (const [name, lines] of files) {
    total += lines.length;
    console.log(`  ${classFilePath(name)}`);
  }
  console.log(`  ${total} term${total === 1 ? '' : 's'} of ${TERMS_CAP} across ${files.size} class file${files.size === 1 ? '' : 's'}`);
  const termTrouble = termProblems(files, dictionary ? new Set(dictionary.words) : null, new Set(names.map((n) => n.name)));
  if (termTrouble.length > 0) {
    console.error(`\n✗ ${termTrouble.length} problem${termTrouble.length === 1 ? '' : 's'} in the class files:`);
    for (const problem of termTrouble) console.error(`  ${problem}`);
    process.exit(1);
  }
  for (const [name, lines] of files) {
    for (const line of lines) {
      const what = `${name}${line.tone ? ', crude' : ''}${line.also ? `, also ${line.also.join(' ')}` : ''}`;
      console.log(`  ✓ ${line.term.padEnd(8)} ${line.reads_as.padEnd(22)} ${what.padEnd(18)} ${line.trace}`);
    }
  }
  console.log(`✓ the class files are admissible`);

  // The artifact is what the site loads, and the build is what writes it. CI
  // rebuilds and compares the artifacts only on a `[dict]` commit, so without
  // this a term appended to a class file, or a names list rebuilt under a new
  // token rule, would pass every rule above, merge, and ship an artifact the
  // site searches without it.
  const artifact = await committedClasses();
  const artifactTrouble = classArtifactProblems(classTerms(await readClassEntries()), artifact);
  if (artifactTrouble.length > 0) {
    console.error(
      `\n✗ ${artifactTrouble.length} term${artifactTrouble.length === 1 ? '' : 's'} where the class files and the names list differ from the committed classes artifact:`,
    );
    for (const problem of artifactTrouble.slice(0, 20)) console.error(`  ${problem}`);
    if (artifactTrouble.length > 20) console.error(`  … and ${artifactTrouble.length - 20} more`);
    process.exit(1);
  }
  console.log(
    artifact === null
      ? `✓ no classes artifact, and no term in the class files or the names list to carry`
      : `✓ ${artifact.length.toLocaleString()} terms in the committed classes artifact, the class files and the names list term for term and bit for bit`,
  );
}

await main();
