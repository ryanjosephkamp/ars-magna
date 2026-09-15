# Publish the Greatest Hits audit

Paste everything below the line into a Claude Code session opened in the repository, or ask that session for the Greatest Hits audit: the `greatest-hits-audit` skill follows this file. Only Claude Code can publish an Artifact. In another harness, run `pnpm hits:desk --audit` on an up-to-date main and open `.cache/desk/audit.html` in a browser instead.

---

Publish the Ars Magna Greatest Hits audit so I can move the anagrams on the Discoveries page between its sections. Read AGENTS.md and "Audit the Discoveries page" in docs/OPERATOR.md first. Change nothing in the repository.

Switch to main and bring it up to date with origin. If the working tree has uncommitted changes to tracked files, stop and tell me instead. Run pnpm hits:desk --audit --artifact. Then publish .cache/desk/audit-artifact.html with the Artifact tool to the Greatest Hits audit's URL recorded in CLAUDE.md, keeping its title and icon. If CLAUDE.md records none, publish it as a new private Artifact and tell me its URL so it can be recorded.

Report the commit it was built from, the counts pnpm hits:desk printed, and the Artifact's URL. Stop there. When I paste back a prompt the audit filled, follow that prompt.
