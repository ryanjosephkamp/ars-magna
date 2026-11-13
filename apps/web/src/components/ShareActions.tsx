import { cardText, googleSearchUrl, postText, xPostUrl, type Shareable } from '../lib/share.ts';

type Props = {
  item: Shareable;
  /** Distinguishes this row's copy keys from every other row's. */
  id: string;
  copied: string | null;
  onCopy(key: string, text: string): void;
};

/**
 * The ways to send one anagram somewhere else.
 *
 * A line of text actions rather than a floating menu: it appears in the row
 * itself when Share is opened, so nothing overlaps a neighbouring row in the
 * virtualized list and nothing needs an outside-click handler. The native
 * share sheet is offered only where the browser has one; the others are plain
 * links and clipboard writes.
 */
export function ShareActions({ item, id, copied, onCopy }: Props) {
  const post = postText(item);
  const card = cardText(item);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const share = () => {
    void navigator.share({ title: 'Ars Magna', text: post, url: item.url }).catch(() => {
      // The reader closed the sheet, or the browser refused. Nothing to say.
    });
  };

  const linkClass =
    'underline decoration-rule-strong underline-offset-4 transition-colors duration-150 hover:text-accent hover:decoration-accent';
  const stateClass = (key: string) => (copied === key ? 'text-accent decoration-accent' : 'text-ink-soft');

  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px]" aria-label="Share">
      <li>
        <a href={xPostUrl(post)} target="_blank" rel="noopener noreferrer" className={`${linkClass} text-ink-soft`}>
          Post on X
        </a>
      </li>
      <li>
        <a
          href={googleSearchUrl(item.phrase)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkClass} text-ink-soft`}
        >
          Search Google
        </a>
      </li>
      <li>
        <button type="button" onClick={() => onCopy(`${id}:link`, item.url)} className={`${linkClass} ${stateClass(`${id}:link`)}`}>
          {copied === `${id}:link` ? 'Link copied' : 'Copy link'}
        </button>
      </li>
      <li>
        <button type="button" onClick={() => onCopy(`${id}:card`, card)} className={`${linkClass} ${stateClass(`${id}:card`)}`}>
          {copied === `${id}:card` ? 'Card copied' : 'Copy card'}
        </button>
      </li>
      {canShare && (
        <li>
          <button type="button" onClick={share} className={`${linkClass} text-ink-soft`}>
            Share…
          </button>
        </li>
      )}
    </ul>
  );
}
