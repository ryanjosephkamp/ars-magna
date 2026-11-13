/**
 * The promotions review (roadmap F1): the export, the selection, the review's
 * answers, and the apply that publishes a merged review. Every reader field
 * of the fixtures carries a marker; no marker may reach anything this
 * repository publishes: the counts, the decisions, the hits and candidates of
 * an anagram left out, a refusal, or the public report.
 */
import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { REVIEW_LIMIT, shortCode, validators, type ExportLine, type ReviewLine } from '../src/promotions/files.ts';
import { exportLines, countFiles, type PromotionRow, type WordChecker } from '../src/promotions/export.ts';
import { selectForReview } from '../src/promotions/select.ts';
import { renderReview, reviewView } from '../src/promotions/review.ts';
import { renderPrivateReport, reviewLines, type ReviewAnswer } from '../src/promotions/ingest.ts';
import { applyReviews, renderPublicReport } from '../src/promotions/apply.ts';
import { blockCode } from '../src/promotions/block.ts';
import { DATA_DIR, candidateSchema, hitSchema, type Candidate, type Hit } from '../src/schema.ts';
import { keySha256, promotionKey } from '../../../apps/web/src/votes/core.ts';

const DICTIONARY = { repo: 'ryanjosephkamp/english-openlist', rev: 'a'.repeat(40) };
const MARK = 'ZQXMARKER';

/** A dictionary: every word known at Common, but for a few. */
const checker: WordChecker = {
  async has(word, tier) {
    if (word === 'zorbl' || word.includes('zqx')) return false;
    if (word === 'doomer') return tier === 'extended';
    return true;
  },
};

const row = (over: Partial<PromotionRow> & Pick<PromotionRow, 'key' | 'input' | 'words'>): PromotionRow => ({
  tier: 'standard',
  via: 'result',
  category: null,
  about: null,
  why: null,
  credit: null,
  missing: null,
  created_at: '2026-09-20T10:00:00.000Z',
  converted_to: null,
  ...over,
});

/** A search promotion, a submission with a full note, a private person's, one with an unknown word, and one crafted. */
function rows(): PromotionRow[] {
  const gentle = promotionKey(['entangle', 'am']);
  return [
    row({ key: gentle, input: 'A gentleman', words: 'entangle am' }),
    row({ key: gentle, input: 'A Gentleman', words: 'am entangle', created_at: '2026-09-21T09:00:00.000Z' }),
    row({ key: gentle, input: 'A gentleman', words: 'entangle am' }),
    row({
      key: promotionKey(['dirty', 'room']),
      input: 'Dormitory',
      words: 'dirty room',
      via: 'typed',
      category: 'phrases',
      about: `A dormitory is a shared bedroom ${MARK}about.`,
      why: `Because ${MARK}why`,
      credit: `Reader ${MARK}credit`,
    }),
    // Someone typed a private person's name; the anagram names them.
    row({ key: promotionKey(['jona', 'hoed']), input: 'Jane Hood', words: 'jona hoed', via: 'typed', category: 'people', why: `${MARK}why2`, credit: `${MARK}private` }),
    row({ key: promotionKey(['zorbl', 'act']), input: 'Clarbot z', words: 'zorbl act', via: 'typed', category: 'phrases', missing: 'zorbl' }),
    // A crafted request: a "search result" no page would send.
    row({ key: `aaeehifhijnost:${MARK.toLowerCase()}janedoeisathief`, input: `${MARK}Jane Doe is a thief`, words: `${MARK.toLowerCase()}janedoeisathief` }),
    // Already a vote, and a published anagram's.
    row({ key: gentle, input: 'A gentleman', words: 'entangle am', converted_to: 'agentleman:phrases:am-entangle' }),
    row({ key: promotionKey(['elegant', 'man']), input: 'A gentleman', words: 'elegant man' }),
  ];
}

const exported = () =>
  exportLines(rows(), { published: new Set([promotionKey(['elegant', 'man'])]), blocked: new Set(), checker, dictionary: DICTIONARY });

