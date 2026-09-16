import type { PublicHit } from '../hits/build.ts';
import type { Votes } from '../hits/useVotes.ts';

/**
 * Vote or Promote, with its count. Pressed, it takes the accent; pressing again
 * takes the vote or the promotion back. `quiet` fades it in on hover on a wide
 * screen, like the other row actions, and applies only while it has nothing to
 * show: no count and not pressed.
 */
export function CountButton({
  label,
  count,
  pressed,
  busy,
  disabled,
  ariaLabel,
  onClick,
  quiet = false,
}: {
  label: string;
  count: number;
  pressed: boolean;
  busy: boolean;
  disabled: boolean;
  ariaLabel: string;
  onClick(): void;
  quiet?: boolean;
}) {
  const fade = quiet && !pressed && count === 0 ? 'md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100' : '';
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={ariaLabel}
      aria-busy={busy}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-7 items-center gap-1.5 rounded-[3px] border px-2 font-mono text-[11px] transition-colors duration-150 disabled:cursor-default disabled:opacity-60 ${fade} ${
        pressed ? 'border-accent bg-accent-wash text-accent' : 'border-rule bg-surface text-ink-soft hover:border-accent hover:text-accent'
      }`}
    >
      {label}
      <span className="tabular-nums">{count}</span>
    </button>
  );
}

/**
 * Vote for a published hit, with its count. Absent when votes did not load.
 * `reserve` keeps its space while votes are still loading, so nothing beside or
 * below it moves when they arrive.
 */
export function VoteButton({ hit, votes, reserve = false }: { hit: PublicHit; votes: Votes; reserve?: boolean }) {
  if (reserve && votes.status === 'loading') {
    return (
      <span aria-hidden="true" className="invisible inline-flex min-h-7 items-center gap-1.5 rounded-[3px] border px-2 font-mono text-[11px]">
        Vote<span className="tabular-nums">0</span>
      </span>
    );
  }
  if (votes.status !== 'open' && votes.status !== 'closed') return null;
  const count = votes.counts[hit.id] ?? 0;
  return (
    <CountButton
      label="Vote"
      count={count}
      pressed={votes.mine.has(hit.id)}
      busy={votes.busy.has(hit.id)}
      disabled={votes.status === 'closed'}
      ariaLabel={`Vote for ${hit.input} → ${hit.display}, ${count} ${count === 1 ? 'vote' : 'votes'}`}
      onClick={() => votes.toggle(hit.id)}
    />
  );
}
