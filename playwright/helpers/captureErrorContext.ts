// Attaches the page URL and its ARIA snapshot to the test report.
// Called on failure from the fixture teardown: it gives the real DOM state to read before
// any fix, even when the failure happened in a step that left no trace. Never throws.
import type { Page, TestInfo } from '@playwright/test';

export async function captureErrorContext(page: Page, testInfo: TestInfo): Promise<void> {
  try {
    const snapshot = await page.locator('body').ariaSnapshot({ timeout: 5_000 });
    await testInfo.attach('aria-snapshot-on-failure', {
      body: `URL: ${page.url()}\n\n${snapshot}`,
      contentType: 'text/plain',
    });
  } catch (error) {
    await testInfo
      .attach('aria-snapshot-on-failure', {
        body: `ARIA snapshot unavailable: ${String(error)}`,
        contentType: 'text/plain',
      })
      .catch(() => {});
  }
}
