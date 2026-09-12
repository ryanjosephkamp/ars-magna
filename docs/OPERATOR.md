# Ars Magna Operator Manual

What the operator does, one section per job. Each section says when it applies, gives the steps, and
names the prompt in `docs/prompts/` that has an agent do the job. To use a prompt, open an agent session
in the repository, paste the text below the line in the prompt file, and replace its placeholders: bare
words such as hit_input. `AGENTS.md` holds the rules every agent follows; `automation/RUNBOOK.md`
explains the pipeline these jobs sit on.

## What runs on its own

| When (UTC) | What | Leaves behind |
|---|---|---|
| 06:00 daily | Hits nightly Action | a commit to `main` with `data/queue/<date>/` and `data/candidates.jsonl` |
| 07:00 daily | Judge routine (Claude Code, `claude-sonnet-5`) | a `Greatest Hits: N new for <date>` pull request, or nothing after a thin night |
| every merge to `main` | CI and Deploy | the site at https://ars-magna.pages.dev |
| a merge that changes `data/hits.jsonl` | Publish hits Action | the dataset at https://huggingface.co/datasets/ryanjosephkamp/ars-magna-greatest-hits |

A nightly commit touches only the queue and the candidates, so it runs neither CI nor Deploy.

## Add a hit by hand

When you know an anagram that belongs in the dataset.

1. Check it, starting at the narrowest tier. It prints `ok`, or `no:` and the reason:

   ```bash
   cargo run --release -p anagram-cli -- check "Dormitory" "dirty room" --tier=common
   ```

   If a word is missing, try `--tier=standard`, then `--tier=full`; the narrowest tier that passes is the
   hit's tier. If the letters differ, it is not an anagram.
2. On a branch off `main`, record it as a proposed hit. In a session with the MCP server (Claude Code in
   this repository, or Codex set up as `docs/BOOTSTRAP.md` describes), call `propose_hit` with the input,
   the category, the words in reading order, and the tier; it checks again, then adds the candidate and
   the hit. Without the MCP server, open a "Submit an anagram" issue on GitHub; when the validator labels
   it `submission:valid`, run `pnpm hits:ingest --from-issue=<issue number>`.
3. Accept it by id. The id is the input's letters, the category, and the words sorted and joined with `-`:

   ```bash
   pnpm hits:set --status=accepted dormitory:phrases:dirty-room
   ```

4. Run the four suites (`pnpm test` validates every line of both data files), commit, push, and open a
   pull request. Merge when CI is green; Publish hits and Deploy take it from there.

Prompt: `docs/prompts/add-hit.md` (hit_input, hit_phrase, hit_category).

## Review a routine pull request

When a pull request titled `Greatest Hits: N new for <date>` appears. The routine opens one after it
judges a non-empty queue, even when N is zero.

1. Read the ingest report in the body: for each proposed hit, its total out of 15, the input, the phrase,
   and the judge's one-line rationale. A rationale that starts with `sensitive` means the judge saw
   something rude or aimed at a real person; look before accepting it.
2. Decide each hit:

   | Status | Means |
   |---|---|
   | `accepted` | in the dataset and the gallery |
   | `featured` | accepted, listed first in the gallery, and the pool the anagram of the day draws from |
   | `proposed` | left as it is; in neither |
   | `retired` | buried for good; the id stays in the file, so ingest never proposes it again |

3. Check out the branch and set the hits, one command per status:

   ```bash
   gh pr checkout <number>
   pnpm hits:set --status=accepted <id> <id>
   pnpm hits:set --status=featured <id>
   ```

   Each command prints what it changed. An unknown id or status is refused and nothing is written.
4. Commit `data/hits.jsonl` on the branch, push, and merge when CI is green. A pull request with N of zero
   has nothing to set; merge it so the judged queue stays in the record.
5. Verify the release: the gallery and the dataset show the new hits.

Prompt: `docs/prompts/review-hits-pr.md` (pr_number). The agent lists and recommends first, then waits
for your ids and statuses.

