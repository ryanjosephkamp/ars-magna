/**
 * `pnpm hits:backfill [--draft=FILE] [--justifications=FILE] [--dry-run]`
 *
 * Place every committed verdict on the shelves, once, without judging
 * anything again. The queues before rubric v2 were judged against a bar of
 * 11 of 15, which dropped every loosely related anagram; their verdicts are
 * still on disk, and the shelf rule reads v1 scores (aptness as relation).
 *
 * - Every queue with answers is read. Each verdict is checked against its
 *   own queue, and a row seen in more than one queue keeps every judge.
 * - Hits already accepted, featured or retired stay exactly as they are and
 *   use their input's slots. A hit still `proposed` is placed again, so one
 *   held back by the old bar can be accepted.
 * - Every hit that ends up published needs a justification. `--draft=FILE`
 *   writes the ones still missing as JSONL for a session to fill, and
 *   `--justifications=FILE` reads the filled file; nothing is written while
 *   any are missing. The report is written next to that file.
 * - Every candidate gets a run for each judged queue it went through, under
 *   settings s1 and rubric v1, so `pnpm hits:requeue` can reopen it later.
 *
 * A second run with the same file changes nothing.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { hitFromRow, renderReport, takenCounts, toJudgement, validateVerdicts, type NearMiss, type Placed, type Rejection } from './ingest.ts';
import { parseVerdicts, type Verdict } from './judge.ts';
import type { Prefiltered } from './prefilter.ts';
import { JUDGE_OUTPUT, PREFILTERED, SUMMARY, flag, has, queueDates, queueDir } from './queue.ts';
import {
  CANDIDATES_PATH,
  HITS_PATH,
  candidateSchema,
  dictionaryPin,
  hitSchema,
  readJsonl,
  today,
  toJsonl,
  writeJsonl,
  type Candidate,
  type Hit,
  type Judgement,
} from './schema.ts';
import { LEGACY_RUN, addRun } from './settings.ts';
import { assess, bestJudgement, scoresOf, shelve, type Scores } from './shelf.ts';

const JUSTIFICATION_MAX = 300;

/** One committed queue folder, as the backfill needs it. */
export type QueueRecord = {
  name: string;
  rows: Prefiltered[];
  verdicts: Verdict[];
  /** Candidate ids the queue enumerated, from its summary. */
  ran: string[];
  /** Whether the queue has a judge-output.jsonl; only judged queues record runs. */
  judged: boolean;
};

/** A line of the draft: what a session needs to write one justification. */
export type DraftLine = {
  id: string;
  input: string;
  display: string;
  relation: number | null;
  reads: number | null;
  rationale: string;
  justification: string;
};

export type BackfillPlan = {
  hits: Hit[];
  candidates: Candidate[];
  shelved: Placed[];
  alternates: Placed[];
  near: NearMiss[];
  missing: DraftLine[];
  justified: string[];
  unknown: string[];
  runsAdded: number;
  read: number;
  valid: number;
  rejected: Rejection[];
};

