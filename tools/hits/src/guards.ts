/**
 * The judge guards (roadmap F0). On 2026-09-18 the routine handed its files
 * to subagents: the screen kept 783 phrases where earlier nights kept 6 to
 * 43, 448 of them for one input, and those were scored by a keyword script
 * that wrote the justifications from templates. The routine's prompt already
 * forbade it, so the tools refuse such a night themselves. Pure: `screen.ts`
 * applies the first, `ingest.ts` the second.
 *
 *   SCREEN_KEEP_CAP  the most phrases the screen may keep for one input
 *   REPEAT_CAP       the most verdicts one justification may be on, once the
 *                    words it quotes are masked
 *
 * The third guard, `ALTERNATE_CAP`, is a shelving rule and lives in `shelf.ts`.
 */

/**
 * The most phrases the screen may keep for one input, across every file its
 * phrases span. The routine's nights before 2026-09-18 never kept more than 3.
 * A deep run's queue is not capped: its screen is read in a session a person
 * started, at up to 300 phrases an input.
 */
export const SCREEN_KEEP_CAP = 12;

/** The most verdicts one justification may be on, once the words it quotes are masked. */
export const REPEAT_CAP = 3;

/**
 * An input whose screen answers keep more phrases than the cap, with a
 * sentence saying so, in the order the inputs came.
 */
export function screenKeepProblems(kept: ReadonlyMap<string, ReadonlySet<number>>, cap: number = SCREEN_KEEP_CAP): string[] {
  return [...kept]
    .filter(([, numbers]) => numbers.size > cap)
    .map(([id, numbers]) => `${id}: keeps ${numbers.size} phrases, and an input keeps at most ${cap}. Keep only its strongest links.`);
}

// A span in straight or curly quotes. A straight single quote opens only
// where no letter or digit comes before it and closes only where none comes
// after, so the apostrophes in "Reed's" and "the detectives' cases" never do.
const QUOTED = /"[^"\n]{1,80}"|“[^”\n]{1,80}”|‘[^’\n]{1,80}’|(?<![\p{L}\p{N}])'[^'\n]{1,80}?'(?![\p{L}\p{N}])/gu;

/**
 * A justification as the repeat check compares it: every quoted span as `…`,
 * in lower case, with runs of space as one and no closing full stop. Two
 * sentences written from one template by filling in the phrase's words come
 * out the same.
 */
export function maskQuoted(sentence: string): string {
  return sentence.replace(QUOTED, '…').replace(/\s+/g, ' ').trim().toLowerCase().replace(/\.$/, '');
}

export type Repeat = { sentence: string; count: number; ids: string[] };

/**
 * The justifications that are on more than `cap` verdicts once masked, most
 * repeated first. Each verdict counts once, by id, however many lines repeat it.
 */
export function repeatedJustifications(
  verdicts: readonly { id?: unknown; justification?: unknown }[],
  cap: number = REPEAT_CAP,
): Repeat[] {
  const groups = new Map<string, Set<string>>();
  for (const v of verdicts) {
    if (typeof v.id !== 'string' || typeof v.justification !== 'string' || v.justification.trim().length === 0) continue;
    const sentence = maskQuoted(v.justification);
    groups.set(sentence, (groups.get(sentence) ?? new Set()).add(v.id));
  }
  return [...groups]
    .filter(([, ids]) => ids.size > cap)
    .map(([sentence, ids]) => ({ sentence, count: ids.size, ids: [...ids] }))
    .sort((a, b) => b.count - a.count || a.sentence.localeCompare(b.sentence));
}

/** What ingest prints when it refuses a verdict file for its repeated justifications. */
export function repeatMessage(repeats: readonly Repeat[], file: string, cap: number = REPEAT_CAP): string {
  const lines = repeats.map((r) => `  ${r.count} verdicts: "${r.sentence}." (${r.ids[0]}, …)`);
  return [
    `${file} is refused: ${repeats.length === 1 ? 'one justification is' : `${repeats.length} justifications are`} ` +
      `on more than ${cap} verdicts once the words ${repeats.length === 1 ? 'it quotes are' : 'they quote are'} masked.`,
    ...lines,
    'A justification explains its own phrase. Judge these rows again, one at a time, and write each sentence for its row. Nothing was written.',
  ].join('\n');
}
