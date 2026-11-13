import { useCallback, useMemo, useRef, useState, type RefObject } from 'react';

import { CHECK_TIMED_OUT, forgetPass, keepPass, keptPass, siteKeyFor, voterId, type KeyValue, type Pass as SignedPass } from '../votes/state.ts';
import { turnstileToken } from '../votes/turnstile.ts';

/**
 * Why an action did not save. `code` is the API's error, or `check-failed` and
 * `check-timed-out` for the check itself; `message` is the API's own sentence
 * when it sent one. Each kind of action turns this into what the reader reads.
 */
export class ActionProblem extends Error {
  readonly code: string;
  readonly serverMessage: string | null;
  constructor(code: string, serverMessage: string | null = null) {
    super(serverMessage ?? code);
    this.code = code;
    this.serverMessage = serverMessage;
  }
}

/**
 * The check before a visit's first vote or promotion, shared by every button
 * on a page: one voter id, one pass, one Turnstile check at a time, and one
 * place to tell the reader something did not save.
 */
export type Pass = {
  voter: string;
  /** Cloudflare needs the reader to click in the check. */
  challenge: boolean;
  /** Where the check renders. */
  checkRef: RefObject<HTMLDivElement | null>;
  /** A sentence for the reader when an action did not save; empty otherwise. */
  message: string;
  say(message: string): void;
  dismiss(): void;
  /**
   * POSTs `body` with the voter id and a pass, running the check first when
   * the visit has no pass. A pass the API no longer accepts is renewed once.
   * Resolves with the API's answer; rejects with an ActionProblem.
   */
  send<T>(path: string, body: Record<string, unknown>): Promise<T>;
};

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

/** The API's refusal, read once. */
async function refusal(response: Response): Promise<ActionProblem> {
  try {
    const body = (await response.json()) as { error?: string; message?: string };
    return new ActionProblem(body.error ?? 'refused', body.message ?? null);
  } catch {
    return new ActionProblem('refused');
  }
}

export function usePass(): Pass {
  const voter = useMemo(() => voterId(storage('localStorage')), []);
  const session = useMemo(() => storage('sessionStorage'), []);
  const [challenge, setChallenge] = useState(false);
  const [message, setMessage] = useState('');
  const checkRef = useRef<HTMLDivElement | null>(null);
  const passRef = useRef<Promise<string> | null>(null);

  /** A pass for this visit: the one kept, or a new one after the check. Actions pressed while a check runs share it. */
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
        if (!container) throw new ActionProblem('refused');
        let token: string;
        try {
          token = await turnstileToken(container, siteKeyFor(window.location.hostname), setChallenge);
        } catch (error) {
          throw new ActionProblem(error instanceof Error && error.message === CHECK_TIMED_OUT ? 'check-timed-out' : 'check-failed');
        }
        const response = await postJson('/api/pass', { voter, token });
        if (!response.ok) throw await refusal(response);
        const body = (await response.json()) as SignedPass;
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

  const send = useCallback(
    async <T,>(path: string, body: Record<string, unknown>): Promise<T> => {
      const post = async (pass: string) => postJson(path, { ...body, voter, pass });
      let response = await post(await getPass(false));
      if (!response.ok) {
        const problem = await refusal(response);
        // A pass from an earlier visit, or for a voter id this browser has since lost, is refused once, then renewed.
        if (problem.code !== 'no-pass') throw problem;
        response = await post(await getPass(true));
        if (!response.ok) throw await refusal(response);
      }
      return (await response.json()) as T;
    },
    [getPass, voter],
  );

  const say = useCallback((next: string) => setMessage(next), []);
  const dismiss = useCallback(() => setMessage(''), []);

  return useMemo(
    () => ({ voter, challenge, checkRef, message, say, dismiss, send }),
    [voter, challenge, message, say, dismiss, send],
  );
}
