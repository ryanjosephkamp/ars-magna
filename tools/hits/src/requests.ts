/**
 * Words the pipeline proposes for the vocabulary, and the rules that keep
 * the list honest.
 *
 * A request is a proposal, never an admission. Nothing here adds a word: the
 * operator accepts one by name, and it joins the vocabulary when the pull
 * request that writes it into `data/vocabulary/additions.jsonl` is merged.
 *
 * Three things reach this file. A model judging a queue may propose a word it
 * believes the vocabulary is missing. A reader's submission may be refused
 * because a word is in no tier. A seeded anchor word may be one the engine
 * cannot find, which is as often a typo as a real word.
 *
 * The list also records what was refused. Without that, every night would
 * propose the same word again and the operator would decline it forever.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import Ajv2020, { type ValidateFunction } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

import { isV2Verdict, type Verdict } from './judge.ts';
import { DATA_DIR, SCHEMA_DIR, explain } from './schema.ts';

export const REQUESTS_PATH = resolve(DATA_DIR, 'vocabulary/requests.jsonl');

export type RequestSource = 'judge' | 'submission' | 'anchor';

export type WordRequest = {
  word: string;
  source: RequestSource;
  from: string;
  why: string;
  gloss?: string;
  trace?: string;
  seen: string;
  status: 'open' | 'declined';
};

let validator: ValidateFunction<WordRequest> | null = null;

export async function requestSchema(): Promise<ValidateFunction<WordRequest>> {
  if (!validator) {
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    addFormats(ajv);
    const schema = JSON.parse(await readFile(resolve(SCHEMA_DIR, 'request.schema.json'), 'utf8')) as object;
    validator = ajv.compile<WordRequest>(schema);
  }
  return validator;
}

/** Every request on file. A missing file means none have been made. */
export async function readRequests(path: string = REQUESTS_PATH): Promise<WordRequest[]> {
  let text: string;
  try {
    text = await readFile(path, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  const check = await requestSchema();
  const out: WordRequest[] = [];
  const lines = text.split('\n');
  for (const [i, line] of lines.entries()) {
    if (line.trim().length === 0) continue;
    let record: unknown;
    try {
      record = JSON.parse(line);
    } catch {
      throw new Error(`${path}:${i + 1}: not JSON`);
    }
    if (!check(record)) throw new Error(`${path}:${i + 1}: ${explain(check)}`);
    out.push(record);
  }
  return out;
}

export async function writeRequests(list: readonly WordRequest[], path: string = REQUESTS_PATH): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, list.map((r) => JSON.stringify(r)).join('\n') + (list.length ? '\n' : ''));
}

/**
 * The words a proposal must not repeat: everything already requested, at any
 * status, so a declined word is never proposed twice.
 */
export function requested(list: readonly WordRequest[]): Set<string> {
  return new Set(list.map((r) => r.word));
}

/**
 * Fold new proposals into the list, refusing the ones that should not be
 * there. Pure, so the rules can be read and tested on their own.
 *
 * A proposal is dropped when the word is not a plain lowercase word, when it
 * is already on the list at any status, when the vocabulary already has it
 * (`known` — the additions, and every word the dictionary carries at
 * Extended), or when an earlier proposal in the same batch already took it.
 * Each refusal is returned with its reason rather than passed over in
 * silence, so the ingest report can say what happened.
 */
export function mergeRequests(
  existing: readonly WordRequest[],
  proposed: readonly WordRequest[],
  known: ReadonlySet<string>,
): { next: WordRequest[]; added: WordRequest[]; refused: { word: string; reason: string }[] } {
  const seen = requested(existing);
  const added: WordRequest[] = [];
  const refused: { word: string; reason: string }[] = [];

  for (const request of proposed) {
    if (!/^[a-z]+$/.test(request.word)) {
      refused.push({ word: request.word, reason: 'not a plain lowercase word' });
      continue;
    }
    if (known.has(request.word)) {
      refused.push({ word: request.word, reason: 'already in the vocabulary' });
      continue;
    }
    if (seen.has(request.word)) {
      refused.push({ word: request.word, reason: 'already requested' });
      continue;
    }
    seen.add(request.word);
    added.push(request);
  }

  return { next: [...existing, ...added], added, refused };
}

