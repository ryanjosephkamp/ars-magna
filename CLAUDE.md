# Claude Code notes for Ars Magna

Read `AGENTS.md` first. The rules, layout, commands and how work is delivered live there and bind every
session. This file holds only what is specific to Claude Code.

## Plans

- `~/.claude/plans/ars-magna-roadmap-2026-09.md` is the live plan: phases A to H in the order they run, the
  decisions D1–D22 the operator accepted on 2026-09-15, and the English OpenList track.
- `~/.claude/plans/ars-magna-voting.md` holds votes and promotions on Discover: the operator's ground
  rules, recommendations R1–R13, phases V1–V4 with their status, and follow-ups. Its V3 and V4 now run as
  the roadmap's phases C, E and F.
  - It is published as the artifact "Ars Magna Voting Plan":
    https://claude.ai/code/artifact/9ed9ada5-95f2-4fab-b3e6-5135f0312050.
- `~/.claude/plans/flickering-sprouting-scott.md` is the Greatest Hits plan: phases A to I and N1 to N7, with
  the yield table.
  - All are done apart from N7 step 2 (keeping review desk decisions across devices), which is undecided.
  - Its N6 Collection page shipped as Discover.

Session handoffs keep their files in `/Users/noir/Documents/ars-magna/handoff/<date>/`, outside the
repository: the manual Artifact's HTML source, test scripts and screenshots.

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
(`pnpm preview`, port 4173). The parent folder's `/Users/noir/Documents/ars-magna/.claude/launch.json` also
names `ars-magna-pages`: `wrangler pages dev` on port 8788, the built site with its `/api/` functions.

Verifying votes:
- **Headless Chrome with `--virtual-time-budget`** stalls Turnstile, so a vote never completes there.
- **The in-app browser** completes one against localhost, where the page uses Turnstile's test key.
- **On the live site** Turnstile challenges the in-app browser. Never solve it; reload to drop the pending
  vote.
- **Real-time phone-width screenshots** come from `cdp.mjs` in the latest handoff folder, run against Chrome
  started with `--headless=new --remote-debugging-port=9333 --use-mock-keychain`.

## Operator manual

`docs/OPERATOR.md` is published as the artifact "Ars Magna Operator Manual":
https://claude.ai/code/artifact/e9d6ddc9-1c1b-4901-8341-7923708c416c. Republish
to that URL when the file or a template in `docs/prompts/` changes on `main`.

Artifacts belong to the account that published them. `handoff/ARTIFACTS.md` lists every page and the file it
was built from, and "Another Claude account, or another machine" in `docs/BOOTSTRAP.md` says what a move takes.

## Review desk

The review desk for a phone is the private artifact "Ars Magna Review Desk":
https://claude.ai/code/artifact/ee0c24c8-3d8f-4e95-96e2-a0add07c0485. Publish
`.cache/desk/artifact.html` from `pnpm hits:desk --artifact` to that URL, as
`docs/prompts/publish-desk.md` describes, and keep it private: its near misses
include slurs and insults made from the letters, and a desk built with
`--promotions` holds what readers typed.

## Greatest Hits audit

The audit of the site's Discover page is the private artifact "Ars Magna Greatest Hits Audit":
https://claude.ai/code/artifact/449fac53-c4cf-4877-9273-f91d13226ca6. The `greatest-hits-audit` skill
(`.claude/skills/`) publishes `.cache/desk/audit-artifact.html` from `pnpm hits:desk --audit --artifact`
to that URL, as `docs/prompts/publish-audit.md` describes.
