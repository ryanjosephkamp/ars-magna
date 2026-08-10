/**
 * WordNet 3.1 parsing, including enough of Morphy to match inflected words.
 *
 * Three file families matter. `data.<pos>` holds one synset per line, ending in
 * ` | ` followed by the gloss. `index.<pos>` maps a lemma to its synset offsets
 * **in sense order**, most frequent first — which is the whole reason to parse
 * the index files at all rather than reading glosses straight out of `data`.
 * Without that ordering, the first definition shown for `bank` would be
 * whichever synset happened to sit lowest in the file.
 *
 * `<pos>.exc` holds irregular inflections. It matters more than it sounds:
 * English OpenList is full of inflected forms (`dormitories`, `abandoning`,
 * `abbots`) that WordNet only stores as base lemmas, so a direct lookup finds a
 * definition for barely a sixth of the list. Morphy — WordNet's own detachment
 * rules plus these exception lists — closes most of that gap.
 *
 * Format reference: `man 5 wndb` and `man 7 morphy`.
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { normalize } from './normalize.ts';

export type PartOfSpeech = 'n' | 'v' | 'adj' | 'adv';

export type Sense = {
  readonly pos: PartOfSpeech;
  readonly gloss: string;
  /** Set when the definition belongs to a base form, e.g. `dormitories` -> `dormitory`. */
  readonly base?: string;
};

const FILES: { file: string; pos: PartOfSpeech }[] = [
  { file: 'noun', pos: 'n' },
  { file: 'verb', pos: 'v' },
  { file: 'adj', pos: 'adj' },
  { file: 'adv', pos: 'adv' },
];

/**
 * Morphy's suffix detachment rules, in WordNet's own order. Order matters:
 * `ies -> y` must be tried before `s -> ''`, or `dormitories` reduces to
 * `dormitorie` and finds nothing.
 */
const DETACH: Record<PartOfSpeech, [string, string][]> = {
  n: [
    ['ches', 'ch'],
    ['shes', 'sh'],
    ['ses', 's'],
    ['xes', 'x'],
    ['zes', 'z'],
    ['ies', 'y'],
    ['men', 'man'],
    ['s', ''],
  ],
  v: [
    ['ies', 'y'],
    ['es', 'e'],
    ['es', ''],
    ['ed', 'e'],
    ['ed', ''],
    ['ing', 'e'],
    ['ing', ''],
    ['s', ''],
  ],
  adj: [
    ['est', ''],
    ['est', 'e'],
    ['er', ''],
    ['er', 'e'],
  ],
  adv: [],
};

/**
 * WordNet glosses run "definition; \"example\"; \"example\"". Only the
 * definition is wanted — the examples roughly triple the payload and a result
 * row has no room for them.
 */
