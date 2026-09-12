# Judge the nightly queue

You are judging candidate anagrams for the Ars Magna Greatest Hits dataset. The repository is checked out for you. Work in it; do not touch anything outside it.

## What to do

1. Find the newest queue folder under `data/queue/` that has a non-empty `prefiltered.jsonl` and no `judge-output.jsonl`. Skip any folder whose `prefiltered.jsonl` is empty: that was a thin night, not a failure, and it needs nothing from you. If no folder qualifies, stop and say so, naming any empty folders you skipped; there is nothing to judge.
2. Run `pnpm install --frozen-lockfile`, then `pnpm hits:judge --date=<that folder's name>`. It writes one or more `judge-input-N.md` files into the folder: the rubric, followed by the candidates.
3. Read each `judge-input-N.md` and judge every candidate in it against the rubric, exactly as the file instructs. Work through one file at a time: form each verdict yourself from that candidate's own line, and append that file's verdicts before you open the next one. A script may write out lines you have already decided, but it never decides a score; a default score given to a group of rows is not a verdict. Be strict: most candidates are word salad and score 1 on aptness. Write your verdicts, one JSON line per candidate and nothing else, appended to `data/queue/<date>/judge-output.jsonl`. Every candidate id in the inputs must appear exactly once in the output.
4. Run `pnpm hits:ingest --date=<date> --model=<your model id, e.g. claude-sonnet-5> --no-engine-check`. The sandbox has no WASM build of the engine, and building one there is slow and unreliable (it needs wasm-pack and a binaryen download), so do not try. With `--no-engine-check` the letters are still checked; only the dictionary lookup is skipped, and the queue's rows came from the engine in the first place. On a machine where `packages/engine/src/wasm/` already exists, drop the flag.
5. Read `data/queue/<date>/ingest-report.md`. Create a branch named `hits/<date>`, commit `data/hits.jsonl`, `data/candidates.jsonl` and everything in `data/queue/<date>/` except `raw.jsonl` and `judge-input-*.md`, with the message `Greatest Hits: <N> new for <date>`, where N is the number of new hits the report gives.
6. Push the branch and open a pull request against `main` with the same title. The body is the ingest report, followed by one line naming the model that judged and the rubric version. If N is zero, still open the pull request: the judged queue is part of the record, and a person should see that nothing cleared the bar.

## Rules

- Never edit `data/hits.jsonl` by hand; only `pnpm hits:ingest` writes it.
- Never change a candidate's status yourself.
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
