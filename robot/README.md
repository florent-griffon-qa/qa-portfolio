# Robot Framework module

The same test intent as the Postman and Playwright suites, written with
[Robot Framework](https://robotframework.org): keyword-driven tests that a business reader can
follow line by line.

- API: Restful-Booker, with [RequestsLibrary](https://github.com/MarketSquare/robotframework-requests).
- Web: SauceDemo, with [Browser library](https://robotframework-browser.org) (it drives Playwright).

Why a second stack on the same targets: it shows that the test design (positive and negative
cases, characterization of known defects, traceability, integer price checks) does not depend on
the tool.

## Layout

```text
robot/
  requirements.txt          pinned Python packages
  run.py                    runner: picks the variable files for the suite and the environment
  variables/
    api-local.json          API base URL and credentials, local Docker container
    api-public.json         same, public instance
    booking-data.json       booking bodies and negative-case values
  resources/
    api/booking_api.resource     API keywords (one per request) and shared assertions
    web/common.resource          browser setup, the only place with timeouts
    web/*_page.resource          one page object per page, with the same header as Playwright
  tests/
    api/booking_positive.robot   P01 to P06, full booking lifecycle
    api/booking_negative.robot   N01 to N07, errors and known defects
    web/login.robot              W01 to W03
    web/checkout.robot           W04 to W05
```

The web suites read `playwright/test-data/<env>.json`: Playwright and Robot share one source of
test data.

## Install (once)

Prerequisites: Python 3.12 or later (CI uses 3.13), and Node.js (see `.nvmrc`) for the Browser library.

```bash
python -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
python -m pip install -r robot/requirements.txt
rfbrowser init chromium              # downloads the browser used by the web suites
```

## Run

From the repository root:

```bash
python robot/run.py api                  # API, local container (start it first, see main README)
python robot/run.py api --env public     # API, public instance
python robot/run.py web --env public     # web, public SauceDemo
python robot/run.py api --dryrun         # syntax and keyword check only, no request sent
```

Reports: `reports/robot/<suite>/report.html` (summary) and `log.html` (every step, every request
and response). `junit.xml` is for CI.

## How to read a test

```robot
N01 CreateToken with bad credentials - KNOWN BUG BUG-001
    [Tags]    QAP-T8    known-bug    BUG-001
    ${response}=    Create Token    ${AUTH_USERNAME}    ${AUTH_PASSWORD}${INVALID_PASSWORD_SUFFIX}
    Status Should Be Known Bug    ${response}    bug=BUG-001    current=200    correct=401
    Should Be Equal    ${response.json()}[reason]    ${BAD_CREDENTIALS_REASON}
    Dictionary Should Not Contain Key    ${response.json()}    token
```

- Line 1: the test name, with its id (N01) and the bug it characterizes.
- `[Tags]`: the Zephyr-style test case (QAP-T8) and filters. Run only the known bugs with
  `python robot/run.py api --include known-bug`, or one test case with `--include QAP-T8`.
- `${...}`: a variable. Its value comes from `robot/variables/*.json`, never from the test.
- `Create Token`: a keyword written in `resources/api/booking_api.resource`.
- `Status Should Be Known Bug`: asserts the current wrong status (200). The day the API returns
  401, the test fails with `BUG-001 may be fixed ... update the test and close the bug`.

## Rules applied

Same rules as the rest of the repository (`CLAUDE.md`):

- No literal test data in tests: everything comes from variable files.
- Each API suite creates and deletes its own booking.
- Known defects follow the "Known defects policy" in `postman/README.md`.
- Positive and negative cases live in separate suites.
- Locators come from the DOM observed for the Playwright page objects.
- Every version is pinned: Python packages in `requirements.txt`, GitHub Actions by commit SHA.

## Traceability

| Robot test | Test case | Defect  |
| ---------- | --------- | ------- |
| P01        | QAP-T7    | -       |
| P02        | QAP-T1    | -       |
| P03        | QAP-T2    | -       |
| P04        | QAP-T9    | -       |
| P05, P06   | QAP-T12   | BUG-003 |
| N01        | QAP-T8    | BUG-001 |
| N02        | QAP-T4    | BUG-002 |
| N03        | QAP-T6    | -       |
| N04, N05   | QAP-T11   | -       |
| N06        | QAP-T13   | -       |
| N07        | QAP-T14   | BUG-004 |
| W01        | QAP-T15   | -       |
| W02        | QAP-T16   | -       |
| W03        | QAP-T17   | -       |
| W04        | QAP-T18   | -       |
| W05        | QAP-T19   | -       |
