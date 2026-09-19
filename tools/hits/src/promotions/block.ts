/**
 * `pnpm promotions:block <key>` or `pnpm promotions:block --code=<sha256>`
 *
 * Blocks a promoted anagram (voting plan R10): appends its code to
 * data/promotions/blocks.jsonl, never its words. Once the pull request that
 * adds it is merged and deployed, the API refuses its promotions and leaves
 * them out of the counts, the search page and Build hide its Promote and
 * Submit, the export leaves it out of the public counts, and the review skips
 * it. Its promotions stay in the database, and no vote is made from them.
 *
 * The key is the letters sorted, a colon, and the words sorted and joined with
 * hyphens, as the private export and the review desk show it; `--code` takes
 * the code itself. It prints the code only.
 */
import { appendFile } from 'node:fs/promises';

import { flag } from '../queue.ts';
import { today } from '../schema.ts';
import { BLOCKS_PATH, failQuietly, keySha256, readBlocks, shortCode, validators } from './files.ts';

const KEY = /^[a-z]+:[a-z]+(-[a-z]+)*$/;
const CODE = /^[0-9a-f]{64}$/;

/** The code a block names: from `--code`, or from a key. Throws on anything else. */
export async function blockCode(argv: readonly string[]): Promise<string> {
  const code = flag(argv, 'code');
  if (code !== undefined) {
    if (!CODE.test(code)) throw new Error('--code must be 64 lowercase hex characters');
    return code;
  }
  const key = argv.find((a) => !a.startsWith('--'));
  if (!key || !KEY.test(key)) throw new Error('name the key (letters:words-sorted-with-hyphens) or --code=<sha256>');
  return keySha256(key);
}

async function main(argv: readonly string[]): Promise<void> {
  const code = await blockCode(argv);
  const blocks = await readBlocks();
  if (blocks.some((b) => b.key_sha256 === code)) {
    console.log(`promotions:block: ${shortCode(code)} is blocked already; nothing written.`);
    return;
  }
  const line = { key_sha256: code, blocked: today() };
  const valid = await validators.block();
  if (!valid(line)) throw new Error('the block does not fit its schema');
  await appendFile(BLOCKS_PATH, `${JSON.stringify(line)}\n`);
  console.log(`promotions:block: blocked ${shortCode(code)}. Commit data/promotions/blocks.jsonl in a pull request; it takes effect once deployed.`);
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  const argv = process.argv.slice(2);
  await main(argv).catch((error: unknown) => {
    // A mistyped key is the operator's own; say what is wrong with it.
    if (error instanceof Error && /^(--code|name the key)/.test(error.message)) {
      console.error(`promotions:block: ${error.message}`);
      process.exit(1);
    }
    failQuietly('promotions:block', argv)(error);
  });
}
