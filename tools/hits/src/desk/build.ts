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
import { assess, bestJudgement, judgedShelf, scoresOf, shelfOf, type Shelf } from '../shelf.ts';

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
  /** The model whose verdict this row shows. */
  model: string;
  hit: DeskPlace | null;
};

/** How many of a queue's valid verdicts one model gave. */
export type DeskModel = { model: string; verdicts: number };

/** `model` is the one that gave the most verdicts; `models` lists every one, most verdicts first. */
export type DeskQueue = { name: string; model: string; models: DeskModel[]; judged: number; rows: DeskRow[] };

export type DeskHit = DeskPlace & {
  /** Where the judge's scores alone put it, whatever its status or shelf tag. */
  judged: 'interesting' | 'stretch';
  id: string;
  input: string;
  category: string;
  display: string;
  justification: string;
  /** What the input is, as the hit carries it; empty when it has none. */
  about: string;
  /** The input's English Wikipedia article; empty when it has none. */
  wikipedia: string;
  /** The words in reading order. */
  words: string[];
  /** The sense a word reads in, in this anagram, keyed by the word; empty when it has none. */
  senses: Record<string, string>;
  tags: string[];
  added: string;
  relation: number | null;
  reads: number | null;
};

export type DeskCandidate = {
  id: string;
  input: string;
  category: string;
  status: string;
  source: string;
  settings: string;
  rubric: string;
  about: string;
  wikipedia: string;
};

/** `desk` is the review desk; `audit` is one page for moving every anagram the site's Discoveries page shows between its sections. */
export type DeskMode = 'desk' | 'audit';

export type DeskData = {
  mode: DeskMode;
  generated: string;
  today: string;
  hits: DeskHit[];
  candidates: DeskCandidate[];
  queues: DeskQueue[];
  /** The hit schema's tag pattern, so the page checks a tag the way the schema will. */
  tagPattern: string;
  /** The hit schema's pattern for what an input is, for the same reason. */
  aboutPattern: string;
  /** The hit schema's rule for a sense: its pattern and its length in characters. */
  senseRule: SenseRule;
  /** The first dictionary gloss of every word of every hit, or null for a word with none: the hint beside each sense. */
  glosses: Record<string, string | null>;
  /** docs/prompts/apply-desk.md as it is on disk. */
  applyDesk: string;
  /** docs/prompts/deep-run.md as it is on disk. */
  deepRun: string;
  /** The deep preset's bound per input, the Deep run tab's default; null for none. */
  deepPerInput: number | null;
};

export type SenseRule = { pattern: string; max: number };

/** A judged queue as the desk reads it. */
export type QueueInput = { name: string; rows: Prefiltered[]; verdicts: Verdict[] };

const placeOf = (hit: Hit): DeskPlace => ({ status: hit.status, shelf: shelfOf(hit), alternate: hit.tags.includes('alternate') });

/**
 * The model ingest recorded for a queue's verdict lines that name none: the
 * most common model among judge entries, on hits, whose rationale is the
 * line's own. Undefined when no hit holds one of these verdicts.
 */
