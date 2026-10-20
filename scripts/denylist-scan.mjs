#!/usr/bin/env node
// Deny-list scan. Fails when a deny-listed term appears in a file Git would track,
// in a file path, or in an explicit file passed with --file (commit message).
//
// Contract:
// - Terms come from the DENYLIST env var (CI secret) or the local .denylist file.
// - Fail closed: a missing or empty list is an error, never a silent pass.
// - A canary self-test runs before every scan. It plants a random term in a temp
//   file inside the repo and checks the real listing + matching path finds it,
//   and checks a negative control does not match. If it fails, the scan aborts:
//   a scanner that cannot see a planted term proves nothing about the repo.
// - Matching is case-insensitive and whole-word (Unicode-aware boundaries, so
//   accented terms behave like ASCII ones).
// - Stops at the first hit. A matched term is never printed, only its index.

import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LIST_FILE = join(ROOT, '.denylist');
const EXCLUDED = [/^\.git\//, /(^|\/)node_modules\//, /(^|\/)\.denylist$/];
const WORD_CHAR = /[\p{L}\p{N}_]/u;
const CANARY_FILE = /^\.denylist-canary-[0-9a-f]+\.tmp$/;

class ScanFailure extends Error {}

// Throws instead of exiting: process.exit() would skip the finally blocks
// that remove the planted canary file.
function fail(message) {
  throw new ScanFailure(message);
}

function parseTerms(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'));
}

function loadTerms() {
  const fromEnv = process.env.DENYLIST;
  if (fromEnv !== undefined && fromEnv.trim() !== '') {
    return { source: 'DENYLIST env var', terms: parseTerms(fromEnv) };
  }
  if (existsSync(LIST_FILE)) {
    return { source: '.denylist file', terms: parseTerms(readFileSync(LIST_FILE, 'utf8')) };
  }
  return { source: 'none', terms: [] };
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// A boundary is only added on a side where the term starts or ends with a word char,
// so a term like "c++" still matches.
function compile(terms) {
  return terms.map((term) => {
    const head = WORD_CHAR.test(term[0]) ? '(?<![\\p{L}\\p{N}_])' : '';
    const tail = WORD_CHAR.test(term[term.length - 1]) ? '(?![\\p{L}\\p{N}_])' : '';
    return new RegExp(`${head}${escapeRegExp(term)}${tail}`, 'iu');
  });
}

function isBinary(buffer) {
  return buffer.subarray(0, 8000).includes(0);
}

// Returns the first hit as { line, index } or null. line 0 means the path itself.
function scanText(text, matchers) {
  const lines = text.split(/\r?\n/);
  for (let l = 0; l < lines.length; l += 1) {
    for (let i = 0; i < matchers.length; i += 1) {
      if (matchers[i].test(lines[l])) return { line: l + 1, index: i };
    }
  }
  return null;
}

function scanFile(absPath, displayPath, matchers) {
  const pathHit = scanText(displayPath, matchers);
  if (pathHit) return { line: 0, index: pathHit.index };
  const buffer = readFileSync(absPath);
  if (isBinary(buffer)) return null;
  return scanText(buffer.toString('utf8'), matchers);
}

function listRepoFiles() {
  const out = execFileSync(
    'git',
    ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
    {
      cwd: ROOT,
      encoding: 'utf8',
    },
  );
  return out
    .split('\0')
    .filter((p) => p !== '')
    .filter((p) => !EXCLUDED.some((rx) => rx.test(p)))
    .filter((p) => existsSync(join(ROOT, p)) && statSync(join(ROOT, p)).isFile());
}

function selfTest(terms) {
  const canary = `cnry${randomBytes(8).toString('hex')}`;
  const canaryIndex = terms.length;
  const matchers = compile([...terms, canary]);

  const plantedName = `.denylist-canary-${randomBytes(4).toString('hex')}.tmp`;
  const plantedPath = join(ROOT, plantedName);
  const controlDir = mkdtempSync(join(tmpdir(), 'denylist-control-'));
  try {
    writeFileSync(plantedPath, `(${canary.toUpperCase()}).\n`);

    if (!listRepoFiles().includes(plantedName)) {
      fail('self-test: the file listing does not see a planted file');
    }
    const hit = scanFile(plantedPath, 'planted.tmp', matchers);
    if (!hit || hit.index !== canaryIndex) {
      fail('self-test: the planted canary term was not detected');
    }

    const controlPath = join(controlDir, 'control.txt');
    writeFileSync(controlPath, `x${canary}y\n`);
    if (scanFile(controlPath, 'control.txt', compile([canary]))) {
      fail('self-test: a canary glued inside a longer word matched (word boundary broken)');
    }
  } finally {
    rmSync(plantedPath, { force: true });
    rmSync(controlDir, { recursive: true, force: true });
  }
  console.log('denylist-scan: self-test passed (canary detected, negative control clean)');
}

function main() {
  const { source, terms } = loadTerms();
  if (terms.length === 0) {
    fail(`no deny-list terms loaded (source: ${source}). Set DENYLIST or create .denylist`);
  }

  selfTest(terms);

  const matchers = compile(terms);
  const fileArgIndex = process.argv.indexOf('--file');
  const targets =
    fileArgIndex !== -1
      ? process.argv.slice(fileArgIndex + 1).map((p) => ({ abs: resolve(p), display: p }))
      : listRepoFiles().map((p) => ({ abs: join(ROOT, p), display: p }));

  if (targets.length === 0) fail('nothing to scan (empty file list)');

  for (const target of targets) {
    if (!existsSync(target.abs)) fail(`file not found: ${target.display}`);
    const hit = scanFile(target.abs, target.display, matchers);
    if (hit) {
      const where = hit.line === 0 ? 'file path' : `line ${hit.line}`;
      fail(`deny-listed term #${hit.index + 1} found in ${target.display} (${where})`);
    }
  }
  console.log(
    `denylist-scan: OK - ${targets.length} file(s) scanned against ${terms.length} term(s) from ${source}`,
  );
}

// Final guard, run on every outcome: a canary file left behind (crash, kill,
// cleanup bug) must never reach a commit.
function assertNoCanaryLeft() {
  const leftovers = readdirSync(ROOT).filter((name) => CANARY_FILE.test(name));
  if (leftovers.length > 0) {
    console.error(`denylist-scan: FAIL - canary file(s) left in the repo: ${leftovers.join(', ')}`);
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  if (!(error instanceof ScanFailure)) throw error;
  console.error(`denylist-scan: FAIL - ${error.message}`);
  process.exitCode = 1;
} finally {
  assertNoCanaryLeft();
}