describe('the export', () => {
  it('groups promotions by anagram, most promoted first, with what readers typed and the engine’s check, and no voter', async () => {
    const lines = await exported();
    expect(lines.map((l) => [l.key, l.count, l.check.ok, l.check.reason])).toEqual([
      ['aaeeglmnnt:am-entangle', 3, true, null],
      ...lines.slice(1).map((l) => [l.key, l.count, l.check.ok, l.check.reason]),
    ]);
    const gentle = lines[0]!;
    expect(gentle).toMatchObject({ first: '2026-09-20', last: '2026-09-21', via: { result: 3, typed: 0 }, submissions: [] });
    expect(gentle.searches).toEqual([
      { input: 'A gentleman', words: ['entangle', 'am'], tier: 'standard', n: 2, at_tier: true },
      { input: 'A Gentleman', words: ['am', 'entangle'], tier: 'standard', n: 1, at_tier: true },
    ]);
    expect(gentle.key_sha256).toBe(await keySha256(gentle.key));
    const missing = lines.find((l) => l.key.includes('zorbl'))!;
    expect(missing.check).toMatchObject({ ok: false, reason: 'unknown-word', narrowest: null, unknown: ['zorbl'] });
    // Published and converted rows are votes now, and are not exported.
    expect(lines.some((l) => l.key === 'aaeeglmnnt:elegant-man')).toBe(false);
    expect(lines.reduce((n, l) => n + l.count, 0)).toBe(7);
    const valid = await validators.exportLine();
    for (const line of lines) expect(valid(line), JSON.stringify(valid.errors)).toBe(true);
    expect(JSON.stringify(lines)).not.toMatch(/voter/);
  });

  it('publishes counts by code only, for anagrams the engine finds, and says what it left out', async () => {
    const lines = await exportLines(rows(), {
      published: new Set([promotionKey(['elegant', 'man'])]),
      blocked: new Set([await keySha256(promotionKey(['dirty', 'room']))]),
      checker,
      dictionary: DICTIONARY,
    });
    const files = countFiles(lines, [{ hit_id: 'dormitory:phrases:dirty-room', count: 3 }, { hit_id: 'Not an id', count: 1 }], {
      date: '2026-09-21',
      takenAt: '2026-09-21T06:40:00.000Z',
      dictionary: DICTIONARY,
    });
    expect(files.promotions).toEqual(
      [
        { key_sha256: await keySha256('aaeeglmnnt:am-entangle'), count: 3 },
        { key_sha256: await keySha256(promotionKey(['jona', 'hoed'])), count: 1 },
      ].sort((a, b) => a.key_sha256.localeCompare(b.key_sha256)),
    );
    expect(files.votes).toEqual([{ hit_id: 'dormitory:phrases:dirty-room', count: 3 }]);
    expect(files.meta.promotions).toEqual({ anagrams: 5, listed: 2, total: 7, left_out: { unchecked: 2, blocked: 1 } });
    // A published hit's id is public already; a promotion is only ever a code.
    expect(JSON.stringify(files)).not.toContain(MARK);
    expect(JSON.stringify([files.promotions, files.meta])).not.toMatch(/gentle|entangle|dirty|zorbl|jona|hoed|thief/);
    for (const line of files.promotions) expect((await validators.promotionCount())(line)).toBe(true);
    for (const line of files.votes) expect((await validators.voteCount())(line)).toBe(true);
    expect((await validators.countsMeta())(files.meta)).toBe(true);
  });
});

const hitOf = (id: string, words: string[], status: Hit['status'] = 'accepted', tags: string[] = []): Hit => ({
  id,
  input: id.split(':')[0]!,
  category: id.split(':')[1] as Hit['category'],
  words,
  display: words.join(' '),
  letters: [...words.join('')].sort().join(''),
  prefilter_score: 0,
  judge: [],
  added: '2026-09-15',
  dictionary: DICTIONARY,
  tier: 'common',
  tags,
  status,
});

const decided = (line: ExportLine, outcome: ReviewLine['outcome'], promotions: number): ReviewLine => ({
  key_sha256: line.key_sha256,
  decided: '2026-09-19',
  promotions,
  outcome,
  model: 'claude-sonnet-5',
  rubric_version: 'v2',
  review_version: 'v1',
  judged_by: 'routine',
});

