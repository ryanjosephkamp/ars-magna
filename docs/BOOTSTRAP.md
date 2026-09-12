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
