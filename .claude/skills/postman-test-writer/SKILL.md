---
name: postman-test-writer
description: Write or update Postman request scripts (pre-request and tests) for an API test collection. Use when adding a request to postman/collections/, writing positive or negative API checks, or covering a known API defect.
---

# Postman test writer

## Inputs

- The endpoint: official name from the API documentation, method, path, parameters.
- The MEASURED behaviour: status code and body from a real call. Never write an assertion from
  the documentation alone; if no measurement is available, ask for one or make the call first.
- The folder: `Positive` or `Negative`.
- When the case hits a defect: the bug id (`BUG-xxx`) and the correct status.

## Rules

1. Name the request `<P|N><nn> <official endpoint name>[ <case>]`, e.g. `N07 UpdateBooking without token`.
2. Every test script starts with the CONFIGURATION block, unchanged:

   ```js
   // CONFIGURATION
   const PLATFORM_API = pm.environment.get("PLATFORM_API") || "PLATFORM";
   const REQUEST_TITLE = pm.info.requestName;
   const currentFilter = pm.environment.get("currentFilter") || "default filter";
   const expectedStatus = Number(pm.variables.get("expectedStatus"));
   const knownBug = pm.variables.get("knownBug");
   const correctStatus = pm.variables.get("correctStatus");
   ```

   followed by the status test `T01` (copy it from an existing request).

3. The expected status is never written in the test script. Default is 200 (reset before every
   request by the collection pre-request script). Another status is set in the request
   pre-request script: `pm.variables.set("expectedStatus", 404);`.
4. Tests are numbered `T01`, `T02`, `T03`... in order. `T01` is always the status code.
5. Every Test Results line starts with `${PLATFORM_API} ${REQUEST_TITLE}`, and shows the values
   it checked (e.g. the returned id), so a line can be traced without opening the report.
   Secrets (tokens, passwords) are never shown: the line states the check, not the value.
6. Required response fields: check presence, format and content. Optional fields: check format or
   content when it is specific (date, enum, number).
7. No hard-coded value in scripts or bodies: test data, expected texts and ids come from
   collection or environment variables. A value a later request needs is saved in a collection
   variable by the test script that receives it.
8. Positive and negative cases are never mixed in a folder. A `Negative` folder may start with the
   setup requests that create its own data (token, booking): they are named
   `<id> SETUP - <endpoint name>` (e.g. `N01 SETUP - CreateToken`) and assert success like any
   request.
9. No request depends on pre-existing data: each folder creates what it uses and deletes it.
   Free-text fields carry the run reference `<request> - qa-portfolio run ${runTs}`.
10. Known defect (characterization test): in the pre-request script set `expectedStatus` to the
    CURRENT measured status, `knownBug` to the bug id, `correctStatus` to the correct status.
    Freeze the whole defective response (status and body), not only the status. A bug report must
    exist in `docs/bugs/`. Policy: `postman/README.md`, "Known defects policy".
11. Every test script ends with a `console.log` of the request title, the status and the start of
    the body. Never log a token or a password.

## Output format

- The request, in the collection JSON (or as pre-request and test scripts to paste in Postman).
- A short note: the measured behaviour it relies on, and the variables it reads or writes.

## Quality checklist

- [ ] The behaviour was measured before the assertions were written.
- [ ] CONFIGURATION block present and unchanged; `T01` is the status test.
- [ ] Expected status comes from `expectedStatus`, never a literal in the test script.
- [ ] Every Test Results line starts with `${PLATFORM_API} ${REQUEST_TITLE}`.
- [ ] Required fields: presence, format, content.
- [ ] No hard-coded test data, id or expected text.
- [ ] The request sits in the right folder; no dependency on pre-existing data.
- [ ] Known defect: `knownBug` and `correctStatus` set, full response frozen, bug report exists.
- [ ] Script ends with `console.log`, with no secret in it.
- [ ] `npm run test:api` and `npm run test:api:public` are green.
