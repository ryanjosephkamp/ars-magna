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
  formSchema,
  problemsWith,
  readAdditions,
  readForms,
  type Addition,
  type Form,
} from '../src/vocab.ts';
import { decodeDict, encodeDict } from '../src/format.ts';

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

const dont: Form = {
  form: "don't",
  letters: 'dont',
  kind: 'contraction',
  gloss: 'Contraction of do not.',
  trace: 'https://en.wiktionary.org/wiki/don%27t',
  proposed_by: 'ryanjosephkamp',
  added: '2026-09-20',
  pos: ['verb'],
};
const its: Form = { ...dont, form: "it's", letters: 'its', gloss: 'Contraction of it is or it has.', pos: ['pron', 'verb'] };

describe('the form schema', () => {
  it('accepts a contraction whose letters are a word already, and one whose letters are not', async () => {
    const check = await formSchema();
    expect(check(dont)).toBe(true);
    expect(check(its)).toBe(true);
    // A hyphenated term, and a form with no part of speech given.
    const { pos: _none, ...noPos } = dont;
    expect(check({ ...noPos, form: "jack-o'-lantern", letters: 'jackolantern', kind: 'hyphenated' })).toBe(true);
  });

  it('refuses what is not a form, and what a reader or the build could not use', async () => {
    const check = await formSchema();
    const withField = (over: Record<string, unknown>) => check({ ...dont, ...over });
    // A form is a spelling with an apostrophe or hyphen; plain letters are a word, and go in the additions.
    expect(withField({ form: 'dont' })).toBe(false);
    expect(withField({ form: "Don't" })).toBe(false);
    expect(withField({ form: "don't do" })).toBe(false);
    // The letters are letters.
    expect(withField({ letters: "don't" })).toBe(false);
    expect(withField({ kind: 'possessive' })).toBe(false);
    expect(withField({ gloss: 'no capital letter.' })).toBe(false);
    expect(withField({ gloss: 'No full stop' })).toBe(false);
    // A part of speech is one of the nine the ordering knows, and given as a list.
    expect(withField({ pos: 'verb' })).toBe(false);
    expect(withField({ pos: ['contraction'] })).toBe(false);
    expect(withField({ pos: [] })).toBe(false);
  });
});

describe('the rules the form schema cannot state', () => {
  it('holds the letters to the form, refuses a repeat and an addition as a base, and shares the cap', () => {
    expect(problemsWith([doomer], new Set(), [dont, its])).toEqual([]);
    // The letters must be the form's own: `don't` folds to `dont`, not `donut`.
    expect(problemsWith([], new Set(), [{ ...dont, letters: 'donut' }])[0]).toMatch(/its letters are dont, not donut/);
    expect(problemsWith([], new Set(), [dont, dont])[0]).toMatch(/more than once/);
    // An addition is a word of its own, never the base of a form.
    expect(problemsWith([doomer], new Set(), [{ ...dont, form: "doom'er", letters: 'doomer' }])[0]).toMatch(/site addition/);
    // One cap over both lists: the additions alone fit, one form more does not.
    const many = Array.from({ length: ADDITIONS_CAP }, (_, i) => ({ ...doomer, word: `w${i.toString(36).replace(/[^a-z]/g, 'x')}` }));
    expect(problemsWith(many, new Set(), [dont]).filter((p) => /cap/.test(p))).toEqual([
      `${ADDITIONS_CAP} additions and 1 forms is over the cap of ${ADDITIONS_CAP} together`,
    ]);
    expect(problemsWith(many, new Set(), []).filter((p) => /cap/.test(p))).toEqual([]);
  });
});

describe('the committed forms file', () => {
  it('is admissible beside the additions, and lists the plan\'s contractions', async () => {
    const forms = await readForms();
    expect(forms.length).toBeGreaterThanOrEqual(53);
    expect(forms.map((f) => f.form)).toEqual(expect.arrayContaining(["it's", "don't", "i'm", "o'clock", "'tis"]));
    expect(forms.every((f) => f.kind === 'contraction')).toBe(true);
    expect(problemsWith(await readAdditions(), null, forms)).toEqual([]);
  });
});

describe('the forms section of the artifact', () => {
  it('round-trips beside the words, and reads as none from a dictionary built without it', () => {
    const words = ['dont', 'its', 'sit'];
    const forms = [
      { letters: 'dont', form: "don't", shown: true },
      { letters: 'its', form: "it's", shown: false },
    ];
    const withForms = decodeDict(encodeDict({ words, zipf: null, forms, tier: 3 }));
    expect(withForms.words).toEqual(words);
    expect(withForms.forms).toEqual(forms);
    expect(decodeDict(encodeDict({ words, zipf: null, tier: 3 })).forms).toEqual([]);
    // A form's letters must be a word of the list, or the page would show a spelling the search cannot find.
    expect(() => encodeDict({ words, zipf: null, forms: [{ letters: 'youre', form: "you're", shown: true }], tier: 3 })).toThrow(/not a word of the list/);
  });
});
