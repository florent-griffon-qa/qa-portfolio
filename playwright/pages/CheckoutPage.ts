/**
 * CheckoutPage - SauceDemo checkout: information (step one), overview (step two), complete.
 *
 * VALIDATED
 *   2026-10-20, Playwright 1.64.1, chromium and firefox, public site https://www.saucedemo.com
 *   Spec: playwright/tests/smoke/checkout.spec.ts
 *
 * DOM STRUCTURE (observed 2026-10-20)
 *   Step one, /checkout-step-one.html, title "Checkout: Your Information"
 *     form "Checkout information"
 *       input[data-test="firstName"]   textbox "First Name"
 *       input[data-test="lastName"]    textbox "Last Name"
 *       input[data-test="postalCode"]  textbox "Zip/Postal Code"
 *       input[data-test="continue"]    button "Continue"
 *     On error: h3[data-test="error"] role=alert, "Error: First Name is required"
 *   Step two, /checkout-step-two.html, title "Checkout: Overview"
 *     div[data-test="inventory-item-price"]  one per product, "$29.99"
 *     div[data-test="subtotal-label"]        "Item total: $39.98"
 *     div[data-test="tax-label"]             "Tax: $3.20"
 *     div[data-test="total-label"]           "Total: $43.18"
 *     button[data-test="finish"]             "Finish"
 *   Complete, /checkout-complete.html, title "Checkout: Complete!"
 *     h2[data-test="complete-header"]        heading "Thank you for your order!"
 *
 * USE CASES
 *   fillInformation(customer)   fill the three fields (empty strings allowed)
 *   continue(), finish()        move to the next step
 *   itemPrices, subtotal, tax, total, completeHeader, error   values to assert
 *
 * INVARIANTS
 *   - Step two: subtotal = sum of item prices; total = subtotal + tax.
 *   - Tax = subtotal x 8 %, rounded to the cent (measured 2026-10-20: 39.98 -> 3.20).
 *   - The cart badge is gone after finish.
 */
import type { Locator, Page } from '@playwright/test';

export type Customer = { firstName: string; lastName: string; postalCode: string };

export class CheckoutPage {
  readonly title: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly error: Locator;
  readonly itemPrices: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;
  readonly completeHeader: Locator;

  constructor(page: Page) {
    this.title = page.getByTestId('title');
    const form = page.getByRole('form', { name: 'Checkout information' });
    this.firstName = form.getByTestId('firstName');
    this.lastName = form.getByTestId('lastName');
    this.postalCode = form.getByTestId('postalCode');
    this.continueButton = form.getByRole('button', { name: 'Continue' });
    this.error = form.getByRole('alert');
    this.itemPrices = page.getByTestId('cart-list').getByTestId('inventory-item-price');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.completeHeader = page.getByTestId('complete-header');
  }

  async fillInformation(customer: Customer): Promise<void> {
    await this.firstName.fill(customer.firstName);
    await this.lastName.fill(customer.lastName);
    await this.postalCode.fill(customer.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
