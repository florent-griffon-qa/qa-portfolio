#!/usr/bin/env node
// Runs the Restful-Booker collection with Newman and writes reports to reports/api/.
// Usage: node postman/run-newman.mjs [--env local|public]   (or ENV=local|public)
// BASE_URL overrides the environment's baseUrl (used by docker compose).
// Fails when an assertion fails, when the run errors, or when no assertion ran at all:
// an empty run is not a green run.

import newman from 'newman';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ENVIRONMENTS = ['local', 'public'];

const envArgIndex = process.argv.indexOf('--env');
const envName = envArgIndex !== -1 ? process.argv[envArgIndex + 1] : (process.env.ENV ?? 'local');
if (!ENVIRONMENTS.includes(envName)) {
  console.error(
    `run-newman: unknown environment "${envName}" (expected: ${ENVIRONMENTS.join(', ')})`,
  );
  process.exit(2);
}

const reportDir = join(ROOT, 'reports', 'api');
const envVar = process.env.BASE_URL ? [{ key: 'baseUrl', value: process.env.BASE_URL }] : [];

newman.run(
  {
    collection: join(ROOT, 'postman', 'collections', 'restful-booker.postman_collection.json'),
    environment: join(ROOT, 'postman', 'environments', `${envName}.postman_environment.json`),
    envVar,
    reporters: ['cli', 'htmlextra', 'junit'],
    reporter: {
      htmlextra: {
        export: join(reportDir, `newman-${envName}.html`),
        title: `Restful-Booker API tests (${envName})`,
      },
      junit: { export: join(reportDir, `newman-${envName}-junit.xml`) },
    },
  },
  (error, summary) => {
    if (error) {
      console.error(`run-newman: FAIL - ${error.message}`);
      process.exitCode = 1;
      return;
    }
    const { assertions } = summary.run.stats;
    if (assertions.total === 0) {
      console.error('run-newman: FAIL - no assertion was executed');
      process.exitCode = 1;
    } else if (summary.run.failures.length > 0 || summary.run.error) {
      console.error(`run-newman: FAIL - ${summary.run.failures.length} failure(s)`);
      process.exitCode = 1;
    } else {
      console.log(`run-newman: OK - ${assertions.total} assertion(s) passed on "${envName}"`);
    }
  },
);
