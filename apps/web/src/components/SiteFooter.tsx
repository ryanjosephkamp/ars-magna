import type { ReactNode } from 'react';
import type { DictCounts } from '@ars-magna/engine';

type Link = {
  readonly label: string;
  readonly href: string;
  readonly note: string;
};

const DICTIONARY_LINKS: Link[] = [
  {
    label: 'English OpenList',
    href: 'https://english-openlist.pages.dev/',
    note: 'the list',
  },
  {
    label: 'Hugging Face',
    href: 'https://huggingface.co/datasets/ryanjosephkamp/english-openlist',
    note: 'the dataset',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/ryanjosephkamp/english-openlist',
    note: 'how it is built',
  },
  {
    label: 'Vocabulary',
    href: 'https://huggingface.co/datasets/ryanjosephkamp/ars-magna-vocabulary',
    note: "this site's own words",
  },
];

const HITS_LINKS: Link[] = [
  { label: 'Discover', href: '/hits', note: 'the ones worth keeping' },
  { label: 'How it works', href: '/how', note: 'sections, votes and promotions' },
  {
    label: 'Dataset',
    href: 'https://huggingface.co/datasets/ryanjosephkamp/ars-magna-greatest-hits',
    note: 'on Hugging Face',
  },
  { label: 'Build', href: '/build', note: 'found a good one?' },
];

type Profile = {
  readonly title: string;
  readonly label: string;
  readonly href: string;
  readonly icon: ReactNode;
};

/**
 * The credit row's icon links. The icons are inline, so the footer sends no
 * request to the services it links to.
 */
const PROFILES: Profile[] = [
  {
    title: 'Website',
    label: 'Ryan Kamp’s website',
    href: 'https://ryanjosephkamp.github.io/',
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.2" />
        <path d="M2.8 12h18.4M12 2.8c2.6 2.6 3.9 5.7 3.9 9.2s-1.3 6.6-3.9 9.2c-2.6-2.6-3.9-5.7-3.9-9.2S9.4 5.4 12 2.8Z" />
      </g>
    ),
  },
  {
    title: 'GitHub',
    label: 'Ryan Kamp on GitHub',
    href: 'https://github.com/ryanjosephkamp/',
    icon: (
      <path
        fill="currentColor"
        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
      />
    ),
  },
  {
    title: 'LinkedIn',
    label: 'Ryan Kamp on LinkedIn',
    href: 'https://www.linkedin.com/in/rjk1999',
    icon: (
      <path
        fill="currentColor"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    ),
  },
  {
    title: 'X',
    label: 'Ryan Kamp on X',
    href: 'https://x.com/ryanjosephkamp',
    icon: (
      <path
        fill="currentColor"
        d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
      />
    ),
  },
  {
    title: 'YouTube',
    label: 'Ryan Kamp on YouTube',
    href: 'https://m.youtube.com/@RyanJosephKamp',
    icon: (
      <path
        fill="currentColor"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      />
    ),
  },
];

/**
 * Footer links get the same treatment as the tier control — hairline borders,
 * a wash on hover — so they read as part of the same object rather than as a
 * strip of chrome bolted underneath it.
 */
function LinkButton({ link }: { link: Link }) {
  const external = /^https?:/.test(link.href);
  return (
    <a
      href={link.href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="group flex items-baseline gap-2 rounded-[3px] border border-rule bg-surface px-3
                 py-1.5 text-sm text-ink-soft transition-colors duration-150 hover:border-accent
                 hover:bg-accent-wash hover:text-accent"
    >
      <span className="font-medium">{link.label}</span>
      <span className="font-mono text-[10px] text-ink-faint transition-colors duration-150 group-hover:text-accent">
        {link.note}
      </span>
    </a>
  );
}

/**
 * The row every one of Ryan's project sites ends with: his name, five icon
 * links and Sponsor. On this achromatic page the accent carries the underline
 * and the heart, and the targets stay 40px. On a phone it wraps: the name, the
 * icons, then the button.
 */
function CreditRow() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <p className="font-semibold text-ink">
        Made by{' '}
        <a
          href="https://ryanjosephkamp.github.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-accent decoration-2 underline-offset-[0.25em]
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Ryan Kamp
        </a>
      </p>
      <ul className="flex flex-wrap gap-1" aria-label="Ryan Kamp online">
        {PROFILES.map((profile) => (
          <li key={profile.href}>
            <a
              href={profile.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={profile.label}
              title={profile.title}
              className="grid size-10 place-items-center rounded-[10px] text-ink-soft transition-colors
                         duration-150 hover:bg-sunken hover:text-ink focus-visible:outline-2
                         focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-[19px]">
                {profile.icon}
              </svg>
            </a>
          </li>
        ))}
      </ul>
      <a
        href="https://github.com/sponsors/ryanjosephkamp"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-rule-strong px-3.5
                   text-[0.9rem] font-semibold text-ink transition-colors duration-150 hover:border-ink-faint
                   hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2
                   focus-visible:outline-accent motion-reduce:transition-none min-[721px]:ml-auto"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" className="size-[17px] text-accent">
          <path
            d="M10 16.8S3 12.6 3 7.6A3.6 3.6 0 0 1 10 6a3.6 3.6 0 0 1 7 1.6c0 5-7 9.2-7 9.2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
        Sponsor on GitHub
      </a>
    </div>
  );
}

/** An inline link in the colophon, to a source or its license. */
function Credit({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-rule-strong underline-offset-4 transition-colors duration-150 hover:text-accent hover:decoration-accent"
    >
      {children}
    </a>
  );
}

function Group({ title, links }: { title: string; links: readonly Link[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase">
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <LinkButton key={link.href} link={link} />
        ))}
      </div>
    </div>
  );
}

export function SiteFooter({
  counts = null,
  candidates = 0,
}: {
  /** Absent on the pages that never load the dictionary, and then the colophon's counts line is left out. */
  counts?: DictCounts | null;
  /** Words that could appear in the current query — the real difficulty signal. */
  candidates?: number;
}) {
  return (
    <footer className="mt-20 border-t border-rule-strong pt-8 print:hidden">
      <div className="flex flex-col gap-7">
        <Group title="Discover" links={HITS_LINKS} />
        <Group title="The words" links={DICTIONARY_LINKS} />
      </div>

      <div className="mt-8 border-t border-rule pt-6">
        <CreditRow />
      </div>

      <div className="mt-6 text-sm text-ink-faint">
        <p>
          Word validity comes from the English OpenList at a pinned revision, plus a short list of
          the site’s own additions and its listed contractions. Definitions come from WordNet 3.1,
          word frequencies from <Credit href="https://github.com/hermitdave/FrequencyWords">FrequencyWords</Credit>{' '}
          (OpenSubtitles 2018,{' '}
          <Credit href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</Credit>), and
          some place names from <Credit href="https://www.geonames.org/">GeoNames</Credit>{' '}
          (<Credit href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</Credit>).{' '}
          <Credit href="https://github.com/ryanjosephkamp/ars-magna/blob/main/THIRD-PARTY-NOTICES.md">
            Sources and their terms
          </Credit>
          .
        </p>
        {counts && (
          <p className="mt-2 font-mono text-[11px]">
            {counts.full.toLocaleString()} words · {counts.signatures.toLocaleString()} anagram
            classes
            {candidates > 0 && <> · {candidates.toLocaleString()} usable here</>}
          </p>
        )}
      </div>
    </footer>
  );
}
