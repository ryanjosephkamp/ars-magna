/**
 * The monthly vote review (voting plan R9, roadmap F3): which hits it reads
 * and suggests, the answers it takes, the one move it makes, and the record
 * it keeps. It never makes a hit featured.
 */
import { describe, expect, it } from 'vitest';

import {
  MONTHLY_MIN_VOTES,
  answerProblems,
  applyMove,
  monthOf,
  monthlyLines,
  monthlyPrompt,
  ranked,
  renderMonthlyInput,
  renderMonthlyReport,
  selectMonthly,
  type MonthlyAnswer,
} from '../src/monthly.ts';
import { validators } from '../src/promotions/files.ts';
import { shelfOf } from '../src/shelf.ts';
import type { Hit } from '../src/schema.ts';

const DICTIONARY = { repo: 'ryanjosephkamp/english-openlist', rev: 'a'.repeat(40) };

/** An accepted hit the judge scored `relation`, so A stretch at 3 and Interesting at 4 or 5. */
function hit(input: string, words: string[], relation: number, over: Partial<Hit> = {}): Hit {
  const letters = input.toLowerCase().replace(/[^a-z]/g, '');
  return {
    id: `${letters}:phrases:${[...words].sort().join('-')}`,
    input,
    category: 'phrases',
    words,
    display: words.join(' '),
    letters: [...letters].sort().join(''),
    prefilter_score: 0,
    judge: [
      {
        model: 'claude-sonnet-5',
        rubric_version: 'v2',
        relation,
        reads: 2,
        tone: [],
        subjects: [],
        justification: `A link for ${input}.`,
        rationale: 'r',
        judged_at: '2026-09-10',
      },
    ],
    submitter: 'routine',
    added: '2026-09-10',
    dictionary: DICTIONARY,
    tier: 'common',
    tags: [],
    status: 'accepted',
    justification: `A link for ${input}.`,
    ...over,
  };
}

/** Twenty A stretch hits, so the top tenth is two; ten Interesting, so it is one; and some that are neither. */
function collection(): Hit[] {
  const stretch = Array.from({ length: 20 }, (_, i) => hit(`Stretch ${String.fromCharCode(97 + i)}`, ['word', String.fromCharCode(97 + i).repeat(3)], 3));
  const interesting = Array.from({ length: 10 }, (_, i) => hit(`Keen ${String.fromCharCode(97 + i)}`, ['keen', String.fromCharCode(97 + i).repeat(3)], 4));
  return [
    ...stretch,
    ...interesting,
    // Placed in A stretch by the operator although the judge scored it 4.
    hit('Placed', ['placed', 'zzz'], 4, { tags: ['shelf:stretch'] }),
    // Greatest Hits and a held-back hit are in neither section.
    hit('Great', ['great', 'yyy'], 5, { status: 'featured' }),
    hit('Held', ['held', 'xxx'], 3, { status: 'proposed' }),
  ];
}

const id = (hits: Hit[], input: string) => hits.find((h) => h.input === input)!.id;

