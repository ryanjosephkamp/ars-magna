/**
 * The engine-backed anagram check, under Node, against the real dictionary.
 */
import { describe, expect, it, beforeAll } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { Engine } from '../src/engine.ts';
import { checkAnagram, sameLetters } from '../src/check.ts';
import { REPO_ROOT } from '../src/schema.ts';

const built =
  existsSync(resolve(REPO_ROOT, 'packages/engine/src/wasm/anagram_bg.wasm')) &&
  existsSync(resolve(REPO_ROOT, 'apps/web/public/dict/manifest.json'));

describe('sameLetters', () => {
  it('folds before comparing', () => {
    expect(sameLetters('Beyoncé', ['obey', 'enc'])).toBe(true);
    expect(sameLetters('dormitory', ['dirty', 'rooms'])).toBe(false);
  });
});

describe.skipIf(!built)('checkAnagram', () => {
  let engine: Engine;
  beforeAll(async () => {
    engine = await Engine.boot();
  });

  it('accepts a real anagram and names what is wrong otherwise', async () => {
    expect(await checkAnagram(engine, 'dormitory', ['dirty', 'room'], 'common')).toEqual({ ok: true });
    expect(await checkAnagram(engine, 'Dormitory!', ['room', 'dirty'], 'standard')).toEqual({ ok: true });

    const letters = await checkAnagram(engine, 'dormitory', ['dirty', 'rooms'], 'standard');
    expect(letters.ok).toBe(false);
    expect(!letters.ok && letters.reason).toMatch(/letters differ/);

    const word = await checkAnagram(engine, 'dormitory', ['dirt', 'yroom'], 'standard');
    expect(word.ok).toBe(false);
    expect(!word.ok && word.reason).toMatch(/"yroom" is not/);

    // Tier matters: a machine-generated word exists only at Full.
    expect((await checkAnagram(engine, 'abacteremicer', ['abacteremicer'], 'standard')).ok).toBe(false);
    expect((await checkAnagram(engine, 'abacteremicer', ['abacteremicer'], 'full')).ok).toBe(true);
  });

  it('solves and unranks through the same engine', async () => {
    const { total, rows } = await engine.solve('dormitory', { tier: 'common', minWordLen: 3, maxWords: 2 }, 50);
    expect(Number(total)).toBeGreaterThan(0);
    expect(rows.map((r) => [...r].sort().join(' '))).toContain('dirty room');
    const first = await engine.nth(0n);
    expect(first).not.toBeNull();
  });
});
