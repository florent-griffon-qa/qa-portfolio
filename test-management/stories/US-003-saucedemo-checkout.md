# US-003 - Buy products on SauceDemo

| Field      | Value                                                            |
| ---------- | ---------------------------------------------------------------- |
| System     | SauceDemo web application                                        |
| Status     | Approved                                                         |
| Test cases | [US-003 test cases](../test-cases/US-003.md): QAP-T15 to QAP-T19 |

## Story

As a registered shopper,
I want to log in, put products in my cart and complete the checkout,
so that I can place an order and know exactly what I pay.

## Acceptance criteria

1. A valid user reaches the product list after login.
2. A locked-out user, or a wrong password, is refused with an explicit error message.
3. Each product added updates the cart badge, and the cart lists exactly the products added.
4. The checkout requires the customer's first name, last name and postal code.
5. The overview shows an item total equal to the sum of the prices, the tax, and a total equal to
   item total plus tax.
6. Finishing the order shows a confirmation and empties the cart.