function definitionOf(gloss: string): string {
  let text = gloss.trim();
  const firstExample = text.search(/;\s*"/);
  if (firstExample !== -1) text = text.slice(0, firstExample);
  return text.replace(/[;\s]+$/, '').trim();
}

/** Lines in the WordNet data files begin with a copyright block indented two spaces. */
function isDataLine(line: string): boolean {
  return line.length > 0 && !line.startsWith('  ');
}

async function readGlosses(dir: string): Promise<Map<string, string>> {
  const glosses = new Map<string, string>();
  for (const { file, pos } of FILES) {
    const text = await readFile(resolve(dir, `data.${file}`), 'latin1');
    for (const line of text.split('\n')) {
      if (!isDataLine(line)) continue;
      const bar = line.indexOf('|');
      if (bar === -1) continue;
      const definition = definitionOf(line.slice(bar + 1));
      if (definition.length > 0) glosses.set(`${pos}:${line.slice(0, 8)}`, definition);
    }
  }
  return glosses;
}

type PosIndex = {
  /** normalized lemma -> synset offsets, in sense order */
  lemmas: Map<string, string[]>;
  /** normalized inflected form -> normalized base form */
  exceptions: Map<string, string>;
};

async function readIndex(dir: string, file: string): Promise<PosIndex> {
  const lemmas = new Map<string, string[]>();

  const indexText = await readFile(resolve(dir, `index.${file}`), 'latin1');
  for (const line of indexText.split('\n')) {
    if (!isDataLine(line)) continue;
    const fields = line.trim().split(/\s+/);
    if (fields.length < 6) continue;

    const word = normalize(fields[0]!);
    if (word.length === 0) continue;

    const synsetCount = Number.parseInt(fields[2]!, 10);
    const pointerCount = Number.parseInt(fields[3]!, 10);
    if (!Number.isFinite(synsetCount) || !Number.isFinite(pointerCount)) continue;

    // lemma pos synset_cnt p_cnt [ptr...] sense_cnt tagsense_cnt offsets...
    const offsetsAt = 4 + pointerCount + 2;
    const offsets = fields.slice(offsetsAt, offsetsAt + synsetCount);
    if (offsets.length === 0) continue;

    // Two surface lemmas can normalize together (`co-op`, `coop`); keep both
    // sets of senses rather than letting one overwrite the other.
    const existing = lemmas.get(word);
    if (existing) existing.push(...offsets);
    else lemmas.set(word, offsets);
  }

  const exceptions = new Map<string, string>();
  const excText = await readFile(resolve(dir, `${file}.exc`), 'latin1');
  for (const line of excText.split('\n')) {
    // "inflected base [base...]" — the first base is the one to use.
    const parts = line.trim().split(/\s+/);
    if (parts.length < 2) continue;
    const inflected = normalize(parts[0]!);
    const base = normalize(parts[1]!);
    if (inflected.length > 0 && base.length > 0) exceptions.set(inflected, base);
  }

  return { lemmas, exceptions };
}

/**
 * Candidate base forms for `word` under one part of speech, best guess first.
 * The exception list wins over the rules: `men` is `man`, not `me` + `n`.
 */
function baseForms(word: string, pos: PartOfSpeech, index: PosIndex): string[] {
  const out: string[] = [];

  const exception = index.exceptions.get(word);
  if (exception !== undefined) out.push(exception);

  for (const [suffix, replacement] of DETACH[pos]) {
    if (!word.endsWith(suffix)) continue;
    const stem = word.slice(0, word.length - suffix.length) + replacement;
    // Guard against reductions that leave nothing meaningful behind.
    if (stem.length >= 2 && stem !== word) out.push(stem);
  }

  return out;
}

/**
 * Build `normalized word -> senses`, keeping at most `maxSenses` per word and
 * only for words the caller recognizes.
 *
 * `keep` is the app's own dictionary: WordNet has ~148k lemmas including
 * multiword entries like `physical_entity`, and there is no reason to ship a
 * definition for something that can never appear in a result.
 */
export async function loadSenses(options: {
  dir: string;
  keep: ReadonlySet<string>;
  maxSenses: number;
}): Promise<{ senses: Map<string, Sense[]>; direct: number; derived: number }> {
  const { dir, keep, maxSenses } = options;

  const glosses = await readGlosses(dir);
  const indexes = new Map<PartOfSpeech, PosIndex>();
  for (const { file, pos } of FILES) indexes.set(pos, await readIndex(dir, file));

  const senses = new Map<string, Sense[]>();
  let direct = 0;
  let derived = 0;

  const collect = (word: string, lemma: string, pos: PartOfSpeech, offsets: string[]): void => {
    const list = senses.get(word) ?? [];
    for (const offset of offsets) {
      if (list.length >= maxSenses) break;
      const gloss = glosses.get(`${pos}:${offset}`);
      if (gloss === undefined) continue;
      // The same gloss can arrive twice via two lemmas or two base forms;
      // showing one sentence twice looks like a bug.
      if (list.some((sense) => sense.gloss === gloss)) continue;
      list.push(lemma === word ? { pos, gloss } : { pos, gloss, base: lemma });
    }
    if (list.length > 0) senses.set(word, list);
  };

  for (const word of keep) {
    // Direct hits first, across every part of speech, so a word that is its own
    // lemma never gets attributed to some other base form.
    let hit = false;
    for (const { pos } of FILES) {
      const offsets = indexes.get(pos)!.lemmas.get(word);
      if (offsets) {
        collect(word, word, pos, offsets);
        hit = true;
      }
    }
    if (hit) {
      direct++;
      continue;
    }

    for (const { pos } of FILES) {
      const index = indexes.get(pos)!;
      for (const base of baseForms(word, pos, index)) {
        const offsets = index.lemmas.get(base);
        if (offsets) {
          collect(word, base, pos, offsets);
          hit = true;
          break;
        }
      }
    }
    if (hit) derived++;
  }

  return { senses, direct, derived };
}
