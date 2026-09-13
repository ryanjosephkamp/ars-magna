/**
 * The review desk's decisions as commands: the exact strings, in the order
 * they must run, and the prompt they fill.
 */
import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';

import { normalizeLetters } from '@ars-magna/engine/fold';

import {
  candidateIdOf,
  composeCommands,
  fillPrompt,
  foldLetters,
  hitIdOf,
  parseSeeds,
  phraseFits,
  promptBody,
  shellQuote,
  type Decision,
} from '../src/desk/compose.ts';
import { APPLY_DESK_PROMPT } from '../src/desk.ts';
import { candidateId, hitId } from '../src/ids.ts';

describe('ids in the page', () => {
  it('fold letters exactly as the pipeline does', () => {
    for (const text of ['Beyoncé', 'Sagrada Família', 'Straße', 'Ærøskøbing', 'Łódź', 'Þórshöfn', "Rubik's Cube", 'Play-Doh', 'Jalapeño', 'ÉCOLE', 'Dormitory 2']) {
      expect(foldLetters(text), text).toBe(normalizeLetters(text));
    }
    expect(candidateIdOf('Sagrada Família', 'places')).toBe(candidateId('Sagrada Família', 'places'));
    expect(hitIdOf('Dormitory', 'phrases', ['Dirty', 'room'])).toBe(hitId('Dormitory', 'phrases', ['dirty', 'room']));
    expect(phraseFits('Dormitory', 'dirty room')).toBe(true);
    expect(phraseFits('Dormitory', 'dirty rooms')).toBe(false);
  });

  it('quote a shell word only when it needs it', () => {
    expect(shellQuote('dormitory:phrases:dirty-room')).toBe('dormitory:phrases:dirty-room');
    expect(shellQuote('+tone:pun')).toBe('+tone:pun');
    expect(shellQuote("It's the room's state.")).toBe(`'It'\\''s the room'\\''s state.'`);
  });
});

describe('commands', () => {
  const today = '2026-09-14';

  it('write each kind of decision as its exact command, in the order they must run', () => {
    const decisions: Decision[] = [
      { kind: 'status', id: 'doctorwho:titles:torch-wood', status: 'accepted' },
      { kind: 'justify', id: 'funeral:phrases:fun-real', text: "A funeral is the opposite of real fun, and that's the joke." },
      { kind: 'tag', id: 'funeral:phrases:fun-real', add: ['tone:ironic', 'note:dark humour'], remove: ['tone:pun'] },
      { kind: 'status', id: 'boeing:companies:big-one', status: 'featured' },
      { kind: 'status', id: 'doctorwho:titles:torch-wood', status: 'featured' },
      {
        kind: 'promote',
        queue: '2026-09-13',
        model: 'claude-sonnet-5',
        id: 'supergirl:titles:girls-pure',
        status: 'accepted',
        justification: 'Supergirl is a wholesome heroine.',
        judged: 'Supergirl is a wholesome heroine.',
      },
      { kind: 'promote', queue: '2026-09-13', model: 'claude-sonnet-5', id: 'arthurashe:people:ash-her-tau', status: 'accepted', justification: 'Arthur Ashe.', judged: '' },
      { kind: 'promote', queue: '2026-09-13', model: 'claude-sonnet-5', id: 'a:phrases:b', status: 'accepted', justification: '', judged: '' },
      { kind: 'promote', queue: '2026-09-12c', model: 'claude-sonnet-5', id: 'c:phrases:d', status: 'proposed', justification: '', judged: '' },
      { kind: 'requeue', ids: [], settingsBefore: 's2', rubricBefore: '', category: 'titles', source: '' },
      { kind: 'deep', date: '2026-09-14b' },
      { kind: 'seed', input: 'The countryside', category: 'phrases', anchors: ['city', 'dust'] },
      { kind: 'seed', input: 'Sagrada Família', category: 'places', anchors: [] },
      { kind: 'add', input: 'Dormitory', category: 'phrases', phrase: 'dirty room', tier: 'common', justification: 'A dormitory is a dirty room.' },
    ];
    const { commands, notes } = composeCommands(decisions, today);
    expect(commands).toEqual([
      [
        "cat >> data/candidates.jsonl <<'EOF'",
        '{"id":"thecountryside:phrases","input":"The countryside","category":"phrases","source":"manual","first_seen":"2026-09-14","status":"new","anchors":["city","dust"]}',
        '{"id":"sagradafamilia:places","input":"Sagrada Família","category":"places","source":"manual","first_seen":"2026-09-14","status":"new"}',
        'EOF',
      ].join('\n'),
      'pnpm hits:requeue --settings-before=s2 --category=titles --dry-run',
      'pnpm hits:requeue --settings-before=s2 --category=titles',
      'pnpm hits:enumerate --date=2026-09-14b --preset=deep',
      'pnpm hits:prefilter --date=2026-09-14b --per-input=all',
      'pnpm hits:screen --date=2026-09-14b',
      'pnpm hits:ingest --date=2026-09-13 --model=claude-sonnet-5 --only=supergirl:titles:girls-pure --status=accepted',
      'pnpm hits:ingest --date=2026-09-13 --model=claude-sonnet-5 --only=arthurashe:people:ash-her-tau,a:phrases:b --status=proposed',
      'pnpm hits:ingest --date=2026-09-12c --model=claude-sonnet-5 --only=c:phrases:d --status=proposed',
      `pnpm hits:justify funeral:phrases:fun-real 'A funeral is the opposite of real fun, and that'\\''s the joke.'`,
      "pnpm hits:justify arthurashe:people:ash-her-tau 'Arthur Ashe.'",
      "pnpm hits:tag funeral:phrases:fun-real +tone:ironic '+note:dark humour' -tone:pun",
      'pnpm hits:set --status=featured boeing:companies:big-one doctorwho:titles:torch-wood',
      'pnpm hits:set --status=accepted arthurashe:people:ash-her-tau',
      "cargo run --release -p anagram-cli -- check Dormitory 'dirty room' --tier=common",
      '# then call the MCP tool propose_hit with input "Dormitory", category phrases, words ["dirty","room"], tier common and justification "A dormitory is a dirty room."',
      'pnpm hits:set --status=accepted dormitory:phrases:dirty-room',
    ]);
    expect(notes).toEqual([
      'Then screen and judge data/queue/2026-09-14b as automation/judge-routine.md describes from step 3, and ingest it with the engine check on.',
      'a:phrases:b has no justification yet, so it goes in as proposed. Give it one with pnpm hits:justify before accepting it.',
    ]);
  });

  it('let a later decision about the same thing replace an earlier one', () => {
    const { commands } = composeCommands(
      [
        { kind: 'justify', id: 'x:phrases:a', text: 'First.' },
        { kind: 'justify', id: 'x:phrases:a', text: 'Second.' },
        { kind: 'status', id: 'x:phrases:a', status: 'retired' },
        { kind: 'status', id: 'x:phrases:a', status: 'proposed' },
      ],
      today,
    );
    expect(commands).toEqual(['pnpm hits:justify x:phrases:a Second.', 'pnpm hits:set --status=proposed x:phrases:a']);
    expect(composeCommands([], today)).toEqual({ commands: [], notes: [] });
  });
});

