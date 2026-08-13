/**
 * WordNet 3.1 parsing, including enough of Morphy to match inflected words.
 *
 * Four file families matter. `data.<pos>` holds one synset per line, ending in
 * ` | ` followed by the gloss. `index.<pos>` maps a lemma to its synset offsets
 * in sense order, which is why the index files are parsed at all rather than
 * reading glosses straight out of `data`.
 *
 * That ordering is only meaningful *within* one part of speech, and relying on
 * it across parts of speech is what made `be` a metallic element and `do` an
 * uproarious party: nouns were collected first and the three-sense budget was
 * spent before any verb was reached. `index.sense` is the fix — it carries a
 * **tag count** per sense, the number of times that exact sense was tagged in
 * WordNet's hand-annotated corpus. The verb `be` scores 10,742; beryllium
 * scores 0. Senses are ranked by it, so the three shown are the three a reader
 * is most likely to have meant.
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
import { CURATED, type CuratedPos } from './glosses.ts';

/** The four WordNet carries. Curated glosses add the closed classes it does not. */
export type PartOfSpeech = 'n' | 'v' | 'adj' | 'adv';

export type Sense = {
  readonly pos: CuratedPos;
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
  // The `-ly` rules live here, under the adjective, because that is where the
  // base form actually is: `bizarrely` reduces to `bizarre`, which WordNet
  // stores as an adjective. Filed under `adv` they matched nothing at all,
  // because the adverb index has no entry for `bizarre`. Morphy has no adverb
  // rules of its own -- WordNet stores adverbs as whole lemmas -- so these are
  // an addition to it rather than part of it.
  adj: [
    ['est', ''],
    ['est', 'e'],
    ['er', ''],
    ['er', 'e'],
    ['ily', 'y'],
    ['ly', ''],
    ['ly', 'e'],
  ],
  adv: [],
};

/**
 * One extra noun rule, tried after Morphy's own: the plural of an agent noun.
 *
 * `rectifiers`, `wrigglers` and `digesters` were undefined while `rectifier`,
 * `wriggler` and `digester` were right there. Mapping the plural to the
 * singular is safe because the singular has to exist in WordNet for it to
 * apply at all.
 *
 * Stripping `-er` itself was tried and reverted. It looks like the same idea
 * and is not: it attributes the base's meaning to the agent, so `carer` came
 * out as "a motor vehicle with four wheels", `baller` as "round object that is
 * hit or thrown", `basher` as "a vigorous blow". Producing a confident wrong
 * definition is the exact failure this work exists to remove, and leaving those
 * words undefined is the better outcome.
 */
const EXTRA_NOUN: [string, string][] = [['ers', 'er']];

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

/**
 * `lemma|pos|offset` -> corpus tag count, from `index.sense`.
 *
 * Each line is `sense_key offset sense_number tag_cnt`, where the key is
 * `lemma%ss_type:…`. `ss_type` runs 1..5 for noun, verb, adjective, adverb and
 * adjective-satellite; satellites are adjectives for our purposes.
 *
 * Absent means zero: a sense that never appeared in the tagged corpus. Most
 * senses are absent, which is fine — the count only has to separate the handful
 * that are genuinely common from the long tail that is not.
 */
