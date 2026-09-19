# Greatest Hits runbook

How the dataset grows, what runs where, and what to do by hand.

## The pipeline

| Step | Command | What it does | Runs |
|---|---|---|---|
| fetch | `pnpm hits:fetch` | Yesterday's most-viewed Wikipedia articles, categorized through Wikidata, appended to `data/candidates.jsonl`, each placed one with `about` (a sentence from its item's English description) and `wikipedia`. No model. `--reclassify` asks Wikidata again about the unclassified ones after the category table has grown, finds items for manual candidates by their Wikipedia title, and writes what inputs are where they have no sentence ("What an input is" in `docs/OPERATOR.md`). | nightly Action · laptop |
| enumerate | `pnpm hits:enumerate --preset=routine` | `anagram batch` over the `new` candidates into `data/queue/<date>/raw.jsonl`, under a preset from `tools/hits/src/settings.ts` (`routine` nightly, `deep` for a deep run). It uses everyday (common-tier) words, allows words under three letters only from `tools/hits/src/short-words.txt`, and up to five words. It writes every spelling of each letter group and every result up to the preset's limit, then a sample and a search around each of the candidate's `anchors`. `summary.json` records the settings version. | nightly Action · laptop |
| prefilter | `pnpm hits:prefilter --per-input=N` | Keeps common-tier words, listed short words only, one to five words, no word twice, and never the input re-spaced. Puts each phrase in its best reading order and scores it. At most `--per-input` phrases per input go into `prefiltered.jsonl`, best-reading first. No model. A candidate that leaves nothing keepable moves to `enumerated` with a note, so it is not run again. | nightly Action · laptop |
| screen | `pnpm hits:screen` | Writes `screen-input-N.md` (each input's phrases numbered, at most 3,000 per file) and `screen-scores.txt`: the compact text the nightly commits. A Claude session answers every file into `screen-output.jsonl` with the numbers of the phrases that have any link to their input. | nightly Action writes · Claude routine answers · laptop |
| judge | `pnpm hits:judge` | For a screened queue, checks `screen-output.jsonl` against the screen input, refuses an input that keeps more than 12 phrases (`SCREEN_KEEP_CAP` in `guards.ts`; a deep run's queue is exempt), and rebuilds the kept phrases into `screened.jsonl`. Then writes `judge-input-N.md` for a Claude session to answer into `judge-output.jsonl`, each row listing its words with their first dictionary gloss, read off the definition shards without the engine. `--via=api` calls the Claude API for the judging instead. A queue with nothing to judge gets an empty answer, not an error. | Claude routine · laptop |
| ingest | `pnpm hits:ingest --model=… --judged-by=routine\|hand` | Refuses, before writing anything, a verdict file in which one justification, with the words it quotes masked, is on more than three verdicts (`REPEAT_CAP` in `guards.ts`). Validates the verdicts and re-checks the letters. Shelves rubric v2 verdicts: up to three `accepted` hits per input, up to five more qualifying rows as `proposed` alternates (`ALTERNATE_CAP`, counting the ones the input has), and near misses left in the verdicts; a phrase that reads 1 is a near miss at any relation. Records the model and `judged_by` on every judge entry and on each candidate's run. Rubric v1 verdicts from older queues become `proposed` at a total of 11. Keeps the judge's `about` for an input that has none and copies each input's sentence onto its hits. Writes the judge's `senses` onto a new hit, refusing a verdict whose senses name a word its phrase lacks and leaving off a sense that breaks the rule, and lists them under Senses. Moves candidates to `enumerated` and writes `ingest-report.md`. With `--only=id,… --status=accepted\|proposed` it writes only those rows from the queue's verdicts, past the shelves, for promoting a near miss, and changes neither the candidates nor the report. | Claude routine · laptop |
| set | `pnpm hits:set --status=accepted id…` | Changes the status of hits by id (`accepted`, `featured`, `proposed`, `retired`). Refuses an unknown id or status and writes nothing; otherwise rewrites `data/hits.jsonl` through the schema and prints each change. | a person · laptop |
| justify | `pnpm hits:justify id "…"` | Sets a hit's justification. Refuses an unknown id, an empty sentence or one over 300 characters, and writes nothing then. | a person · laptop |
| describe | `pnpm hits:describe candidate "…"` | Sets what an input is: the candidate's `about`, with `--wikidata=Q…` from its Wikidata item or `--wikipedia=` for its link, and the copy on each of its hits. Refuses an unknown id, a hit id, or a sentence over 200 characters or without a full stop, and writes nothing then. | a person · laptop |
| sense | `pnpm hits:sense id word "…"` | Sets the sense one of a hit's words reads in, shown first on Discover; `--clear` removes it. Only where the dictionary's first sense would not explain the reading. Refuses an unknown id, a word that is not the hit's, or a sentence over 120 characters or without a full stop, and writes nothing then. | a person · laptop |
| glosses | `pnpm hits:glosses` | Lists every published hit (every hit with `--all`), each word with its first dictionary gloss or `no definition` and any sense already set, to see where a sense is wanted. Writes nothing. | a person · laptop |
| tag | `pnpm hits:tag id +tag -tag` | Adds and removes a hit's tags. Refuses an unknown id or a tag the hit schema does not allow, and writes nothing then. | a person · laptop |
| order | `pnpm hits:order id word word…` | Sets the order a hit's words read in: its `words` and `display`. The id and letters stay the same. Refuses an unknown id or words that are not the hit's own, and writes nothing then. | a person · laptop |
| desk | `pnpm hits:desk` | Builds the review desk, one self-contained page in `.cache/desk/index.html`, from the hits, the candidates and the newest judged queues. It writes nothing to the repository; each decision in it, what an input is included, becomes one of these commands, and it fills `docs/prompts/apply-desk.md` with them. With `--audit` it builds the Greatest Hits audit into `.cache/desk/audit.html` instead: every published hit in its section, Greatest Hits, Interesting or A stretch, to move or remove. | a person · laptop |
| requeue | `pnpm hits:requeue --settings-before=s2 --dry-run` | Sends `enumerated` candidates back to `new` when their last run used older settings or an older rubric; also by category, source or id. An id that cannot be requeued is refused, and nothing is written. | a person · laptop |
| backfill | `pnpm hits:backfill --justifications=FILE` | One-off, 2026-09-13. Places every committed verdict on the shelves without judging again. Needs a justification for every published hit (`--draft=FILE` writes the list) and records a run per judged queue on each candidate. | a person · laptop |
| publish | `pnpm hits:publish` | Builds `dataset/` and pushes accepted and featured hits to Hugging Face. | publish Action · laptop |
| promotions:export | `pnpm promotions:export --counts --out=<dir>` | Reads the votes database (SELECT only, never the voter column), checks every promoted anagram's words with the engine, and writes the day's counts to `data/counts/<date>/` (votes by hit, promotions by the SHA-256 of their key, never words) and the full rows to `<dir>/export/<date>.jsonl` in the private repository. Prints totals only. | export Action · laptop |
| promotions:review | `pnpm promotions:review --from=<private dir>` | Picks the promoted anagrams not yet decided, most promoted first, up to 100, and writes `.cache/promotions/review-input-N.md` for a model. Waits while an earlier review is unmerged or today's export is missing. | Claude routine · laptop |
| promotions:ingest | `pnpm promotions:ingest --from=<private dir> --model=… --judged-by=…` | Checks the review's answers (the F0 guards included) and writes `reviews/<date>.jsonl` and `.md` in the private checkout, for a pull request there. A private person's anagram is kept as a code and a count. Refusals name codes only. | Claude routine · laptop |
| promotions:apply | `pnpm promotions:apply --from=<private dir>` | Publishes the reviews merged in the private repository: hits placed by the shelf rule, candidates, word requests, text-free lines in `data/promotions/decisions.jsonl`, and `data/promotions/reviews/<date>.md`. Applies each line once. | Claude routine · laptop |
| promotions:block | `pnpm promotions:block <key>` | Appends a promoted anagram's code to `data/promotions/blocks.jsonl`: the API refuses it and the pages hide its buttons. | a person · laptop |
| votes:convert | `pnpm votes:convert --remote` | Makes each promotion of a published anagram a vote, once per promotion row. | Deploy Action |

Nothing enters the published dataset without a person's merge. A hit is published when a person merges the pull request that makes it `accepted`: the routine's shelves, or `pnpm hits:set`. Greatest Hits (`featured`) changes only when the operator promotes a hit by name.

## Automation

- **Nightly Action** (`.github/workflows/hits-nightly.yml`): 06:00 UTC. fetch, enumerate (routine preset), prefilter, screen input; commits `data/queue/<date>/summary.json`, `screen-input-*.md`, `screen-scores.txt` and the updated `candidates.jsonl` to `main`; keeps `raw.jsonl` and `prefiltered.jsonl` as a 90-day artifact. A second run on the same UTC day writes `<date>b`, then `c`, so a folder that already holds a queue is never overwritten. Free on this public repository. Run it by hand from the Actions tab (*Run workflow*) with a smaller `limit` to try it, or a different `per_input`.
- **Judge routine** (`automation/judge-routine.md`): a Claude Code cloud routine at 07:00 UTC reads the newest unjudged queue that has a screen input and that `data/queue/EXCLUDED.md` does not name, screens it, judges what the screen kept, ingests, and opens `hits/<date>` as a pull request. It works in one session, never through subagents, and no program of its own keeps, scores or writes; when the checks refuse and it cannot answer again, or the queue is too large to read, it opens `hits/<date>-not-judged`, which adds a row to the ledger of excluded runs and nothing else ("A night that is refused" in `docs/OPERATOR.md`). A queue from before settings s2 has no screen input and is judged from its `prefiltered.jsonl`. It exists: [Judge the nightly queue](https://claude.ai/code/routines/trig_01VdomdgqWVjsNdo33BHQFNg), created 2026-09-12. The routine holds a copy of the prompt, so a change to the file has to be carried over to the routine (`/schedule`, Update); the settings are in the comment at the bottom of the file. The same prompt works as a local desktop scheduled task or pasted into a session.
- **The routine's first run** (2026-09-12, by hand): 300 rows judged, 300 valid verdicts, one proposed hit, pull request opened, eleven minutes. Three of those minutes went to building the engine in the sandbox, which the prompt now tells it not to do; ingest runs with `--no-engine-check` there.
- **A thin night** (the feed overlapped what was already tried, or the new inputs produced nothing keepable) leaves a queue folder with only `summary.json` (before settings s2, an empty `prefiltered.jsonl`). That is a record, not a failure: the routine skips it, and `pnpm hits:judge` on it writes an empty answer so `pnpm hits:ingest` can close it out by hand.
- **Deep runs** (a Claude Code session on a laptop, when the operator starts one): the deep preset over requeued or seeded candidates, one category at a time, screened by `claude-sonnet-5` subagents and judged by `claude-opus-5` subagents, with a pull request per category. "Run a deep run" in `docs/OPERATOR.md` sizes it; `docs/prompts/deep-run.md` is the prompt.
- **Publish Action** (`.github/workflows/publish-hits.yml`): on any push to `main` that touches `data/hits.jsonl`. Needs the `HF_TOKEN` secret (`gh secret set HF_TOKEN`). Set the repository variable `PUBLISH_HITS` to `off` to pause it.
- **Votes and promotions** (`apps/web/functions/api/`, Cloudflare Pages Functions over the D1 database `ars-magna-discoveries`): readers' votes on the Discover page, and their promotions from searches and submissions from Build. The Deploy Action applies `apps/web/migrations/` before it uploads the site, and after it makes the promotions of every published anagram votes (`pnpm votes:convert`). "Votes on Discover" in `docs/OPERATOR.md` has the switches, the queries and a local run.
- **Export promotions** (`.github/workflows/export-promotions.yml`): after each Hits nightly. Commits the day's counts to `main` (`data/counts/<date>/`, which CI and Deploy ignore) and pushes the full rows to the private repository `ars-magna-promotions` with `PROMOTIONS_DEPLOY_KEY`. `EXPORT_PROMOTIONS=off` pauses it.
- **The promotions review** runs in the judge routine after the queue, or in a session: the review is a pull request in the private repository, the operator's merge there approves it, and the next routine run applies it through its public pull request. "Review promotions" in `docs/OPERATOR.md` has the whole loop.

The CI and deploy workflows ignore `data/queue/**`, `data/candidates.jsonl` and `data/counts/**`, so a nightly or export commit does not rebuild or redeploy the site.

## Reviewing a pull request from the routine

1. Read the ingest report in the body. It lists the hits by shelf (Interesting, A stretch), each with its relation, reads, input, phrase and justification, then the alternates and the near misses. Merging accepts every shelved hit.
2. Check out the branch: `gh pr checkout <number>`.
3. Change only what you disagree with, by id:

   ```bash
   pnpm hits:set --status=featured <id>    # Greatest Hits
   pnpm hits:set --status=accepted <id>    # accept an alternate
   pnpm hits:set --status=proposed <id>    # hold back a shelved hit
   pnpm hits:set --status=retired <id>     # bury one for good
   ```

   The id is `input letters:category:words sorted and joined with -`, as in `data/hits.jsonl`. Each command prints what it changed.
4. Commit `data/hits.jsonl` on the branch if you changed it, push, and merge once CI is green. The publish Action pushes the new rows to Hugging Face and the deploy rebuilds the Discover page.

The review desk (`pnpm hits:desk`) shows the same queue with its near misses and alternates, and turns decisions into these commands; see "Review in the desk" in `docs/OPERATOR.md`.

Rude or offensive phrases are never scored down; they carry the tag `tone:rude`. The full review, with the prompt that does it, is in `docs/OPERATOR.md`.

## Doing it all by hand

```bash
pnpm hits:fetch                 # or skip, and add lines to data/candidates.jsonl yourself
pnpm hits:enumerate
pnpm hits:prefilter
pnpm hits:screen                # then answer screen-input-*.md into screen-output.jsonl in a Claude session
pnpm hits:judge                 # then answer judge-input-*.md into judge-output.jsonl in a Claude session
pnpm hits:ingest --model=claude-sonnet-5 --judged-by=hand
pnpm hits:publish               # after accepting hits and committing
```

`pnpm hits:judge --via=api` judges through the Claude API when `ANTHROPIC_API_KEY` is set, and adds a Grok column when `XAI_API_KEY` is set.

## Growing the category table

`pnpm hits:fetch` prints the Wikidata classes of the titles it could not place. Look each up (`https://www.wikidata.org/wiki/Q…`) and, if it belongs to a category, add it under that category in `tools/hits/src/classify/categories.json`. Events, concepts and the like stay out on purpose. Check the label of every QID you add: the table once said "sports team" against the item for "flight". Keep the `exclude` list to classes that are truly events; a broad one like "occurrence" is reached by online services, streaming platforms and film projects and would unclassify them all.

After the table grows, `pnpm hits:fetch --reclassify` asks Wikidata again about every unclassified candidate and moves the ones that now fit into their category as `new`, so the next night enumerates them. The same run finds the item of each manual candidate outside phrases by its English Wikipedia title (only an item in the candidate's own category), prints a one-item label match as a suggestion without writing it, and writes `about` and `wikipedia` for every placed candidate with an item and no sentence, copying them to the hits. `--dry-run` prints all of it and writes nothing.

## Secrets

Every secret and variable, what uses it, and how to rotate it: "Rotate a secret" in `docs/OPERATOR.md`.
