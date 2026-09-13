# Run a deep run

The review desk's Deep run tab fills deep_run_scope and deep_run_size. To use this file by hand, replace them, then paste everything below the line into a Claude Code session opened in the repository on a laptop.

---

Run a Greatest Hits deep run. Read AGENTS.md, "Run a deep run" in docs/OPERATOR.md and automation/judge-routine.md first.

Scope: deep_run_scope

Size: deep_run_size

Work through the scope one category at a time. For each category:

1. Start a branch off an up-to-date main named hits/deep-<queue folder>, where the queue folder is a date and a letter that no folder under data/queue/ uses yet.
2. Send that category's candidates in the scope back to new with pnpm hits:requeue, and append that category's seed lines to data/candidates.jsonl.
3. Write the run list, outside the repository: those candidates' lines from data/candidates.jsonl, and no other candidate, even one that is new for another reason, such as a candidate waiting in an open routine pull request.
4. For each input, count its results: cargo run --release -p anagram-cli -- count "<input>" --tier=common --max-words=5 --short-words=tools/hits/src/short-words.txt. For an input with more than 50,000, propose up to three words with a clear link to it, check each fits its letters with cargo run --release -p anagram-cli -- check, and add the ones that fit as "anchors" to its line in the run list only. Never edit the candidate lines in the repository to do this.
5. Run pnpm hits:enumerate --date=<queue folder> --preset=deep --status=new --in=<run list>, then pnpm hits:prefilter --date=<queue folder> --per-input=<the bound in the size>, then pnpm hits:screen --date=<queue folder>. Then delete the folder's raw.jsonl: a deep enumeration can run to gigabytes.
6. Screen. Give each screen-input-N.md to its own subagent on claude-sonnet-5, a few at a time. Each follows the instructions at the top of its file, reads every phrase itself, and writes only its answer lines to a file of its own. No search tool and no script chooses phrases for it. Put all the answers together in the folder's screen-output.jsonl.
7. Run pnpm hits:judge --date=<queue folder>. If it lists problems with the screen answers, have the subagent for that file answer again. Judge: give each judge-input-N.md to its own subagent on claude-opus-5, a few at a time, each forming every verdict itself as its file instructs and writing only its verdict lines to a file of its own. Put all the verdicts together in the folder's judge-output.jsonl, with every candidate id in the inputs exactly once.
8. Run pnpm hits:ingest --date=<queue folder> --model=claude-opus-5, with the engine check on.
9. Run the four suites. Commit data/hits.jsonl, data/candidates.jsonl and the queue folder; git leaves out raw.jsonl, prefiltered.jsonl and judge-input-*.md. Push, and open a pull request titled "Greatest Hits deep run: <category>, <N> new", where N is the number of new hits the ingest report gives. Its body is the ingest report, then the inputs run, the anchors proposed, the phrases screened and kept, and the models that screened and judged.
10. Report the pull request and its CI, then start the next category from main. If an earlier category's pull request has merged and this branch no longer applies cleanly, rebuild it from main: redo steps 2 and 3, copy in the committed screen and judge answers, and rerun steps 7 to 9. Never resolve a conflict in a data file by hand.

In Claude Code, a workflow may fan out steps 6 and 7 when I ask for one. In another harness, work through the files one at a time.

If anything fails in a way these steps do not cover, stop, leave the branch as it is, and say what happened. I review each pull request in the desk and merge it.
