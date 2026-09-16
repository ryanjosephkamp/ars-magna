# Ars Magna Operator Manual

What the operator does, one section per job. Each section says when it applies, gives the steps, and
names the prompt in `docs/prompts/` that has an agent do the job. To use a prompt, open an agent session
in the repository, paste the text below the line in the prompt file, and replace its placeholders: bare
words such as hit_input. `AGENTS.md` holds the rules every agent follows; `automation/RUNBOOK.md`
explains the pipeline these jobs sit on.

## What runs on its own

| When (UTC) | What | Leaves behind |
|---|---|---|
| 06:00 daily | Hits nightly Action | a commit to `main` with `data/queue/<date>/` (the summary and the screen input) and `data/candidates.jsonl` |
| 07:00 daily | Judge routine (Claude Code, `claude-sonnet-5`) | a `Greatest Hits: N new for <date>` pull request, or nothing after a thin night |
| every merge to `main` | CI and Deploy | the site at https://ars-magna.pages.dev, after Deploy applies any new votes database migration |
| a merge that changes `data/hits.jsonl` | Publish hits Action | the dataset at https://huggingface.co/datasets/ryanjosephkamp/ars-magna-greatest-hits |

A nightly commit touches only the queue and the candidates, so it runs neither CI nor Deploy.

## Add a hit by hand

When you know an anagram that belongs in the dataset.

1. Check it, starting at the narrowest tier. It prints `ok`, or `no:` and the reason:

   ```bash
   cargo run --release -p anagram-cli -- check "Dormitory" "dirty room" --tier=common
   ```

   If a word is missing, try `--tier=standard`, then `--tier=full`, then `--tier=extended`, which adds
   the site's own words to the pinned list; the narrowest tier that passes is the hit's tier. If the
   letters differ, it is not an anagram. A word missing even at Extended is a word request: see "Add a
   word to the vocabulary".
2. On a branch off `main`, record it as a proposed hit. In a session with the MCP server (Claude Code in
   this repository, or Codex set up as `docs/BOOTSTRAP.md` describes), call `propose_hit` with the input,
   the category, the words in reading order, the tier, and a `justification`: one plain sentence
   explaining the link for a reader. It checks again, then adds the candidate and the hit. Without the MCP server, open a "Submit an anagram" issue on GitHub; when the validator labels
   it `submission:valid`, run `pnpm hits:ingest --from-issue=<issue number>`.
3. Accept it by id. The id is the input's letters, the category, and the words sorted and joined with `-`:

   ```bash
   pnpm hits:set --status=accepted dormitory:phrases:dirty-room
   ```

4. Run the four suites (`pnpm test` validates every line of both data files), commit, push, and open a
   pull request. Merge when CI is green; Publish hits and Deploy take it from there.

Prompt: `docs/prompts/add-hit.md` (hit_input, hit_phrase, hit_category). The review desk's "Add a hit"
tab writes the same steps as commands.

## Add a word to the vocabulary

When a word a reader would expect is missing from English OpenList, and an anagram depends on it.
The site's vocabulary is the pinned list plus `data/vocabulary/additions.jsonl`, and every addition
is public: the word, what it means, and where it is attested.

**What may be added.** A gloss — one sentence a reader can read — and a public trace: a Wiktionary
or Urban Dictionary entry, a citation, or an explicit note saying the word is a coinage. Never a
private person's name. The list is capped at 2,000 words; if it ever approaches that, the question
has become whether to move the pin instead. No tool admits a word: the routine and the Submit page
propose, and a word joins the dictionary when you merge the pull request that adds it.

1. Propose it. The command appends one line through the schema and refuses a word the pinned list
   already has:

   ```bash
   pnpm vocab:add doomer --kind=slang --gloss="A person who believes catastrophe is inevitable." --trace=https://en.wiktionary.org/wiki/doomer
   ```

   `--kind` is one of `slang`, `coinage`, `name`, `abbreviation`, `loanword` or `later-in-openlist`
   (English OpenList has since accepted the word, so the next build drops the duplicate and the line
   stays as the record).

   `loanword` is a word English has borrowed from another language and uses as its own, such as
   `onsen` from Japanese.

2. Rebuild the dictionary. The word is not searchable until the artifacts carry it:

   ```bash
   pnpm dict:fetch && pnpm dict:build && pnpm dict:shards
   ```

   The fetch needs about 330 MB in `.cache/` and is paid once per machine. The build refuses an
   addition that is already in the pinned list, and checks that the four tiers still nest.

3. Run the four suites, commit everything including `apps/web/public/dict/` and
   `apps/web/public/defs/` with **`[dict]`** in the message so CI rebuilds the artifacts and
   compares them, and open a pull request. Merging is what admits the word.

