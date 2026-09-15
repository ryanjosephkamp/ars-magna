/**
 * Cloudflare Turnstile, the check before a visit's first vote. The script loads
 * only when someone first votes, and the widget stays out of sight unless
 * Cloudflare needs the reader to click.
 */

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
 */
export async function turnstileToken(container: HTMLElement, siteKey: string, onInteractive: (shown: boolean) => void): Promise<string> {
  const api = await loadTurnstile();
  return new Promise<string>((resolve, reject) => {
    let widget = '';
    const done = () => {
      onInteractive(false);
      const id = widget;
      setTimeout(() => api.remove(id), 0);
    };
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
}
