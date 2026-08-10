/**
 * FNV-1a, 32-bit.
 *
 * Used to decide which shard a word's definition lives in. The browser computes
 * the same hash to know which file to fetch, so this function and
 * `packages/engine/src/fnv1a.ts` must agree exactly — `hash.test.ts` pins known
 * values on both sides. A drift here would not throw; it would just return
 * "no definition" for most words.
 */
export function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    // The FNV prime, 16777619, via shifts: Math.imul keeps this exact in 32 bits.
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function shardOf(word: string, shardCount: number): number {
  return fnv1a(word) % shardCount;
}
