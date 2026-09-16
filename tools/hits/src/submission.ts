/**
 * Submissions through the GitHub issue form.
 *
 * `node src/submission.ts check` reads the issue body from `ISSUE_BODY`,
 * parses the form, runs `anagram check`, and prints the verdict as Markdown
 * for the workflow to post; its exit code is the verdict. `parseIssueForm`
 * is the pure part, and `ingest --from-issue N` uses it too.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { normalizeLetters } from '@ars-magna/engine/fold';
import type { Tier } from '@ars-magna/engine/protocol';

import { isCategory, type Category } from './ids.ts';
import { REPO_ROOT } from './schema.ts';

export type Submission = {
  input: string;
  category: Category;
  words: string[];
  tier: 'common' | 'standard' | 'full' | 'extended';
  why: string;
  credit: string;
};

/**
 * GitHub renders an issue form as `### Label` headings each followed by the
 * answer, with `_No response_` for a blank optional field.
 */
export function parseIssueForm(body: string): Submission | { error: string } {
  const fields = new Map<string, string>();
  const sections = body.split(/^###\s+/m).slice(1);
  for (const section of sections) {
    const newline = section.indexOf('\n');
    const label = (newline === -1 ? section : section.slice(0, newline)).trim().toLowerCase();
    const value = (newline === -1 ? '' : section.slice(newline + 1)).trim();
    fields.set(label, value === '_No response_' ? '' : value);
  }
  const input = fields.get('input') ?? '';
  const category = (fields.get('category') ?? '').toLowerCase();
  const anagram = fields.get('anagram') ?? '';
  const tierRaw = (fields.get('dictionary tier') ?? 'standard').toLowerCase();
  if (!input) return { error: 'the Input field is empty' };
  if (!isCategory(category)) return { error: `unknown category "${category}"` };
  if (!anagram) return { error: 'the Anagram field is empty' };
  // Standard is the default and the fallback, so a tier this build does not
  // know is checked against the default dictionary rather than refused.
  const tier =
    tierRaw === 'common' || tierRaw === 'full' || tierRaw === 'extended' ? tierRaw : 'standard';
  const words = anagram.split(/\s+/).map(normalizeLetters).filter((w) => w.length > 0);
  if (words.length === 0) return { error: 'the Anagram field has no letters' };
  return { input, category, words, tier, why: fields.get('why it is good') ?? '', credit: fields.get('credit') ?? '' };
}

const BINARY = resolve(REPO_ROOT, 'target/release/anagram');

/** Run `anagram check`; the CLI prints "ok" or "no: …". */
export function checkWithCli(submission: Submission): { ok: boolean; message: string } {
  if (!existsSync(BINARY)) throw new Error(`no CLI at ${BINARY}; run cargo build --release -p anagram-cli`);
  const run = spawnSync(BINARY, ['check', submission.input, submission.words.join(' '), `--tier=${submission.tier}`], { encoding: 'utf8' });
  return { ok: run.status === 0, message: (run.stdout || run.stderr).trim() };
}

/** The word a refusal names, when it named one. */
export function missingWord(message: string): string | null {
  return /"([a-z]+)" is not in the \w+ dictionary/.exec(message)?.[1] ?? null;
}

/**
 * Why a submission was refused, in the terms its author needs.
 *
 * The three cases have different remedies and used to share one sentence.
 * The letters differing is the author's mistake. A word missing from the tier
 * they chose but present in a wider one is a dropdown away. A word in no tier
 * at all is not their mistake at all: the vocabulary does not have it, and
 * the remedy is to propose it.
 */
export function refusal(
  submission: Submission,
  message: string,
  check: (s: Submission) => { ok: boolean; message: string } = checkWithCli,
): { kind: 'letters' | 'tier' | 'vocabulary'; word?: string; wider?: Tier } {
  const word = missingWord(message);
  if (word === null) return { kind: 'letters' };

  const wider: Tier[] = ['standard', 'full', 'extended'];
  for (const tier of wider) {
    if (tier === submission.tier) continue;
    const at = check({ ...submission, tier });
    if (at.ok) return { kind: 'tier', word, wider: tier };
    // Once a wider tier fails on a different word, the first word is no
    // longer the whole story; keep reporting the one we were asked about.
    if (missingWord(at.message) !== word) break;
  }
  return { kind: 'vocabulary', word };
}

async function main(): Promise<void> {
  const body = process.env['ISSUE_BODY'] ?? '';
  const parsed = parseIssueForm(body);
  if ('error' in parsed) {
    console.log(`Could not read the form: ${parsed.error}. Edit the issue and the check will run again.`);
    process.exit(2);
  }
  const verdict = checkWithCli(parsed);
  if (verdict.ok) {
    console.log(
      `**Checks out.** *${parsed.words.join(' ')}* uses exactly the letters of *${parsed.input}*, and every word is in the ${parsed.tier} dictionary. A maintainer will decide whether it joins the Greatest Hits.`,
    );
    process.exit(0);
  }
  const why = refusal(parsed, verdict.message);
  const said = verdict.message.replace(/^no: /, '');
  if (why.kind === 'tier') {
    console.log(
      `**Not yet.** ${said}, but it is in the ${why.wider} dictionary. ` +
        `Edit the issue and set **Dictionary tier** to ${why.wider}; the check will run again.`,
    );
  } else if (why.kind === 'vocabulary') {
    console.log(
      `**Not yet.** *${why.word}* is not in the site's vocabulary at any tier, so this is not something to fix in the issue. ` +
        `The vocabulary is English OpenList at a pinned revision plus a short, public list of the site's own additions, and *${why.word}* is in neither. ` +
        `A maintainer will decide whether to add it; if they do, the check will pass here.`,
    );
  } else {
    console.log(`**Not yet.** ${said}. Edit the issue to fix it and the check will run again.`);
  }
  // 3 marks a word the vocabulary does not have, so the workflow can label
  // it for the operator. 1 stays "the author can fix this".
  process.exit(why.kind === 'vocabulary' ? 3 : 1);
}

if (process.argv[1] && import.meta.filename === process.argv[1] && process.argv[2] === 'check') {
  await main();
}
