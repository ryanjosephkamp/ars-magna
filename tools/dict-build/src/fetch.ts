/**
 * Downloads the pinned sources into `.cache/`, verifying sha256 as it streams.
 *
 * Content-addressed by revision, so bumping a pin is additive and rolling back
 * costs nothing. Re-running is a no-op once the hashes match.
 */
import { createHash } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir, rename, stat, readFile, writeFile } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { dirname } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  FREQUENCY,
  OPENLIST,
  WORDNET,
  frequencyUrl,
  openlistUrl,
  sourcesReleaseUrl,
  type FilePin,
} from './pins.ts';
import {
  FREQ_PATH,
  META_PATH,
  OPENLIST_CACHE,
  WORDS_PATH,
  FREQ_CACHE,
  WORDNET_ARCHIVE,
  WORDNET_CACHE,
  WORDNET_DICT,
} from './paths.ts';

const run = promisify(execFile);

function human(bytes: number): string {
  return bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${(bytes / 1e3).toFixed(0)} KB`;
}

async function alreadyGood(path: string, expectBytes: number, expectSha?: string): Promise<boolean> {
  try {
    const info = await stat(path);
    if (info.size !== expectBytes) return false;
    if (!expectSha) return true;
    const actual = createHash('sha256')
      .update(await readFile(path))
      .digest('hex');
    return actual === expectSha;
  } catch {
    return false;
  }
}

/**
 * Open `url`, or the first of `fallbacks` that answers when it does not.
 *
 * The pinned OpenList revision vanished from the Hub when the dataset's
 * history was rewritten, so a primary that 404s is a real case, not a
 * hypothetical. Every source is held to the same size and sha256 check
 * afterwards, so a fallback cannot smuggle in different bytes.
 */
async function open(url: string, fallbacks: readonly string[]): Promise<Response> {
  const failures: string[] = [];
  for (const candidate of [url, ...fallbacks]) {
    try {
      const response = await fetch(candidate, { redirect: 'follow' });
      if (response.ok && response.body) {
        if (candidate !== url) console.log(`    primary unavailable; using ${candidate}`);
        return response;
      }
      failures.push(`${candidate} -> HTTP ${response.status}`);
    } catch (error) {
      failures.push(`${candidate} -> ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw new Error(failures.join('\n  '));
}

async function download(
  url: string,
  dest: string,
  expectBytes: number,
  expectSha?: string,
  fallbacks: readonly string[] = [],
): Promise<void> {
  const label = dest.split('/').pop();

  if (await alreadyGood(dest, expectBytes, expectSha)) {
    console.log(`  ✓ ${label} — cached (${human(expectBytes)})`);
    return;
  }

  console.log(`  ↓ ${label} — ${human(expectBytes)}`);
  await mkdir(dirname(dest), { recursive: true });

  const response = await open(url, fallbacks);

  const hash = createHash('sha256');
  const partial = `${dest}.part`;

  await pipeline(
    Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]),
    async function* (source) {
      for await (const chunk of source) {
        hash.update(chunk as Uint8Array);
        yield chunk;
      }
    },
    createWriteStream(partial),
  );

  const digest = hash.digest('hex');
  if (expectSha && digest !== expectSha) {
    throw new Error(
      `integrity check failed for ${label}\n  expected ${expectSha}\n  actual   ${digest}\n` +
        `The pinned revision may have been rewritten. Do not proceed without reviewing it.`,
    );
  }

  const info = await stat(partial);
  if (info.size !== expectBytes) {
    throw new Error(`${label}: expected ${expectBytes} bytes, got ${info.size}`);
  }

  await rename(partial, dest);
  console.log(`    sha256 ${digest.slice(0, 16)}… ✓`);
}

export async function fetchAll(): Promise<void> {
  console.log(`Fetching pinned sources`);
  console.log(`  openlist  ${OPENLIST.repo}@${OPENLIST.rev.slice(0, 12)}`);
  console.log(`  frequency ${FREQUENCY.repo}@${FREQUENCY.rev.slice(0, 12)}`);

  await mkdir(OPENLIST_CACHE, { recursive: true });
  await mkdir(FREQ_CACHE, { recursive: true });

  const files: [FilePin, string][] = [
    [OPENLIST.files.words, WORDS_PATH],
    [OPENLIST.files.meta, META_PATH],
  ];
  for (const [pin, dest] of files) {
    await download(openlistUrl(pin), dest, pin.bytes, pin.sha256, [sourcesReleaseUrl(pin)]);
  }

  await download(frequencyUrl(), FREQ_PATH, FREQUENCY.bytes);

  await mkdir(WORDNET_CACHE, { recursive: true });
  await download(WORDNET.url, WORDNET_ARCHIVE, WORDNET.bytes, WORDNET.sha256);

  // The glosses, the sense index and the morphology exceptions are all needed:
  // `wordnet.ts` reads the `.exc` files, which is how `men` reaches `man`. Only
  // what the archive carries beyond them, such as the verb framesets, goes
  // unread, and those are not extracted.
  const needed = await Promise.all(
    WORDNET.members.map((member) =>
      stat(`${WORDNET_CACHE}/${member}`).then(
        () => true,
        () => false,
      ),
    ),
  );
  if (needed.some((present) => !present)) {
    console.log(`  ⇢ extracting ${WORDNET.members.length} WordNet files`);
    await run('tar', ['-xzf', WORDNET_ARCHIVE, '-C', WORDNET_CACHE, ...WORDNET.members]);
  } else {
    console.log(`  ✓ wordnet — extracted (${WORDNET_DICT})`);
  }

  await writeFile(
    `${OPENLIST_CACHE}/.integrity.json`,
    `${JSON.stringify({ rev: OPENLIST.rev, verifiedAt: new Date().toISOString() }, null, 2)}\n`,
  );

  console.log('Done.');
}

if (import.meta.filename === process.argv[1]) {
  await fetchAll();
}
