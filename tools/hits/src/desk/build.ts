/**
 * The review desk's data and page. Pure: `pnpm hits:desk` reads the files;
 * this turns the records into what the page shows and renders the template.
 */
import { stripTypeScriptTypes } from 'node:module';

import { toJudgement, validateVerdicts } from '../ingest.ts';
import { promotionKey, type Decision as PublishedDecision, type ExportLine, type ReviewLine, type ReviewOutcome } from '../promotions/files.ts';
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
  /** The senses the best v2 judge proposed, keyed by word; empty when it proposed none. */
  judgeSenses: Record<string, string>;
  /** The display the best v2 judge proposed and the check let through; empty when it proposed none. */
  judgeDisplay: string;
  tags: string[];
  added: string;
  relation: number | null;
  reads: number | null;
  /** Its votes in the newest daily counts; 0 when it has none. */
  votes: number;
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

/** `desk` is the review desk; `audit` is one page for moving every anagram the site's Discover page shows between its sections. */
export type DeskMode = 'desk' | 'audit';

/** One reader's note on a Build submission, exactly as typed. The page shows it as text. */
export type DeskNote = {
  input: string;
  category: string | null;
  about: string | null;
  why: string | null;
  credit: string | null;
  /** The words the engine could not find, which the submission asks for. */
  missing: string[];
  created: string;
};

/** The review's decision on a promoted anagram, from the newest review file that holds it. */
export type DeskReview = {
  decided: string;
  outcome: ReviewOutcome;
  /** Its promotions when it was decided. */
  promotions: number;
  relation: number | null;
  reads: number | null;
  category: string | null;
  justification: string;
  rationale: string;
  /** Whether the review kept the reader's "What the input is" and credit; null where it said nothing. */
  readerAbout: 'keep' | 'drop' | null;
  credit: 'keep' | 'drop' | null;
  requests: string[];
  model: string;
  judgedBy: string;
};

/**
 * A promoted anagram as the Promoted tab shows it: one line of the private
 * export, with the review's decision and, once published through the routine,
 * the hit it became.
 */
export type DeskPromotion = {
  /** The SHA-256 of its key: the only name the public side ever uses. */
  code: string;
  key: string;
  /** The input and words most readers saw, or the latest submission's. */
  input: string;
  words: string[];
  count: number;
  first: string;
  last: string;
  /** Promotions from a search, and from Build. */
  fromSearch: number;
  typed: number;
  /** Each input it was searched as, with how many promoted it from there, most first. */
  searches: { input: string; n: number }[];
  notes: DeskNote[];
  /** Whether the engine finds every word, and the words it does not. */
  checked: boolean;
  unknown: string[];
  blocked: boolean;
  review: DeskReview | null;
  /** What the routine published, from data/promotions/decisions.jsonl. */
  applied: { outcome: string; hitId: string | null; date: string } | null;
  /** The hit it is in data/hits.jsonl now, if any. */
  hit: string | null;
};

/** Where the Promoted tab's rows came from: the private folder's name and its newest export's date. */
export type DeskPromoted = { from: string; export: string; reviews: number };

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
  /** The listed forms by spelling, each to the word its letters spell, so a display is checked as hits:display checks it. */
  forms: Record<string, string>;
  /** docs/prompts/apply-desk.md as it is on disk. */
  applyDesk: string;
  /** docs/prompts/deep-run.md as it is on disk. */
  deepRun: string;
  /** The deep preset's bound per input, the Deep run tab's default; null for none. */
  deepPerInput: number | null;
  /** The date of the daily counts the votes come from; null when there are none. */
  votesDate: string | null;
  /** Null when the desk was built without the private repository; then `promotions` is empty. */
  promoted: DeskPromoted | null;
  promotions: DeskPromotion[];
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
  for (const v of ok) judgements.set(v.id, [...(judgements.get(v.id) ?? []), toJudgement(v, fallback, 'v2', date, rows.get(v.id)!.words)]);

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

/** What the desk reads from the private side, and the public files that name its anagrams by code. */
export type PromotionsInput = {
  from: string;
  exportDate: string;
  lines: readonly ExportLine[];
  /** Every review line, from the oldest file to the newest. */
  reviews: readonly ReviewLine[];
  decisions: readonly PublishedDecision[];
  blocks: readonly string[];
};

const byName = (a: string, b: string): number => a.localeCompare(b, 'en', { sensitivity: 'base' }) || a.localeCompare(b, 'en');

/**
 * The Promoted tab's rows: every anagram in the newest export, most promoted
 * first, ties A to Z by input and then by anagram. Each carries what readers
 * typed, the newest review decision on it, what the routine published, and
 * the hit it is now: the one a published decision names, or else the first
 * added whose words make its key.
 */
