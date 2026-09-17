import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import type { Row } from '../state/resultBuffer.ts';
import { countOrderings, nextOrdering, orderings } from '../lib/orderings.ts';
import { displayOrder, type Chosen } from '../lib/chosen.ts';
import type { Shareable } from '../lib/share.ts';
import { discoveryFor, type Discovered, type RowDiscovery } from '../lib/inDiscoveries.ts';
import type { Votes } from '../hits/useVotes.ts';
import type { Promotions } from '../state/usePromotions.ts';
import { promotable, promotionKey } from '../votes/core.ts';
import { CountButton, VoteButton } from './CountButton.tsx';
import { ShareActions } from './ShareActions.tsx';
import { WordDetails, type WordDetail } from './WordDetails.tsx';

/** Orderings shown before the list is cut off. 6 words is already 720. */
const ORDERINGS_SHOWN = 48;

type Props = {
  rows: readonly Row[];
  total: string;
  hasMore: boolean;
  onLoadMore(): void;
  wordDetails(words: readonly string[]): Promise<WordDetail[]>;
  wordMasks(words: readonly string[]): Promise<number[]>;
  pinned: readonly string[];
  onTogglePin(phrase: string): void;
  copied: string | null;
  onCopy(key: string, text: string): void;
  /** The orders readers chose, keyed by the row's words. */
  chosen: Chosen;
  onChoose(order: readonly string[]): void;
  /** What a share of any row needs beyond its phrase. */
  share: ShareContext;
  /** The anagrams of these letters on Discover, once known. */
  discovered: Discovered | null;
  votes: Votes;
  promotions: Promotions;
};

