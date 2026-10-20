// Shared test fixtures: page objects, test data, and an automatic error-context capture.
// Specs import { test, expect } from here, never from '@playwright/test' directly.
import { test as base, expect } from '@playwright/test';
import { testData, type TestData } from '../config/env';
import { captureErrorContext } from '../helpers/captureErrorContext';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';

type Fixtures = {
  data: TestData;
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  errorContext: void;
};

export const test = base.extend<Fixtures>({
  data: async ({}, use) => {
    await use(testData);
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  // Runs for every test. On failure, attaches the URL and ARIA snapshot to the report.
  errorContext: [
    async ({ page }, use, testInfo) => {
      await use();
      if (testInfo.status !== testInfo.expectedStatus) {
        await captureErrorContext(page, testInfo);
      }
    },
    { auto: true },
  ],
});

export { expect };
