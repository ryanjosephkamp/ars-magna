# The monthly vote review

monthly_version: v1

Readers have voted most for the A stretch anagrams below. Read each one again, as if you had never seen it, and decide whether it belongs in Interesting instead.

- **Interesting:** the anagram names its input, or has a clear, specific link to it that a reader sees at once.
- **A stretch:** a looser link, arguable in a sentence.

Votes brought these rows here; they are not a reason to move one. An anagram many people like is still A stretch when its link needs arguing. A word carried over from the input is not a link by itself: read what the rest of the phrase says.

**Move at most one.** Choose the row whose link reads clearest, and move it only if it plainly meets Interesting's bar. When none does, every row stays. The operator approves any move by merging the pull request.

Answer every row, one JSON line each, and nothing else:

```json
{"id": "<the row's id>", "decision": "stay", "reason": "One plain sentence about this anagram."}
```

`decision` is `move` or `stay`. `reason` is one sentence, at most 300 characters, written for this anagram alone. Say what its link is, or why it needs arguing. Never write it from a pattern shared with other rows, and never give the votes as the reason. The tool refuses a file in which one sentence, with the words it quotes masked, answers more than 3 rows.
