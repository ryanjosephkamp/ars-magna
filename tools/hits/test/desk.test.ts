/**
 * The review desk: what it shows of a queue, how it embeds its data, and a
 * page built from the repository whose scripts parse and whose inlined
 * compose writes the same commands as the module.
 */
import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';

import { composeCommands, type Decision } from '../src/desk/compose.ts';
import { deskData, deskQueue, embedJson, inlineCompose, renderDesk, type QueueInput } from '../src/desk/build.ts';
import { APPLY_DESK_PROMPT, COMPOSE_SOURCE, DEEP_RUN_PROMPT, DESK_TEMPLATE, judgedQueues } from '../src/desk.ts';
import type { VerdictV2 } from '../src/judge.ts';
import type { Prefiltered } from '../src/prefilter.ts';
import { CANDIDATES_PATH, HITS_PATH, candidateSchema, hitSchema, readJsonl, type Hit } from '../src/schema.ts';
import { tagPattern } from '../src/tag.ts';

const row = (candidate: string, input: string, words: string[]): Prefiltered => ({
  id: `${candidate}:${[...words].sort().join('-')}`,
  candidate_id: candidate,
  input,
  category: 'phrases',
  words,
  display: words.join(' '),
  letters: 'x',
  prefilter_score: 1,
  tier: 'common',
});
const verdict = (id: string, relation: number, reads: number, justification = ''): VerdictV2 => ({
  id,
  relation,
  reads,
  tone: relation === 4 ? ['ironic'] : [],
  subjects: [],
  rationale: `relation ${relation}`,
  ...(justification ? { justification } : {}),
});

describe('a queue in the desk', () => {
  it('shows each row in the file with where it stands, the near misses, and nothing with no link', () => {
    const rows = [
      row('funeral:phrases', 'Funeral', ['real', 'fun']),
      row('funeral:phrases', 'Funeral', ['flu', 'near']),
      row('funeral:phrases', 'Funeral', ['rule', 'fan']),
      row('boeing:phrases', 'Boeing', ['big', 'one']),
    ];
    const queue: QueueInput = {
      name: '2026-09-13',
      rows,
      verdicts: [verdict(rows[3]!.id, 3, 2, 'Big.'), verdict(rows[0]!.id, 4, 3, 'Ironic.'), verdict(rows[1]!.id, 2, 1), verdict(rows[2]!.id, 1, 2)],
    };
    const hit = {
      id: rows[0]!.id,
      status: 'accepted',
      tags: ['tone:ironic'],
      justification: 'A funeral is anything but fun.',
      // An earlier queue's judge first, then the entry ingest recorded for this queue's verdict.
      judge: [
        { model: 'claude-fable-5-1', rubric_version: 'v2', relation: 4, reads: 2, tone: [], subjects: [], rationale: 'from an earlier queue', justification: 'Fun.', judged_at: '2026-09-11' },
        { model: 'claude-opus-5', rubric_version: 'v2', relation: 4, reads: 3, tone: ['ironic'], subjects: [], rationale: 'relation 4', justification: 'Ironic.', judged_at: '2026-09-13' },
      ],
    } as unknown as Hit;

    const desk = deskQueue(queue, [hit], '2026-09-14');
    expect(desk).toMatchObject({ name: '2026-09-13', model: 'claude-opus-5', judged: 4 });
    // These verdict lines name no model; the judge entry holding this queue's verdict supplies it, not the earlier one.
    expect(desk.models).toEqual([{ model: 'claude-opus-5', verdicts: 4 }]);
    expect(desk.rows.map((r) => r.model)).toEqual(['claude-opus-5', 'claude-opus-5', 'claude-opus-5']);
    expect(desk.rows.map((r) => [r.display, r.hit?.status ?? 'near miss'])).toEqual([
      ['real fun', 'accepted'],
      ['flu near', 'near miss'],
      ['big one', 'near miss'],
    ]);
    expect(desk.rows[0]).toMatchObject({ justification: 'A funeral is anything but fun.', tone: ['ironic'], hit: { status: 'accepted', shelf: 'interesting', alternate: false } });
    expect(desk.rows[2]!.justification).toBe('Big.');
  });

  it('names its judges from its own verdict lines, not from an older hit that shares an id', () => {
    const rows = [
      row('listen:phrases', 'Listen', ['silent']),
      row('listen:phrases', 'Listen', ['lets', 'in']),
      row('listen:phrases', 'Listen', ['tinsel']),
    ];
    const queue: QueueInput = {
      name: '2026-09-13s',
      rows,
      verdicts: [
        { ...verdict(rows[0]!.id, 5, 3, 'Silent.'), model: 'claude-opus-5' },
        { ...verdict(rows[1]!.id, 3, 3, 'Lets in.'), model: 'claude-opus-5' },
        { ...verdict(rows[2]!.id, 2, 1), model: 'claude-sonnet-5' },
      ],
    };
    // "silent" was already a hit, judged by another model in an earlier queue.
    const older = {
      id: rows[0]!.id,
      status: 'accepted',
      tags: [],
      justification: 'Silent.',
      judge: [{ model: 'claude-fable-5-1', rubric_version: 'v1', aptness: 5, grammar: 5, memorability: 5, total: 15, rationale: 'r', judged_at: '2026-09-11' }],
    } as unknown as Hit;

    const desk = deskQueue(queue, [older], '2026-09-14');
    expect(desk.models).toEqual([
      { model: 'claude-opus-5', verdicts: 2 },
      { model: 'claude-sonnet-5', verdicts: 1 },
    ]);
    expect(desk.model).toBe('claude-opus-5');
    expect(desk.rows.map((r) => [r.display, r.model])).toEqual([
      ['silent', 'claude-opus-5'],
      ['lets in', 'claude-opus-5'],
      ['tinsel', 'claude-sonnet-5'],
    ]);
  });
});

