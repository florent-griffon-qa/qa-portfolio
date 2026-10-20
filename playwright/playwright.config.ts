// Playwright configuration. The ONLY place where timeouts are set: no test.setTimeout() in specs.
import { defineConfig, devices } from '@playwright/test';
import { testData } from './config/env';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  outputDir: '../reports/e2e/test-results',

  timeout: 30_000,
  expect: { timeout: 5_000 },

  fullyParallel: true,
  forbidOnly: isCI,
  // The targets are public services we do not control: retries absorb their transient
  // failures in CI only. Locally a failure must show up at once.
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: '../reports/e2e/html', open: 'never' }],
    ['junit', { outputFile: '../reports/e2e/junit.xml' }],
  ],

  use: {
    baseURL: testData.baseUrl,
    testIdAttribute: 'data-test',
    navigationTimeout: 15_000,
    actionTimeout: 10_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
