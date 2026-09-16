import type { Votes } from '../hits/useVotes.ts';
import type { DiscoverySection } from '../lib/inDiscoveries.ts';
import { VoteButton } from './CountButton.tsx';

/**
 * The anagrams of these letters that are on Discoveries, above the complete
 * list: Greatest Hits, then Interesting, then A stretch, each most voted first.
 * Absent when there are none, so a search without any shows nothing extra.
 */
export function InDiscoveries({ sections, votes }: { sections: readonly DiscoverySection[]; votes: Votes }) {
  if (sections.length === 0) return null;
  return (
    <section aria-labelledby="in-discoveries-title" className="settle border-b border-rule py-4">
      <h2 id="in-discoveries-title" className="text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase">
        In Discoveries
      </h2>
      <ol className="mt-1 divide-y divide-rule">
        {sections.flatMap((section) =>
          section.hits.map((hit) => (
            <li key={hit.id} className="py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <p className="font-display text-xl leading-snug text-ink">
                  <span className="text-ink-faint">{hit.input}</span>
                  <span className="mx-2 text-rule-strong">→</span>
                  <a href={`/hits#${hit.slug}`} className="transition-colors duration-150 hover:text-accent">
                    {hit.display}
                  </a>
                </p>
                <span className="flex shrink-0 items-center gap-3 font-mono text-[11px]">
                  <span className="text-ink-faint">{section.label}</span>
                  <VoteButton hit={hit} votes={votes} reserve />
                </span>
              </div>
              {hit.justification && <p className="mt-1 max-w-prose text-sm text-ink-soft">{hit.justification}</p>}
            </li>
          )),
        )}
      </ol>
    </section>
  );
}
