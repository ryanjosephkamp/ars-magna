# Bootstrap

The prompt that starts an agent on Ars Magna in any harness. Open a session in a clone of
https://github.com/ryanjosephkamp/ars-magna, replace task_description, and paste everything between the
two lines.

---

You are working in the Ars Magna repository, in the folder this session opened.

1. Read AGENTS.md at the repository root. Its rules bind you for the whole session.
2. Set up once: pnpm install && pnpm wasm:build
3. Run the four suites, in this order: cargo test --release --workspace, then pnpm typecheck, then pnpm test, then pnpm build
4. Report one line per suite: passed or failed. If any failed, stop there and show the failure.
5. When all four are green, take this task: task_description

---

## Harness notes

### Claude Code

Claude Code reads `CLAUDE.md`, which points at `AGENTS.md`, and `.mcp.json` starts the `ars-magna` MCP
server. The prompt above works pasted as it is.

### Codex

Codex reads `AGENTS.md` on its own. It takes MCP servers from `config.toml`, not `.mcp.json`. To give it
the same `ars-magna` server, add this to `~/.codex/config.toml`, with the absolute path to your clone:

```toml
[mcp_servers.ars-magna]
command = "node"
args = ["/absolute/path/to/ars-magna/packages/mcp/bin/ars-magna-mcp.js"]
```

The same, from the command line:

```bash
codex mcp add ars-magna -- node /absolute/path/to/ars-magna/packages/mcp/bin/ars-magna-mcp.js
```

The server finds the dictionary relative to its own file, so it needs no `cwd`, but it does need
`pnpm install && pnpm wasm:build` to have run in that clone. A project-scoped `.codex/config.toml`
holding the same table also works, for trusted projects. Checked against OpenAI's Codex MCP
documentation on 2026-09-12.

### Grok Build

Its instruction-file and MCP conventions were not verified when this was written. Paste the prompt
above as the first message. If it runs stdio MCP servers, the command is
`node /absolute/path/to/ars-magna/packages/mcp/bin/ars-magna-mcp.js`. Record what you confirm here, in a
pull request.

## Another Claude account, or another machine

Nothing about this project belongs to a Claude account except the pages it publishes and the routine it
schedules. The work itself is files: this repository, and three folders beside it on the machine.

**What a new account inherits automatically**, signing in at the same path on the same machine:

| Where | What |
|---|---|
| this repository | `AGENTS.md`, `CLAUDE.md`, `PRODUCT.md`, `docs/`, the code, the data, `.mcp.json`, `.claude/` |
| `~/.claude/plans/` | the roadmap, the voting plan, each phase's design note |
| `~/.claude/projects/-Users-noir-Documents-ars-magna/` | the memory files, and every past session's transcript; the folder is named after the project's path, not the account |
| `/Users/noir/Documents/ars-magna/handoff/` | every handback, review and brief as the HTML it was published from, with its scripts and screenshots |

`gh` is signed in through the system keyring, so pull requests are unaffected.

**What does not come with it:**

- **The published Artifacts.** A page belongs to the account that published it; another account cannot open
  or update it. `handoff/ARTIFACTS.md` lists every page, and the file each was built from, so any of them can
  be published again from anywhere. The manual, the review desk and the audit are rebuilt from the repository
  rather than archived — "Update this manual and republish it" in `docs/OPERATOR.md` says what to do with the
  URL when it changes.
- **The judge routine.** It runs on, and bills to, the account that created it, and keeps running whichever
  account is coding: its pull request lands in this repository either way, and the review desk is built from
  the repository, so reviewing it needs no particular account. Pausing it, editing it or carrying a prompt over
  needs the account that owns it, and moving it means recreating it there — "Move it to another Claude account"
  in `docs/OPERATOR.md` gives the order, including turning the old one off first and what an exhausted plan
  looks like.
- **Connectors and the app's session list.** Reconnect what you use; the transcripts stay on disk.

**Switching**, in order: commit and push, so the tree is clean; check `handoff/ARTIFACTS.md` for anything that
still has no local source and read it down while the owning account can open it; sign out and sign in;
reconnect connectors; start the first session with the prompt above, and point it at the plan's Progress log,
the memory files and the newest handback in `handoff/`. Do not run two accounts against one checkout at the
same time — use a git worktree, as two sessions do.

**On another machine**, clone the repository and copy those three folders across; everything else follows.
