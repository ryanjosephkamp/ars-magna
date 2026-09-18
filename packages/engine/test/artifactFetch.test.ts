/**
 * How the engine chooses between an artifact and its pre-compressed sibling.
 *
 * The dictionary is served as `application/octet-stream`, which Cloudflare does
 * not compress on the fly, so the build ships a `.br` beside every artifact and
 * the host declares `Content-Encoding: br` on it. That header is the fragile
 * part: if it goes missing the browser hands over raw brotli and nothing
 * complains — the bytes just fail to decode somewhere deep in Rust.
 *
 * So the engine checks the decoded length against the manifest and falls back.
 * These tests drive all three cases through the real core, because the failure
 * being guarded against is silent by nature.
 */
import { describe, expect, it, beforeAll } from 'vitest';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { brotliCompressSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { EngineCore } from '../src/engineCore.ts';
import type { Response as EngineResponse } from '../src/protocol.ts';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');
const dictDir = resolve(repoRoot, 'apps/web/public/dict');
const wasmPath = resolve(repoRoot, 'packages/engine/src/wasm/anagram_bg.wasm');

const built = existsSync(resolve(dictDir, 'manifest.json')) && existsSync(wasmPath);

type Mode =
  /** The host sets Content-Encoding, so the browser hands over decoded bytes. */
  | 'decoded'
  /** The host forgot the header, so `.br` arrives as an opaque brotli stream. */
  | 'undeclared'
  /** No sibling was deployed at all. */
  | 'missing';

/**
 * Serves the real dictionary off disk, synthesising `.br` responses so the
 * fixtures cannot drift from the artifacts the engine actually parses.
 */
function makeFetch(mode: Mode) {
  const seen: string[] = [];

  const fetchImpl = (async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : String(input);
    seen.push(url);

    const name = url.replace(/^\/dict\//, '');
    if (name.endsWith('.br')) {
      if (mode === 'missing') return new Response(null, { status: 404 });
      const raw = await readFile(resolve(dictDir, name.slice(0, -3)));
      // 'decoded' mirrors what fetch() yields once the browser has applied
      // Content-Encoding; 'undeclared' is the same bytes still compressed.
      const body = mode === 'decoded' ? raw : brotliCompressSync(raw);
      return new Response(body as unknown as BodyInit, { status: 200 });
    }

    return new Response((await readFile(resolve(dictDir, name))) as unknown as BodyInit, {
      status: 200,
    });
  }) as typeof fetch;

  return { fetchImpl, seen };
}

class Collector {
  messages: EngineResponse[] = [];
  post = (message: EngineResponse) => void this.messages.push(message);
  last<K extends EngineResponse['k']>(kind: K): Extract<EngineResponse, { k: K }> | undefined {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const m = this.messages[i]!;
      if (m.k === kind) return m as Extract<EngineResponse, { k: K }>;
    }
    return undefined;
  }
}

async function boot(mode: Mode) {
  const { fetchImpl, seen } = makeFetch(mode);
  const port = new Collector();
  const core = new EngineCore(port, { wasmInput: await readFile(wasmPath), fetchImpl });
  await core.handle({ k: 'init', id: 1, baseUrl: '/dict' });
  return { port, seen, core };
}

describe.skipIf(!built)('artifact fetching', () => {
  let manifest: { files: Record<string, { name: string; bytes: number; brotliBytes?: number }> };

  beforeAll(async () => {
    manifest = JSON.parse(await readFile(resolve(dictDir, 'manifest.json'), 'utf8'));
  });

  it('the build ships a .br for every artifact the engine loads', () => {
    for (const key of ['full', 'tiers']) {
      const file = manifest.files[key]!;
      expect(file.brotliBytes, `${key} has no brotliBytes`).toBeGreaterThan(0);
      expect(existsSync(resolve(dictDir, `${file.name}.br`))).toBe(true);
      // Not worth the extra request if it were not actually smaller.
      expect(file.brotliBytes!).toBeLessThan(file.bytes);
    }
  });

  it('prefers the compressed sibling and never asks for the plain file', async () => {
    const { port, seen } = await boot('decoded');

    expect(port.last('ready')?.counts.full).toBe(378_844);
    expect(seen).toContain(`/dict/${manifest.files.full!.name}.br`);
    expect(seen).not.toContain(`/dict/${manifest.files.full!.name}`);
    expect(seen).not.toContain(`/dict/${manifest.files.tiers!.name}`);
  });

  it('falls back when the host serves brotli without declaring it', async () => {
    const { port, seen } = await boot('undeclared');

    // The point: still ready, still correct, just at full transfer size.
    expect(port.last('ready')?.counts.full).toBe(378_844);
    expect(port.last('error')).toBeUndefined();
    expect(seen).toContain(`/dict/${manifest.files.full!.name}.br`);
    expect(seen).toContain(`/dict/${manifest.files.full!.name}`);
  });

  it('falls back when no compressed sibling was deployed', async () => {
    const { port, seen } = await boot('missing');

    expect(port.last('ready')?.counts.full).toBe(378_844);
    expect(port.last('error')).toBeUndefined();
    expect(seen).toContain(`/dict/${manifest.files.full!.name}`);
  });

  it('a fallback load still solves correctly', async () => {
    const { core, port } = await boot('undeclared');
    await core.handle({
      k: 'solve',
      id: 2,
      query: { input: 'listen', tier: 'full', minWordLen: 2, maxWords: 2, mustInclude: [], mustExclude: [] },
      first: 50,
    });

    const rows = port.messages
      .filter((m): m is Extract<EngineResponse, { k: 'batch' }> => m.k === 'batch')
      .flatMap((b) => b.rows.map((r) => [...r].sort().join(' ')));

    expect(rows).toContain('listen');
    expect(rows).toContain('in lets');
  });
});
