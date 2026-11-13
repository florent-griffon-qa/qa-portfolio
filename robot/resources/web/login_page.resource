*** Settings ***
Documentation       LoginPage - SauceDemo login form.
...
...                 VALIDATED
...                 Locators reused from playwright/pages/LoginPage.ts (DOM observed 2026-10-20).
...
...                 DOM STRUCTURE
...                 input[data-test="username"]    textbox "Username"
...                 input[data-test="password"]    textbox "Password"
...                 input[data-test="login-button"]    button "Login"
...                 h3[data-test="error"]    role=alert, "Epic sadface: <message>"
...
...                 USE CASES
...                 Log In As    fill both fields and submit
...                 Login Error Should Be    assert the alert text
...
...                 INVARIANTS
...                 - A successful login navigates to /inventory.html.
...                 - A refused login stays on / and shows exactly one alert.

Resource            common.resource


*** Variables ***
${LOGIN_USERNAME}       css=[data-test="username"]
${LOGIN_PASSWORD}       css=[data-test="password"]
${LOGIN_SUBMIT}         css=[data-test="login-button"]
${LOGIN_ERROR}          css=[data-test="error"]


*** Keywords ***
Log In As
    [Arguments]    ${username}    ${password}
    Fill Text    ${LOGIN_USERNAME}    ${username}
    Fill Secret    ${LOGIN_PASSWORD}    $password
    Click    ${LOGIN_SUBMIT}

Login Error Should Be
    [Arguments]    ${expected_message}
    Get Element Count    ${LOGIN_ERROR}    ==    1
    Get Text    ${LOGIN_ERROR}    ==    ${expected_message}
    Get Url    $=    /
