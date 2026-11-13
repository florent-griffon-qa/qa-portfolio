*** Settings ***
Documentation       CheckoutPage - SauceDemo checkout: information, overview, complete.
...
...                 VALIDATED
...                 Locators reused from playwright/pages/CheckoutPage.ts (DOM observed 2026-10-20).
...
...                 DOM STRUCTURE
...                 Step one: input[data-test="firstName" | "lastName" | "postalCode"],
...                 input[data-test="continue"], h3[data-test="error"] on error
...                 Step two: div[data-test="inventory-item-price"] one per product,
...                 div[data-test="subtotal-label"] "Item total: $39.98",
...                 div[data-test="tax-label"] "Tax: $3.20",
...                 div[data-test="total-label"] "Total: $43.18", button[data-test="finish"]
...                 Complete: h2[data-test="complete-header"] "Thank you for your order!"
...
...                 USE CASES
...                 Fill Checkout Information    customer from test data
...                 Totals Should Be Consistent    recompute subtotal, tax, total in cents
...                 Finish Order
...
...                 INVARIANTS
...                 - subtotal = sum of item prices; total = subtotal + tax.
...                 - tax = subtotal x taxRatePercent, rounded to the cent.
...                 - Prices are compared in integer cents, never as floats.

Resource            common.resource
Library             Collections


*** Variables ***
${CHECKOUT_TITLE}           css=[data-test="title"]
${CHECKOUT_FIRST_NAME}      css=[data-test="firstName"]
${CHECKOUT_LAST_NAME}       css=[data-test="lastName"]
${CHECKOUT_POSTAL_CODE}     css=[data-test="postalCode"]
${CHECKOUT_CONTINUE}        css=[data-test="continue"]
${CHECKOUT_ERROR}           css=[data-test="error"]
${ITEM_PRICES}              css=[data-test="cart-list"] [data-test="inventory-item-price"]
${SUBTOTAL_LABEL}           css=[data-test="subtotal-label"]
${TAX_LABEL}                css=[data-test="tax-label"]
${TOTAL_LABEL}              css=[data-test="total-label"]
${FINISH_BUTTON}            css=[data-test="finish"]
${COMPLETE_HEADER}          css=[data-test="complete-header"]


*** Keywords ***
Fill Checkout Information
    [Arguments]    ${first_name}    ${last_name}    ${postal_code}
    Get Text    ${CHECKOUT_TITLE}    ==    ${pageTitles}[checkoutInformation]
    Fill Text    ${CHECKOUT_FIRST_NAME}    ${first_name}
    Fill Text    ${CHECKOUT_LAST_NAME}    ${last_name}
    Fill Text    ${CHECKOUT_POSTAL_CODE}    ${postal_code}
    Click    ${CHECKOUT_CONTINUE}

Checkout Error Should Be
    [Arguments]    ${expected_message}
    Get Text    ${CHECKOUT_ERROR}    ==    ${expected_message}

Totals Should Be Consistent
    [Documentation]    Reads every price on the overview page and recomputes the totals.
    Get Text    ${CHECKOUT_TITLE}    ==    ${pageTitles}[checkoutOverview]
    ${elements}=    Get Elements    ${ITEM_PRICES}
    ${sum_cents}=    Set Variable    ${0}
    FOR    ${element}    IN    @{elements}
        ${text}=    Get Text    ${element}
        ${cents}=    Price To Cents    ${text}
        ${sum_cents}=    Evaluate    ${sum_cents} + ${cents}
    END
    ${subtotal}=    Label To Cents    ${SUBTOTAL_LABEL}
    ${tax}=    Label To Cents    ${TAX_LABEL}
    ${total}=    Label To Cents    ${TOTAL_LABEL}
    ${expected_tax}=    Evaluate    round(${subtotal} * ${taxRatePercent} / 100)
    Should Be Equal As Integers    ${subtotal}    ${sum_cents}    msg=Subtotal is not the sum of item prices
    Should Be Equal As Integers    ${tax}    ${expected_tax}    msg=Tax is not ${taxRatePercent} % of the subtotal
    ${expected_total}=    Evaluate    ${subtotal} + ${tax}
    Should Be Equal As Integers    ${total}    ${expected_total}    msg=Total is not subtotal + tax
    Log To Console    Totals in cents: subtotal ${subtotal}, tax ${tax}, total ${total}

Finish Order
    Click    ${FINISH_BUTTON}
    Get Text    ${COMPLETE_HEADER}    ==    ${messages}[orderComplete]

Price To Cents
    [Documentation]    "$29.99" -> 2999. Integer arithmetic only.
    [Arguments]    ${price_text}
    ${match}=    Evaluate    re.search(r'\\$(\\d+)\\.(\\d{2})', $price_text)    modules=re
    Should Not Be Equal    ${match}    ${None}    msg=No price found in "${price_text}"
    ${cents}=    Evaluate    int($match.group(1)) * 100 + int($match.group(2))
    RETURN    ${cents}

Label To Cents
    [Arguments]    ${selector}
    ${text}=    Get Text    ${selector}
    ${cents}=    Price To Cents    ${text}
    RETURN    ${cents}
