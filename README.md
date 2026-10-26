# QA Automation Portfolio

[![CI](https://github.com/florent-griffon-qa/qa-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/florent-griffon-qa/qa-portfolio/actions/workflows/ci.yml)

Florent Griffon, QA Automation Engineer, banking & payments. This repository shows how I work:
I measure behaviour before asserting, document defects with evidence, keep full traceability,
and direct AI assistants under explicit rules.

At a glance: 21 API requests / 46 assertions, 4 documented defects + 1 design observation,
19 test cases across 3 user stories, 10 UI smoke tests (chromium + firefox), CI green.

## Where to look in 5 minutes

- [BUG-001](docs/bugs/BUG-001-auth-bad-credentials-returns-200.md): one defect taken from a real
  measurement to an evidence-based report, a test that detects the fix, and full traceability.
- [docs/API_DOC_ANALYSIS.md](docs/API_DOC_ANALYSIS.md): every endpoint measured against its
  documentation, each difference classified with an explicit rule.
- [docs/TRACEABILITY.md](docs/TRACEABILITY.md): user story to test case to automated test to
  defect, with every request and UI test accounted for, and the known coverage gaps.
- [docs/AI_WORKFLOW.md](docs/AI_WORKFLOW.md): how AI assistants are directed, where a human
  decides, and what the guardrails caught while building this repository.

## Scope

| Layer    | Target                                                                                                          | Tooling                                       |
| -------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| API      | [Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html) (public instance + local Docker image) | Postman, Newman, htmlextra                    |
| UI       | [SauceDemo](https://www.saucedemo.com)                                                                          | Playwright, TypeScript, Page Objects          |
| Pipeline | GitHub Actions                                                                                                  | lint, secrets scan, API tests, UI smoke tests |

## Quick start

Prerequisites: Docker. For local runs without Docker: Node.js 24.21.0 (see `.nvmrc`).

```bash
git clone https://github.com/florent-griffon-qa/qa-portfolio.git
cd qa-portfolio
npm ci

# API tests in Docker, against a local Restful-Booker container
docker compose -f docker/docker-compose.yml run --rm api-tests

# UI smoke tests in Docker (chromium + firefox)
docker compose -f docker/docker-compose.yml run --rm e2e-tests

docker compose -f docker/docker-compose.yml down
```

Reports are written to `reports/` (HTML and JUnit XML). Without Docker:

```bash
npm run test:api:public        # API tests against the public instance
npx playwright install         # once, to download the browsers
npm run test:smoke             # UI smoke tests
npm run test:e2e:report        # open the Playwright HTML report
```

A `Makefile` wraps the same commands (`make help`).

## What is inside

```text
postman/      Restful-Booker collection, environments (local, public), Newman runner
playwright/   config, test data per environment, fixtures, Page Objects, smoke specs
docs/         test strategy, traceability, API documentation analysis, bug reports, AI workflow
test-management/  user stories, Zephyr-style test cases, Zephyr import CSV
scripts/      deny-list scan, gitleaks wrapper
docker/       test runner image, compose stack
.claude/      AI assistant skills and agents
.github/      CI pipeline
```

Start with [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md) and
[docs/TRACEABILITY.md](docs/TRACEABILITY.md).

## Test design

### API (Postman / Newman)

- Two folders, `Positive` and `Negative`. Each one creates its own booking, works on it and
  deletes it: no test depends on pre-existing data, which matters on a public instance that is
  reset and shared.
- Every Test Results line starts with the environment and the request name, so a failure can be
  traced without opening the report.
- The API behaviour was measured before any assertion was written. The differences with the
  documentation are analysed in [`docs/API_DOC_ANALYSIS.md`](docs/API_DOC_ANALYSIS.md), with a
  classification rule (defect, design observation, documentation gap).
- Known defects are covered by characterization tests: they assert the current behaviour, carry
  the bug id in their name, and fail with an actionable message the day the API is fixed. See
  the [Known defects policy](postman/README.md#known-defects-policy) and [`docs/bugs/`](docs/bugs/).

### UI (Playwright)

- Page Objects built from the observed DOM, each with a header that records when and how it was
  validated, the DOM structure, its use cases and its invariants.
- Every user action is a named `test.step()` followed by an assertion.
- Prices are compared in integer cents: subtotal, tax and total are recomputed, not just read.
- Timeouts and retries are set in one place, `playwright/playwright.config.ts`.

## CI pipeline

```mermaid
flowchart LR
  lint[lint<br/>ESLint, Prettier, tsc] --> scan[secrets-scan<br/>gitleaks, deny-list, npm audit]
  scan --> api[api-tests<br/>Newman vs Restful-Booker container]
  api --> e2e[e2e-smoke<br/>Playwright container]
```

- The UI job runs in the same Playwright image (pinned by digest) as `docker/Dockerfile`, so CI
  and local runs give the same results.
- Reports (Newman HTML and JUnit, Playwright HTML and JUnit, full `npm audit`) are uploaded as
  workflow artifacts.
- `npm audit --audit-level=critical` blocks the pipeline; the full report is informational.

## How I work with AI

I define the test intent, the acceptance criteria and the rules; an AI assistant generates; a
separate read-only reviewer agent checks the output against the rules; I approve; the CI
pipeline validates. Nothing is pushed without my explicit go.

The full workflow, with its human validation points, a worked example (BUG-001, from measurement
to traceability) and its known limitations, is in [docs/AI_WORKFLOW.md](docs/AI_WORKFLOW.md).
Rules for the assistant live in [`CLAUDE.md`](CLAUDE.md), skills in [`.claude/skills/`](.claude/skills/),
agents in [`.claude/agents/`](.claude/agents/).

## Security guards

- gitleaks runs on staged changes before each commit and on the full history in CI.
- A deny-list scan blocks any commit that contains a forbidden term (files, file paths, commit
  message), and fails the pipeline if one appears anywhere in the Git history. The list itself
  is never committed: it lives in an ignored local file and in a CI secret, and the scan fails
  if the list is missing. Before each run, the scan plants a random canary term and checks it
  finds it, so a broken scanner cannot report a false green.
- Every version is pinned: npm packages (exact), Docker images (digest), GitHub Actions
  (commit SHA).

## Known limitations

- Both targets are public services I do not control. They can be slow, unavailable, or reset
  (Restful-Booker is reset regularly). CI retries UI tests up to 2 times; locally there is no retry.
- SauceDemo has no local instance: the `local` and `public` environments are identical for UI tests.
- SauceDemo is English-only, so the bilingual (EN/FR) assertion pattern cannot be demonstrated on it.
- Five npm advisories remain in the Newman toolchain (none critical): they have no fix within the
  same major version. Details in [Dependency overrides](postman/README.md#dependency-overrides).
- Pull requests from forks fail the deny-list step: the CI secret is not available to them.

## Roadmap

- V2 (done): test strategy, traceability, test case management, AI skills and agents, AI workflow.
- V3: hybrid API + UI tests on a self-hosted application, nightly runs, published reports.
- V4: mobile tests with Appium.

## Author

Florent Griffon, QA Automation Engineer. [LinkedIn](https://www.linkedin.com/in/thoflorent-griffon)

## License

[MIT](LICENSE)

Last reviewed: 2026-10-26