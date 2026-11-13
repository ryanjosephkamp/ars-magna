import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { HIT_STATUSES, SCHEMA_DIR, toJsonl, type Hit } from '../src/schema.ts';
import { applyStatus, parseSetArgs, setStatus } from '../src/set.ts';

const hit = (id: string, over: Partial<Hit> = {}): Hit => {
  const [input, category, words] = id.split(':') as [string, Hit['category'], string];
  const list = words.split('-');
  return {
    id,
    input,
    category,
    words: list,
    display: list.join(' '),
    letters: [...list.join('')].sort().join(''),
    prefilter_score: 0,
    judge: [],
    added: '2026-09-12',
    dictionary: { repo: 'ryanjosephkamp/english-openlist', rev: '368bf0e4460461c985fca8bde49e4062d56c1516' },
    tier: 'common',
    tags: [],
    status: 'proposed',
    ...over,
  };
};

const fixtures = () => [
  hit('dormitory:phrases:dirty-room', { status: 'accepted' }),
  hit('rememberme:titles:member-mere'),
  hit('kindle:products:linked'),
];

describe('hits:set arguments', () => {
  it('reads the status and the ids, once each', () => {
    expect(parseSetArgs(['--status=featured', 'a:phrases:b', 'c:titles:d', 'a:phrases:b'])).toEqual({
      status: 'featured',
      ids: ['a:phrases:b', 'c:titles:d'],
    });
  });

  it('refuses a missing or unknown status, no ids, and a stray option', () => {
    expect(() => parseSetArgs(['a:phrases:b'])).toThrow(/--status is required/);
    expect(() => parseSetArgs(['--status=published', 'a:phrases:b'])).toThrow(/unknown status "published"/);
    expect(() => parseSetArgs(['--status=accepted'])).toThrow(/at least one hit id/);
    expect(() => parseSetArgs(['--status=accepted', '--dry-run', 'a:phrases:b'])).toThrow(/unknown option --dry-run/);
  });

  it('knows exactly the statuses the schema allows', async () => {
    const schema = JSON.parse(await readFile(resolve(SCHEMA_DIR, 'hit.schema.json'), 'utf8')) as {
      properties: { status: { enum: string[] } };
    };
    expect([...HIT_STATUSES]).toEqual(schema.properties.status.enum);
  });
});

describe('setStatus', () => {
  it('changes only the named hits, keeps the order, and says what was already set', () => {
    const before = fixtures();
    const { hits, changed, unchanged } = setStatus(
      before,
      ['kindle:products:linked', 'dormitory:phrases:dirty-room'],
      'accepted',
    );
    expect(hits.map((h) => [h.id, h.status])).toEqual([
      ['dormitory:phrases:dirty-room', 'accepted'],
      ['rememberme:titles:member-mere', 'proposed'],
      ['kindle:products:linked', 'accepted'],
    ]);
    expect(changed).toEqual([{ id: 'kindle:products:linked', from: 'proposed', to: 'accepted' }]);
    expect(unchanged).toEqual(['dormitory:phrases:dirty-room']);
    expect(before[2]!.status).toBe('proposed');
  });

  it('names every id that is not a hit and changes nothing', () => {
    expect(() => setStatus(fixtures(), ['kindle:products:linked', 'nope:phrases:x', 'also:titles:y'], 'retired')).toThrow(
      'no such hit: nope:phrases:x, also:titles:y',
    );
  });
});

describe('applyStatus', () => {
  it('rewrites only the changed line, and leaves the file alone when nothing changes or an id is wrong', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'hits-set-'));
    const path = join(dir, 'hits.jsonl');
    await writeFile(path, toJsonl(fixtures()));
    const original = (await readFile(path, 'utf8')).split('\n');

    const result = await applyStatus(path, ['rememberme:titles:member-mere'], 'featured');
    expect(result.changed).toHaveLength(1);
    const after = (await readFile(path, 'utf8')).split('\n');
    expect(after.filter((line, i) => line !== original[i])).toEqual([
      JSON.stringify(hit('rememberme:titles:member-mere', { status: 'featured' })),
    ]);

    const settled = await readFile(path, 'utf8');
    expect((await applyStatus(path, ['rememberme:titles:member-mere'], 'featured')).changed).toEqual([]);
    await expect(applyStatus(path, ['missing:phrases:x'], 'accepted')).rejects.toThrow(/no such hit/);
    expect(await readFile(path, 'utf8')).toBe(settled);
  });
});
