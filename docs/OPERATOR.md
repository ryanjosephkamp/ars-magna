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
| 07:00 daily | Judge routine (Claude Code, `claude-sonnet-5`) | a `Greatest Hits: N new for <date>` pull request; nothing after a thin night; a `Greatest Hits: <date> not judged` pull request after a night it could not judge; on its first run of each month, the monthly vote review in the same pull request (see "The monthly vote review") |
| after Hits nightly | Export promotions Action | a commit to `main` with `data/counts/<date>/` (the day's votes, and promotions by code), and the private export in `ars-magna-promotions` (see "Review promotions") |
| every merge to `main` | CI and Deploy | the site at https://ars-magna.pages.dev, after Deploy applies any new votes database migration; then each promotion of a newly published anagram becomes a vote |
| a merge that changes `data/hits.jsonl`, `tools/hits/src/publish.ts` or the dataset card | Publish hits Action | the dataset at https://huggingface.co/datasets/ryanjosephkamp/ars-magna-greatest-hits |

A nightly commit touches only the queue and the candidates, and an export commit only the day's counts, so
neither runs CI or Deploy.

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
   explaining the link for a reader. When the input is a public name, work, place or phrase, add `about`:
   one factual sentence saying what the input is (see "What an input is"). It checks again, then adds the
   candidate and the hit. Without the MCP server, open a "Submit an anagram" issue on GitHub; when the
   validator labels it `submission:valid`, run `pnpm hits:ingest --from-issue=<issue number>`. The form's
   "Why it is good" becomes the hit's justification and its "What the input is" the input's sentence; one
   that breaks its rule (over length, emoji, no full stop) is left off, and ingest prints the command that
   sets it.
3. Accept it by id. The id is the input's letters, the category, and the words sorted and joined with `-`:

   ```bash
   pnpm hits:set --status=accepted dormitory:phrases:dirty-room
   ```

   If a word reads in a sense the dictionary does not give first, such as slang or an abbreviation, set that
   sense now with `pnpm hits:sense` (see "Senses on Discover").

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
has become whether to move the pin instead. No tool admits a word: the routine and Build submissions
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
| `submission` | A reader's anagram was refused because the word is in no tier. The issue is labelled `word-request`. A submission from the Build page records such a word in its `missing` column instead (see "Build"), and the review of promotions forwards the ones worth asking for, from `promotion <code>` (see "Review promotions"). |
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

**An addition only helps a word that is in no tier at all.** A word the pinned list already carries at
Standard or Full is refused as already in the vocabulary: it is unreachable by the nightly for a
different reason, the tier enumeration runs at, and adding it is not the remedy.

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
judges a non-empty queue, even when N is zero, and after it applies a review of promotions you approved; the
promotions it publishes follow the ingest report in the body (see "Review promotions"). Once a month the body also
holds the monthly vote review (see "The monthly vote review").

The judge scores each anagram's **relation** to its input from 1 to 5, and how it **reads** from 1 to
3. Ingest turns that into a shelf:

| Scores | Shelf | In the pull request as |
|---|---|---|
| relation 5 that reads 2 or 3 | Interesting, flagged for Greatest Hits | `accepted`, tag `greatest-candidate` |
| relation 4 that reads 2 or 3 | Interesting | `accepted` |
| relation 3 that reads 2 or 3 | A stretch | `accepted` |
| a fourth to eighth qualifying phrase for one input | alternate | `proposed`, tag `alternate` |
| relation 3, 4 or 5 that reads 1, relation 2, or a qualifying phrase past an input's five alternates | near miss | not added; listed in the report |

A phrase that reads as word salad is a near miss however apt one of its words is (decided 2026-09-18). An input
keeps at most five alternates, counting any it already has. Hits published before the rule keep their shelves;
the site places a published hit by its relation alone, so the audit is where to move one.

**Merging accepts every hit under Interesting and A stretch.** Greatest Hits (`featured`) changes only
when you promote a hit by name. Rude or offensive phrases are never scored down; they carry the tag
`tone:rude`.

1. Read the ingest report in the body. For each hit it lists the relation, reads, input, phrase and
   justification, then the alternates, then the near misses. A night that reads like 2026-09-18 (hundreds of
   hits, one input dominating, sentences that repeat) should not get this far, since the tools refuse it;
   if one does, read "A night that is refused" before merging. Its **About** section lists every sentence
   saying what an input is that reached a hit in this run: the ones the judge wrote, marked with the model,
   and the ones the input already had (from Wikidata, by way of the nightly fetch). Merging accepts them;
   change one with `pnpm hits:describe <candidate> "One factual sentence."` on the branch. Its **Senses**
   section lists, under each new hit, the sense the judge wrote for a word and the dictionary's first gloss
   it is read over (see "Senses on Discover"). Merging accepts those too; change one with
   `pnpm hits:sense <id> <word> "One sentence."`, or remove it with `--clear`, on the branch.
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
4. Verify the release: the Discover page and the dataset show the new hits.

| Status | Means |
|---|---|
| `featured` | Greatest Hits: the first section of the Discover page, picked by hand |
| `accepted` | in the dataset and on the Discover page, in Interesting or A stretch; Greatest Hits and Interesting are the pool the anagram of the day draws from |
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

   It reads `data/hits.jsonl`, `data/candidates.jsonl`, the three newest judged queues (`--queues=N`
   for more) and the newest vote counts in `data/counts/`, and writes one self-contained page. It never
   writes to the repository. Built on a routine pull request's branch (`gh pr checkout <number>` first), it
   shows that queue's hits as the pull request adds them. To see what readers promoted, add
   `--promotions=../ars-magna-promotions` (see "Review promotions"), with that repository's `main` up to
   date. To use it on a phone, see "On a phone" below.
2. Decide in its tabs:
   - **Review:** one queue by input, labelled with the models that judged it (and how many verdicts each
     gave, when there are several), each row with its relation, reads, where it stands, the model that
     judged it and its rationale. For a hit, change its status, edit its justification, or add and remove tags
     (`+tone:pun -subject:actor`). For a near miss, accept it or add it as proposed, with a justification.
     On either, **About the input** holds the sentence saying what the input is, with its Wikipedia article
     beneath when it has one. The sentence belongs to the input, so every row of that input shows the same
     change; it can be rewritten here but not removed. On a hit, **Senses of the words** holds the sense each
     word reads in, in that anagram, with the dictionary's first gloss beneath (see "Senses on Discover").
     On any row of more than one word, **Reorder words** lets you tap the words in the order they should
     read; a near miss takes that order once it is promoted. **Add a note** on any row tells the agent
     something about that hit alone: why it deserves promoting, what its justification should say, or what
     else to change. A near miss accepted with no justification but with a note goes in as proposed, and
     the agent writes a justification from the note, then accepts it, all in the pull request you merge.
   - **Promoted:** with `--promotions`, every anagram readers promoted, from the newest private export, most
     promoted first, ties A to Z. Each row shows how many promoted it and from where, each input it was
     searched as, every note from Build (what the input is, why it is good, the credit, the category and
     the words it asks for) exactly as the reader typed it, the review's newest decision and what it kept
     or dropped, and what the routine published. A row that is now a hit has a hit's controls. Any other
     row can only be blocked: it becomes a hit through the review you merge, not here. Filter by text, or
     show only those with a note, not reviewed yet, placed, left out, or blocked. Without `--promotions`
     the tab says how to build it.
   - **Collection:** every hit, filtered by text or status, with the same controls, in the file's order or
     by **Most votes** (ties A to Z, as on the site). A hit with votes shows how many.
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

The Artifact stays private: its near misses include slurs and insults made from the letters, and a desk built
with `--promotions` holds what readers typed. Decisions are
kept in the browser that made them, so a phone and a laptop each hold their own.

| Decision | Command it becomes |
|---|---|
| status | `pnpm hits:set --status=featured id…` |
| justification | `pnpm hits:justify id "One plain sentence."` |
| about the input | `pnpm hits:describe <candidate> "One factual sentence."`, after the justifications |
| sense of a word | `pnpm hits:sense id word "One sentence."`, or `pnpm hits:sense id word --clear` for an emptied field, after what inputs are |
| tags | `pnpm hits:tag id +tone:pun -subject:actor` |
| accept a near miss | `pnpm hits:ingest --date=<queue> --model=<judge> --only=id,… --status=accepted`; a row with no justification goes in as `proposed`, then `hits:justify` and `hits:set` |
| word order | `pnpm hits:order id room dirty`, after the ingest that writes a promoted near miss |
| note on a row | no command: the prompt lists it under the row's id and chosen order, and the agent acts on it with the commands above |
| seed | appends the lines to `data/candidates.jsonl` |
| block a promoted anagram | `pnpm promotions:block --code=<its code>`: the code alone, never the words |
| deep run | `pnpm hits:requeue …`, then `hits:enumerate --preset=deep`, `hits:prefilter --per-input=all` and `hits:screen` |

`hits:justify`, `hits:describe`, `hits:sense`, `hits:tag` and `hits:order` refuse an unknown id, an empty or over-long
sentence, a tag the schema does not allow, and words that are not the hit's own, and write nothing then. `hits:order` changes
only how the words read: the id, and so the hit's page address, stays the same. `hits:ingest --only` refuses
a row that is not in the queue, is already a hit, or has no valid verdict. An agent runs these only on what
the operator named, and writes a justification only when a note asks for one.

`hits:input` changes how a hit's input reads when its letters stay exactly the same, in the same order. The
search ignores digits, so "Big Brother 28" and "Big Brother" are one input with one id:

```bash
pnpm hits:input bigbrother:titles:brig-bro-the "Big Brother"
```

It refuses an input that would change the id ("Brother Big", "Big Brothers") and writes nothing then. The
id, the letters, the votes and the hit's page address stay as they are. An input with digits still matches
today, but numbers are to become letters in roadmap phase N, so an input that names a season or a sequel is
better without its number.

Prompt: `docs/prompts/apply-desk.md` (desk_branch, desk_commands, desk_notes, desk_row_notes). The desk fills it.
To publish the desk for a phone: `docs/prompts/publish-desk.md` (desk_branch, desk_queues).

## Audit the Discover page

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
   Filter by text or category, or show only the suggestions or what you have changed. **Order** puts each
   section in that order or by **Most votes**, ties A to Z as on the site, from the newest vote counts in
   `data/counts/`; a hit with votes shows how many.
3. Change a row's label to move it to another section or **Remove from the page** (`retired`), and edit its
   justification, what its input is, the senses of its words, tags or word order, or add a note, as in the
   review desk. Every row starts on its current label, so a prompt copied without changes changes nothing.
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

## What an input is

Each input carries one factual sentence saying what it is, `about`, and its English Wikipedia article,
`wikipedia`, when it has one. Both live on the candidate in `data/candidates.jsonl`, and every hit of that
input carries a copy, so a dataset row and the site's `hits.json` are complete on their own. Every tool that
writes either field keeps the copies the same.

**The rule.** One sentence, on one line, at most 200 characters, ending with a full stop. Facts only: no
opinion and no joke, and never about a private person. The schemas refuse anything longer or unfinished.

**Four ways a sentence is written.** Whichever comes first stays until you change it:

| Source | How |
|---|---|
| Wikidata | `hits:fetch` writes one for each new trending input from its item's English description ("American singer-songwriter (1946–2026)" becomes "Dolly Parton was an American singer-songwriter (1946–2026)."), and the link from its English Wikipedia article. The sentence is built mechanically, so read it. |
| the judge | Each input's first row in a judge batch shows its sentence or `(empty)`; for an empty one the judge may write one. Ingest keeps the first that follows the rule, and the routine's pull request lists it under About. |
| a submission | The issue form's "What the input is", or `about` on the MCP tool `propose_hit`, for an input that has none. A Build submission's "What the input is" is kept on the promotion (`about`, see "Build"); the review keeps or drops it, and when it keeps it and places the anagram, it reaches the input once you have approved the review (see "Review promotions"). |
| you | `pnpm hits:describe`, or About the input in the review desk or the audit. |

**Set or change one:**

```bash
pnpm hits:describe dormitory:phrases "A dormitory is a building of shared bedrooms, as at a school or college."
pnpm hits:describe starwars:titles --wikidata=Q462
pnpm hits:describe titanic:titles --wikipedia=https://en.wikipedia.org/wiki/Titanic_(1997_film)
pnpm hits:describe titanic:titles --wikipedia=none
```

It takes the **candidate** id, the first two parts of a hit id, since every hit of an input shares its
sentence. `--wikidata=Q…` names the item: it records the id and writes the sentence and the link from
Wikidata. `--wikipedia` sets or clears the link alone. It refuses an unknown id, a hit id, a sentence that
breaks the rule and an address that is not an English Wikipedia article, and writes nothing then. For an
input whose hits have no candidate line, such as the classics seeded before candidates existed, it appends
one as `manual` and `enumerated`. That line has no recorded run, so it reads as settings s1:
`pnpm hits:requeue --settings-before=s2` would send it back to `new`, as it would a `propose_hit` candidate.

**Find items for older inputs.** `pnpm hits:fetch --reclassify` does three things, and `--dry-run` shows them
without writing:

1. Moves unclassified candidates that the category table now places.
2. Finds the Wikidata item of each manual candidate outside phrases that has none, by its English Wikipedia
   title, taking the item only when its classes reach the candidate's own category. When the title finds
   nothing in that category but exactly one item with the input as its English label does, it prints that
   item as a suggestion and writes nothing for it: labels are shared by obscure items often enough (Peloton,
   a supercomputer program; Old England, a department store in Brussels) that a person confirms each one with
   `--wikidata`. It lists every input it left unmatched, with the reason.
3. Writes a sentence and a link for every placed candidate with an item and no sentence, and copies them to
   the hits. A sentence that exists, from any source, is never replaced.

## Senses on Discover

An opened row on Discover lists each word of the anagram with the dictionary's senses, in the dictionary's
order, and that order never changes: the three-toed sloth is the right first sense of `ai` everywhere but one
anagram. Where the first sense would not explain how an anagram reads a word, the hit carries its own sense for
that word, and the row shows it first, labelled In this anagram, with the dictionary's senses beneath. A word
with neither shows what it always has. Search results keep the dictionary as it is.

**The rule.** Write a sense only where the dictionary's first sense would not explain the reading, or where the
word has no definition: slang, an abbreviation or initialism, a name, a rare sense. Never restate a first sense
that already fits. One sentence on one line, at most 120 characters, ending with a full stop, for one of the
hit's own words. A sense is a reading of the word, never a fact about the input, which is what `about` is for
(see "What an input is"). A site addition's gloss already serves as its definition. The schema refuses a
sentence that breaks the rule, and the command and the tests refuse a sense for a word the hit does not have.

**Who writes one.** Three ways, and nothing else writes a sense; every one reaches the site through a pull
request you merge:

| Source | How |
|---|---|
| the judge | Every row of a judge batch lists its words, each with its first dictionary gloss or `no definition`. For a phrase of relation 3 and above, the judge may give `senses` for the words whose listed gloss would not explain the reading. Ingest refuses a verdict whose senses name a word its phrase does not contain, since that line was written for another row, and leaves off a sense that breaks the rule, keeping the verdict. The rest go on the hit and its judge entry, and the routine's pull request lists them under Senses. |
| you | `pnpm hits:sense`, or Senses of the words in the review desk or the audit, where a sense the judge wrote says so under its field. |
| one reviewed pass | Roadmap phase S3 (2026-09-17): every published hit's words read against their first gloss, and 134 senses set with the command, in one pull request that lists every one. |

**Set or clear one:**

```bash
pnpm hits:sense darioamodei:people:ai-da-doomer-i da "Short for the, as in casual speech."
pnpm hits:sense darioamodei:people:ai-da-doomer-i da --clear
```

To see where a sense might be wanted, list every published hit's words with their first dictionary gloss, or
`no definition`, and the senses already set (`--all` includes hits that are not published). It writes nothing:

```bash
pnpm hits:glosses
```

`hits:sense` takes the hit id, one of its words, and the sentence or `--clear`; a word used twice in a hit has one sense.
It refuses an unknown id, a word that is not the hit's, `--clear` given with a sentence, and a sentence that is
empty, over 120 characters or without a full stop, and writes nothing then. The file is rewritten in its
order, so the diff is the hit's one line.

**In the desk and the audit.** Each hit's row has **Senses of the words**: one field per word, holding its
sense, with the dictionary's first gloss beneath it (`Dictionary: a heavy Burmese knife`, or
`Dictionary: no definition`), so you can see where the reading differs. Writing in a field sets a sense and
emptying one clears it; each becomes a `pnpm hits:sense` command. Under a field, "Proposed by the judge."
marks a sense the judge wrote, and "The judge proposed:" quotes one you have changed. A near miss has no
fields until it is a hit; promoted with `hits:ingest --only`, it takes the judge's senses from its verdict.

