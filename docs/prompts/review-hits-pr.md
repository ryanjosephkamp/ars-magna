# Review a routine pull request

Replace pr_number, then paste everything below the line into an agent session opened in the repository.

---

Review Greatest Hits pull request pr_number. Read AGENTS.md, then follow "Review a routine pull request" in docs/OPERATOR.md. First change nothing: check out the branch and list every proposed hit it adds with its id, total, input, phrase and rationale, mark any rationale that starts with sensitive, and recommend for each one accepted, featured, leave proposed, or retired, with one reason. Wait for my answer. When I name ids and statuses, run pnpm hits:set with exactly those, commit data/hits.jsonl on the branch, push, report CI, and stop. I merge.
