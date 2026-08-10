import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import type { Row } from '../state/resultBuffer.ts';
import { countOrderings, orderings } from '../lib/orderings.ts';

/** Orderings shown before the list is cut off. 6 words is already 720. */
const ORDERINGS_SHOWN = 48;

type Props = {
  rows: readonly Row[];
  total: string;
  hasMore: boolean;
  onLoadMore(): void;
  spellings(word: string): Promise<string[]>;
  pinned: readonly string[];
  onTogglePin(phrase: string): void;
  copied: string | null;
  onCopy(key: string, text: string): void;
};

/**
 * Virtualized against the window rather than an inner scroll box.
 *
 * A nested scroller inside a page that also scrolls is a bad deal for the one
 * thing users do here — read a long list. It steals wheel events near the
 * boundary, breaks Home/End and find-in-page, and puts two scrollbars on screen.
 * Window virtualization keeps the DOM to a screenful while the page behaves like
 * a page.
 */
export function ResultList({
  rows,
  total,
  hasMore,
  onLoadMore,
  spellings,
  pinned,
  onTogglePin,
  copied,
  onCopy,
}: Props) {
  const anchor = useRef<HTMLDivElement>(null);
  const [offsetTop, setOffsetTop] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);

  // The virtualizer positions against the document, so it needs to know where
  // the list begins. Re-measured whenever anything above it changes height —
  // pinning a result does exactly that.
  useLayoutEffect(() => {
    const element = anchor.current;
    if (!element) return;
    const measure = () => setOffsetTop(element.getBoundingClientRect().top + window.scrollY);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 52,
    overscan: 10,
    scrollMargin: offsetTop,
    getItemKey: (index) => index,
  });

  const items = virtualizer.getVirtualItems();
  const last = items.at(-1);

  useEffect(() => {
    if (hasMore && last && last.index >= rows.length - 20) onLoadMore();
  }, [hasMore, last, rows.length, onLoadMore]);

  const toggle = useCallback((index: number) => {
    setExpanded((current) => (current === index ? null : index));
  }, []);

  const pinnedSet = useMemo(() => new Set(pinned), [pinned]);

  return (
    <div ref={anchor}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {items.map((item) => {
          const row = rows[item.index];
          if (!row) return null;
          return (
            <div
              key={item.key}
              ref={virtualizer.measureElement}
              data-index={item.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)`,
              }}
            >
              <ResultRow
                row={row}
                index={item.index}
                expanded={expanded === item.index}
                onToggle={toggle}
                spellings={spellings}
                isPinned={pinnedSet.has(row.join(' '))}
                onTogglePin={onTogglePin}
                copied={copied}
                onCopy={onCopy}
              />
            </div>
          );
        })}
      </div>

      {hasMore && (
        <p className="py-5 text-center font-mono text-xs text-ink-faint" aria-live="polite">
          {rows.length.toLocaleString()} of {total} shown
        </p>
      )}
    </div>
  );
}

function ResultRow({
  row,
  index,
  expanded,
  onToggle,
  spellings,
  isPinned,
  onTogglePin,
  copied,
  onCopy,
}: {
  row: Row;
  index: number;
  expanded: boolean;
  onToggle(index: number): void;
  spellings(word: string): Promise<string[]>;
  isPinned: boolean;
  onTogglePin(phrase: string): void;
  copied: string | null;
  onCopy(key: string, text: string): void;
}) {
  const phrase = row.join(' ');
  const [alternates, setAlternates] = useState<Record<string, string[]> | null>(null);

  useEffect(() => {
    if (!expanded || alternates) return;
    let live = true;
    void Promise.all(row.map((word) => spellings(word))).then((lists) => {
      if (!live) return;
      const map: Record<string, string[]> = {};
      row.forEach((word, i) => {
        map[word] = lists[i] ?? [word];
      });
      setAlternates(map);
    });
    return () => {
      live = false;
    };
  }, [expanded, alternates, row, spellings]);

  // Orderings are cheap for the sizes that occur here, but there is no reason
  // to compute them for a row nobody opened.
  const orderCount = expanded ? countOrderings(row) : 0;
  const orders = expanded && orderCount > 1 ? orderings(row, ORDERINGS_SHOWN) : [];

  // Only ~6% of anagram classes have a second spelling, so this stays quiet
  // until a row is actually opened.
  const extras = alternates
    ? Object.entries(alternates).filter(([, list]) => list.length > 1)
    : [];

  return (
    <div className={`border-b border-rule ${isPinned ? 'bg-accent-wash/40' : ''}`}>
      <div className="group flex items-baseline gap-3">
        <button
          type="button"
          onClick={() => onToggle(index)}
          aria-expanded={expanded}
          className="flex flex-1 items-baseline gap-3 py-3 text-left transition-colors duration-150
                     hover:bg-sunken focus-visible:bg-sunken"
        >
          <span className="w-10 shrink-0 pl-1 font-mono text-[11px] text-ink-faint tabular-nums">
            {index + 1}
          </span>
          <span className="font-display flex-1 text-xl leading-snug text-ink">{phrase}</span>
        </button>

        <span className="flex shrink-0 items-baseline gap-2 pr-1 pl-2">
          <RowAction
            label={copied === phrase ? 'Copied' : 'Copy'}
            active={copied === phrase}
            onClick={() => onCopy(phrase, phrase)}
          />
          <RowAction
            label={isPinned ? 'Unpin' : 'Pin'}
            active={isPinned}
            onClick={() => onTogglePin(phrase)}
          />
        </span>
      </div>

      {expanded && (
        <div className="settle space-y-4 pb-4 pl-14 text-sm">
          {orderCount > 1 && (
            <div>
              <p className="mb-1.5 font-mono text-[11px] tracking-[0.08em] text-ink-faint uppercase">
                {orderCount === Infinity ? 'Many' : orderCount.toLocaleString()} orderings
                {orders.length < orderCount && ` · first ${orders.length}`}
              </p>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {orders.map((order) => {
                  const text = order.join(' ');
                  return (
                    <li key={text}>
                      <button
                        type="button"
                        onClick={() => onCopy(text, text)}
                        title="Copy this ordering"
                        className={`font-display text-left transition-colors duration-150
                                    hover:text-accent ${
                                      copied === text
                                        ? 'text-accent'
                                        : text === phrase
                                          ? 'text-ink'
                                          : 'text-ink-soft'
                                    }`}
                      >
                        {text}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            <p className="mb-1.5 font-mono text-[11px] tracking-[0.08em] text-ink-faint uppercase">
              Other spellings
            </p>
            {alternates === null ? (
              <p className="font-mono text-xs text-ink-faint">…</p>
            ) : extras.length === 0 ? (
              <p className="text-ink-faint">
                No other spelling uses these letters.
              </p>
            ) : (
              <dl className="space-y-1">
                {extras.map(([word, list]) => (
                  <div key={word} className="flex flex-wrap items-baseline gap-x-2">
                    <dt className="font-display text-ink-soft">{word}</dt>
                    <dd className="font-display text-ink-faint">
                      also {list.filter((w) => w !== word).join(', ')}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Row actions fade in on hover — with thousands of rows on screen, a permanent
 * pair of buttons on each would be the loudest thing on the page.
 *
 * They stay visible below `md`, though: there is no hover on a touch screen, so
 * hiding them there would make copy and pin unreachable rather than discreet.
 */
function RowAction({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick(): void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-mono text-[11px] transition-opacity duration-150 hover:text-accent
                  focus-visible:opacity-100 ${
                    active
                      ? 'text-accent opacity-100'
                      : 'text-ink-faint md:opacity-0 md:group-hover:opacity-100'
                  }`}
    >
      {label}
    </button>
  );
}
