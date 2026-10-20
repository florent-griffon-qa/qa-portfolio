---
name: playwright-page-object
description: Write or update a Playwright Page Object and the specs that use it. Use when adding a page or a locator under playwright/pages/, or writing a test under playwright/tests/.
---

# Playwright Page Object

## Inputs

- The page or component, and the user actions the test needs.
- The OBSERVED DOM: an ARIA snapshot and the HTML of the elements involved, captured from the real
  application. Without it, do not write a locator: capture it first or ask for it.
- The test data the spec will use (`playwright/test-data/<env>.json`).

## Rules

1. One Page Object per page or component, in `playwright/pages/`. Specs never contain a locator.
2. Every Page Object starts with a header of four sections:
   - `VALIDATED`: date, Playwright version, browsers, target, specs that exercise it.
   - `DOM STRUCTURE`: the observed elements, with their `data-test`, role and accessible name.
   - `USE CASES`: each public member and what it is for.
   - `INVARIANTS`: what must stay true (e.g. "products are matched by exact name, never by position").
3. Locators: `getByTestId` (attribute `data-test`, set in the config) or `getByRole` with the
   accessible name seen in the ARIA snapshot. Never by position, never by CSS class.
4. The Page Object exposes locators and actions; assertions live in the specs.
5. In a spec, every user action is a named `test.step()` followed by at least one `expect()` on its
   effect.
6. No literal test data or expected UI text in specs: it comes from `playwright/test-data/<env>.json`
   (through the `data` fixture) or from the Page Object (URL patterns). Counts produced by the
   test's own actions may be computed in the spec.
7. Specs import `test` and `expect` from `playwright/fixtures`, which provides the Page Objects.
8. Timeouts and retries live only in `playwright/playwright.config.ts`. No `test.setTimeout()`,
   no `waitForTimeout()`.
9. Money is compared in integer cents (`helpers/money.ts`).
10. On failure, read Playwright's `error-context.md` and the trace before changing anything; after
    two unsuccessful fixes, go back to observing the DOM.

## Output format

- The Page Object file with its header, and the spec changes.
- The command used and the result of the run (chromium and firefox).

## Quality checklist

- [ ] The DOM was observed before any locator was written; the header quotes it.
- [ ] The header has the four sections, and `USE CASES` lists every public member.
- [ ] No locator, no literal test data or expected text in specs.
- [ ] Every action is a `test.step()` with an `expect()`.
- [ ] No timeout outside the config.
- [ ] `npm run lint` is green (0 warnings, tsc included).
- [ ] The suite is green on chromium and firefox, and a deliberately broken assertion makes it fail.
