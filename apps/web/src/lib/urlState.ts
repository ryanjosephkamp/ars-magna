/**
 * Query <-> URL hash.
 *
 * The whole query lives in the fragment so a search is a link: paste it to
 * someone and they see exactly what you saw, same dictionary, same filters.
 * The fragment rather than the query string because none of this is the
 * server's business — the app is static and the search runs on the reader's
 * own machine.
 *
 * Only non-default values are written, so an ordinary search produces
 * `#q=dormitory` rather than a wall of parameters.
 */
import {
  DEFAULT_QUERY,
  TIERS,
  UNLIMITED_WORDS,
  DROP,
  formatReading,
  nonDefaultReading,
  normalizeLetters,
  parseReading,
  readItems,
  type Query,
  type Reading,
  type Tier,
} from '@ars-magna/engine';

const KEY = {
  input: 'q',
  tier: 't',
  minWordLen: 'm',
  maxWords: 'w',
  mustInclude: 'i',
  mustExclude: 'x',
  /** Phrases kept at the top: a shared anagram in the order the sharer chose. */
  kept: 'p',
  /** How the input's numbers and symbols are read, where that differs from the defaults: `182:digits,2:too`. */
  reading: 'r',
} as const;

function clampInt(raw: string | null, min: number, max: number, fallback: number): number {
  if (raw === null) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function encodeQuery(query: Query): string {
  const params = new URLSearchParams();

  if (query.input.trim().length > 0) params.set(KEY.input, query.input);
  if (query.tier !== DEFAULT_QUERY.tier) params.set(KEY.tier, query.tier);
  if (query.minWordLen !== DEFAULT_QUERY.minWordLen) {
    params.set(KEY.minWordLen, String(query.minWordLen));
  }
  if (query.maxWords !== DEFAULT_QUERY.maxWords) params.set(KEY.maxWords, String(query.maxWords));

  const pinned = query.mustInclude.filter((word) => word.length > 0);
  if (pinned.length > 0) params.set(KEY.mustInclude, pinned.join(','));
  const excluded = query.mustExclude.filter((word) => word.length > 0);
  if (excluded.length > 0) params.set(KEY.mustExclude, excluded.join(','));
  // Only what differs from the defaults, and only for items the input has.
  const reading = formatReading(nonDefaultReading(query.input, query.reading));
  if (reading.length > 0) params.set(KEY.reading, reading);

  // URLSearchParams percent-encodes spaces as `+`, which reads badly in a
  // shared link. Spaces are legal in a fragment, so put them back.
  return params.toString().replace(/\+/g, '%20');
}

export function decodeQuery(hash: string): Query {
  const params = new URLSearchParams(hash.replace(/^#/, ''));

  const rawTier = params.get(KEY.tier);
  const tier: Tier = TIERS.includes(rawTier as Tier) ? (rawTier as Tier) : DEFAULT_QUERY.tier;

  const words = (key: string) =>
    (params.get(key) ?? '')
      .split(',')
      .map((word) => normalizeLetters(word))
      .filter((word) => word.length > 0);
  const mustInclude = words(KEY.mustInclude);
  // A link cannot ask for a word both ways; Must include keeps it.
  const mustExclude = words(KEY.mustExclude).filter((word) => !mustInclude.includes(word));
  const input = params.get(KEY.input) ?? '';

  return {
    input,
    tier,
    minWordLen: clampInt(params.get(KEY.minWordLen), 1, 12, DEFAULT_QUERY.minWordLen),
    maxWords: clampInt(params.get(KEY.maxWords), 1, UNLIMITED_WORDS, DEFAULT_QUERY.maxWords),
    mustInclude,
    mustExclude,
    reading: decodeReading(params.get(KEY.reading), input),
  };
}

/**
 * The readings a link carries, kept only where the input has the item and
 * the item offers the reading: a link cannot make the page read a number a
 * way the table does not know.
 */
export function decodeReading(raw: string | null, input: string): Reading {
  if (!raw) return DEFAULT_QUERY.reading;
  const parsed = parseReading(raw);
  if (!parsed) return DEFAULT_QUERY.reading;
  return nonDefaultReading(input, parsed);
}

/**
 * The first word that is in both Must include and Must exclude, or null. The
 * search page refuses a change that would put one there, since no anagram can
 * both contain a word and leave it out.
 */
export function inBoth(mustInclude: readonly string[], mustExclude: readonly string[]): string | null {
  return mustInclude.find((word) => mustExclude.includes(word)) ?? null;
}

/** The sentence under either field when a change would put `word` in both. */
export function inBothSentence(word: string): string {
  return `No anagram can both contain and leave out “${word}”.`;
}

/**
 * Split a decoded query into the text and everything else.
 *
 * The app keeps `input` in its own state, so the rest of the query is held as
 * `Omit<Query, 'input'>`. That is a *compile-time* shape only: a whole `Query`
 * satisfies it while still carrying `input` at runtime, and a later
 * `{ ...filters }` then puts that stale value back over whatever the reader has
 * typed. Doing the split here makes the runtime shape match the type.
 */
export function splitQuery(query: Query): {
  input: string;
  filters: Omit<Query, 'input'>;
} {
  const { input, ...filters } = query;
  return { input, filters };
}

/**
 * Write the query to the address bar without adding a history entry.
 *
 * `replaceState`, not `pushState`: the query updates on every keystroke, and
 * pushing would make the back button walk backwards through each letter the
 * user typed.
 */
export function syncUrl(query: Query): void {
  const encoded = encodeQuery(query);
  const next = `${window.location.pathname}${window.location.search}${encoded ? `#${encoded}` : ''}`;
  if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
    window.history.replaceState(null, '', next);
  }
}

/** The full URL for the current query, for copying and sharing. */
export function shareUrl(query: Query): string {
  const encoded = encodeQuery(query);
  return `${window.location.origin}${window.location.pathname}${encoded ? `#${encoded}` : ''}`;
}

/**
 * A phrase as the kept list holds it: each word folded the way the engine
 * folds the query, single spaces between. `Dirty  Room` and `dirty room` are
 * the same kept phrase.
 */
export function cleanPhrase(phrase: string): string {
  return phrase
    .split(/\s+/)
    .map((word) => normalizeLetters(word))
    .filter((word) => word.length > 0)
    .join(' ');
}

/** The query plus phrases to keep, for a link to one anagram. */
export function encodeShared(query: Query, kept: readonly string[]): string {
  const base = encodeQuery(query);
  const phrases = kept.map(cleanPhrase).filter((phrase) => phrase.length > 0);
  if (phrases.length === 0) return base;
  const params = new URLSearchParams([[KEY.kept, phrases.join(',')]]);
  const encoded = params.toString().replace(/\+/g, '%20');
  return base ? `${base}&${encoded}` : encoded;
}

function sortedLetters(letters: string): string {
  return [...letters].sort().join('');
}

/**
 * The kept phrases in a hash that really are anagrams of `input`, in the
 * order given and without repeats. Anything else is dropped: a link cannot
 * make the page show a phrase the letters do not spell.
 */
export function keptPhrases(hash: string, input: string, reading: Reading = DEFAULT_QUERY.reading): string[] {
  const raw = new URLSearchParams(hash.replace(/^#/, '')).get(KEY.kept);
  if (!raw) return [];
  const target = sortedLetters(normalizeLetters(input, reading));
  if (target.length === 0) return [];
  const out: string[] = [];
  for (const item of raw.split(',')) {
    const phrase = cleanPhrase(item);
    if (phrase.length === 0 || out.includes(phrase)) continue;
    if (sortedLetters(phrase.replace(/ /g, '')) !== target) continue;
    out.push(phrase);
  }
  return out;
}

// ------------------------------------------------------------------- Build

/** The Build page's own parameters, by the same rules: `t` the text, `a` the anagram, `d` the dictionary, `r` the text's reading. */
const BUILD_KEY = { text: 't', anagram: 'a', tier: 'd', reading: 'r' } as const;

export type BuildState = {
  readonly text: string;
  readonly anagram: string;
  readonly tier: Tier;
  /** How the text's numbers and symbols are read, where that differs from the defaults. */
  readonly reading: Reading;
};

export const BUILD_DEFAULT: BuildState = { text: '', anagram: '', tier: DEFAULT_QUERY.tier, reading: DEFAULT_QUERY.reading };

/** Only what differs from an empty page, so a shared check is a short link. */
export function encodeBuild(state: BuildState): string {
  const params = new URLSearchParams();
  if (state.text.trim().length > 0) params.set(BUILD_KEY.text, state.text);
  if (state.anagram.trim().length > 0) params.set(BUILD_KEY.anagram, state.anagram);
  if (state.tier !== BUILD_DEFAULT.tier) params.set(BUILD_KEY.tier, state.tier);
  const reading = formatReading(nonDefaultReading(state.text, state.reading));
  if (reading.length > 0) params.set(BUILD_KEY.reading, reading);
  return params.toString().replace(/\+/g, '%20');
}

export function decodeBuild(hash: string): BuildState {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const rawTier = params.get(BUILD_KEY.tier);
  const text = params.get(BUILD_KEY.text) ?? '';
  return {
    text,
    anagram: params.get(BUILD_KEY.anagram) ?? '',
    tier: TIERS.includes(rawTier as Tier) ? (rawTier as Tier) : BUILD_DEFAULT.tier,
    reading: decodeReading(params.get(BUILD_KEY.reading), text),
  };
}

/** Write the boxes to the address bar without adding a history entry, as the search does. */
export function syncBuildUrl(state: BuildState): void {
  const encoded = encodeBuild(state);
  const next = `${window.location.pathname}${window.location.search}${encoded ? `#${encoded}` : ''}`;
  if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
    window.history.replaceState(null, '', next);
  }
}

/**
 * Where Build opens with these boxes filled: what a search result row, a
 * Discover row and the search toolbar link to. Relative, since every one of
 * them is on this site.
 */
export function buildHref(text: string, anagram = '', reading: Reading = DEFAULT_QUERY.reading): string {
  const encoded = encodeBuild({ ...BUILD_DEFAULT, text, anagram, reading });
  return `/build${encoded ? `#${encoded}` : ''}`;
}

/**
 * Where the search opens on a hit's input, read as the hit records it: a hit
 * made before phase N carries no reading and was read with every number
 * dropped, so its link says so, and one read by the defaults needs nothing.
 */
export function searchHref(input: string, reading: Reading | null | undefined): string {
  const encoded = encodeQuery({ ...DEFAULT_QUERY, input, reading: reading ?? legacyReading(input) });
  return `/${encoded ? `#${encoded}` : ''}`;
}

/** The reading a record made before phase N was made under: every item left out. */
export function legacyReading(input: string): Reading {
  return Object.fromEntries(readItems(input).map((item) => [item.key, DROP]));
}

/** The full URL for one anagram of the current query, kept at the top in this order. */
export function shareRowUrl(query: Query, phrase: string): string {
  const encoded = encodeShared(query, [phrase]);
  return `${window.location.origin}${window.location.pathname}${encoded ? `#${encoded}` : ''}`;
}
