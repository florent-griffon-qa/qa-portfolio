---
name: zephyr-test-case-writer
description: Write test cases in Zephyr Scale format from a user story, and keep test-management/zephyr-import.csv in sync. Use when a story is added or changed under test-management/stories/.
---

# Zephyr test case writer

## Inputs

- The user story and its acceptance criteria (`test-management/stories/US-<nnn>-*.md`).
- The measured behaviour of the system (API analysis, bug reports) when it exists.
- The last test case key used in the repository.

## Rules

1. One test case per behaviour to verify. Every acceptance criterion is covered by at least one
   test case.
2. Key: `QAP-T<n>`, not zero-padded, next free number. Keys are never reused.
3. Name: starts with a verb, states the expected outcome, unique in the project (it is the link
   with the keys Zephyr assigns at import).
4. Every test case has: objective, precondition, priority (`High`, `Normal`, `Low`), labels,
   status, steps with test data and expected result.
5. Labels: `smoke` or `regression`; `positive` or `negative`; `known-defect` when the expected
   result is not met today; the story id `US-<nnn>`.
6. Expected results are observable and precise (status code, exact message, page title). For a
   known defect: the CORRECT behaviour, then "Current behaviour: ... (BUG-xxx)".
7. Test data is explicit in each step; no "valid data" without saying which.
8. When the case is automated: name the automated test (Postman request id, Playwright test title)
   and set the status to `Automated`.
9. CSV (`zephyr-import.csv`), in this column order:

   ```text
   Name, Objective, Precondition, Priority, Labels, Status,
   Test Script (Step-by-Step) - Step, Test Data, Expected Result
   ```

   No key column. The first row of a test case holds all fields and step 1; each next row holds
   only the next step. Labels comma-separated in one cell. Status `Approved` plus label
   `automated` (see README).

10. Update `docs/TRACEABILITY.md` in the same change.

## Output format

- The test case sections in `test-management/test-cases/US-<nnn>.md`.
- The matching rows in `zephyr-import.csv`.
- The new rows in `docs/TRACEABILITY.md`.

## Quality checklist

- [ ] Every acceptance criterion maps to at least one test case.
- [ ] Keys are `QAP-T<n>`, unique, not zero-padded; names are unique.
- [ ] Every step has test data (or `-`) and an observable expected result.
- [ ] Known defects: correct behaviour first, current behaviour and bug id after.
- [ ] Markdown, CSV and traceability matrix list the same names.
- [ ] The CSV has no key column and parses (quotes doubled, commas quoted).
