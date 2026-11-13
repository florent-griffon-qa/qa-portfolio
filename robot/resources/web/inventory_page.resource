*** Settings ***
Documentation       InventoryPage - SauceDemo product list.
...
...                 VALIDATED
...                 Locators reused from playwright/pages/InventoryPage.ts (DOM observed 2026-10-20).
...
...                 DOM STRUCTURE
...                 span[data-test="title"]    "Products"
...                 a[data-test="shopping-cart-link"]
...                 span[data-test="shopping-cart-badge"]    "<n>", absent when the cart is empty
...                 div[data-test="inventory-item"]    one per product
...                 div[data-test="inventory-item-name"]    "Sauce Labs Backpack"
...                 button "Add to cart" / "Remove"    inside each item
...
...                 USE CASES
...                 Inventory Should Be Displayed    title and URL
...                 Add Product To Cart    by product name
...                 Cart Badge Should Be    number of items
...                 Open Cart
...
...                 INVARIANTS
...                 - Adding a product turns its button into "Remove" and increments the badge.

Resource            common.resource


*** Variables ***
${INVENTORY_TITLE}      css=[data-test="title"]
${CART_LINK}            css=[data-test="shopping-cart-link"]
${CART_BADGE}           css=[data-test="shopping-cart-badge"]


*** Keywords ***
Inventory Should Be Displayed
    Get Url    *=    /inventory.html
    Get Text    ${INVENTORY_TITLE}    ==    ${pageTitles}[inventory]

Product Item
    [Documentation]    Returns the selector of one product card, found by its exact name.
    [Arguments]    ${product_name}
    RETURN    css=[data-test="inventory-item"]:has([data-test="inventory-item-name"]:text-is("${product_name}"))

Add Product To Cart
    [Arguments]    ${product_name}
    ${item}=    Product Item    ${product_name}
    Click    ${item} >> role=button[name="Add to cart"]
    Get Element States    ${item} >> role=button[name="Remove"]    contains    visible

Cart Badge Should Be
    [Documentation]    The badge text is a string ("2"): the count is converted before comparing,
    ...    so the keyword accepts a number or a string.
    [Arguments]    ${expected_count}
    ${expected_text}=    Convert To String    ${expected_count}
    Get Text    ${CART_BADGE}    ==    ${expected_text}

Open Cart
    Click    ${CART_LINK}
