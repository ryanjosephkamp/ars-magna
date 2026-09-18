import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Definitions } from '../lib/definitions.ts';
import { useCopy } from '../lib/useCopy.ts';
import { buildHref } from '../lib/urlState.ts';
import { CheckToast } from '../components/CheckToast.tsx';
import { VoteButton } from '../components/CountButton.tsx';
import { ShareActions } from '../components/ShareActions.tsx';
import { SiteFooter } from '../components/SiteFooter.tsx';
import { SiteHeader } from '../components/SiteHeader.tsx';
import {
  CATEGORIES,
  CATEGORY_LABEL,
  FOLD,
  SECTIONS,
  inOrder,
  linkedSection,
  pickOfTheDay,
  sectionAt,
  sectionOpen,
  withDefaults,
  type Category,
  type Order,
  type PublicHit,
  type Shelf,
} from './build.ts';
import { HitDetails } from './HitDetails.tsx';
import { usePass } from '../state/usePass.ts';
import { useVotes } from './useVotes.ts';

const ORDERS: readonly { order: Order; label: string }[] = [
  { order: 'votes', label: 'Most votes' },
  { order: 'newest', label: 'Newest' },
  { order: 'alphabetical', label: 'A to Z' },
];

type Loaded = { state: 'loading' } | { state: 'ready'; hits: PublicHit[] } | { state: 'failed' };

/** How long the list waits for votes before it is shown without them, in milliseconds. */
const VOTES_WAIT = 1500;

/** Space between the pinned sections line and a section the reader jumped to, in pixels. */
const JUMP_GAP = 16;

const LINK = 'text-ink-soft underline decoration-rule-strong underline-offset-4 transition-colors duration-150 hover:text-accent hover:decoration-accent';

/**
 * Discover: the anagrams worth keeping, in three sections (Greatest Hits,
 * Interesting and A stretch), one per row, in the same typographic register as
 * the search results. The list is small enough to hold in memory whole, so
 * filtering is instant and there is no paging: each section shows its first
 * twelve rows and the rest behind Show all, and the sections line stays at the
 * top of the screen once scrolled past.
 */
