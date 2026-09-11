#!/usr/bin/env node
// Launches the stdio server with Node's type stripping, so the package runs
// as TypeScript source like the rest of the workspace.
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const child = spawn(process.execPath, ['--experimental-strip-types', resolve(here, '../src/stdio.ts')], {
  stdio: 'inherit',
});
child.on('exit', (code) => process.exit(code ?? 0));
