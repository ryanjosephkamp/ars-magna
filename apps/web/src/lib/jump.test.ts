import { describe, expect, it } from 'vitest';
import { JumpEntry, parseJumpTarget } from './jump.ts';

describe('parseJumpTarget', () => {
  it('maps a 1-based entry to a 0-based index within the total', () => {
    expect(parseJumpTarget('1', '5093')).toBe(0n);
    expect(parseJumpTarget('5093', '5093')).toBe(5092n);
    expect(parseJumpTarget('#2,500', '5093')).toBe(2499n);
  });

  it('rejects nothing, zero, and anything past the total', () => {
    expect(parseJumpTarget('', '5093')).toBeNull();
    expect(parseJumpTarget('go', '5093')).toBeNull();
    expect(parseJumpTarget('0', '5093')).toBeNull();
    expect(parseJumpTarget('5094', '5093')).toBeNull();
  });

  it('treats a floor as the bound, and handles totals past 2^53', () => {
    expect(parseJumpTarget('652115', '>652115')).toBe(652114n);
    expect(parseJumpTarget('652116', '>652115')).toBeNull();
    expect(parseJumpTarget('18234855292', '18234855292')).toBe(18234855291n);
  });
});

describe('JumpEntry', () => {
  it('submits an entry once, so Enter followed by blur is one jump', () => {
    const entry = new JumpEntry();
    expect(entry.submit('7', '100')).toBe(6n); // Enter
    expect(entry.submit('7', '100')).toBeNull(); // the blur Enter caused
  });

  it('submits again once the text has changed, even back to the same value', () => {
    const entry = new JumpEntry();
    expect(entry.submit('7', '100')).toBe(6n);
    entry.changed();
    expect(entry.submit('8', '100')).toBe(7n);
    entry.changed();
    expect(entry.submit('7', '100')).toBe(6n);
  });

  it('does not remember an invalid entry as submitted', () => {
    const entry = new JumpEntry();
    expect(entry.submit('0', '100')).toBeNull();
    expect(entry.submit('1', '100')).toBe(0n);
  });
});
