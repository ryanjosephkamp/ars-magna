import { useEffect, useMemo, useState } from 'react';
import { useCopy } from '../lib/useCopy.ts';
import { ShareActions } from '../components/ShareActions.tsx';
import { CATEGORIES, CATEGORY_LABEL, SECTIONS, inOrder, pickOfTheDay, type Category, type Order, type PublicHit, type Shelf } from './build.ts';
import { useVotes, type Votes } from './useVotes.ts';

const ORDERS: readonly { order: Order; label: string }[] = [
  { order: 'votes', label: 'Most votes' },
  { order: 'newest', label: 'Newest' },
  { order: 'alphabetical', label: 'A to Z' },
];

type Loaded = { state: 'loading' } | { state: 'ready'; hits: PublicHit[] } | { state: 'failed' };

const DATASET = 'https://huggingface.co/datasets/ryanjosephkamp/ars-magna-greatest-hits';
const SUBMIT = 'https://github.com/ryanjosephkamp/ars-magna/issues/new?template=submit-anagram.yml';

const LINK = 'text-ink-soft underline decoration-rule-strong underline-offset-4 transition-colors duration-150 hover:text-accent hover:decoration-accent';

/**
 * Discoveries: the anagrams worth keeping, in three sections (Greatest Hits,
 * Interesting and A stretch), one per row, in the same typographic register as
 * the search results. The list is small enough to hold in memory whole, so
 * filtering is instant and there is no paging.
 */
