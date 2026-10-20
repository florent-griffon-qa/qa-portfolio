import { expect, test } from '../../fixtures';

test.describe('Login', { tag: '@smoke' }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await test.step('Open the login page', async () => {
      await loginPage.open();
      await expect(loginPage.form).toBeVisible();
    });
  });

  test('standard user lands on the product list', async ({
    page,
    data,
    loginPage,
    inventoryPage,
  }) => {
    await test.step('Log in as the standard user', async () => {
      await loginPage.login(data.users.standard, data.password);
      await expect(page).toHaveURL(/\/inventory\.html$/);
      await expect(inventoryPage.title).toHaveText('Products');
    });
  });

  test('locked-out user is refused with an explicit error', async ({ page, data, loginPage }) => {
    await test.step('Log in as the locked-out user', async () => {
      await loginPage.login(data.users.lockedOut, data.password);
      await expect(loginPage.error).toHaveText(data.messages.lockedOut);
      await expect(page).not.toHaveURL(/inventory/);
    });
  });

  test('wrong password is refused', async ({ page, data, loginPage }) => {
    await test.step('Log in with a wrong password', async () => {
      await loginPage.login(data.users.standard, `${data.password}-wrong`);
      await expect(loginPage.error).toHaveText(data.messages.wrongCredentials);
      await expect(page).not.toHaveURL(/inventory/);
    });
  });
});