describe('the page', () => {
  it('embeds data that no text can close early, and inlines compose as plain script', async () => {
    const data = { text: '</script><script>alert(1)</script> & <!-- \u2028' };
    const json = embedJson(data);
    expect(json).not.toMatch(/[<>&\u2028]/);
    expect(JSON.parse(json)).toEqual(data);

    const code = inlineCompose(await readFile(COMPOSE_SOURCE, 'utf8'));
    expect(code).toContain('function composeCommands(');
    expect(code).not.toMatch(/^export /m);
    expect(code).not.toContain(': readonly Decision[]');
    expect(() => inlineCompose("import x from 'y';\nexport const a = 1;")).toThrow(/must not import/);
    expect(() => renderDesk('<html></html>', {} as never, 'const a = 1;')).toThrow(/needs exactly one/);
  });

  it('builds from the repository, parses, and writes the same commands in the page as in the tests', async () => {
    const hits = await readJsonl(HITS_PATH, await hitSchema());
    const data = deskData({
      hits,
      candidates: await readJsonl(CANDIDATES_PATH, await candidateSchema()),
      queues: await judgedQueues(2),
      generated: '2026-09-14T00:00:00Z',
      today: '2026-09-14',
      tagPattern: (await tagPattern()).source,
      applyDesk: await readFile(APPLY_DESK_PROMPT, 'utf8'),
      deepRun: await readFile(DEEP_RUN_PROMPT, 'utf8'),
      deepPerInput: 300,
    });
    const html = renderDesk(await readFile(DESK_TEMPLATE, 'utf8'), data, await readFile(COMPOSE_SOURCE, 'utf8'));
    expect(html).toContain('<title>Ars Magna Review Desk</title>');
    expect(html).not.toContain('/*DESK_');

    const embedded = /<script type="application\/json" id="desk-data">([\s\S]*?)<\/script>/.exec(html)![1]!;
    expect(JSON.parse(embedded).hits).toHaveLength(hits.length);

    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]!);
    expect(scripts).toHaveLength(2);
    for (const script of scripts) expect(() => new Script(script)).not.toThrow();

    const context: Record<string, unknown> = {};
    new Script(scripts[0]!).runInNewContext(context);
    const decisions: Decision[] = [
      { kind: 'status', id: hits[0]!.id, status: 'featured' },
      { kind: 'justify', id: hits[0]!.id, text: "It's plain." },
      { kind: 'seed', input: 'Sagrada Família', category: 'places', anchors: [] },
    ];
    const inPage = (context['composeCommands'] as typeof composeCommands)(decisions, '2026-09-14');
    expect(JSON.stringify(inPage)).toBe(JSON.stringify(composeCommands(decisions, '2026-09-14')));
  });
});
