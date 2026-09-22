import { useLayoutEffect, useRef, useState } from 'react';
import { readingText, type ReadItem } from '@ars-magna/engine';

import { choicesFor, valueOf } from '../lib/readingChoice.ts';

type Props = {
  /** The distinct digits and symbols of the text, each with how it stands. */
  items: readonly ReadItem[];
  /** Where the lines sit: the search field's letters line, or Build's text box. */
  className?: string;
  /**
   * Set a character's reading. Without it the lines only say how each stands,
   * which is what a printed page and a hit's row need.
   */
  onChange?: (char: string, value: string) => void;
  /**
   * The characters read as themselves and as their leet letters, where that is
   * offered: Search merges the two searches, Build checks one reading at a time
   * and passes nothing.
   */
  leet?: readonly string[];
  /** Whether the lines offer the leet choice at all. */
  leetOffered?: boolean;
};

/**
 * One line per digit or symbol in the text, under the letters line: the
 * character, then how it stands. Under the literal rule nothing is converted:
 * a character is itself by default (`1 as itself`, `$ as itself`), and the
 * reader may read it as itself and as its letter too (`$ as itself or s`, the
 * accepted default for `$ ! @`), as one letter (`$ as s`), or leave it out
 * (`4 left out`). With `onChange` each line is that choice.
 */
export function ReadingLines({ items, className = '', onChange, leet = [], leetOffered = false }: Props) {
  if (items.length === 0) return null;
  return (
    <ul className={`flex flex-col gap-1 font-mono text-xs text-ink-faint ${className}`} aria-label="How the digits and symbols stand">
      {items.map((item) => (
        <li key={item.key} className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-ink-soft">{item.key}</span>
          {onChange ? (
            <ReadingChoice item={item} leetOn={leet.includes(item.key)} leetOffered={leetOffered} onChange={onChange} />
          ) : (
            <span>{readingText(item.reading)}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * One character's reading, as a select set in the line's own type: it carries
 * the sentence's words, not a control's chrome, so the lines still read as
 * lines. A select sizes itself to its widest option, which would underline the
 * whole line for `as itself, t or v` while showing `as itself`, so the shown
 * text is measured in a hidden twin and the width set from it.
 */
function ReadingChoice({
  item,
  leetOn,
  leetOffered,
  onChange,
}: {
  item: ReadItem;
  leetOn: boolean;
  leetOffered: boolean;
  onChange(char: string, value: string): void;
}) {
  const choices = choicesFor(item, leetOffered);
  const value = valueOf(item, leetOn);
  const shown = choices.find((c) => c.value === value)?.text ?? readingText(item.reading);
  const twin = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const measured = twin.current?.getBoundingClientRect().width;
    if (measured) setWidth(Math.ceil(measured));
  }, [shown]);

  return (
    <span className="relative inline-flex items-baseline">
      <span ref={twin} aria-hidden="true" className="pointer-events-none invisible absolute whitespace-pre">
        {shown}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(item.key, event.target.value)}
        aria-label={`How ${item.key} is read`}
        style={width === null ? undefined : { width: `${width}px` }}
        className="cursor-pointer appearance-none border-b border-dotted border-rule-strong bg-transparent pb-px font-mono
                   text-xs text-ink-faint outline-none transition-colors duration-150 hover:text-accent
                   hover:border-accent focus-visible:text-accent"
      >
        {choices.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.text}
          </option>
        ))}
      </select>
    </span>
  );
}
