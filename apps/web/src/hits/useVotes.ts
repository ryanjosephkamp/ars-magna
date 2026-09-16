import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';

import type { VotesBody } from '../votes/api.ts';
import { CHECK_TIMED_OUT, forgetPass, keepPass, keptPass, siteKeyFor, voterId, withCount, withVote, type KeyValue, type Pass, type Tally } from '../votes/state.ts';
import { turnstileToken } from '../votes/turnstile.ts';

/** `open`: votes load and count. `closed`: counts show, voting is paused. `unavailable`: the API did not answer, so nothing about votes shows. */
export type VotesStatus = 'loading' | 'open' | 'closed' | 'unavailable';

export type Votes = {
  status: VotesStatus;
  counts: Readonly<Record<string, number>>;
  mine: ReadonlySet<string>;
  busy: ReadonlySet<string>;
  /** A sentence for the reader when a vote did not save; empty otherwise. */
  message: string;
  /** Cloudflare needs the reader to click in the check. */
  challenge: boolean;
  /** Where the check renders. */
  checkRef: RefObject<HTMLDivElement | null>;
  toggle(hitId: string): void;
  dismiss(): void;
};

const GENERIC = 'Your vote did not save. Try again.';
/** The check ran, and Cloudflare turned it down. */
const CHECK_FAILED = 'The check before voting did not pass. Try again.';
/** The check was still waiting two minutes on, usually for a click nobody made. */
const CHECK_UNFINISHED = 'The check before voting did not finish, so your vote did not save. Try again.';

class VoteProblem extends Error {
  closed: boolean;
  constructor(message: string, closed = false) {
    super(message);
    this.closed = closed;
  }
}

async function problemFrom(response: Response): Promise<VoteProblem> {
  try {
    const body = (await response.json()) as { error?: string; message?: string };
    return new VoteProblem(body.message ?? GENERIC, body.error === 'closed');
  } catch {
    return new VoteProblem(GENERIC);
  }
}

function storage(kind: 'localStorage' | 'sessionStorage'): KeyValue | null {
  try {
    return window[kind];
  } catch {
    return null;
  }
}

function postJson(path: string, body: unknown): Promise<Response> {
  return fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
}

/** Votes for the Discoveries page: the counts, this browser's votes, and pressing Vote. */
export function useVotes(): Votes {
  const voter = useMemo(() => voterId(storage('localStorage')), []);
  const session = useMemo(() => storage('sessionStorage'), []);
  const [status, setStatus] = useState<VotesStatus>('loading');
  const [tally, setTally] = useState<Tally>({ counts: {}, mine: new Set() });
  const [busy, setBusy] = useState<ReadonlySet<string>>(() => new Set());
  const [message, setMessage] = useState('');
  const [challenge, setChallenge] = useState(false);
  const checkRef = useRef<HTMLDivElement | null>(null);
  const tallyRef = useRef(tally);
  const busyRef = useRef(new Set<string>());
  const passRef = useRef<Promise<string> | null>(null);

  useEffect(() => {
    tallyRef.current = tally;
  }, [tally]);

  useEffect(() => {
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
  }, [voter]);

  /** A pass for this visit: the one kept, or a new one after the check. Votes pressed while a check runs share it. */
  const getPass = useCallback(
    (fresh: boolean): Promise<string> => {
      if (!fresh) {
        const kept = keptPass(session, Date.now());
        if (kept) return Promise.resolve(kept);
      }
      if (passRef.current) return passRef.current;
      forgetPass(session);
      const pending = (async () => {
        const container = checkRef.current;
        if (!container) throw new VoteProblem(GENERIC);
        let token: string;
        try {
          token = await turnstileToken(container, siteKeyFor(window.location.hostname), setChallenge);
        } catch (error) {
          // Either way the vote is undone and Vote comes back; the two differ
          // only in what the reader is told happened.
          throw new VoteProblem(error instanceof Error && error.message === CHECK_TIMED_OUT ? CHECK_UNFINISHED : CHECK_FAILED);
        }
        const response = await postJson('/api/pass', { voter, token });
        if (!response.ok) throw await problemFrom(response);
        const body = (await response.json()) as Pass;
        keepPass(session, body);
        return body.pass;
      })();
      passRef.current = pending;
      void pending.catch(() => {}).finally(() => {
        passRef.current = null;
      });
      return pending;
    },
    [session, voter],
  );

  const toggle = useCallback(
    (hitId: string) => {
      if (status !== 'open' || busyRef.current.has(hitId)) return;
      const on = !tallyRef.current.mine.has(hitId);
      busyRef.current.add(hitId);
      setBusy(new Set(busyRef.current));
      setTally((t) => withVote(t, hitId, on));
      setMessage('');
      void (async () => {
        try {
          const send = (pass: string) => postJson('/api/vote', { hit_id: hitId, on, voter, pass });
          let response = await send(await getPass(false));
          // A pass from an earlier visit, or for a voter id this browser has since lost, is refused once, then renewed.
          if (response.status === 403) response = await send(await getPass(true));
          if (!response.ok) throw await problemFrom(response);
          const body = (await response.json()) as { on: boolean; count: number };
          setTally((t) => withCount(t, hitId, body.on, body.count));
        } catch (error) {
          setTally((t) => withVote(t, hitId, !on));
          setMessage(error instanceof VoteProblem ? error.message : GENERIC);
          if (error instanceof VoteProblem && error.closed) setStatus('closed');
        } finally {
          busyRef.current.delete(hitId);
          setBusy(new Set(busyRef.current));
        }
      })();
    },
    [status, getPass, voter],
  );

  const dismiss = useCallback(() => setMessage(''), []);

  return { status, counts: tally.counts, mine: tally.mine, busy, message, challenge, checkRef, toggle, dismiss };
}
