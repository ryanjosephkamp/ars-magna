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
import { DEFAULT_QUERY, TIERS, UNLIMITED_WORDS, type Query, type Tier } from '@ars-magna/engine';

const KEY = {
  input: 'q',
  tier: 't',
  minWordLen: 'm',
  maxWords: 'w',
  mustInclude: 'i',
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

  // URLSearchParams percent-encodes spaces as `+`, which reads badly in a
  // shared link. Spaces are legal in a fragment, so put them back.
  return params.toString().replace(/\+/g, '%20');
}

export function decodeQuery(hash: string): Query {
  const params = new URLSearchParams(hash.replace(/^#/, ''));

  const rawTier = params.get(KEY.tier);
  const tier: Tier = TIERS.includes(rawTier as Tier) ? (rawTier as Tier) : DEFAULT_QUERY.tier;

  const mustInclude = (params.get(KEY.mustInclude) ?? '')
    .split(',')
    .map((word) => word.replace(/[^a-zA-Z]/g, '').toLowerCase())
    .filter((word) => word.length > 0);

  return {
    input: params.get(KEY.input) ?? '',
    tier,
    minWordLen: clampInt(params.get(KEY.minWordLen), 1, 12, DEFAULT_QUERY.minWordLen),
    maxWords: clampInt(params.get(KEY.maxWords), 1, UNLIMITED_WORDS, DEFAULT_QUERY.maxWords),
    mustInclude,
  };
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
