/**
 * `pnpm hits:order` on a copy of the first hits in data/hits.jsonl.
 */
import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { applyOrder, parseOrderArgs, setOrder } from '../src/order.ts';
import { HITS_PATH, hitSchema, readJsonl, writeJsonl, type Hit } from '../src/schema.ts';

async function sampleFile() {
  const validator = await hitSchema();
  const all = await readJsonl(HITS_PATH, validator);
  // Four hits, the third with at least two different words, so it has another order.
  const many = all.find((h) => new Set(h.words).size > 1)!;
  const hits = [...all.filter((h) => h.id !== many.id).slice(0, 2), many, ...all.filter((h) => h.id !== many.id).slice(2, 3)];
  const path = join(await mkdtemp(join(tmpdir(), 'ars-magna-order-')), 'hits.jsonl');
  await writeJsonl(path, hits, validator);
  return { path, hits };
}

describe('hits:order', () => {
  it('reads an id and the words, as separate arguments or one quoted phrase', () => {
    expect(parseOrderArgs(['dormitory:phrases:dirty-room', 'room', 'dirty'])).toEqual({ id: 'dormitory:phrases:dirty-room', words: ['room', 'dirty'] });
    expect(parseOrderArgs(['dormitory:phrases:dirty-room', 'Room  dirty'])).toEqual({ id: 'dormitory:phrases:dirty-room', words: ['room', 'dirty'] });
    expect(() => parseOrderArgs([])).toThrow(/name a hit id/);
    expect(() => parseOrderArgs(['a:phrases:b'])).toThrow(/give the words of a:phrases:b/);
    expect(() => parseOrderArgs(['a:phrases:b', "it's"])).toThrow(/lowercase letters only: it's/);
    expect(() => parseOrderArgs(['--force', 'a:phrases:b', 'x'])).toThrow(/unknown option --force/);
  });

  it('takes only the hit\'s own words, each as many times', () => {
    const hit = { id: 'papa:phrases:pa-pa', words: ['pa', 'pa'], display: 'pa pa' } as unknown as Hit;
    expect(setOrder([hit], 'papa:phrases:pa-pa', ['pa', 'pa']).changed).toBe(false);
    expect(() => setOrder([hit], 'papa:phrases:pa-pa', ['pa'])).toThrow(/the words of papa:phrases:pa-pa are pa pa/);
    expect(() => setOrder([hit], 'papa:phrases:pa-pa', ['ap', 'pa'])).toThrow(/give those words/);
  });

  it('refuses an unknown id or other words, and leaves the file as it was', async () => {
    const { path, hits } = await sampleFile();
    const before = await readFile(path, 'utf8');
    await expect(applyOrder(path, 'nosuch:phrases:hit', ['a'])).rejects.toThrow(/no such hit/);
    await expect(applyOrder(path, hits[2]!.id, [...hits[2]!.words, 'extra'])).rejects.toThrow(/give those words/);
    expect(await readFile(path, 'utf8')).toBe(before);
  });

  it('changes the words and display of exactly one line, and nothing when the order is the same', async () => {
    const { path, hits } = await sampleFile();
    const hit = hits[2]!;
    const reversed = [...hit.words].reverse();
    const before = (await readFile(path, 'utf8')).split('\n');
    const result = await applyOrder(path, hit.id, reversed);
    expect(result).toMatchObject({ changed: true, from: hit.display });
    const after = (await readFile(path, 'utf8')).split('\n');
    expect(after).toHaveLength(before.length);
    expect(after.filter((line, i) => line !== before[i])).toHaveLength(1);
    const written = JSON.parse(after[2]!) as Hit;
    expect(written).toEqual({ ...hit, words: reversed, display: reversed.join(' ') });
    expect((await applyOrder(path, hit.id, reversed)).changed).toBe(false);
  });
});
