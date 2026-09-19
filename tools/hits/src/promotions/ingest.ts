/**
 * `pnpm promotions:ingest --from=<private dir> --model=NAME --judged-by=routine|hand [--date=YYYY-MM-DD]`
 *
 * Checks the review's answers, `.cache/promotions/review-output.jsonl`, against
 * what `promotions:review` chose, and writes the review into the private
 * checkout: `reviews/<date>.jsonl` and `reviews/<date>.md`, the same review in
 * plain words. The session then commits them on a branch `review/<date>` there
 * and opens a pull request in the private repository; merging it is the
 * operator's approval, and `promotions:apply` publishes it afterwards.
 *
 * It refuses the whole answer file, writing nothing, when an answer is missing,
 * repeated, outside the rubric or the review's own rules, or when
 * justifications repeat once the words they quote are masked (the F0 guard).
 * A refusal names codes and counts only. A private person's anagram is kept
 * as its code, its count and the outcome, and nothing else.
 */
import { existsSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { REPEAT_CAP, repeatedJustifications } from '../guards.ts';
import { isCategory } from '../ids.ts';
import { judgedByFlag, problemV2 } from '../ingest.ts';
import { parseVerdicts, rubric, type VerdictV2 } from '../judge.ts';
import { flag } from '../queue.ts';
import { readJudgeSenses } from '../sense.ts';
import { assess } from '../shelf.ts';
import { TONES, today, type JudgedBy } from '../schema.ts';
import { reviewPrompt, reviewView } from './review.ts';
import {
  LOCAL_DIR,
  failQuietly,
  readLines,
  shortCode,
  validators,
  writeLines,
  type ExportLine,
  type ReviewLine,
  type ReviewOutcome,
  type ReviewVerdict,
} from './files.ts';

/** An answer line as the model writes it: a rubric v2 verdict and the review's own fields. */
export type ReviewAnswer = VerdictV2 & {
  category?: unknown;
  private?: unknown;
  reader_about?: unknown;
  credit?: unknown;
  requests?: unknown;
};

const tones = TONES as readonly string[];

/** Why an answer breaks the review's own rules for its row, or null. The reasons are fixed words, never the row's text. */
export function answerProblem(answer: ReviewAnswer, line: ExportLine): string | null {
  const rubricProblem = problemV2(answer);
  if (rubricProblem) return rubricProblem;
  if (typeof answer.category !== 'string' || !isCategory(answer.category)) return 'no category, or not one of the six';
  if (typeof answer.private !== 'boolean') return 'private must be true or false';
  const note = line.submissions[0];
  const keepOrDrop = (v: unknown) => v === 'keep' || v === 'drop';
  if (note?.about ? !keepOrDrop(answer.reader_about) : answer.reader_about !== undefined) return 'reader_about is keep or drop, and only where the reader gave one';
  if (note?.credit ? !keepOrDrop(answer.credit) : answer.credit !== undefined) return 'credit is keep or drop, and only where the reader gave one';
  if (answer.requests !== undefined) {
    const unknown = line.check.ok ? [] : line.check.unknown;
    if (!Array.isArray(answer.requests) || answer.requests.some((w) => typeof w !== 'string' || !unknown.includes(w))) {
      return 'requests may name only the words in no dictionary';
    }
  }
  const view = reviewView(line, []);
  if (readJudgeSenses(answer.senses, view.words).foreign.length > 0) return 'senses name a word the anagram does not have';
  if (answer.tone?.some((t) => !tones.includes(t))) return 'unknown tone';
  return null;
}

/** The outcome a checked answer gives its row. */
export function outcomeOf(answer: ReviewAnswer, line: ExportLine): ReviewOutcome {
  if (answer.private === true) return 'private';
  if (!line.check.ok) return 'words-missing';
  const place = assess({ relation: answer.relation, reads: answer.reads });
  return place === 'interesting' || place === 'stretch' ? 'place' : place === 'near' ? 'near' : 'none';
}

/**
 * The review's lines for its rows, or the problems that refuse the answers.
 * Pure: the caller reads and writes the files.
 */
export function reviewLines(
  selection: readonly ExportLine[],
  answers: readonly ReviewAnswer[],
  context: { date: string; model: string; rubricVersion: string; reviewVersion: string; judgedBy: JudgedBy },
): { lines: ReviewLine[]; problems: string[] } {
  const byCode = new Map(selection.map((l) => [shortCode(l.key_sha256), l]));
  const problems: string[] = [];
  const seen = new Map<string, ReviewAnswer>();
  for (const answer of answers) {
    const id = typeof answer.id === 'string' ? answer.id : '';
    const line = byCode.get(id);
    if (!line) {
      problems.push(`an answer names ${/^[0-9a-f]{12}$/.test(id) ? id : 'an id'} that is not a row of this review`);
      continue;
    }
    if (seen.has(id)) {
      problems.push(`${id}: answered twice`);
      continue;
    }
    const problem = answerProblem(answer, line);
    if (problem) problems.push(`${id}: ${problem}`);
    seen.set(id, answer);
  }
  for (const id of byCode.keys()) if (!seen.has(id)) problems.push(`${id}: no answer`);
  for (const repeat of repeatedJustifications(answers)) {
    problems.push(`${repeat.count} justifications repeat once the words they quote are masked (more than ${REPEAT_CAP}): ${repeat.ids.join(', ')}`);
  }
  if (problems.length > 0) return { lines: [], problems };

  const lines: ReviewLine[] = selection.map((line) => {
    const answer = seen.get(shortCode(line.key_sha256))!;
    const outcome = outcomeOf(answer, line);
    const base = {
      key_sha256: line.key_sha256,
      decided: context.date,
      promotions: line.count,
      outcome,
      model: context.model,
      rubric_version: context.rubricVersion,
      review_version: context.reviewVersion,
      judged_by: context.judgedBy,
    };
    // A private person's anagram: its code, its count and the outcome, and nothing else.
    if (outcome === 'private') return base;
    const view = reviewView(line, []);
    const note = line.submissions[0];
    const verdict: ReviewVerdict = {
      relation: answer.relation,
      reads: answer.reads,
      tone: [...new Set(answer.tone ?? [])],
      subjects: [...new Set(answer.subjects ?? [])],
      category: answer.category as ReviewVerdict['category'],
      rationale: answer.rationale.trim(),
      ...(typeof answer.justification === 'string' && answer.justification.trim() ? { justification: answer.justification.trim() } : {}),
      ...(Object.keys(readJudgeSenses(answer.senses, view.words).senses).length > 0 ? { senses: readJudgeSenses(answer.senses, view.words).senses } : {}),
      ...(typeof answer.about === 'string' && answer.about.trim() ? { about: answer.about.trim() } : {}),
      ...(answer.reader_about === 'keep' || answer.reader_about === 'drop' ? { reader_about: answer.reader_about } : {}),
      ...(answer.credit === 'keep' || answer.credit === 'drop' ? { credit: answer.credit } : {}),
      ...(Array.isArray(answer.requests) && answer.requests.length > 0 ? { requests: [...new Set(answer.requests as string[])] } : {}),
    };
    return {
      ...base,
      key: line.key,
      row: {
        kind: view.kind,
        input: view.input,
        words: view.words,
        tier: line.check.narrowest,
        missing: view.missing,
        about_reader: note?.about ?? null,
        credit_reader: note?.credit ?? null,
      },
      verdict,
    };
  });
  return { lines, problems };
}

const cell = (text: string): string => text.replace(/\|/g, '/').replace(/\s+/g, ' ').trim();

/** The review in plain words, for the operator's merge in the private repository. */
export function renderPrivateReport(date: string, lines: readonly ReviewLine[], selection: readonly ExportLine[], context: { model: string; judgedBy: JudgedBy }): string {
  const byCode = new Map(selection.map((l) => [l.key_sha256, l]));
  const of = (o: ReviewOutcome) => lines.filter((l) => l.outcome === o);
  const note = (line: ReviewLine) => {
    const submission = byCode.get(line.key_sha256)?.submissions[0];
    if (!submission) return [];
    const v = line.verdict!;
    return [
      ...(submission.about ? [`  - What the input is (${v.reader_about === 'keep' ? 'kept: published if placed' : 'dropped'}): ${cell(submission.about)}`] : []),
      ...(submission.credit ? [`  - Credit (${v.credit === 'keep' ? 'kept: published if placed' : 'dropped'}): ${cell(submission.credit)}`] : []),
      ...(submission.why ? [`  - Why it is good (never published): ${cell(submission.why)}`] : []),
    ];
  };
  const entry = (line: ReviewLine, detail: string) => {
    const v = line.verdict!;
    const row = line.row!;
    return [
      `- \`${shortCode(line.key_sha256)}\` · ${line.promotions} ${line.promotions === 1 ? 'promotion' : 'promotions'} · ${row.kind} · relation ${v.relation}, reads ${v.reads} · ${v.category}`,
      `  ${cell(row.input)} → ${row.words.join(' ')}`,
      `  ${detail}`,
      ...note(line),
    ];
  };
  const section = (title: string, rows: readonly ReviewLine[], detail: (l: ReviewLine) => string, intro?: string) =>
    rows.length ? [`## ${title} (${rows.length})`, '', ...(intro ? [intro, ''] : []), ...rows.flatMap((l) => entry(l, detail(l))), ''] : [];
  return [
    `# Promotions review, ${date}`,
    '',
    `Judged by ${context.model} (${context.judgedBy}). ${lines.length} anagrams read. This file and the pull request are in the private repository only.`,
    '',
    'Merging this pull request approves the review. The next judge routine run, or `pnpm promotions:apply` in a session, then publishes what it places through the public pull request, where each anagram takes its shelf against the hits of that day.',
    '',
    ...section('To place', of('place'), (l) => `Justification: ${cell(l.verdict!.justification ?? '')}`),
    ...section('Near misses', of('near'), (l) => `Rationale: ${cell(l.verdict!.rationale)}`),
    ...section('No link', of('none'), (l) => `Rationale: ${cell(l.verdict!.rationale)}`),
    ...section(
      'Words in no dictionary',
      of('words-missing'),
      (l) => `Requests: ${l.verdict!.requests?.join(', ') || 'none'} · rationale: ${cell(l.verdict!.rationale)}`,
      'Not placed while a word is missing; read again once the words are added and the check passes.',
    ),
    ...(of('private').length
      ? [`## A private person (${of('private').length})`, '', 'Never added. Kept as a code, a count and this outcome only.', '', ...of('private').map((l) => `- \`${shortCode(l.key_sha256)}\``), '']
      : []),
  ].join('\n');
}

async function main(argv: readonly string[]): Promise<void> {
  const from = flag(argv, 'from');
  if (!from) throw new Error('say --from=<the private checkout>');
  const model = flag(argv, 'model');
  if (!model) throw new Error('say --model=<the model that reviewed>');
  const judgedBy = judgedByFlag(flag(argv, 'judged-by'));
  const date = flag(argv, 'date') ?? today();
  const out = resolve(from, 'reviews', `${date}.jsonl`);
  if (existsSync(out)) {
    console.error(`promotions:ingest: reviews/${date}.jsonl exists already in the private checkout; one review a day. Nothing written.`);
    process.exitCode = 1;
    return;
  }
  const selection = await readLines<ExportLine>(resolve(LOCAL_DIR, 'selection.jsonl'), await validators.exportLine());
  if (selection.length === 0) throw new Error('nothing was chosen; run pnpm promotions:review first');
  const { readFile } = await import('node:fs/promises');
  const answers = parseVerdicts(await readFile(resolve(LOCAL_DIR, 'review-output.jsonl'), 'utf8')) as ReviewAnswer[];
  const { lines, problems } = reviewLines(selection, answers, {
    date,
    model,
    rubricVersion: (await rubric()).version,
    reviewVersion: (await reviewPrompt()).version,
    judgedBy,
  });
  if (problems.length > 0) {
    console.error(`promotions:ingest: the answers are refused, and nothing was written. ${problems.length} problems:\n  ${problems.join('\n  ')}`);
    console.error('Answer those rows again, each for itself, and run it again.');
    process.exitCode = 1;
    return;
  }
  await writeLines(out, lines, await validators.reviewLine());
  await mkdir(resolve(from, 'reviews'), { recursive: true });
  await writeFile(resolve(from, 'reviews', `${date}.md`), renderPrivateReport(date, lines, selection, { model, judgedBy }));
  const count = (o: ReviewOutcome) => lines.filter((l) => l.outcome === o).length;
  console.log(
    `promotions:ingest ${date}: ${lines.length} reviewed: ${count('place')} to place, ${count('near')} near, ${count('none')} no link, ` +
      `${count('private')} private, ${count('words-missing')} with words in no dictionary. Wrote reviews/${date}.jsonl and reviews/${date}.md in the private checkout.`,
  );
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  const argv = process.argv.slice(2);
  await main(argv).catch(failQuietly('promotions:ingest', argv));
}
