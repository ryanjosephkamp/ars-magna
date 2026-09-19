# Publish the review desk for a phone

Replace desk_branch with the branch whose data the desk should show (`main`, or a routine pull request's branch such as `hits/2026-09-14`) and desk_queues with how many judged queues to include (3 by default), then paste everything below the line into a Claude Code session opened in the repository. Only Claude Code can publish an Artifact.

---

Publish the Ars Magna review desk so I can use it on my phone. Read AGENTS.md and "Review in the desk" in docs/OPERATOR.md first. Change nothing in the repository.

Check out desk_branch, up to date with its remote. If the private repository ars-magna-promotions is cloned beside this one, at ../ars-magna-promotions, bring its main up to date and add --promotions=../ars-magna-promotions, so the desk shows what readers promoted. Run pnpm hits:desk --queues=desk_queues --artifact, with that flag when it applies. Then publish .cache/desk/artifact.html with the Artifact tool to the review desk's URL recorded in CLAUDE.md, keeping its title and icon. If CLAUDE.md records none, publish it as a new private Artifact and tell me its URL so it can be recorded. Keep it private: its near misses include slurs and insults made from the letters, a desk built with --promotions holds what readers typed, and it must never be shared. Never quote a promoted anagram, its input or a reader's note in this chat.

Report the branch and commit it was built from, the counts pnpm hits:desk printed, and the Artifact's URL. Stop there. When I paste back a prompt the desk filled, follow that prompt.
