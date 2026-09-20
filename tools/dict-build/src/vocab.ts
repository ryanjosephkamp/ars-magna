/**
 * The site's own additions to the vocabulary, and its listed forms.
 *
 * English OpenList at the pinned revision is the dictionary. This is the short,
 * public list of words the site adds on top of it, so that completeness can
 * still be claimed honestly: the vocabulary is larger than the pin, and it is
 * still fully named.
 *
 * Every addition carries a gloss a reader can read and a trace saying where the
 * word is attested. Nothing here admits a word by itself — `vocab:add` appends a
 * proposal and the operator admits it by merging the pull request. The routine
 * and the Submit page propose; only a merge adds.
 *
 * A form is a spelling with an apostrophe or hyphen whose letters are one word:
 * `it's` is the letters `its`, `don't` the letters `dont`. Apostrophes and
 * hyphens carry no letters, so the search knows only the letters-word; the
 * form is listed beside it (`forms.jsonl`, `vocab:form`), with a gloss and a
 * trace like an addition, under the same cap. Where the letters are already a
 * word the form adds a spelling; where they are not (`dont`) it adds a word to
 * every tier, since a contraction is everyday English. Possessives are never
 * listed: `dog's` is the letters of `dogs`, which the search already finds.
 *
 * The cap is a tripwire rather than a budget. If the two lists together ever
 * approach two thousand entries, the question is no longer "is this word real"
 * but "should the pin move", and that is a different decision.
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import Ajv2020, { type ValidateFunction } from 'ajv/dist/2020.js';

import { DIST_DIR, REPO_ROOT } from './paths.ts';
import { normalize } from './normalize.ts';
import { bitsetGet, decodeDict, type DictForm } from './format.ts';

export const VOCAB_DIR = resolve(REPO_ROOT, 'data/vocabulary');
export const ADDITIONS_PATH = resolve(VOCAB_DIR, 'additions.jsonl');
export const FORMS_PATH = resolve(VOCAB_DIR, 'forms.jsonl');
const SCHEMA_PATH = resolve(REPO_ROOT, 'data/schema/addition.schema.json');
const FORM_SCHEMA_PATH = resolve(REPO_ROOT, 'data/schema/form.schema.json');

/** The most additions and forms the two lists may hold together. A number the operator may tune. */
export const ADDITIONS_CAP = 2_000;

/** Which bitset holds the pinned list once the fourth tier exists. */
export const FULL_SET = 2;

export type AdditionKind = 'slang' | 'coinage' | 'name' | 'abbreviation' | 'loanword' | 'later-in-openlist';

export type Addition = {
  word: string;
  kind: AdditionKind;
  gloss: string;
  trace: string;
  proposed_by: string;
  added: string;
  note?: string;
};

export type FormKind = 'contraction' | 'hyphenated';

/** The parts of speech a form may name, as `TAGS` in packages/engine/src/wordOrder.ts lists them. */
export type FormPos = 'det' | 'pron' | 'prep' | 'conj' | 'adj' | 'adv' | 'noun' | 'verb' | 'interj';

export type Form = {
  /** The spelling as it reads: letters with at least one apostrophe or hyphen. */
  form: string;
  /** The word the search knows: the form with its apostrophes and hyphens dropped. */
  letters: string;
  kind: FormKind;
  gloss: string;
  trace: string;
  proposed_by: string;
  added: string;
  pos?: FormPos[];
  note?: string;
};

let validator: ValidateFunction<Addition> | null = null;
let formValidator: ValidateFunction<Form> | null = null;

export async function additionSchema(): Promise<ValidateFunction<Addition>> {
  if (!validator) {
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    const schema = JSON.parse(await readFile(SCHEMA_PATH, 'utf8')) as object;
    validator = ajv.compile<Addition>(schema);
  }
  return validator;
}

export async function formSchema(): Promise<ValidateFunction<Form>> {
  if (!formValidator) {
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    const schema = JSON.parse(await readFile(FORM_SCHEMA_PATH, 'utf8')) as object;
    formValidator = ajv.compile<Form>(schema);
  }
  return formValidator;
}

/** A readable one-line summary of why a record failed. */
export function explain(check: ValidateFunction): string {
  return (check.errors ?? [])
    .map((e) => `${e.instancePath || '/'} ${e.message ?? ''}`.trim())
    .join('; ');
}

/**
 * Every addition, in file order. Blank lines are allowed; anything the schema
 * refuses is an error naming the line, so a bad edit fails loudly rather than
 * quietly dropping a word out of the dictionary.
 */
export async function readAdditions(path = ADDITIONS_PATH): Promise<Addition[]> {
  return readLines(path, await additionSchema());
}

/** Every listed form, in file order, through the schema; no file is no forms. */
export async function readForms(path = FORMS_PATH): Promise<Form[]> {
  return readLines(path, await formSchema());
}

async function readLines<T>(path: string, check: ValidateFunction<T>): Promise<T[]> {
  let text: string;
  try {
    text = await readFile(path, 'utf8');
  } catch (error) {
    // No file yet is not a problem: the vocabulary is then exactly the pin.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }

  const out: T[] = [];
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (line.length === 0) continue;
    let value: unknown;
    try {
      value = JSON.parse(line);
    } catch {
      throw new Error(`${path}:${i + 1}: not JSON`);
    }
    if (!check(value)) throw new Error(`${path}:${i + 1}: ${explain(check)}`);
    out.push(value);
  }
  return out;
}

