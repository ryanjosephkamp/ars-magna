# @ars-magna/mcp

The Ars Magna engine as MCP tools: `solve`, `count`, `nth`, `explain_word` and `propose_hit`. Lets a chat drive the Greatest Hits workflow ("find me the best anagrams of these ten companies", "what does *za* mean", "propose this one for review").

Needs the built engine and the committed dictionary: run `pnpm install && pnpm wasm:build` once in the repository.

## Claude Code

The repository's `.mcp.json` registers the server, so Claude Code picks it up when opened in this folder.

## Claude Desktop

Add to `claude_desktop_config.json`, with the absolute path to this repository:

```json
{
  "mcpServers": {
    "ars-magna": {
      "command": "node",
      "args": ["/absolute/path/to/ars-magna/packages/mcp/bin/ars-magna-mcp.js"]
    }
  }
}
```

## Tools

| Tool | Does |
|---|---|
| `solve` | Every anagram of an input: exact total plus the first N phrases, longest words first. |
| `count` | The total alone. |
| `nth` | The result at a position, by unranking. |
| `explain_word` | Definitions, provenance and the other spellings of a word. |
| `propose_hit` | Checks a phrase is a real anagram, then records it as a proposed hit for review, with its `justification` and, for an input that has none yet, an `about` sentence saying what the input is. Publishes nothing. |

Transport is stdio. Streamable HTTP is not wired up; nothing needs it yet.
