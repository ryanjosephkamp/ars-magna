/**
 * Pinned upstream sources.
 *
 * Never resolve against `main`. English OpenList runs an automated daily
 * pipeline, so the branch head moves under you; a silent dictionary change
 * silently changes every result the app produces. Bumping a pin should be a
 * reviewed commit, not a side effect of rebuilding.
 */

export type FilePin = {
  readonly path: string;
  readonly bytes: number;
  readonly sha256: string;
};

export const OPENLIST = {
  repo: 'ryanjosephkamp/english-openlist',
  rev: '368bf0e4460461c985fca8bde49e4062d56c1516',
  files: {
    words: {
      path: 'latest/merged_valid_words.txt',
      bytes: 4_438_362,
      sha256: '58957d65714390e3a0392241a04483b30e770a7b282844e9c0fcc7db4f1e69e1',
    },
    meta: {
      path: 'latest/merged_valid_dict.json',
      bytes: 290_619_809,
      sha256: '8fd0967221e8abd392b0f935ace89292a60c96325358847cd622d59285221430',
    },
  },
} as const satisfies { repo: string; rev: string; files: Record<string, FilePin> };

/**
 * OpenSubtitles 2018 word frequencies. English OpenList carries no frequency
 * signal of its own (`coca_frequency` is a validation provenance flag present
 * on only 12,056 words, and they are not common ones), so this supplies the
 * ranking that drives the Common tier, result ordering, and "Surprise me".
 *
 * The repo has been frozen since 2022; the pin is belt-and-braces.
 */
export const FREQUENCY = {
  repo: 'hermitdave/FrequencyWords',
  rev: '525f9b560de45753a5ea01069454e72e9aa541c6',
  path: 'content/2018/en/en_full.txt',
  bytes: 19_977_552,
} as const;

export function openlistUrl(file: FilePin): string {
  return `https://huggingface.co/datasets/${OPENLIST.repo}/resolve/${OPENLIST.rev}/${file.path}`;
}

export function frequencyUrl(): string {
  return `https://raw.githubusercontent.com/${FREQUENCY.repo}/${FREQUENCY.rev}/${FREQUENCY.path}`;
}

/** Invariants measured against the pinned revision. These are tripwires: when a
 *  pin moves they are *supposed* to fire, so the change gets looked at. */
export const EXPECTED = {
  rawLines: 378_887,
  normalizedWords: 378_844,
  hyphenatedSurfaces: 188,
  nonAsciiSurfaces: ['norteño', 'peléan'],
  /** Distinct sorted-letter signatures across the full list. */
  signatures: 350_469,
  /** |Common ∪ TWL| is sensitive to the frequency cutoff; assert a band. */
  standardRange: [175_000, 210_000],
} as const;