async function readSenseTags(dir: string): Promise<Map<string, number>> {
  const tags = new Map<string, number>();
  const byType: Record<string, PartOfSpeech> = {
    '1': 'n',
    '2': 'v',
    '3': 'adj',
    '4': 'adv',
    '5': 'adj',
  };

  const text = await readFile(resolve(dir, 'index.sense'), 'latin1');
  for (const line of text.split('\n')) {
    const fields = line.split(' ');
    if (fields.length < 4) continue;

    const percent = fields[0]!.indexOf('%');
    if (percent === -1) continue;

    const lemma = normalize(fields[0]!.slice(0, percent));
    const pos = byType[fields[0]![percent + 1]!];
    if (lemma.length === 0 || pos === undefined) continue;

    const count = Number.parseInt(fields[3]!, 10);
    if (!Number.isFinite(count) || count <= 0) continue;

    // Two surface lemmas can normalize together; keep the larger count rather
    // than whichever line happened to come last.
    const key = `${lemma}|${pos}|${fields[1]}`;
    tags.set(key, Math.max(tags.get(key) ?? 0, count));
  }
  return tags;
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

  const rules = pos === 'n' ? [...DETACH[pos], ...EXTRA_NOUN] : DETACH[pos];
  for (const [suffix, replacement] of rules) {
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
}): Promise<{
  senses: Map<string, Sense[]>;
  direct: number;
  derived: number;
  curated: number;
}> {
  const { dir, keep, maxSenses } = options;

  const glosses = await readGlosses(dir);
  const tags = await readSenseTags(dir);
  const indexes = new Map<PartOfSpeech, PosIndex>();
  for (const { file, pos } of FILES) indexes.set(pos, await readIndex(dir, file));

  const senses = new Map<string, Sense[]>();
  let direct = 0;
  let derived = 0;
  let curated = 0;

  /** One WordNet sense, with everything needed to rank it against the others. */
  type Candidate = {
    readonly pos: PartOfSpeech;
    readonly gloss: string;
    readonly lemma: string;
    readonly tag: number;
    /** Position within this lemma's senses for this part of speech. */
    readonly rank: number;
    readonly posOrder: number;
  };

  const gather = (
    into: Candidate[],
    lemma: string,
    pos: PartOfSpeech,
    posOrder: number,
    offsets: string[],
  ): void => {
    for (let rank = 0; rank < offsets.length; rank++) {
      const offset = offsets[rank]!;
      const gloss = glosses.get(`${pos}:${offset}`);
      if (gloss === undefined) continue;
      into.push({
        pos,
        gloss,
        lemma,
        tag: tags.get(`${lemma}|${pos}|${offset}`) ?? 0,
        rank,
        posOrder,
      });
    }
  };

  for (const word of keep) {
    const candidates: Candidate[] = [];

    // Direct hits first, across every part of speech, so a word that is its own
    // lemma never gets attributed to some other base form.
    FILES.forEach(({ pos }, posOrder) => {
      const offsets = indexes.get(pos)!.lemmas.get(word);
      if (offsets) gather(candidates, word, pos, posOrder, offsets);
    });

    const isDirect = candidates.length > 0;
    if (!isDirect) {
      FILES.forEach(({ pos }, posOrder) => {
        const index = indexes.get(pos)!;
        for (const base of baseForms(word, pos, index)) {
          const offsets = index.lemmas.get(base);
          if (offsets) {
            gather(candidates, base, pos, posOrder, offsets);
            break;
          }
        }
      });
    }

    const curatedSenses = CURATED.get(word);
    if (candidates.length === 0 && curatedSenses === undefined) continue;
    if (curatedSenses !== undefined) curated++;
    if (candidates.length > 0) {
      if (isDirect) direct++;
      else derived++;
    }

    // Corpus frequency decides. Ties fall back to WordNet's own sense order,
    // and only then to the order the parts of speech happen to be listed in —
    // so when nothing is tagged a reader gets one sense per part of speech
    // rather than three readings of the same noun.
    candidates.sort(
      (a, b) => b.tag - a.tag || a.rank - b.rank || a.posOrder - b.posOrder,
    );

    // Curated first, WordNet behind it. `mine` keeps its excavation, `ar` gains
    // the letter R ahead of argon.
    const list: Sense[] = curatedSenses === undefined ? [] : [...curatedSenses].slice(0, maxSenses);

    for (const c of candidates) {
      if (list.length >= maxSenses) break;
      // The same gloss can arrive twice via two lemmas or two base forms;
      // showing one sentence twice looks like a bug.
      if (list.some((sense) => sense.gloss === c.gloss)) continue;
      list.push(
        c.lemma === word ? { pos: c.pos, gloss: c.gloss } : { pos: c.pos, gloss: c.gloss, base: c.lemma },
      );
    }
    if (list.length > 0) senses.set(word, list);
  }

  return { senses, direct, derived, curated };
}
