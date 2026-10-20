---
name: bug-report-writer
description: Write a bug report for a measured defect, using docs/templates/BUG_REPORT.md. Use when an API or UI behaviour is classified as a defect, or when a failed run is diagnosed as a product defect.
---

# Bug report writer

## Inputs

- The measured behaviour: the exact request or user steps, the status code and body (API), or the
  screen state, `error-context.md`, screenshot and trace (UI).
- The reference for the expected behaviour: documentation section, RFC 9110 section, or
  acceptance criterion.
- The automated test that covers it, when one exists.

## Rules

1. Use the template `docs/templates/BUG_REPORT.md`; file name `docs/bugs/BUG-<nnn>-<short-slug>.md`,
   next free number.
2. Title: `<endpoint or screen> <what it does wrong> <in which condition>`, factual, no opinion,
   e.g. "CreateToken returns 200 on bad credentials".
3. Steps to reproduce: numbered, minimal, with the exact data. Anyone must be able to replay them.
4. Expected: the correct behaviour WITH its reference (documentation, RFC 9110 section,
   acceptance criterion). No reference, no expected result: say so.
5. Actual: what was observed, and why it matters to a client.
6. Evidence: the measured request and response, the environment, the date. Never paste a token,
   a password or any secret: replace it with `<token>`.
7. Severity: `Major` when a client can be misled into a wrong decision; `Minor` when the result
   is wrong but not misleading in practice.
8. Only measured facts. A suspected cause is labelled as a hypothesis.
9. Link the covering test (`KNOWN BUG BUG-xxx`) and add the bug to `docs/TRACEABILITY.md`.

## Output format

A complete `docs/bugs/BUG-<nnn>-<slug>.md` following the template.

## Quality checklist

- [ ] Reproducible from the steps alone.
- [ ] Expected result has a reference.
- [ ] Evidence is measured, dated, with its environment, and contains no secret.
- [ ] Severity follows the rule above.
- [ ] Covering test and traceability matrix updated.
