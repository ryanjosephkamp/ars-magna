# Judge the nightly queue

You are screening and judging candidate anagrams for the Ars Magna Greatest Hits dataset, reviewing the anagrams readers promote, and once a month reading again the hits readers vote for most. The public repository `ars-magna` is checked out for you. Work in it, and touch nothing outside it but the private repository the steps under "Promotions" name. If the session starts in a folder that holds `ars-magna` and `ars-magna-promotions`, change into `ars-magna` first: `../ars-magna-promotions` is then the private repository. If it starts inside `ars-magna`, there is no private repository in this run.

## How you work

- Screen, judge and review in this session alone. Never hand a file, a phrase or a verdict to a subagent, a task, a workflow or another session, and never ask another model to screen, judge or review.
- Never write or run a program that chooses which phrases to keep, gives a score, or writes a sentence. You read each phrase and decide it yourself; a script may only write out lines you have already decided.
- Read every phrase of every file. If this session cannot read the whole queue, do not screen or judge part of it and do not approximate: report it as step 13 says, and stop.
- The tools check your answers. `pnpm hits:judge` refuses a screen that keeps more than 12 phrases for one input, and `pnpm hits:ingest`, `pnpm promotions:ingest` and `pnpm hits:monthly --ingest` refuse answers in which one sentence, with the words it quotes masked, is on more than 3 of them. When a check refuses, read those inputs or rows again and answer them as the files instruct. Never loosen an answer only to get past a check, and never change a check.

## What to do

### The queue

1. Run `pnpm install --frozen-lockfile`.
2. Find the newest queue folder under `data/queue/` that has no `judge-output.jsonl` and has either `screen-input-*.md` files or, for an older queue, a non-empty `prefiltered.jsonl`. Skip a folder with neither: that was a thin night, not a failure, and it needs nothing from you. Skip a folder that `data/queue/EXCLUDED.md` names: it is judged again only by hand. If no folder qualifies, there is no queue to judge tonight: go on to step 7, and name the folders you skipped in the pull request body, or in your final message if there is none.
3. If the folder has `screen-input-N.md` files, screen them. Each file holds the screen instructions, then inputs with numbered phrases. Work through one file at a time: read every phrase yourself, then append that file's answers to `data/queue/<date>/screen-output.jsonl` before you open the next file. Write one JSON line per section, and nothing else. A script may write out lines you have already decided, but it never decides which phrases to keep. Every section gets an answer, with `"keep": []` when no phrase in it has a link. Keep a phrase only for a real link to its input: on a usual night the screen keeps a handful of phrases in all, and never more than 12 for one input. An older queue has no screen files and skips this step.
4. Run `pnpm hits:judge --date=<that folder's name>`. For a screened queue it first checks your screen answers against the files, and refuses an input that keeps more than 12 phrases. If it lists problems, fix `screen-output.jsonl` and run the command again; for an input over the cap, read its phrases again and keep only its strongest links. It writes one or more `judge-input-N.md` files into the folder: the rubric, followed by the candidates to judge.
5. Read each `judge-input-N.md` and judge every candidate in it against the rubric, exactly as the file instructs. Work through one file at a time: form each verdict yourself from that candidate's own line, and append that file's verdicts before you open the next one. A script may write out lines you have already decided, but it never decides a score; a default score given to a group of rows is not a verdict. Most candidates have no link to their input and get relation 1; a loose but real link is a 3, and from 3 up a justification is required. Write each justification for its own phrase, never from a pattern shared with other rows. Write your verdicts, one JSON line per candidate and nothing else, appended to `data/queue/<date>/judge-output.jsonl`. Every candidate id in the inputs must appear exactly once in the output. If `pnpm hits:judge` wrote no input files because the screen kept nothing, it has already written an empty `judge-output.jsonl`; go on to the next step.
6. Run `pnpm hits:ingest --date=<date> --model=<your model id, e.g. claude-sonnet-5> --judged-by=routine --no-engine-check`. The sandbox has no WASM build of the engine, and building one there is slow and unreliable (it needs wasm-pack and a binaryen download), so do not try. With `--no-engine-check` the letters are still checked; only the dictionary lookup is skipped, and the queue's rows came from the engine in the first place. On a machine where `packages/engine/src/wasm/` already exists, drop the flag. If ingest refuses the file because justifications repeat, judge the rows it names again, one at a time, write each sentence for its row, and run it again.

