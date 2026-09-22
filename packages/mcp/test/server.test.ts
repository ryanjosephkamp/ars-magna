/**
 * Drives the server through a real MCP client over an in-memory transport,
 * against the real engine and shards. Skipped when the engine is not built.
 */
import { describe, expect, it, beforeAll } from 'vitest';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

import { DICT_DIR, REPO_ROOT } from '@ars-magna/engine/node';
import { createServer } from '../src/server.ts';

const built =
  existsSync(resolve(REPO_ROOT, 'packages/engine/src/wasm/anagram_bg.wasm')) && existsSync(resolve(DICT_DIR, 'manifest.json'));

type ToolResult = { content: { type: string; text?: string }[] };
const parse = (result: unknown) => JSON.parse((result as ToolResult).content[0]!.text!) as Record<string, unknown>;

describe.skipIf(!built)('ars-magna MCP server', () => {
  let client: Client;
  let scratch: string;

  beforeAll(async () => {
    scratch = await mkdtemp(join(tmpdir(), 'mcp-'));
    const server = createServer({ paths: { candidates: join(scratch, 'c.jsonl'), hits: join(scratch, 'h.jsonl') } });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: 'test', version: '0' });
    await client.connect(clientTransport);
  });

  it('lists the five tools', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(['count', 'explain_word', 'nth', 'propose_hit', 'solve']);
  });

  it('solves, counts, and unranks consistently', async () => {
    const solved = parse(await client.callTool({ name: 'solve', arguments: { input: 'dormitory', tier: 'common', maxWords: 2, first: 100 } }));
    expect(solved['letters']).toBe('dimoorrty');
    expect(solved['results']).toContain('dirty room');
    const counted = parse(await client.callTool({ name: 'count', arguments: { input: 'dormitory', tier: 'common', maxWords: 2 } }));
    expect(counted['total']).toBe(solved['total']);
    const nth = parse(await client.callTool({ name: 'nth', arguments: { input: 'dormitory', index: '0', tier: 'common', maxWords: 2 } }));
    expect((solved['results'] as string[])[0]).toBe(nth['result']);

    // The text is never its own result, and the tools say when that took a row out.
    expect(solved['results']).not.toContain('dormitory');
    expect(solved['text_left_out']).toBe(true);
    expect(counted['text_left_out']).toBe(true);
    const apart = parse(await client.callTool({ name: 'solve', arguments: { input: 'dormitor y', tier: 'common', maxWords: 2, first: 100 } }));
    expect(apart['results']).toContain('dormitory');
    expect(apart['text_left_out']).toBe(false);
    expect(Number(apart['total'])).toBe(Number(solved['total']) + 1);
  });

  it('explains a word with a gloss, provenance and its spellings', async () => {
    const info = parse(await client.callTool({ name: 'explain_word', arguments: { word: 'Listen', tier: 'standard' } }));
    expect(info['inDictionary']).toBe(true);
    expect((info['senses'] as unknown[]).length).toBeGreaterThan(0);
    expect(info['spellings']).toEqual(expect.arrayContaining(['listen', 'silent']));
    const generated = parse(await client.callTool({ name: 'explain_word', arguments: { word: 'abacteremicer', tier: 'full' } }));
    expect(generated['provenance']).toBe('generated');
  });

  it('proposes a real anagram and refuses a fake one', async () => {
    const bad = parse(await client.callTool({ name: 'propose_hit', arguments: { input: 'dormitory', category: 'phrases', words: ['dirty', 'rooms'] } }));
    expect(bad['ok']).toBe(false);
    expect(String(bad['reason'])).toMatch(/letters differ/);

    const good = parse(await client.callTool({ name: 'propose_hit', arguments: { input: 'Dormitory', category: 'phrases', words: ['Room', 'dirty'], rationale: 'the classic', justification: 'A dormitory is a room, and students keep it dirty.' } }));
    expect(good).toMatchObject({ ok: true, hit: 'dormitory:phrases:dirty-room', newCandidate: true, newHit: true });
    const hits = (await readFile(join(scratch, 'h.jsonl'), 'utf8')).trim().split('\n');
    expect(hits).toHaveLength(1);
    expect(JSON.parse(hits[0]!)).toMatchObject({ status: 'proposed', submitter: 'mcp', display: 'room dirty', justification: 'A dormitory is a room, and students keep it dirty.' });

    // Again is not new.
    const again = parse(await client.callTool({ name: 'propose_hit', arguments: { input: 'dormitory', category: 'phrases', words: ['dirty', 'room'] } }));
    expect(again).toMatchObject({ ok: true, newCandidate: false, newHit: false });
  });

  it('counts a digit as a character of the pool, records the reading on the candidate and the hit, and refuses a reading that would convert it', async () => {
    // The 4 is a character of the pool (the literal rule): as itself the letters alone are no anagram, and its name never fits.
    const plain = parse(await client.callTool({ name: 'propose_hit', arguments: { input: 'Reacher season 4', category: 'titles', words: ['as', 'one', 'searcher'] } }));
    expect(plain['ok']).toBe(false);
    expect(String(plain['reason'])).toMatch(/reacherseason4 vs/);
    const spelled = parse(await client.callTool({ name: 'propose_hit', arguments: { input: 'Reacher season 4', category: 'titles', words: ['four', 'as', 'one', 'searcher'] } }));
    expect(spelled['ok']).toBe(false);
    expect(String(spelled['reason'])).toMatch(/reacherseason4 vs/);
    const unfit = parse(await client.callTool({ name: 'propose_hit', arguments: { input: 'Reacher season 4', category: 'titles', words: ['as', 'one', 'searcher'], reading: { '4': 'year' } } }));
    expect(String(unfit['reason'])).toMatch(/reading: 4 cannot be read as year/);
    const good = parse(
      await client.callTool({
        name: 'propose_hit',
        arguments: { input: 'Reacher season 4', category: 'titles', words: ['as', 'one', 'searcher'], reading: { '4': 'drop' }, justification: 'A searcher, as Reacher is.' },
      }),
    );
    expect(good).toMatchObject({ ok: true, hit: 'reacherseason:titles:as-one-searcher', newCandidate: true, newHit: true });
    const candidates = (await readFile(join(scratch, 'c.jsonl'), 'utf8')).trim().split('\n').map((l) => JSON.parse(l) as Record<string, unknown>);
    const hits = (await readFile(join(scratch, 'h.jsonl'), 'utf8')).trim().split('\n').map((l) => JSON.parse(l) as Record<string, unknown>);
    expect(candidates.find((c) => c['id'] === 'reacherseason:titles')).toMatchObject({ reading: { '4': 'drop' } });
    expect(hits.find((h) => h['id'] === 'reacherseason:titles:as-one-searcher')).toMatchObject({ letters: 'aaceeehnorrss', reading: { '4': 'drop' } });
    expect(hits.find((h) => h['id'] === 'reacherseason:titles:as-one-searcher')).not.toHaveProperty('classes');
    // Solve reads the input the same way and says so; as itself, the count is zero and says why.
    const solved = parse(await client.callTool({ name: 'solve', arguments: { input: 'Reacher season 4', reading: { '4': 'drop' }, first: 1 } }));
    expect(solved).toMatchObject({ letters: 'aaceeehnorrss', reading: '4 left out', unused: '' });
    const itself = parse(await client.callTool({ name: 'count', arguments: { input: 'Reacher season 4' } }));
    expect(itself).toMatchObject({ total: '0', unused: '4' });
  });

  it('tries a leet reading and writes the character where the letter went, and records a word that carries one as leet', async () => {
    const solved = parse(await client.callTool({ name: 'solve', arguments: { input: 'Ke$ha', leet: ['$'], minWordLen: 2, first: 5 } }));
    expect(solved).toMatchObject({ total: '5', unused: '', leet: ['$'] });
    const results = solved['results'] as string[];
    expect(results).toHaveLength(5);
    for (const line of results) expect(line).toMatch(/\$.*\[.* leet, \$ as s\]$/);
    expect(results.some((line) => line.startsWith('$hake  ['))).toBe(true);
    // A hit made of it: the word as letters, the reading as the leet choice, the word tagged leet.
    const good = parse(
      await client.callTool({
        name: 'propose_hit',
        arguments: { input: 'Ke$ha', category: 'people', words: ['shake'], reading: { $: 's' }, classes: { shake: 'leet' }, justification: 'Kesha shakes it.' },
      }),
    );
    expect(good).toMatchObject({ ok: true, hit: 'kesha:people:shake', newCandidate: true, newHit: true });
    const hits = (await readFile(join(scratch, 'h.jsonl'), 'utf8')).trim().split('\n').map((l) => JSON.parse(l) as Record<string, unknown>);
    expect(hits.find((h) => h['id'] === 'kesha:people:shake')).toMatchObject({ letters: 'aehks', reading: { $: 's' }, classes: { shake: 'leet' } });
    // A class the dictionary does not carry the term in is refused, and so is a class on a plain word.
    const notTerm = parse(await client.callTool({ name: 'propose_hit', arguments: { input: 'Blink-182', category: 'titles', words: ['1', '2', 'link', 'b8'], classes: { '1': 'shorthand', '2': 'shorthand', b8: 'acronyms' } } }));
    expect(notTerm).toMatchObject({ ok: false });
    expect(String(notTerm['reason'])).toMatch(/not a term of acronyms/);
    // The same terms under the classes the files list them in (N4) are accepted, and the hit carries them.
    const termed = parse(await client.callTool({ name: 'propose_hit', arguments: { input: 'Blink-182', category: 'titles', words: ['1', '2', 'link', 'b8'], classes: { '1': 'shorthand', '2': 'shorthand', b8: 'blends' }, justification: 'A link, baited.' } }));
    expect(termed).toMatchObject({ ok: true, newHit: true });
    const withTerms = (await readFile(join(scratch, 'h.jsonl'), 'utf8')).trim().split('\n').map((l) => JSON.parse(l) as Record<string, unknown>);
    expect(withTerms.find((h) => h['id'] === String(termed['hit']))).toMatchObject({ classes: { '1': 'shorthand', '2': 'shorthand', b8: 'blends' } });
    const wordClassed = parse(await client.callTool({ name: 'propose_hit', arguments: { input: 'dormitory', category: 'phrases', words: ['dirty', 'room'], classes: { room: 'slang' } } }));
    expect(String(wordClassed['reason'])).toMatch(/"room" is a word of the standard dictionary, so it has no class/);
  });

  it('records what the input is on the candidate and the hit, and a rationale as the justification rather than a note tag', async () => {
    const refused = parse(await client.callTool({ name: 'propose_hit', arguments: { input: 'Listen', category: 'phrases', words: ['silent'], about: 'no full stop' } }));
    expect(refused).toMatchObject({ ok: false });
    expect(String(refused['reason'])).toMatch(/about: .*full stop/);

    const good = parse(
      await client.callTool({
        name: 'propose_hit',
        arguments: { input: 'Listen', category: 'phrases', words: ['silent'], rationale: 'To listen, be silent.', about: 'To listen is to pay attention to sound.' },
      }),
    );
    expect(good).toMatchObject({ ok: true, hit: 'listen:phrases:silent', newCandidate: true, newHit: true, about: 'To listen is to pay attention to sound.' });
    const candidates = (await readFile(join(scratch, 'c.jsonl'), 'utf8')).trim().split('\n').map((l) => JSON.parse(l) as Record<string, unknown>);
    const hits = (await readFile(join(scratch, 'h.jsonl'), 'utf8')).trim().split('\n').map((l) => JSON.parse(l) as Record<string, unknown>);
    expect(candidates.find((c) => c['id'] === 'listen:phrases')).toMatchObject({ about: 'To listen is to pay attention to sound.' });
    expect(hits.find((h) => h['id'] === 'listen:phrases:silent')).toMatchObject({
      about: 'To listen is to pay attention to sound.',
      justification: 'To listen, be silent.',
      tags: [],
    });

    // A second proposal for the same input never replaces its sentence, and a new hit of it carries that sentence.
    const second = parse(
      await client.callTool({ name: 'propose_hit', arguments: { input: 'Listen', category: 'phrases', words: ['tinsel'], about: 'Another sentence entirely.' } }),
    );
    expect(second).toMatchObject({ ok: true, newCandidate: false, newHit: true, about: 'To listen is to pay attention to sound.' });
  });
});