export function Gallery() {
  const [loaded, setLoaded] = useState<Loaded>({ state: 'loading' });
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [filter, setFilter] = useState('');
  const [order, setOrder] = useState<Order>('votes');
  const [selected, setSelected] = useState<string | null>(() => window.location.hash.slice(1) || null);
  // Which hit's share actions are open: one at a time, by id.
  const [sharing, setSharing] = useState<string | null>(null);
  // Which row is opened to its details: one at a time, by id, and none to start with.
  const [opened, setOpened] = useState<string | null>(null);
  const definitions = useMemo(() => new Definitions('/defs'), []);
  // Show all (true) and Show fewer (false), by section; a section the reader has not chosen for is folded,
  // unless a link points into it.
  const [unfolded, setUnfolded] = useState<Partial<Record<Shelf, boolean>>>({});
  const { copied, copy } = useCopy();
  const pass = usePass();
  const votes = useVotes(pass);
  const votesShown = votes.status === 'open' || votes.status === 'closed';
  // Most votes ranks by the counts as they were when votes loaded, or when an order was last chosen, so a row
  // never jumps away from under the reader the moment they vote for it. Captured while rendering, not in an
  // effect, so the render that first shows the counts is already in their order; later counts wait until the
  // reader chooses an order.
  const [ranking, setRanking] = useState<Readonly<Record<string, number>>>({});
  const [ranked, setRanked] = useState(false);
  if (votesShown && !ranked) {
    setRanked(true);
    setRanking(votes.counts);
  }
  // When votes are slower than the list waits for, the list is already in Most votes order, ranked by no
  // counts (A to Z), so it does not re-sort from Newest the moment they arrive. Newest stands in only when
  // votes cannot load.
  const votesUnavailable = votes.status === 'unavailable';
  const orders = votesUnavailable ? ORDERS.filter((o) => o.order !== 'votes') : ORDERS;
  const shownOrder: Order = order === 'votes' && votesUnavailable ? 'newest' : order;

  useEffect(() => {
    fetch('/hits.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((body: { hits: PublicHit[] }) => setLoaded({ state: 'ready', hits: body.hits.map(withDefaults) }))
      .catch(() => setLoaded({ state: 'failed' }));
  }, []);

  // The list waits for votes as well as the anagrams, for up to VOTES_WAIT. Shown before their counts, the
  // sections sat in A to Z order and re-sorted when the counts came, which changed which twelve rows each
  // section showed and moved everything below. A vote service slower than that gets no say in the first paint.
  const [votesLate, setVotesLate] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVotesLate(true), VOTES_WAIT);
    return () => clearTimeout(timer);
  }, []);
  const votesSettled = votes.status !== 'loading';
  const listReady = loaded.state === 'ready' && (votesSettled || votesLate);

  // A shared link lands on its hit: keep the selection in the hash so the
  // address bar is the share link, and scroll it into view once loaded.
  useEffect(() => {
    const onHash = () => {
      setSelected(window.location.hash.slice(1) || null);
      // A new link opens its section again, even one the reader folded.
      setUnfolded((u) => Object.fromEntries(Object.entries(u).filter(([, open]) => open)));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  // It scrolls there once the list is in, and again once votes settle, since their counts can re-rank a
  // section; the second time only if the reader has not begun scrolling for themselves.
  const readerMoved = useRef(false);
  useEffect(() => {
    const moved = () => {
      readerMoved.current = true;
    };
    window.addEventListener('wheel', moved, { passive: true });
    window.addEventListener('touchmove', moved, { passive: true });
    window.addEventListener('keydown', moved);
    return () => {
      window.removeEventListener('wheel', moved);
      window.removeEventListener('touchmove', moved);
      window.removeEventListener('keydown', moved);
    };
  }, []);
  useEffect(() => {
    if (!listReady || !selected) return;
    readerMoved.current = false;
    document.getElementById(`hit-${selected}`)?.scrollIntoView({ block: 'center' });
  }, [listReady, selected]);
  // Keyed on the ranking as well, for votes that settle after the list is shown, since the scroll has to follow
  // their order.
  useEffect(() => {
    if (!listReady || !selected || !votesSettled || readerMoved.current) return;
    document.getElementById(`hit-${selected}`)?.scrollIntoView({ block: 'center' });
  }, [listReady, selected, votesSettled, ranking]);

  const hits = loaded.state === 'ready' ? loaded.hits : [];
  const today = useMemo(() => pickOfTheDay(hits, new Date().toISOString().slice(0, 10)), [hits]);
  const visible = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    return hits.filter(
      (h) =>
        (category === 'all' || h.category === category) &&
        (needle.length === 0 || h.input.toLowerCase().includes(needle) || h.display.includes(needle)),
    );
  }, [hits, category, filter]);

  const counts = useMemo(() => {
    const out = new Map<string, number>();
    for (const h of hits) out.set(h.category, (out.get(h.category) ?? 0) + 1);
    return out;
  }, [hits]);

  const bySection = useMemo(() => {
    const out = new Map<Shelf, { shown: PublicHit[]; total: number }>(SECTIONS.map((s) => [s.shelf, { shown: [], total: 0 }]));
    for (const h of hits) out.get(h.shelf)!.total += 1;
    for (const h of visible) out.get(h.shelf)!.shown.push(h);
    for (const section of out.values()) section.shown = inOrder(section.shown, shownOrder, ranking);
    return out;
  }, [hits, visible, shownOrder, ranking]);

  const filtered = category !== 'all' || filter.trim().length > 0;
  const linked = useMemo(() => linkedSection(hits, selected), [hits, selected]);

  // The sections line: whether it is pinned, its height (each section's scroll margin, so a jump lands below
  // it), and the section under its lower edge. A zero-height marker sits where the line would rest; once the
  // marker is above the screen, the line is pinned.
  const bar = useRef<HTMLElement>(null);
  const barRest = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [barHeight, setBarHeight] = useState(0);
  const [inView, setInView] = useState<Shelf | null>(null);
  useEffect(() => {
    if (!listReady) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (!bar.current || !barRest.current) return;
      const edge = bar.current.getBoundingClientRect();
      setPinned(barRest.current.getBoundingClientRect().top < 0);
      setBarHeight(Math.ceil(edge.height));
      const bounds = SECTIONS.flatMap((s) => {
        const rect = document.getElementById(`section-${s.shelf}`)?.getBoundingClientRect();
        return rect ? [{ shelf: s.shelf, top: rect.top, bottom: rect.bottom }] : [];
      });
      // A little past where a jump lands a section, so the section jumped to is the one marked.
      setInView(sectionAt(bounds, edge.bottom + JUMP_GAP + 8));
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Rows opening, folding or filtering move the sections without a scroll.
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
    };
  }, [listReady]);

  /**
   * Show all keeps the reader where they are and moves focus to the first row it
   * revealed. Show fewer keeps its own control where it was on the screen, so
   * folding forty rows away does not drop the reader somewhere else on the page.
   */
  const toggleFold = (shelf: Shelf, open: boolean, control: HTMLElement) => {
    if (open) {
      const before = control.getBoundingClientRect().top;
      flushSync(() => setUnfolded((u) => ({ ...u, [shelf]: false })));
      window.scrollBy(0, control.getBoundingClientRect().top - before);
      return;
    }
    flushSync(() => setUnfolded((u) => ({ ...u, [shelf]: true })));
    document.querySelector<HTMLElement>(`#section-${shelf} li[data-fold]`)?.focus({ preventScroll: true });
  };

  const shareUrl = (hit: PublicHit) => `${window.location.origin}/hits/${hit.slug}/`;
  const shareable = (hit: PublicHit) => ({ input: hit.input, phrase: hit.display, url: shareUrl(hit), total: null });
  const toggleShare = (id: string) => setSharing((open) => (open === id ? null : id));
  const toggleOpened = (id: string) => setOpened((current) => (current === id ? null : id));
  const jumpTo = (shelf: Shelf) => document.getElementById(`section-${shelf}`)?.scrollIntoView({ block: 'start' });
  const chooseOrder = (next: Order) => {
    setOrder(next);
    setRanking(votes.counts);
  };

  return (
    <div className="min-h-dvh">
      <SiteHeader page="/hits" />
      <main className="mx-auto max-w-3xl px-6 pt-16 pb-24 sm:pt-24">
        <header className="mb-12">
          <h1 className="font-display text-5xl tracking-[-0.02em] text-ink sm:text-6xl">Discover</h1>
          <p className="mt-2 max-w-prose text-sm text-ink-soft">
            Anagrams worth keeping: every letter of a name, a company, a title or a place, rearranged into
            something that says something about it.{' '}
            <span className="text-ink-faint">Some are classics and some the engine turned up; each was judged and kept by hand.</span>{' '}
            <a href="/how" className={LINK}>
              How Discover works
            </a>
          </p>
        </header>

        {(loaded.state === 'loading' || (loaded.state === 'ready' && !listReady)) && (
          <p className="font-mono text-xs text-ink-faint" aria-live="polite">
            Loading the anagrams…
          </p>
        )}
        {loaded.state === 'failed' && (
          <p className="border-t border-accent bg-accent-wash px-4 py-3 text-sm text-ink">The list didn’t load. Reload to try again.</p>
        )}

        {listReady && (
          <>
            {today && (
              <section aria-label="Anagram of the day" className="mb-12 border-y border-rule-strong py-6">
                <p className="mb-2 font-mono text-[11px] tracking-[0.08em] text-ink-faint uppercase">Today</p>
                <p className="font-display text-3xl leading-tight text-ink sm:text-4xl">
                  <span className="text-ink-faint">{today.input}</span>
                  <span className="mx-3 text-rule-strong">→</span>
                  {today.display}
                </p>
                {today.justification && <p className="mt-2 max-w-prose text-sm text-ink-soft">{today.justification}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px]">
                  <VoteButton hit={today} votes={votes} reserve />
                  <RowAction label="Share" active={sharing === 'today'} onClick={() => toggleShare('today')} always />
                  {sharing === 'today' && <ShareActions item={shareable(today)} id="today" copied={copied} onCopy={copy} />}
                </div>
              </section>
            )}

            <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase" id="category-label">
                  Category
                </span>
                <div role="radiogroup" aria-labelledby="category-label" className="flex flex-wrap divide-x divide-rule overflow-hidden rounded-[3px] border border-rule bg-surface">
                  {(['all', ...CATEGORIES] as const).map((c) => {
                    const active = c === category;
                    const n = c === 'all' ? hits.length : (counts.get(c) ?? 0);
                    return (
                      <button
                        key={c}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setCategory(c)}
                        className={`px-3 py-1.5 text-sm transition-colors duration-150 ${
                          active ? 'bg-accent-wash font-medium text-accent' : 'text-ink-soft hover:bg-sunken hover:text-ink'
                        }`}
                      >
                        {c === 'all' ? 'All' : CATEGORY_LABEL[c]}
                        <span className="ml-1.5 font-mono text-[10px] opacity-60">{n}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase" id="order-label">
                  Order
                </span>
                <div role="radiogroup" aria-labelledby="order-label" className="flex divide-x divide-rule overflow-hidden rounded-[3px] border border-rule bg-surface">
                  {orders.map((o) => {
                    const active = o.order === shownOrder;
                    return (
                      <button
                        key={o.order}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => chooseOrder(o.order)}
                        className={`px-3 py-1.5 text-sm transition-colors duration-150 ${
                          active ? 'bg-accent-wash font-medium text-accent' : 'text-ink-soft hover:bg-sunken hover:text-ink'
                        }`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* At least 10rem wide, so on a phone it takes its own line rather than squeezing beside Order. */}
              <div className="flex min-w-40 flex-1 flex-col gap-1.5">
                <label htmlFor="hits-filter" className="text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase">
                  Find
                </label>
                <input
                  id="hits-filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="a name or a phrase"
                  autoComplete="off"
                  spellCheck={false}
                  className="h-[34px] w-full max-w-56 rounded-[3px] border border-rule bg-surface px-2 text-sm transition-colors duration-150 placeholder:text-ink-faint hover:border-rule-strong"
                />
              </div>
            </div>

            {/* The line pins inside this block, so it lets go once the last section has scrolled past. */}
            <div>
              <div ref={barRest} aria-hidden="true" className="mt-2" />
              <nav
                ref={bar}
                aria-label="Sections"
                // The padding above takes the safe area, so on a phone with a notch the ground runs up behind it
                // rather than leaving rows showing through. On a phone the line runs edge to edge; wider, it keeps
                // to the column the rows sit in. Only the hairline and Top change once pinned, and both keep their
                // space, so pinning moves nothing.
                className={`sticky top-0 z-[var(--z-sticky)] -mx-6 flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b bg-ground px-6 sm:mx-0 sm:px-0 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 font-mono text-[11px] text-ink-faint transition-colors duration-150 ${
                  pinned ? 'border-rule' : 'border-transparent'
                }`}
              >
                <span aria-live="polite">
                  {visible.length} of {hits.length}
                </span>
                {SECTIONS.map((s) => {
                  const current = pinned && inView === s.shelf;
                  return (
                    <button
                      key={s.shelf}
                      type="button"
                      aria-current={current ? 'true' : undefined}
                      onClick={() => jumpTo(s.shelf)}
                      className={`transition-colors duration-150 hover:text-accent ${current ? 'text-accent' : ''}`}
                    >
                      {s.label}
                      <span className="ml-1.5 opacity-60">{bySection.get(s.shelf)!.shown.length}</span>
                    </button>
                  );
                })}
                {votes.status === 'closed' && <span>Voting is paused.</span>}
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0 })}
                  aria-hidden={pinned ? undefined : 'true'}
                  tabIndex={pinned ? undefined : -1}
                  className={`ml-auto transition-colors duration-150 hover:text-accent ${pinned ? '' : 'invisible'}`}
                >
                  Top
                </button>
              </nav>

              {SECTIONS.map((section) => {
                const { shown, total } = bySection.get(section.shelf)!;
                const titleId = `section-${section.shelf}-title`;
                const listId = `section-${section.shelf}-list`;
                const open = sectionOpen(section.shelf, { filtered, chosen: unfolded[section.shelf], linked });
                const rows = open ? shown : shown.slice(0, FOLD);
                return (
                  <section
                    key={section.shelf}
                    id={`section-${section.shelf}`}
                    aria-labelledby={titleId}
                    className="mt-10"
                    style={{ scrollMarginTop: barHeight + JUMP_GAP }}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h2 id={titleId} className="font-display text-3xl tracking-[-0.01em] text-ink sm:text-4xl">
                        {section.label}
                      </h2>
                      <span className="font-mono text-[11px] text-ink-faint">{shown.length === total ? total : `${shown.length} of ${total}`}</span>
                    </div>
                    <p className="mt-1 mb-4 max-w-prose text-sm text-ink-soft">{section.note}</p>
                    {shown.length > 0 ? (
                      <ol id={listId} className="border-t border-rule-strong">
                        {rows.map((hit, index) => {
                          const isSelected = hit.slug === selected;
                          const isOpened = opened === hit.id;
                          const detailsId = `details-${hit.slug}`;
                          return (
                            <li
                              key={hit.id}
                              id={`hit-${hit.slug}`}
                              // The first row Show all reveals takes focus, so a keyboard carries on from where the fold was.
                              {...(index === FOLD ? { 'data-fold': '', tabIndex: -1 } : {})}
                              className={`group border-b border-rule py-4 ${isSelected ? 'bg-accent-wash/40' : ''}`}
                            >
                              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                                {/* The anagram opens the row, as a result does on the search page. The negative margin
                                    keeps the words where they were while giving the hover wash some room. */}
                                <button
                                  type="button"
                                  aria-expanded={isOpened}
                                  aria-controls={isOpened ? detailsId : undefined}
                                  onClick={() => toggleOpened(hit.id)}
                                  className="-mx-1.5 rounded-[3px] px-1.5 text-left font-display text-2xl leading-snug text-ink transition-colors duration-150 hover:bg-sunken focus-visible:bg-sunken"
                                >
                                  <span className="text-ink-faint">{hit.input}</span>
                                  <span className="mx-3 text-rule-strong">→</span>
                                  {hit.display}
                                </button>
                                <span className="flex shrink-0 items-center gap-3 font-mono text-[11px]">
                                  <span className="text-ink-faint">{CATEGORY_LABEL[hit.category]}</span>
                                  <VoteButton hit={hit} votes={votes} reserve />
                                  <RowAction label="Share" active={sharing === hit.id} onClick={() => toggleShare(hit.id)} />
                                  <a href={buildHref(hit.input, hit.display)} className="text-ink-faint transition-colors duration-150 hover:text-accent md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100">
                                    Build
                                  </a>
                                  <a href={`/#q=${encodeURIComponent(hit.input)}`} className="text-ink-faint transition-colors duration-150 hover:text-accent md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100">
                                    Every anagram
                                  </a>
                                </span>
                              </div>
                              {hit.justification && <p className="mt-1 max-w-prose text-sm text-ink-soft">{hit.justification}</p>}
                              {isOpened && <HitDetails hit={hit} definitions={definitions} id={detailsId} />}
                              {sharing === hit.id && (
                                <div className="mt-2">
                                  <ShareActions item={shareable(hit)} id={hit.id} copied={copied} onCopy={copy} />
                                </div>
                              )}
                              {hit.submitter && <p className="mt-1 font-mono text-[11px] text-ink-faint">found by {hit.submitter}</p>}
                            </li>
                          );
                        })}
                      </ol>
                    ) : (
                      <p className="border-t border-rule-strong py-6 text-sm text-ink-soft">{total === 0 ? 'None yet.' : 'None here under that filter.'}</p>
                    )}
                    {!filtered && shown.length > FOLD && (
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={listId}
                        onClick={(e) => toggleFold(section.shelf, open, e.currentTarget)}
                        className="mt-4 rounded-[3px] border border-rule bg-surface px-3 py-1.5 text-sm text-ink-soft transition-colors duration-150 hover:border-accent hover:bg-accent-wash hover:text-accent"
                      >
                        {open ? 'Show fewer' : `Show all ${shown.length}`}
                      </button>
                    )}
                  </section>
                );
              })}
            </div>
          </>
        )}

        {/* The footer waits for the list. Painted under an empty page, it sat high on the screen and dropped when
            the rows arrived, which was the page's whole layout shift. */}
        {(listReady || loaded.state === 'failed') && <SiteFooter />}
      </main>

      <CheckToast pass={pass} />
    </div>
  );
}

function RowAction({
  label,
  active,
  onClick,
  always = false,
}: {
  label: string;
  active: boolean;
  onClick(): void;
  /** Visible without hover: for the one action outside a hoverable row. */
  always?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`transition-opacity duration-150 hover:text-accent focus-visible:opacity-100 ${
        active ? 'text-accent opacity-100' : always ? 'text-ink-soft' : 'text-ink-faint md:opacity-0 md:group-hover:opacity-100'
      }`}
    >
      {label}
    </button>
  );
}
