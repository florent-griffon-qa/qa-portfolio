*** Settings ***
Documentation       SauceDemo login: one accepted user, two refused logins.

Resource            ../../resources/web/login_page.resource
Resource            ../../resources/web/inventory_page.resource

Test Setup          Open SauceDemo
Test Teardown       Close SauceDemo

Test Tags           web    smoke


*** Test Cases ***
W01 Standard user logs in and sees the product list
    [Tags]    QAP-T15    positive
    Log In As    ${users}[standard]    ${password}
    Inventory Should Be Displayed

W02 Locked-out user is refused with an explicit message
    [Tags]    QAP-T16    negative
    Log In As    ${users}[lockedOut]    ${password}
    Login Error Should Be    ${messages}[lockedOut]

W03 Wrong password is refused with an explicit message
    [Tags]    QAP-T17    negative
    Log In As    ${users}[standard]    ${password}${INVALID_PASSWORD_SUFFIX}
    Login Error Should Be    ${messages}[wrongCredentials]
