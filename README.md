# Ars Magna

**Ars Magna** is an anagram of **Anagrams**. It is also Latin for *the great art* — the
historic name for the art of anagramming.

Give the site any text. It returns every way those exact letters can be re-partitioned into
real English words: spaces move freely, every letter is used exactly once, nothing is added
and nothing is dropped. No AI — a deterministic search, verified against known cases.

## Input

Accented letters are forced to their unaccented base letter, so *Beyoncé* has three e's and
*Björk* is searched as *bjork*; ß becomes ss, æ becomes ae, ø becomes o, and so on. The
same folding is applied to the dictionary, so the two always agree. Spaces and punctuation
are ignored silently. Digits, symbols and letters of other scripts are ignored too, and the
letters line under the field says how many characters were skipped so that never looks like
a bug. English only. An input with more than 127 copies of one letter is refused with a
message rather than searched, since letter counts are bytes.

```
dormitory   →  dirty room
astronomer  →  moon starer
anagrams    →  ars magna
```

## Dictionary

Word validity is judged against [English OpenList][eol], pinned to a specific revision so
results are reproducible, plus a short public list of words this site has added. Four
nested tiers are available in the UI:

| Tier | Words | What it is |
|---|---|---|
| Common | 39,951 | Everyday vocabulary: the 40,000 most frequent words, plus the tournament two-letter list |
| **Standard** (default) | 314,007 | Every attested word |
| Full | 378,844 | English OpenList at the pinned revision |
| Extended | 378,846 | The pinned list plus the site's own additions |

Standard is the list minus the 64,837 algorithmically generated entries in the source data
(`abacteremicer`, `nonlivabler`), which otherwise flood results with unrecognizable words.
It used to be Common plus the TWL Scrabble dictionary, which sounded reasonable and was not:
TWL stops at 15 letters, so almost every longer word was missing from the default tier.
Nothing is removed from English OpenList itself — Full still carries every word, and
expanding a result says where each word came from.

Extended adds the site's own words on top of the pinned list. Every one is a line in
`data/vocabulary/additions.jsonl` with a meaning and a source, `pnpm vocab:check` keeps the
file honest in CI, and the word panel labels such a word as a site addition, so the
vocabulary stays something a reader can look up rather than guess at.

## Definitions

English OpenList carries no definitions despite its dataset card advertising them, so
glosses come from [WordNet 3.1][wordnet] instead. 119,593 words (31.6% of the list) are
covered; a little over half of those are reached through WordNet's own morphology, so
`dormitories` gets `dormitory`'s definition and says that it did. Words with no gloss fall
back to explaining their provenance.

[wordnet]: https://wordnet.princeton.edu/

[eol]: https://huggingface.co/datasets/ryanjosephkamp/english-openlist

## Export

Any result set can be downloaded as TXT (one anagram per line), JSON (the same list
with the query and filters attached, words kept as arrays so the spacing survives), CSV
(with word count and longest word, for sorting in a spreadsheet), or a ZIP of all three
plus a README.

Exports are capped at 100,000 rows. A query can have eleven million answers and writing
them all would be gigabytes, so JSON and CSV both carry a `complete` flag and say what
they left out — a file that has been emailed on has lost the interface that produced it
and needs to disclose that itself.

## Filtering and sorting

The result list can be filtered by substring and sorted by word count, alphabetically, or
by longest word. Both act on what has been loaded rather than on the whole answer space,
since sorting results the engine never enumerated is not a thing that can be done. The
status line says which it is, and offers to load everything when the total is small enough
for that to be honest. A filter that is one or more dictionary words is counted across every
result instead, with those words as Must include, so the line leads with the whole answer:
`11 of 15,202 contain “shamed”`. Show them, or Enter in the filter box, switches the list to
them; nothing switches it while you type.

## Offline

Everything happens on your own machine — the search, the dictionary, the definitions —
so after one visit the site works with no network at all. A service worker serves the
shell from cache and the engine keeps the dictionary in Cache Storage; the page fills
both on first load from a build-time `precache.json`, because a module worker's own
script request never reaches a service worker's `fetch` handler and could not be cached
any other way.

The definition shards are the exception: they are fetched per word on demand, so a word
you have not looked at before will show no gloss offline.

## Keyboard

Arrow keys walk the result list, `Home` / `End` jump to either end, `PageUp` / `PageDown`
move ten at a time, and `Enter` opens a result. The list is virtualized, so tabbing alone
would run out after a screenful — the arrow keys move a cursor that scrolls the target
into view and then focuses it.