function recordedModel(verdicts: readonly Verdict[], byId: ReadonlyMap<string, Hit>): string | undefined {
  const counts = new Map<string, number>();
  for (const v of verdicts) {
    if (v.model) continue;
    const entry = byId.get(v.id)?.judge.find((j) => j.rationale.trim() === v.rationale.trim());
    if (entry) counts.set(entry.model, (counts.get(entry.model) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0];
}

/**
 * A queue's rows worth a decision: every row now in data/hits.jsonl, and
 * every near miss. Rows the judge found no link in (relation 1) are left
 * out. Inputs keep their order in the queue; within one, best first.
 */
export function deskQueue(queue: QueueInput, hits: readonly Hit[], date: string): DeskQueue {
  const byId = new Map(hits.map((h) => [h.id, h]));
  const rows = new Map(queue.rows.map((r) => [r.id, r]));
  const { ok } = validateVerdicts(queue.verdicts, rows);
  // Who judged comes from each verdict line's own `model`. A line that names
  // none (the routine's lines, and queues judged before lines carried it) takes
  // the model ingest recorded for it: the judge entry, on a hit this queue
  // produced, that holds this very verdict. Matching the rationale matters: a
  // phrase that was already a hit from an earlier queue carries that queue's
  // judge, which once labelled queues judged by Opus and Sonnet as Fable's.
  // With no such hit, the routine's model.
  const fallback = recordedModel(ok, byId) ?? 'claude-sonnet-5';
  const judgements = new Map<string, Judgement[]>();
  for (const v of ok) judgements.set(v.id, [...(judgements.get(v.id) ?? []), toJudgement(v, fallback, 'v2', date)]);

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
      model: best.model,
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
  const counts = new Map<string, number>();
  for (const v of ok) counts.set(v.model ?? fallback, (counts.get(v.model ?? fallback) ?? 0) + 1);
  const models = [...counts]
    .map(([name, verdicts]) => ({ model: name, verdicts }))
    .sort((a, b) => b.verdicts - a.verdicts || a.model.localeCompare(b.model));
  return { name: queue.name, model: models[0]?.model ?? fallback, models, judged: ok.length, rows: out };
}

export function deskData(input: {
  hits: readonly Hit[];
  candidates: readonly Candidate[];
  queues: readonly QueueInput[];
  generated: string;
  today: string;
  tagPattern: string;
  aboutPattern: string;
  senseRule: SenseRule;
  glosses: ReadonlyMap<string, string | null>;
  applyDesk: string;
  deepRun: string;
  deepPerInput: number | null;
  mode?: DeskMode;
}): DeskData {
  return {
    mode: input.mode ?? 'desk',
    generated: input.generated,
    today: input.today,
    hits: input.hits.map((h) => {
      const best = bestJudgement(h.judge);
      const scores = best ? scoresOf(best) : null;
      return {
        ...placeOf(h),
        judged: judgedShelf(h),
        id: h.id,
        input: h.input,
        category: h.category,
        display: h.display,
        justification: h.justification ?? '',
        about: h.about ?? '',
        wikipedia: h.wikipedia ?? '',
        words: [...h.words],
        senses: { ...h.senses },
        tags: [...h.tags],
        added: h.added,
        relation: scores?.relation ?? null,
        reads: scores?.reads ?? null,
      };
    }),
    candidates: input.candidates.map((c) => ({
      id: c.id,
      input: c.input,
      category: c.category,
      status: c.status,
      source: c.source,
      ...lastRun(c),
      about: c.about ?? '',
      wikipedia: c.wikipedia ?? '',
    })),
    queues: input.queues.map((q) => deskQueue(q, input.hits, input.today)),
    tagPattern: input.tagPattern,
    aboutPattern: input.aboutPattern,
    senseRule: input.senseRule,
    // Only the words the hits use, so a test can pass a wider map.
    glosses: Object.fromEntries(
      [...new Set(input.hits.flatMap((h) => h.words))].sort().map((word) => [word, input.glosses.get(word) ?? null]),
    ),
    applyDesk: input.applyDesk,
    deepRun: input.deepRun,
    deepPerInput: input.deepPerInput,
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

/**
 * The page as a claude.ai Artifact takes it. An Artifact wraps what it is
 * given in its own document, with its own charset and viewport, so the
 * doctype, the html, head and body tags, and those two meta tags come off.
 * The title, the style and the scripts stay, in order.
 */
export function artifactFragment(html: string): string {
  const fragment = html
    .replace(/^\s*<!doctype html>\s*/i, '')
    .replace(/<\/?(?:html|head|body)(?:\s[^>]*)?>\s*/gi, '')
    .replace(/<meta\s+(?:charset|name="viewport")[^>]*>\s*/gi, '');
  if (!/<title>[^<]+<\/title>/.test(fragment.slice(0, 8192))) throw new Error('the desk page needs its <title> near the top, where an Artifact reads it');
  return fragment;
}

/** The audit's own title and heading, in place of the review desk's. */
const AUDIT_TITLES: [string, string][] = [
  ['<title>Ars Magna Review Desk</title>', '<title>Ars Magna Greatest Hits Audit</title>'],
  ['<h1>Ars Magna review desk</h1>', '<h1>Greatest Hits audit</h1>'],
];

export function renderDesk(template: string, data: DeskData, composeSource: string): string {
  if (data.mode === 'audit') {
    for (const [from, to] of AUDIT_TITLES) {
      if (template.split(from).length !== 2) throw new Error(`the desk template needs exactly one ${from}`);
      template = template.replace(from, to);
    }
  }
  for (const marker of ['/*DESK_DATA*/', '/*DESK_COMPOSE*/']) {
    if (template.split(marker).length !== 2) throw new Error(`the desk template needs exactly one ${marker}`);
  }
  const json = embedJson(data);
  const code = inlineCompose(composeSource);
  return template.replace(/\/\*DESK_(DATA|COMPOSE)\*\//g, (_match, which: string) => (which === 'DATA' ? json : code));
}
