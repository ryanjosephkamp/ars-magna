/**
 * `pnpm hits:justify` on a copy of the first hits in data/hits.jsonl.
 */
import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { applyJustification, parseJustifyArgs } from '../src/justify.ts';
import { HITS_PATH, hitSchema, readJsonl, writeJsonl } from '../src/schema.ts';

async function sampleFile() {
  const validator = await hitSchema();
  const hits = (await readJsonl(HITS_PATH, validator)).slice(0, 4);
  const path = join(await mkdtemp(join(tmpdir(), 'ars-magna-justify-')), 'hits.jsonl');
  await writeJsonl(path, hits, validator);
  return { path, hits };
}

describe('hits:justify', () => {
  it('reads an id and the sentence, and refuses what it cannot set', () => {
    expect(parseJustifyArgs(['a:phrases:b', 'One plain sentence.'])).toEqual({ id: 'a:phrases:b', text: 'One plain sentence.' });
    expect(parseJustifyArgs(['a:phrases:b', 'Unquoted', 'words.'])).toEqual({ id: 'a:phrases:b', text: 'Unquoted words.' });
    expect(() => parseJustifyArgs([])).toThrow(/name a hit id/);
    expect(() => parseJustifyArgs(['a:phrases:b'])).toThrow(/give a:phrases:b a justification/);
    expect(() => parseJustifyArgs(['a:phrases:b', 'x'.repeat(301)])).toThrow(/301 characters/);
    expect(() => parseJustifyArgs(['--force', 'a:phrases:b', 'x'])).toThrow(/unknown option --force/);
  });

  it('refuses an unknown id and leaves the file as it was', async () => {
    const { path } = await sampleFile();
    const before = await readFile(path, 'utf8');
    await expect(applyJustification(path, 'nosuch:phrases:hit', 'A sentence.')).rejects.toThrow(/no such hit/);
    expect(await readFile(path, 'utf8')).toBe(before);
  });

  it('changes exactly one line, and nothing when the sentence is the same', async () => {
    const { path, hits } = await sampleFile();
    const before = (await readFile(path, 'utf8')).split('\n');
    const result = await applyJustification(path, hits[2]!.id, 'A new plain sentence for a reader.');
    expect(result.changed).toBe(true);
    expect(result.from).toBe(hits[2]!.justification ?? null);
    const after = (await readFile(path, 'utf8')).split('\n');
    expect(after).toHaveLength(before.length);
    expect(after.filter((line, i) => line !== before[i])).toHaveLength(1);
    expect(JSON.parse(after[2]!).justification).toBe('A new plain sentence for a reader.');
    expect((await applyJustification(path, hits[2]!.id, 'A new plain sentence for a reader.')).changed).toBe(false);
  });
});
