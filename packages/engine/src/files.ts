/**
 * The site's public folders off disk, for code under Node.
 *
 * Kept apart from `node.ts` because that module loads the WASM build, and a
 * reader of the definition shards needs none: the judge routine's sandbox has
 * no engine, yet writes each word's gloss into the judge's input.
 */
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(here, '../../..');
export const DICT_DIR = resolve(REPO_ROOT, 'apps/web/public/dict');
export const DEFS_DIR = resolve(REPO_ROOT, 'apps/web/public/defs');

/** Serves a public folder off disk with the signature of `fetch`. */
export function fileFetch(root: string, prefix: string | RegExp): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    try {
      const body = await readFile(resolve(root, url.replace(prefix, '')));
      return new Response(body as unknown as BodyInit, { status: 200 });
    } catch {
      return new Response(null, { status: 404 });
    }
  }) as typeof fetch;
}
