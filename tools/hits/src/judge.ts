/**
 * `pnpm hits:judge [--date=YYYY-MM-DD] [--via=file|api] [--batch=150]`
 *
 * The one step that needs a model. Two ways to get its answer:
 *
 * `--via=file` (the default) writes `judge-input-N.md`: the rubric followed by
 * the candidates. A Claude Code session, the daily routine, or a person
 * answers it into `judge-output.jsonl`, one line per candidate. No key, no
 * API; the session's own model does the judging and `ingest` records which.
 *
 * `--via=api` calls the Claude API with `claude-sonnet-5` when
 * `ANTHROPIC_API_KEY` is set, and adds a second column from Grok through the
 * xAI API when `XAI_API_KEY` is set. Both write the same output file with the
 * model named on every line.
 */
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { firstGlosses } from './glosses.ts';
import type { Prefiltered } from './prefilter.ts';
import { JUDGE_OUTPUT, SCREENED, flag, pickQueue, readJudgedRows } from './queue.ts';
import { applyScreen, screenInputFiles } from './screen.ts';
import { CANDIDATES_PATH, candidateSchema, readJsonl, today } from './schema.ts';

const here = dirname(fileURLToPath(import.meta.url));
export const RUBRIC_PATH = resolve(here, '../prompts/judge.md');

/** A judge's answer for one candidate under rubric v1, as older queues hold it. */
export type VerdictV1 = {
  id: string;
  aptness: number;
  grammar: number;
  memorability: number;
  rationale: string;
  /** Present when the API wrote the line; a session's answers get it at ingest. */
  model?: string;
  rubric_version?: string;
  /** The day the verdict was written, when the line says; otherwise its queue's date. */
  judged_at?: string;
};

/** A judge's answer for one candidate under rubric v2, as written to judge-output.jsonl. */
export type VerdictV2 = {
  id: string;
  relation: number;
  reads: number;
  tone?: string[];
  subjects?: string[];
  justification?: string;
  rationale: string;
  model?: string;
  rubric_version?: string;
  /** The day the verdict was written, when the line says; otherwise its queue's date. */
  judged_at?: string;
  /**
   * A word the judge believes the vocabulary is missing. A proposal for the
   * operator, not a change: nothing here reaches the dictionary. Its gloss
   * and trace are the model's own and are unverified.
   */
  request?: { word?: unknown; gloss?: unknown; trace?: unknown; why?: unknown };
  /**
   * One factual sentence saying what the input is, for an input the batch
   * showed without one. Unchecked here: ingest keeps it only when it follows
   * the rule and the input still has none, and a bad one never costs the
   * verdict its place.
   */
  about?: unknown;
  /**
   * The sense a word of the phrase reads in, keyed by the word, for a word
   * whose first gloss in the batch would not explain the reading or that has
   * none. Unchecked here: ingest refuses a verdict that names a word the
   * phrase does not contain, and leaves off a sense that breaks the rule.
   */
  senses?: unknown;
};

export type Verdict = VerdictV1 | VerdictV2;

export function isV2Verdict(verdict: Verdict): verdict is VerdictV2 {
  return 'relation' in verdict;
}

export async function rubric(): Promise<{ text: string; version: string }> {
  const text = await readFile(RUBRIC_PATH, 'utf8');
  const version = /rubric_version:\s*(v\d+)/.exec(text)?.[1];
  if (!version) throw new Error(`${RUBRIC_PATH} has no rubric_version header`);
  return { text, version };
}

/**
 * Split the queue into batches of at most `size` rows without splitting one
 * candidate's rows across two batches, so every batch is judged with the
 * whole set of a candidate's phrases in view.
 */
export function batches(rows: readonly Prefiltered[], size: number): Prefiltered[][] {
  const groups = new Map<string, Prefiltered[]>();
  for (const row of rows) {
    const group = groups.get(row.candidate_id) ?? [];
    group.push(row);
    groups.set(row.candidate_id, group);
  }
  const out: Prefiltered[][] = [];
  let current: Prefiltered[] = [];
  for (const group of groups.values()) {
    if (current.length > 0 && current.length + group.length > size) {
      out.push(current);
      current = [];
    }
    current.push(...group);
  }
  if (current.length > 0) out.push(current);
  return out;
}

/**
 * A batch as the judge reads it: the rubric, then each row. With `about`
 * (each input's sentence, by candidate id), an input's first row also says
 * what it is, or `(empty)`, so the judge knows where a sentence is wanted.
 * With `glosses` (each word's first dictionary gloss, or null), every row
 * lists its words with that gloss or `no definition`, so the judge can see
 * where the reading differs and a sense is wanted.
 */
export function renderBatch(
  rows: readonly Prefiltered[],
  rubricText: string,
  n: number,
  of: number,
  about?: ReadonlyMap<string, string>,
  glosses?: ReadonlyMap<string, string | null>,
): string {
  const seen = new Set<string>();
  const lines = rows.map((r) => {
    const first = !seen.has(r.candidate_id);
    seen.add(r.candidate_id);
    const said = about && first ? `\n  about: ${about.get(r.candidate_id) ?? '(empty)'}` : '';
    const words = glosses
      ? `\n  words:${[...new Set(r.words)].map((w) => `\n    ${w}: ${glosses.get(w) ?? 'no definition'}`).join('')}`
      : '';
    return `- id: ${r.id}\n  input: ${r.input}\n  category: ${r.category}${said}\n  anagram: ${r.display}${words}`;
  });
  return `${rubricText}\n\n## Batch ${n} of ${of}: ${rows.length} candidates\n\n${lines.join('\n')}\n`;
}

