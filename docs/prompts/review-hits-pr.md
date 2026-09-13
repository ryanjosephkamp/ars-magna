# Review a routine pull request

Replace pr_number, then paste everything below the line into an agent session opened in the repository.

---

Review Greatest Hits pull request pr_number. Read AGENTS.md, then follow "Review a routine pull request" in docs/OPERATOR.md. First change nothing. Check out the branch and list every hit it adds, by shelf, with its id, relation, reads, input, phrase and justification. Then list its alternates and the report's near misses. Mark any hit tagged tone:rude. For each shelved hit, recommend one of: keep it where it is, promote it to featured, hold it back as proposed, or retire it. For each alternate, recommend accepting it or leaving it. Give one reason each, then wait for my answer. When I name ids and statuses, run pnpm hits:set with exactly those, commit data/hits.jsonl on the branch, push, report CI, and stop. I merge.
