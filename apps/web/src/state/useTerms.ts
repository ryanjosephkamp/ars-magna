import { useEffect, useState } from 'react';

import type { Term, TermsFile } from '../lib/terms.ts';

let loading: Promise<readonly Term[]> | null = null;

/**
 * terms.json, fetched once per page load: the labelled terms of the class
 * files, which the word panel explains and the Terms control counts on. A
 * failed fetch is forgotten, so the next attempt asks again rather than a
 * network blip leaving every term unexplained for the visit.
 */
function loadTerms(): Promise<readonly Term[]> {
  if (!loading) {
    const pending = fetch('/terms.json')
      .then((r) => (r.ok ? (r.json() as Promise<TermsFile>) : Promise.reject(new Error(String(r.status)))))
      .then((body) => body.terms);
    loading = pending;
    pending.catch(() => {
      if (loading === pending) loading = null;
    });
  }
  return loading;
}

/** The empty list every render shares until the terms arrive, so it is stable. */
const NONE: readonly Term[] = [];

/**
 * The class files' terms, once they arrive. Empty until then: a term shows as
 * it is, and the panel says what class it is from the row's own tag, which
 * comes from the engine.
 */
export function useTerms(): readonly Term[] {
  const [terms, setTerms] = useState<readonly Term[]>(NONE);

  useEffect(() => {
    let live = true;
    loadTerms().then(
      (loaded) => {
        if (live) setTerms(loaded);
      },
      () => {},
    );
    return () => {
      live = false;
    };
  }, []);

  return terms;
}
