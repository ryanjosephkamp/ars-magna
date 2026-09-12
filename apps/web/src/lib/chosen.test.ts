import { describe, expect, it } from 'vitest';
import { choose, displayOrder, rowKey } from './chosen.ts';

describe('chosen order', () => {
  it('keys a result by its words, not their order', () => {
    expect(rowKey(['dirty', 'room'])).toBe(rowKey(['room', 'dirty']));
    expect(rowKey(['pa', 'pa'])).toBe('pa pa');
    expect(rowKey(['dirty', 'room'])).not.toBe(rowKey(['dirty', 'rooms']));
  });

  it("shows the engine's order until the reader chooses one", () => {
    const row = ['dirty', 'room'];
    expect(displayOrder(new Map(), row)).toBe(row);
    const chosen = choose(new Map(), ['room', 'dirty']);
    expect(displayOrder(chosen, row)).toEqual(['room', 'dirty']);
    // Another result with other words is untouched.
    expect(displayOrder(chosen, ['moon', 'starer'])).toEqual(['moon', 'starer']);
  });

  it('is what Copy and Pin name: the same phrase the row shows', () => {
    const row = ['dirty', 'room'];
    const chosen = choose(new Map(), ['room', 'dirty']);
    const phrase = displayOrder(chosen, row).join(' ');
    expect(phrase).toBe('room dirty');
    // A pin is a phrase string; pinning what the row shows finds it again.
    const pinned = new Set([phrase]);
    expect(pinned.has(displayOrder(chosen, row).join(' '))).toBe(true);
    expect(pinned.has(row.join(' '))).toBe(false);
  });

  it('never mutates the map it was given or the order it was handed', () => {
    const before = new Map<string, readonly string[]>();
    const order = ['room', 'dirty'];
    const after = choose(before, order);
    expect(before.size).toBe(0);
    expect(after.size).toBe(1);
    order.reverse();
    expect(after.get(rowKey(order))).toEqual(['room', 'dirty']);
  });
});
