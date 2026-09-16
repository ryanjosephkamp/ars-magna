import { useEffect, useState } from 'react';

import type { PublicHit } from '../hits/build.ts';

let loading: Promise<PublicHit[]> | null = null;

/**
 * The published hits, fetched once per page load. A failed fetch is
 * forgotten, so the next search asks again rather than a network blip hiding
 * Discoveries for the rest of the visit.
 */
function loadHits(): Promise<PublicHit[]> {
  if (!loading) {
    const pending = fetch('/hits.json')
      .then((r) => (r.ok ? (r.json() as Promise<{ hits: PublicHit[] }>) : Promise.reject(new Error(String(r.status)))))
      .then((body) => body.hits);
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
    loadHits().then(
      (loaded) => {
        if (live) setHits(loaded);
      },
      () => {},
    );
    return () => {
      live = false;
    };
  }, [enabled, attempt, hits]);

  return hits;
}
