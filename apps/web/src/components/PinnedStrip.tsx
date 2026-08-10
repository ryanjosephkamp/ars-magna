type Props = {
  pinned: readonly string[];
  onUnpin(phrase: string): void;
  onCopy(key: string, text: string): void;
  onCopyAll(): void;
  copied: string | null;
};

/**
 * Results set aside while browsing.
 *
 * Sticky, because the whole point is to keep a shortlist reachable while you
 * scroll past thousands of other answers. It renders nothing at all when empty —
 * an always-present tray would take space from the results for no reason.
 */
export function PinnedStrip({ pinned, onUnpin, onCopy, onCopyAll, copied }: Props) {
  if (pinned.length === 0) return null;

  return (
    <div className="sticky top-0 z-10 -mx-3 mb-1 border-b border-rule-strong bg-ground/95 px-3 py-2.5 backdrop-blur-sm">
      <div className="mb-1.5 flex items-baseline justify-between gap-4">
        <p className="font-mono text-[11px] tracking-[0.08em] text-ink-faint uppercase">
          Kept · {pinned.length}
        </p>
        <button
          type="button"
          onClick={onCopyAll}
          className={`font-mono text-[11px] underline decoration-rule-strong underline-offset-4
                      transition-colors duration-150 hover:text-accent hover:decoration-accent ${
                        copied === '__pins' ? 'text-accent decoration-accent' : 'text-ink-soft'
                      }`}
        >
          {copied === '__pins' ? 'All copied' : 'Copy all'}
        </button>
      </div>

      <ul className="space-y-0.5">
        {pinned.map((phrase) => (
          <li key={phrase} className="group flex items-baseline justify-between gap-4">
            <span className="font-display text-lg text-ink">{phrase}</span>
            <span className="flex shrink-0 gap-3 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => onCopy(phrase, phrase)}
                className={`transition-opacity duration-150 hover:text-accent
                            focus-visible:opacity-100 ${
                              copied === phrase
                                ? 'text-accent opacity-100'
                                : 'text-ink-faint opacity-0 group-hover:opacity-100'
                            }`}
              >
                {copied === phrase ? 'Copied' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={() => onUnpin(phrase)}
                aria-label={`Unpin ${phrase}`}
                className="text-ink-faint transition-opacity duration-150 hover:text-accent
                           focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
              >
                Unpin
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
