*** Settings ***
Documentation       SauceDemo purchase: cart, checkout information, totals recomputed, order complete.

Resource            ../../resources/web/login_page.resource
Resource            ../../resources/web/inventory_page.resource
Resource            ../../resources/web/cart_page.resource
Resource            ../../resources/web/checkout_page.resource

Test Setup          Log In As Standard User
Test Teardown       Close SauceDemo

Test Tags           web    smoke


*** Test Cases ***
W04 Standard user buys two products and the totals are consistent
    [Tags]    QAP-T18    positive
    FOR    ${product}    IN    @{products}
        Add Product To Cart    ${product}
    END
    ${count}=    Get Length    ${products}
    Cart Badge Should Be    ${count}
    Open Cart
    Cart Should Contain Exactly    @{products}
    Go To Checkout
    Fill Checkout Information    ${customer}[firstName]    ${customer}[lastName]    ${customer}[postalCode]
    Totals Should Be Consistent
    Finish Order

W05 Checkout is refused when the first name is missing
    [Tags]    QAP-T19    negative
    Add Product To Cart    ${products}[0]
    Open Cart
    Go To Checkout
    Fill Checkout Information    ${EMPTY}    ${customer}[lastName]    ${customer}[postalCode]
    Checkout Error Should Be    ${messages}[firstNameRequired]


*** Keywords ***
Log In As Standard User
    Open SauceDemo
    Log In As    ${users}[standard]    ${password}
    Inventory Should Be Displayed
