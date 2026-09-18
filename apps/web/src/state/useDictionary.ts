import { useCallback, useEffect, useRef, useState } from 'react';
import { ArsMagnaClient, TIERS, type EngineStatus, type Tier } from '@ars-magna/engine';

import type { TierOf } from '../lib/checks.ts';

/**
 * The dictionary for a page that searches nothing: the search's own worker and
 * dictionary cache, booted in an effect so the page is on screen first, and
 * asked which tier each of `words` is in. The answers are kept for the visit,
 * so a word is looked up once however often it is typed.
 */
export function useDictionary(words: readonly string[]): { status: EngineStatus; tierOf: TierOf } {
  const clientRef = useRef<ArsMagnaClient | null>(null);
  const [status, setStatus] = useState<EngineStatus>({ state: 'loading' });
  const tiers = useRef(new Map<string, Tier | null>());
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let disposed = false;
    void ArsMagnaClient.create('/dict').then((client) => {
      if (disposed) {
        client.terminate();
        return;
      }
      clientRef.current = client;
      client.onStatus(setStatus);
    });
    return () => {
      disposed = true;
      clientRef.current?.terminate();
      clientRef.current = null;
    };
  }, []);

  const key = [...new Set(words)].sort().join(' ');
  useEffect(() => {
    const client = clientRef.current;
    if (!client || status.state !== 'ready') return;
    const asked = key.split(' ').filter((word) => word.length > 0 && !tiers.current.has(word));
    if (asked.length === 0) return;
    let live = true;
    void Promise.all(
      asked.map(async (word) => {
        // The tiers nest, so the first that has the word is the narrowest.
        let found: Tier | null = null;
        for (const tier of TIERS) {
          if (await client.has(word, tier)) {
            found = tier;
            break;
          }
        }
        tiers.current.set(word, found);
      }),
    )
      .then(() => {
        if (live) setVersion((v) => v + 1);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [key, status.state]);

  // A new function each time answers arrive, so what reads it renders again.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tierOf = useCallback<TierOf>((word) => tiers.current.get(word), [version]);

  return { status, tierOf };
}
