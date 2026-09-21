/**
 * The review desk's decisions as commands: the exact strings, in the order
 * they must run, and the prompt they fill.
 */
import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';

import { normalizeLetters } from '@ars-magna/engine/fold';
import { describeReading, fullReading, parseReading, readInput, readingProblem } from '@ars-magna/engine/readings';

import {
  candidateIdOf,
  candidateOfHit,
  composeCommands,
  fillDeepRunPrompt,
  fillPrompt,
  foldLetters,
  hitIdOf,
  parseSeeds,
  phraseFits,
  promptBody,
  readingOfAdd,
  setReadings,
  shellQuote,
  type Decision,
} from '../src/desk/compose.ts';
import { APPLY_DESK_PROMPT, DEEP_RUN_PROMPT } from '../src/desk.ts';
import { candidateId, hitId } from '../src/ids.ts';

// The page hands the engine's reading step to compose; the tests do the same.
setReadings({ readInput, fullReading, readingProblem, describeReading, parseReading });

describe('ids in the page', () => {
  it('fold letters exactly as the pipeline does', () => {
    for (const text of ['Beyoncé', 'Sagrada Família', 'Straße', 'Ærøskøbing', 'Łódź', 'Þórshöfn', "Rubik's Cube", 'Play-Doh', 'Jalapeño', 'ÉCOLE', 'Dormitory 2', 'Blink-182', 'Ke$ha']) {
      expect(foldLetters(text), text).toBe(normalizeLetters(text));
    }
    expect(candidateIdOf('Sagrada Família', 'places')).toBe(candidateId('Sagrada Família', 'places', {}));
    expect(hitIdOf('Dormitory', 'phrases', ['Dirty', 'room'])).toBe(hitId('Dormitory', 'phrases', ['dirty', 'room'], {}));
    expect(phraseFits('Dormitory', 'dirty room')).toBe(true);
    expect(phraseFits('Dormitory', 'dirty rooms')).toBe(false);
    // A reading goes into the letters, the id and the fit, as it does in the pipeline.
    expect(foldLetters('Reacher season 4', { '4': 'drop' })).toBe('reacherseason');
    expect(candidateIdOf('Reacher season 4', 'titles', { '4': 'drop' })).toBe(candidateId('Reacher season 4', 'titles', { '4': 'drop' }));
    expect(hitIdOf('Blink-182', 'titles', ['blink', 'two', 'eight', 'one'], { '182': 'digits' })).toBe('blinkoneeighttwo:titles:blink-eight-one-two');
    expect(phraseFits('Reacher season 4', 'as one searcher')).toBe(false);
    expect(phraseFits('Reacher season 4', 'as one searcher', { '4': 'drop' })).toBe(true);
    expect(readingOfAdd({ reading: ' 4:drop ' })).toEqual({ '4': 'drop' });
    expect(readingOfAdd({})).toBeUndefined();
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
      { kind: 'deep', date: '2026-09-14b', perInput: '300' },
      { kind: 'seed', input: 'The countryside', category: 'phrases', anchors: ['city', 'dust'] },
      { kind: 'seed', input: 'Sagrada Família', category: 'places', anchors: [] },
      { kind: 'add', input: 'Dormitory', category: 'phrases', phrase: 'dirty room', tier: 'common', justification: 'A dormitory is a dirty room.' },
      { kind: 'add', input: 'Reacher season 4', category: 'titles', phrase: 'as one searcher', tier: 'common', justification: 'A searcher.', reading: '4:drop' },
      { kind: 'seed', input: 'Como 1907', category: 'companies', anchors: [] },
      { kind: 'describe', id: 'supergirl:titles', text: "Supergirl is DC Comics' cousin of Superman." },
    ];
    const { commands, notes } = composeCommands(decisions, today);
    expect(commands).toEqual([
      [
        "cat >> data/candidates.jsonl <<'EOF'",
        '{"id":"thecountryside:phrases","input":"The countryside","category":"phrases","source":"manual","first_seen":"2026-09-14","status":"new","anchors":["city","dust"]}',
        '{"id":"sagradafamilia:places","input":"Sagrada Família","category":"places","source":"manual","first_seen":"2026-09-14","status":"new"}',
        // A seed with a number records how it is read.
        '{"id":"comoonethousandninehundredseven:companies","input":"Como 1907","category":"companies","source":"manual","first_seen":"2026-09-14","status":"new","reading":{"1907":"spell"}}',
        'EOF',
      ].join('\n'),
      'pnpm hits:requeue --settings-before=s2 --category=titles --dry-run',
      'pnpm hits:requeue --settings-before=s2 --category=titles',
      '# then carry out the deep run from data/queue/2026-09-14b on, at 300 phrases per input, as docs/prompts/deep-run.md describes',
      'pnpm hits:ingest --date=2026-09-13 --model=claude-sonnet-5 --only=supergirl:titles:girls-pure --status=accepted',
      'pnpm hits:ingest --date=2026-09-13 --model=claude-sonnet-5 --only=arthurashe:people:ash-her-tau,a:phrases:b --status=proposed',
      'pnpm hits:ingest --date=2026-09-12c --model=claude-sonnet-5 --only=c:phrases:d --status=proposed',
      `pnpm hits:justify funeral:phrases:fun-real 'A funeral is the opposite of real fun, and that'\\''s the joke.'`,
      "pnpm hits:justify arthurashe:people:ash-her-tau 'Arthur Ashe.'",
      `pnpm hits:describe supergirl:titles 'Supergirl is DC Comics'\\'' cousin of Superman.'`,
      "pnpm hits:tag funeral:phrases:fun-real +tone:ironic '+note:dark humour' -tone:pun",
      'pnpm hits:set --status=featured boeing:companies:big-one doctorwho:titles:torch-wood',
      'pnpm hits:set --status=accepted arthurashe:people:ash-her-tau',
      "cargo run --release -p anagram-cli -- check Dormitory 'dirty room' --tier=common",
      '# then call the MCP tool propose_hit with input "Dormitory", category phrases, words ["dirty","room"], tier common, justification "A dormitory is a dirty room."',
      'pnpm hits:set --status=accepted dormitory:phrases:dirty-room',
      // The reading the operator typed goes to the check, to propose_hit and into the id.
      "cargo run --release -p anagram-cli -- check 'Reacher season 4' 'as one searcher' --tier=common --read=4:drop",
      '# then call the MCP tool propose_hit with input "Reacher season 4", category titles, words ["as","one","searcher"], tier common, justification "A searcher." and reading {"4":"drop"}',
      'pnpm hits:set --status=accepted reacherseason:titles:as-one-searcher',
    ]);
    expect(notes).toEqual(['a:phrases:b has no justification yet, so it goes in as proposed. Give it one with pnpm hits:justify before accepting it.']);
  });

  it('say what an input is once for the input, whichever of its rows it was written on', () => {
    expect(candidateOfHit('funeral:phrases:fun-real')).toBe('funeral:phrases');
    const { commands } = composeCommands(
      [
        { kind: 'describe', id: candidateOfHit('funeral:phrases:fun-real'), text: 'First.' },
        { kind: 'describe', id: candidateOfHit('funeral:phrases:real-fun'), text: 'A funeral is a ceremony for the dead.' },
      ],
      today,
    );
    expect(commands).toEqual(["pnpm hits:describe funeral:phrases 'A funeral is a ceremony for the dead.'"]);
  });

  it('set or clear the sense of a word after what inputs are and before tags, the last decision for each word winning', () => {
    const { commands } = composeCommands(
      [
        { kind: 'tag', id: 'darioamodei:people:ai-da-doomer-i', add: ['tone:pun'], remove: [] },
        { kind: 'sense', id: 'darioamodei:people:ai-da-doomer-i', word: 'da', text: 'First.' },
        { kind: 'sense', id: 'darioamodei:people:ai-da-doomer-i', word: 'ai', text: '' },
        { kind: 'describe', id: 'darioamodei:people', text: 'Dario Amodei is a CEO and co-founder of Anthropic.' },
        { kind: 'sense', id: 'darioamodei:people:ai-da-doomer-i', word: 'da', text: 'Short for the, as in casual speech.' },
      ],
      today,
    );
    expect(commands).toEqual([
      "pnpm hits:describe darioamodei:people 'Dario Amodei is a CEO and co-founder of Anthropic.'",
      'pnpm hits:sense darioamodei:people:ai-da-doomer-i ai --clear',
      "pnpm hits:sense darioamodei:people:ai-da-doomer-i da 'Short for the, as in casual speech.'",
      'pnpm hits:tag darioamodei:people:ai-da-doomer-i +tone:pun',
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
    expect(composeCommands([], today)).toEqual({ commands: [], notes: [], rowNotes: [] });
  });

  it('set a word order after ingest writes the row, and never for a near miss left in its queue', () => {
    const { commands } = composeCommands(
      [
        { kind: 'order', id: 'funeral:phrases:fun-real', words: ['fun', 'real'], hit: true },
        { kind: 'order', id: 'funeral:phrases:fun-real', words: ['real', 'fun'], hit: true },
        { kind: 'order', id: 'listen:phrases:in-lets', words: ['lets', 'in'], hit: false },
        { kind: 'order', id: 'astronomer:phrases:moon-starer', words: ['moon', 'starer'], hit: false },
        { kind: 'promote', queue: '2026-09-13', model: 'claude-opus-5', id: 'listen:phrases:in-lets', status: 'accepted', justification: 'Lets in.', judged: 'Lets in.' },
        { kind: 'justify', id: 'funeral:phrases:fun-real', text: 'Real fun.' },
      ],
      today,
    );
    expect(commands).toEqual([
      'pnpm hits:ingest --date=2026-09-13 --model=claude-opus-5 --only=listen:phrases:in-lets --status=accepted',
      'pnpm hits:order funeral:phrases:fun-real real fun',
      'pnpm hits:order listen:phrases:in-lets lets in',
      "pnpm hits:justify funeral:phrases:fun-real 'Real fun.'",
    ]);
  });

  it('list each note on a row with its id, its chosen order and where it stands', () => {
    const { commands, notes, rowNotes } = composeCommands(
      [
        { kind: 'note', id: 'funeral:phrases:fun-real', display: 'fun real', text: 'First thought.', hit: true },
        { kind: 'order', id: 'funeral:phrases:fun-real', words: ['real', 'fun'], hit: true },
        { kind: 'note', id: 'funeral:phrases:fun-real', display: 'fun real', text: 'A funeral is anything but.\nKeep it short.', hit: true },
        { kind: 'promote', queue: '2026-09-13', model: 'claude-opus-5', id: 'astronomer:phrases:moon-starer', status: 'accepted', justification: '', judged: '' },
        { kind: 'note', id: 'astronomer:phrases:moon-starer', display: 'starer moon', text: 'An astronomer stares at the moon; say that.', hit: false },
        { kind: 'note', id: 'listen:phrases:in-lets', display: 'lets in', text: 'Look again after the next deep run.', hit: false },
        { kind: 'note', id: 'x:phrases:blank', display: 'blank', text: '   ', hit: true },
      ],
      today,
    );
    expect(commands).toEqual([
      'pnpm hits:ingest --date=2026-09-13 --model=claude-opus-5 --only=astronomer:phrases:moon-starer --status=proposed',
      'pnpm hits:order funeral:phrases:fun-real real fun',
    ]);
    expect(rowNotes).toEqual([
      '- funeral:phrases:fun-real, reading "real fun": A funeral is anything but.\n  Keep it short.',
      '- astronomer:phrases:moon-starer, reading "starer moon", promoted from 2026-09-13 as accepted: An astronomer stares at the moon; say that.',
      '- listen:phrases:in-lets, reading "lets in", a near miss left in its queue: Look again after the next deep run.',
    ]);
    // Accepted with no justification, but with a note: the agent writes one from the note, then accepts it.
    expect(notes).toEqual([
      'astronomer:phrases:moon-starer has no justification yet, so it goes in as proposed. Write one plain sentence for it from my note on it below, ' +
        'set it with pnpm hits:justify, then accept it with pnpm hits:set --status=accepted astronomer:phrases:moon-starer.',
    ]);
  });

  it('move a hit between shelves with a shelf tag only where the judge would put it elsewhere', () => {
    const { commands } = composeCommands(
      [
        { kind: 'shelf', id: 'a:phrases:b', shelf: 'stretch', judged: 'interesting', tags: [] },
        { kind: 'shelf', id: 'c:phrases:d', shelf: 'interesting', judged: 'interesting', tags: ['shelf:stretch'] },
        { kind: 'shelf', id: 'e:phrases:f', shelf: 'interesting', judged: 'stretch', tags: ['shelf:stretch'] },
        // A Greatest Hit moved to the shelf its scores give it needs only its status.
        { kind: 'status', id: 'g:phrases:h', status: 'accepted' },
        { kind: 'shelf', id: 'g:phrases:h', shelf: 'interesting', judged: 'interesting', tags: [] },
      ],
      today,
    );
    expect(commands).toEqual([
      'pnpm hits:tag a:phrases:b +shelf:stretch',
      'pnpm hits:tag c:phrases:d -shelf:stretch',
      'pnpm hits:tag e:phrases:f +shelf:interesting -shelf:stretch',
      'pnpm hits:set --status=accepted g:phrases:h',
    ]);
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
    expect(filled).toContain('in the order I chose:\n\nnone\n');
    expect(filled).not.toMatch(/desk_(branch|commands|notes|row_notes)/);
    expect(fillPrompt(template, [], 'Leave Boeing alone.', 'x')).toContain('Notes from the operator: Leave Boeing alone.');
    const noted = fillPrompt(template, [], '', 'x', ['- a:phrases:b-c, reading "c b": Say why.', '- d:phrases:e, reading "e": Keep it.']);
    expect(noted).toContain('in the order I chose:\n\n- a:phrases:b-c, reading "c b": Say why.\n- d:phrases:e, reading "e": Keep it.\n');
    expect(noted).toContain('Notes from the operator: none');
  });

  it('fills deep-run.md with the scope and the size', async () => {
    const template = await readFile(DEEP_RUN_PROMPT, 'utf8');
    const filled = fillDeepRunPrompt(template, 'candidates in the titles category, processed under settings older than s2', '300 phrases per input');
    expect(filled.startsWith('Run a Greatest Hits deep run.')).toBe(true);
    expect(filled).toContain('Scope: candidates in the titles category, processed under settings older than s2');
    expect(filled).toContain('Size: 300 phrases per input');
    expect(filled).not.toMatch(/deep_run_(scope|size)/);
  });
});
