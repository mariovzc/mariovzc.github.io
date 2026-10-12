DC  := docker compose
RUN := $(DC) run --rm app
E2E := $(DC) run --rm e2e

.PHONY: install dev stop build preview build-soon preview-soon check test test-unit test-e2e lighthouse og favicons add add-dev format clean

install: ## Install dependencies inside the container
	$(DC) build app
	$(RUN) npm install

dev: ## Dev server on http://localhost:4321
	$(DC) up app

stop:
	$(DC) down

build:
	$(RUN) npm run build

preview: build ## Serve the production build on http://localhost:4321
	$(DC) run --rm --service-ports app npm run preview

build-soon: ## Production build in coming-soon mode (as deployed while PUBLIC_COMING_SOON='true')
	$(DC) run --rm -e PUBLIC_COMING_SOON=true app npm run build

preview-soon: build-soon ## Serve the coming-soon build on http://localhost:4321
	$(DC) run --rm --service-ports app npm run preview

check: ## Types, content schemas and formatting
	$(RUN) npm run check

test: test-unit test-e2e

test-unit:
	$(RUN) npm run test:unit

test-e2e: ## E2E against tests/fixtures/content (never the real content)
	$(DC) run --rm -e CONTENT_ROOT=tests/fixtures/content app npm run build
	$(DC) run --rm -e CONTENT_ROOT=tests/fixtures/content e2e npm run test:e2e

lighthouse: build ## Lighthouse audit, reports in reports/
	$(E2E) npm run lighthouse

og: ## Regenerate src/assets/brand/og-{en,es}.png
	$(E2E) npm run og

favicons: ## Regenerate favicons/app icons in public/ from src/assets/brand/avatar.png
	$(RUN) npm run favicons

add: ## make add pkg="name other"
	$(RUN) npm install $(pkg)

add-dev: ## make add-dev pkg="name"
	$(RUN) npm install -D $(pkg)

format:
	$(RUN) npm run format

clean:
	$(DC) down -v --remove-orphans
	rm -rf dist .astro reports test-results playwright-report
