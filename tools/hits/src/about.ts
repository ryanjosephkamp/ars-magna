/**
 * What an input is: its `about` sentence and its `wikipedia` link.
 *
 * Both live on the candidate, which is the one place they are written, and
 * every hit of that input carries a copy so a published row is complete on
 * its own. `syncAbout` keeps the copies the same as the candidate; every tool
 * that writes either field calls it.
 *
 * The sentence is written four ways, and whichever comes first stays until a
 * person changes it: from Wikidata's English description (`hits:fetch`), by
 * the judge for an input that has none, from a submission's "What the input
 * is", or by the operator with `pnpm hits:describe`.
 *
 * Pure and free of the engine, so ingest in the routine's sandbox and the MCP
 * server can both import it.
 */
import type { Candidate, Hit } from './schema.ts';

export const ABOUT_MAX = 200;

/**
 * The schema's patterns, repeated here so the rule can be checked without
 * reading a file. `about.test.ts` checks that they match the schema's.
 */
export const ABOUT_PATTERN = /^\S[^\r\n\u2028\u2029]*\.["'”’)\]]?$/u;
export const WIKIPEDIA_PATTERN = /^https:\/\/en\.wikipedia\.org\/wiki\/\S+$/;

/** A sentence as the tools take it: runs of whitespace, newlines included, as one space, and none at either end. */
export function tidySentence(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Why a sentence cannot be an input's `about`, or null when it can. Length is
 * counted in code points, as the schema counts it. Give it a tidied sentence.
 */
export function aboutProblem(text: string): string | null {
  const length = [...text].length;
  if (length === 0) return 'the sentence is empty';
  if (length > ABOUT_MAX) return `the sentence is ${length} characters; keep it to ${ABOUT_MAX}`;
  if (!ABOUT_PATTERN.test(text)) return 'write one sentence on one line, ending with a full stop';
  return null;
}

/** Why a link cannot be an input's `wikipedia`, or null when it can. */
export function wikipediaProblem(url: string): string | null {
  return WIKIPEDIA_PATTERN.test(url) ? null : `${url} is not an English Wikipedia article address (https://en.wikipedia.org/wiki/…)`;
}

/** The candidate a hit belongs to: the first two parts of its id. */
export function candidateOf(hitId: string): string {
  return hitId.split(':').slice(0, 2).join(':');
}

/**
 * Every hit whose candidate exists takes that candidate's `about` and
 * `wikipedia`, and loses either field the candidate lacks. A hit with no
 * candidate line keeps what it has. With `ids`, only those inputs' hits are
 * touched, so a command's diff holds only what it was asked to change.
 * Returns the hits, in order, and the ids of the hits that changed.
 */
export function syncAbout(
  hits: readonly Hit[],
  candidates: readonly Candidate[],
  ids?: Iterable<string>,
): { hits: Hit[]; changed: string[] } {
  const only = ids === undefined ? null : new Set(ids);
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const changed: string[] = [];
  const out = hits.map((hit) => {
    const id = candidateOf(hit.id);
    if (only && !only.has(id)) return hit;
    const candidate = byId.get(id);
    if (!candidate) return hit;
    if (hit.about === candidate.about && hit.wikipedia === candidate.wikipedia) return hit;
    const { about: _about, wikipedia: _wikipedia, ...rest } = hit;
    const next: Hit = { ...rest };
    if (candidate.about !== undefined) next.about = candidate.about;
    if (candidate.wikipedia !== undefined) next.wikipedia = candidate.wikipedia;
    changed.push(hit.id);
    return next;
  });
  return { hits: out, changed };
}

/** Words that already do an article's work, counts included: "three waterfalls on the Niagara River". */
const DETERMINER =
  /^(?:the|a|an|one|any|some|each|every|this|that|these|those|his|her|its|their|our|my|your|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|several|many|multiple|various)\b/i;
/** A title held by one person or body: "President of the United States", "Mayor of New York City". */
const TITLE_OF = /^\p{Lu}[\p{L}'’.-]*(?: \p{Lu}[\p{L}'’.-]*)* of /u;
/** Letters whose names begin with a vowel sound: "an NFL team", "an SUV". */
const VOWEL_LETTER_NAMES = 'AEFHILMNORSX';
/** Something there is one of: "the capital and most populous city of France", "the headquarters of the Metropolitan Police". */
const ONE_OF = /^(?:(?:second|third|fourth|fifth)-)?(?:most|least|largest|biggest|smallest|highest|lowest|longest|shortest|oldest|youngest|first|last|only|main|principal|capital|seat|headquarters)\b/i;

/** "a", "an", "the", or nothing, for a noun phrase read aloud. */
export function articleFor(phrase: string): '' | 'a' | 'an' | 'the' {
  if (DETERMINER.test(phrase) || TITLE_OF.test(phrase)) return '';
  if (ONE_OF.test(phrase)) return 'the';
  const word = phrase.split(/[\s(]/, 1)[0] ?? '';
  // An initialism is read letter by letter: "an NFL team", "a U.S. bank".
  if ((/^[A-Z]{2,}(?:\b|[-/])/.test(word) && !/^[A-Z][a-z]/.test(word)) || /^(?:[A-Z]\.){2,}/.test(word)) {
    return VOWEL_LETTER_NAMES.includes(word[0]!) ? 'an' : 'a';
  }
  const digits = /^\d+/.exec(word)?.[0];
  if (digits) {
    // Eight, eighty, eight hundred; eleven and eighteen, as a number or a year like 1850.
    if (digits.startsWith('8')) return 'an';
    if ((digits.length === 2 || digits.length === 4) && /^1[18]/.test(digits)) return 'an';
    return 'a';
  }
  const lower = word.toLowerCase();
  if (/^(?:hour|honest|honou?r|heir)/.test(lower)) return 'an';
  // Vowel letters read as a consonant: "a university", "a European", "a one-off", "a Ukrainian".
  if (/^(?:uni|use|usu|uti|ura|ure|uro|uru|uga|ukr|uta|eu|ewe|one\b|once)/.test(lower)) return 'a';
  return /^[aeiou]/.test(lower) ? 'an' : 'a';
}

/**
 * A sentence from Wikidata's English description, which is a fragment like
 * "American singer-songwriter (1946–2026)": the input, "is" or "was", an
 * article, the description, a full stop. "Was" when the item has a date of
 * death or dissolution, unless the description already says "former" or
 * "defunct". Null when there is no usable description, when it is a
 * Wikimedia page of its own, or when the sentence would break the rule.
 */
export function sentenceFromWikidata(input: string, description: string | null | undefined, ended: boolean): string | null {
  const text = tidySentence(description ?? '');
  if (text.length === 0 || /^Wikimedia /i.test(text)) return null;
  const verb = ended && !/^(?:former|defunct)\b/i.test(text) ? 'was' : 'is';
  const article = articleFor(text);
  const sentence = `${tidySentence(input)} ${verb} ${article ? `${article} ` : ''}${text}${text.endsWith('.') ? '' : '.'}`;
  return aboutProblem(sentence) === null ? sentence : null;
}