**Where senses are kept.** `data/hits.jsonl` holds them on the hit as an object keyed by word, and the site's
`hits.json` carries it on the hits that have one. The dataset publishes `senses` as a list of `word` and
`sense` in reading order, or `null`, so the column keeps one type however many words get a sense.

## Votes on Discover

Readers vote for anagrams on Discover and promote the ones that are not there yet. A vote is for an
anagram already in a section: one per browser per anagram, taken back by pressing Vote again, never a vote
against. Most votes, the page's usual order, ranks each section by them; votes never move an anagram from one
section to another. A promotion is for any other anagram in a search, on the same terms, and asks for it to
be considered for a section; a submission from the Build page is a promotion with a note (see "Build").
The review reads them; see "Review promotions". When a promoted anagram is published, each promotion of it
becomes a vote. The search page shows both: a Discover block above the complete list, and Vote or Promote on
every row. The rules as readers see
them are at https://ars-magna.pages.dev/how.

| Piece | Where |
|---|---|
| the API | Cloudflare Pages Functions in `apps/web/functions/api/`: `GET /api/votes`, `POST /api/pass` (the check before a visit's first vote, promotion or submission), `POST /api/vote`, `GET /api/promotions?letters=`, `POST /api/promote` (promotions from search and submissions from Build). The logic and its tests are in `apps/web/src/votes/`. |
| the data | the D1 database `ars-magna-discoveries`, bound as `DISCOVERIES_DB` in `apps/web/wrangler.toml`: tables `votes`, `vote_counts`, `promotions`, `promotion_counts` and `rate_limits` |
| the schema | `apps/web/migrations/`, applied by Deploy before each upload |
| the check | the Turnstile widget `Ars Magna votes` for `ars-magna.pages.dev`; its site key is in `apps/web/src/votes/state.ts` |
| the secrets | `TURNSTILE_SECRET` and `IP_HASH_SECRET`, Pages secrets in the dashboard (Workers & Pages, `ars-magna`, Settings, Variables and Secrets) |
| the switches | `VOTES_OPEN` and `PROMOTIONS_OPEN` in `apps/web/wrangler.toml` |
| the block list | `data/promotions/blocks.jsonl`, by code only; the build copies it into `hits.json` as `blocked` (see "Review promotions") |
| clicks to votes | `apps/web/src/votes/convert.ts`, run by Deploy after each upload through `pnpm votes:convert --remote` |

A check that has produced nothing two minutes after Vote or Promote was pressed is abandoned: the widget
goes, nothing is saved, and the page tells the reader to try again.

**Which rows carry Vote.** The search shows one spelling for each set of words that share letters, so a
published anagram can sit behind a row that spells it another way: for `Doritos`, "its odor" is the row
"door sit". Such a row carries Vote for the published anagram, and its label names the Discover spelling:
`A stretch · its odor`. Every other row carries Promote.

**The promotions table.** One row per browser per anagram: `key` (the letters sorted, a colon, the words
sorted and joined with hyphens: `aaeeglmnnt:elegant-man`), `voter`, `input` as the reader typed it, `words` in
the order they saw, the `tier` they searched, `via` (`result` from a search, `typed` from Build), and
`created_at`. A submission from Build also fills `category`, `about` (what the input is, a column added by
migration `0003`), `why`, `credit` and `missing` (its word requests); the rest leave them empty. `converted_to`
(migration `0004`) is the hit a promotion's vote went to, once its anagram is published; the row stays.
`promotion_counts` holds each key's count, recounted with every change. A promotion of an anagram already on
Discover is refused, and the search page shows Vote for it instead.

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

Then open http://localhost:8788/hits, http://localhost:8788/#q=A%20gentleman for the search page's
Discover block and Promote, and http://localhost:8788/build for a submission.

## Build

The Build page, https://ars-magna.pages.dev/build, is where a reader makes an anagram by hand: a text, an
anagram of it, and two checks. When the letters match, the reader can submit it to Discover. The GitHub issue
form ("Add a hit by hand") stays open as a second way in, and the page links to it.

| Piece | Where |
|---|---|
| the page | `apps/web/build.html` and `apps/web/src/build/`; the letter tray and its arithmetic in `apps/web/src/lib/ledger.ts`, the two checks in `apps/web/src/lib/checks.ts` |
| the words check | the search's own engine and dictionary, loaded once the page is on screen, asked which tier each word is in |
| a submission | `POST /api/promote` with `via: "typed"`: a row in the promotions table (see "Votes on Discover") |
| the analysis | `apps/web/src/lib/analysis.ts`, from the dictionary's own part-of-speech masks and frequency bytes |
| the text's count | `apps/web/src/state/useTextCount.ts` (`useTextCounts`), a second worker started to count the four dictionaries and stopped when the last ends; its time limit and budgets in `apps/web/src/lib/textCount.ts` |

**The checks.** *Letters match* compares the two boxes' letters, folded as the search folds them:
apostrophes, hyphens and punctuation carry no letters, and digits, symbols and letters of other scripts are
listed as skipped. *Words known* reads each word between spaces against the tier the reader picks, and names a
word it lacks: `doomer is in Extended, not Standard` for a word a wider tier has, `qzx is not in the dictionary`
for one no tier has.

**The analysis** beneath the boxes counts the letters and the words of each side, names the parts of speech
the dictionary gives each word and how common it is, and, for the text alone, states how many anagrams the
text has at the chosen tier. The two sides share one grid: each labelled line is one row across both, so the
letter charts start level, and the charts list every letter either side has, with a faint 0 where one side
lacks it. `Rarest in English` names the letters present that are least common in English, from the table in
`lib/analysis.ts`, with their share (`j x · 0.15%`: j and x tie there); `Most used` names the letters the side
uses most, with the count (`o r · 2` for dormitory). Both list every letter that ties. On a phone the two
sides stack, each with its own labels. Each bar's darkness follows its count, in five steps of the ink's grey
(`--color-count-1` to `--color-count-5` in `apps/web/src/styles.css`, the step chosen in
`apps/web/src/lib/letterChart.ts`); hovering or focusing a bar shows its figure (`2 of 5 · 40%`), and selecting
one marks that letter in the accent, underlined, in both charts, the tray and both read-back lines, until it is
selected again or Escape is pressed. A tick on each letter's bar marks how many of that letter English would use
in as many letters (the table in `lib/analysis.ts`). Beneath the letters, **Word lengths** has a bar per length from
the shortest word on either side to the longest, and **Each word** places every distinct word on a fixed scale from
rare to everyday by its frequency byte, with faint marks where the bands meet. The **Letter map** sets the text above
the anagram and draws a fine line from each letter to where it went, a repeated letter matched in order; the selected
letter's lines take the accent, and a letter with no partner has none. It draws texts of up to `MAP_LIMIT` letters
(60, in `apps/web/src/lib/letterMap.ts`, a number you may tune) and says so in a sentence past that. Nothing in the
analysis is stored or sent anywhere.

**The count.** The text's anagrams are counted in all four dictionaries, one at a time, the chosen one first, and
shown as four lines, Common to Extended, with the chosen one set darker. Each is the engine's number, counted in a
second worker of its own, so the word checks never wait behind it; changing the dictionary counts nothing again.
That worker holds its own copy of the dictionary (about 70 MB measured in Chrome, near 100 MB once a count has
run), so it is started when the counting begins, from the copy the page's first worker cached, and stopped when
the last count ends. The engine cannot stop a count from inside, so the moment the text
changes, a count still running is abandoned by stopping its worker, and a count that reaches its limit is
stopped the same way, a fresh worker taking the next dictionary. Each count runs for at most
`BUILD_COUNT_LIMIT_MS` (4,000 milliseconds, in `apps/web/src/lib/textCount.ts`, a number you may
tune). It counts with a small node budget first and a budget four times larger each time one runs out,
so when the time is up the line reads `more than N` from the last budget that finished. A dictionary in
which no budget found a single anagram in that time reads `Too long to count here.`, and whenever a count
stopped at the limit the page adds `Each count stops after 4 seconds; “more than” means it stopped first.`
A long text takes up to four times the limit to fill all four lines. Texts of about 20 letters count
exactly in well under a second; the time limit starts to matter at about 25.

**A submission** is the reader's promotion of that anagram, with a note: a category (required), and, when
given, what the input is (the rule in "What an input is"; the API refuses one that breaks it), why it is good
(up to 500 characters) and a credit (up to 60). It records the narrowest tier that holds every word the
dictionary has. A word in no tier at all goes in `missing`, and the page tells the reader "qzx is not in the
dictionary; it will be reviewed as a word request too." A word that only a wider tier has is not a word request,
since the vocabulary already has it. A submission counts once per browser like any promotion: a second one
replaces the note, and pressing Promote on the same anagram in a search takes it back.

- **The limits.** A submission's text holds at most 80 letters (`MAX_TYPED_LETTERS` in
  `apps/web/src/votes/core.ts`, a number you may tune); the page itself has no cap. It passes the same
  Turnstile check as votes and counts against the promotions' hourly limit.
