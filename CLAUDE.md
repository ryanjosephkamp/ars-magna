# Claude Code notes for Ars Magna

Read `AGENTS.md` first. The rules, layout, commands and how work is delivered live there and bind every
session. This file holds only what is specific to Claude Code.

## Plan

`~/.claude/plans/flickering-sprouting-scott.md` is the Greatest Hits plan. The phases J to M and the
yield table at the end of that file are the live state.

## Memory

`~/.claude/projects/-Users-noir-Documents-ars-magna/memory/`, indexed by `MEMORY.md`. It holds the
decisions the operator accepted and the state a fresh session needs; the repository holds the rest.

## The judge routine

"Judge the nightly queue", `trig_01VdomdgqWVjsNdo33BHQFNg`, daily at 07:00 UTC on `claude-sonnet-5`:
https://claude.ai/code/routines/trig_01VdomdgqWVjsNdo33BHQFNg

- Load its tool with ToolSearch `select:RemoteTrigger`. `get` shows whether it is enabled and when it
  runs next; `list_runs`, then `get_run_log` on a run, shows what a run did.
- Its prompt is a **copy** of `automation/judge-routine.md` above the closing comment. A change to the
  file changes nothing until it is carried over, as "Manage the judge routine" in `docs/OPERATOR.md`
  describes.

## MCP server

`.mcp.json` starts `ars-magna` (solve, count, nth, explain_word, propose_hit) from
`packages/mcp/bin/ars-magna-mcp.js`. It needs `pnpm wasm:build` to have run, and `propose_hit` writes
to `data/`.

## Browser pane

`.claude/launch.json` names `ars-magna` (`pnpm dev`, port 5173) and `ars-magna-preview`
(`pnpm preview`, port 4173).

## Operator manual

`docs/OPERATOR.md` is published as the artifact "Ars Magna Operator Manual":
https://claude.ai/code/artifact/e9d6ddc9-1c1b-4901-8341-7923708c416c. Republish
to that URL when the file or a template in `docs/prompts/` changes on `main`.

## Review desk

The review desk for a phone is the private artifact "Ars Magna Review Desk":
https://claude.ai/code/artifact/ee0c24c8-3d8f-4e95-96e2-a0add07c0485. Publish
`.cache/desk/artifact.html` from `pnpm hits:desk --artifact` to that URL, as
`docs/prompts/publish-desk.md` describes, and keep it private: its near misses
include slurs and insults made from the letters.

## Greatest Hits audit

The audit of the site's Discoveries page is the private artifact "Ars Magna Greatest Hits Audit":
https://claude.ai/code/artifact/449fac53-c4cf-4877-9273-f91d13226ca6. The `greatest-hits-audit` skill
(`.claude/skills/`) publishes `.cache/desk/audit-artifact.html` from `pnpm hits:desk --audit --artifact`
to that URL, as `docs/prompts/publish-audit.md` describes.