describe('seeds', () => {
  it('read one input per line and name each line that cannot be seeded', () => {
    const { seeds, problems } = parseSeeds(
      [
        'The countryside | phrases | city Dust',
        'Sagrada Família | places',
        'Dormitory',
        '# a comment',
        'Hamlet | plays',
        'Venice | places | zebra',
        '!!! | phrases',
        'Sagrada Familia | places',
      ].join('\n'),
      ['dormitory:phrases'],
    );
    expect(seeds).toEqual([
      { kind: 'seed', input: 'The countryside', category: 'phrases', anchors: ['city', 'dust'] },
      { kind: 'seed', input: 'Sagrada Família', category: 'places', anchors: [] },
    ]);
    expect(problems).toEqual([
      'Dormitory: dormitory:phrases is already in the pool',
      'Hamlet: unknown category plays; use one of people, companies, products, titles, places, phrases',
      'Venice: the anchor zebra does not fit in its letters',
      '!!! | phrases: the input has no letters',
      'Sagrada Familia: sagradafamilia:places is already listed above',
    ]);
  });
});

describe('prompt', () => {
  it('fills apply-desk.md below its line, with the commands in a fenced block', async () => {
    const template = await readFile(APPLY_DESK_PROMPT, 'utf8');
    expect(promptBody(template).startsWith('Apply these Greatest Hits decisions')).toBe(true);
    const filled = fillPrompt(template, ['pnpm hits:set --status=featured a:phrases:b'], '', "the routine's branch hits/2026-09-13");
    expect(filled).toContain("Work on the routine's branch hits/2026-09-13.");
    expect(filled).toContain('```bash\npnpm hits:set --status=featured a:phrases:b\n```');
    expect(filled).toContain('Notes from the operator: none');
    expect(filled).not.toMatch(/desk_(branch|commands|notes)/);
    expect(fillPrompt(template, [], 'Leave Boeing alone.', 'x')).toContain('Notes from the operator: Leave Boeing alone.');
  });
});
