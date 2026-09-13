# Ars Magna

Ars Magna finds every multi-word anagram of a text (Rust engine → WASM → React), and the Greatest Hits
pipeline turns that into a curated dataset of the funniest, most apt anagrams. Live at
https://ars-magna.pages.dev; dataset at https://huggingface.co/datasets/ryanjosephkamp/ars-magna-greatest-hits.

This file is the canon for every agent in every harness. A harness's own file (`CLAUDE.md` for Claude
Code) adds only what is specific to that harness and never restates a rule from here.

## Rules that never change

- **Never modify the English OpenList (EOL) or CEOL repositories, datasets, or directories anywhere on
  this machine.** Dictionary inputs change only through `tools/dict-build/src/pins.ts` and `tiers.ts`,
  and a rebuilt dictionary is committed with `[dict]` in the message so CI verifies it.
- Nothing enters the published dataset without a person's merge. A hit is published when a person
  merges the pull request that makes it `accepted`, whether the judge routine shelved it or
  `pnpm hits:set` set it. Greatest Hits (`featured`) changes only when the operator promotes a hit by
  name. An agent runs `hits:set`, `hits:justify` and `hits:tag` only on the ids, statuses, sentences and
  tags the operator named, whether in a message or in a prompt the review desk filled.
- The commit author email is the GitHub no-reply address
  `192532973+ryanjosephkamp@users.noreply.github.com`; GitHub rejects a push authored by any other. An
  agent's commits end with a `Co-Authored-By:` trailer naming the agent and its model.
- Anything a reader sees follows `PRODUCT.md`: exact copy, no exclamation marks, no emoji, no tile
  graphics. Read it before touching the interface.
- A pull request that changes how the site is operated (a command, a workflow, a schedule, a secret,
  the judge routine's prompt, a review step, a prompt template) updates `docs/OPERATOR.md`, and
  `docs/prompts/` where a template changes, in the same pull request.

## Layout

| Path | What |
|---|---|
| `crates/anagram-core` | the search (rarest-letter runs, memoized counting, unranking, `Cursor`) |
| `crates/anagram-cli` | `anagram solve\|count\|bench\|batch\|check` |
| `packages/engine` | worker protocol, `fold.ts` (accent folding), `node.ts` (engine under Node), `definitions.ts` |
| `packages/mcp` | MCP server (stdio): solve, count, nth, explain_word, propose_hit |
| `apps/web` | the site; `hits.html` is the Greatest Hits gallery, built from `data/hits.jsonl` |
| `apps/web/src/lib` | pure modules the components lean on: `orderings.ts`, `chosen.ts`, `share.ts`, `urlState.ts`, `resultView.ts`, `exporters.ts` |
| `tools/dict-build` | pinned fetch (Hub, then the `openlist-368bf0e4` release), tiers, artifacts |
| `tools/hits` | fetch → enumerate → prefilter → screen → judge → ingest → set → publish |
| `tools/hits/src/desk`, `tools/hits/templates/desk.html` | the review desk: `pnpm hits:desk` builds it into `.cache/desk/index.html` |
| `data/` | `candidates.jsonl`, `hits.jsonl`, `schema/`, `queue/<date>/` |
| `automation/` | `judge-routine.md` (the judge's instructions) and `RUNBOOK.md` (the pipeline) |
| `docs/OPERATOR.md` | the operator manual: one section per workflow, each with its prompt |
| `docs/prompts/` | the prompt templates the manual names, with bare placeholders like `hit_input` |
| `docs/BOOTSTRAP.md` | the prompt that starts an agent here in any harness |
| `docs/screenshots/` | images a pull request body links to, by raw URL at that commit |

## Commands

```
pnpm install && pnpm wasm:build      # once per clone; the WASM output is gitignored
cargo test --release --workspace     # Rust: unit, golden, oracle, bench gate, CLI
pnpm typecheck                       # TypeScript, all packages
pnpm test                            # vitest, all packages
pnpm build                           # both pages; runs apps/web/scripts/build-hits.ts first
pnpm dev                             # the site at http://localhost:5173
pnpm hits:fetch | enumerate | prefilter | screen | judge | ingest --model=… | publish
pnpm hits:fetch --reclassify         # ask Wikidata again about the unclassified candidates
pnpm hits:set --status=accepted|featured|proposed|retired id…
pnpm hits:justify id "One plain sentence."   # set a hit's justification
pnpm hits:tag id +tone:pun -subject:actor     # add and remove a hit's tags
pnpm hits:desk                                # build the review desk into .cache/desk/index.html
pnpm hits:requeue --settings-before=s2 --dry-run   # send older candidates back to new
cargo run --release -p anagram-cli -- check "Dormitory" "dirty room" --tier=common
```

The last four of the first five lines are **the four suites**. `pnpm dict:fetch && pnpm dict:build`
needs ~330 MB into `.cache/`; `dict:verify` checks the committed artifacts.

## How work is delivered

1. Branch off an up-to-date `main`, named for the change.
2. Make the change. When it shows in a browser, run `pnpm dev` and verify it there yourself.
3. Run the four suites. All four are green before a pull request exists.
4. Commit with the no-reply author email and push the branch.
5. Open a pull request against `main` with a plain-language body: what changed, why, and how it was
   verified.
6. Report the pull request's CI and stop. A person reviews and merges.

## What an agent never does

- Push to `main`, merge a pull request, or rewrite a branch someone else pushed.
- Edit `data/hits.jsonl` by hand, or change an existing line of `data/candidates.jsonl`. The tools
  write them: `hits:ingest`, `hits:set`, `hits:justify`, `hits:tag`, `hits:fetch`, and the MCP tool
  `propose_hit`. Appending new
  `manual` candidates by hand is allowed.
- Create, change, pause or delete a schedule (the Actions crons, the judge routine, a scheduled task)
  unless the task asks for exactly that.
- Read, print, store or ask for a secret's value. A person sets secrets with `gh secret set`, which
  prompts for the value.

## Where to read more

- `docs/OPERATOR.md`: adding or reviewing hits, the review desk, judging by hand, a thin night, a deep run, a release, the judge
  routine, a secret.
- `automation/RUNBOOK.md`: the Greatest Hits pipeline, its Actions, and the category table.
- `automation/judge-routine.md`: judging a queue.
- `PRODUCT.md`: the interface's users, voice and anti-references.