export function Gallery() {
  const [loaded, setLoaded] = useState<Loaded>({ state: 'loading' });
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [filter, setFilter] = useState('');
  const [order, setOrder] = useState<Order>('votes');
  const [selected, setSelected] = useState<string | null>(() => window.location.hash.slice(1) || null);
  // Which hit's share actions are open: one at a time, by id.
  const [sharing, setSharing] = useState<string | null>(null);
  const { copied, copy } = useCopy();
  const votes = useVotes();
  const votesShown = votes.status === 'open' || votes.status === 'closed';
  // Most votes ranks by the counts as they were when votes loaded, or when an order was last chosen, so a row
  // never jumps away from under the reader the moment they vote for it.
  const [ranking, setRanking] = useState<Readonly<Record<string, number>>>({});
  useEffect(() => {
    if (votesShown) setRanking(votes.counts);
    // Only when votes first arrive: later counts wait until the reader chooses an order.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votesShown]);
  const orders = votesShown ? ORDERS : ORDERS.filter((o) => o.order !== 'votes');
  const shownOrder: Order = order === 'votes' && !votesShown ? 'newest' : order;

  useEffect(() => {
    fetch('/hits.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((body: { hits: PublicHit[] }) => setLoaded({ state: 'ready', hits: body.hits }))
      .catch(() => setLoaded({ state: 'failed' }));
  }, []);

  // A shared link lands on its hit: keep the selection in the hash so the
  // address bar is the share link, and scroll it into view once loaded.
  useEffect(() => {
    const onHash = () => setSelected(window.location.hash.slice(1) || null);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    if (loaded.state !== 'ready' || !selected) return;
    document.getElementById(`hit-${selected}`)?.scrollIntoView({ block: 'center' });
  }, [loaded.state, selected]);

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

  const shareUrl = (hit: PublicHit) => `${window.location.origin}/hits/${hit.slug}/`;
  const shareable = (hit: PublicHit) => ({ input: hit.input, phrase: hit.display, url: shareUrl(hit), total: null });
  const toggleShare = (id: string) => setSharing((open) => (open === id ? null : id));
  const jumpTo = (shelf: Shelf) => document.getElementById(`section-${shelf}`)?.scrollIntoView({ block: 'start' });
  const chooseOrder = (next: Order) => {
    setOrder(next);
    setRanking(votes.counts);
  };

  return (
    <div className="min-h-dvh">
      <main className="mx-auto max-w-3xl px-6 pt-16 pb-24 sm:pt-24">
        <header className="mb-12">
          <p className="mb-3 font-mono text-[11px] tracking-[0.08em] text-ink-faint uppercase">
            <a href="/" className="transition-colors duration-150 hover:text-accent">
              Ars Magna
            </a>
          </p>
          <h1 className="font-display text-5xl tracking-[-0.02em] text-ink sm:text-6xl">Discoveries</h1>
          <p className="mt-2 max-w-prose text-sm text-ink-soft">
            Anagrams worth keeping: every letter of a name, a company, a title or a place, rearranged into
            something that says something about it.{' '}
            <span className="text-ink-faint">Some are classics and some the engine turned up; each was judged and kept by hand.</span>{' '}
            <a href="/how" className={LINK}>
              How Discoveries works
            </a>
          </p>
        </header>

        {loaded.state === 'loading' && (
          <p className="font-mono text-xs text-ink-faint" aria-live="polite">
            Loading the anagrams…
          </p>
        )}
        {loaded.state === 'failed' && (
          <p className="border-t border-accent bg-accent-wash px-4 py-3 text-sm text-ink">The list didn’t load. Reload to try again.</p>
        )}

        {loaded.state === 'ready' && (
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
                  <VoteButton hit={today} votes={votes} />
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

            <nav aria-label="Sections" className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1 font-mono text-[11px] text-ink-faint">
              <span aria-live="polite">
                {visible.length} of {hits.length}
              </span>
              {SECTIONS.map((s) => (
                <button key={s.shelf} type="button" onClick={() => jumpTo(s.shelf)} className="transition-colors duration-150 hover:text-accent">
                  {s.label}
                  <span className="ml-1.5 opacity-60">{bySection.get(s.shelf)!.shown.length}</span>
                </button>
              ))}
              {votes.status === 'closed' && <span>Voting is paused.</span>}
            </nav>

            {SECTIONS.map((section) => {
              const { shown, total } = bySection.get(section.shelf)!;
              const titleId = `section-${section.shelf}-title`;
              return (
                <section key={section.shelf} id={`section-${section.shelf}`} aria-labelledby={titleId} className="mt-12 scroll-mt-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h2 id={titleId} className="font-display text-3xl tracking-[-0.01em] text-ink sm:text-4xl">
                      {section.label}
                    </h2>
                    <span className="font-mono text-[11px] text-ink-faint">{shown.length === total ? total : `${shown.length} of ${total}`}</span>
                  </div>
                  <p className="mt-1 mb-4 max-w-prose text-sm text-ink-soft">{section.note}</p>
                  {shown.length > 0 ? (
                    <ol className="border-t border-rule-strong">
                      {shown.map((hit) => {
                        const isSelected = hit.slug === selected;
                        return (
                          <li
                            key={hit.id}
                            id={`hit-${hit.slug}`}
                            className={`group border-b border-rule py-4 ${isSelected ? 'bg-accent-wash/40' : ''}`}
                          >
                            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                              <p className="font-display text-2xl leading-snug text-ink">
                                <span className="text-ink-faint">{hit.input}</span>
                                <span className="mx-3 text-rule-strong">→</span>
                                {hit.display}
                              </p>
                              <span className="flex shrink-0 items-center gap-3 font-mono text-[11px]">
                                <span className="text-ink-faint">{CATEGORY_LABEL[hit.category]}</span>
                                <VoteButton hit={hit} votes={votes} />
                                <RowAction label="Share" active={sharing === hit.id} onClick={() => toggleShare(hit.id)} />
                                <a href={`/#q=${encodeURIComponent(hit.input)}`} className="text-ink-faint transition-colors duration-150 hover:text-accent md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100">
                                  Every anagram
                                </a>
                              </span>
                            </div>
                            {hit.justification && <p className="mt-1 max-w-prose text-sm text-ink-soft">{hit.justification}</p>}
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
                </section>
              );
            })}
          </>
        )}

        <footer className="mt-20 border-t border-rule-strong pt-8 text-sm text-ink-faint">
          <p>
            The whole list is a dataset:{' '}
            <a href={DATASET} target="_blank" rel="noopener noreferrer" className={LINK}>
              ars-magna-greatest-hits on Hugging Face
            </a>
            , one subset per category. Found a good one?{' '}
            <a href={SUBMIT} target="_blank" rel="noopener noreferrer" className={LINK}>
              Submit it
            </a>
            .{' '}
            <a href="/how" className={LINK}>
              How Discoveries works
            </a>
            .
          </p>
        </footer>
      </main>

      {/* The check before a visit's first vote, and a vote that did not save. Out of sight unless there is something to say. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[var(--z-toast)] flex flex-col items-center gap-2 px-4 pb-4">
        <div className={votes.challenge ? 'pointer-events-auto rounded-[3px] border border-rule-strong bg-surface px-4 py-3 text-sm text-ink-soft' : ''}>
          {votes.challenge && <p className="mb-2 max-w-xs">Cloudflare checks this browser once before its first vote of a visit.</p>}
          <div ref={votes.checkRef} className="pointer-events-auto" />
        </div>
        {votes.message && (
          <p role="status" className="pointer-events-auto flex max-w-md items-baseline gap-4 rounded-[3px] border border-accent bg-accent-wash px-4 py-2 text-sm text-ink">
            {votes.message}
            <button type="button" onClick={votes.dismiss} className="font-mono text-[11px] text-ink-soft transition-colors duration-150 hover:text-accent">
              Dismiss
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

/** Vote, with the count. Pressed, it takes the accent; pressing again takes the vote back. Absent when votes did not load. */
function VoteButton({ hit, votes }: { hit: PublicHit; votes: Votes }) {
  if (votes.status !== 'open' && votes.status !== 'closed') return null;
  const pressed = votes.mine.has(hit.id);
  const count = votes.counts[hit.id] ?? 0;
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={`Vote for ${hit.input} → ${hit.display}, ${count} ${count === 1 ? 'vote' : 'votes'}`}
      aria-busy={votes.busy.has(hit.id)}
      disabled={votes.status === 'closed'}
      onClick={() => votes.toggle(hit.id)}
      className={`inline-flex min-h-7 items-center gap-1.5 rounded-[3px] border px-2 font-mono text-[11px] transition-colors duration-150 disabled:cursor-default disabled:opacity-60 ${
        pressed ? 'border-accent bg-accent-wash text-accent' : 'border-rule bg-surface text-ink-soft hover:border-accent hover:text-accent'
      }`}
    >
      Vote
      <span className="tabular-nums">{count}</span>
    </button>
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
