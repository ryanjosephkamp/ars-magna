# Ars Magna

**Ars Magna** is an anagram of **Anagrams**. It is also Latin for *the great art* — the
historic name for the art of anagramming.

Give the site any text. It returns every way those exact letters can be re-partitioned into
real English words: spaces move freely, every letter is used exactly once, nothing is added
and nothing is dropped. No AI — a deterministic search, verified against known cases.

```
dormitory   →  dirty room
astronomer  →  moon starer
anagrams    →  ars magna
```

## Dictionary

Word validity is judged against [English OpenList][eol], pinned to a specific revision so
results are reproducible. Three nested tiers are available in the UI:

| Tier | Words | What it is |
|---|---|---|
| Common | ~40k | Everyday vocabulary |
| **Standard** (default) | ~190k | Common plus the TWL Scrabble dictionary |
| Full | 378,844 | The complete list |

Standard excludes the ~64,800 algorithmically generated entries in the source data
(`abacteremicer`, `nonlivabler`), which otherwise flood results with unrecognizable words.
Nothing is removed from English OpenList itself — Full still carries every word, and
expanding a result says where each word came from.

## Definitions

English OpenList carries no definitions despite its dataset card advertising them, so
glosses come from [WordNet 3.1][wordnet] instead. 116,837 words (30.8% of the list) are
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
for that to be honest.

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
pnpm dict:build     # emit apps/web/public/dict/ artifacts
pnpm dict:shards    # emit apps/web/public/defs/ definitions (~17 MB, not committed)
pnpm wasm:build     # compile the Rust engine to WASM
pnpm dev
```

The dictionary artifacts are committed; the definition shards are not, because
they are 17 MB of derived data. Run `pnpm dict:shards` once — without it the app
works fine, it just shows no definitions.

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

CI runs on every push. The deploy workflow is wired up but **switched off until a
Cloudflare project is named** — it skips rather than failing, because a job that is
always red trains people to stop reading it.

The build happens in GitHub Actions rather than in Cloudflare's build image, so the Rust
toolchain is under our control. The dictionary artifacts and definition shards are
committed, so no build step reaches Hugging Face: publishing does not depend on a third
party being up.

To switch it on:

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

### After the first deploy, measure compression

The dictionary ships as `application/octet-stream`, and Cloudflare compresses by content
type. If it does not compress these, first load costs 2.3 MB instead of 755 KB. Check:

```bash
curl -sI -H 'Accept-Encoding: br, gzip' https://<your-site>/dict/manifest.json
```

Then fetch the `.bin` named in that manifest and look for `content-encoding`. If it is
absent, the fix is to serve the pre-built `.br` artifacts (already generated by
`dict:build`, currently unused) with an explicit `Content-Encoding: br` in `_headers`.
Cloudflare Pages does not do content negotiation on sibling files, so this has to be
explicit either way.

## License

MIT. English OpenList is MIT. Frequency data is from
[hermitdave/FrequencyWords][freq] (OpenSubtitles 2018, MIT).

[freq]: https://github.com/hermitdave/FrequencyWords
