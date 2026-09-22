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
  TERMS_CAP,
  additionSchema,
  classArtifactProblems,
  classSchema,
  committedClasses,
  formSchema,
  problemsWith,
  readAdditions,
  readClassFiles,
  readForms,
  readNames,
  termProblems,
  type Addition,
  type ClassTermLine,
  type Form,
  type TermClass,
} from '../src/vocab.ts';
import { classBit, classCounts, classTerms, readClassEntries } from '../src/classes.ts';
import { NAME_FLOOR } from '../src/tokens.ts';
import { decodeClasses, decodeDict, encodeClasses, encodeDict } from '../src/format.ts';

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

const b8: ClassTermLine = {
  term: 'b8',
  reads_as: 'bait',
  gloss: 'Text-messaging spelling of bait.',
  trace: 'https://en.wiktionary.org/wiki/b8',
  proposed_by: 'ryanjosephkamp',
  added: '2026-09-22',
};
const wtf: ClassTermLine = { ...b8, term: 'wtf', reads_as: 'what the fuck', gloss: 'Initialism of what the fuck.', trace: 'https://en.wiktionary.org/wiki/WTF', written: 'WTF', tone: 'crude' };
const u: ClassTermLine = { ...b8, term: 'u', reads_as: 'you', gloss: 'The letter u for you.', trace: 'https://en.wiktionary.org/wiki/u' };
/** An acronym line to rename: no `written`, which must be the term's own letters. */
const { written: _wtfWritten, ...acr } = wtf;
const amp: ClassTermLine = { ...b8, term: '&', reads_as: 'and', gloss: 'The ampersand.', trace: 'https://en.wiktionary.org/wiki/%26' };

describe('the class schemas', () => {
  it('accept a line of each class as vocab:term writes it', async () => {
    expect((await classSchema('blends'))(b8)).toBe(true);
    expect((await classSchema('acronyms'))(wtf)).toBe(true);
    expect((await classSchema('shorthand'))(u)).toBe(true);
    expect((await classSchema('shorthand'))({ ...u, term: '2', reads_as: 'to' })).toBe(true);
    expect((await classSchema('symbols'))(amp)).toBe(true);
    expect((await classSchema('acronyms'))({ ...wtf, also: ['names'] })).toBe(true);
  });

  it('hold each class to its own characters', async () => {
    const blend = await classSchema('blends');
    const acronym = await classSchema('acronyms');
    const shorthand = await classSchema('shorthand');
    const symbol = await classSchema('symbols');
    // A blend has letters and digits; letters alone are an acronym, one character is shorthand.
    expect(blend({ ...b8, term: 'bait' })).toBe(false);
    expect(blend({ ...b8, term: '88' })).toBe(false);
    expect(blend({ ...b8, term: 'B8' })).toBe(false);
    expect(acronym({ ...wtf, term: 'w00t' })).toBe(false);
    expect(acronym({ ...wtf, term: 'WTF' })).toBe(false);
    expect(shorthand({ ...u, term: 'ur' })).toBe(false);
    expect(shorthand({ ...u, term: '&' })).toBe(false);
    // The symbols are the six that stand anywhere; `!` is a pool character only inside a word.
    expect(symbol({ ...amp, term: '!' })).toBe(false);
    expect(symbol({ ...amp, term: '&&' })).toBe(false);
  });

  it('read as lowercase words, and as the word I, which idk begins with', async () => {
    const acronym = await classSchema('acronyms');
    const shorthand = await classSchema('shorthand');
    // The one capital English spells in a word of its own.
    expect(acronym({ ...wtf, term: 'idk', reads_as: "I don't know" })).toBe(true);
    expect(acronym({ ...wtf, term: 'iirc', reads_as: 'if I remember correctly' })).toBe(true);
    expect(shorthand({ ...u, reads_as: 'I' })).toBe(true);
    // Every other capital, and a hyphen or space with nothing after it, stay out.
    expect(acronym({ ...wtf, term: 'idk', reads_as: 'I Do Not Know' })).toBe(false);
    expect(acronym({ ...wtf, reads_as: 'What the fuck' })).toBe(false);
    expect(shorthand({ ...u, reads_as: 'you ' })).toBe(false);
    expect(shorthand({ ...u, reads_as: 'you-' })).toBe(false);
  });

  it('refuse what a reader or the build could not use', async () => {
    const check = await classSchema('blends');
    const withField = (over: Record<string, unknown>) => check({ ...b8, ...over });
    expect(withField({ gloss: 'no capital letter.' })).toBe(false);
    expect(withField({ gloss: 'No full stop' })).toBe(false);
    // A trace is a public URL, never a note.
    expect(withField({ trace: 'heard it somewhere' })).toBe(false);
    expect(withField({ tone: 'rude' })).toBe(false);
    expect(withField({ also: [] })).toBe(false);
    expect(withField({ also: ['emoji'] })).toBe(false);
    // `written` belongs to acronyms alone; `class` is the file, not a field.
    expect(withField({ written: 'B8' })).toBe(false);
    expect(withField({ class: 'blends' })).toBe(false);
    const { reads_as: _dropped, ...noReading } = b8;
    expect(check(noReading)).toBe(false);
  });
});

