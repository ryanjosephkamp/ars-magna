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

[eol]: https://huggingface.co/datasets/ryanjosephkamp/english-openlist

## Development

```bash
pnpm install
pnpm dict:fetch     # download pinned sources into .cache/ (~315 MB, once)
pnpm dict:build     # emit apps/web/public/dict/ artifacts
pnpm wasm:build     # compile the Rust engine to WASM
pnpm dev
```

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

## License

MIT. English OpenList is MIT. Frequency data is from
[hermitdave/FrequencyWords][freq] (OpenSubtitles 2018, MIT).

[freq]: https://github.com/hermitdave/FrequencyWords
