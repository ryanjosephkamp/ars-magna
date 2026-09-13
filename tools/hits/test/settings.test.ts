/**
 * Settings s2: the presets `pnpm hits:enumerate` passes to `anagram batch`,
 * the short-word allowlist, and the settings version a queue records.
 */
import { describe, expect, it } from 'vitest';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { batchArgs } from '../src/enumerate.ts';
import { CANDIDATES_PATH } from '../src/schema.ts';
import { PRESETS, SETTINGS_VERSION, SHORT_WORDS_PATH, parseShortWords, presetFlag, queueSettings, readShortWords } from '../src/settings.ts';

describe('presets', () => {
  it('pass the routine preset to anagram batch, with the settings version and the allowlist', () => {
    const args = batchArgs([], '/queue/2026-09-14');
    expect(args).toEqual([
      'batch',
      `--in=${CANDIDATES_PATH}`,
      '--out=/queue/2026-09-14',
      `--settings=${SETTINGS_VERSION}`,
      '--tier=common',
      '--min-len=3',
      `--short-words=${SHORT_WORDS_PATH}`,
      '--max-words=5',
      '--spellings=all',
      '--expand-cap=64',
      `--limit=${PRESETS.routine.limit}`,
      `--sample=${PRESETS.routine.sample}`,
      '--seed=1',
      '--status=new',
    ]);
    expect(SETTINGS_VERSION).toBe('s2');
  });

  it('take the deep preset and explicit overrides, and refuse an unknown preset', () => {
    const args = batchArgs(['--preset=deep', '--sample=7', '--status=all'], '/q');
    expect(args).toContain(`--limit=${PRESETS.deep.limit}`);
    expect(args).toContain('--sample=7');
    expect(args).toContain('--status=all');
    expect(PRESETS.deep.perInput).toBe(300);
    expect(() => presetFlag('huge')).toThrow(/routine or deep/);
  });
});

describe('short words', () => {
  it('reads one word per line and ignores comments and blank lines', () => {
    expect([...parseShortWords('# list\na\n\nTo  # trailing\n  no\n')]).toEqual(['a', 'to', 'no']);
  });

  it('lists the everyday words the classics need and not the tournament ones', async () => {
    const allow = await readShortWords();
    for (const word of ['a', 'i', 'to', 'no', 'is', 'of', 'by', 'it']) expect(allow.has(word), word).toBe(true);
    for (const word of ['qi', 'za', 'xu', 'aa']) expect(allow.has(word), word).toBe(false);
    expect([...allow].every((w) => w.length < 3)).toBe(true);
  });
});

describe('queue settings', () => {
  it('reads the version from summary.json: s1 before the field existed, today without a summary', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ars-magna-settings-'));
    expect(await queueSettings(dir)).toBe(SETTINGS_VERSION);
    await writeFile(join(dir, 'summary.json'), JSON.stringify({ tier: 'standard', candidates: [] }));
    expect(await queueSettings(dir)).toBe('s1');
    await writeFile(join(dir, 'summary.json'), JSON.stringify({ settings: 's2', candidates: [] }));
    expect(await queueSettings(dir)).toBe('s2');
  });
});
