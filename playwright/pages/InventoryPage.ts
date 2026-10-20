/**
 * InventoryPage - SauceDemo product list and header cart link.
 *
 * VALIDATED
 *   2026-10-20, Playwright 1.64.1, chromium and firefox, public site https://www.saucedemo.com
 *   Specs: playwright/tests/smoke/login.spec.ts, playwright/tests/smoke/checkout.spec.ts
 *
 * DOM STRUCTURE (observed 2026-10-20)
 *   span[data-test="title"]                    "Products"
 *   a[data-test="shopping-cart-link"]          button "Cart, empty" or "Cart, <n> items"
 *     span[data-test="shopping-cart-badge"]    "<n>", absent when the cart is empty
 *   div[data-test="inventory-list"]
 *     div[data-test="inventory-item"]          one per product (6 on the site)
 *       div[data-test="inventory-item-name"]   "Sauce Labs Backpack"
 *       div[data-test="inventory-item-price"]  "$29.99"
 *       button "Add to cart"                   becomes button "Remove" once added
 *
 * USE CASES
 *   title                    the page title, to assert the page is loaded
 *   item(name)               the product card matching an exact product name
 *   addToCart(name)          click "Add to cart" on that card
 *   removeButton(name)       the "Remove" button that replaces it
 *   cartBadge, openCart()    the item counter and the link to the cart
 *
 * INVARIANTS
 *   - Product cards are matched by their exact displayed name, never by position.
 *   - Adding a product turns its button into "Remove" and increments the badge by 1.
 */
import type { Locator, Page } from '@playwright/test';

export class InventoryPage {
  readonly title: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartLink = page.getByTestId('shopping-cart-link');
  }

  item(name: string): Locator {
    return this.page.getByTestId('inventory-item').filter({
      has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }),
    });
  }

  async addToCart(name: string): Promise<void> {
    await this.item(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  removeButton(name: string): Locator {
    return this.item(name).getByRole('button', { name: 'Remove' });
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
