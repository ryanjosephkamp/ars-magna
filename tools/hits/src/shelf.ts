/**
 * Shelves: where a hit sits in the collection, decided by how its best
 * judgement relates the anagram to its input. Pure, and shared by ingest,
 * publish and the tools that come after them, so the rule lives in one place.
 *
 *   relation 5                       Interesting, flagged for Greatest Hits
 *   relation 4                       Interesting
 *   relation 3, reads 2 or 3         A stretch
 *   relation 3 reads 1, relation 2   near miss: not added; kept in the queue's verdicts
 *   relation 1                       nothing
 *
 * Greatest Hits is `featured`, which only the operator sets. Rubric v1 lines
 * map onto the same scale: relation is aptness, and reads is 3 for grammar
 * 4–5, 2 for grammar 2–3, 1 for grammar 1.
 */
import type { Hit, Judgement } from './schema.ts';

/** At most this many hits per input sit on a shelf; further qualifying rows are alternates. */
export const SHELF_CAP = 3;

export type Scores = { relation: number; reads: number };
export type Assessment = 'interesting' | 'stretch' | 'near' | 'none';
export type Shelf = 'greatest' | 'interesting' | 'stretch';

export function scoresOf(judgement: Judgement): Scores {
  if ('relation' in judgement) return { relation: judgement.relation, reads: judgement.reads };
  const g = judgement.grammar;
  return { relation: judgement.aptness, reads: g >= 4 ? 3 : g >= 2 ? 2 : 1 };
}

/** The judgement that decides a row: highest relation, then reads; the earlier one on a tie. */
export function bestJudgement(judge: readonly Judgement[]): Judgement | undefined {
  let best: Judgement | undefined;
  let top: Scores | undefined;
  for (const judgement of judge) {
    const s = scoresOf(judgement);
    if (!top || s.relation > top.relation || (s.relation === top.relation && s.reads > top.reads)) {
      best = judgement;
      top = s;
    }
  }
  return best;
}

export function assess({ relation, reads }: Scores): Assessment {
  if (relation >= 4) return 'interesting';
  if (relation === 3) return reads >= 2 ? 'stretch' : 'near';
  if (relation === 2) return 'near';
  return 'none';
}

/**
 * The shelf a published hit shows on. Featured is Greatest Hits. A hit with no
 * judge (a classic, a submission) is Interesting. An accepted hit the judge
 * scored below the shelves was the operator's call, and shows as A stretch.
 */
export function shelfOf(hit: Pick<Hit, 'status' | 'judge'>): Shelf {
  if (hit.status === 'featured') return 'greatest';
  const best = bestJudgement(hit.judge);
  if (!best) return 'interesting';
  return scoresOf(best).relation >= 4 ? 'interesting' : 'stretch';
}

export type Shelved<T> = { accepted: T[]; alternates: T[]; near: T[]; none: T[] };

/**
 * Place one input's rows. The best qualifying rows fill the free slots, which
 * are the cap minus the hits this input already has on a shelf (`taken`); the
 * other qualifying rows become alternates. Each group is ordered by relation,
 * then reads, then key, so the result does not depend on input order.
 */
export function shelve<T>(
  rows: readonly T[],
  scores: (row: T) => Scores,
  key: (row: T) => string,
  taken = 0,
): Shelved<T> {
  const order = (a: T, b: T) => {
    const x = scores(a);
    const y = scores(b);
    return y.relation - x.relation || y.reads - x.reads || key(a).localeCompare(key(b));
  };
  const by = (wanted: Assessment[]) => rows.filter((r) => wanted.includes(assess(scores(r)))).sort(order);
  const qualifying = by(['interesting', 'stretch']);
  const slots = Math.max(0, SHELF_CAP - taken);
  return {
    accepted: qualifying.slice(0, slots),
    alternates: qualifying.slice(slots),
    near: by(['near']),
    none: by(['none']),
  };
}
