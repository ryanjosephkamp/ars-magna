/**
 * The listed forms a dictionary artifact carries: spellings with an apostrophe
 * or hyphen whose letters are one word of the list (`it's` for `its`, `don't`
 * for `dont`).
 *
 * The words payload is letters-only, and the Rust search never sees an
 * apostrophe: it skips this section as it skips any kind it does not know.
 * The worker reads the section once at init and sends the entries with
 * `ready`, and the page applies them at render: a row shows `don't` where
 * `dont` is the only spelling of its letters, and the word panel lists `it's`
 * beside `its`. Nothing that crosses a boundary (a result's words, a
 * promotion's key, a hit's id) ever carries the form.
 *
 * The header and section layout repeat `tools/dict-build/src/format.ts`,
 * which writes the artifact; `engineCore.test.ts` decodes what that encoder
 * wrote, so the two cannot drift unnoticed. Only the header, the section table
 * and this one section are read here: the front-coded word list stays with
 * Rust.
 */

export type DictForm = {
  /** The word the search knows: the form with its apostrophes and hyphens dropped. */
  readonly letters: string;
  readonly form: string;
  /** Rows show the form: it is the only spelling of its letters. */
  readonly shown: boolean;
};

const MAGIC = 'ARSMAGNA';
const HEADER_BYTES = 24;
const SECTION_ENTRY_BYTES = 12;
const SECTION_FORMS = 5;
const FORM_SHOWN = 1 << 0;

/** The forms of an artifact, in file order; none for a dictionary built without the section, or for bytes that are not an artifact. */
export function readForms(buf: Uint8Array): DictForm[] {
  if (buf.length < HEADER_BYTES) return [];
  for (let i = 0; i < MAGIC.length; i++) if (buf[i] !== MAGIC.charCodeAt(i)) return [];
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const sectionCount = view.getUint16(18, true);
  for (let i = 0; i < sectionCount; i++) {
    const at = HEADER_BYTES + i * SECTION_ENTRY_BYTES;
    if (at + SECTION_ENTRY_BYTES > buf.length) return [];
    if (view.getUint32(at, true) !== SECTION_FORMS) continue;
    const offset = view.getUint32(at + 4, true);
    const length = view.getUint32(at + 8, true);
    return decodeForms(buf.subarray(offset, offset + length));
  }
  return [];
}

function decodeForms(data: Uint8Array): DictForm[] {
  const decoder = new TextDecoder();
  if (data.length < 4) return [];
  const count = new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(0, true);
  const out: DictForm[] = [];
  let at = 4;
  for (let i = 0; i < count && at < data.length; i++) {
    const flags = data[at++]!;
    const lettersLength = data[at++]!;
    const letters = decoder.decode(data.subarray(at, at + lettersLength));
    at += lettersLength;
    const formLength = data[at++]!;
    const form = decoder.decode(data.subarray(at, at + formLength));
    at += formLength;
    out.push({ letters, form, shown: (flags & FORM_SHOWN) !== 0 });
  }
  return out;
}