- **An anagram already on Discover** shows a link to it instead of the form, and the API refuses it.
- **Pausing.** `PROMOTIONS_OPEN = "false"` pauses submissions with promotions; the page says `Submissions are
  paused.`

**Print, export and links.** The page carries both boxes in its address (`/build#t=…&a=…`, with `d=` for a
dictionary other than Standard), so a check can be shared or kept. `Print` opens the browser's own print
dialog, where every platform offers Save as PDF; a print stylesheet drops the header, the footer, the tray,
the dictionary picker and the form, and leaves the boxes, the checks and the analysis. `Export` writes the
analysis as TXT or JSON. Every search result row and every Discover row links to Build with that row already
in its boxes, and the search toolbar links with the text alone.

**Read the submissions.** Read-only, from `apps/web`:

```bash
pnpm dlx wrangler@4.121.0 d1 execute ars-magna-discoveries --remote --command "SELECT key, input, words, tier, category, about, why, credit, missing, created_at FROM promotions WHERE via = 'typed' ORDER BY created_at DESC LIMIT 20"
```

The review reads each submission's note, and only what you approve reaches `data/`: what the input is and the
credit when the review kept them, never why it is good (see "Review promotions").

## Review promotions

When readers have promoted anagrams from a search, or submitted them from Build, and you want them read,
placed and published. Nothing a reader typed reaches this public repository, a workflow log or a public page
until the review has placed it and you have approved it, and no voter id ever leaves the database.