describe('the rules the class schemas cannot state', () => {
  const files = (over: Partial<Record<TermClass, ClassTermLine[]>>) => new Map(Object.entries(over) as [TermClass, ClassTermLine[]][]);

  it('refuse a word of the dictionary, a repeat, a written form with other letters, and a list over the cap', () => {
    expect(termProblems(files({ blends: [b8], acronyms: [wtf] }), new Set(['bait']))).toEqual([]);
    // `lol` and `faq` are words of the pin already; so are the letters a, i, b, c and n.
    expect(termProblems(files({ acronyms: [{ ...acr, term: 'lol' }] }), new Set(['lol']))).toEqual([
      'acronyms: lol: a word of the dictionary already, which needs no class',
    ]);
    expect(termProblems(files({ shorthand: [{ ...u, term: 'b' }] }), new Set(['b']))).toEqual([
      'shorthand: b: a word of the dictionary already, which needs no class',
    ]);
    expect(termProblems(files({ blends: [b8, b8] }), new Set())).toEqual(['blends: b8: listed more than once']);
    expect(termProblems(files({ acronyms: [{ ...wtf, written: 'WTH' }] }), new Set())).toEqual([
      'acronyms: wtf: written as WTH, whose letters are not the term\'s',
    ]);
    const many = Array.from({ length: TERMS_CAP + 1 }, (_, i) => ({ ...acr, term: `x${i.toString(36).replace(/[^a-z]/g, 'q')}` }));
    expect(termProblems(files({ acronyms: many }), new Set()).filter((p) => /cap/.test(p))).toEqual([
      `${TERMS_CAP + 1} terms across the class files is over the cap of ${TERMS_CAP} together`,
    ]);
  });

  it('allow a term in two classes, or in a class and the names list, only when its line says also', () => {
    const inTwo = files({ acronyms: [{ ...acr, term: 'ur' }], shorthand: [{ ...u, term: 'ur' }] });
    expect(termProblems(inTwo, new Set())).toEqual([
      'acronyms: ur: listed in shorthand too; say also: ["shorthand"] if that is meant',
      'shorthand: ur: listed in acronyms too; say also: ["acronyms"] if that is meant',
    ]);
    const meant = files({ acronyms: [{ ...acr, term: 'ur', also: ['shorthand'] }], shorthand: [{ ...u, term: 'ur', also: ['acronyms'] }] });
    expect(termProblems(meant, new Set())).toEqual([]);
    // One side saying so is not enough.
    const half = files({ acronyms: [{ ...acr, term: 'ur', also: ['shorthand'] }], shorthand: [{ ...u, term: 'ur' }] });
    expect(termProblems(half, new Set())).toEqual(['shorthand: ur: listed in acronyms too; say also: ["acronyms"] if that is meant']);
    // A term that is a name of the names list too.
    expect(termProblems(files({ acronyms: [{ ...acr, term: 'nasa' }] }), new Set(), new Set(['nasa']))).toEqual([
      'acronyms: nasa: a name of the names list too; say also: ["names"] if that is meant',
    ]);
    expect(termProblems(files({ acronyms: [{ ...acr, term: 'nasa', also: ['names'] }] }), new Set(), new Set(['nasa']))).toEqual([]);
    // And `also` must be true: the files and the list decide the bits.
    expect(termProblems(files({ acronyms: [{ ...acr, term: 'nasa', also: ['names'] }] }), new Set(), new Set())).toEqual([
      'acronyms: nasa: says also names, but is not listed there',
    ]);
    expect(termProblems(files({ acronyms: [{ ...wtf, also: ['blends'] }] }), new Set())).toEqual([
      'acronyms: wtf: says also blends, but is not listed there',
    ]);
    expect(termProblems(files({ acronyms: [{ ...wtf, also: ['acronyms'] }] }), new Set())).toEqual(['acronyms: wtf: also names its own class']);
  });

  it('skips the word rule rather than guessing when no dictionary is committed', () => {
    expect(termProblems(files({ acronyms: [{ ...acr, term: 'lol' }] }), null)).toEqual([]);
  });
});

