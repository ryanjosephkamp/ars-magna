import { SECTIONS, type Shelf } from './build.ts';
import { LIMITS } from '../votes/core.ts';
import { SiteFooter } from '../components/SiteFooter.tsx';
import { SiteHeader } from '../components/SiteHeader.tsx';

/** What each section's meaning adds to on this page. */
const SECTION_MORE: Record<Shelf, string> = {
  greatest: 'The site’s editor chooses every one by name. Votes never put an anagram here.',
  interesting: 'A model judges how closely each anagram relates to its original and how it reads; these have the clearest links, and each was kept by hand.',
  stretch: 'Judged the same way, with a link that holds only loosely.',
};

/** The rules of Discover, written for readers: the sections, what a vote does, and what is stored. */
export function HowItWorks() {
  return (
    <div className="min-h-dvh">
      <SiteHeader page="/how" />
      <main className="mx-auto max-w-3xl px-6 pt-16 pb-24 sm:pt-24">
        <header className="mb-12">
          <h1 className="font-display text-5xl tracking-[-0.02em] text-ink sm:text-6xl">How Discover works</h1>
          <p className="mt-2 max-w-prose text-sm text-ink-soft">
            Discover lists anagrams that say something about the name, company, product, title, place or phrase their letters came from.
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
              A search lists the anagrams of its letters that are on Discover above the complete list. In the list, a row with the same
              words, or other spellings of them, carries Vote instead of Promote.
            </p>
            <p>
              Most votes, the usual order, lists the most voted first in each section; a tie goes A to Z. Newest and A to Z are there too.
            </p>
            <p>Votes put anagrams forward for a second look. They never move an anagram from one section to another by themselves.</p>
          </div>
        </section>

        <section aria-labelledby="promote-title" className="mt-14">
          <h2 id="promote-title" className="font-display text-3xl tracking-[-0.01em] text-ink">
            Promote
          </h2>
          <div className="mt-4 flex max-w-prose flex-col gap-3 text-sm text-ink-soft">
            <p>
              Every other anagram in a search has a Promote button. Press it to put that anagram forward for Discover. A browser has one
              promotion for each anagram, and pressing Promote again takes it back. There are no promotions against.
            </p>
            <p>
              A model reads promoted anagrams, the most promoted first, and places each in Interesting or A stretch, or leaves it out when
              the link does not hold; one it leaves out is read again once its promotions have doubled. The site’s editor approves every
              placement before it appears, and once an anagram is on Discover each promotion of it counts as a vote. Promotions never put
              an anagram in Greatest Hits: the site’s editor picks those by hand.
            </p>
          </div>
        </section>

        <section aria-labelledby="build-title" className="mt-14">
          <h2 id="build-title" className="font-display text-3xl tracking-[-0.01em] text-ink">
            Build
          </h2>
          <div className="mt-4 flex max-w-prose flex-col gap-3 text-sm text-ink-soft">
            <p>
              <a href="/build" className="underline decoration-rule-strong underline-offset-4 transition-colors duration-150 hover:text-accent hover:decoration-accent">
                Build
              </a>{' '}
              is where you make an anagram by hand. Type a text and an anagram of it: the page shows which letters are left, checks that the
              letters match and that every word is in the dictionary you choose, and lets you send the anagram to Discover.
            </p>
            <p>
              A submission counts as your promotion of that anagram and goes to the same review. It keeps the text, the words, the dictionary,
              the category you chose and, when you give them, what the input is, why it is good and how to credit you.
            </p>
            <p>
              The address carries both boxes, so a check can be shared as a link, and the page can be printed or its figures exported. Every
              search result and every anagram here opens in Build with its own words in place.
            </p>
          </div>
        </section>

        <section aria-labelledby="check-title" className="mt-14">
          <h2 id="check-title" className="font-display text-3xl tracking-[-0.01em] text-ink">
            The check before voting
          </h2>
          <p className="mt-4 max-w-prose text-sm text-ink-soft">
            Before the first vote, promotion or submission of a visit, Cloudflare Turnstile checks that the browser is not an automated one.
            Most of the time it asks nothing; now and then it asks for a click. A connection can vote {LIMITS.vote} times an hour and promote{' '}
            {LIMITS.promote} times an hour. A submission counts as a promotion.
          </p>
        </section>

        <section aria-labelledby="stored-title" className="mt-14">
          <h2 id="stored-title" className="font-display text-3xl tracking-[-0.01em] text-ink">
            What is stored
          </h2>
          <ul className="mt-4 flex max-w-prose list-disc flex-col gap-2 pl-5 text-sm text-ink-soft marker:text-rule-strong">
            <li>A random id your browser makes and keeps, sent with each vote and promotion.</li>
            <li>
              Which anagrams that id voted for or promoted, and when. A promotion also keeps the text searched, the words in the order shown,
              and the dictionary used. A submission also keeps its category and, when you give them, what the input is, why it is good and a
              credit. Each day the number of votes and promotions each anagram has is published, a promoted anagram under a code rather
              than its words. What you typed is read by the review and published only with an anagram the site’s editor has approved for
              Discover: the text, and a submission’s credit and what the input is when the review keeps them. Why it is good is never
              published, and nor is the id.
            </li>
            <li>
              To stop floods of votes, a code made from your connection’s address, a secret and the day. It changes every day and cannot be
              turned back into the address, which is never stored.
            </li>
            <li>
              No cookies and no accounts. Clearing this site’s data gives your browser a new id; the votes and promotions it made stay counted.
            </li>
          </ul>
        </section>

        <section aria-labelledby="words-title" className="mt-14">
          <h2 id="words-title" className="font-display text-3xl tracking-[-0.01em] text-ink">
            The words
          </h2>
          <p className="mt-4 max-w-prose text-sm text-ink-soft">
            Every anagram here is built from English OpenList at a pinned revision, plus a short,
            public list of words this site has added, each with its meaning and where it came from.
            The vocabulary is always something you can look up rather than guess at.
          </p>
          <p className="mt-3 max-w-prose text-sm text-ink-soft">
            Apostrophes, hyphens and other punctuation carry no letters: they are dropped from the text, never required in an anagram,
            and appear only inside a listed form. A form is a spelling with an apostrophe or hyphen whose letters are one word:{' '}
            <i>it's</i> is the letters <i>its</i>, and <i>don't</i> is the letters <i>dont</i>. The site lists its forms with a meaning
            and a source, and they are searchable in every dictionary. A row shows <i>don't</i> with its apostrophe, since nothing else
            spells those letters; a row spells <i>its</i> as the word, and the word panel lists <i>it's</i> beside it. Possessives are
            never listed: <i>dog's</i> is the letters of <i>dogs</i>, which the search already finds.
          </p>
          <p className="mt-3 max-w-prose text-sm text-ink-soft">
            A number or a symbol in the text is read as letters first, and the line under the field says how, with a control to read
            it another way. On its own a number is spelled as a whole: <i>Blink-182</i> has the letters of <i>blink one hundred eighty
            two</i>, and <i>9th</i> is <i>ninth</i>. It can instead be read digit by digit, as a year when it has four digits
            (<i>nineteen oh seven</i>), as its keyboard letters where every digit has one (<i>1337</i> is <i>ieet</i>), or, for a single
            digit, as a homophone: <i>2</i> as <i>to</i> or <i>too</i>, <i>4</i> as <i>for</i>, <i>8</i> as <i>ate</i>, <i>1</i> as{' '}
            <i>won</i>, <i>0</i> as <i>oh</i>. Inside a word, with a letter on both sides, a digit stands for its keyboard letter
            (<i>Bl1nk</i> is <i>blink</i>), and so do <i>$</i> and <i>!</i> (<i>Ke$ha</i>, <i>P!nk</i>); elsewhere those two are
            punctuation. <i>@</i> stands for <i>a</i>, or is spelled <i>at</i>; <i>&amp;</i> is <i>and</i> and <i>+</i> is <i>plus</i>. A
            number of more than four digits is left out unless read digit by digit, and any of them can be left out. A shared link carries
            the reading, and so does a hit on Discover: one read before the readings existed was read with its digits dropped, and says so.
          </p>
          <p className="mt-3 max-w-prose text-sm text-ink-soft">
            On the search page, Must exclude takes a word out of the dictionary for that search alone and leaves its other spellings, so
            every count is still exact.
          </p>
          <p className="mt-3 max-w-prose text-sm text-ink-soft">
            The text itself, its words in any order, is never listed as its own anagram. Where another word shares a word’s letters,
            the row is shown with that word instead, so <i>below</i> appears as <i>elbow</i>. Where none does, the row is left out, the
            count is one fewer, and the page says so. The same letters spaced differently are an anagram: <i>applesauce</i> for{' '}
            <i>apple sauce</i>.
          </p>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
