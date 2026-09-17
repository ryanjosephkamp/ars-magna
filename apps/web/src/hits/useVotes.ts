import { useCallback, useEffect, useRef, useState } from 'react';

import type { VotesBody } from '../votes/api.ts';
import { withCount, withVote, type Tally } from '../votes/state.ts';
import { ActionProblem, type Pass } from '../state/usePass.ts';

/** `open`: votes load and count. `closed`: counts show, voting is paused. `unavailable`: the API did not answer, so nothing about votes shows. */
export type VotesStatus = 'loading' | 'open' | 'closed' | 'unavailable';

export type Votes = {
  status: VotesStatus;
  counts: Readonly<Record<string, number>>;
  mine: ReadonlySet<string>;
  busy: ReadonlySet<string>;
  toggle(hitId: string): void;
};

const GENERIC = 'Your vote did not save. Try again.';
/** The check ran, and Cloudflare turned it down. */
const CHECK_FAILED = 'The check before voting did not pass. Try again.';
/** The check was still waiting two minutes on, usually for a click nobody made. */
const CHECK_UNFINISHED = 'The check before voting did not finish, so your vote did not save. Try again.';

/** What the reader is told when a vote did not save. */
function sentenceFor(error: unknown): string {
  if (!(error instanceof ActionProblem)) return GENERIC;
  if (error.code === 'check-timed-out') return CHECK_UNFINISHED;
  if (error.code === 'check-failed') return CHECK_FAILED;
  return error.serverMessage ?? GENERIC;
}

/**
 * Votes: the counts, this browser's votes, and pressing Vote. Counts load once
 * `enabled` is true (at once on Discover; after the first count on the
 * search page, so they never delay a search).
 */
export function useVotes(pass: Pass, enabled = true): Votes {
  const [status, setStatus] = useState<VotesStatus>('loading');
  const [tally, setTally] = useState<Tally>({ counts: {}, mine: new Set() });
  const [busy, setBusy] = useState<ReadonlySet<string>>(() => new Set());
  const tallyRef = useRef(tally);
  const busyRef = useRef(new Set<string>());
  const { voter, send, say } = pass;

  useEffect(() => {
    tallyRef.current = tally;
  }, [tally]);

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    fetch(`/api/votes?voter=${voter}`, { cache: 'no-store' })
      .then((r) => (r.ok ? (r.json() as Promise<VotesBody>) : Promise.reject(new Error(String(r.status)))))
      .then((body) => {
        if (!live) return;
        setTally({ counts: body.counts, mine: new Set(body.mine) });
        setStatus(body.open ? 'open' : 'closed');
      })
      .catch(() => {
        if (live) setStatus('unavailable');
      });
    return () => {
      live = false;
    };
  }, [voter, enabled]);

  const toggle = useCallback(
    (hitId: string) => {
      if (status !== 'open' || busyRef.current.has(hitId)) return;
      const on = !tallyRef.current.mine.has(hitId);
      busyRef.current.add(hitId);
      setBusy(new Set(busyRef.current));
      setTally((t) => withVote(t, hitId, on));
      say('');
      void (async () => {
        try {
          const body = await send<{ on: boolean; count: number }>('/api/vote', { hit_id: hitId, on });
          setTally((t) => withCount(t, hitId, body.on, body.count));
        } catch (error) {
          setTally((t) => withVote(t, hitId, !on));
          say(sentenceFor(error));
          if (error instanceof ActionProblem && error.code === 'closed') setStatus('closed');
        } finally {
          busyRef.current.delete(hitId);
          setBusy(new Set(busyRef.current));
        }
      })();
    },
    [status, send, say],
  );

  return { status, counts: tally.counts, mine: tally.mine, busy, toggle };
}
