/**
 * Serve the tools over stdio, which is how Claude Code and Claude Desktop
 * attach a local MCP server. Logging goes to stderr; stdout is the protocol.
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { createServer } from './server.ts';

const server = createServer();
await server.connect(new StdioServerTransport());
process.stderr.write('ars-magna MCP server ready\n');
