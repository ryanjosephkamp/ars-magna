/**
 * The additions file's own rules, without building a dictionary.
 *
 * These run in CI on every pull request, which is the point: the build that
 * would really catch a bad addition needs 330 MB of pinned sources, and this
 * does not.
 */
import { describe, expect, it } from 'vitest';

import {
  ADDITIONS_CAP,
  additionSchema,
  problemsWith,
  readAdditions,
  type Addition,
} from '../src/vocab.ts';

const doomer: Addition = {
  word: 'doomer',
  kind: 'slang',
  gloss: 'A person who believes catastrophe is inevitable.',
  trace: 'https://en.wiktionary.org/wiki/doomer',
  proposed_by: 'ryanjosephkamp',
  added: '2026-09-15',
};

describe('the additions schema', () => {
  it('accepts a well-formed addition', async () => {
    const check = await additionSchema();
    expect(check(doomer)).toBe(true);
    // A word English borrowed and uses as its own, such as onsen.
    expect(check({ ...doomer, word: 'onsen', kind: 'loanword' })).toBe(true);
  });

  it('refuses what a reader or the build could not use', async () => {
    const check = await additionSchema();
    const withField = (over: Record<string, unknown>) => check({ ...doomer, ...over });

    // The word has to be a search form already, or the build would key it under
    // one spelling and the engine would look for another.
    expect(withField({ word: 'Doomer' })).toBe(false);
    expect(withField({ word: 'doom er' })).toBe(false);
    expect(withField({ word: '' })).toBe(false);

    expect(withField({ kind: 'vibes' })).toBe(false);

    // A reader sees the gloss, so PRODUCT.md's sentence rule applies to it.
    expect(withField({ gloss: 'no capital letter.' })).toBe(false);
    expect(withField({ gloss: 'No full stop' })).toBe(false);
    expect(withField({ gloss: `A${'a'.repeat(200)}.` })).toBe(false);

    expect(withField({ added: '15-09-2026' })).toBe(false);

    // A part of speech is deliberately not a field; `kind` is not one.
    expect(withField({ pos: 'n' })).toBe(false);

    const { trace: _dropped, ...noTrace } = doomer;
    expect(check(noTrace)).toBe(false);
  });
});

describe('the rules the schema cannot state', () => {
  it('refuses a word English OpenList already has, a repeat, and a list over the cap', () => {
    expect(problemsWith([doomer], new Set())).toEqual([]);
    expect(problemsWith([doomer], new Set(['doomer']))[0]).toMatch(/already in English OpenList/);
    expect(problemsWith([doomer, doomer], new Set())[0]).toMatch(/more than once/);

    const many = Array.from({ length: ADDITIONS_CAP + 1 }, (_, i) => ({ ...doomer, word: `w${i}` }));
    expect(problemsWith(many, new Set())[0]).toMatch(/over the cap/);
  });

  it('asks a word admitted as a name to point somewhere public', () => {
    // The rule itself — never a private person's name — is the operator's, made
    // by merging. What can be checked is that the trace is a public reference.
    const hearsay = { ...doomer, kind: 'name' as const, trace: 'someone told me' };
    expect(problemsWith([hearsay], new Set())[0]).toMatch(/public URL/);
    expect(problemsWith([{ ...doomer, kind: 'name' as const }], new Set())).toEqual([]);
  });

  it('skips the duplicate rule rather than guessing when no dictionary is committed', () => {
    expect(problemsWith([doomer], null)).toEqual([]);
  });
});

describe('the committed additions file', () => {
  it('is admissible, and leads with doomer', async () => {
    const additions = await readAdditions();
    expect(additions[0]?.word).toBe('doomer');
    expect(additions[0]?.kind).toBe('slang');
    expect(problemsWith(additions, null)).toEqual([]);
  });
});
