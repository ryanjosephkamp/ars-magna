# Judge the nightly queue

You are screening and judging candidate anagrams for the Ars Magna Greatest Hits dataset. The repository is checked out for you. Work in it; do not touch anything outside it.

## What to do

1. Find the newest queue folder under `data/queue/` that has no `judge-output.jsonl` and has either `screen-input-*.md` files or, for an older queue, a non-empty `prefiltered.jsonl`. Skip a folder with neither: that was a thin night, not a failure, and it needs nothing from you. If no folder qualifies, stop and say so, naming any folders you skipped; there is nothing to judge.
2. Run `pnpm install --frozen-lockfile`.
3. If the folder has `screen-input-N.md` files, screen them. Each file holds the screen instructions, then inputs with numbered phrases. Work through one file at a time: read every phrase yourself, then append that file's answers to `data/queue/<date>/screen-output.jsonl` before you open the next file. Write one JSON line per section, and nothing else. A script may write out lines you have already decided, but it never decides which phrases to keep. Every section gets an answer, with `"keep": []` when no phrase in it has a link. An older queue has no screen files and skips this step.
4. Run `pnpm hits:judge --date=<that folder's name>`. For a screened queue it first checks your screen answers against the files. If they do not fit, it lists the problems; fix `screen-output.jsonl` and run the command again. It writes one or more `judge-input-N.md` files into the folder: the rubric, followed by the candidates to judge.
5. Read each `judge-input-N.md` and judge every candidate in it against the rubric, exactly as the file instructs. Work through one file at a time: form each verdict yourself from that candidate's own line, and append that file's verdicts before you open the next one. A script may write out lines you have already decided, but it never decides a score; a default score given to a group of rows is not a verdict. Most candidates have no link to their input and get relation 1; a loose but real link is a 3, and from 3 up a justification is required. Write your verdicts, one JSON line per candidate and nothing else, appended to `data/queue/<date>/judge-output.jsonl`. Every candidate id in the inputs must appear exactly once in the output. If `pnpm hits:judge` wrote no input files because the screen kept nothing, it has already written an empty `judge-output.jsonl`; go on to the next step.
6. Run `pnpm hits:ingest --date=<date> --model=<your model id, e.g. claude-sonnet-5> --no-engine-check`. The sandbox has no WASM build of the engine, and building one there is slow and unreliable (it needs wasm-pack and a binaryen download), so do not try. With `--no-engine-check` the letters are still checked; only the dictionary lookup is skipped, and the queue's rows came from the engine in the first place. On a machine where `packages/engine/src/wasm/` already exists, drop the flag.
7. Read `data/queue/<date>/ingest-report.md`. Create a branch named `hits/<date>`, commit `data/hits.jsonl`, `data/candidates.jsonl`, `data/vocabulary/requests.jsonl` if the ingest changed it, and everything in `data/queue/<date>/` except `raw.jsonl` and `judge-input-*.md`, with the message `Greatest Hits: <N> new for <date>`, where N is the number of new hits the report gives.
8. Push the branch and open a pull request against `main` with the same title. The body is the ingest report, which says what merging accepts, followed by one line naming the model that screened and judged and the rubric version. If N is zero, still open the pull request: the screened and judged queue is part of the record, and a person should see that nothing cleared the bar.

## Rules

- Never edit `data/hits.jsonl` by hand; only `pnpm hits:ingest` writes it.
- Never change a candidate's status yourself.
- The rubric lets a verdict carry a `request`: a word you believe the vocabulary is missing. It is rare and optional, and it is a proposal for a person to read, never a change you make. Never add a word to `data/vocabulary/additions.jsonl`, never run `pnpm vocab:add`, and never let a request change the scores you give. If you cannot name a source you are sure of, leave it out; an invented source is worse than no request.
- Do not push to `main`.
- Do not schedule follow-ups, reminders or later check-ins. When the pull request is open, you are done; a person reviews it.
- If anything fails in a way these steps do not cover, stop, leave the queue as it is, and say what happened.

<!--
Setup, for a person:

Cloud routine (Claude Code): it exists, created 2026-09-12 as "Judge the
nightly queue", https://claude.ai/code/routines/trig_01VdomdgqWVjsNdo33BHQFNg,
with these settings:
  repository  https://github.com/ryanjosephkamp/ars-magna
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
