import { expect, test } from '../../fixtures';
import { parseCents, taxCents } from '../../helpers/money';

test.describe('Checkout', { tag: '@smoke' }, () => {
  test.beforeEach(async ({ page, data, loginPage, inventoryPage }) => {
    await test.step('Log in as the standard user', async () => {
      await loginPage.open();
      await loginPage.login(data.users.standard, data.password);
      await expect(page).toHaveURL(/\/inventory\.html$/);
      await expect(inventoryPage.title).toHaveText('Products');
    });
  });

  test('standard user buys two products and the totals are consistent', async ({
    page,
    data,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    for (const [index, product] of data.products.entries()) {
      await test.step(`Add "${product}" to the cart`, async () => {
        await inventoryPage.addToCart(product);
        await expect(inventoryPage.removeButton(product)).toBeVisible();
        await expect(inventoryPage.cartBadge).toHaveText(String(index + 1));
      });
    }

    await test.step('Open the cart', async () => {
      await inventoryPage.openCart();
      await expect(cartPage.title).toHaveText('Your Cart');
      await expect(cartPage.itemNames).toHaveText(data.products);
    });

    await test.step('Start the checkout', async () => {
      await cartPage.checkout();
      await expect(checkoutPage.title).toHaveText('Checkout: Your Information');
    });

    await test.step('Fill the customer information', async () => {
      await checkoutPage.fillInformation(data.customer);
      await expect(checkoutPage.firstName).toHaveValue(data.customer.firstName);
      await expect(checkoutPage.lastName).toHaveValue(data.customer.lastName);
      await expect(checkoutPage.postalCode).toHaveValue(data.customer.postalCode);
    });

    await test.step('Continue to the overview', async () => {
      await checkoutPage.continue();
      await expect(checkoutPage.title).toHaveText('Checkout: Overview');
      await expect(checkoutPage.itemPrices).toHaveCount(data.products.length);
    });

    await test.step('Check subtotal, tax and total', async () => {
      const itemCents = (await checkoutPage.itemPrices.allInnerTexts()).map(parseCents);
      const subtotal = parseCents(await checkoutPage.subtotal.innerText());
      const tax = parseCents(await checkoutPage.tax.innerText());
      const total = parseCents(await checkoutPage.total.innerText());

      expect(subtotal, 'subtotal = sum of item prices').toBe(
        itemCents.reduce((sum, cents) => sum + cents, 0),
      );
      expect(tax, `tax = ${data.taxRatePercent} % of the subtotal`).toBe(
        taxCents(subtotal, data.taxRatePercent),
      );
      expect(total, 'total = subtotal + tax').toBe(subtotal + tax);
    });

    await test.step('Finish the order', async () => {
      await checkoutPage.finish();
      await expect(page).toHaveURL(/\/checkout-complete\.html$/);
      await expect(checkoutPage.completeHeader).toHaveText(data.messages.orderComplete);
      await expect(inventoryPage.cartBadge).toBeHidden();
    });
  });

  test('checkout information is required', async ({
    data,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await test.step('Add one product and open the checkout', async () => {
      await inventoryPage.addToCart(data.products[0]);
      await expect(inventoryPage.cartBadge).toHaveText('1');
      await inventoryPage.openCart();
      await cartPage.checkout();
      await expect(checkoutPage.title).toHaveText('Checkout: Your Information');
    });

    await test.step('Continue with empty fields', async () => {
      await checkoutPage.continue();
      await expect(checkoutPage.error).toHaveText(data.messages.firstNameRequired);
      await expect(checkoutPage.title).toHaveText('Checkout: Your Information');
    });
  });
});
