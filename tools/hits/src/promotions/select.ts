/**
 * Which promoted anagrams the next review reads (voting plan R7): every one not
 * yet decided, most promoted first, up to `REVIEW_LIMIT`. Pure.
 *
 * Left out: an anagram already published or already a hit in any status, a
 * blocked one, and one whose check failed for any reason but a word in no
 * tier on a reader's submission (a search's words come from the dictionary,
 * so an unknown word there means the request was not made by the page).
 *
 * An anagram decided before comes back when its promotions have reached
 * `REREVIEW_FACTOR` times its count at the decision; one decided
 * `words-missing` comes back once its check passes, and not before.
 */
import { REREVIEW_FACTOR, REVIEW_LIMIT, type ExportLine, type ReviewLine } from './files.ts';

export type Selection = { chosen: ExportLine[]; skipped: { hit: number; blocked: number; refused: number; decided: number; over: number } };

export function selectForReview(
  lines: readonly ExportLine[],
  context: {
    /** Keys of every hit in data/hits.jsonl, whatever its status. */
    hitKeys: ReadonlySet<string>;
    /** Every review line merged so far, oldest first. */
    reviewed: readonly ReviewLine[];
    limit?: number;
  },
): Selection {
  const latest = new Map<string, ReviewLine>();
  for (const line of context.reviewed) latest.set(line.key_sha256, line);
  const skipped = { hit: 0, blocked: 0, refused: 0, decided: 0, over: 0 };
  const eligible: ExportLine[] = [];
  for (const line of lines) {
    if (context.hitKeys.has(line.key)) {
      skipped.hit++;
      continue;
    }
    if (line.blocked) {
      skipped.blocked++;
      continue;
    }
    const wordsMissing = !line.check.ok && line.check.reason === 'unknown-word' && line.submissions.length > 0;
    if (!line.check.ok && !wordsMissing) {
      skipped.refused++;
      continue;
    }
    const before = latest.get(line.key_sha256);
    if (before) {
      const again =
        before.outcome === 'words-missing' ? line.check.ok : line.check.ok && line.count >= REREVIEW_FACTOR * before.promotions;
      if (!again) {
        skipped.decided++;
        continue;
      }
    }
    eligible.push(line);
  }
  eligible.sort((a, b) => b.count - a.count || a.key_sha256.localeCompare(b.key_sha256));
  const limit = context.limit ?? REVIEW_LIMIT;
  skipped.over = Math.max(0, eligible.length - limit);
  return { chosen: eligible.slice(0, limit), skipped };
}