describe('what a month reads and suggests', () => {
  it('takes the top tenth of each section by votes, only those with at least five, ties A to Z', () => {
    const hits = collection();
    const votes = new Map([
      [id(hits, 'Stretch c'), 9],
      [id(hits, 'Stretch b'), 7],
      [id(hits, 'Stretch a'), 7],
      [id(hits, 'Stretch d'), 30],
      [id(hits, 'Keen e'), 12],
      [id(hits, 'Keen f'), 4],
      [id(hits, 'Great'), 99],
      [id(hits, 'Held'), 99],
    ]);
    const s = selectMonthly(hits, votes, '2026-10', '2026-10-01');
    // 21 in A stretch (with the placed one), so the top tenth is 3.
    expect(s.stretch).toMatchObject({ total: 21, top: 3 });
    expect(s.stretch.rows.map((r) => [r.input, r.votes, r.rank])).toEqual([
      ['Stretch d', 30, 1],
      ['Stretch c', 9, 2],
      ['Stretch a', 7, 3],
    ]);
    // Stretch b ties Stretch a on 7 and loses A to Z, so it falls past the top tenth.
    expect(s.interesting).toMatchObject({ total: 10, top: 1 });
    expect(s.interesting.rows.map((r) => [r.input, r.votes])).toEqual([['Keen e', 12]]);
    // Greatest Hits and held-back hits are never read or suggested.
    expect([...s.stretch.rows, ...s.interesting.rows].some((r) => r.input === 'Great' || r.input === 'Held')).toBe(false);
  });

  it('reads nothing when the top tenth has too few votes, and marks what the operator placed', () => {
    const hits = collection();
    const few = selectMonthly(hits, new Map([[id(hits, 'Stretch a'), MONTHLY_MIN_VOTES - 1]]), '2026-10', '2026-10-01');
    expect(few.stretch.rows).toEqual([]);
    expect(few.interesting.rows).toEqual([]);
    const placed = selectMonthly(hits, new Map([[id(hits, 'Placed'), 50]]), '2026-10', '2026-10-01');
    expect(placed.stretch.rows).toMatchObject([{ input: 'Placed', placed: true, relation: 4 }]);
    expect(ranked(hits, 'stretch', new Map())[0]!.input).toBe('Placed');
    expect(monthOf('2026-10-01')).toBe('2026-10');
  });

  it('writes the rows under the review’s own instructions', async () => {
    const hits = collection();
    const s = selectMonthly(hits, new Map([[id(hits, 'Stretch a'), 8]]), '2026-10', '2026-10-01');
    const { text, version } = await monthlyPrompt();
    expect(version).toBe('v1');
    const input = renderMonthlyInput(s, text);
    expect(input).toContain('monthly_version: v1');
    expect(input).toContain('Move at most one.');
    expect(input).toContain(`- id: ${id(hits, 'Stretch a')}`);
    expect(input).toContain('votes: 8, the 1st most voted in A stretch');
  });
});

describe('the answers', () => {
  const hits = collection();
  const votes = new Map([
    [id(hits, 'Stretch a'), 9],
    [id(hits, 'Stretch b'), 8],
    [id(hits, 'Stretch c'), 7],
  ]);
  const rows = selectMonthly(hits, votes, '2026-10', '2026-10-01').stretch.rows;
  const ids = rows.map((r) => r.id);
  const good: MonthlyAnswer[] = [
    { id: ids[0]!, decision: 'move', reason: 'Its link is plain at once.' },
    { id: ids[1]!, decision: 'stay', reason: 'The link needs a sentence to explain.' },
    { id: ids[2]!, decision: 'stay', reason: 'Only one word touches the input.' },
  ];

  it('takes every row answered once, with a sentence each and at most one move', () => {
    expect(answerProblems(good, rows)).toEqual([]);
  });

  it('refuses a missing, repeated or unknown row, a bad decision, a missing sentence and a second move', () => {
    expect(answerProblems(good.slice(0, 2), rows)).toEqual([`${ids[2]} has no answer`]);
    expect(answerProblems([...good, good[1]!], rows)).toContain(`answer 4: ${ids[1]} is answered twice`);
    expect(answerProblems([...good, { id: 'no:phrases:such', decision: 'stay', reason: 'x.' }], rows)).toContain('answer 4: no:phrases:such is not a row of this review');
    expect(answerProblems([{ ...good[0]!, decision: 'promote' as never }, ...good.slice(1)], rows)).toContain('answer 1: decision must be move or stay');
    expect(answerProblems([{ ...good[0]!, reason: ' ' }, ...good.slice(1)], rows)).toContain(`answer 1: give one sentence for ${ids[0]}`);
    expect(answerProblems([good[0]!, { ...good[1]!, decision: 'move' }, good[2]!], rows)).toContain('2 rows move; at most 1 may');
    expect(answerProblems([{ ...good[0]!, featured: true } as never, ...good.slice(1)], rows)).toContain('answer 1: unknown featured');
  });

  it('refuses one sentence, quoted words masked, on more than three rows', () => {
    // Forty A stretch hits, so the top tenth is four.
    const forty = Array.from({ length: 40 }, (_, i) => hit(`Long ${String(i).padStart(2, '0')}`, ['long', 'abc'.repeat(1 + (i % 3)) + String.fromCharCode(97 + (i % 26))], 3));
    const many = selectMonthly(forty, new Map(forty.map((h, i) => [h.id, 50 - i])), '2026-10', '2026-10-01').stretch.rows;
    expect(many).toHaveLength(4);
    const same = many.map((r) => ({ id: r.id, decision: 'stay' as const, reason: `"${r.display}" is only a stretch.` }));
    expect(answerProblems(same, many).join('\n')).toMatch(/4/);
    const three = same.map((a, i) => (i === 3 ? { ...a, reason: 'This one says something of its own.' } : a));
    expect(answerProblems(three, many)).toEqual([]);
  });
});

