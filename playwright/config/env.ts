// Test configuration resolved from the ENV variable (local | public).
// SauceDemo has no local instance: both files point to the public site, kept separate so
// the UI and API layers share the same ENV switch.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type TestData = {
  baseUrl: string;
  password: string;
  users: { standard: string; lockedOut: string };
  products: string[];
  customer: { firstName: string; lastName: string; postalCode: string };
  taxRatePercent: number;
  messages: {
    lockedOut: string;
    wrongCredentials: string;
    firstNameRequired: string;
    orderComplete: string;
  };
};

const ENVIRONMENTS = ['local', 'public'] as const;
type EnvName = (typeof ENVIRONMENTS)[number];

function resolveEnvName(): EnvName {
  const value = process.env.ENV ?? 'local';
  if (!(ENVIRONMENTS as readonly string[]).includes(value)) {
    throw new Error(`Unknown ENV "${value}" (expected: ${ENVIRONMENTS.join(', ')})`);
  }
  return value as EnvName;
}

export const envName = resolveEnvName();

const dataFile = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'test-data',
  `${envName}.json`,
);
export const testData: TestData = JSON.parse(readFileSync(dataFile, 'utf8'));