/**
 * The word requests carried by a queue's verdicts.
 *
 * A malformed request is skipped, never fatal: a judgement is worth keeping
 * even when the model wrote nonsense in an optional field, and losing a whole
 * verdict over a proposal nobody asked for would be the wrong trade. What was
 * skipped is returned so the report can say so.
 */
export function fromVerdicts(
  verdicts: readonly Verdict[],
  queue: string,
  seen: string,
): { requests: WordRequest[]; skipped: { id: string; reason: string }[] } {
  const requests: WordRequest[] = [];
  const skipped: { id: string; reason: string }[] = [];

  for (const verdict of verdicts) {
    if (!isV2Verdict(verdict) || verdict.request === undefined) continue;
    const proposal = verdict.request;
    if (typeof proposal !== 'object' || proposal === null) {
      skipped.push({ id: verdict.id, reason: 'request is not an object' });
      continue;
    }
    const word = typeof proposal.word === 'string' ? proposal.word.trim().toLowerCase() : '';
    if (!/^[a-z]+$/.test(word)) {
      skipped.push({ id: verdict.id, reason: 'request has no plain lowercase word' });
      continue;
    }
    const text = (value: unknown): string | undefined => {
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    };
    const why = text(proposal.why);
    if (why === undefined) {
      skipped.push({ id: verdict.id, reason: `request for "${word}" says no why` });
      continue;
    }
    requests.push({
      word,
      source: 'judge',
      from: `${queue} · ${verdict.id}`,
      why: why.slice(0, 300),
      ...(text(proposal.gloss) ? { gloss: text(proposal.gloss)!.slice(0, 160) } : {}),
      ...(text(proposal.trace) ? { trace: text(proposal.trace)! } : {}),
      seen,
      status: 'open',
    });
  }
  return { requests, skipped };
}

/** The `vocab:add` an operator would run to accept a request. */
export function acceptCommand(request: WordRequest): string {
  const gloss = request.gloss ?? 'One sentence saying what it means.';
  const trace = request.trace ?? 'https://en.wiktionary.org/wiki/' + request.word;
  return `pnpm vocab:add ${request.word} --kind=slang --gloss=${JSON.stringify(gloss)} --trace=${trace}`;
}

/**
 * The requests section of an ingest report, or nothing when there is none.
 *
 * It says plainly that a trace a model proposed is unverified. A model can
 * write a Wiktionary URL that looks right and does not exist, and the gloss
 * and trace are exactly the parts an operator would otherwise take on trust.
 */
export function renderRequests(added: readonly WordRequest[], open: readonly WordRequest[]): string[] {
  if (added.length === 0 && open.length === 0) return [];
  const lines = ['## Word requests', ''];

  if (added.length) {
    lines.push(
      `${added.length} new. Nothing is added by merging this: a word joins the vocabulary only when you accept it by name.`,
      '',
      '| word | from | why | proposed gloss | proposed trace |',
      '|---|---|---|---|---|',
      ...added.map(
        (r) =>
          `| \`${r.word}\` | ${r.source} · ${r.from} | ${r.why} | ${r.gloss ?? '—'} | ${r.trace ?? '—'} |`,
      ),
      '',
      '**A gloss or trace a model proposed is unverified.** Check the source exists and says what it is',
      'claimed to say before accepting; a model can write a URL that looks right and is not there.',
      '',
      'To accept one:',
      '',
      '```bash',
      ...added.map((r) => acceptCommand(r)),
      '```',
      '',
      'Then rebuild the dictionary as "Add a word to the vocabulary" in `docs/OPERATOR.md` describes.',
      'To decline one, set its `status` to `declined` in `data/vocabulary/requests.jsonl`; it is then',
      'never proposed again.',
      '',
    );
  }

  const stillOpen = open.filter((r) => r.status === 'open' && !added.some((a) => a.word === r.word));
  if (stillOpen.length) {
    lines.push(`Still open from earlier queues: ${stillOpen.map((r) => `\`${r.word}\``).join(', ')}.`, '');
  }
  return lines;
}
