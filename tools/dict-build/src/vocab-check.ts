/**
 * The vocabulary tripwire.
 *
 *   pnpm vocab:check
 *
 * Runs in CI on every pull request, so it deliberately reads the committed
 * artifacts rather than the pinned sources: no 330 MB download, a second or two,
 * and it still catches a word that English OpenList already carries.
 *
 * What it cannot check is the part that matters most — whether a word belongs in
 * the vocabulary at all. That is the operator's judgement, made by merging.
 */
import { ADDITIONS_CAP, ADDITIONS_PATH, pinnedWords, problemsWith, readAdditions } from './vocab.ts';

async function main(): Promise<void> {
  const additions = await readAdditions();
  const pinned = await pinnedWords();

  console.log(`Ars Magna vocabulary check`);
  console.log(`  ${ADDITIONS_PATH}`);
  console.log(`  ${additions.length} addition${additions.length === 1 ? '' : 's'} of ${ADDITIONS_CAP}`);
  console.log(
    pinned
      ? `  ${pinned.size.toLocaleString()} pinned words to check against`
      : `  no committed dictionary to check against; the duplicate rule was skipped`,
  );

  const problems = problemsWith(additions, pinned);
  if (problems.length > 0) {
    console.error(`\n✗ ${problems.length} problem${problems.length === 1 ? '' : 's'}:`);
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
  }

  for (const addition of additions) {
    console.log(`  ✓ ${addition.word.padEnd(20)} ${addition.kind.padEnd(18)} ${addition.trace}`);
  }
  console.log(`\n✓ the additions are admissible`);
}

await main();
