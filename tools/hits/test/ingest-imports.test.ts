/**
 * `pnpm hits:ingest --no-engine-check` runs where there is no WASM build of
 * the engine: the judge routine's sandbox. Loading ingest must therefore not
 * load the engine; only the paths that boot it may. The mock throws the
 * moment anything imports the engine module.
 */
import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/engine.ts', () => {
  throw new Error('ingest loaded the engine at import time');
});

describe('ingest without the engine', () => {
  it('loads, so --no-engine-check works where the WASM build is missing', async () => {
    const ingest = await import('../src/ingest.ts');
    expect(typeof ingest.validateVerdicts).toBe('function');
    expect(typeof ingest.buildHits).toBe('function');
  });
});
