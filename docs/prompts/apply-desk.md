# Apply decisions from the review desk

`pnpm hits:desk` fills desk_branch, desk_notes and desk_commands when you press Copy prompt. To use this file by hand, replace them, then paste everything below the line into an agent session opened in the repository.

---

Apply these Greatest Hits decisions, made in the review desk. Read AGENTS.md and "Review in the desk" in docs/OPERATOR.md first. Work on desk_branch.

Run these commands in order, exactly as written. A line starting with # is a step for you to take, not a shell command. Stop at the first command that fails, change nothing more, and tell me which one failed and what it printed.

desk_commands

Notes from the operator: desk_notes

Change nothing the commands do not change. Then run the four suites, commit what the commands changed with a message that lists the decisions, and push. On a new branch, open a pull request against main whose body lists each command and what it printed; on a routine branch, add that list as a comment on its pull request. Report CI and stop. I merge.