/**
 * The rules the schemas cannot state, as a list of problems. Empty means the
 * lists are admissible.
 *
 * `pinned` is the pinned word list when it is available; without it the
 * duplicate rule is skipped rather than guessed at, and the caller says so.
 * The forms share the additions' cap: one list of the site's own decisions.
 */
export function problemsWith(
  additions: readonly Addition[],
  pinned: ReadonlySet<string> | null,
  forms: readonly Form[] = [],
): string[] {
  const problems: string[] = [];

  if (additions.length + forms.length > ADDITIONS_CAP) {
    problems.push(
      `${additions.length} additions and ${forms.length} forms is over the cap of ${ADDITIONS_CAP} together`,
    );
  }

  const seen = new Set<string>();
  for (const addition of additions) {
    const { word } = addition;

    if (normalize(word) !== word) {
      problems.push(`${word}: not a search form; it normalizes to ${normalize(word) || 'nothing'}`);
    }
    if (seen.has(word)) problems.push(`${word}: listed more than once`);
    seen.add(word);

    if (pinned?.has(word)) {
      problems.push(`${word}: already in English OpenList at the pinned revision`);
    }

    // The admission rule says no private person's name. That judgement is the
    // operator's, made by merging; what can be checked here is that a word
    // admitted as a name points at somewhere public.
    if (addition.kind === 'name' && !/^https?:\/\//.test(addition.trace)) {
      problems.push(`${word}: a name needs a public URL as its trace`);
    }
  }

  const seenForms = new Set<string>();
  for (const { form, letters } of forms) {
    // The letters are what the search knows; the schema cannot check they are
    // the form's own, and a mismatch would list one spelling under another.
    if (normalize(form) !== letters) {
      problems.push(`${form}: its letters are ${normalize(form) || 'nothing'}, not ${letters}`);
    }
    if (seenForms.has(form)) problems.push(`${form}: listed more than once`);
    seenForms.add(form);
    // An addition is a word of its own; a form is a spelling of a word the
    // pin already has, or a contraction that is no word without its mark.
    if (seen.has(letters)) problems.push(`${form}: its letters ${letters} are a site addition, not a word a form can spell`);
  }

  return problems;
}

/**
 * The pinned list, read back from the committed artifacts rather than the 330 MB
 * source, so `vocab:check` is a tripwire CI can afford to run on every pull
 * request.
 *
 * Before the fourth tier exists the artifact carries two bitsets and the shipped
 * list *is* the pinned list; after it, the list is the union and bitset 2 marks
 * the pinned words. Both are handled, because the first run of this check
 * happens on a checkout built the old way.
 */
export async function pinnedWords(): Promise<ReadonlySet<string> | null> {
  return (await committedDictionary())?.pinned ?? null;
}

/**
 * The committed dictionary as it was built: every word it carries, which of
 * them came from the pin, and the revision it was pinned at.
 *
 * One decode serves both the duplicate check and the published dataset. A
 * second copy of this reading that drifted from the first would be a silent
 * wrong answer, not a crash.
 */
export async function committedDictionary(): Promise<{
  words: string[];
  pinned: ReadonlySet<string>;
  /** The listed forms the artifact carries, in file order. */
  forms: DictForm[];
  source: { repo: string; rev: string };
} | null> {
  type Manifest = {
    files: Record<string, { name: string } | undefined>;
    source?: { repo: string; rev: string };
  };
  let manifest: Manifest;
  try {
    manifest = JSON.parse(await readFile(resolve(DIST_DIR, 'manifest.json'), 'utf8')) as Manifest;
  } catch {
    return null;
  }

  const full = manifest.files['full']?.name;
  const tiers = manifest.files['tiers']?.name;
  if (!full) return null;
  const source = manifest.source ?? { repo: 'ryanjosephkamp/english-openlist', rev: 'unknown' };

  const { words, forms } = decodeDict(new Uint8Array(await readFile(resolve(DIST_DIR, full))));
  // A form-only letters-word (`dont`) sits in every tier's bitset, Full
  // included, and is still not the pin's: it is taken back out here.
  const formOnly = new Set(forms.filter((f) => f.shown).map((f) => f.letters));
  const fromPin = (word: string) => !formOnly.has(word);
  if (!tiers) return { words, pinned: new Set(words.filter(fromPin)), forms, source };

  const bits = new Uint8Array(await readFile(resolve(DIST_DIR, tiers)));
  const setCount = new DataView(bits.buffer, bits.byteOffset, bits.byteLength).getUint16(10, true);
  // Two bitsets means an artifact from before the fourth tier: every word in it
  // came from the pin.
  if (setCount <= FULL_SET) return { words, pinned: new Set(words.filter(fromPin)), forms, source };

  const setBytes = Math.ceil(words.length / 8);
  const fullSet = bits.subarray(16 + FULL_SET * setBytes, 16 + (FULL_SET + 1) * setBytes);
  return {
    words,
    pinned: new Set(words.filter((word, index) => bitsetGet(fullSet, index) && fromPin(word))),
    forms,
    source,
  };
}
