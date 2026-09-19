/**
 * `pnpm promotions:review --from=<private dir> [--any-date] [--limit=100]`
 *
 * Picks what the review reads (`select.ts`) from the newest private export in
 * `<private dir>/export/`, and writes it for a model to answer, into the
 * gitignored `.cache/promotions/`:
 *
 *   selection.jsonl       the export lines chosen, which `promotions:ingest` reads back
 *   review-input-N.md     the rubric, the review's own instructions, then the rows
 *
 * The session answers every file into `.cache/promotions/review-output.jsonl`.
 * It writes nothing in this repository's tracked files. It reviews nothing,
 * and says why in one line, when there is no export, when the newest export
 * is not today's (unless `--any-date`), or while an earlier review waits for
 * its merge in the private repository: one review at a time, so no anagram is
 * judged twice.
 *
 * It prints counts and codes only.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { normalizeLetters } from '@ars-magna/engine/fold';

import { firstGlosses } from '../glosses.ts';
import { rubric } from '../judge.ts';
import { flag } from '../queue.ts';
import { CANDIDATES_PATH, HITS_PATH, candidateSchema, hitSchema, readJsonl, today, type Candidate } from '../schema.ts';
import {
  LOCAL_DIR,
  REVIEW_PROMPT_PATH,
  datedFiles,
  failQuietly,
  promotionKey,
  readLines,
  readReviews,
  shortCode,
  validators,
  writeLines,
  type ExportLine,
} from './files.ts';
import { selectForReview } from './select.ts';

/** Rows per review file. */
export const REVIEW_BATCH = 50;

export async function reviewPrompt(): Promise<{ text: string; version: string }> {
  const text = await readFile(REVIEW_PROMPT_PATH, 'utf8');
  const version = /review_version:\s*(v\d+)/.exec(text)?.[1];
  if (!version) throw new Error(`${REVIEW_PROMPT_PATH} has no review_version header`);
  return { text, version };
}

/** What one row shows the model: its words, input and, for a submission, the reader's note. */
export type ReviewRowView = {
  id: string;
  kind: 'search' | 'submission';
  input: string;
  words: string[];
  promotions: number;
  category: string | null;
  about: string | null;
  note: { about: string | null; why: string | null; credit: string | null } | null;
  missing: string[];
};

/** The row a review shows for an export line: a submission's latest note, or a search's most common input and order. */
export function reviewView(line: ExportLine, candidates: readonly Candidate[]): ReviewRowView {
  const submission = line.submissions[0];
  const search = line.searches[0];
  const input = submission?.input ?? search?.input ?? '';
  const words = submission?.words ?? search?.words ?? line.key.slice(line.key.indexOf(':') + 1).split('-');
  const category = submission?.category ?? null;
  const letters = normalizeLetters(input);
  const candidate = category
    ? candidates.find((c) => c.id === `${letters}:${category}`)
    : candidates.find((c) => c.id.startsWith(`${letters}:`) && c.about);
  return {
    id: shortCode(line.key_sha256),
    kind: submission ? 'submission' : 'search',
    input,
    words,
    promotions: line.count,
    category,
    about: candidate?.about ?? null,
    note: submission && (submission.about || submission.why || submission.credit) ? { about: submission.about, why: submission.why, credit: submission.credit } : null,
    missing: line.check.ok ? [] : line.check.unknown,
  };
}

const oneLine = (text: string): string => text.replace(/\s+/g, ' ').trim();

/** One review file: the rubric, the review's instructions, then the rows. */
export function renderReview(
  rows: readonly ReviewRowView[],
  texts: { rubric: string; review: string },
  n: number,
  of: number,
  glosses: ReadonlyMap<string, string | null>,
): string {
  const body = rows.map((r) => {
    const lines = [
      `- id: ${r.id}`,
      `  kind: ${r.kind}`,
      `  input: ${oneLine(r.input)}`,
      `  promotions: ${r.promotions}`,
      `  category: ${r.category ?? '(choose one)'}`,
      `  about: ${r.about ?? '(empty)'}`,
      `  anagram: ${r.words.join(' ')}`,
      `  words:${[...new Set(r.words)].map((w) => `\n    ${w}: ${glosses.get(w) ?? 'no definition'}`).join('')}`,
    ];
    if (r.note) {
      lines.push(`  reader's note, unverified:`);
      if (r.note.about) lines.push(`    what the input is: ${oneLine(r.note.about)}`);
      if (r.note.why) lines.push(`    why it is good: ${oneLine(r.note.why)}`);
      if (r.note.credit) lines.push(`    credit: ${oneLine(r.note.credit)}`);
    }
    if (r.missing.length > 0) lines.push(`  words in no dictionary: ${r.missing.join(', ')}`);
    return lines.join('\n');
  });
  return `${texts.rubric.trimEnd()}\n\n${texts.review.trimEnd()}\n\n## Batch ${n} of ${of}: ${rows.length} rows\n\n${body.join('\n')}\n`;
}