describe('what the review reads', () => {
  it('takes the undecided, most promoted first, and leaves out hits, blocked and crafted anagrams', async () => {
    const lines = await exported();
    const blocked = { ...lines[1]!, blocked: true };
    const all = [lines[0]!, blocked, ...lines.slice(2)];
    const { chosen, skipped } = selectForReview(all, { hitKeys: new Set(), reviewed: [] });
    expect(chosen.map((l) => l.count)).toEqual([3, 1, 1].slice(0, chosen.length));
    expect(chosen.some((l) => l.key.includes('thief'))).toBe(false);
    expect(chosen.some((l) => l.key.includes('zorbl'))).toBe(true);
    expect(skipped).toMatchObject({ blocked: 1, refused: 1 });
    // One that is a hit already, in any status, is not read.
    expect(selectForReview(all, { hitKeys: new Set([lines[0]!.key]), reviewed: [] }).skipped.hit).toBe(1);
    expect(REVIEW_LIMIT).toBe(100);
    expect(selectForReview(lines, { hitKeys: new Set(), reviewed: [], limit: 1 }).skipped.over).toBeGreaterThan(0);
  });

  it('reads a decided anagram again once its promotions double, and a word-missing one once its check passes', async () => {
    const lines = await exported();
    const gentle = lines[0]!;
    const missing = lines.find((l) => l.key.includes('zorbl'))!;
    const earlier = [decided(gentle, 'near', 2), decided(missing, 'words-missing', 1)];
    const again = (over: Partial<ExportLine>[]) =>
      selectForReview(
        over.map((o, i) => ({ ...[gentle, missing][i]!, ...o })),
        { hitKeys: new Set(), reviewed: earlier },
      ).chosen.map((l) => l.key);
    expect(again([{ count: 3 }, {}])).toEqual([]);
    expect(again([{ count: 4 }, {}])).toEqual([gentle.key]);
    // Promotions alone do not bring back an anagram with a word the site does not have.
    expect(again([{ count: 1 }, { count: 9 }])).toEqual([]);
    expect(again([{ count: 1 }, { check: { ...missing.check, ok: true, reason: null, narrowest: 'extended', unknown: [] } }])).toEqual([missing.key]);
  });

  it('shows a submission’s note as the reader’s, unverified, and asks for a category only for a search', async () => {
    const lines = await exported();
    const views = lines.map((l) => reviewView(l, []));
    const dorm = views.find((v) => v.input === 'Dormitory')!;
    expect(dorm).toMatchObject({ kind: 'submission', category: 'phrases', note: { credit: `Reader ${MARK}credit` } });
    const text = renderReview(views, { rubric: 'RUBRIC', review: 'REVIEW' }, 1, 1, new Map());
    expect(text).toContain("  reader's note, unverified:\n    what the input is: A dormitory");
    expect(text).toContain('  category: (choose one)');
    expect(text).toContain('  words in no dictionary: zorbl');
  });
});

/** Answers for every row of a selection, by input. */
function answersFor(selection: readonly ExportLine[], by: Record<string, Partial<ReviewAnswer>>): ReviewAnswer[] {
  return selection.map((line) => {
    const view = reviewView(line, []);
    const base: ReviewAnswer = {
      id: view.id,
      relation: 1,
      reads: 2,
      tone: [],
      subjects: [],
      rationale: `No link between the words and ${view.input}.`,
      category: view.category ?? 'phrases',
      private: false,
    };
    const note = line.submissions[0];
    if (note?.about) base.reader_about = 'drop';
    if (note?.credit) base.credit = 'drop';
    return { ...base, ...(by[view.input] ?? {}) };
  });
}

const CONTEXT = { date: '2026-09-21', model: 'claude-sonnet-5', rubricVersion: 'v2', reviewVersion: 'v1', judgedBy: 'routine' as const };

