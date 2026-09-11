/**
 * `pnpm hits:ingest [--date=YYYY-MM-DD] [--model=NAME] [--threshold=11]`
 *
 * Turn the judge's answers into proposed hits. Nothing is trusted: every
 * verdict must name a candidate from the batch, score inside the rubric,
 * carry a rationale, and describe a phrase that really is an anagram of its
 * input at its tier — re-checked here with the engine, because the judge
 * never sees letters and a copy-paste can garble a line.
 *
 * Hits land in data/hits.jsonl as `proposed`; a person promotes them. The
 * candidates that were judged move to `enumerated` so the next run skips them.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Engine } from './engine.ts';
import { checkAnagram } from './check.ts';
import { rubric, type Verdict } from './judge.ts';
import type { Prefiltered } from './prefilter.ts';
import { INGEST_REPORT, JUDGE_OUTPUT, PREFILTERED, flag, pickQueue } from './queue.ts';
import {
  CANDIDATES_PATH,
  HITS_PATH,
  appendJsonl,
  candidateSchema,
  dictionaryPin,
  hitSchema,
  readJsonl,
  today,
  writeJsonl,
  type Hit,
  type Judgement,
} from './schema.ts';

export const DEFAULT_THRESHOLD = 11;

export type Rejection = { id: string; reason: string };

/**
 * Validate verdicts against the batch they answer. Pure: the anagram check
 * happens separately because it needs the engine.
 */
export function validateVerdicts(
  verdicts: readonly Verdict[],
  batch: ReadonlyMap<string, Prefiltered>,
): { ok: Verdict[]; rejected: Rejection[] } {
  const ok: Verdict[] = [];
  const rejected: Rejection[] = [];
  const seen = new Set<string>();
  const inRange = (n: unknown) => Number.isInteger(n) && (n as number) >= 1 && (n as number) <= 5;
  for (const v of verdicts) {
    if (typeof v.id !== 'string' || !batch.has(v.id)) {
      rejected.push({ id: String(v.id), reason: 'not in this batch' });
      continue;
    }
    if (!inRange(v.aptness) || !inRange(v.grammar) || !inRange(v.memorability)) {
      rejected.push({ id: v.id, reason: 'score outside 1-5' });
      continue;
    }
    if (typeof v.rationale !== 'string' || v.rationale.trim().length === 0) {
      rejected.push({ id: v.id, reason: 'no rationale' });
      continue;
    }
    // Only a verdict that passed counts as seen, so a garbled line followed
    // by a good one does not cost the good one its place.
    const key = `${v.id}|${v.model ?? ''}`;
    if (seen.has(key)) {
      rejected.push({ id: v.id, reason: 'duplicate verdict' });
      continue;
    }
    seen.add(key);
    ok.push(v);
  }
  return { ok, rejected };
}

export function toJudgement(v: Verdict, model: string, version: string, date: string): Judgement {
  return {
    model: v.model ?? model,
    rubric_version: v.rubric_version ?? version,
    aptness: v.aptness,
    grammar: v.grammar,
    memorability: v.memorability,
    total: v.aptness + v.grammar + v.memorability,
    rationale: v.rationale.trim(),
    judged_at: date,
  };
}

/** Build the hits that clear the threshold, one per prefiltered row, with every judge's column. */
export function buildHits(
  batch: ReadonlyMap<string, Prefiltered>,
  verdicts: readonly Verdict[],
  options: { model: string; version: string; date: string; threshold: number; dictionary: { repo: string; rev: string } },
): Hit[] {
  const byId = new Map<string, Judgement[]>();
  for (const v of verdicts) {
    const list = byId.get(v.id) ?? [];
    list.push(toJudgement(v, options.model, options.version, options.date));
    byId.set(v.id, list);
  }
  const hits: Hit[] = [];
  for (const [id, judge] of byId) {
    const row = batch.get(id)!;
    // The primary judge decides; a second column is recorded, not averaged.
    const best = Math.max(...judge.map((j) => j.total));
    if (best < options.threshold) continue;
    hits.push({
      id,
      input: row.input,
      category: row.category,
      words: row.words,
      display: row.display,
      letters: row.letters,
      prefilter_score: row.prefilter_score,
      judge,
      added: options.date,
      dictionary: options.dictionary,
      tier: row.tier,
      tags: [],
      status: 'proposed',
    });
  }
  return hits.sort((a, b) => b.judge[0]!.total - a.judge[0]!.total || a.id.localeCompare(b.id));
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dir = await pickQueue(argv);
  const model = flag(argv, 'model') ?? 'claude-code-session';
  const threshold = Number(flag(argv, 'threshold') ?? DEFAULT_THRESHOLD);
  const date = today();

  const batch = new Map<string, Prefiltered>();
  for (const line of (await readFile(resolve(dir, PREFILTERED), 'utf8')).split('\n')) {
    if (line.trim()) {
      const row = JSON.parse(line) as Prefiltered;
      batch.set(row.id, row);
    }
  }
  const raw = await readFile(resolve(dir, JUDGE_OUTPUT), 'utf8');
  const { parseVerdicts } = await import('./judge.ts');
  const verdicts = parseVerdicts(raw);
  const { version } = await rubric();

  const { ok, rejected } = validateVerdicts(verdicts, batch);

  // Re-check every phrase with the engine before anything is written.
  const engine = await Engine.boot();
  const verified: Verdict[] = [];
  for (const v of ok) {
    const row = batch.get(v.id)!;
    const verdict = await checkAnagram(engine, row.input, row.words, row.tier);
    if (verdict.ok) verified.push(v);
    else rejected.push({ id: v.id, reason: `not an anagram: ${verdict.reason}` });
  }

  const hits = buildHits(batch, verified, { model, version, date, threshold, dictionary: await dictionaryPin() });
  const added = await appendJsonl(HITS_PATH, hits, await hitSchema());

  // Candidates that were judged are done for now.
  const judgedCandidates = new Set([...batch.values()].map((r) => r.candidate_id));
  const cv = await candidateSchema();
  const candidates = await readJsonl(CANDIDATES_PATH, cv);
  let moved = 0;
  for (const c of candidates) {
    if (judgedCandidates.has(c.id) && c.status === 'new') {
      c.status = 'enumerated';
      moved++;
    }
  }
  await writeJsonl(CANDIDATES_PATH, candidates, cv);

  const report = [
    `# Ingest ${date}`,
    '',
    `Queue: ${dir}`,
    `Verdicts: ${verdicts.length} read · ${verified.length} valid · ${rejected.length} rejected`,
    `Hits: ${hits.length} at or above ${threshold} of 15 · ${added.length} new in data/hits.jsonl`,
    `Candidates moved to enumerated: ${moved}`,
    '',
    '| total | input | anagram | rationale |',
    '|---|---|---|---|',
    ...added.map((h) => `| ${h.judge[0]!.total} | ${h.input} | ${h.display} | ${h.judge[0]!.rationale.replace(/\|/g, '/')} |`),
    '',
    ...(rejected.length ? ['## Rejected', '', ...rejected.map((r) => `- ${r.id}: ${r.reason}`), ''] : []),
  ].join('\n');
  await writeFile(resolve(dir, INGEST_REPORT), report);
  console.log(report);
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  await main();
}
