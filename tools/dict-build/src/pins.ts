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

/**
 * Where the pinned OpenList files live now that the Hub cannot serve them.
 *
 * The dataset's history was rewritten in August 2026 and revision `368bf0e4`
 * stopped resolving on 11 September 2026 (HTTP 404). The two files that
 * revision contained were kept, verified byte for byte against the sha256
 * pins below, and attached to a GitHub release on this repository. `fetch.ts`
 * tries the Hub first and falls back here on a 404 or any other failure; the
 * hash check applies to both, so a tampered copy is refused either way.
 */
export const SOURCES_RELEASE = {
  repo: 'ryanjosephkamp/ars-magna',
  tag: 'openlist-368bf0e4',
} as const;

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

/**
 * Princeton WordNet 3.1, for word definitions.
 *
 * English OpenList carries none: its card advertises "part of speech,
 * definitions, and pronunciation" but the metadata file holds validation
 * provenance only. WordNet covers the common vocabulary well and its licence
 * permits redistribution with the copyright notice attached, which
 * `apps/web/public/defs/LICENSE` carries.
 */
export const WORDNET = {
  url: 'https://wordnetcode.princeton.edu/wn3.1.dict.tar.gz',
  bytes: 16_358_468,
  sha256: '3f7d8be8ef6ecc7167d39b10d66954ec734280b5bdcd57f7d9eafe429d11c22a',
  /**
   * Files pulled out of the archive; the rest is verb framesets. The `.exc`
   * files hold irregular inflections (`men` -> `man`, `bought` -> `buy`) and
   * are what let a definition be found for the many OpenList entries that
   * WordNet only stores in base form. `index.sense` carries the corpus tag
   * counts that rank a word's senses by how it is actually used; it was
   * missing from this list for a month, during which a fresh clone could not
   * build the dictionary at all — every build ran from a cache that already
   * had it.
   */
  members: [
    'dict/data.noun',
    'dict/data.verb',
    'dict/data.adj',
    'dict/data.adv',
    'dict/index.noun',
    'dict/index.verb',
    'dict/index.adj',
    'dict/index.adv',
    'dict/index.sense',
    'dict/noun.exc',
    'dict/verb.exc',
    'dict/adj.exc',
    'dict/adv.exc',
  ],
} as const;

export function openlistUrl(file: FilePin): string {
  return `https://huggingface.co/datasets/${OPENLIST.repo}/resolve/${OPENLIST.rev}/${file.path}`;
}

/** The durable copy of a pinned OpenList file, by its basename. */
export function sourcesReleaseUrl(file: FilePin): string {
  const name = file.path.split('/').pop() ?? file.path;
  return `https://github.com/${SOURCES_RELEASE.repo}/releases/download/${SOURCES_RELEASE.tag}/${name}`;
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
  /** Full minus the machine-generated entries; a band, so a small drift in
   *  the generation flags is looked at rather than failing the build. */
  standardRange: [305_000, 320_000],
  /** The site's own additions, which sit outside the pin entirely. A band
   *  rather than a count: the list grows one reviewed word at a time, and the
   *  upper bound is the cap `vocab:check` enforces. */
  additionsRange: [0, 2_000],
} as const;