/** Parse judge output leniently on whitespace and strictly on shape. */
export function parseVerdicts(text: string): Verdict[] {
  const out: Verdict[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim().replace(/^```(?:json|jsonl)?$/, '').trim();
    if (line.length === 0 || line.startsWith('#')) continue;
    if (!line.startsWith('{')) continue;
    const value = JSON.parse(line) as Verdict;
    out.push(value);
  }
  return out;
}

// ------------------------------------------------------------------- api

type ApiJudge = { model: string; ask(prompt: string): Promise<string> };

function claude(): ApiJudge | null {
  const key = process.env['ANTHROPIC_API_KEY'];
  if (!key) return null;
  const model = process.env['ANTHROPIC_MODEL'] ?? 'claude-sonnet-5';
  return {
    model,
    async ask(prompt) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 8192,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!response.ok) throw new Error(`Claude API -> HTTP ${response.status}: ${await response.text()}`);
      const body = (await response.json()) as { content: { type: string; text?: string }[] };
      return body.content.filter((c) => c.type === 'text').map((c) => c.text ?? '').join('\n');
    },
  };
}

function grok(): ApiJudge | null {
  const key = process.env['XAI_API_KEY'];
  if (!key) return null;
  const model = process.env['XAI_MODEL'] ?? 'grok-4';
  return {
    model,
    async ask(prompt) {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
      });
      if (!response.ok) throw new Error(`xAI API -> HTTP ${response.status}: ${await response.text()}`);
      const body = (await response.json()) as { choices: { message: { content: string } }[] };
      return body.choices[0]?.message.content ?? '';
    },
  };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dir = await pickQueue(argv);
  const via = flag(argv, 'via') ?? 'file';
  const size = Number(flag(argv, 'batch') ?? 150);

  // A screened queue (settings s2) is judged on the phrases the screen kept,
  // rebuilt into screened.jsonl; an older queue on its prefiltered.jsonl.
  const screened = (await screenInputFiles(dir)).length > 0;
  const rows = screened ? await applyScreen(dir) : await readJudgedRows(dir);
  if (screened) console.log(`the screen kept ${rows.length} phrases -> ${resolve(dir, SCREENED)}`);
  // Nothing to judge: a thin night, or a screen that kept nothing. Not an
  // error. Leave an empty answer so ingest can close the queue out and the
  // routine moves on.
  if (rows.length === 0) {
    const out = resolve(dir, JUDGE_OUTPUT);
    if (!existsSync(out)) await writeFile(out, '');
    console.log(`nothing to judge in ${dir}; wrote an empty ${out}`);
    return;
  }

  const { text: rubricText, version } = await rubric();
  const split = batches(rows, size);
  const about = new Map(
    (await readJsonl(CANDIDATES_PATH, await candidateSchema())).flatMap((c) => (c.about ? [[c.id, c.about] as const] : [])),
  );
  // Each word's first gloss, read off the site's definition shards; no engine needed.
  const glosses = await firstGlosses(rows.flatMap((r) => r.words));

  if (via === 'file') {
    for (let i = 0; i < split.length; i++) {
      const path = resolve(dir, `judge-input-${i + 1}.md`);
      await writeFile(path, renderBatch(split[i]!, rubricText, i + 1, split.length, about, glosses));
      console.log(`wrote ${path} (${split[i]!.length} candidates)`);
    }
    console.log(
      `\nAnswer each file with one JSONL line per candidate into ${resolve(dir, JUDGE_OUTPUT)},\n` +
        `then run pnpm hits:ingest --model=<the model that judged> --judged-by=routine|hand. Rubric ${version}.`,
    );
    return;
  }

  if (via !== 'api') throw new Error(`--via must be file or api, not ${via}`);
  const judges = [claude(), grok()].filter((j): j is ApiJudge => j !== null);
  if (judges.length === 0) throw new Error('--via=api needs ANTHROPIC_API_KEY (and optionally XAI_API_KEY)');

  const lines: string[] = [];
  for (const judge of judges) {
    for (let i = 0; i < split.length; i++) {
      const prompt = renderBatch(split[i]!, rubricText, i + 1, split.length, about, glosses);
      console.log(`${judge.model}: batch ${i + 1} of ${split.length}…`);
      const answer = await judge.ask(prompt);
      for (const verdict of parseVerdicts(answer)) {
        lines.push(JSON.stringify({ ...verdict, model: judge.model, rubric_version: version, judged_at: today() }));
      }
    }
  }
  const out = resolve(dir, JUDGE_OUTPUT);
  await writeFile(out, lines.join('\n') + (lines.length ? '\n' : ''));
  console.log(`${lines.length} verdicts -> ${out}`);
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  await main();
}
