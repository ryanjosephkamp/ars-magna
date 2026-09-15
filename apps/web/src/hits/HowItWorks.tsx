import { SECTIONS, type Shelf } from './build.ts';
import { LIMITS } from '../votes/core.ts';

/** What each section's meaning adds to on this page. */
const SECTION_MORE: Record<Shelf, string> = {
  greatest: 'The site’s editor chooses every one by name. Votes never put an anagram here.',
  interesting: 'A model judges how closely each anagram relates to its original and how it reads; these have the clearest links, and each was kept by hand.',
  stretch: 'Judged the same way, with a link that holds only loosely.',
};

const link =
  'text-ink-soft underline decoration-rule-strong underline-offset-4 transition-colors duration-150 hover:text-accent hover:decoration-accent';

/** The rules of Discoveries, written for readers: the sections, what a vote does, and what is stored. */
export function HowItWorks() {
  return (
    <div className="min-h-dvh">
      <main className="mx-auto max-w-3xl px-6 pt-16 pb-24 sm:pt-24">
        <header className="mb-12">
          <p className="mb-3 font-mono text-[11px] tracking-[0.08em] text-ink-faint uppercase">
            <a href="/" className="transition-colors duration-150 hover:text-accent">
              Ars Magna
            </a>
            <span className="mx-2 text-rule-strong">/</span>
            <a href="/hits" className="transition-colors duration-150 hover:text-accent">
              Discoveries
            </a>
          </p>
          <h1 className="font-display text-5xl tracking-[-0.02em] text-ink sm:text-6xl">How Discoveries works</h1>
          <p className="mt-2 max-w-prose text-sm text-ink-soft">
            Discoveries lists anagrams that say something about the name, company, product, title, place or phrase their letters came from.
          </p>
        </header>

        <section aria-labelledby="sections-title" className="border-t border-rule-strong pt-8">
          <h2 id="sections-title" className="font-display text-3xl tracking-[-0.01em] text-ink">
            Three sections
          </h2>
          <dl className="mt-4 divide-y divide-rule border-y border-rule">
            {SECTIONS.map((s) => (
              <div key={s.shelf} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <dt className="font-display text-xl text-ink">{s.label}</dt>
                <dd className="max-w-prose text-sm text-ink-soft">
                  {s.note} {SECTION_MORE[s.shelf]}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="votes-title" className="mt-14">
          <h2 id="votes-title" className="font-display text-3xl tracking-[-0.01em] text-ink">
            Votes
          </h2>
          <div className="mt-4 flex max-w-prose flex-col gap-3 text-sm text-ink-soft">
            <p>
              Press Vote on an anagram you like. A browser has one vote for each anagram, and pressing Vote again takes it back. There are no
              votes against.
            </p>
            <p>
              Most votes, the usual order, lists the most voted first in each section; a tie goes A to Z. Newest and A to Z are there too.
            </p>
            <p>Votes put anagrams forward for a second look. They never move an anagram from one section to another by themselves.</p>
          </div>
        </section>

        <section aria-labelledby="check-title" className="mt-14">
          <h2 id="check-title" className="font-display text-3xl tracking-[-0.01em] text-ink">
            The check before voting
          </h2>
          <p className="mt-4 max-w-prose text-sm text-ink-soft">
            Before the first vote of a visit, Cloudflare Turnstile checks that the browser is not an automated one. Most of the time it asks
            nothing; now and then it asks for a click. A connection can vote {LIMITS.vote} times an hour.
          </p>
        </section>

        <section aria-labelledby="stored-title" className="mt-14">
          <h2 id="stored-title" className="font-display text-3xl tracking-[-0.01em] text-ink">
            What is stored
          </h2>
          <ul className="mt-4 flex max-w-prose list-disc flex-col gap-2 pl-5 text-sm text-ink-soft marker:text-rule-strong">
            <li>A random id your browser makes and keeps, sent with each vote.</li>
            <li>Which anagrams that id voted for, and when.</li>
            <li>
              To stop floods of votes, a code made from your connection’s address, a secret and the day. It changes every day and cannot be
              turned back into the address, which is never stored.
            </li>
            <li>No cookies and no accounts. Clearing this site’s data gives your browser a new id; the votes it cast stay counted.</li>
          </ul>
        </section>

        <footer className="mt-20 border-t border-rule-strong pt-8 text-sm text-ink-faint">
          <p>
            <a href="/hits" className={link}>
              Back to Discoveries
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