| Step | Who | What it writes |
|---|---|---|
| 1. Export | the Export promotions Action, after each Hits nightly | here: `data/counts/<date>/`, the day's votes by hit and promotions by code; in the private repository `ars-magna-promotions`: `export/<date>.jsonl`, every promotion with what readers typed and the engine's check |
| 2. Review | a model: the judge routine, or a session you start | a pull request in the private repository, `review/<date>`, with `reviews/<date>.jsonl` and `reviews/<date>.md` |
| 3. Approve | you, by merging that pull request | the private repository's `main` |
| 4. Apply | `pnpm promotions:apply`, in the next judge routine run | the routine's public pull request: hits, candidates, word requests, `data/promotions/decisions.jsonl` and `data/promotions/reviews/<date>.md` |
| 5. Publish | you, by merging the public pull request | the site; Deploy then makes each promotion of a newly published anagram a vote |

**The export** reads the database with SELECT statements only and never the voter column. Each day's counts
list a promoted anagram by the SHA-256 of its key (its code), never its words, and only when the engine finds
every word and it is not blocked; the rest are counted in `meta.json`, which also states the convention. The
folders are never squashed; a second run on one day replaces that day's. The export prints totals only,
because this repository's workflow logs are public. Without `PROMOTIONS_DEPLOY_KEY` it writes the counts
alone. Pause it with `gh variable set EXPORT_PROMOTIONS --body off` (delete the variable to resume), or
`gh workflow disable "Export promotions"`; while Hits nightly is disabled it does not run on its own, so run it
by hand from the Actions tab to keep the daily counts.

