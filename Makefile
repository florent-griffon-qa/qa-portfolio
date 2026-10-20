# Thin wrapper around the npm scripts (the npm scripts are the source of truth and
# also work on Windows without make).
COMPOSE := docker compose -f docker/docker-compose.yml

.PHONY: help install lint scan test-api test-api-public test-smoke docker-api docker-e2e down clean

help: ## List the targets
	@grep -E '^[a-z0-9-]+:.*## ' Makefile | awk -F ':.*## ' '{printf "%-16s %s\n", $$1, $$2}'

install: ## Install dependencies and Git hooks
	npm ci

lint: ## ESLint, Prettier and TypeScript checks
	npm run lint

scan: ## gitleaks on staged files, deny-list on the tree and on the history
	npm run scan:secrets
	npm run scan:denylist
	npm run scan:denylist:history

test-api: ## Newman against the local API (start it with docker-api or your own container)
	npm run test:api

test-api-public: ## Newman against the public API
	npm run test:api:public

test-smoke: ## Playwright smoke suite (needs browsers: npx playwright install)
	npm run test:smoke

docker-api: ## API tests in Docker, against a local Restful-Booker container
	$(COMPOSE) run --rm api-tests

docker-e2e: ## Playwright smoke suite in Docker
	$(COMPOSE) run --rm e2e-tests

down: ## Stop the Docker stack
	$(COMPOSE) down

clean: ## Remove generated reports
	rm -rf reports
