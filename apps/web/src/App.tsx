import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SELF, foldLetters, formatCount, fullReading, lettersOf, readItems, type Query } from '@ars-magna/engine';
import { SearchField } from './components/SearchField.tsx';
import { Controls } from './components/Controls.tsx';
import { ResultList } from './components/ResultList.tsx';
import { PinnedStrip } from './components/PinnedStrip.tsx';
import { useEngine, useResults } from './state/useEngine.ts';
import { decodeQuery, keptPhrases, shareRowUrl, shareUrl, splitQuery, syncUrl } from './lib/urlState.ts';
import { countUnit, offerFor, offerWords, type Offer } from './lib/classes.ts';
import { chosenLeet, leetFor, leetOf, readingOf } from './lib/readingChoice.ts';
import { termsFrom } from './lib/terms.ts';
import { leetReadingText, type RowTerm } from './lib/rowTerms.ts';
import { useTerms } from './state/useTerms.ts';
import { useCopy } from './lib/useCopy.ts';
import { choose, rowKey, type Chosen } from './lib/chosen.ts';
import type { ShareContext } from './components/ResultList.tsx';
import { JumpEntry } from './lib/jump.ts';
import { Definitions } from './lib/definitions.ts';
import type { WordDetail } from './components/WordDetails.tsx';
import { ResultToolbar } from './components/ResultToolbar.tsx';
import { SiteFooter } from './components/SiteFooter.tsx';
import { SiteHeader } from './components/SiteHeader.tsx';
import { applyView, countLineOf, queryNotice, type SortMode } from './lib/resultView.ts';
import { displayPhrase, displayWord, formsFrom } from './lib/forms.ts';
import {
  FILTER_COUNT_LIMIT_MS,
  containingKey,
  containingLine,
  containingQuery,
  filterScope,
  filterWords,
  loadsRest,
  shownAsTyped,
} from './lib/filterScope.ts';
import type { TextCount } from './lib/textCount.ts';
import { CountWorker } from './state/countWorker.ts';
import { discoveredFor } from './lib/inDiscoveries.ts';
import { InDiscoveries } from './components/InDiscoveries.tsx';
import { CheckToast } from './components/CheckToast.tsx';
import { usePass } from './state/usePass.ts';
import { usePromotions } from './state/usePromotions.ts';
import { usePublishedHits } from './state/usePublishedHits.ts';
import { useVotes } from './hits/useVotes.ts';
import { sortedLetters } from './votes/core.ts';
import {
  EXPORT_LIMIT,
  TEXT_LEFT_OUT,
  buildBlob,
  download,
  fileStem,
  type ExportFormat,
} from './lib/exporters.ts';

const NO_COUNTS: Readonly<Record<string, number>> = {};

/**
 * The node budget the count beside the count line runs under: the ladder's
 * fourth rung, which settles an ordinary text in well under a second. It is an
 * aside, not the answer, so it gives a floor (`more than 4,096`) rather than
 * holding the page's own worker while it finishes.
 */
const OFFER_MAX_NODES = 640_000;

