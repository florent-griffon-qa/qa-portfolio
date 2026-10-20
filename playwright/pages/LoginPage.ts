/**
 * LoginPage - SauceDemo login form.
 *
 * VALIDATED
 *   2026-10-20, Playwright 1.64.1, chromium and firefox, public site https://www.saucedemo.com
 *   Specs: playwright/tests/smoke/login.spec.ts, playwright/tests/smoke/checkout.spec.ts
 *
 * DOM STRUCTURE (observed 2026-10-20)
 *   form "Login"
 *     input#user-name    data-test="username"      textbox "Username"
 *     input#password     data-test="password"      textbox "Password"
 *     input#login-button data-test="login-button"  button "Login"
 *   On error, inside the form:
 *     h3[data-test="error"] role=alert, text "Epic sadface: <message>"
 *       button[data-test="error-button"] "Dismiss error"
 *
 * USE CASES
 *   open()                     navigate to the login page
 *   login(username, password)  fill both fields and submit
 *   error                      the error alert, to assert its text
 *
 * INVARIANTS
 *   - A successful login navigates to /inventory.html.
 *   - A refused login stays on / and shows exactly one alert in the form.
 */
import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly form: Locator;
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.form = page.getByRole('form', { name: 'Login' });
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.submit = page.getByTestId('login-button');
    this.error = this.form.getByRole('alert');
  }

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }
}
