import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { applyRequeue, parseRequeueArgs, requeue, type RequeueFilter } from '../src/requeue.ts';
import { addRun, lastRun, queueName } from '../src/settings.ts';
import { toJsonl, type Candidate } from '../src/schema.ts';

const candidate = (id: string, over: Partial<Candidate> = {}): Candidate => ({
  id,
  input: id.split(':')[0]!,
  category: id.split(':')[1] as Candidate['category'],
  source: 'manual',
  first_seen: '2026-09-11',
  status: 'enumerated',
  ...over,
});

const pool = () => [
  candidate('legacy:titles'),
  candidate('olds:titles', { runs: [{ queue: '2026-09-12c', settings: 's1', rubric: 'v1', date: '2026-09-12' }] }),
  candidate('current:places', { source: 'trending', runs: [{ queue: '2026-09-20', settings: 's2', rubric: 'v2', date: '2026-09-20' }] }),
  candidate('waiting:phrases', { status: 'new' }),
  candidate('nocategory:phrases', { status: 'unclassified', source: 'trending' }),
];

const ids = (list: Candidate[]) => list.map((c) => c.id);
const filter = (over: Partial<RequeueFilter>): RequeueFilter => ({ ids: [], ...over });

describe('the candidate ledger', () => {
  it('records a run once per queue and reads the last one, with legacy candidates as s1 v1', () => {
    const c = candidate('x:phrases');
    expect(lastRun(c)).toEqual({ settings: 's1', rubric: 'v1' });
    expect(addRun(c, { queue: '2026-09-13', settings: 's1', rubric: 'v2', date: '2026-09-13' })).toBe(true);
    expect(addRun(c, { queue: '2026-09-13', settings: 's1', rubric: 'v2', date: '2026-09-14' })).toBe(false);
    expect(c.runs).toHaveLength(1);
    expect(lastRun(c)).toMatchObject({ settings: 's1', rubric: 'v2' });
    expect(queueName('/repo/data/queue/2026-09-12c')).toBe('2026-09-12c');
  });
});

describe('hits:requeue', () => {
  it('reads the selectors and refuses what it does not know or an empty request', () => {
    expect(parseRequeueArgs(['--settings-before=s2', '--category=titles', '--dry-run', 'a:titles'])).toEqual({
      filter: { ids: ['a:titles'], settingsBefore: 2, category: 'titles' },
      dryRun: true,
    });
    expect(() => parseRequeueArgs([])).toThrow(/name what to requeue/);
    expect(() => parseRequeueArgs(['--settings-before=2'])).toThrow(/must look like s2/);
    expect(() => parseRequeueArgs(['--rubric-before=s2'])).toThrow(/must look like v2/);
    expect(() => parseRequeueArgs(['--category=celebrities'])).toThrow(/unknown category/);
    expect(() => parseRequeueArgs(['--source=wikipedia'])).toThrow(/unknown source/);
    expect(() => parseRequeueArgs(['--force'])).toThrow(/unknown option --force/);
  });

  it('reopens enumerated candidates processed under older versions, with every selector applied', () => {
    expect(ids(requeue(pool(), filter({ settingsBefore: 2 }), '2026-09-13').moved)).toEqual(['legacy:titles', 'olds:titles']);
    expect(ids(requeue(pool(), filter({ rubricBefore: 2 }), '2026-09-13').moved)).toEqual(['legacy:titles', 'olds:titles']);
    expect(ids(requeue(pool(), filter({ settingsBefore: 3, source: 'trending' }), '2026-09-13').moved)).toEqual(['current:places']);
    expect(ids(requeue(pool(), filter({ category: 'titles', ids: ['olds:titles'] }), '2026-09-13').moved)).toEqual(['olds:titles']);
    const { candidates, moved } = requeue(pool(), filter({ ids: ['legacy:titles'] }), '2026-09-13');
    expect(moved[0]).toMatchObject({ status: 'new', notes: 'requeued 2026-09-13' });
    // Only the named one changed; runs and other fields are untouched.
    expect(candidates.map((c) => c.status)).toEqual(['new', 'enumerated', 'enumerated', 'new', 'unclassified']);
    expect(requeue(pool(), filter({ ids: ['olds:titles'] }), '2026-09-13').candidates[1]!.runs).toHaveLength(1);
  });

  it('refuses a named id that is missing, not enumerated, or unclassified', () => {
    const { refused } = requeue(pool(), filter({ ids: ['missing:titles', 'waiting:phrases', 'nocategory:phrases'] }), '2026-09-13');
    expect(refused.map((r) => r.id)).toEqual(['missing:titles', 'waiting:phrases', 'nocategory:phrases']);
    expect(refused[2]!.reason).toMatch(/unclassified/);
  });

  it('rewrites the file only when something moves, and never on a dry run or a refusal', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'hits-requeue-'));
    const path = join(dir, 'candidates.jsonl');
    await writeFile(path, toJsonl(pool()));
    const before = await readFile(path, 'utf8');

    expect((await applyRequeue(path, filter({ settingsBefore: 2 }), '2026-09-13', true)).moved).toHaveLength(2);
    expect(await readFile(path, 'utf8')).toBe(before);
    await expect(applyRequeue(path, filter({ ids: ['waiting:phrases'] }), '2026-09-13', false)).rejects.toThrow(/waiting:phrases: it is new/);
    expect(await readFile(path, 'utf8')).toBe(before);

    await applyRequeue(path, filter({ settingsBefore: 2 }), '2026-09-13', false);
    const after = (await readFile(path, 'utf8')).split('\n');
    expect(after.filter((line, i) => line !== before.split('\n')[i])).toHaveLength(2);
  });
});