describe('the committed class files', () => {
  it('seed the plan\'s examples, each through its schema, and are admissible together with the names list', async () => {
    const files = await readClassFiles();
    expect([...files.keys()]).toEqual(['symbols', 'shorthand', 'blends', 'acronyms']);
    expect(files.get('symbols')!.map((l) => l.term).sort()).toEqual(['#', '$', '%', '&', '+', '@']);
    expect(files.get('shorthand')!.map((l) => l.term)).toEqual(expect.arrayContaining(['u', 'r', 'y', 'k', 'f', '2', '4', '8', '1']));
    expect(files.get('blends')!.map((l) => l.term)).toEqual(expect.arrayContaining(['b8', 'gr8', '2day', '10q']));
    expect(files.get('acronyms')!.map((l) => l.term)).toEqual(expect.arrayContaining(['wtf', 'btw', 'thx', 'pls', 'ur']));
    // The crude ones say so; the initialisms say how they are written.
    expect(files.get('shorthand')!.find((l) => l.term === 'f')!.tone).toBe('crude');
    expect(files.get('acronyms')!.find((l) => l.term === 'wtf')).toMatchObject({ tone: 'crude', written: 'WTF' });
    expect(files.get('acronyms')!.find((l) => l.term === 'thx')!.written).toBeUndefined();
    const names = new Set((await readNames()).map((n) => n.name));
    expect(termProblems(files, null, names)).toEqual([]);
  });

  it('are the terms the build carries, with the names list as the names class under its floor', async () => {
    const entries = await readClassEntries();
    const counts = classCounts(entries);
    expect(counts).toMatchObject({ symbols: 6, shorthand: 9, blends: 15, acronyms: 13 });
    expect(counts.names).toBeGreaterThan(9_000);
    expect(entries.filter((e) => e.class === 'names').every((e) => e.term.length >= NAME_FLOOR)).toBe(true);
    const terms = classTerms(entries);
    expect(terms.find((t) => t.term === 'b8')).toEqual({ term: 'b8', bits: 8 });
    expect(terms.find((t) => t.term === 'eiffel')).toEqual({ term: 'eiffel', bits: 64 });
    // The artifact round-trips.
    expect(decodeClasses(encodeClasses(terms))).toEqual(terms);
  });
});

describe('the class files against the committed classes artifact', () => {
  const listed = [
    { term: '&', bits: classBit('symbols') },
    { term: '2', bits: classBit('shorthand') },
    { term: 'b8', bits: classBit('blends') },
    { term: 'eiffel', bits: classBit('names') },
  ];
  const rebuild = 'run pnpm dict:fetch && pnpm dict:build and commit the artifacts with [dict] in the message';

  it('agree when the artifact is what the files would build', () => {
    expect(classArtifactProblems(listed, decodeClasses(encodeClasses(listed)))).toEqual([]);
    expect(classArtifactProblems([], null)).toEqual([]);
  });

  it('name the term the artifact lacks, which is the term the site cannot admit', () => {
    const artifact = decodeClasses(encodeClasses(listed.filter((t) => t.term !== 'b8')));
    expect(classArtifactProblems(listed, artifact)).toEqual([
      `b8: listed as blends, and the committed classes artifact does not carry it; ${rebuild}`,
    ]);
  });

  it('name the term no file lists any more, and the term whose classes moved', () => {
    const artifact = decodeClasses(encodeClasses([...listed, { term: '10q', bits: classBit('blends') }]));
    expect(classArtifactProblems(listed, artifact)).toEqual([
      `10q: carried by the committed classes artifact as blends, and no class file or the names list lists it; ${rebuild}`,
    ]);
    const moved = decodeClasses(
      encodeClasses(listed.map((t) => (t.term === '2' ? { term: '2', bits: classBit('blends') } : t))),
    );
    expect(classArtifactProblems(listed, moved)).toEqual([
      `2: listed as shorthand, and the committed classes artifact carries it as blends; ${rebuild}`,
    ]);
  });

  it('refuse a class file with a term while the manifest names no artifact', () => {
    expect(classArtifactProblems(listed, null)).toEqual([
      `the class files and the names list carry 4 terms and the manifest names no classes artifact; ${rebuild}`,
    ]);
  });

  it('hold the committed files and names list to the committed artifact, term for term and bit for bit', async () => {
    const artifact = await committedClasses();
    expect(artifact).not.toBeNull();
    expect(artifact!.length).toBe(9_506);
    expect(classArtifactProblems(classTerms(await readClassEntries()), artifact)).toEqual([]);
  });
});
