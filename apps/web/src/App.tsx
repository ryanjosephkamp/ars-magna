import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatCount, type Query } from '@ars-magna/engine';
import { SearchField } from './components/SearchField.tsx';
import { Controls } from './components/Controls.tsx';
import { ResultList } from './components/ResultList.tsx';
import { PinnedStrip } from './components/PinnedStrip.tsx';
import { useEngine, useResults } from './state/useEngine.ts';
import { decodeQuery, shareUrl, syncUrl } from './lib/urlState.ts';
import { useCopy } from './lib/useCopy.ts';
import { Definitions } from './lib/definitions.ts';
import type { WordDetail } from './components/WordDetails.tsx';

export function App() {
  // The URL is the source of truth on first paint, so a shared link opens on
  // exactly the search it was copied from.
  const initial = useMemo(() => decodeQuery(window.location.hash), []);
  const [input, setInput] = useState(initial.input);
  const [filters, setFilters] = useState<Omit<Query, 'input'>>(initial);
  const [surprise, setSurprise] = useState<string[] | null>(null);
  const [pinned, setPinned] = useState<string[]>([]);

  const query = useMemo<Query>(() => ({ input, ...filters }), [input, filters]);
  const letters = useMemo(() => input.replace(/[^a-zA-Z]/g, '').toLowerCase(), [input]);

  const { engine, searching, error, candidates, loadMore, at, surpriseMe, spellings } =
    useEngine(query);
  const results = useResults();
  const { copied, copy } = useCopy();

  // One instance for the session, so its shard cache survives across rows.
  const definitions = useMemo(() => new Definitions('/defs'), []);

  /**
   * Everything an expanded row needs about its words, in one call: the
   * definition and provenance from the shard files, and the other spellings of
   * the same letters from the engine. Fetched together so the row renders once
   * rather than twice.
   */
  const wordDetails = useCallback(
    async (words: readonly string[]): Promise<WordDetail[]> => {
      const [spellingLists, infos] = await Promise.all([
        Promise.all(words.map((word) => spellings(word))),
        definitions.lookupAll(words),
      ]);
      return words.map((word, i) => ({
        word,
        spellings: spellingLists[i]?.length ? spellingLists[i]! : [word],
        info: infos[i]!,
      }));
    },
    [definitions, spellings],
  );

  useEffect(() => syncUrl(query), [query]);

  // Back/forward moves between searches the user actually navigated to.
  useEffect(() => {
    const onPop = () => {
      const next = decodeQuery(window.location.hash);
      setInput(next.input);
      setFilters(next);
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
    };
  }, []);

  const counts = engine.state === 'ready' ? engine.counts : null;
  const hasQuery = letters.length > 0;
  const total = results.total;
  const empty = hasQuery && !searching && total === '0' && error === null;

  const patch = useCallback((next: Partial<Query>) => {
    setSurprise(null);
    setFilters((current) => ({ ...current, ...next }));
  }, []);

  // Pins belong to the letters, not to the filters — narrowing minWordLen
  // should not silently discard what you set aside.
  useEffect(() => setPinned([]), [letters]);

  const togglePin = useCallback((phrase: string) => {
    setPinned((current) =>
      current.includes(phrase) ? current.filter((p) => p !== phrase) : [phrase, ...current],
    );
  }, []);

  return (
    <div className="min-h-dvh">
      <main className="mx-auto max-w-3xl px-6 pt-16 pb-24 sm:pt-24">
        <header className="mb-12">
          <h1 className="font-display text-5xl tracking-[-0.02em] text-ink sm:text-6xl">
            Ars Magna
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Every way your letters can spell something else.{' '}
            <span className="text-ink-faint">
              The name is an anagram of <i>Anagrams</i>.
            </span>
          </p>
        </header>

        <SearchField value={input} onChange={setInput} letters={letters} />

        <div className="mt-10">
          <Controls
            query={query}
            counts={counts}
            onChange={patch}
            invalidWord={
              error?.code === 'UNKNOWN_WORD'
                ? 'not in this dictionary'
                : error?.code === 'NOT_A_SUBSET'
                  ? "doesn't fit these letters"
                  : null
            }
          />
        </div>

        <section className="mt-12" aria-label="Results">
          {engine.state === 'loading' && <Booting />}

          {engine.state === 'failed' && (
            <Notice>
              The dictionary didn’t load. {engine.message}
              <br />
              <span className="text-ink-faint">
                Reload to try again — it’s cached after the first visit.
              </span>
            </Notice>
          )}

          {engine.state === 'ready' && !hasQuery && <Intro counts={counts} />}

          {engine.state === 'ready' && hasQuery && (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-b border-rule-strong pb-3">
                <p aria-live="polite" className="text-ink">
                  <span className="font-display text-3xl text-accent tabular-nums">
                    {formatCount(total)}
                  </span>{' '}
                  <span className="text-sm text-ink-soft">
                    {total === '1' ? 'anagram' : 'anagrams'}
                  </span>
                  {searching && <span className="ml-2 text-xs text-ink-faint">searching…</span>}
                </p>

                {total !== '0' && (
                  <div className="flex items-baseline gap-5 text-sm">
                    <JumpTo total={total} at={at} onResult={setSurprise} />
                    <TextButton onClick={() => void surpriseMe().then(setSurprise)}>
                      Surprise me
                    </TextButton>
                    <TextButton
                      onClick={() => copy('__link', shareUrl(query))}
                      active={copied === '__link'}
                    >
                      {copied === '__link' ? 'Link copied' : 'Copy link'}
                    </TextButton>
                  </div>
                )}
              </div>

              {results.truncated && (
                <p className="border-b border-rule px-3 py-2.5 text-sm text-ink-soft">
                  This search hit its time limit, so the count is a floor and the list is
                  incomplete.{' '}
                  <span className="text-ink-faint">
                    Raising the minimum word length or lowering the maximum number of words will
                    let it finish.
                  </span>
                </p>
              )}

              {surprise && (
                <div className="settle flex items-baseline justify-between gap-4 border-b border-rule bg-accent-wash px-3 py-3">
                  <span className="font-display text-xl text-ink">{surprise.join(' ')}</span>
                  <span className="flex shrink-0 gap-3">
                    <TextButton
                      small
                      onClick={() => copy(surprise.join(' '), surprise.join(' '))}
                      active={copied === surprise.join(' ')}
                    >
                      {copied === surprise.join(' ') ? 'Copied' : 'Copy'}
                    </TextButton>
                    <TextButton small onClick={() => togglePin(surprise.join(' '))}>
                      Pin
                    </TextButton>
                    <TextButton small onClick={() => setSurprise(null)}>
                      Dismiss
                    </TextButton>
                  </span>
                </div>
              )}

              <PinnedStrip
                pinned={pinned}
                onUnpin={togglePin}
                onCopy={copy}
                onCopyAll={() => copy('__pins', pinned.join('\n'))}
                copied={copied}
              />

              {empty ? (
                <NoResults letters={letters} tier={filters.tier} />
              ) : (
                <ResultList
                  rows={results.rows}
                  total={formatCount(total)}
                  hasMore={results.hasMore}
                  onLoadMore={loadMore}
                  wordDetails={wordDetails}
                  pinned={pinned}
                  onTogglePin={togglePin}
                  copied={copied}
                  onCopy={copy}
                />
              )}
            </>
          )}
        </section>

        {counts && (
          <footer className="mt-16 border-t border-rule pt-6 font-mono text-[11px] leading-relaxed text-ink-faint">
            <p>
              {counts.full.toLocaleString()} words · {counts.signatures.toLocaleString()} anagram
              classes · English OpenList
              {hasQuery && candidates > 0 && <> · {candidates.toLocaleString()} candidates</>}
            </p>
          </footer>
        )}
      </main>
    </div>
  );
}

