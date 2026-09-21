import { describe, expect, it } from 'vitest';
import { DEFAULT_QUERY, UNLIMITED_WORDS, type Query } from '@ars-magna/engine';
import {
  BUILD_DEFAULT,
  buildHref,
  cleanPhrase,
  decodeBuild,
  decodeQuery,
  encodeBuild,
  encodeQuery,
  encodeShared,
  inBoth,
  inBothSentence,
  keptPhrases,
  legacyReading,
  searchHref,
  splitQuery,
} from './urlState.ts';

describe('urlState accent folding', () => {
  it('folds an accented must-include word the way the engine will', () => {
    expect(decodeQuery('#q=caf%C3%A9&i=caf%C3%A9,Stra%C3%9Fe').mustInclude).toEqual(['cafe', 'strasse']);
  });
});

const query = (overrides: Partial<Query> = {}): Query => ({
  input: '',
  ...DEFAULT_QUERY,
  ...overrides,
});

describe('urlState', () => {
  it('writes only what differs from the defaults', () => {
    expect(encodeQuery(query({ input: 'dormitory' }))).toBe('q=dormitory');
  });

  it('writes every field once it differs', () => {
    const encoded = encodeQuery(
      query({
        input: 'dormitory',
        tier: 'full',
        minWordLen: 4,
        maxWords: 2,
        mustInclude: ['room'],
        mustExclude: ['dirt', 'or'],
      }),
    );
    expect(encoded).toBe('q=dormitory&t=full&m=4&w=2&i=room&x=dirt%2Cor');
  });

  it('keeps spaces readable in a shared link', () => {
    // `+` is what URLSearchParams emits and it reads badly in a pasted URL.
    const encoded = encodeQuery(query({ input: 'Ryan Joseph Kamp' }));
    expect(encoded).toBe('q=Ryan%20Joseph%20Kamp');
    expect(encoded).not.toContain('+');
    expect(decodeQuery(`#${encoded}`).input).toBe('Ryan Joseph Kamp');
  });

  it('round-trips every query it encodes', () => {
    const cases: Query[] = [
      query({ input: 'dormitory' }),
      query({ input: 'Ars Magna', tier: 'common' }),
      query({ input: 'astronomer', minWordLen: 4, maxWords: 2 }),
      query({ input: 'astronomer', mustInclude: ['moon'] }),
      query({ input: 'Demis Hassabis', mustExclude: ['ai'] }),
      query({ input: 'Demis Hassabis', mustInclude: ['shamed'], mustExclude: ['ai', 'is'] }),
      query({ input: "O'Brien-Smith 42", tier: 'full', minWordLen: 1, maxWords: UNLIMITED_WORDS }),
      query({ input: 'ünïcodé & symbols #%?', tier: 'full' }),
      query({ input: '' }),
    ];
    for (const original of cases) {
      expect(decodeQuery(`#${encodeQuery(original)}`)).toEqual(original);
    }
  });

  it('falls back to defaults on nonsense rather than throwing', () => {
    expect(decodeQuery('#t=wingdings').tier).toBe(DEFAULT_QUERY.tier);
    expect(decodeQuery('#m=abc').minWordLen).toBe(DEFAULT_QUERY.minWordLen);
    expect(decodeQuery('#w=').maxWords).toBe(DEFAULT_QUERY.maxWords);
    expect(decodeQuery('').input).toBe('');
    expect(decodeQuery('#').input).toBe('');
    expect(decodeQuery('#complete&&garbage==1').input).toBe('');
  });

  it('clamps out-of-range numbers instead of trusting them', () => {
    // A hand-edited URL should not be able to put the engine in a bad state.
    expect(decodeQuery('#m=-5').minWordLen).toBe(1);
    expect(decodeQuery('#m=9999').minWordLen).toBe(12);
    expect(decodeQuery('#w=0').maxWords).toBe(1);
    expect(decodeQuery('#w=9999').maxWords).toBe(UNLIMITED_WORDS);
  });

  it('cleans must-include words the same way the engine will', () => {
    expect(decodeQuery('#i=Room').mustInclude).toEqual(['room']);
    expect(decodeQuery('#i=ro-om,%20dirty').mustInclude).toEqual(['room', 'dirty']);
    expect(decodeQuery('#i=,,,').mustInclude).toEqual([]);
    expect(decodeQuery('#i=!!').mustInclude).toEqual([]);
    // A number in a word list folds to nothing: it is left out, as the engine leaves it out.
    expect(decodeQuery('#i=123').mustInclude).toEqual([]);
  });

  it('tolerates a hash with or without its leading marker', () => {
    expect(decodeQuery('#q=dormitory').input).toBe('dormitory');
    expect(decodeQuery('q=dormitory').input).toBe('dormitory');
  });
});

