# CLAUDE.md

Instructions for AI coding assistants working in this repository.

## Project

QA automation portfolio: Postman/Newman API tests (Restful-Booker) and Playwright UI tests
(SauceDemo), dockerized, with a GitHub Actions pipeline. All repository content is in English.

## Commands

```bash
npm ci                         # install dependencies and Git hooks
npm run lint                   # ESLint (0 warnings), Prettier, tsc --noEmit
npm run test:api               # Newman, local API (ENV=local)
npm run test:api:public        # Newman, public API
npm run test:smoke             # Playwright @smoke, chromium + firefox
npm run scan:denylist          # deny-list scan of the working tree
npm run scan:denylist:history  # deny-list scan of every commit message and past file content
npm run scan:secrets           # gitleaks on staged changes

docker compose -f docker/docker-compose.yml run --rm api-tests
docker compose -f docker/docker-compose.yml run --rm e2e-tests
```

## Layout

```text
postman/      collection (single source of truth, edited in Postman or in JSON), environments, runner
playwright/   config, env + test data, fixtures, page objects, specs
docs/         API doc analysis, bug reports
scripts/      deny-list scan, gitleaks wrapper
docker/       test runner image, compose stack
```

## Rules

1. Never write a locator without having observed the real DOM (ARIA snapshot or HTML).
2. Every Page Object starts with a header: VALIDATED, DOM STRUCTURE, USE CASES, INVARIANTS.
3. Every UI action is a named `test.step()` followed by an `expect()`.
4. Timeouts live only in `playwright/playwright.config.ts`. No `test.setTimeout()`.
5. No literal test data in specs: it comes from `playwright/test-data/<env>.json` or Postman variables.
6. API tests never rely on an existing id: each chain creates, reads, updates and deletes its own data.
7. Known API defects follow the "Known defects policy" in `postman/README.md`: the test asserts the
   current behaviour, is named `KNOWN BUG BUG-xxx`, and has a report in `docs/bugs/`.
8. Pin every version: npm packages (exact), Docker images (digest), GitHub Actions (commit SHA).
9. No secret in the repository. `.env.example` only. The deny-list (`.denylist`) is never committed,
   copied or quoted anywhere.
10. Conventional commits, small and focused. Never bypass the Git hooks.
11. Never push without the owner's explicit go.
12. Say it before coding when an approach is not recommended (security, maintenance, scalability),
    and propose the alternative.
13. Never run destructive Git commands in the working repo: `reset --hard`, `clean -fd`,
    `checkout -- .`, `push --force`, `rebase`. A negative test that needs one runs in a throwaway
    clone in a temp directory.
14. Before any push, run `gh auth status` and `git config user.email`. Stop if the account is not
    `florent-griffon-qa` or the email is not `130713131+florent-griffon-qa@users.noreply.github.com`.
15. Before any irreversible action (delete, visibility change, secret removal), show exactly what
    will be affected (list, ids, names) and wait for the owner's explicit go. A plan approved
    earlier is not a go for the irreversible step itself.
