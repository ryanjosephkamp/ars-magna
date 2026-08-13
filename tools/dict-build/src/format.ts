/**
 * Binary artifact format for the shipped dictionary.
 *
 * Words are front-coded: sorted lexicographically, then each entry stores only
 * how many leading bytes it shares with its predecessor plus the differing
 * suffix. On a sorted English list that collapses 4.44 MB of newline-delimited
 * text to ~1.7 MB raw / ~0.52 MB brotli, and it decodes in a single linear pass
 * with no allocation.
 *
 * The prefix chain is restarted every `BLOCK_SIZE` words and the byte offset of
 * each restart is recorded, which is what makes binary search by prefix
 * possible without decoding the whole list — needed for "must include"
 * autocomplete and validation on the main thread.
 */

export const MAGIC_DICT = 'ARSMAGNA';
export const MAGIC_BITS = 'ARSMBITS';
export const FORMAT_VERSION = 1;
export const BLOCK_SIZE = 64;

export const SECTION_WORDS = 1;
export const SECTION_RESTARTS = 2;
export const SECTION_ZIPF = 3;
/**
 * Two bytes per word, little-endian: a bitmask of the parts of speech the word
 * can be, in the bit order `packages/engine/src/wordOrder.ts` defines. Two and
 * not one because there are nine classes and `interj` is the ninth bit.
 *
 * Optional, like ZIPF — a dictionary without it still loads, and the ordering
 * falls back to whatever the search emitted.
 */
export const SECTION_POS = 4;

export const FLAG_HAS_ZIPF = 1 << 0;
export const FLAG_HAS_POS = 1 << 1;

const HEADER_BYTES = 24;
const SECTION_ENTRY_BYTES = 12;

export type DictSections = {
  /** Lexicographically sorted, normalized, unique. */
  readonly words: readonly string[];
  /** One byte per word; 0 means "no frequency data". */
  readonly zipf: Uint8Array | null;
  /** Two bytes per word, little-endian; 0 means "no part of speech known". */
  readonly pos?: Uint8Array | null;
  /** Identifies which tier this file carries. */
  readonly tier: number;
};

function align4(n: number): number {
  return (n + 3) & ~3;
}

/** Front-code `words`, returning the WORDS payload and per-block restart offsets. */
function frontCode(words: readonly string[]): { payload: Uint8Array; restarts: Uint32Array } {
  const blockCount = Math.ceil(words.length / BLOCK_SIZE);
  const restarts = new Uint32Array(blockCount);

  // Worst case: every word stores a length byte, its full bytes, and a terminator.
  let upper = 0;
  for (const w of words) upper += w.length + 2;
  const payload = new Uint8Array(upper);

  let out = 0;
  let previous = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i]!;
    const blockStart = i % BLOCK_SIZE === 0;

    if (blockStart) restarts[i / BLOCK_SIZE] = out;

    let shared = 0;
    if (!blockStart) {
      const limit = Math.min(255, previous.length, word.length);
      while (shared < limit && previous.charCodeAt(shared) === word.charCodeAt(shared)) shared++;
    }

    payload[out++] = shared;
    for (let c = shared; c < word.length; c++) payload[out++] = word.charCodeAt(c);
    payload[out++] = 0;

    previous = word;
  }

  return { payload: payload.subarray(0, out), restarts };
}

export function encodeDict({ words, zipf, pos, tier }: DictSections): Uint8Array {
  if (zipf && zipf.length !== words.length) {
    throw new Error(`zipf length ${zipf.length} != word count ${words.length}`);
  }
  if (pos && pos.length !== words.length * 2) {
    throw new Error(`pos length ${pos.length} != 2 x word count ${words.length}`);
  }

  const { payload, restarts } = frontCode(words);
  const restartBytes = new Uint8Array(restarts.buffer, restarts.byteOffset, restarts.byteLength);

  const sections: { kind: number; data: Uint8Array }[] = [
    { kind: SECTION_WORDS, data: payload },
    { kind: SECTION_RESTARTS, data: restartBytes },
  ];
  if (zipf) sections.push({ kind: SECTION_ZIPF, data: zipf });
  if (pos) sections.push({ kind: SECTION_POS, data: pos });

  const tableBytes = sections.length * SECTION_ENTRY_BYTES;
  let cursor = align4(HEADER_BYTES + tableBytes);

  const placed = sections.map((s) => {
    const offset = cursor;
    cursor = align4(cursor + s.data.length);
    return { ...s, offset };
  });

  const out = new Uint8Array(cursor);
  const view = new DataView(out.buffer);

  for (let i = 0; i < 8; i++) out[i] = MAGIC_DICT.charCodeAt(i);
  view.setUint16(8, FORMAT_VERSION, true);
  out[10] = tier;
  out[11] = (zipf ? FLAG_HAS_ZIPF : 0) | (pos ? FLAG_HAS_POS : 0);
  view.setUint32(12, words.length, true);
  view.setUint16(16, BLOCK_SIZE, true);
  view.setUint16(18, placed.length, true);
  view.setUint32(20, 0, true); // reserved

  let entry = HEADER_BYTES;
  for (const s of placed) {
    view.setUint32(entry, s.kind, true);
    view.setUint32(entry + 4, s.offset, true);
    view.setUint32(entry + 8, s.data.length, true);
    entry += SECTION_ENTRY_BYTES;
    out.set(s.data, s.offset);
  }

  return out;
}

