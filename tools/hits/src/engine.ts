/**
 * The real engine, under Node.
 *
 * The same worker core the site runs, booted the way the engine tests boot
 * it: the WASM bytes are handed over directly and the dictionary is read off
 * disk through a file-backed `fetch`. Node has no `caches` global, so the
 * engine's Cache Storage path falls through cleanly.
 */
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { EngineCore } from '@ars-magna/engine/core';
import type { Response as EngineResponse, Tier } from '@ars-magna/engine/protocol';

import { REPO_ROOT } from './schema.ts';

const DICT_DIR = resolve(REPO_ROOT, 'apps/web/public/dict');
const WASM_PATH = resolve(REPO_ROOT, 'packages/engine/src/wasm/anagram_bg.wasm');

class Port {
  messages: EngineResponse[] = [];
  post = (message: EngineResponse): void => {
    this.messages.push(message);
  };
  take<K extends EngineResponse['k']>(kind: K): Extract<EngineResponse, { k: K }> {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const m = this.messages[i]!;
      if (m.k === kind) {
        this.messages.length = 0;
        return m as Extract<EngineResponse, { k: K }>;
      }
      if (m.k === 'error') {
        this.messages.length = 0;
        throw new Error(m.message);
      }
    }
    throw new Error(`engine sent no ${kind}`);
  }
}

const fileFetch: typeof fetch = async (input) => {
  const url = typeof input === 'string' ? input : String(input);
  const body = await readFile(resolve(DICT_DIR, url.replace(/^\/dict\//, '')));
  return new Response(body as unknown as BodyInit, { status: 200 });
};

export class Engine {
  #core: EngineCore;
  #port: Port;
  #id = 100;

  private constructor(core: EngineCore, port: Port) {
    this.#core = core;
    this.#port = port;
  }

  static async boot(): Promise<Engine> {
    if (!existsSync(WASM_PATH)) {
      throw new Error(`no engine at ${WASM_PATH}\n  run \`pnpm wasm:build\` first`);
    }
    if (!existsSync(resolve(DICT_DIR, 'manifest.json'))) {
      throw new Error(`no dictionary at ${DICT_DIR}\n  run \`pnpm dict:fetch && pnpm dict:build\` first`);
    }
    const port = new Port();
    const core = new EngineCore(port, { wasmInput: await readFile(WASM_PATH), fetchImpl: fileFetch });
    await core.handle({ k: 'init', id: 1, baseUrl: '/dict' });
    port.take('ready');
    return new Engine(core, port);
  }

  /** Whether `word` exists at `tier`. */
  async has(word: string, tier: Tier): Promise<boolean> {
    await this.#core.handle({ k: 'lookup', id: this.#id++, word, tier });
    return this.#port.take('lookup').found;
  }

  /** The first `first` results and the exact (or floor) total. */
  async solve(
    input: string,
    options: { tier: Tier; minWordLen: number; maxWords: number; mustInclude?: string[] },
    first: number,
  ): Promise<{ total: string; rows: string[][] }> {
    await this.#core.handle({
      k: 'solve',
      id: this.#id++,
      query: {
        input,
        tier: options.tier,
        minWordLen: options.minWordLen,
        maxWords: options.maxWords,
        mustInclude: options.mustInclude ?? [],
      },
      first,
    });
    const messages = this.#port.messages.slice();
    this.#port.messages.length = 0;
    const error = messages.find((m) => m.k === 'error');
    if (error && error.k === 'error') throw new Error(error.message);
    const count = messages.find((m) => m.k === 'count');
    const rows = messages.flatMap((m) => (m.k === 'batch' ? m.rows.map((r) => [...r]) : []));
    return { total: count && count.k === 'count' ? count.total : '0', rows };
  }

  /** Result `index` by unranking. */
  async nth(index: bigint): Promise<string[] | null> {
    await this.#core.handle({ k: 'random', id: this.#id++, index: index.toString() });
    const batch = this.#port.take('batch');
    return batch.rows[0] ? [...batch.rows[0]] : null;
  }

  async spellings(word: string, tier: Tier): Promise<string[]> {
    await this.#core.handle({ k: 'spellings', id: this.#id++, word, tier });
    return [...this.#port.take('spellings').words];
  }
}