describe('splitQuery', () => {
  it('removes input from the filters at runtime, not just in the type', () => {
    const { input, filters } = splitQuery(query({ input: 'dormitory' }));

    expect(input).toBe('dormitory');
    // The bug this guards: `Omit<Query, 'input'>` is satisfied by an object that
    // still carries `input`, so the property has to actually be gone.
    expect(Object.keys(filters)).not.toContain('input');
    expect('input' in filters).toBe(false);
  });

  it('keeps every filter it was given', () => {
    const { filters } = splitQuery(
      query({ input: 'x', tier: 'full', minWordLen: 3, maxWords: 4, mustInclude: ['cat'] }),
    );

    expect(filters).toEqual({
      tier: 'full',
      minWordLen: 3,
      maxWords: 4,
      mustInclude: ['cat'],
      mustExclude: [],
      reading: {},
    });
  });

  it('reads Must exclude beside Must include, folded the way the engine folds it', () => {
    expect(decodeQuery('#q=Demis%20Hassabis&x=ai').mustExclude).toEqual(['ai']);
    expect(decodeQuery('#x=AI,%20Is,,!!').mustExclude).toEqual(['ai', 'is']);
    expect(decodeQuery('#x=caf%C3%A9').mustExclude).toEqual(['cafe']);
    expect(decodeQuery('#q=x').mustExclude).toEqual([]);
  });

  it('never opens a link on a word both included and excluded: Must include keeps it', () => {
    const decoded = decodeQuery('#q=Demis%20Hassabis&i=shamed,ai&x=ai,is');
    expect(decoded.mustInclude).toEqual(['shamed', 'ai']);
    expect(decoded.mustExclude).toEqual(['is']);
  });

  it('names the first word in both fields', () => {
    expect(inBoth(['shamed', 'ai'], ['is', 'ai'])).toBe('ai');
    expect(inBoth(['shamed'], ['ai'])).toBeNull();
    expect(inBoth([], [])).toBeNull();
  });

  it('refuses a word in both fields with one sentence', () => {
    expect(inBothSentence('ai')).toBe('No anagram can both contain and leave out “ai”.');
  });

  it('spreading the filters cannot shadow a newer input', () => {
    // Exactly how App composes the live query. With `input` still inside
    // `filters`, this produced the first-paint value on every keystroke, so the
    // search silently ran on stale text -- an empty string on an ordinary visit,
    // which the engine short-circuits to zero results.
    const { filters } = splitQuery(query({ input: '' }));
    const live = { ...filters, input: 'listen' };

    expect(live.input).toBe('listen');
  });
});

