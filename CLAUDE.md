# Ars Magna — working notes for Claude

Ars Magna finds every multi-word anagram of a text (Rust engine → WASM → React), and the
Greatest Hits pipeline turns that into a curated dataset of the funniest, most apt anagrams.

## Rules that never change

- **Never modify the English OpenList (EOL) or CEOL repositories, datasets, or directories
  anywhere on this machine.** Dictionary inputs change only through `tools/dict-build/src/pins.ts`
  and `tiers.ts`, and a rebuilt dictionary is committed with `[dict]` in the message so CI verifies it.
- Nothing enters the published dataset without a person: hits are `proposed` until someone sets
  `accepted` or `featured` in `data/hits.jsonl` and merges.
- Commits end with `Co-Authored-By: Claude <model> <noreply@anthropic.com>`; the author email must
  be the GitHub no-reply address (`192532973+ryanjosephkamp@users.noreply.github.com`) or the push
  is rejected.
- Do not push unless asked. Do not create cloud routines; that is an interactive step for the user.

## Layout

| Path | What |
|---|---|
| `crates/anagram-core` | the search (rarest-letter runs, memoized counting, unranking, `Cursor`) |
| `crates/anagram-cli` | `anagram solve|count|bench|batch|check` |
| `packages/engine` | worker protocol, `fold.ts` (accent folding), `node.ts` (engine under Node), `definitions.ts` |
| `packages/mcp` | MCP server (stdio): solve, count, nth, explain_word, propose_hit |
| `apps/web` | the site; `hits.html` is the Greatest Hits gallery, built from `data/hits.jsonl` |
| `apps/web/src/lib` | pure modules the components lean on: `orderings.ts`, `chosen.ts` (the order a reader picked), `share.ts` (post and card texts), `urlState.ts`, `resultView.ts`, `exporters.ts` |
| `tools/dict-build` | pinned fetch (Hub, then the `openlist-368bf0e4` release), tiers, artifacts |
| `tools/hits` | fetch → enumerate → prefilter → judge → ingest → publish |
| `data/` | `candidates.jsonl`, `hits.jsonl`, `schema/`, `queue/<date>/` |
| `automation/` | `judge-routine.md` (the routine's prompt) and `RUNBOOK.md` |
| `docs/screenshots/` | images a pull request body links to, by raw URL at that commit |

## Commands

```
pnpm install && pnpm wasm:build      # once; the WASM output is gitignored
cargo test --release --workspace     # Rust: unit, golden, oracle, bench gate, CLI
pnpm typecheck && pnpm test          # TypeScript, all packages
pnpm build                           # both pages; runs apps/web/scripts/build-hits.ts first
pnpm hits:fetch | enumerate | prefilter | judge | ingest --model=… | publish
pnpm hits:fetch --reclassify        # ask Wikidata again about the unclassified candidates
```

`pnpm dict:fetch && pnpm dict:build` needs ~330 MB into `.cache/`; `dict:verify` checks the
committed artifacts. The Hub revision is gone; the fetch falls back to the GitHub release.

## Where things are

- Live site: https://ars-magna.pages.dev (Cloudflare Pages, deploy on push to `main`).
- Dataset: https://huggingface.co/datasets/ryanjosephkamp/ars-magna-greatest-hits
- Plan for the Greatest Hits build: `~/.claude/plans/flickering-sprouting-scott.md`.
  Phases A–I shipped; J (choose the word order) and K (share) shipped; J–M were added to the
  bottom of that file on 2026-09-12 and L and M are still to do.
- Session memory: `~/.claude/projects/-Users-noir-Documents-ars-magna/memory/`.
- The judge routine exists and runs itself: "Judge the nightly queue", daily at 07:00 UTC,
  https://claude.ai/code/routines/trig_01VdomdgqWVjsNdo33BHQFNg. Its prompt is a **copy** of
  `automation/judge-routine.md`; editing that file does not change the routine, so carry any
  change over (the `/schedule` skill, or the remote-trigger API with that id).
- Product brief, voice and anti-references: `PRODUCT.md`. Read it before touching the interface.

## How work is delivered

Branch off `main`, never push to `main`. Before opening a pull request run all four:
`cargo test --release --workspace`, `pnpm typecheck`, `pnpm test`, `pnpm build`. Verify anything
the browser can show on the dev server rather than asking a person to look. Write the pull
request body in plain language, bind it, report CI, and stop for review.
