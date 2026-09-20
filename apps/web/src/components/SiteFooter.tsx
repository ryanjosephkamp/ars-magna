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

const AUTHOR_LINKS: Link[] = [
  { label: 'Website', href: 'https://ryanjosephkamp.github.io', note: 'ryanjosephkamp.github.io' },
  { label: 'GitHub', href: 'https://github.com/ryanjosephkamp/', note: 'other projects' },
  { label: 'Sponsor', href: 'https://github.com/sponsors/ryanjosephkamp', note: 'support the work' },
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
        <Group title="Ryan Kamp" links={AUTHOR_LINKS} />
      </div>

      <div className="mt-8 border-t border-rule pt-5 text-sm text-ink-faint">
        <p>
          Built by{' '}
          <a
            href="https://ryanjosephkamp.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-soft underline decoration-rule-strong underline-offset-4
                       transition-colors duration-150 hover:text-accent hover:decoration-accent"
          >
            Ryan Kamp
          </a>
          . Word validity comes from English OpenList at a pinned revision, plus a short list of the
          site’s own additions and its listed contractions; definitions come from WordNet 3.1.
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