describe('the move and the record', () => {
  it('moves an A stretch hit to Interesting by its shelf tag, and never changes a status', () => {
    const hits = collection();
    const judged = id(hits, 'Stretch a');
    const moved = applyMove(hits, judged);
    expect(moved).toMatchObject({ add: ['shelf:interesting'], remove: [] });
    const after = moved.hits.find((h) => h.id === judged)!;
    expect(shelfOf(after)).toBe('interesting');
    expect(after.status).toBe('accepted');
    // The operator's A stretch placement comes off; the judge's 4 already puts it in Interesting.
    const placed = applyMove(hits, id(hits, 'Placed'));
    expect(placed).toMatchObject({ add: [], remove: ['shelf:stretch'] });
    expect(shelfOf(placed.hits.find((h) => h.input === 'Placed')!)).toBe('interesting');
    expect(moved.hits.filter((h) => h.status === 'featured')).toHaveLength(1);
    expect(() => applyMove(hits, id(hits, 'Keen a'))).toThrow(/not in A stretch/);
    expect(() => applyMove(hits, id(hits, 'Great'))).toThrow(/not in A stretch/);
  });

  it('keeps every row read again, the ones that stay too, and lists suggestions without a decision', async () => {
    const hits = collection();
    const votes = new Map([
      [id(hits, 'Stretch a'), 9],
      [id(hits, 'Stretch b'), 8],
      [id(hits, 'Keen c'), 6],
    ]);
    const s = selectMonthly(hits, votes, '2026-10', '2026-10-01');
    const answers: MonthlyAnswer[] = [
      { id: id(hits, 'Stretch a'), decision: 'move', reason: 'Its link is plain at once.' },
      { id: id(hits, 'Stretch b'), decision: 'stay', reason: 'The link needs a sentence.' },
    ];
    const lines = monthlyLines(s, answers, { decided: '2026-10-01', model: 'claude-sonnet-5', judgedBy: 'routine', version: 'v1' });
    expect(lines.map((l) => [l.kind, l.hit_id, l.decision ?? null])).toEqual([
      ['reread', id(hits, 'Stretch a'), 'move'],
      ['reread', id(hits, 'Stretch b'), 'stay'],
      ['suggestion', id(hits, 'Keen c'), null],
    ]);
    const valid = await validators.monthly();
    for (const line of lines) expect(valid(line), JSON.stringify(valid.errors)).toBe(true);
    expect(valid({ ...lines[2]!, decision: 'move' })).toBe(false);
    expect(valid({ ...lines[0]!, reason: undefined })).toBe(false);

    const report = renderMonthlyReport(s, answers, { decided: '2026-10-01', model: 'claude-sonnet-5', judgedBy: 'routine' });
    expect(report).toContain('## Monthly vote review 2026-10');
    expect(report).toContain('**Moves to Interesting:**');
    expect(report).toContain(`pnpm hits:tag ${id(hits, 'Stretch a')} -shelf:interesting`);
    expect(report).toContain('Nothing here is promoted');
    expect(report).toContain(`\`${id(hits, 'Keen c')}\``);

    const quiet = renderMonthlyReport(selectMonthly(hits, new Map(), '2026-11', null), [], { decided: '2026-11-01', model: null, judgedBy: 'routine' });
    expect(quiet).toContain('None: A stretch has 21 hits, and none of its top 3 has 5 votes.');
    expect(quiet).toContain('None: Interesting has 10 hits');
  });
});

describe('the committed records', () => {
  it('every data/votes/monthly/<month>.jsonl fits the schema, beside its report', async () => {
    const { readdir, readFile } = await import('node:fs/promises');
    const { existsSync } = await import('node:fs');
    const { MONTHLY_DIR } = await import('../src/monthly.ts');
    const names = existsSync(MONTHLY_DIR) ? await readdir(MONTHLY_DIR) : [];
    const valid = await validators.monthly();
    for (const name of names.filter((n) => n.endsWith('.jsonl'))) {
      expect(names).toContain(name.replace(/\.jsonl$/, '.md'));
      for (const line of (await readFile(`${MONTHLY_DIR}/${name}`, 'utf8')).split('\n').filter((l) => l.trim())) {
        expect(valid(JSON.parse(line)), `${name}: ${JSON.stringify(valid.errors)}`).toBe(true);
      }
    }
  });
});