describe('the review’s answers', () => {
  it('refuses a missing, repeated or rule-breaking answer, and repeated justifications, naming codes only', async () => {
    const { chosen } = selectForReview(await exported(), { hitKeys: new Set(), reviewed: [] });
    const answers = answersFor(chosen, {
      'A gentleman': { relation: 4, reads: 3, justification: `"entangle" and "am" say ${MARK} nothing.`, category: 'celebrities' },
    });
    const { lines, problems } = reviewLines(chosen, [...answers.slice(1), answers[1]!, { ...answers[0]!, id: 'ffffffffffff' }], CONTEXT);
    expect(lines).toEqual([]);
    expect(problems.join('\n')).toMatch(/: answered twice/);
    expect(problems.join('\n')).toMatch(/an answer names ffffffffffff that is not a row/);
    expect(problems.join('\n')).toMatch(/: no answer/);
    const repeated = chosen.map((_, i) => ({ ...answersFor(chosen, {})[i]!, relation: 3, reads: 2, justification: `"x${i}" loosely evokes the ${MARK} subject.` }));
    const refusal = reviewLines(chosen, repeated, CONTEXT).problems.join('\n');
    expect(refusal).toMatch(/\d+ justifications repeat once the words they quote are masked \(more than 3\)/);
    // No refusal repeats what a reader or the model wrote.
    for (const text of [problems.join('\n'), refusal]) {
      expect(text).not.toContain(MARK);
      expect(text).not.toMatch(/gentle|entangle|dirty|Dormitory|Jane/);
    }
    const bad = reviewLines(chosen, answersFor(chosen, { Dormitory: { reader_about: 'maybe' as never } }), CONTEXT).problems;
    expect(bad.join('\n')).toMatch(/reader_about is keep or drop/);
    const requests = reviewLines(chosen, answersFor(chosen, { Dormitory: { requests: ['room'] } }), CONTEXT).problems;
    expect(requests.join('\n')).toMatch(/requests may name only the words in no dictionary/);
  });

  it('keeps a private person’s review as a code, a count and the outcome, and the rest in full, privately', async () => {
    const { chosen } = selectForReview(await exported(), { hitKeys: new Set(), reviewed: [] });
    const answers = answersFor(chosen, {
      'A gentleman': { relation: 4, reads: 3, category: 'phrases', justification: 'A gentleman is courteous, and an elegant man entangles no one.' },
      Dormitory: { relation: 5, reads: 3, justification: 'A dormitory is a room, and a shared one gets dirty.', reader_about: 'keep', credit: 'drop' },
      'Jane Hood': { private: true, relation: 3, reads: 2, justification: 'Anything at all.', category: 'people', credit: 'drop' },
      'Clarbot z': { requests: ['zorbl'], relation: 3, reads: 3, justification: 'A clarbot acts.' },
    });
    const { lines, problems } = reviewLines(chosen, answers, CONTEXT);
    expect(problems).toEqual([]);
    const byOutcome = Object.fromEntries(lines.map((l) => [l.outcome, l]));
    expect(Object.keys(byOutcome).sort()).toEqual(['place', 'private', 'words-missing']);
    const privateLine = byOutcome['private']!;
    expect(Object.keys(privateLine).sort()).toEqual(['decided', 'judged_by', 'key_sha256', 'model', 'outcome', 'promotions', 'review_version', 'rubric_version']);
    expect(JSON.stringify(privateLine)).not.toContain(MARK);
    const valid = await validators.reviewLine();
    for (const line of lines) expect(valid(line), JSON.stringify(valid.errors)).toBe(true);
    const report = renderPrivateReport(CONTEXT.date, lines, chosen, CONTEXT);
    expect(report).toContain('Why it is good (never published)');
    expect(report).not.toContain(`${MARK}private`);
    expect(report).toMatch(/## A private person \(1\)/);
  });

  it('keeps a display that passes the rule, leaves off one that does not with the answer kept, and shows it in the report', async () => {
    const { chosen } = selectForReview(await exported(), { hitKeys: new Set(), reviewed: [] });
    const answers = answersFor(chosen, {
      'A gentleman': { relation: 4, reads: 3, category: 'phrases', justification: 'A gentleman is courteous.', display: 'Entangle, am.' },
      Dormitory: { relation: 5, reads: 3, justification: 'A dormitory is a room.', reader_about: 'keep', credit: 'drop', display: "Dirty room's!" },
      'Jane Hood': { private: true, relation: 3, reads: 2, justification: 'Anything at all.', category: 'people', credit: 'drop' },
      'Clarbot z': { requests: ['zorbl'], relation: 3, reads: 3, justification: 'A clarbot acts.' },
    });
    const { lines, problems, displaysSkipped } = reviewLines(chosen, answers, { ...CONTEXT, forms: { "it's": 'its' } });
    expect(problems).toEqual([]);
    const gentle = lines.find((l) => l.row?.input === 'A gentleman')!;
    expect(gentle.verdict?.display).toBe('Entangle, am.');
    const dorm = lines.find((l) => l.row?.input === 'Dormitory')!;
    expect(dorm.verdict).not.toHaveProperty('display');
    expect(dorm.outcome).toBe('place');
    expect(displaysSkipped).toEqual([{ id: shortCode(dorm.key_sha256), reason: 'an exclamation mark is never shown' }]);
    const valid = await validators.reviewLine();
    for (const line of lines) expect(valid(line), JSON.stringify(valid.errors)).toBe(true);
    const report = renderPrivateReport(CONTEXT.date, lines, chosen, { ...CONTEXT, displaysSkipped });
    expect(report).toContain('A gentleman → entangle am · reads “Entangle, am.”');
    expect(report).toContain('## Displays left off');
    expect(report).toContain(`- \`${shortCode(dorm.key_sha256)}\`: an exclamation mark is never shown`);
  });
});

describe('applying a merged review', () => {
  async function reviewed() {
    const { chosen } = selectForReview(await exported(), { hitKeys: new Set(), reviewed: [] });
    const answers = answersFor(chosen, {
      'A gentleman': { relation: 4, reads: 3, category: 'phrases', justification: 'A gentleman is courteous, and an elegant man entangles no one.', tone: ['pun'], subjects: ['phrase'] },
      Dormitory: { relation: 5, reads: 3, justification: 'A dormitory is a room, and a shared one gets dirty.', reader_about: 'drop', credit: 'keep' },
      'Jane Hood': { private: true, category: 'people', credit: 'drop' },
      'Clarbot z': { requests: ['zorbl'] },
    });
    return reviewLines(chosen, answers, CONTEXT).lines;
  }
  const context = (known: Hit[] = [], candidates: Candidate[] = [], applied = new Set<string>()) => ({ known, candidates, applied, date: '2026-09-22', dictionary: DICTIONARY });

  it('writes the review’s display on the hit it places, and the words in order without one', async () => {
    const { chosen } = selectForReview(await exported(), { hitKeys: new Set(), reviewed: [] });
    const answers = answersFor(chosen, {
      'A gentleman': { relation: 4, reads: 3, category: 'phrases', justification: 'A gentleman is courteous.', display: 'Entangle, am.' },
      Dormitory: { relation: 5, reads: 3, justification: 'A dormitory is a room.', reader_about: 'drop', credit: 'drop' },
      'Jane Hood': { private: true, category: 'people', credit: 'drop' },
      'Clarbot z': { requests: ['zorbl'] },
    });
    const applied = applyReviews(reviewLines(chosen, answers, CONTEXT).lines, context());
    const gentle = applied.hits.find((h) => h.id === 'agentleman:phrases:am-entangle')!;
    expect(gentle.display).toBe('Entangle, am.');
    expect(gentle.words).toEqual(['entangle', 'am']);
    expect((gentle.judge[0] as { display?: string }).display).toBe('Entangle, am.');
    const dorm = applied.hits.find((h) => h.id === 'dormitory:phrases:dirty-room')!;
    expect(dorm.display).toBe(dorm.words.join(' '));
    expect(dorm.judge[0]).not.toHaveProperty('display');
  });

  it('places each on its shelf, makes a candidate only for an input with a hit, and publishes decisions with no text', async () => {
    const lines = await reviewed();
    const applied = applyReviews(lines, context());
    expect(applied.placed.map((p) => [p.hit.id, p.shelf, p.hit.status])).toEqual([
      ['agentleman:phrases:am-entangle', 'interesting', 'accepted'],
      ['dormitory:phrases:dirty-room', 'interesting', 'accepted'],
    ]);
    const gentle = applied.hits.find((h) => h.id === 'agentleman:phrases:am-entangle')!;
    expect(gentle.tags).toEqual(['tone:pun', 'subject:phrase', 'promoted']);
    expect(gentle.judge[0]).toMatchObject({ judged_by: 'routine', judged_at: '2026-09-21', relation: 4 });
    const dorm = applied.hits.find((h) => h.id === 'dormitory:phrases:dirty-room')!;
    expect(dorm.tags).toEqual(['greatest-candidate', 'submitted']);
    expect(dorm.submitter).toBe(`Reader ${MARK}credit`);
    expect(applied.candidates.map((c) => [c.id, c.source, c.about ?? null])).toEqual([
      ['agentleman:phrases', 'promotion', null],
      ['dormitory:phrases', 'submission', null],
    ]);
    expect(applied.decisions.map((d) => d.outcome).sort()).toEqual(['interesting', 'interesting', 'withheld', 'words-missing']);
    expect(applied.requests.map((r) => [r.word, r.source])).toEqual([['zorbl', 'submission']]);
    const hv = await hitSchema();
    const cv = await candidateSchema();
    const dv = await validators.decision();
    for (const hit of applied.hits) expect(hv(hit), JSON.stringify(hv.errors)).toBe(true);
    for (const c of applied.candidates) expect(cv(c), JSON.stringify(cv.errors)).toBe(true);
    for (const d of applied.decisions) expect(dv(d), JSON.stringify(dv.errors)).toBe(true);
    // No text from a reader or the model in the decisions; the kept credit is in the hit and the report, the rest nowhere.
    expect(JSON.stringify(applied.decisions)).not.toMatch(/justification|rationale|input|Jane|jona|zorbl|clarbot/i);
    expect(JSON.stringify(applied.decisions.filter((d) => !d.hit_id))).not.toMatch(/gentle|dormitory|dirty/i);
    const published = JSON.stringify([applied.hits, applied.candidates, applied.decisions, applied.requests]) + renderPublicReport('2026-09-22', applied, applied.requests);
    expect(published).not.toContain(`${MARK}about`);
    expect(published).not.toContain(`${MARK}why`);
    expect(published).not.toContain(`${MARK}private`);
    expect(published).not.toContain(`${MARK}why2`);
    expect(renderPublicReport('2026-09-22', applied, applied.requests)).toContain(`credit: Reader ${MARK}credit`);
  });

  it('keeps a reader’s about when the review kept it, and fills alternates and near misses past an input’s shelves', async () => {
    const lines = await reviewed();
    const keep = lines.map((l) => (l.row?.input === 'Dormitory' ? { ...l, verdict: { ...l.verdict!, reader_about: 'keep' as const } } : l));
    const withAbout = applyReviews(keep, context());
    expect(withAbout.candidates.find((c) => c.id === 'dormitory:phrases')!.about).toBe(`A dormitory is a shared bedroom ${MARK}about.`);
    expect(renderPublicReport('2026-09-22', withAbout, [])).toContain('what the input is: A dormitory');

    // Dormitory has three hits on its shelves and five alternates already.
    const known = [
      hitOf('dormitory:phrases:a-b', ['a', 'b']),
      hitOf('dormitory:phrases:c-d', ['c', 'd']),
      hitOf('dormitory:phrases:e-f', ['e', 'f'], 'featured'),
      ...['g', 'h', 'i', 'j'].map((w) => hitOf(`dormitory:phrases:${w}`, [w], 'proposed', ['alternate'])),
    ];
    const full = applyReviews(lines, context(known, [{ id: 'dormitory:phrases', input: 'Dormitory', category: 'phrases', source: 'manual', first_seen: '2026-09-11', status: 'enumerated' }]));
    expect(full.placed.find((p) => p.hit.input === 'Dormitory')).toMatchObject({ shelf: 'alternate', hit: { status: 'proposed', tags: ['greatest-candidate', 'alternate', 'submitted'] } });
    const fuller = applyReviews(lines, context([...known, hitOf('dormitory:phrases:k', ['k'], 'proposed', ['alternate'])]));
    expect(fuller.placed.some((p) => p.hit.input === 'Dormitory')).toBe(false);
    expect(fuller.decisions.find((d) => d.category === 'phrases' && d.relation === 5)!.outcome).toBe('near');
    expect(fuller.candidates.some((c) => c.id === 'dormitory:phrases')).toBe(false);
  });

  it('applies each review line once, and never places one that reads as word salad', async () => {
    const lines = await reviewed();
    const once = applyReviews(lines, context());
    const again = applyReviews(lines, context([], [], new Set(once.decisions.map((d) => `${d.key_sha256}|${d.decided}`))));
    expect(again).toMatchObject({ hits: [], decisions: [], requests: [] });
    const salad = lines.map((l) => (l.row?.input === 'A gentleman' ? { ...l, outcome: 'near' as const, verdict: { ...l.verdict!, reads: 1 } } : l));
    expect(applyReviews(salad, context()).placed.some((p) => p.hit.input === 'A gentleman')).toBe(false);
  });
});

describe('blocks', () => {
  it('names an anagram by its code, from its key or given as a code', async () => {
    const key = promotionKey(['entangle', 'am']);
    expect(await blockCode([key])).toBe(await keySha256(key));
    expect(await blockCode([`--code=${'b'.repeat(64)}`])).toBe('b'.repeat(64));
    await expect(blockCode(['Not A Key'])).rejects.toThrow(/name the key/);
    await expect(blockCode(['--code=xyz'])).rejects.toThrow(/--code must be/);
  });

  it('are valid on file, and so are the published decisions', async () => {
    for (const [file, validator] of [
      ['promotions/blocks.jsonl', await validators.block()],
      ['promotions/decisions.jsonl', await validators.decision()],
    ] as const) {
      const text = await readFile(resolve(DATA_DIR, file), 'utf8');
      for (const line of text.split('\n').filter((l) => l.trim())) expect(validator(JSON.parse(line)), file).toBe(true);
    }
  });
});
