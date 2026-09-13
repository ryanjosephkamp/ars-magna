/**
 * The screen: phrases numbered into compact files, the model's answers
 * checked against them, and the kept phrases rebuilt into rows for the
 * judge. All on fixtures.
 */
import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { Prefiltered } from '../src/prefilter.ts';
import {
  SCREEN_PROMPT_PATH,
  applyScreen,
  chunkScreen,
  groupForScreen,
  parseScores,
  parseScreenInputs,
  parseScreenOutput,
  rebuildRows,
  renderScores,
  renderScreen,
  screenedCandidateIds,
  validateScreen,
  type ScreenGroup,
} from '../src/screen.ts';
import { readJudgedRows } from '../src/queue.ts';
import { batches } from '../src/judge.ts';

const row = (candidate: string, input: string, display: string, score: number): Prefiltered => ({
  id: `${candidate}:${display.split(' ').sort().join('-')}`,
  candidate_id: candidate,
  input,
  category: 'phrases',
  words: display.split(' '),
  display,
  letters: [...input.toLowerCase().replace(/[^a-z]/g, '')].sort().join(''),
  prefilter_score: score,
  tier: 'common',
  count: '100',
  index: '0',
  sampled: false,
});

const ROWS: Prefiltered[] = [
  row('thecountryside:phrases', 'The countryside', 'no city dust here', 9.5),
  row('thecountryside:phrases', 'The countryside', 'try decent housie', -2.25),
  row('listen:phrases', 'Listen', 'silent', 12),
  row('listen:phrases', 'Listen', 'enlist', 11),
  row('listen:phrases', 'Listen', 'tinsel', 10.5),
  row('listen:phrases', 'Listen', 'inlets', 3),
  row('ashoplifter:phrases', 'A shoplifter', 'has to pilfer', 8),
];

const sizes = (files: ReturnType<typeof chunkScreen>) =>
  files.map((parts) => parts.map((p) => `${p.group.candidate_id.split(':')[0]} ${p.from}-${p.to}`));

describe('screen files', () => {
  it('numbers each input from 1 and keeps an input that fits in one file together', () => {
    const groups = groupForScreen(ROWS);
    expect(groups.map((g) => [g.candidate_id, g.phrases.length])).toEqual([
      ['thecountryside:phrases', 2],
      ['listen:phrases', 4],
      ['ashoplifter:phrases', 1],
    ]);
    expect(sizes(chunkScreen(groups, 7))).toEqual([['thecountryside 1-2', 'listen 1-4', 'ashoplifter 1-1']]);
    // Listen fits in a file of 4, so it starts a new file rather than splitting.
    expect(sizes(chunkScreen(groups, 4))).toEqual([['thecountryside 1-2'], ['listen 1-4'], ['ashoplifter 1-1']]);
    // Bigger than a file: it continues from one file to the next.
    expect(sizes(chunkScreen(groups, 3))).toEqual([['thecountryside 1-2', 'listen 1-1'], ['listen 2-4'], ['ashoplifter 1-1']]);
    expect(chunkScreen(groups, 3).flat().reduce((n, p) => n + p.to - p.from + 1, 0)).toBe(ROWS.length);
  });

  it('renders compact text the parser reads back, merging an input split across files', async () => {
    const prompt = await readFile(SCREEN_PROMPT_PATH, 'utf8');
    expect(prompt).toContain('screen_version: v1');
    const groups = groupForScreen(ROWS);
    const files = chunkScreen(groups, 3);
    const texts = files.map((parts, i) => renderScreen(parts, prompt, i + 1, files.length));
    expect(texts[1]).toContain('## File 2 of 3: 3 phrases');
    expect(texts[1]).toContain('### listen:phrases\n\ninput: Listen\ncategory: phrases\nphrases 2 to 4 of 4\n\n2 enlist\n3 tinsel\n4 inlets');

    const sections = parseScreenInputs(texts);
    expect([...sections.keys()]).toEqual(['thecountryside:phrases', 'listen:phrases', 'ashoplifter:phrases']);
    const listen = sections.get('listen:phrases')!;
    expect(listen.input).toBe('Listen');
    expect([...listen.phrases.entries()]).toEqual([[1, 'silent'], [2, 'enlist'], [3, 'tinsel'], [4, 'inlets']]);

    const scores = parseScores(renderScores(groups));
    expect(scores.get('thecountryside:phrases')).toEqual([9.5, -2.25]);
  });
});