The word then appears in the **Extended** tier only — Common, Standard and Full stay exactly as
English OpenList defines them — and the word panel labels it `Site addition, not in English
OpenList.` `pnpm vocab:check` runs on every pull request and catches a malformed line, a duplicate,
or a list over the cap.

**It also changes what the nightly finds.** Enumeration searches Common plus the additions, so from
the next run the word can appear in a machine-generated candidate. Before this, an addition could
only ever reach the site through a submission that chose the Extended tier by hand.

Two things follow. A row containing an addition is labelled `extended` rather than `common`, which
is how the prefilter tells it from a genuinely rare word and how you can spot one in a queue. And
each queue keeps its own `additions.txt`, the list it was enumerated with: the prefilter reads that
back rather than today's list, so re-running it on an older queue judges rows against the
vocabulary that actually produced them. The file is written by `hits:enumerate` and committed with
the queue; do not edit it.

Adding a word does **not** re-run the inputs already enumerated. Candidates enumerated under `s2`
or earlier never saw the additions, and they are not sent round again automatically — a requeue is
a deep-run decision, taken on its own:

```bash
pnpm hits:requeue --settings-before=s3
```

## Word requests

A request is a word the pipeline thinks the vocabulary is missing. It is a proposal and nothing
more: no tool admits a word, and one joins the vocabulary only when you accept it by name and merge
the pull request that adds it. The list is `data/vocabulary/requests.jsonl`.

| Source | Where it comes from |
|---|---|
| `judge` | A model judging a queue proposed it. `hits:ingest` collects these, and the routine's pull request lists them. |
| `submission` | A reader's anagram was refused because the word is in no tier. The issue is labelled `word-request`. |
| `anchor` | A seeded anchor word the engine could not find. As often a typo as a real word. |

**A gloss or trace a model proposed is unverified.** Check the source exists and says what it is
claimed to say before accepting. A model can write a Wiktionary URL that looks right and is not
there, and the gloss and trace are exactly the parts you would otherwise take on trust.

**Accept one** with `pnpm vocab:add`, exactly as "Add a word to the vocabulary" above describes —
the ingest report prints the command ready to paste. Once the word is in `additions.jsonl`, remove
its line from `requests.jsonl` in the same pull request.

**Decline one** so it is never proposed again. Without this, every night proposes the same word and
you decline it forever:

```bash
pnpm vocab:request doomer --decline
```

**Record one by hand**, for a submission or an anchor, where no model is in the loop:

```bash
pnpm vocab:request onsen --source=submission --from=https://github.com/ryanjosephkamp/ars-magna/issues/51 --why="A reader's anagram needed it."
```

A refused submission now says which of three things went wrong: the letters differ, the word is in
a wider tier and the dropdown needs changing, or the vocabulary has no such word at any tier. Only
the third is a word request, and only it is labelled `word-request`.

## The vocabulary dataset