/** Pure: everything the backfill would write, and what it still needs. */
export function planBackfill(input: {
  queues: readonly QueueRecord[];
  hits: readonly Hit[];
  candidates: readonly Candidate[];
  justifications: ReadonlyMap<string, string>;
  models: ReadonlyMap<string, string>;
  dictionary: { repo: string; rev: string };
  date: string;
}): BackfillPlan {
  const rows = new Map<string, Prefiltered>();
  const judges = new Map<string, Judgement[]>();
  const rejected: Rejection[] = [];
  let read = 0;
  let valid = 0;
  for (const q of input.queues) {
    const batch = new Map(q.rows.map((r) => [r.id, r]));
    for (const row of q.rows) if (!rows.has(row.id)) rows.set(row.id, row);
    const { ok, rejected: bad } = validateVerdicts(q.verdicts, batch);
    read += q.verdicts.length;
    valid += ok.length;
    rejected.push(...bad.map((b) => ({ id: b.id, reason: `${q.name}: ${b.reason}` })));
    const model = input.models.get(q.name) ?? 'claude-code-session';
    for (const v of ok) {
      const judgement = toJudgement(v, model, LEGACY_RUN.rubric, q.name.slice(0, 10));
      const list = judges.get(v.id) ?? [];
      if (!list.some((j) => JSON.stringify(j) === JSON.stringify(judgement))) list.push(judgement);
      judges.set(v.id, list);
    }
  }

  const next = input.hits.map((h) => structuredClone(h));
  const index = new Map(next.map((h) => [h.id, h]));
  const settled = new Set(next.filter((h) => h.status !== 'proposed').map((h) => h.id));
  const taken = takenCounts(next);

  type Entry = { row: Prefiltered; judge: Judgement[]; scores: Scores };
  const groups = new Map<string, Entry[]>();
  for (const [id, judge] of judges) {
    if (settled.has(id)) continue;
    const row = rows.get(id)!;
    const list = groups.get(row.candidate_id) ?? [];
    list.push({ row, judge, scores: scoresOf(bestJudgement(judge)!) });
    groups.set(row.candidate_id, list);
  }

  const added: Hit[] = [];
  const place = (e: Entry, status: 'accepted' | 'proposed', alternate: boolean): Hit => {
    const tags = [...(e.scores.relation === 5 ? ['greatest-candidate'] : []), ...(alternate ? ['alternate'] : [])];
    const existing = index.get(e.row.id);
    if (existing) {
      existing.status = status;
      for (const tag of tags) if (!existing.tags.includes(tag)) existing.tags.push(tag);
      return existing;
    }
    const hit = hitFromRow(e.row, e.judge, { date: input.date, dictionary: input.dictionary }, status, tags);
    added.push(hit);
    return hit;
  };

  const order = (a: Entry, b: Entry) =>
    b.scores.relation - a.scores.relation || b.scores.reads - a.scores.reads || a.row.id.localeCompare(b.row.id);
  const shelvedEntries: { entry: Entry; placement: 'interesting' | 'stretch' }[] = [];
  const alternateEntries: Entry[] = [];
  const near: NearMiss[] = [];
  for (const [candidate, entries] of groups) {
    const s = shelve(entries, (e) => e.scores, (e) => e.row.id, taken.get(candidate) ?? 0);
    for (const entry of s.accepted) shelvedEntries.push({ entry, placement: assess(entry.scores) as 'interesting' | 'stretch' });
    alternateEntries.push(...s.alternates);
    for (const e of s.near) {
      near.push({ id: e.row.id, input: e.row.input, display: e.row.display, ...e.scores, rationale: bestJudgement(e.judge)!.rationale });
    }
  }
  const rank = { interesting: 0, stretch: 1 };
  shelvedEntries.sort((a, b) => rank[a.placement] - rank[b.placement] || order(a.entry, b.entry));
  alternateEntries.sort(order);
  near.sort((a, b) => b.relation - a.relation || b.reads - a.reads || a.id.localeCompare(b.id));
  const shelved: Placed[] = shelvedEntries.map(({ entry, placement }) => ({ hit: place(entry, 'accepted', false), placement }));
  const alternates: Placed[] = alternateEntries.map((entry) => ({ hit: place(entry, 'proposed', true), placement: 'alternate' }));

  const hits = [...next, ...added];
  const known = new Set(hits.map((h) => h.id));
  const justified: string[] = [];
  for (const hit of hits) {
    const text = input.justifications.get(hit.id);
    if (text && !hit.justification) {
      hit.justification = text;
      justified.push(hit.id);
    }
  }
  const missing: DraftLine[] = hits
    .filter((h) => (h.status === 'accepted' || h.status === 'featured') && !h.justification)
    .map((h) => {
      const best = bestJudgement(h.judge);
      const scores = best ? scoresOf(best) : null;
      return {
        id: h.id,
        input: h.input,
        display: h.display,
        relation: scores?.relation ?? null,
        reads: scores?.reads ?? null,
        rationale: best?.rationale ?? '',
        justification: '',
      };
    });

  const candidates = input.candidates.map((c) => structuredClone(c));
  const byCandidate = new Map(candidates.map((c) => [c.id, c]));
  let runsAdded = 0;
  for (const q of input.queues) {
    if (!q.judged) continue;
    for (const id of q.ran) {
      const c = byCandidate.get(id);
      const run = { queue: q.name, ...LEGACY_RUN, date: q.name.slice(0, 10) };
      if (c && addRun(c, run)) runsAdded++;
    }
  }

  return {
    hits,
    candidates,
    shelved,
    alternates,
    near,
    missing,
    justified,
    unknown: [...input.justifications.keys()].filter((id) => !known.has(id)),
    runsAdded,
    read,
    valid,
    rejected,
  };
}

async function readQueues(): Promise<QueueRecord[]> {
  const out: QueueRecord[] = [];
  for (const name of await queueDates()) {
    const dir = queueDir(name);
    const read = async (file: string): Promise<string | null> => {
      try {
        return await readFile(resolve(dir, file), 'utf8');
      } catch {
        return null;
      }
    };
    const summary = await read(SUMMARY);
    const answers = await read(JUDGE_OUTPUT);
    out.push({
      name,
      rows: (await read(PREFILTERED) ?? '').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l) as Prefiltered),
      verdicts: parseVerdicts(answers ?? ''),
      ran: summary ? (JSON.parse(summary) as { candidates: { id: string }[] }).candidates.map((c) => c.id) : [],
      judged: answers !== null,
    });
  }
  return out;
}

