/**
 * The "Go to" field: turning what someone typed into a result index, once.
 *
 * The field submits on Enter and on blur, and pressing Enter in a field also
 * blurs it in most browsers — so one entry used to fire twice, and the second
 * unranking overwrote the first with the same answer. `JumpEntry` remembers
 * what it last submitted and refuses to submit it again until the text
 * changes, which makes Enter-then-blur one jump and a retyped value a new one.
 */

/**
 * Parse a 1-based position against the engine's total, or `null` when there
 * is nothing to jump to. The total may carry the `>` floor prefix; a floor
 * still bounds what can be asked for, since unranking past it is undefined.
 */
export function parseJumpTarget(value: string, total: string): bigint | null {
  const digits = value.replace(/[^0-9]/g, '');
  if (digits.length === 0) return null;
  const max = BigInt(total.replace('>', ''));
  const position = BigInt(digits);
  if (position < 1n || position > max) return null;
  return position - 1n;
}

export class JumpEntry {
  #lastSubmitted: string | null = null;

  /** The text changed; whatever was submitted before is history. */
  changed(): void {
    this.#lastSubmitted = null;
  }

  /**
   * The index to jump to, or `null` if the entry is invalid or was already
   * submitted as-is.
   */
  submit(value: string, total: string): bigint | null {
    const digits = value.replace(/[^0-9]/g, '');
    if (digits === this.#lastSubmitted) return null;
    const target = parseJumpTarget(value, total);
    if (target === null) return null;
    this.#lastSubmitted = digits;
    return target;
  }
}
