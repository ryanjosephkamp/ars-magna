import { useCallback, useEffect, useRef, useState } from 'react';

import type { PromotionsBody } from '../votes/api.ts';
import { promotionKey } from '../votes/core.ts';
import { withCount, withVote, type Tally } from '../votes/state.ts';
import { ActionProblem, type Pass } from './usePass.ts';

/** `open`: counts show and Promote works. `closed`: counts show, promotions are paused. `unavailable`: nothing about promotions shows. */
export type PromotionsStatus = 'loading' | 'open' | 'closed' | 'unavailable';

export type Promotions = {
  status: PromotionsStatus;
  /** Counts and this browser's promotions, keyed by promotion key. */
  counts: Readonly<Record<string, number>>;
  mine: ReadonlySet<string>;
  busy: ReadonlySet<string>;
  /** Promote, or take back a promotion of, `words` in the order the reader sees them. */
  toggle(words: readonly string[]): void;
};

const GENERIC = 'Your promotion did not save. Try again.';
const CHECK_FAILED = 'The check before promoting did not pass. Try again.';
const CHECK_UNFINISHED = 'The check before promoting did not finish, so your promotion did not save. Try again.';

function sentenceFor(error: unknown): string {
  if (!(error instanceof ActionProblem)) return GENERIC;
  if (error.code === 'check-timed-out') return CHECK_UNFINISHED;
  if (error.code === 'check-failed') return CHECK_FAILED;
  return error.serverMessage ?? GENERIC;
}

/** How long a search's letters must stay put before their promotions are asked for. */
const SETTLE_MS = 600;

const EMPTY: Tally = { counts: {}, mine: new Set() };

/**
 * Promotions for the letters on screen. They load once `enabled` (the count for
 * these letters has arrived) and the letters have stayed put for a moment, so
 * typing never sends a request per keystroke and a search never waits on one.
 * Anything that answers for letters no longer on screen is dropped.
 */
export function usePromotions(
  pass: Pass,
  options: { letters: string; input: string; tier: string; enabled: boolean; reading?: Record<string, string> | null },
): Promotions {
  const { letters, enabled } = options;
  const [status, setStatus] = useState<PromotionsStatus>('loading');
  const [tally, setTally] = useState<Tally>(EMPTY);
  const [busy, setBusy] = useState<ReadonlySet<string>>(() => new Set());
  const lettersRef = useRef(letters);
  const loadedRef = useRef<string | null>(null);
  const tallyRef = useRef(tally);
  const busyRef = useRef(new Set<string>());
  const pressRef = useRef({ input: options.input, tier: options.tier, reading: options.reading ?? null });
  const { voter, send, say } = pass;

  pressRef.current = { input: options.input, tier: options.tier, reading: options.reading ?? null };

  useEffect(() => {
    tallyRef.current = tally;
  }, [tally]);

  // New letters start from nothing: no counts, no pressed buttons, nothing busy.
  useEffect(() => {
    lettersRef.current = letters;
    if (loadedRef.current === letters) return;
    loadedRef.current = null;
    busyRef.current.clear();
    setBusy(new Set());
    setTally(EMPTY);
    setStatus('loading');
  }, [letters]);

  useEffect(() => {
    if (!enabled || letters.length === 0 || loadedRef.current === letters) return;
    let live = true;
    const timer = setTimeout(() => {
      fetch(`/api/promotions?letters=${letters}&voter=${voter}`, { cache: 'no-store' })
        .then((r) => (r.ok ? (r.json() as Promise<PromotionsBody>) : Promise.reject(new Error(String(r.status)))))
        .then((body) => {
          if (!live || lettersRef.current !== letters) return;
          loadedRef.current = letters;
          setTally({ counts: body.counts, mine: new Set(body.mine) });
          setStatus(body.open ? 'open' : 'closed');
        })
        .catch(() => {
          if (live && lettersRef.current === letters) setStatus('unavailable');
        });
    }, SETTLE_MS);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [enabled, letters, voter]);

  const toggle = useCallback(
    (words: readonly string[]) => {
      const key = promotionKey(words);
      if (status !== 'open' || busyRef.current.has(key)) return;
      const on = !tallyRef.current.mine.has(key);
      const pressedFor = lettersRef.current;
      const { input, tier, reading } = pressRef.current;
      busyRef.current.add(key);
      setBusy(new Set(busyRef.current));
      setTally((t) => withVote(t, key, on));
      say('');
      void (async () => {
        try {
          // The input's reading goes with it, every item of it, so the review reads the input as the reader did.
          const body = await send<{ key: string; on: boolean; count: number }>('/api/promote', { input, words: [...words], tier, on, ...(reading ? { reading } : {}) });
          if (lettersRef.current === pressedFor) setTally((t) => withCount(t, key, body.on, body.count));
        } catch (error) {
          if (lettersRef.current === pressedFor) setTally((t) => withVote(t, key, !on));
          say(sentenceFor(error));
          if (error instanceof ActionProblem && error.code === 'closed') setStatus('closed');
        } finally {
          busyRef.current.delete(key);
          setBusy(new Set(busyRef.current));
        }
      })();
    },
    [status, send, say],
  );

  return { status, counts: tally.counts, mine: tally.mine, busy, toggle };
}