/** The model that judged each queue, taken from a hit already in the file that came from it. */
export function queueModels(queues: readonly QueueRecord[], hits: readonly Hit[]): Map<string, string> {
  const byId = new Map(hits.map((h) => [h.id, h]));
  const models = new Map<string, string>();
  for (const q of queues) {
    const model = q.rows.map((r) => byId.get(r.id)?.judge[0]?.model).find((m) => m);
    if (model) models.set(q.name, model);
  }
  return models;
}

async function readJustifications(path: string): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const lines = (await readFile(path, 'utf8')).split('\n');
  lines.forEach((line, i) => {
    if (!line.trim()) return;
    const value = JSON.parse(line) as { id?: unknown; justification?: unknown };
    if (typeof value.id !== 'string') throw new Error(`${path}:${i + 1}: no id`);
    const text = typeof value.justification === 'string' ? value.justification.trim() : '';
    if (text.length > JUSTIFICATION_MAX) throw new Error(`${path}:${i + 1}: justification over ${JUSTIFICATION_MAX} characters`);
    if (text) out.set(value.id, text);
  });
  return out;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  // `pnpm hits:backfill` runs from tools/hits; a relative path means the directory pnpm was run in.
  const here = process.env['INIT_CWD'] ?? process.cwd();
  const at = (path: string | undefined) => (path === undefined ? undefined : resolve(here, path));
  const draft = at(flag(argv, 'draft'));
  const file = at(flag(argv, 'justifications'));
  const dryRun = has(argv, 'dry-run');

  const hv = await hitSchema();
  const cv = await candidateSchema();
  const hits = await readJsonl(HITS_PATH, hv);
  const queues = await readQueues();
  const plan = planBackfill({
    queues,
    hits,
    candidates: await readJsonl(CANDIDATES_PATH, cv),
    justifications: file ? await readJustifications(file) : new Map(),
    models: queueModels(queues, hits),
    dictionary: await dictionaryPin(),
    date: today(),
  });
  if (plan.unknown.length > 0) throw new Error(`justifications for ids that are not hits: ${plan.unknown.join(', ')}`);

  const interesting = plan.shelved.filter((p) => p.placement === 'interesting').length;
  console.log(`${plan.read} verdicts read from ${queues.filter((q) => q.judged).length} judged queues · ${plan.valid} valid · ${plan.rejected.length} rejected`);
  console.log(`shelved ${plan.shelved.length} (${interesting} Interesting, ${plan.shelved.length - interesting} A stretch) · ${plan.alternates.length} alternates · ${plan.near.length} near misses`);
  console.log(`justifications applied ${plan.justified.length} · still missing ${plan.missing.length} · runs recorded ${plan.runsAdded}`);

  if (draft) {
    await mkdir(dirname(draft), { recursive: true });
    await writeFile(draft, toJsonl(plan.missing));
    console.log(`draft of ${plan.missing.length} lines -> ${draft}; fill each justification, then run --justifications=${draft}`);
    return;
  }
  if (dryRun) {
    console.log('dry run: nothing written');
    return;
  }
  if (plan.missing.length > 0) {
    throw new Error(`${plan.missing.length} published hits still need a justification; write a draft with --draft=FILE, fill it, and pass it with --justifications=FILE`);
  }
  if (!file) throw new Error('pass the filled draft with --justifications=FILE');

  await writeJsonl(HITS_PATH, plan.hits, hv);
  await writeJsonl(CANDIDATES_PATH, plan.candidates, cv);
  const placed = [...plan.shelved, ...plan.alternates];
  const report = renderReport({
    date: today(),
    dir: 'every judged queue under data/queue/',
    empty: false,
    read: plan.read,
    valid: plan.valid,
    rejected: plan.rejected,
    rubric: 'v2',
    placed,
    addedIds: new Set(placed.map((p) => p.hit.id)),
    near: plan.near,
    moved: 0,
    threshold: 11,
    heading: `Backfill ${today()}`,
    ledger: `Runs recorded on candidates: ${plan.runsAdded} · justifications applied: ${plan.justified.length}`,
  });
  const out = resolve(dirname(file), 'report.md');
  await writeFile(out, report);
  console.log(`wrote data/hits.jsonl, data/candidates.jsonl and ${out}`);
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  try {
    await main();
  } catch (error) {
    console.error(`hits:backfill: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
