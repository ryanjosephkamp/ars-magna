/**
 * The review desk's Promoted tab and its Most votes order (roadmap F2). The
 * tab reads the private side only from where the promotions review keeps it,
 * shows what readers typed as text, and turns a block into a command that
 * carries the anagram's code alone.
 */
import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Script } from 'node:vm';

import { composeCommands, type Decision } from '../src/desk/compose.ts';
import { deskData, deskPromotions, renderDesk, type PromotionsInput } from '../src/desk/build.ts';
import { APPLY_DESK_PROMPT, COMPOSE_SOURCE, DESK_TEMPLATE, aboutPattern, newestVotes, readPromotions, senseRule } from '../src/desk.ts';
import { exportLines, type PromotionRow, type WordChecker } from '../src/promotions/export.ts';
import { validators, writeLines, type ExportLine, type ReviewLine } from '../src/promotions/files.ts';
import { tagPattern } from '../src/tag.ts';
import type { Hit } from '../src/schema.ts';
import { promotionKey } from '../../../apps/web/src/votes/core.ts';

const DICTIONARY = { repo: 'ryanjosephkamp/english-openlist', rev: 'a'.repeat(40) };
const checker: WordChecker = { has: async (word) => word !== 'zorbl' };

/** Markup a reader could type into every field of a note. */
const MARKUP = {
  about: 'A dormitory is <b>shared</b>. <img src=x onerror="alert(1)">',
  why: '</script><script>alert("why")</script>',
  credit: '<a href="https://example.com">Reader & co</a>',
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

async function lines(): Promise<ExportLine[]> {
  const gentle = promotionKey(['entangle', 'am']);
  const dirty = promotionKey(['dirty', 'room']);
  return exportLines(
    [
      row({ key: gentle, input: 'A gentleman', words: 'entangle am' }),
      row({ key: gentle, input: 'A Gentleman', words: 'am entangle' }),
      row({ key: dirty, input: 'Dormitory', words: 'dirty room', via: 'typed', category: 'phrases', ...MARKUP }),
      row({ key: dirty, input: 'dormitory', words: 'dirty room' }),
      // One promotion each: a tie, which goes A to Z by input.
      row({ key: promotionKey(['zorbl', 'act']), input: 'Clarbot z', words: 'zorbl act', via: 'typed', category: 'phrases', missing: 'zorbl' }),
      row({ key: promotionKey(['listen']), input: 'Silent', words: 'listen' }),
    ],
    { published: new Set(), blocked: new Set(), checker, dictionary: DICTIONARY },
  );
}

const hit = (over: Partial<Hit> & Pick<Hit, 'id' | 'input' | 'words'>): Hit => ({
  category: 'phrases',
  display: over.words.join(' '),
  letters: '',
  prefilter_score: 0,
  judge: [],
  submitter: 'routine',
  added: '2026-09-21',
  dictionary: DICTIONARY,
  tier: 'common',
  tags: ['promoted'],
  status: 'accepted',
  ...over,
});

function review(line: ExportLine, over: Partial<ReviewLine>): ReviewLine {
  const shown = line.submissions[0] ?? line.searches[0]!;
  return {
    key: line.key,
    row: {
      kind: line.submissions.length > 0 ? 'submission' : 'search',
      input: shown.input,
      words: [...shown.words],
      tier: shown.tier,
      missing: [],
      about_reader: line.submissions[0]?.about ?? null,
      credit_reader: line.submissions[0]?.credit ?? null,
    },
    key_sha256: line.key_sha256,
    decided: '2026-09-21',
    promotions: line.count,
    outcome: 'near',
    model: 'claude-sonnet-5',
    rubric_version: 'v2',
    review_version: 'v1',
    judged_by: 'routine',
    ...over,
  };
}

async function input(): Promise<PromotionsInput> {
  const all = await lines();
  const [gentle, dirty] = [all.find((l) => l.key.endsWith('am-entangle'))!, all.find((l) => l.key.endsWith('dirty-room'))!];
  const listen = all.find((l) => l.key.endsWith(':listen'))!;
  const verdict = {
    relation: 4,
    reads: 3,
    tone: [],
    subjects: [],
    category: 'phrases' as const,
    justification: 'A dormitory is a room, and students leave it dirty.',
    rationale: 'Names the room.',
    reader_about: 'keep' as const,
    credit: 'drop' as const,
    requests: [],
  };
  // Verdicts that say nothing about a justification, or about the reader's note, leave those keys out.
  const { justification: _justification, ...unjustified } = verdict;
  const { reader_about: _about, credit: _credit, ...silent } = unjustified;
  return {
    from: 'ars-magna-promotions',
    exportDate: '2026-09-21',
    lines: all,
    reviews: [
      // An older decision, then a newer one after its promotions doubled: the newer is shown.
      review(dirty, { decided: '2026-09-10', promotions: 1, outcome: 'none', verdict: { ...unjustified, relation: 1, reads: 2 } }),
      review(dirty, { outcome: 'place', verdict }),
      review(gentle, { outcome: 'near', verdict: { ...silent, relation: 2, reads: 2 } }),
    ],
    decisions: [
      {
        key_sha256: dirty.key_sha256,
        decided: '2026-09-21',
        promotions: 2,
        outcome: 'interesting',
        relation: 4,
        reads: 3,
        category: 'phrases',
        hit_id: 'dormitory:phrases:dirty-room',
        model: 'claude-sonnet-5',
        rubric_version: 'v2',
        review_version: 'v1',
        judged_by: 'routine',
        applied: '2026-09-22',
      },
    ],
    blocks: [listen.key_sha256],
  };
}

const HITS: Hit[] = [
  hit({ id: 'dormitory:phrases:dirty-room', input: 'Dormitory', words: ['dirty', 'room'] }),
  // Listen and Enlist share a key; neither is named by a decision, so the first added is the one.
  hit({ id: 'silent:phrases:listen', input: 'Silent', words: ['listen'], added: '2026-09-12' }),
  hit({ id: 'enlist:phrases:listen', input: 'Enlist', words: ['listen'], added: '2026-09-13' }),
];

describe('the Promoted tab’s rows', () => {
  it('lists the export most promoted first, ties A to Z, with each note exactly as typed', async () => {
    const rows = deskPromotions(await input(), HITS);
    expect(rows.map((r) => [r.input, r.count])).toEqual([
      ['A gentleman', 2],
      ['Dormitory', 2],
      ['Clarbot z', 1],
      ['Silent', 1],
    ]);
    const dirty = rows[1]!;
    expect(dirty).toMatchObject({ words: ['dirty', 'room'], fromSearch: 1, typed: 1, checked: true, unknown: [] });
    expect(dirty.notes).toEqual([{ input: 'Dormitory', category: 'phrases', ...MARKUP, missing: [], created: '2026-09-20' }]);
    // In the export's order: most promotions first.
    expect(rows[0]!.searches.map((x) => x.n)).toEqual([1, 1]);
    expect(new Set(rows[0]!.searches.map((x) => x.input))).toEqual(new Set(['A gentleman', 'A Gentleman']));
    expect(rows[2]).toMatchObject({ checked: false, unknown: ['zorbl'], review: null, hit: null });
  });

  it('shows the newest review, what the routine published, the hit it became, and blocks', async () => {
    const rows = deskPromotions(await input(), HITS);
    const [gentle, dirty, , silent] = rows;
    expect(dirty!.review).toMatchObject({ outcome: 'place', decided: '2026-09-21', promotions: 2, relation: 4, readerAbout: 'keep', credit: 'drop' });
    expect(dirty!.applied).toEqual({ outcome: 'interesting', hitId: 'dormitory:phrases:dirty-room', date: '2026-09-22' });
    expect(dirty!.hit).toBe('dormitory:phrases:dirty-room');
    expect(gentle!.review).toMatchObject({ outcome: 'near', justification: '', readerAbout: null, credit: null });
    expect(gentle!.hit).toBeNull();
    expect(silent).toMatchObject({ blocked: true, hit: 'silent:phrases:listen' });
  });
});

describe('the desk’s data', () => {
  const base = async () => ({
    hits: HITS,
    candidates: [],
    queues: [],
    generated: '2026-09-22T00:00:00Z',
    today: '2026-09-22',
    tagPattern: (await tagPattern()).source,
    aboutPattern: await aboutPattern(),
    senseRule: await senseRule(),
    glosses: new Map<string, string | null>(),
    applyDesk: await readFile(APPLY_DESK_PROMPT, 'utf8'),
    deepRun: '',
    deepPerInput: null,
  });

  it('carries votes on every hit, and promotions only in the review desk built with them', async () => {
    const votes = new Map([['silent:phrases:listen', 4]]);
    const data = deskData({ ...(await base()), votes, votesDate: '2026-09-21', promotions: await input() });
    expect(data.hits.map((x) => [x.id, x.votes])).toEqual([
      ['dormitory:phrases:dirty-room', 0],
      ['silent:phrases:listen', 4],
      ['enlist:phrases:listen', 0],
    ]);
    expect(data).toMatchObject({ votesDate: '2026-09-21', promoted: { from: 'ars-magna-promotions', export: '2026-09-21', reviews: 2 } });
    expect(data.promotions).toHaveLength(4);
    const audit = deskData({ ...(await base()), mode: 'audit', promotions: await input() });
    expect(audit).toMatchObject({ promoted: null, promotions: [], votesDate: null });
    expect(deskData(await base())).toMatchObject({ promoted: null, promotions: [] });
  });

  it('embeds a note that holds markup as data, which the page shows as text', async () => {
    const data = deskData({ ...(await base()), promotions: await input() });
    const html = renderDesk(await readFile(DESK_TEMPLATE, 'utf8'), data, await readFile(COMPOSE_SOURCE, 'utf8'));
    // Nothing a reader typed reaches the page as markup: not a tag, not a closing script.
    for (const text of Object.values(MARKUP)) expect(html).not.toContain(text);
    expect(html).not.toMatch(/<img src=x|alert\("why"\)<\/script>|<a href="https:\/\/example\.com">/);
    const embedded = JSON.parse(/<script type="application\/json" id="desk-data">([\s\S]*?)<\/script>/.exec(html)![1]!);
    expect(embedded.promotions[1].notes[0]).toMatchObject(MARKUP);
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]!);
    expect(scripts).toHaveLength(2);
    for (const script of scripts) expect(() => new Script(script)).not.toThrow();
  });

  it('never writes HTML from a string: every value reaches the page as text', async () => {
    const template = await readFile(DESK_TEMPLATE, 'utf8');
    const compose = await readFile(COMPOSE_SOURCE, 'utf8');
    for (const source of [template, compose]) expect(source).not.toMatch(/innerHTML|outerHTML|insertAdjacentHTML|document\.write|\beval\(|new Function/);
    // The one way the page makes an element sets its text as a text node.
    expect(template).toContain("el.append(child instanceof Node ? child : String(child));");
  });
});

