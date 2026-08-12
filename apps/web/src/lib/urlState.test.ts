import { describe, expect, it } from 'vitest';
import { DEFAULT_QUERY, UNLIMITED_WORDS, type Query } from '@ars-magna/engine';
import { decodeQuery, encodeQuery, splitQuery } from './urlState.ts';

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
      }),
    );
    expect(encoded).toBe('q=dormitory&t=full&m=4&w=2&i=room');
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
    });
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
