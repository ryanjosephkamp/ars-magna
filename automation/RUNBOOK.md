# Greatest Hits runbook

How the dataset grows, what runs where, and what to do by hand.

## The pipeline

| Step | Command | What it does | Runs |
|---|---|---|---|
| fetch | `pnpm hits:fetch` | Yesterday's most-viewed Wikipedia articles, categorized through Wikidata, appended to `data/candidates.jsonl`. No model. `--reclassify` asks Wikidata again about the unclassified ones after the category table has grown. | nightly Action · laptop |
| enumerate | `pnpm hits:enumerate` | `anagram batch` over the `new` candidates into `data/queue/<date>/raw.jsonl`. | nightly Action · laptop |
| prefilter | `pnpm hits:prefilter` | Everyday words only, one to four of them, best reading order, scored; the best 300 into `prefiltered.jsonl`. No model. A candidate that leaves nothing keepable moves to `enumerated` with a note, so it is not run again. | nightly Action · laptop |
| judge | `pnpm hits:judge` | Writes `judge-input-N.md` for a Claude session to answer into `judge-output.jsonl`. `--via=api` calls the Claude API instead. An empty queue gets an empty answer, not an error. | Claude routine · laptop |
| ingest | `pnpm hits:ingest --model=…` | Validates the verdicts, re-checks the letters, writes proposed hits, moves candidates to `enumerated`, writes `ingest-report.md`. | Claude routine · laptop |
| publish | `pnpm hits:publish` | Builds `dataset/` and pushes accepted and featured hits to Hugging Face. | publish Action · laptop |

Nothing enters the published dataset without a person changing a hit's `status` from `proposed` to `accepted` (or `featured`) in `data/hits.jsonl` and merging that to `main`.

## Automation

- **Nightly Action** (`.github/workflows/hits-nightly.yml`): 06:00 UTC. fetch, enumerate, prefilter; commits `data/queue/<date>/prefiltered.jsonl`, `summary.json` and the updated `candidates.jsonl` to `main`; keeps `raw.jsonl` as a 90-day artifact. A second run on the same UTC day writes `<date>b`, then `c`, so a folder that already holds a queue is never overwritten. Free on this public repository. Run it by hand from the Actions tab (*Run workflow*) with a smaller `limit` to try it.
- **Judge routine** (`automation/judge-routine.md`): a Claude Code cloud routine at 07:00 UTC reads the newest unjudged, non-empty queue, judges it, ingests, and opens `hits/<date>` as a pull request. It exists: [Judge the nightly queue](https://claude.ai/code/routines/trig_01VdomdgqWVjsNdo33BHQFNg), created 2026-09-12. The routine holds a copy of the prompt, so a change to the file has to be carried over to the routine (`/schedule`, Update); the settings are in the comment at the bottom of the file. The same prompt works as a local desktop scheduled task or pasted into a session.
- **The routine's first run** (2026-09-12, by hand): 300 rows judged, 300 valid verdicts, one proposed hit, pull request opened, eleven minutes. Three of those minutes went to building the engine in the sandbox, which the prompt now tells it not to do; ingest runs with `--no-engine-check` there.
- **A thin night** (the feed overlapped what was already tried, or the new inputs produced nothing keepable) leaves a queue folder with an empty `prefiltered.jsonl`. That is a record, not a failure: the routine skips it, and `pnpm hits:judge` on it writes an empty answer so `pnpm hits:ingest` can close it out by hand.
- **Publish Action** (`.github/workflows/publish-hits.yml`): on any push to `main` that touches `data/hits.jsonl`. Needs the `HF_TOKEN` secret (`gh secret set HF_TOKEN`). Set the repository variable `PUBLISH_HITS` to `off` to pause it.

The CI and deploy workflows ignore `data/queue/**` and `data/candidates.jsonl`, so a nightly commit does not rebuild or redeploy the site.

## Reviewing a pull request from the routine

1. Read the ingest report in the body. Each proposed hit shows its total, the input, the phrase and the judge's one-line rationale.
2. For each hit worth keeping, edit its line in `data/hits.jsonl`: `"status":"proposed"` → `"status":"accepted"` (or `"featured"`). Leave the rest as `proposed`, or set `retired` to bury one for good.
3. Merge. The publish Action pushes the new rows to Hugging Face.

A rationale that starts with `sensitive` means the judge saw something rude or aimed at a real person; look before accepting.

## Doing it all by hand

```bash
pnpm hits:fetch                 # or skip, and add lines to data/candidates.jsonl yourself
pnpm hits:enumerate
pnpm hits:prefilter
pnpm hits:judge                 # then answer judge-input-*.md into judge-output.jsonl in a Claude session
pnpm hits:ingest --model=claude-sonnet-5
pnpm hits:publish               # after accepting hits and committing
```

`pnpm hits:judge --via=api` judges through the Claude API when `ANTHROPIC_API_KEY` is set, and adds a Grok column when `XAI_API_KEY` is set.

## Growing the category table

`pnpm hits:fetch` prints the Wikidata classes of the titles it could not place. Look each up (`https://www.wikidata.org/wiki/Q…`) and, if it belongs to a category, add it under that category in `tools/hits/src/classify/categories.json`. Events, concepts and the like stay out on purpose. Check the label of every QID you add: the table once said "sports team" against the item for "flight". Keep the `exclude` list to classes that are truly events; a broad one like "occurrence" is reached by online services, streaming platforms and film projects and would unclassify them all.

After the table grows, `pnpm hits:fetch --reclassify` asks Wikidata again about every unclassified candidate and moves the ones that now fit into their category as `new`, so the next night enumerates them.

## Secrets

| Name | Used by | Needed |
|---|---|---|
| `HF_TOKEN` | publish Action, `pnpm hits:publish` | yes, for publishing |
| `ANTHROPIC_API_KEY` | `hits:judge --via=api`, `hits:fetch --classify-with-haiku` | optional |
| `XAI_API_KEY` | `hits:judge --via=api` second column | optional |

The nightly Action and the submission validator use the default `GITHUB_TOKEN`.