## Judge a queue by hand

When the routine is paused, a run failed, or you want a queue judged now. The routine's instructions work
on a laptop, with the engine check turned back on.

1. Find the newest queue that has rows and no answers yet:

   ```bash
   wc -l data/queue/*/prefiltered.jsonl
   ls data/queue/*/judge-output.jsonl
   ```

2. `pnpm hits:judge --date=<folder>` writes `judge-input-N.md` files into the folder: the rubric, then the
   candidates.
3. Have a Claude session answer every file into `judge-output.jsonl`, one JSON line per candidate. With
   `ANTHROPIC_API_KEY` set in your shell, `pnpm hits:judge --date=<folder> --via=api` writes the answers
   through the API instead.
4. `pnpm hits:ingest --date=<folder> --model=<the model that judged>` re-checks every phrase with the
   engine, writes the proposed hits, and writes `ingest-report.md`.
5. Commit on a branch named `hits/<folder>` exactly as step 5 of `automation/judge-routine.md` lists, open
   the pull request, and review it as above.

Prompt: `docs/prompts/judge-queue.md`.

## A thin night

A thin night is a nightly run that commits an empty queue: its `prefiltered.jsonl` has no lines. It is a
record, not a failure. The routine skips an empty folder and opens no pull request, so a morning with no
pull request is what a thin night looks like.

The nightly's log says which of two cases it was:

| Case | Fetch line | What it means |
|---|---|---|
| Nothing new | `0 new candidates` | every title the fetch considered is already in `data/candidates.jsonl` |
| Nothing keepable | some new candidates, then `0 kept for the judge` | the new inputs made only word salad; the prefilter moved them to `enumerated` with a note |

**2026-09-12 was the first case.** The 06:15 run considered 150 titles (87 junk skipped) and found
0 new candidates, so it committed the empty folder `2026-09-12b`. The routine skipped that folder at 07:05
and stopped in 19 seconds. All 328 candidates were `enumerated` (295) or `unclassified` (33); none was
`new`.

To see it for yourself:

```bash
gh run list --workflow=hits-nightly.yml --limit 3
gh run view <run id> --log | grep -E 'titles considered|kept for the judge'
node -e 'const c={};for(const l of require("fs").readFileSync("data/candidates.jsonl","utf8").split("\n").filter(Boolean)){const s=JSON.parse(l).status;c[s]=(c[s]||0)+1}console.log(c)'
```

What to do:

- **One thin night:** nothing. Leave the folder; it is that night's record.
- **Nothing keepable:** nothing. The candidates are already marked, so they are not run again.
- **Nothing new, night after night:** the candidate pool is dry, and every night will be thin until new
  inputs arrive. Three remedies exist today:
  - Seed a batch by hand, the chosen supply for now: append about forty lines to
    `data/candidates.jsonl` in a pull request, weighted toward phrases, titles, products and places.
    After it merges, and before the next 06:00 UTC run, run Hits nightly by hand from the Actions tab
    with `max_rows` set to 800, so each candidate gets about twenty rows, as the 2026-09-11 batch did.
    Left to the scheduled run, forty candidates share 300 rows.
  - Grow the category table and run `pnpm hits:fetch --reclassify`, which moves unclassified candidates
    that now fit to `new` ("Growing the category table" in `automation/RUNBOOK.md`).
  - Run Hits nightly by hand from the Actions tab with a larger `limit`. `limit` is how many of the day's
    top titles are considered (150 by default, of about 1,000 in the feed) before they are checked
    against the pool.

A seeded candidate is one line:

```json
{"id":"sagradafamilia:places","input":"Sagrada Família","category":"places","source":"manual","first_seen":"2026-09-12","status":"new"}
```

The id is the input's letters (lowercase, accents folded, nothing else), a colon, and the category.
`pnpm test` fails on an id that does not match.

