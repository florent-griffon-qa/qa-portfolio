/**
 * CartPage - SauceDemo cart (/cart.html).
 *
 * VALIDATED
 *   2026-10-20, Playwright 1.64.1, chromium and firefox, public site https://www.saucedemo.com
 *   Spec: playwright/tests/smoke/checkout.spec.ts
 *
 * DOM STRUCTURE (observed 2026-10-20)
 *   span[data-test="title"]                    "Your Cart"
 *   div[data-test="cart-list"]
 *     div[data-test="inventory-item"]          one per product in the cart
 *       div[data-test="item-quantity"]         "1"
 *       div[data-test="inventory-item-name"]   "Sauce Labs Backpack"
 *       div[data-test="inventory-item-price"]  "$29.99"
 *       button "Remove"
 *   button[data-test="continue-shopping"]      "Continue Shopping"
 *   button[data-test="checkout"]               "Checkout"
 *
 * USE CASES
 *   title, itemNames    assert the cart content
 *   checkout()          go to the checkout information step
 *
 * INVARIANTS
 *   - The cart lists exactly the products added from the inventory, one row each.
 */
import type { Locator, Page } from '@playwright/test';

export class CartPage {
  readonly title: Locator;
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.title = page.getByTestId('title');
    this.itemNames = page.getByTestId('cart-list').getByTestId('inventory-item-name');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
