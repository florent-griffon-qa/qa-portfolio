*** Settings ***
Documentation       CartPage - SauceDemo cart.
...
...                 VALIDATED
...                 Locators reused from playwright/pages/CartPage.ts (DOM observed 2026-10-20).
...
...                 DOM STRUCTURE
...                 span[data-test="title"]    "Your Cart"
...                 div[data-test="cart-list"] > div[data-test="inventory-item-name"]
...                 button[data-test="checkout"]    "Checkout"
...
...                 USE CASES
...                 Cart Should Contain Exactly    list of product names, in order
...                 Go To Checkout
...
...                 INVARIANTS
...                 - The cart lists each added product once, in the order it was added.

Resource            common.resource


*** Variables ***
${CART_TITLE}           css=[data-test="title"]
${CART_ITEM_NAMES}      css=[data-test="cart-list"] [data-test="inventory-item-name"]
${CART_CHECKOUT}        css=[data-test="checkout"]


*** Keywords ***
Cart Should Contain Exactly
    [Arguments]    @{expected_products}
    Get Text    ${CART_TITLE}    ==    ${pageTitles}[cart]
    ${elements}=    Get Elements    ${CART_ITEM_NAMES}
    @{names}=    Create List
    FOR    ${element}    IN    @{elements}
        ${name}=    Get Text    ${element}
        Append To List    ${names}    ${name}
    END
    Lists Should Be Equal    ${names}    ${expected_products}

Go To Checkout
    Click    ${CART_CHECKOUT}