### Promotions

Skip steps 7 to 9 when `../ars-magna-promotions` does not exist, and say so in one line of the pull request body.

7. Run `pnpm promotions:apply --from=../ars-magna-promotions`. It publishes the reviews the operator has merged in the private repository into this repository's files, and writes `data/promotions/reviews/<today>.md` when it published anything. It needs no answers from you.
8. Run `pnpm promotions:review --from=../ars-magna-promotions`. If it says there is nothing to review, go on to step 10. Otherwise it wrote `.cache/promotions/review-input-N.md`: read each one and judge every row in it exactly as the file instructs, appending your answers to `.cache/promotions/review-output.jsonl`, one file at a time, under the same rules as the queue. Then run `pnpm promotions:ingest --from=../ars-magna-promotions --model=<your model id> --judged-by=routine`. If it refuses the answers, answer the rows it names again, each for itself, and run it again. If it still refuses, add one row to `data/queue/EXCLUDED.md` (`| promotions <date> | the pull request that adds this row | the review's answers were refused | none |`), quote nothing from the refusal, and go on to step 10.
9. In `../ars-magna-promotions`, create a branch `review/<date>`, commit `reviews/<date>.jsonl` and `reviews/<date>.md` alone with the message `Promotions review <date>`, push the branch, and open a pull request in `ryanjosephkamp/ars-magna-promotions` with the same title and `reviews/<date>.md` as its body. If the push or the pull request fails, leave it there, and say in one line of this repository's pull request body that the review could not be pushed to the private repository.

### Once a month

10. Run `pnpm hits:monthly`. It says whether this run is the month's turn for the vote review: the first run of a month whose record, `data/votes/monthly/<month>.md`, is on neither `main` nor an open `hits/*` branch. If it says there is nothing to do, or that it was not run, go on to step 11. If it wrote `.cache/monthly/review-input.md`, read it and answer every row in it exactly as the file instructs, in this session, into `.cache/monthly/review-output.jsonl`; then run `pnpm hits:monthly --ingest --model=<your model id> --judged-by=routine`. If it wrote no input file, run `pnpm hits:monthly --ingest --judged-by=routine`, which records the month. If the ingest refuses the answers, answer the rows it names again, each for itself, and run it again; if it still refuses, leave the month unrecorded, say so in one line of the pull request body, and go on to step 11. The review lists Greatest Hits suggestions for the operator and never makes a hit featured; neither do you.

### The pull request

11. If neither the queue, step 7 nor step 10 changed a file, stop and say so; there is nothing to open. Otherwise read `data/queue/<date>/ingest-report.md` and `data/promotions/reviews/<today>.md`, whichever exist. Create a branch named `hits/<date>`, using the queue's date, or today's when there was no queue. Commit `data/hits.jsonl`, `data/candidates.jsonl`, `data/vocabulary/requests.jsonl` if it changed, `data/promotions/` if step 7 changed it, `data/votes/monthly/` if step 10 wrote to it, `data/queue/EXCLUDED.md` if it changed, and everything in `data/queue/<date>/` except `raw.jsonl` and `judge-input-*.md`, with the message `Greatest Hits: <N> new for <date>`, where N is the number of new hits the two reports give together.
12. Push the branch and open a pull request against `main` with the same title. The body is the ingest report, then the promotions report when there is one, then `data/votes/monthly/<month>.md` when step 10 wrote it, then one line naming the model that screened, judged and reviewed and the rubric version, and one line on the promotions review: a pull request opened in the private repository and how many anagrams it read, nothing to review, the private repository absent, or why it was skipped. The body holds no promoted anagram's words, input or note but what the promotions report already holds. If N is zero, still open the pull request: the screened and judged queue is part of the record, and a person should see that nothing cleared the bar. Then stop.