function TextButton({
  children,
  onClick,
  active = false,
  small = false,
}: {
  children: React.ReactNode;
  onClick(): void;
  active?: boolean;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`underline decoration-rule-strong underline-offset-4 transition-colors
                  duration-150 hover:text-accent hover:decoration-accent ${
                    small ? 'font-mono text-[11px]' : ''
                  } ${active ? 'text-accent decoration-accent' : 'text-ink-soft'}`}
    >
      {children}
    </button>
  );
}

/**
 * Jump straight to a position in the result set.
 *
 * Only worth exposing because the engine can unrank: reaching result 8,000,000
 * costs the same as reaching result 8, so there is no reason to make someone
 * scroll for it.
 */
function JumpTo({
  total,
  at,
  onResult,
}: {
  total: string;
  at(index: bigint): Promise<string[] | null>;
  onResult(row: string[] | null): void;
}) {
  const [value, setValue] = useState('');
  const max = BigInt(total.replace('>', ''));

  const go = () => {
    const digits = value.replace(/[^0-9]/g, '');
    if (digits.length === 0) return;
    const position = BigInt(digits);
    if (position < 1n || position > max) return;
    void at(position - 1n).then(onResult);
  };

  return (
    <span className="flex items-baseline gap-1.5">
      <label htmlFor="jump" className="text-ink-faint">
        Go to
      </label>
      <input
        id="jump"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && go()}
        onBlur={go}
        inputMode="numeric"
        placeholder="#"
        aria-label={`Jump to a result between 1 and ${total}`}
        className="w-16 border-b border-rule bg-transparent pb-0.5 text-center font-mono text-xs
                   text-ink transition-colors duration-150 outline-none
                   placeholder:text-ink-faint focus:border-accent"
      />
    </span>
  );
}

