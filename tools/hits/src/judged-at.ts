/**
 * `pnpm hits:judged-at --date=<queue> id…`
 *
 * Correct when named hits were judged. Every judgement on each hit takes the
 * day the queue's verdict for it carries, or else the queue's date: the rule
 * `hits:ingest` follows. `added` is left alone, since it is the day a hit
 * entered the file.
 *
 * A maintenance command for hits written before ingest followed that rule,
 * when it stamped `judged_at` with the day it ran: #47 replayed the queue
 * judged on 2026-09-15 after midnight UTC, and its nine hits read 2026-09-16.
 * Every id must be in data/hits.jsonl and have a verdict in that queue, or
 * nothing is written. The file is rewritten through the schema in its existing
 * order, so the diff is exactly the lines that changed.
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { judgedAt } from './ingest.ts';
import { parseVerdicts, type Verdict } from './judge.ts';
import { JUDGE_OUTPUT, flag, queueDate, queueDates, queueDir } from './queue.ts';
import { HITS_PATH, hitSchema, readJsonl, writeJsonl, type Hit } from './schema.ts';

export type Redated = { id: string; from: string[]; to: string[] };
export type RedateResult = { hits: Hit[]; changed: Redated[]; unchanged: string[] };

/** The queue folder and the ids from the command line. Throws on anything missing. */
export function parseJudgedAtArgs(argv: readonly string[]): { queue: string; ids: string[] } {
  const queue = flag(argv, 'date');
  if (queue === undefined) throw new Error('--date is required: the queue folder that judged these hits, such as 2026-09-15');
  const stray = argv.find((a) => a.startsWith('--') && !a.startsWith('--date='));
  if (stray) throw new Error(`unknown option ${stray}`);
  const ids = [...new Set(argv.filter((a) => !a.startsWith('--')))];
  if (ids.length === 0) throw new Error('name at least one hit id');
  return { queue, ids };
}

/**
 * Pure: the hits with each named hit's judgements dated from the queue. A
 * judgement takes the verdict that names its model, or else one that names
 * none, as the routine's lines do. Throws naming every id that is not a hit,
 * and every id the queue has no verdict for.
 */
export function redate(hits: readonly Hit[], ids: readonly string[], verdicts: readonly Verdict[], queueDay: string): RedateResult {
  const known = new Set(hits.map((h) => h.id));
  const missing = ids.filter((id) => !known.has(id));
  if (missing.length > 0) throw new Error(`no such hit: ${missing.join(', ')}`);
  const unjudged = ids.filter((id) => !verdicts.some((v) => v.id === id));
  if (unjudged.length > 0) throw new Error(`no verdict in this queue for: ${unjudged.join(', ')}`);

  const wanted = new Set(ids);
  const changed: Redated[] = [];
  const unchanged: string[] = [];
  const next = hits.map((h) => {
    if (!wanted.has(h.id)) return h;
    const mine = verdicts.filter((v) => v.id === h.id);
    const judge = h.judge.map((j) => {
      const verdict = mine.find((v) => v.model === j.model) ?? mine.find((v) => v.model === undefined) ?? mine[0]!;
      return { ...j, judged_at: judgedAt(verdict, queueDay) };
    });
    const from = h.judge.map((j) => j.judged_at);
    const to = judge.map((j) => j.judged_at);
    if (from.every((date, i) => date === to[i])) {
      unchanged.push(h.id);
      return h;
    }
    changed.push({ id: h.id, from, to });
    return { ...h, judge };
  });
  return { hits: next, changed, unchanged };
}

async function main(): Promise<void> {
  const { queue, ids } = parseJudgedAtArgs(process.argv.slice(2));
  if (!(await queueDates()).includes(queue)) throw new Error(`no queue folder data/queue/${queue}`);
  const dir = queueDir(queue);
  const verdicts = parseVerdicts(await readFile(resolve(dir, JUDGE_OUTPUT), 'utf8'));

  const validator = await hitSchema();
  const { hits, changed, unchanged } = redate(await readJsonl(HITS_PATH, validator), ids, verdicts, queueDate(dir));
  if (changed.length > 0) await writeJsonl(HITS_PATH, hits, validator);

  const width = Math.max(...ids.map((id) => id.length));
  const dates = (list: readonly string[]) => [...new Set(list)].join(', ');
  for (const c of changed) console.log(`${c.id.padEnd(width)}  judged_at ${dates(c.from)} -> ${dates(c.to)}`);
  for (const id of unchanged) console.log(`${id.padEnd(width)}  already dated from ${queue}`);
  console.log(
    changed.length > 0
      ? `${changed.length} changed · ${unchanged.length} already right · data/hits.jsonl rewritten`
      : `nothing changed · data/hits.jsonl left as it was`,
  );
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  try {
    await main();
  } catch (error) {
    console.error(`hits:judged-at: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