The site's vocabulary is published so its results can be checked rather than taken on trust:
[ars-magna-vocabulary](https://huggingface.co/datasets/ryanjosephkamp/ars-magna-vocabulary), linked
in the site footer under "The words". Two files, plus a card naming the pinned revision:

| File | What it is |
|---|---|
| `vocabulary.txt` | Every word the site accepts, sorted, one per line: the union the engine searches. |
| `additions.jsonl` | The site's own words, each with its gloss, trace, and the revision it was added on top of. |

**English OpenList is credited, never republished as itself and never modified.** The union is a
derived artifact, published because a claim to find every anagram is only checkable against a
stated word list. The card sends a reader to English OpenList's own dataset for the list itself.

The **Publish vocabulary** Action does it, on a merge to `main` that changes
`data/vocabulary/additions.jsonl` or rebuilds the dictionary. It uses the same `HF_TOKEN` secret as
the hits dataset, and creates the dataset on Hugging Face the first time it runs. Pause it with
`gh variable set PUBLISH_VOCABULARY --body off`, and resume with `gh variable delete
PUBLISH_VOCABULARY`.

To see what would be published without uploading anything:

```bash
pnpm vocab:publish --dry-run
```

It reads the **committed artifacts**, not the pinned sources, so it needs no 330 MB fetch and
publishes exactly what the site ships. It refuses to run when an addition is missing from those
artifacts: that means the dictionary has not been rebuilt since the word was added, and publishing
would announce a word the site cannot find.

## Review a routine pull request

When a pull request titled `Greatest Hits: N new for <date>` appears. The routine opens one after it
judges a non-empty queue, even when N is zero.

The judge scores each anagram's **relation** to its input from 1 to 5, and how it **reads** from 1 to
3. Ingest turns that into a shelf:

| Scores | Shelf | In the pull request as |
|---|---|---|
| relation 5 | Interesting, flagged for Greatest Hits | `accepted`, tag `greatest-candidate` |
| relation 4 | Interesting | `accepted` |
| relation 3 that reads 2 or 3 | A stretch | `accepted` |
| a fourth or later qualifying phrase for one input | alternate | `proposed`, tag `alternate` |
| relation 3 that reads 1, or relation 2 | near miss | not added; listed in the report |

**Merging accepts every hit under Interesting and A stretch.** Greatest Hits (`featured`) changes only
when you promote a hit by name. Rude or offensive phrases are never scored down; they carry the tag
`tone:rude`.

1. Read the ingest report in the body. For each hit it lists the relation, reads, input, phrase and
   justification, then the alternates, then the near misses.
2. Check out the branch and change only what you disagree with, one command per status:

   ```bash
   gh pr checkout <number>
   pnpm hits:set --status=featured <id>     # promote to Greatest Hits
   pnpm hits:set --status=accepted <id>     # accept an alternate
   pnpm hits:set --status=proposed <id>     # hold back a shelved hit
   pnpm hits:set --status=retired <id>      # bury one for good
   ```

   Each command prints what it changed. An unknown id or status is refused and nothing is written. A
   near miss is not in `data/hits.jsonl`; to add one, use "Add a hit by hand".
3. If you changed anything, commit `data/hits.jsonl` on the branch and push. Merge when CI is green. A
   pull request with N of zero has nothing to accept; merge it so the judged queue stays in the record.
4. Verify the release: the Discoveries page and the dataset show the new hits.

| Status | Means |
|---|---|
| `featured` | Greatest Hits: the first section of the Discoveries page, picked by hand |
| `accepted` | in the dataset and on the Discoveries page, in Interesting or A stretch; Greatest Hits and Interesting are the pool the anagram of the day draws from |
| `proposed` | not published: an alternate, or held back |
| `retired` | buried for good; the id stays in the file, so ingest never proposes it again |

Prompt: `docs/prompts/review-hits-pr.md` (pr_number). The agent lists and recommends first, then waits
for your ids and statuses. To decide in a page instead, with the near misses and justifications in
front of you, use the review desk.

## Review in the desk

When a routine pull request holds more than you want to read in its body, or you want to promote a near
miss, edit justifications or tags across the collection, seed a batch, or set up a deep run.

1. Build the desk and open it:

   ```bash
   pnpm hits:desk
   open .cache/desk/index.html
   ```

   It reads `data/hits.jsonl`, `data/candidates.jsonl` and the three newest judged queues (`--queues=N`
   for more), and writes one self-contained page. It never writes to the repository. Built on a routine
   pull request's branch (`gh pr checkout <number>` first), it shows that queue's hits as the pull
   request adds them. To use it on a phone, see "On a phone" below.
2. Decide in its tabs:
   - **Review:** one queue by input, labelled with the models that judged it (and how many verdicts each
     gave, when there are several), each row with its relation, reads, where it stands, the model that
     judged it and its rationale. For a hit, change its status, edit its justification, or add and remove tags
     (`+tone:pun -subject:actor`). For a near miss, accept it or add it as proposed, with a justification.
     On any row of more than one word, **Reorder words** lets you tap the words in the order they should
     read; a near miss takes that order once it is promoted. **Add a note** on any row tells the agent
     something about that hit alone: why it deserves promoting, what its justification should say, or what
     else to change. A near miss accepted with no justification but with a note goes in as proposed, and
     the agent writes a justification from the note, then accepts it, all in the pull request you merge.
   - **Collection:** every hit, filtered by text or status, with the same controls.
   - **Near misses:** every near miss in those queues, strongest first.
   - **Seed:** inputs pasted one per line as `input | category | anchors`, each id checked against the
     pool.
   - **Deep run:** which candidates to send back to `new`, and the queue folder to enumerate them into
     with the deep preset.
   - **Add a hit:** an anagram you already know, with its justification.

   Decisions collect in the panel beside the tabs (below them on a narrow screen) and stay in that browser
   until you remove them.
3. Choose where the work goes, a new branch off `main` or a routine pull request's branch, add any notes,
   and press **Copy prompt**. Paste it into an agent session opened in the repository: it runs the
   commands in order on that branch, runs the four suites, and opens or updates the pull request.
   **Copy commands** gives the commands alone, to run yourself.
4. Review and merge that pull request as usual. Nothing decided in the desk is published before then.

**On a phone.** The desk also works as a private claude.ai Artifact, opened in the Claude app or in a
phone browser signed in to claude.ai:

1. In a Claude Code session on the repository, on the desktop or reached through Remote Control, paste
   `docs/prompts/publish-desk.md`. It builds the desk with `pnpm hits:desk --artifact` and publishes
   `.cache/desk/artifact.html` to the desk's Artifact, whose URL `CLAUDE.md` records. Publishing again
   keeps the URL.
2. Open that URL on the phone. On a narrow screen each row reads top to bottom, and long lists show a
   batch at a time with a Show more button.
3. Decide as above, press **Copy prompt**, and paste the prompt into a Claude Code session on the
   repository. If the Artifact cannot reach the clipboard, the prompt is left selected in a box to copy
   from.
4. Merge from GitHub mobile as usual.

The Artifact stays private: its near misses include slurs and insults made from the letters. Decisions are
kept in the browser that made them, so a phone and a laptop each hold their own.

| Decision | Command it becomes |
|---|---|
| status | `pnpm hits:set --status=featured id…` |
| justification | `pnpm hits:justify id "One plain sentence."` |
| tags | `pnpm hits:tag id +tone:pun -subject:actor` |
| accept a near miss | `pnpm hits:ingest --date=<queue> --model=<judge> --only=id,… --status=accepted`; a row with no justification goes in as `proposed`, then `hits:justify` and `hits:set` |
| word order | `pnpm hits:order id room dirty`, after the ingest that writes a promoted near miss |
| note on a row | no command: the prompt lists it under the row's id and chosen order, and the agent acts on it with the commands above |
| seed | appends the lines to `data/candidates.jsonl` |
| deep run | `pnpm hits:requeue …`, then `hits:enumerate --preset=deep`, `hits:prefilter --per-input=all` and `hits:screen` |

`hits:justify`, `hits:tag` and `hits:order` refuse an unknown id, an empty or over-long sentence, a tag the
schema does not allow, and words that are not the hit's own, and write nothing then. `hits:order` changes
only how the words read: the id, and so the hit's page address, stays the same. `hits:ingest --only` refuses
a row that is not in the queue, is already a hit, or has no valid verdict. An agent runs these only on what
the operator named, and writes a justification only when a note asks for one.

Prompt: `docs/prompts/apply-desk.md` (desk_branch, desk_commands, desk_notes, desk_row_notes). The desk fills it.
To publish the desk for a phone: `docs/prompts/publish-desk.md` (desk_branch, desk_queues).

## Audit the Discoveries page

When you want to decide, across everything already published, which anagrams belong in Greatest Hits,
Interesting or A stretch, and which should come off the page. The review desk handles what a queue adds;
the audit handles what the page already shows.

1. In a Claude Code session on the repository, ask for the Greatest Hits audit (the `greatest-hits-audit`
   skill) or paste `docs/prompts/publish-audit.md`. It builds the audit from `main` with
   `pnpm hits:desk --audit --artifact` and publishes `.cache/desk/audit-artifact.html` to the audit's
   Artifact, whose URL `CLAUDE.md` records. In another harness, run `pnpm hits:desk --audit` and open
   `.cache/desk/audit.html` in a browser.
2. Every published anagram is listed in the section it is in now, each with its meaning: **Greatest Hits**
   (`featured`: the best of them, picked by hand), **Interesting** (names the original, or has a clear,
   specific link to it: relation 4 or 5) and **A stretch** (a looser link, arguable in a sentence: relation 3).
   Within each, the anagrams the judge suggested for Greatest Hits come first, then the strongest links.
   Filter by text or category, or show only the suggestions or what you have changed.
3. Change a row's label to move it to another section or **Remove from the page** (`retired`), and edit its
   justification, tags or word order, or add a note, as in the review desk. Every row starts on its current
   label, so a prompt copied without changes changes nothing.
4. Press **Copy prompt** and paste it into an agent session on the repository. It applies the changes on a
   new branch named `greatest-hits-audit-<date>` and opens a pull request. The page changes when you merge it.

| Label | Command it becomes |
|---|---|
| Greatest Hits | `pnpm hits:set --status=featured id…` |
| Interesting or A stretch | `pnpm hits:set --status=accepted id…` for a Greatest Hit, and `pnpm hits:tag id +shelf:stretch` (or `+shelf:interesting`) when the judge's scores would put it in the other section |
| Remove from the page | `pnpm hits:set --status=retired id…` |

A `shelf:interesting` or `shelf:stretch` tag is your placement: the site, the dataset and both desks show the
hit in that section whatever its scores. Moving a hit back to where its scores put it removes the tag.

Decisions are kept in the browser that made them, apart from the review desk's. The audit fills
`docs/prompts/apply-desk.md`, as the desk does.

Prompt: `docs/prompts/publish-audit.md` (no placeholders).

## Votes on Discoveries

Readers vote for anagrams on Discoveries and promote the ones that are not there yet. A vote is for an
anagram already in a section: one per browser per anagram, taken back by pressing Vote again, never a vote
against. Most votes, the page's usual order, ranks each section by them; votes never move an anagram from one
section to another. A promotion is for any other anagram in a search, on the same terms, and asks for it to
be considered for a section. Nothing reviews promotions yet (roadmap phase F), so for now they are only
counted. The search page shows both: an In Discoveries block above the complete list, and Vote or Promote on
every row. The rules as readers see them are at https://ars-magna.pages.dev/how.

| Piece | Where |
|---|---|
| the API | Cloudflare Pages Functions in `apps/web/functions/api/`: `GET /api/votes`, `POST /api/pass` (the check before a visit's first vote or promotion), `POST /api/vote`, `GET /api/promotions?letters=`, `POST /api/promote`. The logic and its tests are in `apps/web/src/votes/`. |
| the data | the D1 database `ars-magna-discoveries`, bound as `DISCOVERIES_DB` in `apps/web/wrangler.toml`: tables `votes`, `vote_counts`, `promotions`, `promotion_counts` and `rate_limits` |
| the schema | `apps/web/migrations/`, applied by Deploy before each upload |
| the check | the Turnstile widget `Ars Magna votes` for `ars-magna.pages.dev`; its site key is in `apps/web/src/votes/state.ts` |
| the secrets | `TURNSTILE_SECRET` and `IP_HASH_SECRET`, Pages secrets in the dashboard (Workers & Pages, `ars-magna`, Settings, Variables and Secrets) |
| the switches | `VOTES_OPEN` and `PROMOTIONS_OPEN` in `apps/web/wrangler.toml` |

A check that has produced nothing two minutes after Vote or Promote was pressed is abandoned: the widget
goes, nothing is saved, and the page tells the reader to try again.

**Which rows carry Vote.** The search shows one spelling for each set of words that share letters, so a
published anagram can sit behind a row that spells it another way: for `Doritos`, "its odor" is the row
"door sit". Such a row carries Vote for the published anagram, and its label names the Discoveries spelling:
`A stretch · its odor`. Every other row carries Promote.

**The promotions table.** One row per browser per anagram: `key` (the letters sorted, a colon, the words
sorted and joined with hyphens: `aaeeglmnnt:elegant-man`), `voter`, `input` as the reader typed it, `words` in
the order they saw, the `tier` they searched, `via` (`result` from a search; `typed` is kept for the Submit
page), `category`, `why`, `credit` and `missing` (empty until the Submit page), and `created_at`.
`promotion_counts` holds each key's count, recounted with every change. A promotion of an anagram already on
Discoveries is refused, and the search page shows Vote for it instead.

**Look at the counts.** Read-only, from `apps/web`, once `pnpm dlx wrangler@4.121.0 login` has signed this
machine in to Cloudflare:

```bash
pnpm dlx wrangler@4.121.0 d1 execute ars-magna-discoveries --remote --command "SELECT hit_id, count FROM vote_counts ORDER BY count DESC LIMIT 20"
pnpm dlx wrangler@4.121.0 d1 execute ars-magna-discoveries --remote --command "SELECT key, count FROM promotion_counts ORDER BY count DESC LIMIT 20"
```

**Pause voting.** Set `VOTES_OPEN = "false"` in `apps/web/wrangler.toml` in a pull request and merge it. The page
keeps showing counts, its Vote buttons turn off, and the API refuses votes. `"true"` reopens it.

**Pause promotions.** Set `PROMOTIONS_OPEN = "false"` the same way. The search page keeps showing counts, its
Promote buttons turn off, the API refuses promotions, and votes carry on. `"true"` reopens them. The check
before a visit's first action stays open while either switch is.

**Remove a flood of votes.** Find the voter id behind it, then delete its votes and recount every hit in one
command. An agent runs this only when you ask for exactly that:

```bash
pnpm dlx wrangler@4.121.0 d1 execute ars-magna-discoveries --remote --command "SELECT voter, COUNT(*) AS n FROM votes GROUP BY voter ORDER BY n DESC LIMIT 10"
pnpm dlx wrangler@4.121.0 d1 execute ars-magna-discoveries --remote --command "DELETE FROM votes WHERE voter = 'voter_id'; UPDATE vote_counts SET count = (SELECT COUNT(*) FROM votes v WHERE v.hit_id = vote_counts.hit_id)"
```

A flood of promotions goes the same way:

```bash
pnpm dlx wrangler@4.121.0 d1 execute ars-magna-discoveries --remote --command "SELECT voter, COUNT(*) AS n FROM promotions GROUP BY voter ORDER BY n DESC LIMIT 10"
pnpm dlx wrangler@4.121.0 d1 execute ars-magna-discoveries --remote --command "DELETE FROM promotions WHERE voter = 'voter_id'; UPDATE promotion_counts SET count = (SELECT COUNT(*) FROM promotions p WHERE p.key = promotion_counts.key)"
```

Each recounts in place rather than emptying the counts and refilling them, so a vote or promotion that lands
between the two statements cannot collide with the refill.

**Change the schema.** Add a new numbered file to `apps/web/migrations/`; never edit one that has already run.
Deploy applies it before it uploads the site.

**Run it locally.** Cloudflare's test secret always passes, and the page uses the matching test site key on
`localhost`. `.dev.vars` and `apps/web/.wrangler/` are gitignored:

```bash
pnpm --filter @ars-magna/web build
cd apps/web
printf 'TURNSTILE_SECRET=1x0000000000000000000000000000000AA\nIP_HASH_SECRET=local\n' > .dev.vars
pnpm dlx wrangler@4.121.0 d1 migrations apply ars-magna-discoveries --local
pnpm dlx wrangler@4.121.0 pages dev dist
```

Then open http://localhost:8788/hits, and http://localhost:8788/#q=A%20gentleman for the search page's In
Discoveries block and Promote.

## Judge a queue by hand

When the routine is paused, a run failed, or you want a queue judged now. The routine's instructions work
on a laptop, with the engine check turned back on.

1. Find the newest queue that has a screen input (or, before settings s2, rows) and no answers yet:

   ```bash
   ls data/queue/*/screen-input-*.md
   ls data/queue/*/judge-output.jsonl
   ```

2. Have a Claude session answer every `screen-input-N.md` into `screen-output.jsonl`: one JSON line per
   input, listing the numbers of the phrases with any link to it, read phrase by phrase rather than kept
   or dropped by script. An older queue without screen files skips this step.
3. `pnpm hits:judge --date=<folder>` checks the screen answers, writes the kept phrases to
   `screened.jsonl`, and writes `judge-input-N.md` files into the folder: the rubric, then the candidates.
4. Have a Claude session answer every judge file into `judge-output.jsonl`, one JSON line per candidate,
   forming each verdict itself rather than giving groups of rows a default score by script. With
   `ANTHROPIC_API_KEY` set in your shell, `pnpm hits:judge --date=<folder> --via=api` writes the judge's
   answers through the API instead; the screen is always answered in a session.
5. `pnpm hits:ingest --date=<folder> --model=<the model that judged>` re-checks every phrase with the
   engine, writes the shelved hits and the alternates, and writes `ingest-report.md`. Each judgement's
   `judged_at` is the queue's date, or the date its verdict line carries (as `--via=api` writes one); a
   hit's `added` is the day ingest runs. Ingesting a queue again on a later day keeps the day it was judged.
6. Commit on a branch named `hits/<folder>` exactly as step 7 of `automation/judge-routine.md` lists, open
   the pull request, and review it as above.

Prompt: `docs/prompts/judge-queue.md`.

## A thin night

A thin night is a nightly run that commits a queue with no screen input: the folder holds only
`summary.json` (before settings s2, an empty `prefiltered.jsonl`). It is a record, not a failure. The
routine skips such a folder and opens no pull request, so a morning with no pull request is what a thin
night looks like.

The nightly's log says which of two cases it was:

| Case | Fetch line | What it means |
|---|---|---|
| Nothing new | `0 new candidates` | every title the fetch considered is already in `data/candidates.jsonl` |
| Nothing keepable | some new candidates, then `0 kept for the screen` | every phrase of the new inputs failed the prefilter's rules (a rare word, an unlisted short word, more than five words); the prefilter moved them to `enumerated` with a note |

**2026-09-12 was the first case.** The 06:15 run considered 150 titles (87 junk skipped) and found
0 new candidates, so it committed the empty folder `2026-09-12b`. The routine skipped that folder at 07:05
and stopped in 19 seconds. All 328 candidates were `enumerated` (295) or `unclassified` (33); none was
`new`.

To see it for yourself:

```bash
gh run list --workflow=hits-nightly.yml --limit 3
gh run view <run id> --log | grep -E 'titles considered|kept for the'
node -e 'const c={};for(const l of require("fs").readFileSync("data/candidates.jsonl","utf8").split("\n").filter(Boolean)){const s=JSON.parse(l).status;c[s]=(c[s]||0)+1}console.log(c)'
```

What to do:

- **One thin night:** nothing. Leave the folder; it is that night's record.
- **Nothing keepable:** nothing. The candidates are already marked, so they are not run again.
- **Nothing new, night after night:** the candidate pool is dry, and every night will be thin until new
  inputs arrive. Four remedies exist today:
  - Seed a batch by hand, the chosen supply for now: append about forty lines to
    `data/candidates.jsonl` in a pull request, weighted toward phrases, titles, products and places.
    After it merges, the next nightly enumerates them, or run Hits nightly by hand from the Actions tab.
    Every input gets its own screen allowance (`per_input`), so a batch of forty needs no special
    setting. A seed may list `anchors`, words related to the input that the search reaches past its
    limit with, as in the second example below. The seeds stay `new` until the pull request for their
    judged queue merges, and every nightly enumerates the `new` candidates again, so merge that pull
    request before the following 06:00 UTC run, or disable Hits nightly until it is merged; otherwise
    the routine screens the repeat queue instead.
  - Grow the category table and run `pnpm hits:fetch --reclassify`, which moves unclassified candidates
    that now fit to `new` ("Growing the category table" in `automation/RUNBOOK.md`).
  - Requeue candidates processed under older enumeration settings or an older rubric ("Requeue
    candidates" below).
  - Run Hits nightly by hand from the Actions tab with a larger `limit`. `limit` is how many of the day's
    top titles are considered (150 by default, of about 1,000 in the feed) before they are checked
    against the pool.

A seeded candidate is one line:

```json
{"id":"sagradafamilia:places","input":"Sagrada Família","category":"places","source":"manual","first_seen":"2026-09-12","status":"new"}
{"id":"thecountryside:phrases","input":"The countryside","category":"phrases","source":"manual","first_seen":"2026-09-13","status":"new","anchors":["city","dust"]}
```

The id is the input's letters (lowercase, accents folded, nothing else), a colon, and the category.
`pnpm test` fails on an id that does not match. Anchors are lowercase words made from the input's
letters; one that does not fit is reported in the queue's `summary.json` and skipped. They matter only
for an input with more results than the preset's limit.

Prompt: `docs/prompts/thin-night.md`. It diagnoses and recommends; it changes nothing.

## Requeue candidates

When the enumeration settings or the rubric change, and candidates processed under the old versions
should run again.

Every candidate records the queues it went through (`runs`), each with the settings (`s1`, `s2`…) and
the rubric (`v1`, `v2`…) it was processed under. A candidate processed before that record existed
counts as `s1` and `v1`.

1. See what would move, without writing anything:

   ```bash
   pnpm hits:requeue --settings-before=s2 --dry-run
   ```

   Narrow it with `--rubric-before=v2`, `--category=titles`, `--source=manual`, or ids. Every selector
   given must match. An id that is not an enumerated candidate is refused, and then nothing is written.
2. Run it without `--dry-run` on a branch, commit `data/candidates.jsonl`, and open a pull request. After
   it merges, the next nightly enumerates those candidates again, or you can run Hits nightly by hand.

A requeued candidate's earlier hits stay in `data/hits.jsonl`, and ingest leaves any phrase already
there alone.

## Correct when hits were judged

When hits in `data/hits.jsonl` carry the wrong `judged_at`. Before 2026-09-16, `hits:ingest` stamped
`judged_at` with the day it ran rather than the day the queue was judged, so a queue ingested again after
midnight UTC came out a day late. That is how the nine hits #47 replayed from the queue `2026-09-15` read
2026-09-16; this command corrected them.

```bash
pnpm hits:judged-at --date=2026-09-15 macklemore:people:lack-me-more macklemore:people:clamor-meek
```

Every judgement on each named hit takes the date its verdict in that queue carries, or else the queue's
date, the rule ingest now follows. `added` stays as it is: it is the day the hit entered the file. An id
that is not a hit, or that the queue has no verdict for, is refused, and then nothing is written. Each
line it prints gives the dates before and after. Commit `data/hits.jsonl` on a branch and open a pull
request; merging it republishes the dataset through Publish hits.

## Run a deep run

When a batch of inputs deserves more than the nightly gives it: every candidate again after the settings
changed, a large seed batch, or one category in depth. A deep run happens in a Claude Code session on a
laptop, apart from the daily routine, and opens one pull request per category.

Size it before starting. These figures come from the s2 gate: 50 long inputs, screened by
`claude-sonnet-5` at about 6.3 minutes per 1,000 phrases. Short trending names give far fewer phrases, and
the judge then scores only the tenth or so the screen keeps.

| Bound per input | Phrases to screen per 50 inputs | Screening per 50 inputs | Traced classics kept (of 14) |
|---|---|---|---|
| 100 | 4,256 | about 27 minutes | 10 |
| 300, the deep preset | 10,768 | about 1 hour 10 minutes | 12 |
| 500, the routine | 16,632 | about 1 hour 45 minutes | 12 |
| no bound | 328,656 | about 35 hours | 12 |

1. In the review desk's Deep run tab, choose the candidates (settings older than s2, a category, a source,
   or ids), the first queue folder and the bound per input; seeds added in the Seed tab join the scope.
   Press **Copy deep-run prompt**. Without the desk, fill `docs/prompts/deep-run.md` by hand.
2. Paste it into a Claude Code session opened in the repository. For each category, on its own branch, the
   session:
   - requeues and seeds;
   - proposes anchor words for inputs with more than 50,000 results;
   - enumerates with the deep preset, prefilters, and writes the screen input;
   - screens with `claude-sonnet-5` subagents, one per screen file;
   - judges what the screen kept with `claude-opus-5` subagents, one per judge file;
   - ingests with the engine check on, and opens a pull request titled
     `Greatest Hits deep run: <category>, <N> new`.
3. Review each pull request in the desk (`gh pr checkout <number>`, then `pnpm hits:desk`) and merge them
   one at a time. Each adds lines to the same data files, so the session rebuilds a later branch from
   `main` rather than resolving a data file by hand.

Anchors live in the run's scratch list and in the queue's `summary.json`; the candidate lines in the
repository are not edited. The raw rows are deleted once the screen input is written, because a deep
enumeration can run to gigabytes. In Claude Code, a workflow can fan out the screening and judging when you
ask for one; another harness works through the files one at a time.

Prompt: `docs/prompts/deep-run.md` (deep_run_scope, deep_run_size). The desk fills it.

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

   A red Deploy leaves the site on the previous build until the next green one; each deploy builds all of
   `main`, so a later green deploy carries the earlier merge's changes too. CI and Deploy install
   `wasm-pack` at a pinned version (`version:` under `jetli/wasm-pack-action` in both workflows). If a
   build fails on a `wasm-pack` argument, or after upgrading `wasm-pack` locally, set both workflows to the
   version `wasm-pack --version` prints on the machine the build was verified on, in one pull request.

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
   https://ars-magna.pages.dev/hits. Its count matches step 2, and its Greatest Hits, Interesting and A
   stretch sections add up to it: the Discoveries page fetches `hits.json` from the
   network on every visit, and the service worker's copy is only for offline use. The one exception is
   the first visit after a deploy that changes `apps/web/public/sw.js`: a browser that visited before
   can show the previous version until the new worker takes over, so reload once more.

6. Votes and promotions answer. Each reads `{"open":true,"counts":` first:

   ```bash
   curl -s https://ars-magna.pages.dev/api/votes | head -c 40
   curl -s 'https://ars-magna.pages.dev/api/promotions?letters=aaeeglmnnt' | head -c 40
   ```

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
| `CLOUDFLARE_API_TOKEN` | repository secret | Deploy: the upload and the votes database migrations | Cloudflare, My Profile, API Tokens, with Cloudflare Pages: Edit and D1: Edit |
| `TURNSTILE_SECRET` | Pages secret | the vote API's check before voting | Cloudflare, Turnstile, the `Ars Magna votes` widget, its secret key |
| `IP_HASH_SECRET` | Pages secret | the vote API: connection hashes for rate limits, and passes | any long random string, such as `openssl rand -hex 32` |
| `CLOUDFLARE_ACCOUNT_ID` | repository secret | Deploy | the Cloudflare dashboard sidebar; it changes only with the account |
| `ANTHROPIC_API_KEY` | your shell only | `hits:judge --via=api`, `hits:fetch --classify-with-haiku` | the Claude Console |
| `XAI_API_KEY` | your shell only | the second judge column in `hits:judge --via=api` | the xAI console |
| `CLOUDFLARE_PROJECT_NAME` | repository variable, `ars-magna` | Deploy's on switch | not a secret |
| `PUBLISH_HITS` | repository variable, unset | `off` pauses Publish hits | not a secret |

The nightly Action and the submission validator use GitHub's built-in token, and the judge routine bills
to the Claude plan; neither has anything to rotate.

A Pages secret is set in the Cloudflare dashboard (Workers & Pages, `ars-magna`, Settings, Variables and
Secrets), not with `gh secret set`, and takes effect on the next deploy (`gh workflow run Deploy`). A new
`IP_HASH_SECRET` ends every visit's pass, so each reader's next vote runs the check again.

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
