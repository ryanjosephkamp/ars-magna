import { useEffect, useState } from 'react';
import { ArsMagnaClient, DEFAULT_QUERY, type EngineStatus, type Tier } from '@ars-magna/engine';

import { climb, type TextCount } from '../lib/textCount.ts';

/** How long the text must stay put before it is counted. */
const DEBOUNCE_MS = 500;

/**
 * How many anagrams the text has at `tier`: Build's own number, counted in a
 * worker of its own so the word checks never wait behind it.
 *
 * The worker lives only while it counts. A second engine holds its own copy of
 * the dictionary, about 70 MB on a phone and more once a count has run, so it
 * is started for each count, from the cache the page's own worker filled, and
 * stopped when the count ends. A count cannot be stopped from inside the
 * engine, so the moment the text or the dictionary changes a count still
 * running is abandoned by stopping its worker, and one that passes the time
 * limit in `textCount.ts` is stopped the same way.
 */
export function useTextCount(input: string, letters: string, tier: Tier, dictionary: EngineStatus['state']): TextCount {
  const [counted, setCounted] = useState<{ key: string; count: TextCount } | null>(null);

  const key = `${letters}|${tier}`;
  useEffect(() => {
    // Started once the page's dictionary has loaded, so it is in the cache.
    if (letters.length === 0 || dictionary !== 'ready') return;
    let live = true;
    let client: ArsMagnaClient | null = null;
    const timer = setTimeout(() => {
      void (async () => {
        client = await ArsMagnaClient.create('/dict');
        if (!live) return client.terminate();
        if (client.status.state !== 'ready') {
          client.terminate();
          return setCounted({ key, count: { kind: 'failed' } });
        }
        const running = client;
        const { count } = await climb(async (maxNodes) => {
          if (!live) return null;
          try {
            return await running.count({ ...DEFAULT_QUERY, input, tier }, maxNodes);
          } catch {
            return null;
          }
        });
        // Whether the count finished or the time ran out mid-rung, the worker goes.
        running.terminate();
        if (live) setCounted({ key, count });
      })();
    }, DEBOUNCE_MS);
    return () => {
      live = false;
      clearTimeout(timer);
      client?.terminate();
    };
    // The key holds the letters and the tier; the text's spelling cannot change the count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, dictionary]);

  if (letters.length === 0) return { kind: 'none' };
  if (dictionary === 'failed') return { kind: 'failed' };
  return counted?.key === key ? counted.count : { kind: 'counting' };
}