export function App() {
  // The URL is the source of truth on first paint, so a shared link opens on
  // exactly the search it was copied from.
  const initial = useMemo(() => {
    const query = decodeQuery(window.location.hash);
    // A link to one anagram carries the phrase to keep, in the sharer's order.
    // Only a phrase the letters really spell gets through.
    return { ...splitQuery(query), kept: keptPhrases(window.location.hash, query.input, query.reading) };
  }, []);
  const [input, setInput] = useState(initial.input);
  const [filters, setFilters] = useState(initial.filters);
  // Which characters the reader has decided to read as themselves and as their
  // letters, and which not: only the ones they chose, so typing another text
  // takes that text's defaults (`$ ! @` on, digits off) rather than the last
  // one's. A link that names a set of its own fills this in.
  const [leetChosen, setLeetChosen] = useState<Readonly<Record<string, boolean>>>(() =>
    chosenLeet(initial.input, initial.filters.reading, initial.filters.leet),
  );
  const [surprise, setSurprise] = useState<string[] | null>(null);
  const [pinned, setPinned] = useState<string[]>(initial.kept);
  // The orders readers chose, keyed by each result's words. A kept phrase
  // from a link is also the chosen order for its row, so the row agrees with
  // the pin above it.
  const [chosen, setChosen] = useState<Chosen>(() => {
    const map = new Map<string, readonly string[]>();
    for (const phrase of initial.kept) {
      const words = phrase.split(' ');
      map.set(rowKey(words), words);
    }
    return map;
  });
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<SortMode>('default');
  const [loadingAll, setLoadingAll] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  // `input` goes last so it always wins. Belt and braces alongside splitQuery:
  // if a stale `input` ever gets back into `filters`, the search still follows
  // what is in the field rather than silently reverting to first paint. The
  // leet characters are worked out from the text each time, so they follow it.
  const query = useMemo<Query>(
    () => ({ ...filters, input, leet: leetFor(input, filters.reading, leetChosen) }),
    [input, filters, leetChosen],
  );
  // The same fold the engine applies, so the letters line and the search
  // never disagree about what "Beyoncé" contains, or that "Blink-182" leaves its number out.
  const folded = useMemo(() => foldLetters(input, filters.reading), [input, filters.reading]);
  const letters = folded.letters;
  // The digits and symbols of the text, each a character of the pool as itself, said so under the field (the literal rule).
  const items = useMemo(() => readItems(input, filters.reading), [input, filters.reading]);

  const {
    engine, searching, error, candidates, countedLetters, textLeftOut, unused, answered, forms: formList, termCounts, loadMore, collect, at, surpriseMe,
    spellings, masks, has, countWith,
  } = useEngine(query);
  const results = useResults();
  const { copied, copy } = useCopy();
  // The class files' terms, for the panel's line under a term that is not a word.
  const termList = useTerms();
  const terms = useMemo(() => termsFrom(termList), [termList]);
  // The dictionary's listed forms, by the word they spell: how `dont` reads as
  // `don't` on this page. The engine and every key know the letters alone.
  const forms = useMemo(() => formsFrom(formList), [formList]);
  const surpriseText = surprise ? displayPhrase(forms, surprise) : '';

  // One instance for the session, so its shard cache survives across rows.
  const definitions = useMemo(() => new Definitions('/defs'), []);

  /**
   * Everything an expanded row needs about its words, in one call: the
   * definition and provenance from the shard files, and the other spellings of
   * the same letters from the engine. Fetched together so the row renders once
   * rather than twice. A term that is not a word of the dictionary is not
   * looked up there at all: its line comes from the class files, and the
   * classes the engine makes from the text itself have a sentence of their own.
   */
  const wordDetails = useCallback(
    async (list: readonly RowTerm[]): Promise<WordDetail[]> => {
      // A leet row's term is a word of the dictionary, written with the
      // character its letter came from, so it is looked up like any word and
      // the panel says which character stands where.
      const inDictionary = (term: RowTerm) => term.termClass === null || term.termClass === 'leet';
      const words = list.filter(inDictionary).map((t) => t.word);
      const [spellingLists, infos] = await Promise.all([
        Promise.all(words.map((word) => spellings(word))),
        definitions.lookupAll(words),
      ]);
      // A spelling Must exclude took out of this search is not offered back.
      const shown = (from: string[] | undefined) => (from ?? []).filter((w) => !query.mustExclude.includes(w));
      let next = 0;
      return list.map((rowTerm) => {
        const { word, display, termClass } = rowTerm;
        if (!inDictionary(rowTerm)) {
          const term = terms.get(word);
          return {
            word,
            display,
            spellings: [display],
            info: { word, senses: [], provenance: 'attested' as const, forms: [] },
            ...(termClass ? { termClass } : {}),
            ...(term ? { term } : {}),
          };
        }
        const i = next++;
        const others = shown(spellingLists[i]);
        const leetText = termClass === 'leet' ? leetReadingText(word, display) : undefined;
        return {
          word,
          display,
          spellings: (others.length ? others : [word]).map((w) => displayWord(forms, w)),
          info: infos[i]!,
          ...(termClass ? { termClass } : {}),
          ...(leetText ? { leetText } : {}),
        };
      });
    },
    [definitions, spellings, query.mustExclude, forms, terms],
  );

  useEffect(() => syncUrl(query), [query]);

  // Back/forward moves between searches the user actually navigated to.
  useEffect(() => {
    const onPop = () => {
      const next = splitQuery(decodeQuery(window.location.hash));
      setInput(next.input);
      setFilters(next.filters);
      setLeetChosen(chosenLeet(next.input, next.filters.reading, next.filters.leet));
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

  // Discover on the search page. No count loads before the engine has
  // counted these letters, and nothing here ever holds back a result.
  const counted = hasQuery && countedLetters === letters;
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (counted) setStarted(true);
  }, [counted]);
  const pass = usePass();
  const votes = useVotes(pass, started);
  // The published hits are a static file, not counts, and they load with the
  // page: when the first count arrives they are already here, so the block can
  // take its place before the rows paint rather than push them down after.
  const publishedHits = usePublishedHits(true, letters);
  const sorted = useMemo(() => sortedLetters(letters), [letters]);
  // The block ranks by the vote counts as they were when votes settled for
  // these letters, so an entry never moves under the reader who votes for it.
  const votesSettled = votes.status !== 'loading';
  const [ranking, setRanking] = useState<{ letters: string; counts: Readonly<Record<string, number>> } | null>(null);
  useEffect(() => {
    if (votesSettled && ranking?.letters !== sorted) setRanking({ letters: sorted, counts: votes.counts });
    // Only a new set of letters, or votes settling, takes a new snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votesSettled, sorted]);
  const rankBy = ranking?.letters === sorted ? ranking.counts : NO_COUNTS;
  const discovered = useMemo(
    () => (publishedHits ? discoveredFor(publishedHits, sorted, rankBy) : null),
    [publishedHits, sorted, rankBy],
  );
  // The block and the row labels need only the letters and the published
  // hits, so they take their place as the search starts, before the rows
  // paint. Counts are another matter: votes load after the first count, and
  // promotions after the count for these letters.
  const shownDiscoveries = hasQuery ? discovered : null;
  const promotions = usePromotions(pass, { letters: sorted, input, tier: query.tier, enabled: counted && discovered !== null, reading: fullReading(input, query.reading) });
  const total = results.total;
  // A true zero is one the engine answered: an unanswered query is not empty.
  const countLine = countLineOf({ answered, searching, total, error });
  const empty = hasQuery && countLine.kind === 'answered' && countLine.empty;

  // What the term classes would add. A text with a digit or a symbol has no
  // anagram of words alone — no word has one — so when the count is 0 for that
  // reason the page counts once more with the classes that could use those
  // characters and offers them beside the number. Nothing else is offered:
  // this page has one number on it, and a second beside every ordinary search
  // would be noise.
  const leetable = useMemo(() => items.filter((i) => i.reading === SELF && lettersOf(i.key).length > 0).map((i) => i.key), [items]);
  const offer = useMemo(
    () =>
      empty && !searching
        ? offerFor({ unused, classes: query.classes, leet: query.leet, terms: termList, leetable })
        : null,
    [empty, searching, unused, query.classes, query.leet, termList, leetable],
  );
  const offerQuery = useMemo<Query | null>(
    () => (offer ? { ...query, classes: [...query.classes, ...offer.classes], leet: [...query.leet, ...offer.leet] } : null),
    [offer, query],
  );
  const offerKey = offerQuery ? `${letters}|${JSON.stringify(offerQuery)}` : null;
  const [offered, setOffered] = useState<{ key: string; total: string } | null>(null);
  useEffect(() => {
    if (!offerQuery || !offerKey) return;
    let live = true;
    void countWith(offerQuery, OFFER_MAX_NODES).then((counted) => {
      if (live && counted !== null) setOffered({ key: offerKey, total: counted });
    });
    return () => {
      live = false;
    };
  }, [offerKey, offerQuery, countWith]);
  // Only an answer to this search's own offer, and only one worth taking.
  const offerTotal = offer && offered?.key === offerKey && offered.total !== '0' ? offered.total : null;

  // Must-include problems belong on that control; anything else is about the
  // query as a whole and replaces the result area rather than sitting beside
  // an honest-looking "0 anagrams".
  const queryError =
    error && error.code !== 'UNKNOWN_WORD' && error.code !== 'NOT_A_SUBSET' ? error : null;

  // Deliberately cannot carry `input`: the text field owns that, and letting it
  // through here is what let a stale value shadow the live one.
  const patch = useCallback((next: Partial<Omit<Query, 'input'>>) => {
    setSurprise(null);
    setFilters((current) => ({ ...current, ...next }));
  }, []);

  /**
   * One character's reading, from the line under the field: as itself, as
   * itself and its letters, as one letter, or left out. The first two are the
   * same reading and differ in whether the search tries the letters too, so
   * both are set here.
   */
  const read = useCallback((char: string, value: string) => {
    setSurprise(null);
    const reading = readingOf(value);
    setFilters((current) => {
      const next = { ...current.reading };
      if (reading === SELF) delete next[char];
      else next[char] = reading;
      return { ...current, reading: next };
    });
    setLeetChosen((current) => ({ ...current, [char]: leetOf(value) }));
  }, []);

  /** Turn on what the count line offered: the classes, and the characters' leet letters. */
  const takeOffer = useCallback((offer: Offer) => {
    setSurprise(null);
    setFilters((current) => ({ ...current, classes: [...new Set([...current.classes, ...offer.classes])] }));
    setLeetChosen((current) => ({ ...current, ...Object.fromEntries(offer.leet.map((char) => [char, true])) }));
  }, []);

  // Pins and chosen orders belong to the letters, not to the filters —
  // narrowing minWordLen should not silently discard what you set aside. The
  // first letters are the link's own, so what the link kept survives first
  // paint (and StrictMode's second pass over the effects).
  const lastLetters = useRef(letters);
  useEffect(() => {
    if (lastLetters.current === letters) return;
    lastLetters.current = letters;
    setPinned([]);
    setChosen(new Map());
  }, [letters]);

  const onChoose = useCallback((order: readonly string[]) => {
    setChosen((current) => choose(current, order));
  }, []);

  const togglePin = useCallback((phrase: string) => {
    setPinned((current) =>
      current.includes(phrase) ? current.filter((p) => p !== phrase) : [phrase, ...current],
    );
  }, []);

  // A new query invalidates any filter or ordering applied to the old one.
  useEffect(() => {
    setFilter('');
    setSort('default');
  }, [query]);

  const visibleRows = useMemo(
    () => applyView(results.rows, { filter, sort }),
    // The buffer mutates in place, so its version counter is what actually
    // signals new rows; `results.rows` alone would be referentially stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [results.rows, results.length, filter, sort],
  );

  const shareContext = useMemo<ShareContext>(
    () => ({ input, reading: query.reading, total, urlFor: (phrase) => shareRowUrl(query, phrase) }),
    [input, total, query],
  );

  const exactTotal = total.startsWith('>') ? null : Number(total);
  const canLoadAll =
    exactTotal !== null && exactTotal > results.length && exactTotal <= EXPORT_LIMIT;

  const loadAll = useCallback(async () => {
    setLoadingAll(true);
    try {
      const { rows, complete } = await collect(EXPORT_LIMIT);
      results.append(0, rows, complete);
    } finally {
      setLoadingAll(false);
    }
  }, [collect, results]);

  // Which of the filter's words the dictionary carries at this tier, looked up
  // as each is typed: the list's worker answers a lookup at once, since no count
  // runs there. Until the answer is in, the filter is said to cover the rows on
  // screen, which is true.
  const typedWords = useMemo(() => filterWords(filter), [filter]);
  const [known, setKnown] = useState<{ key: string; words: string[] } | null>(null);
  const knownKey = typedWords ? `${query.tier}|${typedWords.join(' ')}` : null;
  useEffect(() => {
    if (!typedWords || !knownKey) return;
    let live = true;
    const timer = setTimeout(() => {
      void Promise.all(typedWords.map((word) => has(word, query.tier))).then((found) => {
        if (live) setKnown({ key: knownKey, words: typedWords.filter((_, i) => found[i]) });
      });
    }, 0);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [typedWords, knownKey, query.tier, has]);

  const scope = filterScope({
    filter,
    loaded: results.length,
    total,
    letters,
    mustInclude: query.mustInclude,
    mustExclude: query.mustExclude,
    known: known && known.key === knownKey ? known.words : null,
  });

  // A typed filter over a short list loads the rest, once per search, so the
  // rows on screen narrow over every result rather than the first page.
  const loadRest = loadsRest({ filter, loaded: results.length, total });
  const autoLoaded = useRef<Query | null>(null);
  useEffect(() => {
    if (!loadRest || loadingAll || autoLoaded.current === query) return;
    autoLoaded.current = query;
    void loadAll();
  }, [loadRest, loadingAll, query, loadAll]);

  // A filter of dictionary words is counted across every result, with the
  // words as Must include, however much of the list is loaded, and the line
  // leads with that count. The list stays as it is until the reader asks for
  // them: Show them, or Enter in the filter box, lists them spelled with the
  // words asked for. A count asked for an older filter or search is never
  // shown against this one.
  //
  // The count runs in a worker of its own, so paging, Go to and a row's
  // details never wait behind it, and for at most FILTER_COUNT_LIMIT_MS. The
  // worker is kept while counts finish in time, so words typed one after
  // another on a short text pay for one start. A count still running when the
  // filter, the search or a Must field changes is abandoned with its worker,
  // and the worker is closed once the filter box is empty, which a new search
  // makes it.
  const containingWords = scope.kind === 'must-include' ? scope.words : null;
  const countKey = containingWords ? containingKey(query, containingWords) : null;
  const [containCount, setContainCount] = useState<{ key: string; count: TextCount; textLeftOut: boolean } | null>(null);
  const counter = useRef<CountWorker | null>(null);
  const filtering = filter.trim().length > 0;
  useEffect(() => {
    if (filtering) return;
    counter.current?.close();
    counter.current = null;
  }, [filtering]);
  useEffect(() => {
    // Between words the filter covers the loaded rows while its words are looked up; the worker stays.
    if (!containingWords || !countKey || engine.state !== 'ready') return;
    const worker = (counter.current ??= new CountWorker({ limitMs: FILTER_COUNT_LIMIT_MS }));
    let live = true;
    void worker.count(containingQuery(query, containingWords)).then((result) => {
      if (live && result) setContainCount({ key: countKey, count: result.count, textLeftOut: result.textLeftOut });
    });
    return () => {
      live = false;
      // A count still running is abandoned with its worker; a finished one leaves the worker for the next.
      if (worker.busy) {
        worker.close();
        if (counter.current === worker) counter.current = null;
      }
    };
    // The key holds the query and the words; they change only when it does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countKey, engine.state]);
  useEffect(() => () => counter.current?.close(), []);

  // On a list that is all loaded, the rows on screen narrow as typed; the line
  // says how many beside the count when the two differ, and Show them is
  // offered only then, since otherwise the rows shown are the ones counted.
  const everyLoaded = scope.kind === 'must-include' && scope.everyLoaded;
  const shownCount = visibleRows.length;
  const containing = useMemo(() => {
    if (!containingWords) return null;
    const answer = containCount?.key === countKey ? containCount : null;
    const count: TextCount = answer?.count ?? { kind: 'counting' };
    const line = containingLine(count, total, containingWords);
    const shown = everyLoaded ? shownAsTyped(count, shownCount) : null;
    const none = count.kind === 'exact' && count.total === '0';
    const same = everyLoaded && shown === null && count.kind === 'exact';
    return {
      // The text's own words are never one of the results: said beside the count, as the count above says it.
      label: line === null ? null : [line, shown, answer?.textLeftOut ? TEXT_LEFT_OUT : null].filter(Boolean).join(' · '),
      onShow: none || same ? null : () => patch({ mustInclude: containingQuery(query, containingWords).mustInclude }),
    };
    // `containingWords` is rebuilt every render; `countKey` holds what it says.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countKey, containCount, total, query, patch, everyLoaded, shownCount]);

  const exportAs = useCallback(
    async (format: ExportFormat) => {
      setExporting(format);
      try {
        // Export the whole result set, not just what happens to be on screen —
        // but respect the filter, since a filtered list is what the user is
        // looking at and is what they mean by "these".
        const { rows } = await collect(EXPORT_LIMIT);
        const view = applyView(rows, { filter, sort });
        const blob = buildBlob(format, {
          query,
          letters,
          total,
          textLeftOut,
          rows: view,
          forms,
          generatedAt: new Date(),
        });
        download(blob, `${fileStem(query)}.${format}`);
      } finally {
        setExporting(null);
      }
    },
    [collect, filter, sort, query, letters, total, textLeftOut, forms],
  );

  return (
    <div className="min-h-dvh">
      <SiteHeader page="/" />
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

        <SearchField
          value={input}
          onChange={setInput}
          letters={letters}
          skipped={folded.skipped}
          items={items}
          leet={query.leet}
          onRead={read}
        />

        <div className="mt-10">
          <Controls
            query={query}
            counts={counts}
            termCounts={termCounts}
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

          {engine.state === 'ready' && hasQuery && queryError && <Notice>{queryNotice(queryError)}</Notice>}

          {engine.state === 'ready' && hasQuery && !queryError && (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-b border-rule-strong pb-3">
                {/* The line keeps the number's height while it waits, so the count arriving moves nothing. */}
                <p aria-live="polite" className="min-h-9 text-ink">
                  {countLine.kind === 'answered' ? (
                    <>
                      <span className="font-display text-3xl text-accent tabular-nums">
                        {formatCount(total)}
                      </span>{' '}
                      {/* What the number holds: words alone, or the classes and leet
                          readings the search admits, so a figure is never mistaken for
                          the dictionary's own. */}
                      <span className="text-sm text-ink-soft">
                        {countUnit({ total, classes: query.classes, leet: query.leet, offered: offerTotal !== null })}
                      </span>
                      {/* The text is never its own anagram. When no other word shares its
                          words' letters, that row is gone and the count is one fewer: a
                          thing left out of a complete list is said where the count is. */}
                      {textLeftOut && (
                        <>
                          {' '}
                          <span className="text-sm text-ink-faint">{TEXT_LEFT_OUT}</span>
                        </>
                      )}
                      {/* The second figure: what the classes that could use this text's
                          own digits and symbols would find, and the one press that
                          turns them on. */}
                      {offer && offerTotal !== null && (
                        <>
                          <span className="mx-2 text-sm text-rule-strong">·</span>
                          <span className="text-sm text-ink-soft">
                            {formatCount(offerTotal)} with {offerWords(offer)}
                          </span>
                          <span className="mx-2 text-sm text-rule-strong">·</span>
                          <TextButton onClick={() => takeOffer(offer)}>Show them</TextButton>
                        </>
                      )}
                      {searching && <span className="ml-2 text-xs text-ink-faint">searching…</span>}
                    </>
                  ) : (
                    // The query has no answer yet: no number is shown, since 0 would be
                    // a claim the engine has not made.
                    <span className="text-xs text-ink-faint">searching…</span>
                  )}
                </p>

                {countLine.kind === 'answered' && total !== '0' && (
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
                  <span className="font-display text-xl text-ink">{surpriseText}</span>
                  <span className="flex shrink-0 gap-3">
                    <TextButton
                      small
                      onClick={() => copy(surpriseText, surpriseText)}
                      active={copied === surpriseText}
                    >
                      {copied === surpriseText ? 'Copied' : 'Copy'}
                    </TextButton>
                    <TextButton small onClick={() => togglePin(surpriseText)}>
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

              {shownDiscoveries && <InDiscoveries sections={shownDiscoveries.sections} votes={votes} />}

              {empty ? (
                <NoResults letters={letters} tier={filters.tier} textLeftOut={textLeftOut} unused={unused} />
              ) : (
                <>
                  <ResultToolbar
                    filter={filter}
                    onFilterChange={setFilter}
                    sort={sort}
                    onSortChange={setSort}
                    shown={visibleRows.length}
                    loaded={results.length}
                    total={formatCount(total)}
                    canLoadAll={canLoadAll}
                    loadingAll={loadingAll}
                    onLoadAll={() => void loadAll()}
                    onExport={(format) => void exportAs(format)}
                    exporting={exporting}
                    containing={containing}
                    input={input}
                    reading={query.reading}
                  />
                  <ResultList
                    rows={visibleRows}
                    forms={forms}
                    terms={terms}
                    tagOf={(row) => results.tagOf(row)}
                    total={formatCount(total)}
                    hasMore={results.hasMore && filter.trim().length === 0}
                    onLoadMore={loadMore}
                    wordDetails={wordDetails}
                    wordMasks={masks}
                    pinned={pinned}
                    onTogglePin={togglePin}
                    copied={copied}
                    onCopy={copy}
                    chosen={chosen}
                    onChoose={onChoose}
                    share={shareContext}
                    discovered={shownDiscoveries}
                    votes={votes}
                    promotions={promotions}
                  />
                </>
              )}
            </>
          )}
        </section>

        <SiteFooter counts={counts} candidates={candidates} />

      </main>

      <CheckToast pass={pass} />
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
  // Enter submits, and Enter also blurs the field, which submits again. The
  // entry remembers what it sent and sends it once until the text changes.
  const entry = useRef(new JumpEntry());

  const go = () => {
    const index = entry.current.submit(value, total);
    if (index !== null) void at(index).then(onResult);
  };

  return (
    <span className="flex items-baseline gap-1.5">
      <label htmlFor="jump" className="text-ink-faint">
        Go to
      </label>
      <input
        id="jump"
        value={value}
        onChange={(event) => {
          entry.current.changed();
          setValue(event.target.value);
        }}
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
function Intro({ counts }: { counts: { extended: number } | null }) {
  const examples = [
    ['dormitory', 'dirty room'],
    ['astronomer', 'moon starer'],
    ['conversation', 'conservation'],
    ['schoolmaster', 'the classroom'],
  ];

  return (
    <div className="text-sm">
      <p className="max-w-prose leading-relaxed text-ink-soft">
        Type a word, a name, or a whole phrase. Every character gets used exactly once — spaces move
        wherever they need to, punctuation and capitals are ignored, and a digit or a symbol is a
        character of the text as itself.
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
          Checked against {counts.extended.toLocaleString()} words.
        </p>
      )}
    </div>
  );
}

/** `1, 8 or 2`: the characters no term uses, for a sentence. */
function listCharacters(unused: string): string {
  const chars = [...unused];
  if (chars.length <= 1) return chars.join('');
  return `${chars.slice(0, -1).join(', ')} or ${chars.at(-1)}`;
}

function NoResults({ letters, tier, textLeftOut, unused }: { letters: string; tier: string; textLeftOut: boolean; unused: string }) {
  return (
    <div className="py-10 text-sm">
      <p className="text-ink">
        {/* The text's own words do spell it; they are the one thing never listed. */}
        {textLeftOut ? 'Nothing else spells' : 'Nothing spells'}{' '}
        <span className="font-display text-lg">{letters}</span> in the {tier} dictionary.
      </p>
      <ul className="mt-4 space-y-1.5 text-ink-soft">
        {/* A digit or a symbol is a character of the text (the literal rule), and no word has one:
            the count is zero for that, and the sentence says so before any other advice. */}
        {unused.length > 0 && (
          <li>
            No word has a {listCharacters(unused)}, and an anagram uses every character of the text.
          </li>
        )}
        <li>
          Try a larger dictionary — Extended carries every word in the list, plus the site’s own
          additions.
        </li>
        <li>Lower the minimum word length, or raise the maximum number of words.</li>
        {/* Not said of letters the text's own words do spell, nor of a text whose digits nothing uses. */}
        {!textLeftOut && unused.length === 0 && (
          <li>
            Some letter sets genuinely have no partition. A lone <i>q</i> with no <i>u</i> is a
            common culprit.
          </li>
        )}
      </ul>
    </div>
  );
}