describe('kept phrases', () => {
  it('cleans a phrase the way the engine folds a query', () => {
    expect(cleanPhrase('Dirty  Room')).toBe('dirty room');
    expect(cleanPhrase(' moon   starer ')).toBe('moon starer');
    expect(cleanPhrase('caf\u00e9 ol\u00e9')).toBe('cafe ole');
    expect(cleanPhrase('   ')).toBe('');
  });

  it('adds the kept phrases after the query and keeps the link readable', () => {
    expect(encodeShared(query({ input: 'dormitory' }), ['dirty room'])).toBe('q=dormitory&p=dirty%20room');
    expect(encodeShared(query({ input: 'dormitory' }), ['dirty room', 'room dirty'])).toBe(
      'q=dormitory&p=dirty%20room%2Croom%20dirty',
    );
    expect(encodeShared(query({ input: 'dormitory' }), [])).toBe('q=dormitory');
    expect(encodeShared(query({ input: 'dormitory' }), ['  '])).toBe('q=dormitory');
  });

  it('round-trips a kept phrase, in the order given', () => {
    const hash = `#${encodeShared(query({ input: 'dormitory' }), ['room dirty'])}`;
    expect(keptPhrases(hash, 'dormitory')).toEqual(['room dirty']);
    expect(decodeQuery(hash).input).toBe('dormitory');
    const two = `#${encodeShared(query({ input: 'dormitory' }), ['room dirty', 'dirty room'])}`;
    expect(keptPhrases(two, 'dormitory')).toEqual(['room dirty', 'dirty room']);
  });

  it('rejects a phrase whose letters differ from the query', () => {
    expect(keptPhrases('#q=dormitory&p=dirty%20rooms', 'dormitory')).toEqual([]);
    expect(keptPhrases('#q=dormitory&p=dirty%20room,dirty%20rooms,room%20dirty', 'dormitory')).toEqual([
      'dirty room',
      'room dirty',
    ]);
    expect(keptPhrases('#q=dormitory&p=dirty%20room', 'astronomer')).toEqual([]);
  });

  it('folds accents and case on both sides, drops repeats, and ignores junk', () => {
    expect(keptPhrases('#q=Beyonc%C3%A9&p=Obey%20Cen', 'Beyonc\u00e9')).toEqual(['obey cen']);
    expect(keptPhrases('#q=dormitory&p=dirty%20room,dirty%20room', 'dormitory')).toEqual(['dirty room']);
    expect(keptPhrases('#q=dormitory&p=,,', 'dormitory')).toEqual([]);
    expect(keptPhrases('#q=dormitory', 'dormitory')).toEqual([]);
    expect(keptPhrases('#p=dirty%20room', '')).toEqual([]);
  });

  it('is invisible to the query decoder', () => {
    expect(decodeQuery('#q=dormitory&p=dirty%20room')).toEqual(query({ input: 'dormitory' }));
  });
});

describe('the Build page in the address', () => {
  it('writes only the boxes that hold something, and the dictionary only when it differs', () => {
    expect(encodeBuild(BUILD_DEFAULT)).toBe('');
    expect(encodeBuild({ ...BUILD_DEFAULT, text: 'Dario Amodei' })).toBe('t=Dario%20Amodei');
    expect(encodeBuild({ text: 'Dario Amodei', anagram: 'I da AI doomer', tier: 'extended', reading: {} })).toBe(
      't=Dario%20Amodei&a=I%20da%20AI%20doomer&d=extended',
    );
    // The one reading is the default, so a link never carries `r=` today; a reading the table does not offer is dropped.
    expect(encodeBuild({ ...BUILD_DEFAULT, text: 'Blink-182', reading: { '182': 'digits', '5': 'drop' } })).toBe('t=Blink-182');
    expect(encodeBuild({ ...BUILD_DEFAULT, text: 'Blink-182', reading: { '182': 'spell' } })).toBe('t=Blink-182');
    expect(encodeBuild({ ...BUILD_DEFAULT, text: '   ' })).toBe('');
  });

  it('round-trips both boxes, spaces, accents and punctuation included', () => {
    const cases = [
      BUILD_DEFAULT,
      { ...BUILD_DEFAULT, text: 'Dormitory', anagram: 'dirty room' },
      { text: "It's a dog's life", anagram: 'Legit, sad foils', tier: 'full' as const, reading: {} },
      { text: 'Beyoncé & 4', anagram: 'obey nce', tier: 'common' as const, reading: {} },
      { text: 'Blink-182 & 4', anagram: '', tier: 'standard' as const, reading: {} },
    ];
    for (const original of cases) {
      expect(decodeBuild(`#${encodeBuild(original)}`)).toEqual(original);
    }
    expect(encodeBuild({ ...BUILD_DEFAULT, text: 'Ryan Joseph Kamp' })).not.toContain('+');
  });

  it('falls back to an empty page and the usual dictionary on nonsense', () => {
    expect(decodeBuild('')).toEqual(BUILD_DEFAULT);
    expect(decodeBuild('#d=wingdings')).toEqual(BUILD_DEFAULT);
    expect(decodeBuild('#q=dormitory')).toEqual(BUILD_DEFAULT);
  });

  it('links to Build with a row already in its boxes', () => {
    expect(buildHref('Dario Amodei', 'I da AI doomer')).toBe('/build#t=Dario%20Amodei&a=I%20da%20AI%20doomer');
    // The search toolbar links with the text alone.
    expect(buildHref('Dormitory')).toBe('/build#t=Dormitory');
    expect(buildHref('')).toBe('/build');
  });
});