Prompt: `docs/prompts/thin-night.md`. It diagnoses and recommends; it changes nothing.

## Ship a feature

When you want the site or its tooling to do something new.

1. Write the change as what a reader or operator should be able to do when it ships, not how to build it.
2. Paste the prompt. The agent follows "How work is delivered" in `AGENTS.md` and stops at an open pull
   request with CI reported.
3. Review the pull request: its body, its diff, and CI. There are no preview deploys; to see it running,
   `gh pr checkout <number>` and `pnpm dev`.
4. Merge. Deploy publishes `main` in about a minute. Then verify the release.

If the change alters how the site is operated, the same pull request updates this manual.

Prompt: `docs/prompts/ship-feature.md` (feature_description).

## Verify a release

After any merge to `main`. Every check reads; none changes anything.

1. The merge's runs passed. CI and Deploy run on every merge; Publish hits only when `data/hits.jsonl`
   changed:

   ```bash
   gh run list --branch main --limit 6
   ```

2. The site serves the new build. `generated` is later than the merge, and the count equals the accepted
   and featured lines in `data/hits.jsonl`:

   ```bash
   curl -s https://ars-magna.pages.dev/hits.json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);console.log(j.generated,j.hits.length)})'
   grep -cE '"status":"(accepted|featured)"' data/hits.jsonl
   ```

3. The dictionary still arrives compressed. The last line reads `content-encoding: br`:

   ```bash
   N=$(curl -s https://ars-magna.pages.dev/dict/manifest.json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).files.full.name))')
   curl -sI -H 'Accept-Encoding: br' "https://ars-magna.pages.dev/dict/$N.br" | grep -i content-encoding
   ```

4. If hits changed, the dataset has them. The line count equals the count in step 2:

   ```bash
   curl -sL https://huggingface.co/datasets/ryanjosephkamp/ars-magna-greatest-hits/resolve/main/all.jsonl | wc -l
   ```

5. In a browser, search for `dormitory` at https://ars-magna.pages.dev, then open
   https://ars-magna.pages.dev/hits. A browser that has visited before may show the previous version until
   it reloads once more.

On 2026-09-12, after #8: CI and Deploy passed, `hits.json` held 10 hits against 10 accepted and featured
lines, the dictionary came back as `content-encoding: br`, and `all.jsonl` had 10 lines.

Prompt: `docs/prompts/verify-release.md` (pr_number).

## Manage the judge routine

| | |
|---|---|
| Name | Judge the nightly queue |
| Id | `trig_01VdomdgqWVjsNdo33BHQFNg` |
| Page | https://claude.ai/code/routines/trig_01VdomdgqWVjsNdo33BHQFNg |
| Schedule | daily at 07:00 UTC (`0 7 * * *`), an hour after the nightly |
| Model | `claude-sonnet-5` |
| Tools | Bash, Read, Write, Edit, Glob, Grep |
| Repository | https://github.com/ryanjosephkamp/ars-magna |
| Prompt | a copy of `automation/judge-routine.md` above its closing comment |

**The routine's prompt is a copy.** Editing `automation/judge-routine.md` does not change what the routine
does. The file is the reviewed source; the routine runs whatever was last carried over to it.

### See what it did

Open the routine's page and choose a run. In Claude Code, the remote-trigger tool's `list_runs` and
`get_run_log` return the same log.

### Update the routine

1. Change `automation/judge-routine.md` in a pull request, and merge it.
2. Carry it over: in Claude Code run `/schedule` and choose Update, or edit the prompt on the routine's
   page. The new prompt is the file's text above `<!--`, and nothing else.
3. Read the routine back and check that its prompt matches the file.

Prompt: `docs/prompts/update-routine.md`. Claude Code only.

### Pause and resume

Turn the routine off on its page, or use `docs/prompts/pause-routine.md`; it keeps its settings and its
history. While it is off the nightly still commits queues. When it is back on, a run judges only the
newest unjudged queue, so judge any older ones by hand.

