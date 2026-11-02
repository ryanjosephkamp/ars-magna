import { useEffect, useState } from 'react';

import type { PublicHit } from '../hits/build.ts';
import { keySha256 } from '../votes/core.ts';

/** hits.json: the published hits, and the codes of the anagrams that are blocked. */
type SiteList = { hits: PublicHit[]; blocked: ReadonlySet<string> };

let loading: Promise<SiteList> | null = null;
/** The block list once hits.json has arrived, so a row can be answered without waiting. */
let loadedBlocked: ReadonlySet<string> | null = null;

/**
 * hits.json, fetched once per page load. A failed fetch is forgotten, so the
 * next search asks again rather than a network blip hiding Discover for the
 * rest of the visit.
 */
function loadSiteList(): Promise<SiteList> {
  if (!loading) {
    const pending = fetch('/hits.json')
      .then((r) => (r.ok ? (r.json() as Promise<{ hits: PublicHit[]; blocked?: string[] }>) : Promise.reject(new Error(String(r.status)))))
      .then((body) => {
        loadedBlocked = new Set(body.blocked ?? []);
        return { hits: body.hits, blocked: loadedBlocked };
      });
    loading = pending;
    pending.catch(() => {
      if (loading === pending) loading = null;
    });
  }
  return loading;
}

/**
 * The published hits once `enabled`: null until they arrive, and while they
 * cannot be had. `attempt` changes when it is worth asking again after a
 * failure: the search page passes its letters.
 */
export function usePublishedHits(enabled: boolean, attempt: string): readonly PublicHit[] | null {
  const [hits, setHits] = useState<readonly PublicHit[] | null>(null);

  useEffect(() => {
    if (!enabled || hits) return;
    let live = true;
    loadSiteList().then(
      (loaded) => {
        if (live) setHits(loaded.hits);
      },
      () => {},
    );
    return () => {
      live = false;
    };
  }, [enabled, attempt, hits]);

  return hits;
}

const known = new Map<string, boolean>();

/** Whether a promotion key is on the block list, once hits.json and the key's code are known. */
async function isBlocked(key: string): Promise<boolean> {
  const { blocked } = await loadSiteList();
  if (blocked.size === 0) return false;
  const cached = known.get(key);
  if (cached !== undefined) return cached;
  const answer = blocked.has(await keySha256(key));
  known.set(key, answer);
  return answer;
}

/**
 * Whether the anagram with this promotion key is blocked: null until it is
 * known, then true or false. A blocked anagram offers no Promote and no
 * Submit. With an empty block list, the answer is false at once.
 */
export function useBlocked(key: string): boolean | null {
  const now = (): { key: string; blocked: boolean } | null => {
    if (loadedBlocked?.size === 0) return { key, blocked: false };
    const cached = known.get(key);
    return cached === undefined ? null : { key, blocked: cached };
  };
  const [state, setState] = useState(now);
  // An empty block list, the usual case, answers at once, so no row's Promote arrives a moment late.
  const settled = state?.key === key ? state : now();

  useEffect(() => {
    if (settled) return;
    let live = true;
    isBlocked(key).then(
      (blocked) => {
        if (live) setState({ key, blocked });
      },
      // Without hits.json the page cannot know; the API still refuses a blocked promotion.
      () => {
        if (live) setState({ key, blocked: false });
      },
    );
    return () => {
      live = false;
    };
  }, [key, settled]);

  return settled ? settled.blocked : null;
}