describe('a block decided in the desk', () => {
  it('becomes a command that names the code alone', () => {
    const code = 'ab'.repeat(32);
    const decisions: Decision[] = [
      { kind: 'block', id: code, display: '<b>jane</b> doe' },
      { kind: 'block', id: 'not a code; rm -rf /', display: 'x' },
      { kind: 'status', id: 'dormitory:phrases:dirty-room', status: 'retired' },
    ];
    const { commands } = composeCommands(decisions, '2026-09-22');
    expect(commands).toEqual(['pnpm hits:set --status=retired dormitory:phrases:dirty-room', `pnpm promotions:block --code=${code}`]);
    expect(commands.join('\n')).not.toContain('jane');
  });
});

describe('reading the private side', () => {
  it('takes the newest export and every review from the folder, and the newest daily votes', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'desk-promoted-'));
    try {
      expect(await readPromotions(dir)).toBeNull();
      const all = await lines();
      await writeLines(join(dir, 'export/2026-09-20.jsonl'), all.slice(0, 1), await validators.exportLine());
      await writeLines(join(dir, 'export/2026-09-21.jsonl'), all, await validators.exportLine());
      const reviews = (await input()).reviews;
      for (const r of reviews) expect((await validators.reviewLine())(r), JSON.stringify((await validators.reviewLine()).errors)).toBe(true);
      await writeLines(join(dir, 'reviews/2026-09-10.jsonl'), reviews.slice(0, 1), await validators.reviewLine());
      await writeLines(join(dir, 'reviews/2026-09-21.jsonl'), reviews.slice(1), await validators.reviewLine());
      const read = (await readPromotions(dir))!;
      expect(read).toMatchObject({ exportDate: '2026-09-21' });
      expect(read.lines).toHaveLength(all.length);
      expect(read.reviews.map((r) => r.decided)).toEqual(['2026-09-10', '2026-09-21', '2026-09-21']);

      const counts = join(dir, 'counts');
      expect(await newestVotes(counts)).toEqual({ date: null, votes: new Map() });
      await writeLines(join(counts, '2026-09-20/votes.jsonl'), [{ hit_id: 'silent:phrases:listen', count: 1 }], await validators.voteCount());
      await writeLines(join(counts, '2026-09-21/votes.jsonl'), [{ hit_id: 'silent:phrases:listen', count: 3 }], await validators.voteCount());
      expect(await newestVotes(counts)).toEqual({ date: '2026-09-21', votes: new Map([['silent:phrases:listen', 3]]) });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
