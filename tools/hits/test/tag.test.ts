/**
 * `pnpm hits:tag` on a copy of the first hits in data/hits.jsonl.
 */
import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { applyTagFile, parseTagArgs, tagPattern } from '../src/tag.ts';
import { HITS_PATH, hitSchema, readJsonl, writeJsonl } from '../src/schema.ts';

async function sampleFile() {
  const validator = await hitSchema();
  const hits = (await readJsonl(HITS_PATH, validator)).slice(0, 4);
  const path = join(await mkdtemp(join(tmpdir(), 'ars-magna-tag-')), 'hits.jsonl');
  await writeJsonl(path, hits, validator);
  return { path, hits };
}

describe('hits:tag', () => {
  it('reads one id with +tag and -tag changes', () => {
    expect(parseTagArgs(['a:phrases:b', '+tone:pun', '-subject:actor', '+tone:pun'])).toEqual({ id: 'a:phrases:b', add: ['tone:pun'], remove: ['subject:actor'] });
    expect(() => parseTagArgs(['+tone:pun'])).toThrow(/name one hit id/);
    expect(() => parseTagArgs(['a:phrases:b', 'c:phrases:d', '+tone:pun'])).toThrow(/name one hit id/);
    expect(() => parseTagArgs(['a:phrases:b'])).toThrow(/at least one/);
    expect(() => parseTagArgs(['a:phrases:b', '+tone:pun', '-tone:pun'])).toThrow(/both added and removed/);
    expect(() => parseTagArgs(['a:phrases:b', '--all'])).toThrow(/unknown option --all/);
  });

  it('uses the hit schema’s own tag pattern', async () => {
    const pattern = await tagPattern();
    for (const tag of ['classic', 'alternate', 'note:any text at all', 'subject:science-fiction-film', 'tone:self-referential']) expect(pattern.test(tag), tag).toBe(true);
    for (const tag of ['tone:happy', 'subject:Actor', 'celebrity', 'note:']) expect(pattern.test(tag), tag).toBe(false);
  });

  it('refuses a tag the schema does not allow, and an unknown id, writing nothing', async () => {
    const { path, hits } = await sampleFile();
    const before = await readFile(path, 'utf8');
    for (const tag of ['tone:happy', 'subject:Actor', 'celebrity']) {
      await expect(applyTagFile(path, { id: hits[0]!.id, add: [tag], remove: [] })).rejects.toThrow(/not a tag the schema allows/);
    }
    await expect(applyTagFile(path, { id: 'nosuch:phrases:hit', add: ['tone:pun'], remove: [] })).rejects.toThrow(/no such hit/);
    expect(await readFile(path, 'utf8')).toBe(before);
  });

  it('adds and removes on exactly one line, and reports what was already so', async () => {
    const { path, hits } = await sampleFile();
    const target = hits[1]!;
    const before = (await readFile(path, 'utf8')).split('\n');

    const first = await applyTagFile(path, { id: target.id, add: ['subject:desk-test'], remove: ['tone:absent'] });
    expect(first).toMatchObject({ added: ['subject:desk-test'], removed: [], unchanged: ['tone:absent'] });
    const after = (await readFile(path, 'utf8')).split('\n');
    expect(after.filter((line, i) => line !== before[i])).toHaveLength(1);
    expect(JSON.parse(after[1]!).tags).toEqual([...target.tags, 'subject:desk-test']);

    const second = await applyTagFile(path, { id: target.id, add: ['note:checked by the desk test'], remove: ['subject:desk-test'] });
    expect(second).toMatchObject({ added: ['note:checked by the desk test'], removed: ['subject:desk-test'] });
    expect(JSON.parse((await readFile(path, 'utf8')).split('\n')[1]!).tags).toEqual([...target.tags, 'note:checked by the desk test']);

    const again = await applyTagFile(path, { id: target.id, add: ['note:checked by the desk test'], remove: [] });
    expect(again.unchanged).toEqual(['note:checked by the desk test']);
  });
});
