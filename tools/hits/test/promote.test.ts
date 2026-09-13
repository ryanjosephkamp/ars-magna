/**
 * `pnpm hits:ingest --only`: named rows from a queue's verdicts, past the
 * shelves, for the operator's promotion of a near miss.
 */
import { describe, expect, it } from 'vitest';

import { promoteOnly, type IngestOptions } from '../src/ingest.ts';
import type { VerdictV2 } from '../src/judge.ts';
import type { Prefiltered } from '../src/prefilter.ts';
import { dictionaryPin, hitSchema } from '../src/schema.ts';

const row = (words: string[]): Prefiltered => ({
  id: `dormitory:phrases:${[...words].sort().join('-')}`,
  candidate_id: 'dormitory:phrases',
  input: 'Dormitory',
  category: 'phrases',
  words,
  display: words.join(' '),
  letters: 'dimoorrty',
  prefilter_score: 1.5,
  tier: 'common',
});

const near = row(['dirty', 'room']);
const other = row(['dormy', 'riot']);
const batch = new Map([near, other].map((r) => [r.id, r]));
const verdict = (id: string, over: Partial<VerdictV2> = {}): VerdictV2 => ({ id, relation: 2, reads: 2, tone: ['pun'], subjects: [], rationale: 'A loose link.', ...over });

async function options(existing: string[] = []): Promise<IngestOptions> {
  return {
    model: 'claude-sonnet-5',
    version: 'v2',
    date: '2026-09-14',
    threshold: 11,
    dictionary: await dictionaryPin(),
    existing: new Set(existing),
    subjects: new Map([['dormitory:phrases', ['building']]]),
  };
}

describe('ingest --only', () => {
  it('writes exactly the named rows, with their verdict, justification and tags', async () => {
    const verdicts = [verdict(near.id, { justification: 'A dormitory is a room that gets dirty.' }), verdict(other.id)];
    const { hits, refused } = promoteOnly(batch, verdicts, [near.id], 'accepted', await options());
    expect(refused).toEqual([]);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({
      id: near.id,
      status: 'accepted',
      justification: 'A dormitory is a room that gets dirty.',
      tags: ['tone:pun', 'subject:building'],
      added: '2026-09-14',
      prefilter_score: 1.5,
    });
    const validate = await hitSchema();
    expect(validate(hits[0]), JSON.stringify(validate.errors)).toBe(true);
  });

  it('adds a row without a justification only as proposed', async () => {
    const verdicts = [verdict(near.id), verdict(other.id)];
    const accepted = promoteOnly(batch, verdicts, [near.id], 'accepted', await options());
    expect(accepted.hits).toEqual([]);
    expect(accepted.refused[0]!.reason).toMatch(/no justification to publish with/);
    const proposed = promoteOnly(batch, verdicts, [near.id], 'proposed', await options());
    expect(proposed.hits.map((h) => [h.id, h.status, h.justification])).toEqual([[near.id, 'proposed', undefined]]);
  });

  it('names every row it refuses', async () => {
    const { hits, refused } = promoteOnly(
      batch,
      [verdict(near.id, { justification: 'Fine.' })],
      ['dormitory:phrases:no-such', near.id, other.id],
      'proposed',
      await options([near.id]),
    );
    expect(hits).toEqual([]);
    expect(refused).toEqual([
      { id: 'dormitory:phrases:no-such', reason: 'not in this queue' },
      { id: near.id, reason: 'already in data/hits.jsonl; change it with pnpm hits:set' },
      { id: other.id, reason: 'no valid verdict in this queue' },
    ]);
  });
});