**The review** reads every promoted anagram not yet decided, most promoted first, up to 100 a run
(`REVIEW_LIMIT` in `tools/hits/src/promotions/files.ts`, a number you may tune), with the judge's rubric (v2)
and its own instructions (`tools/hits/prompts/review.md`), under the checks in "A night that is refused". For
each it assigns the category of a search and checks the reader's on a submission; says whether the input is
a private person, whose anagram is never added and is kept as a code and a count only; keeps or drops the
reader's "What the input is" and credit; and forwards the words in no tier worth asking for. An anagram
decided before is read again once its promotions have doubled (`REREVIEW_FACTOR`), and one waiting on a word
once the export's check passes. A blocked anagram, or one whose words no page could have sent, is never read.
No review starts while an earlier one waits for its merge, or before the day's export.

**Approve it.** Open the pull request in `ars-magna-promotions` and read `reviews/<date>.md`: what it would
place, with the justification and the reader's note (what it kept and what it dropped; why it is good is never
published), the near misses and those with no link, those waiting on a word, and a private person's by code
only. Merging approves all of it. To hold one back, change its `outcome` to `near` in `reviews/<date>.jsonl` on
the branch before merging. To reject the whole review, close the pull request and delete its branch; the next
review reads those anagrams again.

**Placement** happens at apply, against the hits of that day, by the queue's rule: relation 4 or 5 that reads 2
or 3 to Interesting (a 5 flagged for Greatest Hits), relation 3 that reads 2 or 3 to A stretch, three to an
input, then up to five alternates, and the rest near misses. A placed promotion is tagged `promoted`, a placed
submission `submitted` with the credit as its `submitter` when the review kept it. A new input becomes a
candidate with the source `promotion` or `submission`. `data/promotions/decisions.jsonl` records every
decision by code, with no text; a private person's reads `withheld`. The routine's pull request carries
`data/promotions/reviews/<date>.md`: only the anagrams placed and the reader-written sentences kept, which
merging publishes. Change one on the branch with `pnpm hits:describe` or `pnpm hits:justify`, as with any hit.