/**
 * An earlier review whose branch is in the private repository but whose file
 * is not on its main: it has not been merged. Null when there is none; a
 * sentence when the branches cannot be seen, so nothing is reviewed blind.
 * A folder that is not a git checkout (a review on this Mac) has no branches.
 */
export function waitingReview(from: string): { waiting: string | null; problem: string | null } {
  if (!existsSync(resolve(from, '.git'))) return { waiting: null, problem: null };
  const git = (...args: string[]) => execFileSync('git', ['-C', from, ...args], { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
  try {
    git('fetch', '-q', 'origin', '+refs/heads/main:refs/remotes/origin/main', '+refs/heads/review/*:refs/remotes/origin/review/*');
  } catch {
    return { waiting: null, problem: 'the private repository could not be fetched, so an earlier review cannot be ruled out' };
  }
  const branches = git('for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin/review/').split('\n').filter(Boolean);
  for (const branch of branches) {
    const date = branch.slice('origin/review/'.length);
    try {
      git('cat-file', '-e', `origin/main:reviews/${date}.jsonl`);
    } catch {
      return { waiting: branch.slice('origin/'.length), problem: null };
    }
  }
  return { waiting: null, problem: null };
}

async function main(argv: readonly string[]): Promise<void> {
  const from = flag(argv, 'from');
  if (!from) throw new Error('say --from=<the private checkout>');
  const exports = await datedFiles(resolve(from, 'export'), 'jsonl');
  const newest = exports.at(-1);
  if (!newest) {
    console.log('promotions:review: there is no export to review; nothing to do.');
    return;
  }
  if (newest.date !== today() && !argv.includes('--any-date')) {
    console.log(`promotions:review: the newest export is ${newest.date}, not today's; the review waits for today's export.`);
    return;
  }
  const { waiting, problem } = waitingReview(from);
  if (problem) {
    console.log(`promotions:review: ${problem}; nothing reviewed.`);
    return;
  }
  if (waiting) {
    console.log(`promotions:review: the review on ${waiting} is waiting for its merge in the private repository; nothing reviewed.`);
    return;
  }

  const lines = await readLines<ExportLine>(newest.path, await validators.exportLine());
  const hits = await readJsonl(HITS_PATH, await hitSchema());
  const candidates = await readJsonl(CANDIDATES_PATH, await candidateSchema());
  const reviewed = (await readReviews(from)).flatMap((r) => r.lines);
  const limit = Number(flag(argv, 'limit') ?? 0);
  const { chosen, skipped } = selectForReview(lines, {
    hitKeys: new Set(hits.map((h) => promotionKey(h.words))),
    reviewed,
    ...(limit > 0 ? { limit } : {}),
  });

  await mkdir(LOCAL_DIR, { recursive: true });
  for (const name of await readdir(LOCAL_DIR)) {
    if (/^review-input-\d+\.md$|^review-output\.jsonl$|^selection\.jsonl$/.test(name)) await rm(resolve(LOCAL_DIR, name));
  }
  const left = `${skipped.hit} already hits, ${skipped.blocked} blocked, ${skipped.refused} refused by the check, ${skipped.decided} decided, ${skipped.over} past the limit`;
  if (chosen.length === 0) {
    console.log(`promotions:review ${newest.date}: nothing to review (${left}).`);
    return;
  }
  const views = chosen.map((line) => reviewView(line, candidates));
  if (new Set(views.map((v) => v.id)).size !== views.length) throw new Error('two anagrams share a short code; widen shortCode');
  await writeLines(resolve(LOCAL_DIR, 'selection.jsonl'), chosen, await validators.exportLine());
  const texts = { rubric: (await rubric()).text, review: (await reviewPrompt()).text };
  const glosses = await firstGlosses(views.flatMap((v) => v.words));
  const files = Math.ceil(views.length / REVIEW_BATCH);
  for (let i = 0; i < files; i++) {
    const rows = views.slice(i * REVIEW_BATCH, (i + 1) * REVIEW_BATCH);
    await writeFile(resolve(LOCAL_DIR, `review-input-${i + 1}.md`), renderReview(rows, texts, i + 1, files, glosses));
  }
  console.log(
    `promotions:review ${newest.date}: ${chosen.length} anagrams to review in ${files} ${files === 1 ? 'file' : 'files'} in .cache/promotions/ (${left}). ` +
      'Answer every file into .cache/promotions/review-output.jsonl, then run pnpm promotions:ingest.',
  );
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  const argv = process.argv.slice(2);
  await main(argv).catch(failQuietly('promotions:review', argv));
}
