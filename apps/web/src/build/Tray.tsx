import type { TrayLetter } from '../lib/ledger.ts';

/**
 * Every letter of the text with how many are left, set in type: the letter in
 * the display face and its count in mono beside it, no boxes. A letter the
 * anagram has used up fades; one it has used too often, or one the text never
 * had, turns the accent and shows the excess. Pressing a letter adds it to the
 * anagram at the caret. The letter selected in a chart takes the accent and
 * an underline, which an overused letter, in the accent alone, never has.
 */
export function Tray({ tray, selected, onInsert }: { tray: readonly TrayLetter[]; selected: string | null; onInsert(letter: string): void }) {
  if (tray.length === 0) {
    return <p className="py-1.5 font-mono text-xs text-ink-faint">—</p>;
  }
  return (
    <ul className="-mx-1.5 flex flex-wrap items-baseline" aria-label="Letters of the text">
      {tray.map(({ letter, left }) => {
        const over = left < 0;
        const marked = letter === selected;
        const tone = over || marked ? 'text-accent' : left === 0 ? 'text-ink-faint' : 'text-ink';
        return (
          <li key={letter}>
            <button
              type="button"
              // Keeps the anagram box focused, and its caret where it was, on a
              // mouse. A tap on a phone leaves the keyboard down instead, and the
              // letter goes where the caret last was.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onInsert(letter)}
              aria-label={over ? `Add ${letter}, ${-left} too many` : `Add ${letter}, ${left} left`}
              className={`flex items-baseline gap-1 rounded-[2px] px-1.5 py-1 transition-colors duration-150
                          hover:bg-accent-wash ${tone}`}
            >
              <span className={`font-display text-2xl leading-none ${marked ? 'underline decoration-2 underline-offset-4' : ''}`}>{letter}</span>
              <span className="font-mono text-[11px] tabular-nums">{over ? `+${-left}` : left}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