function Booting() {
  return (
    <div className="space-y-3" aria-live="polite">
      <p className="font-mono text-xs text-ink-faint">Loading the dictionary…</p>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded-[2px] bg-sunken"
          style={{ width: `${70 - i * 14}%`, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-t border-accent bg-accent-wash px-4 py-3 text-sm text-ink">{children}</p>
  );
}

/** The empty state teaches the tool rather than apologizing for being empty. */
function Intro({ counts }: { counts: { full: number } | null }) {
  const examples = [
    ['dormitory', 'dirty room'],
    ['astronomer', 'moon starer'],
    ['conversation', 'conservation'],
    ['schoolmaster', 'the classroom'],
  ];

  return (
    <div className="text-sm">
      <p className="max-w-prose leading-relaxed text-ink-soft">
        Type a word, a name, or a whole phrase. Every letter gets used exactly once — spaces move
        wherever they need to, and punctuation, digits and capitals are ignored.
      </p>
      <dl className="mt-8 space-y-2">
        {examples.map(([from, to]) => (
          <div key={from} className="flex items-baseline gap-3">
            <dt className="font-display w-40 shrink-0 text-lg text-ink-faint">{from}</dt>
            <dd className="font-display text-lg text-ink">{to}</dd>
          </div>
        ))}
      </dl>
      {counts && (
        <p className="mt-8 text-ink-faint">
          Checked against {counts.full.toLocaleString()} words.
        </p>
      )}
    </div>
  );
}

function NoResults({ letters, tier }: { letters: string; tier: string }) {
  return (
    <div className="py-10 text-sm">
      <p className="text-ink">
        Nothing spells <span className="font-display text-lg">{letters}</span> in the {tier}{' '}
        dictionary.
      </p>
      <ul className="mt-4 space-y-1.5 text-ink-soft">
        <li>Try a larger dictionary — Full carries every word in the list.</li>
        <li>Lower the minimum word length, or raise the maximum number of words.</li>
        <li>
          Some letter sets genuinely have no partition. A lone <i>q</i> with no <i>u</i> is a
          common culprit.
        </li>
      </ul>
    </div>
  );
}
