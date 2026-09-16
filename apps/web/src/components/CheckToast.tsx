import type { Pass } from '../state/usePass.ts';

/**
 * The check before a visit's first vote or promotion, and an action that did
 * not save. Fixed to the bottom of the page and out of sight unless there is
 * something to say.
 */
export function CheckToast({ pass }: { pass: Pass }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[var(--z-toast)] flex flex-col items-center gap-2 px-4 pb-4">
      <div className={pass.challenge ? 'pointer-events-auto rounded-[3px] border border-rule-strong bg-surface px-4 py-3 text-sm text-ink-soft' : ''}>
        {pass.challenge && <p className="mb-2 max-w-xs">Cloudflare checks this browser once before its first vote or promotion of a visit.</p>}
        <div ref={pass.checkRef} className="pointer-events-auto" />
      </div>
      {pass.message && (
        <p role="status" className="pointer-events-auto flex max-w-md items-baseline gap-4 rounded-[3px] border border-accent bg-accent-wash px-4 py-2 text-sm text-ink">
          {pass.message}
          <button type="button" onClick={pass.dismiss} className="font-mono text-[11px] text-ink-soft transition-colors duration-150 hover:text-accent">
            Dismiss
          </button>
        </p>
      )}
    </div>
  );
}