## Development

```bash
pnpm install
pnpm dict:fetch     # download pinned sources into .cache/ (~330 MB, once)
                    # the pinned OpenList revision is gone from the Hub; this
                    # falls back to the copy on this repo's openlist-368bf0e4 release
pnpm dict:build     # emit apps/web/public/dict/ artifacts
pnpm dict:shards    # emit apps/web/public/defs/ definitions (~18 MB, committed)
pnpm wasm:build     # compile the Rust engine to WASM
pnpm dev
```

The dictionary artifacts and the definition shards (514 files, 18 MB) are both
committed. They are deterministic output of pinned sources, and committing them
means a deploy needs no download from Hugging Face: publishing does not depend on
a third party being up. Regenerate with `pnpm dict:build` and `pnpm dict:shards`
when a pin moves.

Requires Node 22+, pnpm, and a Rust toolchain with the `wasm32-unknown-unknown` target.

```bash
pnpm test           # TypeScript tests
pnpm rust:test      # engine tests, including the completeness oracle
```

## Layout

```
crates/anagram-core    search, counting, unranking — pure Rust, no wasm deps
crates/anagram-wasm    wasm-bindgen shim
crates/anagram-cli     native binary for goldens and profiling
packages/engine        worker protocol, dictionary loading, WASM binding
tools/dict-build       pinned fetch, tiering, binary artifact emission
apps/web               React UI
```

## Deploying

CI runs on every push. The deploy workflow publishes `main` to Cloudflare Pages, project
`ars-magna`, at <https://ars-magna.pages.dev>. It skips rather than failing when the
project variable below is unset, because a job that is always red trains people to stop
reading it.

The build happens in GitHub Actions rather than in Cloudflare's build image, so the Rust
toolchain is under our control. The dictionary artifacts and definition shards are
committed, so no build step reaches Hugging Face: publishing does not depend on a third
party being up.

To set it up on a fork:

1. In the Cloudflare dashboard, create a **Pages** project (Workers & Pages → Create →
   Pages). Use *Direct Upload* — the repo does not need to be connected, since Actions
   does the building. Note the project name.
2. Create an API token (My Profile → API Tokens → Create Token) with the
   **Cloudflare Pages: Edit** permission. Copy your Account ID from the dashboard sidebar.
3. Add them to this repo. These commands prompt for the values, so the secrets are never
   typed into a shell history or a chat window:

```bash
gh secret set CLOUDFLARE_API_TOKEN
```

```bash
gh secret set CLOUDFLARE_ACCOUNT_ID
```

4. Name the project. This variable is the on switch — setting it is what makes the deploy
   workflow start running:

```bash
gh variable set CLOUDFLARE_PROJECT_NAME --body ars-magna
```

5. Trigger the first deploy:

```bash
gh workflow run Deploy
```

### How the dictionary gets compressed

Cloudflare compresses by content type and does not compress `application/octet-stream`,
so the dictionary would cross the wire at full size. The current build is
**3,035,544 bytes uncompressed against 855,668 with brotli** across the two artifacts —
a 3.5× difference on every first visit.

Pages will not negotiate between sibling files, so the `.br` artifacts `dict:build`
produces are served under their own URLs with an explicit `Content-Encoding: br` in
`_headers`, and the engine asks for `<name>.br` first.

That header is the fragile part: without it the browser hands the engine raw brotli and
nothing raises an error — the bytes just fail to parse somewhere inside Rust. So the
engine checks the decoded length against `bytes` in the manifest and falls back to the
plain artifact if it does not match. This is not hypothetical; a client that sends
`Accept-Encoding: identity` gets exactly that response from Pages today.

To confirm compression is live:

```bash
curl -sI -H 'Accept-Encoding: br' https://<your-site>/dict/manifest.json
```

Then fetch the `.br` sibling of the artifact named in that manifest and check for
`content-encoding: br`. If it is missing the site still works, just at three times the
transfer.

One trap if you edit `_headers`: Pages applies **every** matching rule and appends their
values rather than picking the most specific. Two rules that both match a path yield a
concatenated `Cache-Control`, and a stray `immutable` in the tail is not cancelled by an
earlier `max-age`. That is why the artifact rules are written per extension instead of
`/dict/*`, which would also match `manifest.json`.

## License

MIT. English OpenList is MIT. Frequency data is from
[hermitdave/FrequencyWords][freq] (OpenSubtitles 2018, MIT).

[freq]: https://github.com/hermitdave/FrequencyWords
