# Apply decisions from the review desk

`pnpm hits:desk` fills desk_branch, desk_notes, desk_row_notes and desk_commands when you press Copy prompt. To use this file by hand, replace them, then paste everything below the line into an agent session opened in the repository, in any harness.

---

Apply these Greatest Hits decisions, made in the review desk. Read AGENTS.md and "Review in the desk" in docs/OPERATOR.md first. Work on desk_branch.

Run these commands in order, exactly as written. A line starting with # is a step for you to take, not a shell command. Stop at the first command that fails, change nothing more, and tell me which one failed and what it printed.

desk_commands

Notes from the operator: desk_notes

My notes on single hits, each with its id and its words in the order I chose:

desk_row_notes

A note on a hit is about that hit alone. Where one asks for a change the commands do not make, such as a justification written from my reasons for promoting it, make it with pnpm hits:justify, hits:describe, hits:sense, hits:display, hits:order, hits:tag or hits:set on that id, and write any justification as one plain sentence for a reader who does not know the reference, any sentence about what an input is as one factual sentence, never an opinion and never about a private person, any sense as one sentence of at most 120 characters saying how this anagram reads the word, never a fact about the input, and any display as the hit's own words in their order with only listed forms, the allowed marks and capitals for I, names, acronyms and a sentence's start, never an exclamation mark or a possessive. Where a note is unclear, or asks for more than those commands can do, ask me before changing anything for it.

Change nothing else. Then run the four suites, commit what changed with a message that lists the decisions, and push. On a new branch, open a pull request against main whose body lists each command and what it printed, and each change a note asked for with any sentence you wrote; on a routine branch, add that list as a comment on its pull request. Report CI and stop. I merge.