/** Reference decoder. The shipped decoder lives in packages/engine; this one
 *  exists so the build can verify every artifact round-trips before writing it. */
export function decodeDict(buf: Uint8Array): {
  words: string[];
  zipf: Uint8Array | null;
  pos: Uint8Array | null;
} {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  for (let i = 0; i < 8; i++) {
    if (buf[i] !== MAGIC_DICT.charCodeAt(i)) throw new Error('bad magic');
  }
  const version = view.getUint16(8, true);
  if (version !== FORMAT_VERSION) throw new Error(`unsupported version ${version}`);

  const wordCount = view.getUint32(12, true);
  const sectionCount = view.getUint16(18, true);

  let words: Uint8Array | null = null;
  let zipf: Uint8Array | null = null;
  let pos: Uint8Array | null = null;

  for (let i = 0; i < sectionCount; i++) {
    const at = HEADER_BYTES + i * SECTION_ENTRY_BYTES;
    const kind = view.getUint32(at, true);
    const offset = view.getUint32(at + 4, true);
    const length = view.getUint32(at + 8, true);
    const slice = buf.subarray(offset, offset + length);
    if (kind === SECTION_WORDS) words = slice;
    else if (kind === SECTION_ZIPF) zipf = slice;
    else if (kind === SECTION_POS) pos = slice;
  }
  if (!words) throw new Error('missing WORDS section');

  const out: string[] = new Array(wordCount);
  const scratch = new Uint8Array(256);
  let read = 0;
  let length = 0;

  for (let i = 0; i < wordCount; i++) {
    const shared = words[read++]!;
    length = shared;
    let byte = words[read++]!;
    while (byte !== 0) {
      scratch[length++] = byte;
      byte = words[read++]!;
    }
    out[i] = String.fromCharCode(...scratch.subarray(0, length));
  }

  return { words: out, zipf, pos };
}

/**
 * Tier membership as bitsets over the Full-tier word ordering.
 *
 * Shipping one full word list plus bitsets, rather than three independent word
 * lists, means switching tiers in the UI costs zero network: 94.7 KB raw for
 * both sets (~35 KB brotli) against ~300 KB for a second word list.
 */
export function encodeBitsets(wordCount: number, sets: readonly Uint8Array[]): Uint8Array {
  const setBytes = Math.ceil(wordCount / 8);
  for (const s of sets) {
    if (s.length !== setBytes) throw new Error(`bitset length ${s.length} != ${setBytes}`);
  }

  const out = new Uint8Array(16 + sets.length * setBytes);
  const view = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) out[i] = MAGIC_BITS.charCodeAt(i);
  view.setUint16(8, FORMAT_VERSION, true);
  view.setUint16(10, sets.length, true);
  view.setUint32(12, wordCount, true);

  sets.forEach((s, i) => out.set(s, 16 + i * setBytes));
  return out;
}

export function makeBitset(wordCount: number): Uint8Array {
  return new Uint8Array(Math.ceil(wordCount / 8));
}

export function bitsetSet(set: Uint8Array, index: number): void {
  set[index >> 3]! |= 1 << (index & 7);
}

export function bitsetGet(set: Uint8Array, index: number): boolean {
  return (set[index >> 3]! & (1 << (index & 7))) !== 0;
}

export function bitsetCount(set: Uint8Array): number {
  let n = 0;
  for (const byte of set) {
    let b = byte;
    while (b) {
      b &= b - 1;
      n++;
    }
  }
  return n;
}
