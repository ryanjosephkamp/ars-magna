# Run the monthly vote review by hand

When the judge routine is paused or a month's review was missed. Paste everything below the line into a Claude Code session opened in the repository on this Mac. No placeholders.

---

Run this month's vote review by hand. Read AGENTS.md and "The monthly vote review" in docs/OPERATOR.md first.

On a new branch off an up-to-date main, run pnpm install --frozen-lockfile, then pnpm hits:monthly. If it says there is nothing to do or that it was not run, stop and tell me its sentence.

If it wrote .cache/monthly/review-input.md, read it and answer every row exactly as the file instructs, in this session, into .cache/monthly/review-output.jsonl. Form every answer yourself: no script, subagent or other session decides one. Then run pnpm hits:monthly --ingest --model=<your model id> --judged-by=hand. If it wrote no input file, run pnpm hits:monthly --ingest --judged-by=hand, which records the month. If the ingest refuses the answers, answer the rows it names again, each for itself, and run it again. Never make a hit featured.

Name the branch votes-<the month>. Run the four suites, commit data/hits.jsonl if it changed and data/votes/monthly/, push, and open a pull request titled "Monthly vote review <the month>" whose body is data/votes/monthly/<the month>.md. Report CI and stop. I merge.