export function deskPromotions(input: PromotionsInput, hits: readonly Hit[]): DeskPromotion[] {
  const review = new Map<string, ReviewLine>();
  for (const line of input.reviews) review.set(line.key_sha256, line);
  const applied = new Map<string, PublishedDecision>();
  for (const d of input.decisions) applied.set(d.key_sha256, d);
  const blocked = new Set(input.blocks);
  const hitIds = new Set(hits.map((h) => h.id));
  const byKey = new Map<string, Hit>();
  for (const h of [...hits].sort((a, b) => a.added.localeCompare(b.added) || a.id.localeCompare(b.id))) {
    const key = promotionKey(h.words);
    if (!byKey.has(key)) byKey.set(key, h);
  }
  const rows = input.lines.map((line): DeskPromotion => {
    const submission = line.submissions[0];
    const search = line.searches[0];
    const r = review.get(line.key_sha256);
    const v = r?.verdict;
    const a = applied.get(line.key_sha256);
    const named = a?.hit_id && hitIds.has(a.hit_id) ? a.hit_id : null;
    return {
      code: line.key_sha256,
      key: line.key,
      input: submission?.input ?? search?.input ?? '',
      words: [...(submission?.words ?? search?.words ?? line.key.slice(line.key.indexOf(':') + 1).split('-'))],
      count: line.count,
      first: line.first,
      last: line.last,
      fromSearch: line.via.result,
      typed: line.via.typed,
      searches: line.searches.map((x) => ({ input: x.input, n: x.n })),
      notes: line.submissions.map((x) => ({
        input: x.input,
        category: x.category,
        about: x.about,
        why: x.why,
        credit: x.credit,
        missing: [...x.missing],
        created: x.created,
      })),
      checked: line.check.ok,
      unknown: [...line.check.unknown],
      blocked: line.blocked || blocked.has(line.key_sha256),
      review: r
        ? {
            decided: r.decided,
            outcome: r.outcome,
            promotions: r.promotions,
            relation: v?.relation ?? null,
            reads: v?.reads ?? null,
            category: v?.category ?? null,
            justification: v?.justification ?? '',
            rationale: v?.rationale ?? '',
            readerAbout: v?.reader_about ?? null,
            credit: v?.credit ?? null,
            requests: [...(v?.requests ?? [])],
            model: r.model,
            judgedBy: r.judged_by,
          }
        : null,
      applied: a ? { outcome: a.outcome, hitId: a.hit_id ?? null, date: a.applied } : null,
      hit: named ?? byKey.get(line.key)?.id ?? null,
    };
  });
  return rows.sort(
    (a, b) => b.count - a.count || byName(a.input, b.input) || byName(a.words.join(' '), b.words.join(' ')) || a.code.localeCompare(b.code),
  );
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
  forms?: Readonly<Record<string, string>>;
  applyDesk: string;
  deepRun: string;
  deepPerInput: number | null;
  mode?: DeskMode;
  /** Votes by hit id from the newest daily counts, and their date. */
  votes?: ReadonlyMap<string, number>;
  votesDate?: string | null;
  /** The private side, for the Promoted tab; null or absent without it. */
  promotions?: PromotionsInput | null;
}): DeskData {
  const promotions = input.mode !== 'audit' && input.promotions ? input.promotions : null;
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
        judgeSenses: best && isV2(best) ? { ...best.senses } : {},
        judgeDisplay: best && isV2(best) ? (best.display ?? '') : '',
        tags: [...h.tags],
        added: h.added,
        relation: scores?.relation ?? null,
        reads: scores?.reads ?? null,
        votes: input.votes?.get(h.id) ?? 0,
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
    forms: { ...(input.forms ?? {}) },
    glosses: Object.fromEntries(
      [...new Set(input.hits.flatMap((h) => h.words))].sort().map((word) => [word, input.glosses.get(word) ?? null]),
    ),
    applyDesk: input.applyDesk,
    deepRun: input.deepRun,
    deepPerInput: input.deepPerInput,
    votesDate: input.votesDate ?? null,
    promoted: promotions ? { from: promotions.from, export: promotions.exportDate, reviews: new Set(promotions.reviews.map((r) => r.decided)).size } : null,
    promotions: promotions ? deskPromotions(promotions, input.hits) : [],
  };
}

/** compose.ts as page script: types stripped, exports dropped. */
export function inlineCompose(source: string): string {
  if (/^\s*import\s/m.test(source)) throw new Error('desk/compose.ts must not import anything: it is inlined into the page');
  const code = stripTypeScriptTypes(source).replace(/^export /gm, '');
  if (code.toLowerCase().includes('</script')) throw new Error('desk/compose.ts must not contain a closing script tag');
  return code;
}

/**
 * An engine module as the page inlines it, before compose: its relative
 * imports dropped, since the modules it imports are inlined ahead of it in
 * the same script, its types stripped and its exports made plain. Only
 * imports of a sibling file are allowed, so nothing from a package can be
 * missing from the page.
 */
export function inlineModule(source: string, name: string): string {
  const imports = source.match(/^import[^;]*;$/gm) ?? [];
  for (const line of imports) {
    if (!/from '\.\/[A-Za-z]+\.ts';$/.test(line)) throw new Error(`${name} imports something the page cannot inline: ${line}`);
  }
  const code = stripTypeScriptTypes(source.replace(/^import[^;]*;$/gm, '')).replace(/^export /gm, '');
  if (code.toLowerCase().includes('</script')) throw new Error(`${name} must not contain a closing script tag`);
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

export function renderDesk(template: string, data: DeskData, composeSource: string, engineSources: readonly { name: string; source: string }[] = []): string {
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
  const code = [...engineSources.map((m) => inlineModule(m.source, m.name)), inlineCompose(composeSource)].join('\n');
  return template.replace(/\/\*DESK_(DATA|COMPOSE)\*\//g, (_match, which: string) => (which === 'DATA' ? json : code));
}
