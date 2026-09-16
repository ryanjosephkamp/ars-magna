/**
 * Cloudflare Turnstile, the check before a visit's first vote. The script loads
 * only when someone first votes, and the widget stays out of sight unless
 * Cloudflare needs the reader to click.
 */
import { CHECK_TIME_LIMIT_MS, withTimeLimit, type Timer } from './state.ts';

type TurnstileApi = {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  remove(widgetId: string): void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let loading: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile did not start')));
    script.onerror = () => {
      loading = null;
      reject(new Error('Turnstile did not load'));
    };
    document.head.append(script);
  });
  return loading;
}

/**
 * Runs the check in `container` and resolves with its token. `onInteractive`
 * hears true when Cloudflare needs the reader to click, and false afterwards.
 *
 * A check that has produced no token after `limitMs` is abandoned: the widget
 * is removed and the promise rejects with CHECK_TIMED_OUT. Someone who walks
 * away from a click Cloudflare asked for is the ordinary case, and until there
 * was a limit their vote stayed pending for the rest of the visit.
 */
export function turnstileToken(
  container: HTMLElement,
  siteKey: string,
  onInteractive: (shown: boolean) => void,
  limitMs: number = CHECK_TIME_LIMIT_MS,
  timer?: Timer,
): Promise<string> {
  // Before the widget exists there is nothing to remove, but the check may
  // already have been announced, so giving up always takes that back.
  let tidy = () => onInteractive(false);

  const check = (async () => {
    const api = await loadTurnstile();
    return await new Promise<string>((resolve, reject) => {
      let widget = '';
      let over = false;
      // Idempotent: the limit and a callback that arrives after it both land here.
      const done = () => {
        if (over) return;
        over = true;
        onInteractive(false);
        const id = widget;
        setTimeout(() => api.remove(id), 0);
      };
      tidy = done;
      widget = api.render(container, {
        sitekey: siteKey,
        action: 'vote',
        appearance: 'interaction-only',
        callback: (token: string) => {
          done();
          resolve(token);
        },
        'error-callback': () => {
          done();
          reject(new Error('check-failed'));
        },
        'expired-callback': () => {
          done();
          reject(new Error('check-expired'));
        },
        'before-interactive-callback': () => onInteractive(true),
        'after-interactive-callback': () => onInteractive(false),
      });
    });
  })();

  // The limit covers loading the script as well as the check itself, so a
  // reader whose network stalls waits the same two minutes as one who never
  // clicks, rather than forever.
  return withTimeLimit(check, limitMs, () => tidy(), timer);
}