describe('screen answers', () => {
  const groups: ScreenGroup[] = groupForScreen(ROWS);
  const sections = parseScreenInputs([renderScreen(chunkScreen(groups, 100)[0]!, '# prompt', 1, 1)]);

  it('parses one JSON line per section out of a fenced or chatty answer', () => {
    const text = 'Here you go:\n```jsonl\n{"candidate_id": "listen:phrases", "keep": [1, 3]}\n```\n';
    expect(parseScreenOutput(text)).toEqual([{ candidate_id: 'listen:phrases', keep: [1, 3] }]);
  });

  it('names every problem: an unknown input, a number with no phrase, a bad list, an input with no answer', () => {
    const { problems } = validateScreen(
      [
        { candidate_id: 'listen:phrases', keep: [1, 9] },
        { candidate_id: 'nosuch:phrases', keep: [] },
        { candidate_id: 'ashoplifter:phrases', keep: ['1' as unknown as number] },
      ],
      sections,
    );
    expect(problems).toEqual([
      'listen:phrases: no phrase 9',
      'nosuch:phrases: not an input in these files',
      'ashoplifter:phrases: keep must be a list of phrase numbers',
      'thecountryside:phrases: no answer',
      'ashoplifter:phrases: no answer',
    ]);
  });

  it('merges two answers for one input and rebuilds the kept phrases as rows', () => {
    const { kept, problems } = validateScreen(
      [
        { candidate_id: 'listen:phrases', keep: [1] },
        { candidate_id: 'listen:phrases', keep: [3, 1] },
        { candidate_id: 'thecountryside:phrases', keep: [1] },
        { candidate_id: 'ashoplifter:phrases', keep: [] },
      ],
      sections,
    );
    expect(problems).toEqual([]);
    const rows = rebuildRows(sections, parseScores(renderScores(groups)), kept);
    expect(rows.map((r) => r.id)).toEqual(['thecountryside:phrases:city-dust-here-no', 'listen:phrases:silent', 'listen:phrases:tinsel']);
    const [countryside] = rows;
    expect(countryside).toEqual({
      id: 'thecountryside:phrases:city-dust-here-no',
      candidate_id: 'thecountryside:phrases',
      input: 'The countryside',
      category: 'phrases',
      words: ['no', 'city', 'dust', 'here'],
      display: 'no city dust here',
      letters: 'cdeehinorsttuy',
      prefilter_score: 9.5,
      tier: 'common',
    });
    expect(() => rebuildRows(sections, new Map([['listen:phrases', [1]]]), kept)).toThrow(/scores for/);
  });
});

describe('a screened queue on disk', () => {
  it('refuses to judge without answers, then writes screened.jsonl, which ingest reads in place of prefiltered.jsonl', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ars-magna-screen-'));
    const groups = groupForScreen(ROWS);
    const files = chunkScreen(groups, 3);
    for (let i = 0; i < files.length; i++) await writeFile(join(dir, `screen-input-${i + 1}.md`), renderScreen(files[i]!, '# prompt', i + 1, files.length));
    await writeFile(join(dir, 'screen-scores.txt'), renderScores(groups));
    await writeFile(join(dir, 'prefiltered.jsonl'), ROWS.map((r) => JSON.stringify(r)).join('\n') + '\n');

    await expect(applyScreen(dir)).rejects.toThrow(/answer every screen-input-N.md/);
    await writeFile(join(dir, 'screen-output.jsonl'), '{"candidate_id":"listen:phrases","keep":[2]}\n');
    await expect(applyScreen(dir)).rejects.toThrow(/thecountryside:phrases: no answer/);

    await writeFile(
      join(dir, 'screen-output.jsonl'),
      ['{"candidate_id":"thecountryside:phrases","keep":[1]}', '{"candidate_id":"listen:phrases","keep":[]}', '{"candidate_id":"listen:phrases","keep":[2]}', '{"candidate_id":"ashoplifter:phrases","keep":[1]}'].join('\n'),
    );
    const rows = await applyScreen(dir);
    expect(rows.map((r) => r.display)).toEqual(['no city dust here', 'enlist', 'has to pilfer']);
    // Ingest closes out every input the screen covered, including one it kept nothing of.
    expect(await screenedCandidateIds(dir)).toEqual(['thecountryside:phrases', 'listen:phrases', 'ashoplifter:phrases']);
    expect(await screenedCandidateIds(join(dir, 'nowhere'))).toEqual([]);
    expect((await readJudgedRows(dir)).map((r) => r.display)).toEqual(['no city dust here', 'enlist', 'has to pilfer']);
    expect(batches(rows, 150)).toHaveLength(1);
  });
});