**Clicks become votes.** After each upload, Deploy runs `pnpm votes:convert --remote`: every promotion of a
published anagram not yet converted becomes a vote for its hit, dated from the promotion, and is marked with
the hit's id (`converted_to`). Running it again adds nothing, a vote taken back afterwards stays taken back, and
the promotion rows are kept. When two published hits share a key (Listen and Enlist both give "silent"), the
first added takes the votes. A blocked anagram is never converted.

**Block an anagram** that should never be promoted, by its key from the private export or review, or its code:

```bash
pnpm promotions:block aaeeglmnnt:am-entangle
pnpm promotions:block --code=<64 hex characters>
```

It appends the code to `data/promotions/blocks.jsonl`, never the words. Commit it in a pull request; once it is
deployed, the API refuses its promotions and leaves them out of the counts, the search page and Build hide its
Promote and Submit (Build says "This anagram cannot be submitted."), the export leaves it out of the public
counts, and the review skips it. Its promotions stay in the database.

**Set up the private repository**, once:

1. Create the private repository `ars-magna-promotions` on GitHub, empty.
2. On this Mac, make a deploy key and hand it over; the private key never passes through a chat. Every
   command names its repository, so it works from any folder:

   ```bash
   ssh-keygen -t ed25519 -N '' -f promo
   gh repo deploy-key add promo.pub --repo ryanjosephkamp/ars-magna-promotions --allow-write --title "Export promotions"
   gh secret set PROMOTIONS_DEPLOY_KEY --repo ryanjosephkamp/ars-magna < promo
   gh secret list --repo ryanjosephkamp/ars-magna
   ```

   Once the list shows `PROMOTIONS_DEPLOY_KEY`, delete both files with `rm promo promo.pub`. Without
   `--repo`, `gh secret set` stores the secret on whichever repository the folder belongs to, or on none, and
   the export then writes the day's counts alone ("No PROMOTIONS_DEPLOY_KEY" in its log). To start again, remove
   the old key with `gh repo deploy-key list` and `gh repo deploy-key delete <id>`, both with
   `--repo ryanjosephkamp/ars-magna-promotions`, and repeat this step.

