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

/**
 * The sources of the names list, `data/vocabulary/names.jsonl` (phase Q1, the
 * names experiment). Names are not in the vocabulary: English OpenList
 * excludes them by rule, and the list is built so a deep run can admit them
 * and a report can say what they were worth. Nothing on the site reads it.
 *
 * Two of the four sources have no revision to pin. Wikidata answers a query
 * with what it holds that day, and GeoNames rewrites its dump every night, so
 * for those the pin is the request as sent, the day it was sent, and the
 * sha256 of the answer. `names.ts` verifies a cached answer against that hash
 * and refuses a mismatch; a fresh fetch on another machine gets that day's
 * answer, and `pnpm names:build --refresh` says what moved. The Census files
 * have not changed since they were published, and pin like the rest. The
 * 2010 surname file (`2010surnames/names.zip`) is what the list should have
 * used; on 2026-09-21 the Census site's edge returned a cached "Request
 * Rejected" page for it, so the 2000 list stands in.
 */
export const NAMES = {
  /** The day the answers below were fetched. */
  fetched: '2026-09-21',
  /** The identity every request carries, as Wikimedia's policy asks. */
  userAgent: 'ArsMagnaNamesBuild/0.1 (https://github.com/ryanjosephkamp/ars-magna)',
  wikidata: {
    endpoint: 'https://query.wikidata.org/sparql',
    /**
     * One query per kind: notable entities by prominence, measured as the
     * number of Wikipedia editions with an article (`wikibase:sitelinks`),
     * from `threshold` up. Written so the query service answers inside its
     * limit: the range on sitelinks is scanned first where the class is
     * large, and the class first where it is small.
     */
    queries: [
      {
        key: 'people',
        kind: 'person',
        threshold: 100,
        sparql:
          'SELECT ?item ?label ?sl WHERE { ?item wikibase:sitelinks ?sl . hint:Prior hint:rangeSafe true . FILTER(?sl >= 100) ' +
          '?item wdt:P31 wd:Q5 . ?item rdfs:label ?label . FILTER(LANG(?label) = "en") }',
        bytes: 504_542,
        sha256: '86044b1aabc1a86be4ac224ac77d889d239e95753ac7e4b6dacd76b2b852df77',
      },
      {
        key: 'cities',
        kind: 'place',
        threshold: 80,
        sparql:
          'SELECT ?item ?label ?sl WHERE { ?item wikibase:sitelinks ?sl . hint:Prior hint:rangeSafe true . FILTER(?sl >= 80) ' +
          'VALUES ?class { wd:Q515 wd:Q1549591 wd:Q5119 wd:Q1637706 wd:Q1093829 wd:Q3957 wd:Q702492 wd:Q15284 wd:Q484170 wd:Q7930989 wd:Q200250 wd:Q2264924 } ' +
          '?item wdt:P31 ?class . ?item rdfs:label ?label . FILTER(LANG(?label) = "en") }',
        bytes: 828_837,
        sha256: 'aad49314923b189c08fe47dc66ceceea0ecb465269c6679f8135fc067473e0b6',
      },
      {
        key: 'countries',
        kind: 'place',
        threshold: 50,
        sparql:
          'SELECT ?item ?label ?sl WHERE { ?item wdt:P31 wd:Q6256 . ?item wikibase:sitelinks ?sl . FILTER(?sl >= 50) ' +
          '?item rdfs:label ?label . FILTER(LANG(?label) = "en") }',
        bytes: 76_094,
        sha256: 'f47e0438f154c77f37e1777385b85e5d773100748c26d43e03f68f7d43712bac',
      },
      {
        key: 'regions',
        kind: 'place',
        threshold: 100,
        sparql:
          'SELECT ?item ?label ?sl WHERE { ?item wikibase:sitelinks ?sl . hint:Prior hint:rangeSafe true . FILTER(?sl >= 100) ' +
          '?item wdt:P31/wdt:P279* wd:Q10864048 . ?item rdfs:label ?label . FILTER(LANG(?label) = "en") }',
        bytes: 256_475,
        sha256: '868dea2035d123db493762c4d6f7429f4309603aa1640c88586302a61a50e0f6',
      },
      {
        key: 'companies',
        kind: 'company',
        threshold: 40,
        sparql:
          'SELECT ?item ?label ?sl WHERE { VALUES ?class { wd:Q4830453 wd:Q6881511 wd:Q891723 wd:Q161726 wd:Q46970 wd:Q786820 wd:Q1058914 wd:Q18388277 ' +
          'wd:Q778575 wd:Q22687 wd:Q507619 wd:Q1631111 wd:Q2001305 wd:Q1616075 wd:Q1668024 wd:Q210167 wd:Q1762059 wd:Q11032 wd:Q783794 wd:Q4438121 } ' +
          '?item wdt:P31 ?class . ?item wikibase:sitelinks ?sl . FILTER(?sl >= 40) ?item rdfs:label ?label . FILTER(LANG(?label) = "en") }',
        bytes: 480_886,
        sha256: '027c6e288acbd6f47f6d4bbdac8d9fdc635fa0f08360b47621adab7ff1d7038f',
      },
      {
        key: 'brands',
        kind: 'brand',
        threshold: 30,
        sparql:
          'SELECT ?item ?label ?sl WHERE { ?item wikibase:sitelinks ?sl . hint:Prior hint:rangeSafe true . FILTER(?sl >= 30) ' +
          '?item wdt:P31/wdt:P279* wd:Q431289 . ?item rdfs:label ?label . FILTER(LANG(?label) = "en") }',
        bytes: 132_641,
        sha256: 'ef30116b2520cb897b4abd4b3d94f324a835e45107e35a85e2f138498a879a7b',
      },
    ],
  },
  census: {
    /** Surnames from the 2000 Census, by rank; the first `take` of 151,671. */
    surnames: {
      url: 'https://www2.census.gov/topics/genealogy/2000surnames/names.zip',
      member: 'app_c.csv',
      bytes: 12_250_510,
      sha256: '8dffe1e686ad12fd618e8533f2a079e12d3ea60e60be3450a66a6d17499b35bc',
      take: 5_000,
    },
    /**
     * Given names from the 1990 Census, female and male, each with the share
     * of the population that bears it; a name is taken from `minPercent` up.
     */
    given: [
      {
        url: 'https://www2.census.gov/topics/genealogy/1990surnames/dist.female.first',
        bytes: 149_625,
        sha256: 'bd2f310fc4e5d5e5ea122c9d4342c9821145823118eb20db1647f305ec77b358',
      },
      {
        url: 'https://www2.census.gov/topics/genealogy/1990surnames/dist.male.first',
        bytes: 42_665,
        sha256: '0a5078ef6effe3b483d15b0f7f95047662126c9bfb624ecd5e5b978fc0f2470b',
      },
    ],
    minPercent: 0.01,
  },
  geonames: {
    /** Every place with a population of 15,000 or more; taken from `minPopulation` up. */
    url: 'https://download.geonames.org/export/dump/cities15000.zip',
    member: 'cities15000.txt',
    bytes: 3_359_367,
    sha256: '92708f433d59eb2720c19abf484d3d8a338224b7bf2c9f71d39dc45e7b7be3c2',
    minPopulation: 300_000,
  },
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
  /** The listed forms (`it's`, `don't`), which share the additions' cap. The
   *  build also holds the two lists together under it. */
  formsRange: [0, 2_000],
} as const;
