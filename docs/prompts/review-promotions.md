# Review promotions in a session

Paste everything below the line into a Claude Code session opened in the repository on this Mac, for example through Remote Control. No placeholders.

---

Review the anagrams readers have promoted. Read AGENTS.md and "Review promotions" in docs/OPERATOR.md first. The private repository ryanjosephkamp/ars-magna-promotions belongs beside this one, at ../ars-magna-promotions: clone it there if it is missing, and bring its main up to date. Then:

1. Run pnpm install --frozen-lockfile. If the newest file in ../ars-magna-promotions/export/ is older than today, run pnpm promotions:export --out=../ars-magna-promotions first; it reads the votes database through wrangler's login, with SELECT statements only.
2. Run pnpm promotions:review --from=../ars-magna-promotions --any-date. If it says there is nothing to review, stop and tell me its sentence.
3. Read each .cache/promotions/review-input-N.md and judge every row exactly as the file instructs, one file at a time, in this session, appending your answers to .cache/promotions/review-output.jsonl. Form every answer yourself; no script, subagent or other session chooses a score, a category or a sentence.
4. Run pnpm promotions:ingest --from=../ars-magna-promotions --model=<your model id> --judged-by=hand. If it refuses the answers, answer the rows it names again, each for itself, and run it again.
5. In ../ars-magna-promotions, create a branch review/<date>, commit reviews/<date>.jsonl and reviews/<date>.md (and export/<date>.jsonl if step 1 wrote it) with the message "Promotions review <date>", push the branch, and open a pull request in ryanjosephkamp/ars-magna-promotions with the same title and reviews/<date>.md as its body.

Never copy anything from ../ars-magna-promotions or .cache/promotions into this repository, a commit or pull request here, or this chat: report only the private pull request's link and the counts pnpm promotions:ingest printed, and stop. I merge it there; the next judge routine run, or pnpm promotions:apply in a session, publishes it.