3. Give the Claude GitHub App access to `ars-magna-promotions` (github.com/settings/installations), add it to the
   judge routine as a second repository on the routine's page, and carry the routine's prompt over ("Manage the
   judge routine").
4. Run Export promotions once by hand from the Actions tab. Its step "Push the private export" runs rather
   than being skipped, and `export/<date>.jsonl` arrives in the private repository (empty until a reader
   promotes something).
5. The routine opens the private review pull request itself only if it can push there; its pull request body
   says so when it could not. Until then, review in a session.

**In the review desk.** Built with `--promotions=../ars-magna-promotions`, the desk has a **Promoted** tab
(see "Review in the desk"): every anagram in the newest export, most promoted first, with what each reader typed
and the review's decision on it, what the routine published, and the hit it became. The page then holds what
readers typed, so it is only ever a file on this Mac or a private Artifact.

**Review in a session** on this Mac, with the private repository cloned beside this one: paste
`docs/prompts/review-promotions.md`. It uses the same commands, with `--judged-by=hand`, and opens the same
private pull request. To publish as soon as you have merged it, rather than in the next routine run, run
`pnpm promotions:apply --from=../ars-magna-promotions` on a branch off `main`, then the four suites, and open a
pull request. Without the private repository, `pnpm promotions:export --out=.cache/promotions` writes the
export to a gitignored folder here instead, and `--from=.cache/promotions` reviews it.

Prompt: `docs/prompts/review-promotions.md`.

## The monthly vote review

When the routine's pull request carries a section "Monthly vote review <month>", once a month. Votes never move
an anagram by themselves; once a month they nominate.

- **A stretch, read again.** The top tenth of A stretch by votes, each with at least 5 votes, is read again by the
  routine's model with its own instructions (`tools/hits/prompts/monthly.md`). It may move **one** to Interesting,
  with the tag `shelf:interesting` (and `shelf:stretch` off, if you had placed it there), and only when its link
  plainly meets Interesting's bar. Every row it read gets a decision and a sentence of its own, under the same
  repeated-sentence check as a queue.
- **Greatest Hits suggestions.** The top tenth of Interesting by votes, each with at least 5 votes, is listed for
  you. Nothing is promoted: a hit joins Greatest Hits only by your named decision,
  `pnpm hits:set --status=featured <id>`.
- **Votes** come from the newest daily counts, `data/counts/<date>/votes.jsonl` (see "Review promotions"), ranked
  as the site ranks a section: most votes first, a tie A to Z. The desk's and the audit's Most votes order shows
  the same ranking.

**How the routine knows it is the month's turn**, with no schedule of its own: each review writes
`data/votes/monthly/<month>.md` and `.jsonl`, which the routine's pull request carries. A run is the month's turn
when neither `main` nor any open `hits/*` branch holds that month's record, so the first run of each UTC month does
it and every later run that month finds it. If you close that pull request unmerged, the next run does the review
again; a run that cannot see the open branches skips it rather than risk doing it twice. When nothing has 5 votes,
the month is still recorded, saying so.

**Review it** in the routine's pull request, which has the section in its body: the move with its sentence, every
row that stays with its sentence, and the suggestions. Merging approves the move. To keep that hit in A stretch
instead, on the branch run the command the section prints (`pnpm hits:tag <id> -shelf:interesting`, plus
`+shelf:stretch` if you had placed it there), commit and push. `data/votes/monthly/<month>.jsonl` keeps every row it
read, the ones that stay included, with the model, who ran it, and the counts' date.

**The numbers**, which you may tune in `tools/hits/src/monthly.ts`: `MONTHLY_SHARE` (the top tenth), `MONTHLY_MIN_VOTES`
(5) and `MONTHLY_MOVES` (1).

**By hand**, when the routine is paused or a month was missed: paste `docs/prompts/monthly-vote-review.md` into a
session on this Mac. `pnpm hits:monthly --month=YYYY-MM` names another month.

Prompt: `docs/prompts/monthly-vote-review.md`.

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
   or dropped by script, and never more than 12 for one input. An older queue without screen files skips
   this step. The session reads every file itself; judging a queue by hand is not a deep run, and hands
   nothing to subagents.
3. `pnpm hits:judge --date=<folder>` checks the screen answers, writes the kept phrases to
   `screened.jsonl`, and writes `judge-input-N.md` files into the folder: the rubric, then the candidates,
   each with its words and their first dictionary glosses.
4. Have a Claude session answer every judge file into `judge-output.jsonl`, one JSON line per candidate,
   forming each verdict itself rather than giving groups of rows a default score by script. With
   `ANTHROPIC_API_KEY` set in your shell, `pnpm hits:judge --date=<folder> --via=api` writes the judge's
   answers through the API instead; the screen is always answered in a session. Each justification is
   written for its own phrase: ingest refuses a file in which one sentence, with the words it quotes
   masked, is on more than three verdicts.
5. `pnpm hits:ingest --date=<folder> --model=<the model that judged> --judged-by=hand` re-checks every phrase with the
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
    that now fit to `new` ("Growing the category table" in `automation/RUNBOOK.md`). It also looks up
    items for manual candidates and writes what inputs are ("What an input is").
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

## A night that is refused

When a pull request titled `Greatest Hits: <date> not judged` appears, or a routine pull request reads like
2026-09-18's. That night the routine handed its files to subagents: the screen kept 783 phrases where earlier
nights kept 6 to 43, 448 of them for one input, and a keyword script scored those and wrote their
justifications from templates. The routine's prompt already forbade it, so the tools now refuse such a night:

| Check | What it refuses | Where |
|---|---|---|
| the screen's keep cap | an input that keeps more than 12 phrases through the screen (`SCREEN_KEEP_CAP`); the routine's nights before 2026-09-18 never kept more than 3 | `pnpm hits:judge`, before it writes anything |
| repeated sentences | a verdict file in which one justification, with the words it quotes masked, is on more than 3 verdicts (`REPEAT_CAP`); the message names each sentence and its count | `pnpm hits:ingest`, before it writes anything |
| the alternates cap | nothing: an input keeps at most 5 alternates (`ALTERNATE_CAP`), and the rest stay with the near misses | `pnpm hits:ingest` |
| who judged | a queue ingest without `--judged-by=routine` or `--judged-by=hand` | `pnpm hits:ingest` |

The numbers live in `tools/hits/src/guards.ts` and `tools/hits/src/shelf.ts`, and you may tune them. A deep
run's queue, whose `summary.json` records the deep preset's limit of 50,000, is not held to the keep cap, since
a deep run screens up to 300 phrases an input on purpose; the repeated-sentence check holds there too. The
rubric also says a word carried over from the input is not a link by itself: that is what scored "Eternal Blue"
→ "eternal lube" a 5.

A refusal writes nothing, and the routine is told to read those inputs or rows again, answer them properly,
and run the command again. If it still cannot, or if it cannot read the whole queue in one session, it commits
none of its answers and opens `Greatest Hits: <date> not judged`, which adds one row to
`data/queue/EXCLUDED.md` and nothing else.

**The ledger.** `data/queue/EXCLUDED.md` lists every judging of a queue that never reached `main`, and why: a
run the checks refused, one too large to read, and one you closed unmerged after review, as #72 was. Its first
row is 2026-09-18. The queue's folder keeps its screen input, and the routine skips any folder the ledger names.

What to do:

- **A `not judged` pull request:** read why in its body, and merge it as it is, so the ledger stays complete.
  To have the night judged after all, judge it by hand ("Judge a queue by hand", naming the folder), which
  adds its answers as a new entry beside the ledger's row.
- **A routine pull request that should have been refused** (a failure no check catches yet): close it
  unmerged with a comment saying why, keep its branch, and add its row to the ledger in the next pull request
  that touches the file. Then say what the tools should have caught.
- **To see who judged what:** from 2026-09-19 every judge entry on a hit, and each candidate's run for the
  queue, records `judged_by` (`routine`, or `hand` for a session you started, a deep run included) beside the
  model, so the near misses and relation 1 verdicts in `judge-output.jsonl` can be traced too.

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
   - ingests with the engine check on and `--judged-by=hand`, and opens a pull request titled
     `Greatest Hits deep run: <category>, <N> new`.

   The screen's keep cap does not apply to a deep run's queue, which screens up to 300 phrases an input on
   purpose; ingest's refusal of repeated sentences does (see "A night that is refused"). The routine's rule
   of one session and no subagents is the routine's: a deep run still works through subagents, each reading
   every phrase of its file itself.
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

1. The merge's runs passed. CI and Deploy run on every merge; Publish hits only when `data/hits.jsonl`,
   `tools/hits/src/publish.ts` or `tools/hits/templates/dataset-card.md` changed:

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

5. In a browser, search for `dormitory` at https://ars-magna.pages.dev. It reads `115 anagrams` and, beside
   the count, `The text itself is left out.`: `dormitory` is a word no other word shares its letters with,
   and the text is never listed as its own anagram, so that one row is gone and the count is one fewer
   than the 116 the letters alone would give. `below` reads 6 with `elbow` first and no such sentence,
   since that row is shown with another word of the same letters. Then open
   https://ars-magna.pages.dev/hits. Its count matches step 2, and its Greatest Hits, Interesting and A
   stretch sections add up to it: the Discover page fetches `hits.json` from the
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
| Repositories | https://github.com/ryanjosephkamp/ars-magna, and the private https://github.com/ryanjosephkamp/ars-magna-promotions once you have added it (see "Review promotions") |
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
| `CLOUDFLARE_API_TOKEN` | repository secret | Deploy: the upload, the votes database migrations and clicks to votes; Export promotions: SELECT only | Cloudflare, My Profile, API Tokens, with Cloudflare Pages: Edit and D1: Edit |
| `TURNSTILE_SECRET` | Pages secret | the vote API's check before voting | Cloudflare, Turnstile, the `Ars Magna votes` widget, its secret key |
| `IP_HASH_SECRET` | Pages secret | the vote API: connection hashes for rate limits, and passes | any long random string, such as `openssl rand -hex 32` |
| `CLOUDFLARE_ACCOUNT_ID` | repository secret | Deploy | the Cloudflare dashboard sidebar; it changes only with the account |
| `ANTHROPIC_API_KEY` | your shell only | `hits:judge --via=api`, `hits:fetch --classify-with-haiku` | the Claude Console |
| `XAI_API_KEY` | your shell only | the second judge column in `hits:judge --via=api` | the xAI console |
| `CLOUDFLARE_PROJECT_NAME` | repository variable, `ars-magna` | Deploy's on switch | not a secret |
| `PUBLISH_HITS` | repository variable, unset | `off` pauses Publish hits | not a secret |
| `PROMOTIONS_DEPLOY_KEY` | repository secret | Export promotions: pushes the private export to `ars-magna-promotions` | a new key pair: `ssh-keygen`, the public half added to that repository as a deploy key with write access (see "Review promotions") |
| `EXPORT_PROMOTIONS` | repository variable, unset | `off` pauses Export promotions | not a secret |

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