describe('the reading in the address', () => {
  it('writes only what differs from the defaults and reads back only what the input offers', () => {
    const blink = { ...DEFAULT_QUERY, input: 'Blink-182' };
    expect(encodeQuery({ ...blink, reading: {} })).toBe('q=Blink-182');
    expect(encodeQuery({ ...blink, reading: { '182': 'spell' } })).toBe('q=Blink-182');
    // A reading the table does not offer is never written, and a link cannot make the page convert.
    expect(encodeQuery({ ...blink, reading: { '182': 'digits' } })).toBe('q=Blink-182');
    expect(encodeQuery({ ...DEFAULT_QUERY, input: '2 Fast 2 Furious @', reading: { '2': 'too', '@': 'spell' } })).toBe('q=2%20Fast%202%20Furious%20%40');
    expect(decodeQuery('#q=Blink-182&r=182:digits').reading).toEqual({});
    expect(decodeQuery('#q=Blink-182&r=182%3Adigits').reading).toEqual({});
    expect(decodeQuery('#q=Blink-182&r=182:drop').reading).toEqual({});
    // A link cannot read a number a way the table does not know, name an item the input lacks, or say nothing and mean something.
    expect(decodeQuery('#q=Blink-182&r=182:year').reading).toEqual({});
    expect(decodeQuery('#q=Blink-182&r=5:drop').reading).toEqual({});
    expect(decodeQuery('#q=Blink-182&r=182').reading).toEqual({});
    expect(decodeQuery('#q=Blink-182&r=182:spell').reading).toEqual({});
    expect(decodeQuery('#q=Blink-182').reading).toEqual({});
    // A kept phrase must fit the letters with the number left out.
    expect(keptPhrases('#q=Reacher%20season%204&p=as%20one%20searcher', 'Reacher season 4')).toEqual(['as one searcher']);
    expect(keptPhrases('#q=Reacher%20season%204&p=four%20as%20one%20searcher', 'Reacher season 4')).toEqual([]);
  });

  it('opens the search on a hit as the hit was read', () => {
    expect(searchHref('Dormitory', undefined)).toBe('/#q=Dormitory');
    // Left out is the default, so no link carries `r=`; a reading from the withdrawn s5 day is not written either.
    expect(searchHref('Reacher season 4', { '4': 'drop' })).toBe('/#q=Reacher%20season%204');
    expect(searchHref('Como 1907', { '1907': 'spell' })).toBe('/#q=Como%201907');
    expect(searchHref('Sardar 2', undefined)).toBe('/#q=Sardar%202');
    expect(legacyReading('Blink-182 vs 2')).toEqual({ '182': 'drop', '2': 'drop' });
  });
});
