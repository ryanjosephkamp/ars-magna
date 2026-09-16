import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import type { Verdict } from '../src/judge.ts';
import {
  acceptCommand,
  fromVerdicts,
  mergeRequests,
  readRequests,
  renderRequests,
  requested,
  writeRequests,
  type WordRequest,
} from '../src/requests.ts';

const request = (over: Partial<WordRequest> = {}): WordRequest => ({
  word: 'doomer',
  source: 'judge',
  from: '2026-09-16 · x:people:y',
  why: 'The input needed it and the anagram reached for something worse.',
  seen: '2026-09-16',
  status: 'open',
  ...over,
});

const verdict = (over: Record<string, unknown> = {}): Verdict =>
  ({ id: 'a:people:b', relation: 2, reads: 2, rationale: 'no link', ...over }) as Verdict;

describe('reading and writing requests', () => {
  it('treats a missing file as no requests, and round-trips what it writes', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ars-magna-requests-'));
    const path = join(dir, 'requests.jsonl');
    expect(await readRequests(path)).toEqual([]);

    const list = [request(), request({ word: 'rizz', status: 'declined' })];
    await writeRequests(list, path);
    expect(await readRequests(path)).toEqual(list);
    expect(requested(list)).toEqual(new Set(['doomer', 'rizz']));
  });

  it('refuses a line the schema does not accept, naming the line', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ars-magna-requests-bad-'));
    const path = join(dir, 'requests.jsonl');

    await writeFile(path, JSON.stringify({ ...request(), word: 'Doomer' }) + '\n');
    await expect(readRequests(path)).rejects.toThrow(/:1:/);

    await writeFile(path, JSON.stringify({ ...request(), status: 'accepted' }) + '\n');
    await expect(readRequests(path)).rejects.toThrow(/:1:/);

    await writeFile(path, 'not json\n');
    await expect(readRequests(path)).rejects.toThrow(/:1: not JSON/);
  });
});

describe('merging proposals', () => {
  it('refuses a word already in the vocabulary, already requested, or malformed', () => {
    const existing = [request({ word: 'rizz' }), request({ word: 'skibidi', status: 'declined' })];
    const proposed = [
      request({ word: 'doomer' }),
      request({ word: 'house' }), // already a real word
      request({ word: 'rizz' }), // already open
      request({ word: 'skibidi' }), // already declined
      request({ word: 'Doomer' }), // malformed
    ];
    const { next, added, refused } = mergeRequests(existing, proposed, new Set(['house']));

    expect(added.map((r) => r.word)).toEqual(['doomer']);
    expect(next).toHaveLength(3);
    expect(refused).toEqual([
      { word: 'house', reason: 'already in the vocabulary' },
      { word: 'rizz', reason: 'already requested' },
      { word: 'skibidi', reason: 'already requested' },
      { word: 'Doomer', reason: 'not a plain lowercase word' },
    ]);
  });

  it('never proposes a declined word again, which is the point of keeping them', () => {
    const declined = [request({ word: 'doomer', status: 'declined' })];
    const { added } = mergeRequests(declined, [request({ word: 'doomer' })], new Set());
    expect(added).toEqual([]);
  });

  it('takes the first of two proposals for the same word in one batch', () => {
    const { added } = mergeRequests([], [request({ why: 'first' }), request({ why: 'second' })], new Set());
    expect(added).toHaveLength(1);
    expect(added[0]!.why).toBe('first');
  });
});

describe('requests from verdicts', () => {
  it('takes a well-formed request and leaves the verdict alone', () => {
    const { requests, skipped } = fromVerdicts(
      [
        verdict(),
        verdict({
          id: 'c:people:d',
          request: { word: ' Doomer ', gloss: 'A person who expects catastrophe.', trace: 'https://en.wiktionary.org/wiki/doomer', why: 'it would have made this work' },
        }),
      ],
      '2026-09-16',
      '2026-09-16',
    );
    expect(skipped).toEqual([]);
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      word: 'doomer',
      source: 'judge',
      from: '2026-09-16 · c:people:d',
      gloss: 'A person who expects catastrophe.',
      status: 'open',
    });
  });

  it('skips a malformed request rather than losing the judgement it rode in on', () => {
    const { requests, skipped } = fromVerdicts(
      [
        verdict({ id: 'a', request: 'doomer' }),
        verdict({ id: 'b', request: { word: 'two words', why: 'x' } }),
        verdict({ id: 'c', request: { word: 'doomer' } }),
        verdict({ id: 'd', request: { word: 'doomer', why: '   ' } }),
      ],
      'q',
      '2026-09-16',
    );
    expect(requests).toEqual([]);
    expect(skipped.map((s) => s.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('ignores a v1 verdict, which has no request field at all', () => {
    const v1 = { id: 'a', aptness: 3, grammar: 3, memorability: 3, rationale: 'x' } as Verdict;
    expect(fromVerdicts([v1], 'q', '2026-09-16').requests).toEqual([]);
  });
});

describe('the report section', () => {
  it('says nothing when there is nothing', () => {
    expect(renderRequests([], [])).toEqual([]);
  });

  it('warns that a proposed trace is unverified, and gives the command to accept', () => {
    const added = [request({ gloss: 'A person who expects catastrophe.', trace: 'https://en.wiktionary.org/wiki/doomer' })];
    const text = renderRequests(added, added).join('\n');
    expect(text).toContain('unverified');
    expect(text).toContain('pnpm vocab:add doomer');
    expect(text).toContain('accept it by name');
  });

  it('names requests still open from earlier queues without repeating the new ones', () => {
    const added = [request({ word: 'doomer' })];
    const open = [...added, request({ word: 'rizz' }), request({ word: 'skibidi', status: 'declined' })];
    const text = renderRequests(added, open).join('\n');
    expect(text).toContain('Still open from earlier queues: `rizz`.');
    expect(text).not.toContain('skibidi');
  });

  it('quotes a gloss so a command with an apostrophe still runs', () => {
    const command = acceptCommand(request({ gloss: "What a doomer's day looks like." }));
    expect(command).toContain('--gloss="What a doomer\'s day looks like."');
  });
});
