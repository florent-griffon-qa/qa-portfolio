# Postman / Newman API tests

API tests for [Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html), run with
Newman locally, in Docker and in CI.

## Layout

| Path                                                 | Content                                                         |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| `collections/restful-booker.postman_collection.json` | The collection: folders `Positive` and `Negative`               |
| `environments/local.postman_environment.json`        | Local Docker instance (`http://localhost:3001`)                 |
| `environments/public.postman_environment.json`       | Public instance (`https://restful-booker.herokuapp.com`)        |
| `run-newman.mjs`                                     | Runner: HTML report (htmlextra) and JUnit XML in `reports/api/` |
| `REQUEST_TEMPLATE.md`                                | Template to follow when adding a request                        |

The `authUsername` / `authPassword` values in the environments are the public demo credentials
published in the Restful-Booker documentation. They are not secrets.

## Run

```bash
npm run test:api            # local instance (start it first, see below)
npm run test:api:public     # public instance

# Full local stack in Docker: starts the API, waits for it to be healthy, runs the tests
docker compose -f docker/docker-compose.yml run --rm api-tests
docker compose -f docker/docker-compose.yml down
```

The runner fails when an assertion fails, when the run errors, and when no assertion ran at all.

## Test data independence

The public instance is reset regularly and shared by everyone. No test relies on an existing
booking id. Each folder builds its own chain:

- `Positive`: create a token, create a booking, read it, find it by name, update it, patch it,
  delete it, check it is gone.
- `Negative`: create its own token and booking (`N01 SETUP - CreateToken`,
  `N02 SETUP - CreateBooking`: data preparation, not negative tests), run the negative cases
  against it, then delete it.

Free-text fields (`additionalneeds`) carry a run reference, `<request> - qa-portfolio run <YYMMDD_HHMMSS>`,
so the data created by a given run can be found on a shared instance.

## Script structure

Every test script starts with the same CONFIGURATION block:

```js
// CONFIGURATION
const PLATFORM_API = pm.environment.get("PLATFORM_API") || "PLATFORM";
const REQUEST_TITLE = pm.info.requestName;
const currentFilter = pm.environment.get("currentFilter") || "default filter";
const expectedStatus = Number(pm.variables.get("expectedStatus"));
const knownBug = pm.variables.get("knownBug");
const correctStatus = pm.variables.get("correctStatus");
```

followed by the status-code test `T01`, then the request-specific tests `T02`, `T03`... Every line
in the Test Results starts with `${PLATFORM_API} ${REQUEST_TITLE}`, so a result can be traced to
its environment and request without opening the report.

### Expected status per request

The expected status is never hard-coded in the test script. It comes from three local variables:

| Variable         | Default | Set by a request when                                                               |
| ---------------- | ------- | ----------------------------------------------------------------------------------- |
| `expectedStatus` | `200`   | the request expects another status, e.g. `pm.variables.set("expectedStatus", 201);` |
| `knownBug`       | empty   | the request covers a known defect, e.g. `"BUG-001"`                                 |
| `correctStatus`  | empty   | with `knownBug`: the status the API should return                                   |

The collection-level pre-request script resets all three before every request. This reset is
required: local variables live for the whole collection run, so without it a value set by one
request would leak into the next one.

## Known defects policy

Some negative cases hit real defects of the API (see `docs/API_DOC_ANALYSIS.md` and `docs/bugs/`).
Those tests are characterization tests: they assert the CURRENT measured behaviour, not the
correct one.

- Why: the API is not ours to fix. A test that asserts the correct behaviour would be red on every
  run, and a pipeline that is always red hides new failures. A test that asserts the current
  behaviour keeps the pipeline green and still guards against change.
- Naming: the status test reads
  `<PLATFORM_API> <request> - T01 KNOWN BUG BUG-001 - returns 200 instead of 401`.
- The whole defective response is frozen, not only the status code (for BUG-001: status 200,
  `reason` = `Bad credentials`, no token). A partial fix is detected too.
- When the API changes, the test fails with an actionable message:
  `BUG-001 may be fixed: expected current behaviour 200, got 401 - update the test and close the bug`.
- Fix procedure: switch the request to the correct status (remove `knownBug` and `correctStatus`,
  set `expectedStatus`), update the frozen body assertions, close the bug report.

| Bug                                                                         | Request(s) | Current        | Correct |
| --------------------------------------------------------------------------- | ---------- | -------------- | ------- |
| [BUG-001](../docs/bugs/BUG-001-auth-bad-credentials-returns-200.md)         | N03        | 200 + `reason` | 401     |
| [BUG-002](../docs/bugs/BUG-002-create-booking-missing-field-returns-500.md) | N04        | 500            | 400     |
| [BUG-003](../docs/bugs/BUG-003-delete-booking-returns-201.md)               | P08, N10   | 201            | 204     |
| [BUG-004](../docs/bugs/BUG-004-deleted-booking-returns-405.md)              | N11, N12   | 405            | 404     |

## Dependency overrides

`newman@6.2.3` (latest) and `newman-reporter-htmlextra@1.23.1` pull vulnerable transitive
dependencies. `package.json` pins patched versions with npm `overrides`, always within the same
major version so the public API the tools rely on does not change. Each override is proven by a
full Newman run (Docker and public instance).

| Package      | Installed by default                   | Override | Reason                                                                                                                             |
| ------------ | -------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `handlebars` | 4.7.7 / 4.7.8                          | 4.7.10   | Critical: GHSA-2w6w-674q-4c4q, GHSA-8r5x-fm3f-whwj, GHSA-p8wg-vrv2-v86f (+ high and moderate advisories)                           |
| `node-forge` | 1.3.1                                  | 1.4.0    | High: GHSA-554w-wpv2-vw27, GHSA-5gfm-wpxj-wjgq, GHSA-2328-f5f3-gj25, GHSA-q67f-28xg-22rw, GHSA-5m6q-g25r-mvwx, GHSA-ppp5-5v6c-4jwp |
| `lodash`     | 4.17.21                                | 4.18.1   | High: GHSA-r5fr-rjxr-66jc (+ moderate)                                                                                             |
| `flatted`    | 3.2.6                                  | 3.4.4    | High: GHSA-25h7-pfq9-p65f, GHSA-rf6f-7fwh-wjgh                                                                                     |
| `jose`       | 4.14.4                                 | 4.15.9   | Moderate: GHSA-hhhv-q57g-882q                                                                                                      |
| `qs`         | 6.5.5 / 6.14.2                         | 6.16.1   | Moderate: GHSA-6rw7-vpxm-498p, GHSA-q8mj-m7cp-5q26, GHSA-x5fp-wj9c-mxmx, GHSA-4mjr-xmp4-gh2g                                       |
| `underscore` | 1.12.x (`httpntlm` asks for `~1.12.1`) | 1.13.8   | High: GHSA-qpx9-hpmf-5gmw (see the note below)                                                                                     |

Note on `underscore`: unlike the other overrides, this one is a minor-version bump (1.12.x to
1.13.8) outside the range `httpntlm` declares (`~1.12.1`). It is safe here because `httpntlm` is
only used for NTLM authentication, which this collection does not use. The full Newman run is
green with the override (Docker and public instance, 46 assertions, 0 failures).

Not fixable within the same major version (listed in the README "Known limitations"):
`@faker-js/faker` 5.x, `braces` 3.x, `csv-parse` 4.x, `uuid` 3.x / 8.x, and one remaining
`node-forge` advisory (GHSA-86w9-cpqp-85rv, fixed only after 1.4.0). None is critical. They affect
the test tooling only, never the system under test.
