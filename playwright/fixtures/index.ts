// Shared test fixtures: page objects and test data.
// Specs import { test, expect } from here, never from '@playwright/test' directly.
// On failure, Playwright writes error-context.md (ARIA snapshot) next to the trace.
import { test as base, expect } from '@playwright/test';
import { testData, type TestData } from '../config/env';
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
});

export { expect };