The rest of the automation pauses separately:

```bash
gh workflow disable "Hits nightly"         # gh workflow enable "Hits nightly" resumes it
gh variable set PUBLISH_HITS --body off    # gh variable delete PUBLISH_HITS resumes it
```

## Rotate a secret

A secret's value goes from the provider into `gh secret set`, which prompts for it, and nowhere else: not a
chat, a file, or a shell history. No agent reads one.

| Name | Kind | Used by | A new one comes from |
|---|---|---|---|
| `HF_TOKEN` | repository secret | Publish hits, `pnpm hits:publish` | Hugging Face, Settings, Access Tokens, with write access to the dataset |
| `CLOUDFLARE_API_TOKEN` | repository secret | Deploy | Cloudflare, My Profile, API Tokens, with Cloudflare Pages: Edit |
| `CLOUDFLARE_ACCOUNT_ID` | repository secret | Deploy | the Cloudflare dashboard sidebar; it changes only with the account |
| `ANTHROPIC_API_KEY` | your shell only | `hits:judge --via=api`, `hits:fetch --classify-with-haiku` | the Claude Console |
| `XAI_API_KEY` | your shell only | the second judge column in `hits:judge --via=api` | the xAI console |
| `CLOUDFLARE_PROJECT_NAME` | repository variable, `ars-magna` | Deploy's on switch | not a secret |
| `PUBLISH_HITS` | repository variable, unset | `off` pauses Publish hits | not a secret |

The nightly Action and the submission validator use GitHub's built-in token, and the judge routine bills
to the Claude plan; neither has anything to rotate.

1. Create the new token at the provider. Leave the old one working for now.
2. Set it; the command prompts for the value:

   ```bash
   gh secret set HF_TOKEN
   ```

3. Run the workflow that uses it and wait for it to pass. Publishing the same hits again uploads nothing
   new, and redeploying `main` changes nothing a reader sees:

   ```bash
   gh workflow run "Publish hits"    # after HF_TOKEN
   gh workflow run Deploy            # after a Cloudflare secret
   gh run list --limit 3
   ```

4. Revoke the old token at the provider.

Prompt: `docs/prompts/rotate-secret.md`, after step 2. It runs step 3 and reports.

## Bootstrap in another harness

When an agent other than Claude Code should work here, or Claude Code on another machine.

1. Clone the repository and open the harness in it.
2. Paste the prompt from `docs/BOOTSTRAP.md` with task_description replaced. The agent reads
   `AGENTS.md`, sets up, runs the four suites, and takes the task only when all four are green.
3. For the MCP server: Claude Code gets it from `.mcp.json`; Codex needs the `config.toml` entry in
   `docs/BOOTSTRAP.md`; Grok Build's conventions are unverified, and noted there.

Only Claude Code has the judge routine, the artifact this manual is published as, and the plan and memory
files. Everything else is git, pnpm, cargo and gh, and works in any harness.

Prompt: `docs/BOOTSTRAP.md` (task_description).

## Update this manual and republish it

When a pull request changes how the site is operated: a command, a workflow, a schedule, a secret, the
routine's prompt, a review step, or a prompt template. `AGENTS.md` requires this manual to change in that
same pull request.

1. Edit the section the change touches, and its template in `docs/prompts/` if the wording changes. Keep
   placeholders as bare lowercase words joined by underscores, so one double-tap on a phone selects a
   whole placeholder.
2. Run the four suites and open the pull request as usual.
3. After it merges, republish from Claude Code: rebuild the page from this file and `docs/prompts/` on
   `main`, and publish it to the URL below, titled "Ars Magna Operator Manual". Publishing to that URL
   keeps the link; publishing without it makes a separate page.
4. If the URL ever changes, record the new one here and in `CLAUDE.md`.

The manual's artifact: https://claude.ai/code/artifact/e9d6ddc9-1c1b-4901-8341-7923708c416c

Prompt: `docs/prompts/update-manual.md` (task_description).