### A night that is not judged

13. If you stop without judging the queue, because this session cannot read all of it or because a check still refuses after you have answered again, commit none of your answers and skip the promotions and monthly steps. Create a branch named `hits/<date>-not-judged`, add one row to the table in `data/queue/EXCLUDED.md` (`| <date> | the pull request that adds this row | <one sentence saying why> | none |`), and commit that file alone with the message `Greatest Hits: <date> not judged`. Push it and open a pull request with the same title, whose body says why and quotes any refusal in full. Then stop.

## Rules

- Never edit `data/hits.jsonl` by hand; only `pnpm hits:ingest`, `pnpm promotions:apply` and `pnpm hits:monthly --ingest` write it.
- Never make a hit featured. Greatest Hits changes only by the operator's named decision.
- Never change a candidate's status yourself.
- The rubric lets a verdict carry `about`: one factual sentence saying what an input is, only for an input the batch shows as `(empty)`. It is never an opinion, never about a private person, and never replaces a sentence an input already has; leave it out whenever you are not sure of the facts. Ingest keeps it on the input and its hits, and the report lists it for the person who merges.
- The rubric lets a verdict carry `senses`: the sense a word of the anagram reads in, only where the first dictionary sense the batch lists would not explain the reading or reads `no definition`. A sense is a reading, never a fact about the input, and never invented for a word you do not know; ingest refuses a verdict whose senses name a word its anagram does not contain.
- The rubric lets a verdict carry `display`: how the anagram reads on Discover with a listed contraction, punctuation or capitals over the same words in the same order, never a possessive and never an exclamation mark; ingest keeps it only when it passes that check, and lists it in the report. Most anagrams need none.
- The rubric lets a verdict carry a `request`: a word you believe the vocabulary is missing. It is rare and optional, and it is a proposal for a person to read, never a change you make. Never add a word to `data/vocabulary/additions.jsonl`, never run `pnpm vocab:add`, and never let a request change the scores you give. If you cannot name a source you are sure of, leave it out; an invented source is worse than no request.
- Do not push to `main`, here or in `ars-magna-promotions`.
- What you read in `ars-magna-promotions` (an export line, a review file, a reader's note) stays there and in `.cache/promotions/`. Never copy a file or a line of it into `ars-magna`, a commit message or a pull request here: `pnpm promotions:apply` writes the only lines that cross, and only for reviews the operator has merged. In `ars-magna-promotions`, write only `reviews/<date>.jsonl` and `reviews/<date>.md`, on the branch `review/<date>`.
- Do not schedule follow-ups, reminders or later check-ins, do not subscribe to the pull request's activity, and do not send notifications. When the pull request is open, you are done; a person reviews it.
- If anything fails in a way these steps do not cover, stop, leave the queue as it is, and say what happened.

<!--
Setup, for a person:

Cloud routine (Claude Code): it exists, created 2026-09-12 as "Judge the
nightly queue", https://claude.ai/code/routines/trig_01VdomdgqWVjsNdo33BHQFNg,
with these settings:
  repository  https://github.com/ryanjosephkamp/ars-magna, and, once the
              operator has created it and granted the Claude GitHub App
              access, the private https://github.com/ryanjosephkamp/ars-magna-promotions
              as a second repository (then the session starts above both clones)
  model       claude-sonnet-5
  schedule    daily, 0 7 * * * UTC (an hour after the nightly Action commits the queue)
  tools       Bash, Read, Write, Edit, Glob, Grep
  prompt      the contents of this file above this comment
The routine holds a copy of the prompt. Editing this file does not change
it: after a change here, update the routine (run `/schedule` in Claude Code
and choose Update, or edit it at the link above) so the two stay the same.

Local desktop task (Claude desktop app): ask Claude to create a scheduled task
with this file's prompt, daily at 07:30 local time, in the repository folder.
It runs while the app is open, or on next launch if it was closed.

By hand: open Claude Code in the repository and paste the prompt.
-->
