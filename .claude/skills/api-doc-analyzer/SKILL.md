---
name: api-doc-analyzer
description: Compare an API's documentation with its measured behaviour and classify every difference. Use before writing API tests for a new endpoint, or when a test result contradicts the documentation.
---

# API doc analyzer

## Inputs

- The API documentation (URL or file) for the endpoints in scope.
- Access to at least one running instance (local and public when both exist).

## Rules

1. Read the documented request, parameters, headers and responses of each endpoint.
2. Call every endpoint for real: valid input, then invalid input (missing field, malformed body,
   unknown id, no or bad authentication, operation on a deleted resource). Record status and body.
3. Repeat on each available instance and note whether results differ.
4. Never state a behaviour you did not measure. A list of "expected discrepancies" from elsewhere
   is a list of things to check, not a result.
5. Classify every difference with the classification rule:
   - Defect: the behaviour contradicts the documentation, OR violates HTTP semantics (RFC 9110)
     on a state-changing operation in a way that can mislead a client.
   - Design observation: the behaviour is documented and has no impact on data state.
   - Documentation gap: the documentation is silent or inaccurate; the behaviour itself is not
     necessarily wrong.
6. Give one line of reasoning for each borderline classification.
7. Each defect gets a bug report (see `bug-report-writer`) and a `KNOWN BUG` test (see
   `postman-test-writer`). Observations and gaps are recorded in the analysis only.
8. Use the official endpoint names from the documentation, never only the URL path.

## Output format

`docs/API_DOC_ANALYSIS.md`:

- Source of the documentation, date and instances measured.
- Classification rule, applied to borderline cases.
- Summary table: endpoint (doc title), case, documented, measured, classification.
- One section per design observation (`O-xxx`) and documentation gap (`D-xxx`).

## Quality checklist

- [ ] Every row comes from a real call, on every available instance.
- [ ] Every difference is classified, with reasoning for borderline cases.
- [ ] Every defect has a bug report and a `KNOWN BUG` test.
- [ ] No claim about the documentation that was not checked in the documentation itself.
