# Test strategy

## 1. Scope and objectives

| System under test  | What is tested                                                                                                          | Why                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Restful-Booker API | Booking lifecycle (create, read, search, update, patch, delete), token authentication, input validation, error handling | Show API testing on a real HTTP API whose documentation and behaviour differ |
| SauceDemo web app  | Login (valid and refused), purchase flow from product list to order confirmation, price totals                          | Show UI end-to-end testing with maintainable Page Objects                    |

Objectives:

1. Every user story has automated tests that run in CI on every push (see [TRACEABILITY.md](TRACEABILITY.md)).
2. Every difference between documented and measured behaviour is classified and, when it is a
   defect, reported and covered by a test that detects the fix.
3. A failure in CI is reproducible locally with the same versions (pinned Docker images).

## 2. Out of scope

- Performance and load testing.
- Security testing of the targets (only the repository itself is scanned: secrets, deny-list).
- Accessibility and visual regression.
- SauceDemo special users (`problem_user`, `performance_glitch_user`, `error_user`, `visual_user`),
  product sorting, cart removal, logout. Listed as coverage gaps in [TRACEABILITY.md](TRACEABILITY.md#coverage-gaps).

## 3. Test levels and types

| Level      | Type                                                | Tool                                  | Where                                     |
| ---------- | --------------------------------------------------- | ------------------------------------- | ----------------------------------------- |
| API        | Functional, positive                                | Postman / Newman                      | `postman/` folder `Positive` (P01 to P09) |
| API        | Functional, negative and error handling             | Postman / Newman                      | `postman/` folder `Negative` (N01 to N12) |
| API        | Characterization of known defects                   | Postman / Newman                      | requests flagged `KNOWN BUG`              |
| UI         | End-to-end smoke, cross-browser (chromium, firefox) | Playwright                            | `playwright/tests/smoke/` (`@smoke`)      |
| Repository | Static checks: lint, types, format                  | ESLint, tsc, Prettier                 | pre-commit and CI                         |
| Repository | Secrets and deny-list scans                         | gitleaks, `scripts/denylist-scan.mjs` | pre-commit and CI                         |

## 4. Approach

### Measure before asserting

No assertion is written from the documentation alone. Each endpoint was called first, and the
result compared with the documentation in [API_DOC_ANALYSIS.md](API_DOC_ANALYSIS.md). The same rule
applies to the UI: no locator is written without the DOM having been observed.

### Known defects

A defect of a system we do not own is handled with a characterization test: the test asserts the
current behaviour so the pipeline stays green, carries the bug id in its name, and fails with an
actionable message when the behaviour changes. Policy: [postman/README.md](../postman/README.md#known-defects-policy).
Classification rule (defect, design observation, documentation gap): [API_DOC_ANALYSIS.md](API_DOC_ANALYSIS.md#classification-rule).

### Test data

- API: no pre-existing id is used. Each Postman folder creates its own booking, works on it and
  deletes it, because the public instance is shared and reset regularly.
- API: free-text fields carry a run reference (`<request> - qa-portfolio run <YYMMDD_HHMMSS>`), so
  the data created by a run can be found on a shared instance.
- UI: test data lives in `playwright/test-data/<env>.json`, never as literals in specs.
- Credentials used are the public demo credentials published by each application.

### Assertions

- API: status code first (`T01`), then the body: required fields for presence, format and value.
- UI: every user action is a named `test.step()` followed by an assertion on its effect.
- Money is compared in integer cents and recomputed (subtotal, tax, total), not just read.

## 5. Environments

| Environment | API                                           | UI                                               | Used by                                   |
| ----------- | --------------------------------------------- | ------------------------------------------------ | ----------------------------------------- |
| `local`     | Restful-Booker Docker image, pinned by digest | SauceDemo public site (no local instance exists) | developers, CI                            |
| `public`    | https://restful-booker.herokuapp.com          | SauceDemo public site                            | developers, before a release of the suite |

CI runs the API tests against a Restful-Booker service container, and the UI tests inside the
same Playwright image as `docker/Dockerfile`.

## 6. Entry and exit criteria

Entry, before a test is written:

- the behaviour has been measured (API) or the DOM observed (UI);
- the test is linked to a user story and a test case in [TRACEABILITY.md](TRACEABILITY.md).

Exit, before a change is merged:

- lint, type check and format pass with zero warnings;
- gitleaks and the deny-list scans pass on the working tree and on the full history;
- `npm audit` reports no critical vulnerability;
- API and UI suites are green in CI;
- every new known defect has a bug report and a `KNOWN BUG` test.

## 7. Risks and mitigations

| Risk                                     | Impact                         | Mitigation                                                                                                          |
| ---------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Public targets are slow, down or reset   | False failures in CI           | Own-data chains; CI-only retries (2) for UI; local Docker instance for the API                                      |
| A target fixes or changes a known defect | Silent drift of expectations   | Characterization tests fail with `BUG-xxx may be fixed`                                                             |
| Locators break after a UI change         | Red suite, slow diagnosis      | Locators from the observed DOM, `data-test` attributes, Page Object header records the DOM it was validated against |
| Version drift between local and CI       | "Works on my machine"          | Exact npm versions, Docker images by digest, Actions by commit SHA, same image locally and in CI                    |
| Secret or forbidden term committed       | Leak, hard to undo once public | gitleaks and deny-list in pre-commit and CI, deny-list self-test with a canary                                      |
| Vulnerable test tooling                  | Supply-chain risk              | npm overrides within major versions, CI blocks on critical advisories                                               |

## 8. Flaky tests

A retry is a safety net for public services, not a fix. Retries are enabled in CI only. A test
that passes only on retry is treated as a defect of the suite: its cause is found (trace,
`error-context.md`) and fixed. A timeout is never "fixed" by raising it in a spec: timeouts live
only in `playwright/playwright.config.ts`.

## 9. Defect management

- Template and examples: [docs/bugs/](bugs/).
- Each report records the expected behaviour (with its reference: documentation or RFC 9110),
  the actual behaviour, the measured evidence and the automated test that covers it.
- Severity: Major when a client can be misled into a wrong decision (a failed login seen as a
  success, a client error seen as a server failure); Minor when the status code is wrong but the
  outcome is not misleading in practice.

## 10. Reporting

| Report                                                             | Location         | In CI                 |
| ------------------------------------------------------------------ | ---------------- | --------------------- |
| Newman HTML (htmlextra) and JUnit XML                              | `reports/api/`   | artifact `api-report` |
| Playwright HTML, JUnit XML, traces, screenshots, videos on failure | `reports/e2e/`   | artifact `e2e-report` |
| Full `npm audit` report                                            | `reports/audit/` | artifact `npm-audit`  |
