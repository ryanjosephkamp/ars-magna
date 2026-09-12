# Judge a queue by hand

Paste everything below the line into an agent session opened in the repository. No placeholders.

---

Judge the newest Greatest Hits queue on this machine. Read AGENTS.md and "Judge a queue by hand" in docs/OPERATOR.md, then follow automation/judge-routine.md with one difference: the engine is built here (run pnpm wasm:build if packages/engine/src/wasm/ is missing), so run pnpm hits:ingest without --no-engine-check. Stop when the pull request is open, and report its number, the ingest report's counts, and CI.
