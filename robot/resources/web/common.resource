*** Settings ***
Documentation       Browser setup for the SauceDemo tests (Robot Framework Browser library,
...                 which drives Playwright).
...
...                 Test data comes from playwright/test-data/<ENV>.json, loaded as a variable
...                 file on the command line: the Playwright and Robot suites share ONE source
...                 of truth. Timeouts live only here (same rule as playwright.config.ts).

Library             Browser    timeout=10s    run_on_failure=Take Screenshot    strict=${True}


*** Variables ***
${BROWSER}          chromium
${HEADLESS}         ${True}
# Appended to the valid password to build a wrong one (no wrong password stored in test data).
${INVALID_PASSWORD_SUFFIX}      -invalid


*** Keywords ***
Open SauceDemo
    [Documentation]    Opens a fresh browser context on the login page. Called as Test Setup,
    ...    so every test starts with an empty session and an empty cart.
    New Browser    ${BROWSER}    headless=${HEADLESS}
    New Context    baseURL=${baseUrl}
    New Page    ${baseUrl}
    Set Browser Timeout    10s

Close SauceDemo
    [Documentation]    Closes the browser after each test.
    Close Browser    CURRENT
