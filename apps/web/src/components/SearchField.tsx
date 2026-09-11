import { useEffect, useId, useRef } from 'react';

type Props = {
  value: string;
  onChange(value: string): void;
  /** Letters that will actually be used, after folding accents and stripping. */
  letters: string;
  /** Characters that carried something (digits, symbols, other scripts) and were ignored. */
  skipped: number;
};

/**
 * The input is the largest thing on the page — it is what the user came to do.
 * Set in the display face at reading size so the text they type already looks
 * like the results it will become.
 */
export function SearchField({ value, onChange, letters, skipped }: Props) {
  const id = useId();
  const field = useRef<HTMLInputElement>(null);

  // Focus without scrolling. React's `autoFocus` prop scrolls the field into
  // view, which on a tall page lands the user partway down it — the wordmark
  // and the field's own label scrolled off before they have typed anything.
  useEffect(() => {
    field.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        Text to rearrange
      </label>
      <div className="relative">
        <input
          ref={field}
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type anything"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="font-display w-full border-0 border-b border-rule bg-transparent pb-3 text-4xl
                     tracking-tight text-ink outline-none transition-colors duration-150
                     placeholder:text-ink-faint focus:border-accent sm:text-5xl"
        />
      </div>

      <p className="mt-3 font-mono text-xs text-ink-faint" aria-live="polite">
        {letters.length === 0 ? (
          <span className="opacity-0">·</span>
        ) : (
          <>
            {letters.length} letter{letters.length === 1 ? '' : 's'}
            <span className="mx-2 text-rule-strong">·</span>
            <span className="tracking-[0.18em] uppercase">{[...letters].sort().join('')}</span>
            {skipped > 0 && (
              <>
                <span className="mx-2 text-rule-strong">·</span>
                {skipped} character{skipped === 1 ? '' : 's'} skipped
              </>
            )}
          </>
        )}
      </p>
    </div>
  );
}
