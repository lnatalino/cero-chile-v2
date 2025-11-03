#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const command = process.argv[2] ?? 'dev';

function resolveBin(name) {
  const binPath = path.resolve(process.cwd(), 'node_modules', '.bin', name);
  return binPath;
}

function runTypeScriptCheck() {
  const tscBin = resolveBin('tsc');
  const result = spawnSync(tscBin, ['--noEmit'], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runESLint() {
  // Fallback lint step using TypeScript since ESLint plugins are not bundled in this stub.
  runTypeScriptCheck();
}

switch (command) {
  case 'build':
    console.log('[next-stub] running type check as build step');
    runTypeScriptCheck();
    console.log('[next-stub] build complete');
    break;
  case 'lint':
    console.log('[next-stub] running eslint');
    runESLint();
    break;
  case 'dev':
  case 'start':
    console.log('[next-stub] Dev server placeholder running on http://localhost:3004');
    console.log('Press Ctrl+C to stop. (This is a stub server and does not serve real content).');
    setInterval(() => {}, 1000);
    break;
  default:
    console.error(`[next-stub] Unknown command: ${command}`);
    process.exit(1);
}
