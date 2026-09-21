import { LEFT_OUT, type ReadItem } from '@ars-magna/engine';
import { useLayoutEffect, useRef, useState } from 'react';

type Props = {
  /** The distinct numbers and symbols of the text, each with the reading in force and the ones it offers. */
  items: readonly ReadItem[];
  /** The reader chose `name` for the item `key`. */
  onChange(key: string, name: string): void;
  /** Where the lines sit: the search field's letters line, or Build's text box. */
  className?: string;
};

/** How a reading reads in the select: `read as one hundred eighty-two`, or `left out`. */
const label = (text: string): string => (text === LEFT_OUT ? LEFT_OUT : `read as ${text}`);

/**
 * One line per number or symbol in the text, under the letters line: the item,
 * then how it is read, as a select listing the readings it offers. `182 read
 * as one hundred eighty-two`, `$ read as s`, `90210 left out`. A native select
 * rather than a button and a menu: one tap on a phone, the keyboard works,
 * and it is the standard control for one choice from a short list. Styled as
 * the text around it, with a dotted underline for the affordance.
 */
export function ReadingLines({ items, onChange, className = '' }: Props) {
  if (items.length === 0) return null;
  return (
    <ul className={`flex flex-col gap-1 font-mono text-xs text-ink-faint ${className}`} aria-label="How the numbers and symbols are read">
      {items.map((item) => (
        <li key={item.key} className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-ink-soft">{item.key}</span>
          <ReadingSelect item={item} onChange={(name) => onChange(item.key, name)} />
        </li>
      ))}
    </ul>
  );
}

/**
 * The select, as wide as the reading it shows and no wider: a select sizes
 * itself to its widest option, which would underline a whole line for `read
 * as one thousand nine hundred seven` while showing `left out`. The shown
 * text is measured in a hidden twin.
 */
function ReadingSelect({ item, onChange }: { item: ReadItem; onChange(name: string): void }) {
  const twin = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const shown = label(item.offered.find((o) => o.name === item.reading)?.text ?? LEFT_OUT);
  useLayoutEffect(() => {
    if (twin.current) setWidth(Math.ceil(twin.current.getBoundingClientRect().width) + 1);
  }, [shown]);
  return (
    <>
      <span ref={twin} aria-hidden="true" className="invisible absolute whitespace-pre font-mono text-xs">
        {shown}
      </span>
      <select
        value={item.reading}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`How ${item.key} is read`}
        style={width === null ? undefined : { width }}
        className="max-w-full cursor-pointer appearance-none truncate rounded-none border-0 border-b border-dotted border-rule-strong
                   bg-transparent p-0 font-mono text-xs text-ink-soft transition-colors duration-150 hover:text-ink
                   focus:border-accent focus:outline-none focus-visible:text-ink"
      >
        {item.offered.map((offered) => (
          <option key={offered.name} value={offered.name}>
            {label(offered.text)}
          </option>
        ))}
      </select>
    </>
  );
}