export type ShareContext = {
  input: string;
  /** The engine's total as reported, `>`-prefixed when a floor. */
  total: string;
  urlFor(phrase: string): string;
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
  wordDetails,
  wordMasks,
  pinned,
  onTogglePin,
  copied,
  onCopy,
  chosen,
  onChoose,
  share,
  discovered,
  votes,
  promotions,
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

  /**
   * Roving focus across the list.
   *
   * Only a screenful of rows exists in the DOM, so Tab alone cannot walk a
   * result set of any size — it would run out after twenty rows. Arrow keys
   * move a cursor instead: scroll the target into view, then focus it once the
   * virtualizer has rendered it.
   */
  const [cursor, setCursor] = useState<number | null>(null);
  const pendingFocus = useRef<number | null>(null);

  const moveTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(rows.length - 1, index));
      setCursor(clamped);
      pendingFocus.current = clamped;
      virtualizer.scrollToIndex(clamped, { align: 'auto' });
    },
    [rows.length, virtualizer],
  );

  // Focusing a far-off row is a two-step affair: `scrollToIndex` has to run,
  // then the virtualizer has to render the row, and only then can it take
  // focus. Jumping to the end of a 250-row list skips far enough that the
  // target does not exist yet on the frame the key was pressed, so this retries
  // across a few frames rather than giving up after one.
  useEffect(() => {
    const index = pendingFocus.current;
    if (index === null) return;

    let frame = 0;
    let attempts = 0;
    const tryFocus = () => {
      const node = anchor.current?.querySelector<HTMLElement>(
        `[data-index="${index}"] button[aria-expanded]`,
      );
      if (node) {
        node.focus({ preventScroll: true });
        pendingFocus.current = null;
        return;
      }
      if (++attempts < 10) frame = requestAnimationFrame(tryFocus);
      else pendingFocus.current = null;
    };
    tryFocus();

    return () => cancelAnimationFrame(frame);
  });

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const at = cursor ?? -1;
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          moveTo(at + 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (at > 0) moveTo(at - 1);
          break;
        case 'Home':
          event.preventDefault();
          moveTo(0);
          break;
        case 'End':
          event.preventDefault();
          moveTo(rows.length - 1);
          break;
        case 'PageDown':
          event.preventDefault();
          moveTo(at + 10);
          break;
        case 'PageUp':
          event.preventDefault();
          moveTo(at - 10);
          break;
      }
    },
    [cursor, moveTo, rows.length],
  );

  return (
    <div ref={anchor} onKeyDown={onKeyDown}>
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
                onFocus={setCursor}
                wordDetails={wordDetails}
                wordMasks={wordMasks}
                shown={displayOrder(chosen, row)}
                isPinned={pinnedSet.has(displayOrder(chosen, row).join(' '))}
                onTogglePin={onTogglePin}
                copied={copied}
                onCopy={onCopy}
                onChoose={onChoose}
                share={share}
                discovery={discoveryFor(discovered, row)}
                votes={votes}
                promotions={discovered ? promotions : null}
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
  shown,
  index,
  expanded,
  onToggle,
  onFocus,
  wordDetails,
  wordMasks,
  isPinned,
  onTogglePin,
  copied,
  onCopy,
  onChoose,
  share,
  discovery,
  votes,
  promotions,
}: {
  /** The engine's order: the row's identity and the root of its orderings. */
  row: Row;
  /** The order on display: the reader's choice, or `row`. */
  shown: readonly string[];
  index: number;
  expanded: boolean;
  onToggle(index: number): void;
  onFocus(index: number): void;
  wordDetails(words: readonly string[]): Promise<WordDetail[]>;
  wordMasks(words: readonly string[]): Promise<number[]>;
  isPinned: boolean;
  onTogglePin(phrase: string): void;
  copied: string | null;
  onCopy(key: string, text: string): void;
  onChoose(order: readonly string[]): void;
  share: ShareContext;
  /** The published hit this row stands for, if any. */
  discovery: RowDiscovery | null;
  votes: Votes;
  /** Null until the page knows which rows are published, so no row offers Promote for one that is. */
  promotions: Promotions | null;
}) {
  const phrase = shown.join(' ');
  const [details, setDetails] = useState<WordDetail[] | null>(null);
  const [masks, setMasks] = useState<number[] | null>(null);
  const [sharing, setSharing] = useState(false);

  // Step to the next ordering in the ranked list. The masks that rank it are
  // fetched on first use, so a collapsed row can be reordered without opening.
  const reorder = useCallback(async () => {
    let ranked = masks;
    if (!ranked) {
      ranked = await wordMasks(row);
      setMasks(ranked);
    }
    onChoose(nextOrdering(row, shown, ORDERINGS_SHOWN, ranked.length === row.length ? ranked : undefined));
  }, [masks, wordMasks, row, shown, onChoose]);

  const shareable: Shareable = {
    input: share.input,
    phrase,
    url: share.urlFor(phrase),
    total: share.total,
  };

  // Definitions and spellings are fetched only for rows someone opened —
  // there is no sense pulling shards for the thousands scrolling past.
  useEffect(() => {
    if (!expanded || details) return;
    let live = true;
    void wordDetails(row).then((result) => {
      if (live) setDetails(result);
    });
    return () => {
      live = false;
    };
  }, [expanded, details, row, wordDetails]);

  // Masks rank the alternate orderings. Fetched alongside the definitions and
  // for the same reason: only a row someone opened needs them.
  useEffect(() => {
    if (!expanded || masks) return;
    let live = true;
    void wordMasks(row).then((result) => {
      if (live) setMasks(result);
    });
    return () => {
      live = false;
    };
  }, [expanded, masks, row, wordMasks]);

  // Counting is a few multiplications; the orderings themselves are computed
  // only for a row somebody opened.
  const orderCount = row.length > 1 ? countOrderings(row) : 1;
  const orders =
    expanded && orderCount > 1 ? orderings(row, ORDERINGS_SHOWN, masks ?? undefined) : [];

  return (
    <div className={`border-b border-rule ${isPinned ? 'bg-accent-wash/40' : ''}`}>
      <div className="group flex flex-wrap items-baseline gap-x-3">
        <button
          type="button"
          onClick={() => onToggle(index)}
          onFocus={() => onFocus(index)}
          aria-expanded={expanded}
          className="flex flex-1 items-baseline gap-3 py-3 text-left transition-colors duration-150
                     hover:bg-sunken focus-visible:bg-sunken"
        >
          <span className="w-10 shrink-0 pl-1 font-mono text-[11px] text-ink-faint tabular-nums">
            {index + 1}
          </span>
          <span className="font-display flex-1 text-xl leading-snug text-ink">{phrase}</span>
        </button>

        {/* Four actions no longer fit beside a phrase on a phone; below `sm`
            they take their own line under it instead of squeezing the words,
            and wrap when Vote or Promote needs the room. */}
        <span className="flex basis-full shrink-0 flex-wrap items-baseline gap-x-2 gap-y-1 pb-2 pl-14 sm:basis-auto sm:flex-nowrap sm:pb-0 sm:pl-2 sm:pr-1">
          {orderCount > 1 && (
            <RowAction label="Reorder" active={false} onClick={() => void reorder()} />
          )}
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
          <RowAction label="Share" active={sharing} onClick={() => setSharing((open) => !open)} />
          {discovery ? (
            <PublishedAction discovery={discovery} votes={votes} />
          ) : (
            promotions && <PromoteAction words={shown} input={share.input} promotions={promotions} />
          )}
        </span>
      </div>

      {sharing && (
        <div className="settle pb-3 pl-14">
          <ShareActions item={shareable} id={`row:${phrase}`} copied={copied} onCopy={onCopy} />
        </div>
      )}

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
                  const current = text === phrase;
                  return (
                    <li key={text}>
                      <button
                        type="button"
                        onClick={() => onChoose(order)}
                        title={current ? 'The order shown' : 'Show this order'}
                        aria-pressed={current}
                        className={`font-display text-left transition-colors duration-150
                                    hover:text-accent ${current ? 'text-ink' : 'text-ink-soft'}`}
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
              Words
            </p>
            <WordDetails details={details} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * A row that is on Discover: its section, the Discover spelling when the
 * row spells it another way, and Vote. Always visible, since few rows have it.
 */
function PublishedAction({ discovery, votes }: { discovery: RowDiscovery; votes: Votes }) {
  const { hit, label, respelled } = discovery;
  return (
    <span className="inline-flex items-center gap-2">
      <a
        href={`/hits#${hit.slug}`}
        className="font-mono text-[11px] text-ink-faint transition-colors duration-150 hover:text-accent"
      >
        {label}
        {respelled && <> · {hit.display}</>}
      </a>
      <VoteButton hit={hit} votes={votes} reserve />
    </span>
  );
}

/** Promote, with its count, for a row that is not on Discover. Absent when promotions did not load. */
function PromoteAction({ words, input, promotions }: { words: readonly string[]; input: string; promotions: Promotions }) {
  if (promotions.status !== 'open' && promotions.status !== 'closed') return null;
  if (!promotable(input, words)) return null;
  const key = promotionKey(words);
  const count = promotions.counts[key] ?? 0;
  return (
    <CountButton
      label="Promote"
      count={count}
      pressed={promotions.mine.has(key)}
      busy={promotions.busy.has(key)}
      disabled={promotions.status === 'closed'}
      ariaLabel={`Promote ${words.join(' ')}, ${count} ${count === 1 ? 'promotion' : 'promotions'}`}
      onClick={() => promotions.toggle(words)}
      quiet
    />
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
