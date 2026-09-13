/**
 * The review desk's data and page. Pure: `pnpm hits:desk` reads the files;
 * this turns the records into what the page shows and renders the template.
 */
import { stripTypeScriptTypes } from 'node:module';

import { toJudgement, validateVerdicts } from '../ingest.ts';
import type { Verdict } from '../judge.ts';
import type { Prefiltered } from '../prefilter.ts';
import { isV2, type Candidate, type Hit, type HitStatus, type Judgement } from '../schema.ts';
import { lastRun } from '../settings.ts';
import { assess, bestJudgement, scoresOf, shelfOf, type Shelf } from '../shelf.ts';

/** Where a row of a queue stands in data/hits.jsonl; null for a near miss the file does not hold. */
export type DeskPlace = { status: HitStatus; shelf: Shelf; alternate: boolean };

export type DeskRow = {
  id: string;
  candidate_id: string;
  input: string;
  category: string;
  display: string;
  relation: number;
  reads: number;
  tone: string[];
  subjects: string[];
  justification: string;
  rationale: string;
  hit: DeskPlace | null;
};

export type DeskQueue = { name: string; model: string; judged: number; rows: DeskRow[] };

export type DeskHit = DeskPlace & {
  id: string;
  input: string;
  category: string;
  display: string;
  justification: string;
  tags: string[];
  added: string;
  relation: number | null;
  reads: number | null;
};

export type DeskCandidate = { id: string; input: string; category: string; status: string; source: string; settings: string; rubric: string };

export type DeskData = {
  generated: string;
  today: string;
  hits: DeskHit[];
  candidates: DeskCandidate[];
  queues: DeskQueue[];
  /** The hit schema's tag pattern, so the page checks a tag the way the schema will. */
  tagPattern: string;
  /** docs/prompts/apply-desk.md as it is on disk. */
  applyDesk: string;
};

/** A judged queue as the desk reads it. */
export type QueueInput = { name: string; rows: Prefiltered[]; verdicts: Verdict[] };

const placeOf = (hit: Hit): DeskPlace => ({ status: hit.status, shelf: shelfOf(hit), alternate: hit.tags.includes('alternate') });

/**
 * A queue's rows worth a decision: every row now in data/hits.jsonl, and
 * every near miss. Rows the judge found no link in (relation 1) are left
 * out. Inputs keep their order in the queue; within one, best first.
 */
export function deskQueue(queue: QueueInput, hits: readonly Hit[], date: string): DeskQueue {
  const byId = new Map(hits.map((h) => [h.id, h]));
  const rows = new Map(queue.rows.map((r) => [r.id, r]));
  const { ok } = validateVerdicts(queue.verdicts, rows);
  const judgements = new Map<string, Judgement[]>();
  for (const v of ok) judgements.set(v.id, [...(judgements.get(v.id) ?? []), toJudgement(v, 'unknown', 'v2', date)]);

  const order = new Map<string, number>();
  for (const r of queue.rows) if (!order.has(r.candidate_id)) order.set(r.candidate_id, order.size);

  const out: DeskRow[] = [];
  for (const [id, judge] of judgements) {
    const row = rows.get(id)!;
    const best = bestJudgement(judge)!;
    const scores = scoresOf(best);
    const hit = byId.get(id);
    if (!hit && assess(scores) === 'none') continue;
    const v2 = isV2(best) ? best : null;
    out.push({
      id,
      candidate_id: row.candidate_id,
      input: row.input,
      category: row.category,
      display: row.display,
      relation: scores.relation,
      reads: scores.reads,
      tone: v2 ? [...v2.tone] : [],
      subjects: v2 ? [...v2.subjects] : [],
      justification: hit?.justification ?? v2?.justification ?? '',
      rationale: best.rationale,
      hit: hit ? placeOf(hit) : null,
    });
  }
  out.sort(
    (a, b) =>
      (order.get(a.candidate_id) ?? 0) - (order.get(b.candidate_id) ?? 0) ||
      b.relation - a.relation ||
      b.reads - a.reads ||
      a.id.localeCompare(b.id),
  );
  // The model that judged, from a hit that came out of this queue; the
  // routine's model when none did.
  const model = queue.rows.map((r) => byId.get(r.id)?.judge[0]?.model).find((m): m is string => Boolean(m)) ?? 'claude-sonnet-5';
  return { name: queue.name, model, judged: ok.length, rows: out };
}

export function deskData(input: {
  hits: readonly Hit[];
  candidates: readonly Candidate[];
  queues: readonly QueueInput[];
  generated: string;
  today: string;
  tagPattern: string;
  applyDesk: string;
}): DeskData {
  return {
    generated: input.generated,
    today: input.today,
    hits: input.hits.map((h) => {
      const best = bestJudgement(h.judge);
      const scores = best ? scoresOf(best) : null;
      return {
        ...placeOf(h),
        id: h.id,
        input: h.input,
        category: h.category,
        display: h.display,
        justification: h.justification ?? '',
        tags: [...h.tags],
        added: h.added,
        relation: scores?.relation ?? null,
        reads: scores?.reads ?? null,
      };
    }),
    candidates: input.candidates.map((c) => ({ id: c.id, input: c.input, category: c.category, status: c.status, source: c.source, ...lastRun(c) })),
    queues: input.queues.map((q) => deskQueue(q, input.hits, input.today)),
    tagPattern: input.tagPattern,
    applyDesk: input.applyDesk,
  };
}

/** compose.ts as page script: types stripped, exports dropped. */
export function inlineCompose(source: string): string {
  if (/^\s*import\s/m.test(source)) throw new Error('desk/compose.ts must not import anything: it is inlined into the page');
  const code = stripTypeScriptTypes(source).replace(/^export /gm, '');
  if (code.toLowerCase().includes('</script')) throw new Error('desk/compose.ts must not contain a closing script tag');
  return code;
}

/** JSON that is safe inside a script element: no tag can close it early. */
export function embedJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function renderDesk(template: string, data: DeskData, composeSource: string): string {
  for (const marker of ['/*DESK_DATA*/', '/*DESK_COMPOSE*/']) {
    if (template.split(marker).length !== 2) throw new Error(`the desk template needs exactly one ${marker}`);
  }
  const json = embedJson(data);
  const code = inlineCompose(composeSource);
  return template.replace(/\/\*DESK_(DATA|COMPOSE)\*\//g, (_match, which: string) => (which === 'DATA' ? json : code));
}
