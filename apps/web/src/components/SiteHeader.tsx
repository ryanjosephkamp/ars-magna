/**
 * The row above every page: where you are, and where else you can go.
 *
 * Deliberately not sticky. A session here is minutes of scrolling through
 * results, and a bar that follows the reader down ten thousand rows spends the
 * one thing the page is for — vertical space — on chrome they have already
 * read.
 *
 * The search page passes `page="/"`, and its wordmark is left out: the h1
 * directly beneath the row already says Ars Magna, and saying it twice in
 * fifty pixels reads as a mistake.
 */

/** The three pages of the site, by the address each is served at. */
export type Page = '/' | '/hits' | '/how';

/** Until phase E puts submission in the site, it is a GitHub issue form. */
const SUBMIT = 'https://github.com/ryanjosephkamp/ars-magna/issues/new?template=submit-anagram.yml';

const LINKS: readonly { href: string; label: string; external?: boolean }[] = [
  { href: '/', label: 'Search' },
  { href: '/hits', label: 'Discoveries' },
  { href: '/how', label: 'How it works' },
  { href: SUBMIT, label: 'Submit', external: true },
];

export function SiteHeader({ page }: { page: Page }) {
  const wordmark = page !== '/';

  return (
    <header className="border-b border-rule">
      <div
        className={`mx-auto flex max-w-3xl flex-col gap-2 px-6 py-4 sm:flex-row sm:items-baseline ${
          wordmark ? 'sm:justify-between' : 'sm:justify-end'
        }`}
      >
        {wordmark && (
          <a
            href="/"
            className="font-display text-lg tracking-tight text-ink transition-colors duration-150
                       hover:text-accent"
          >
            Ars Magna
          </a>
        )}

        <nav aria-label="Pages">
          {/* The negative margin pulls the first link back to the text edge, so
              the row lines up with the page beneath it despite the padding that
              gives each link a tap target. */}
          <ul className="-mx-2 flex flex-wrap items-baseline">
            {LINKS.map((link) => {
              const current = link.href === page;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={current ? 'page' : undefined}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className={`block px-2 py-1 text-sm transition-colors duration-150 ${
                      current ? 'text-accent' : 'text-ink-soft hover:text-accent'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
