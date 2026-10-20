#!/usr/bin/env node
// Runs gitleaks with a pinned version: the local binary if it is on PATH,
// otherwise the official Docker image pinned by digest.
// Usage: node scripts/gitleaks.mjs staged   (pre-commit: staged changes only)
//        node scripts/gitleaks.mjs history  (CI: full Git history)
// Fails closed: if neither gitleaks nor Docker is available, the run fails.

import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const IMAGE =
  'zricethezav/gitleaks:v8.30.1@sha256:c00b6bd0aeb3071cbcb79009cb16a60dd9e0a7c60e2be9ab65d25e6bc8abbb7f';

const mode = process.argv[2];
const modeArgs = {
  staged: ['git', '--pre-commit', '--staged'],
  history: ['git'],
};
if (!modeArgs[mode]) {
  console.error('gitleaks: usage: node scripts/gitleaks.mjs <staged|history>');
  process.exit(2);
}
const args = [...modeArgs[mode], '--redact', '--no-banner', '--config', '.gitleaks.toml'];

function available(cmd, probeArgs) {
  return spawnSync(cmd, probeArgs, { stdio: 'ignore' }).status === 0;
}

let result;
if (available('gitleaks', ['version'])) {
  result = spawnSync('gitleaks', [...args, '.'], { cwd: ROOT, stdio: 'inherit' });
} else if (available('docker', ['version'])) {
  result = spawnSync(
    'docker',
    [
      'run',
      '--rm',
      '-v',
      `${ROOT}:/repo`,
      '-w',
      '/repo',
      '-e',
      'GIT_CONFIG_COUNT=1',
      '-e',
      'GIT_CONFIG_KEY_0=safe.directory',
      '-e',
      'GIT_CONFIG_VALUE_0=/repo',
      IMAGE,
      ...args,
      '/repo',
    ],
    { cwd: ROOT, stdio: 'inherit' },
  );
} else {
  console.error('gitleaks: FAIL - neither a gitleaks binary nor Docker is available');
  process.exit(1);
}

process.exit(result.status ?? 1);
