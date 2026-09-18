import { useCallback, useEffect, useRef, useState } from 'react';
import { ArsMagnaClient, TIERS, type EngineStatus, type Tier } from '@ars-magna/engine';

import type { TierOf } from '../lib/checks.ts';

/** What the dictionary knows about one word. */
export type WordFacts = {
  /** The narrowest tier that has it, or null when no tier does. */
  readonly tier: Tier | null;
  /** Its part-of-speech mask; 0 when the dictionary knows none. */
  readonly mask: number;
  /** Its frequency byte; 0 when the build had no frequency for it. */
  readonly zipf: number;
};

export type Dictionary = {
  status: EngineStatus;
  /** The narrowest tier a word is in: null for none, undefined until it has been asked. */
  tierOf: TierOf;
  /** What the dictionary knows about a word, or undefined until it has been asked. */
  factsOf(word: string): WordFacts | undefined;
};

/**
 * The dictionary for a page that searches nothing: the search's own worker and
 * dictionary cache, booted in an effect so the page is on screen first. Each
 * of `words` is looked up once a visit — its tier, its parts of speech and how
 * common it is — and the answers are kept. Nothing slow runs in this worker:
 * the text's count has one of its own (`useTextCount`), so a lookup never
 * waits behind it.
 */
export function useDictionary(words: readonly string[]): Dictionary {
  const clientRef = useRef<ArsMagnaClient | null>(null);
  const [status, setStatus] = useState<EngineStatus>({ state: 'loading' });
  const facts = useRef(new Map<string, WordFacts>());
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
    const asked = key.split(' ').filter((word) => word.length > 0 && !facts.current.has(word));
    if (asked.length === 0) return;
    let live = true;
    void (async () => {
      // One call each for the parts of speech and the frequencies, and, per
      // word, the tiers narrowest-first: they nest, so the first hit is it.
      const [masks, zipf, tiers] = await Promise.all([
        client.masks(asked),
        client.zipf(asked),
        Promise.all(
          asked.map(async (word) => {
            for (const tier of TIERS) if (await client.has(word, tier)) return tier;
            return null;
          }),
        ),
      ]);
      asked.forEach((word, i) => {
        facts.current.set(word, { tier: tiers[i] ?? null, mask: masks[i] ?? 0, zipf: zipf[i] ?? 0 });
      });
      if (live) setVersion((v) => v + 1);
    })().catch(() => {});
    return () => {
      live = false;
    };
  }, [key, status.state]);

  // New functions each time answers arrive, so what reads them renders again.
  /* eslint-disable react-hooks/exhaustive-deps */
  const factsOf = useCallback((word: string) => facts.current.get(word), [version]);
  const tierOf = useCallback<TierOf>((word) => facts.current.get(word)?.tier, [version]);
  /* eslint-enable react-hooks/exhaustive-deps */

  return { status, tierOf, factsOf };
}
