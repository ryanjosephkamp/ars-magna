/**
 * Shelves: where a hit sits in the collection, decided by how its best
 * judgement relates the anagram to its input. Pure, and shared by ingest,
 * publish and the tools that come after them, so the rule lives in one place.
 *
 *   relation 5, reads 2 or 3         Interesting, flagged for Greatest Hits
 *   relation 4, reads 2 or 3         Interesting
 *   relation 3, reads 2 or 3         A stretch
 *   any relation 3 to 5 that reads 1,
 *   and relation 2                   near miss: not added; kept in the queue's verdicts
 *   relation 1                       nothing
 *
 * A phrase that reads as word salad is a near miss however apt one of its
 * words is (D40, 2026-09-18). Hits published before that rule keep their
 * shelves: `judgedShelf` reads relation alone.
 *
 * Greatest Hits is `featured`, which only the operator sets. Rubric v1 lines
 * map onto the same scale: relation is aptness, and reads is 3 for grammar
 * 4–5, 2 for grammar 2–3, 1 for grammar 1.
 */
import type { Hit, Judgement } from './schema.ts';

/** At most this many hits per input sit on a shelf; further qualifying rows are alternates. */
export const SHELF_CAP = 3;

/**
 * At most this many alternates per input, counting the ones it already has;
 * further qualifying rows stay near misses in the queue's verdicts (F0).
 */
export const ALTERNATE_CAP = 5;

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
  if (relation >= 3 && reads < 2) return 'near';
  if (relation >= 4) return 'interesting';
  if (relation === 3) return 'stretch';
  if (relation === 2) return 'near';
  return 'none';
}

/** The operator's placement of an accepted hit, as a tag; the shelf follows it over the judge's scores. */
export const SHELF_TAG = { interesting: 'shelf:interesting', stretch: 'shelf:stretch' } as const;

/**
 * Where the judge's scores alone put an accepted hit. A hit with no judge (a
 * classic, a submission) is Interesting. An accepted hit the judge scored below
 * the shelves was the operator's call, and shows as A stretch.
 */
export function judgedShelf(hit: Pick<Hit, 'judge'>): 'interesting' | 'stretch' {
  const best = bestJudgement(hit.judge);
  if (!best) return 'interesting';
  return scoresOf(best).relation >= 4 ? 'interesting' : 'stretch';
}

/**
 * The shelf a published hit shows on. Featured is Greatest Hits. Otherwise a
 * `shelf:` tag, set when the operator moved the hit, decides; without one, the
 * judge's scores do.
 */
export function shelfOf(hit: Pick<Hit, 'status' | 'judge'> & { tags?: readonly string[] }): Shelf {
  if (hit.status === 'featured') return 'greatest';
  if (hit.tags?.includes(SHELF_TAG.stretch)) return 'stretch';
  if (hit.tags?.includes(SHELF_TAG.interesting)) return 'interesting';
  return judgedShelf(hit);
}

export type Shelved<T> = { accepted: T[]; alternates: T[]; near: T[]; none: T[] };

/**
 * Place one input's rows. The best qualifying rows fill the free slots, which
 * are the cap minus the hits this input already has on a shelf (`taken`); the
 * next best become alternates, up to `ALTERNATE_CAP` minus the alternates it
 * already has (`alternatesTaken`), and the rest join the near misses. Each
 * group is ordered by relation, then reads, then key, so the result does not
 * depend on input order.
 */
export function shelve<T>(
  rows: readonly T[],
  scores: (row: T) => Scores,
  key: (row: T) => string,
  taken = 0,
  alternatesTaken = 0,
): Shelved<T> {
  const order = (a: T, b: T) => {
    const x = scores(a);
    const y = scores(b);
    return y.relation - x.relation || y.reads - x.reads || key(a).localeCompare(key(b));
  };
  const by = (wanted: Assessment[]) => rows.filter((r) => wanted.includes(assess(scores(r)))).sort(order);
  const qualifying = by(['interesting', 'stretch']);
  const slots = Math.max(0, SHELF_CAP - taken);
  const alternates = slots + Math.max(0, ALTERNATE_CAP - alternatesTaken);
  return {
    accepted: qualifying.slice(0, slots),
    alternates: qualifying.slice(slots, alternates),
    near: [...qualifying.slice(alternates), ...by(['near'])].sort(order),
    none: by(['none']),
  };
}
