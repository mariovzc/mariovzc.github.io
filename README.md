# mariovzc.github.io

Personal portfolio — Astro 7, React islands, Tailwind 4. English at `/`, Spanish at `/es/`.

## Requirements

Only Docker (Desktop) and `make`. Nothing else is installed on the host.

## Getting started

```bash
make install   # build the dev image and install dependencies in a Docker volume
make dev       # http://localhost:4321 with hot reload
```

| Command                       | What it does                                          |
| ----------------------------- | ----------------------------------------------------- |
| `make dev` / `make stop`      | Start / stop the dev server                           |
| `make build` / `make preview` | Production build / serve it on :4321                  |
| `make check`                  | Types, content schemas, formatting                    |
| `make test`                   | Unit (Vitest) + browser (Playwright) tests            |
| `make lighthouse`             | Lighthouse audit (≥ 95 target), reports in `reports/` |
| `make og`                     | Regenerate `public/og-default.png`                    |
| `make favicons`               | Regenerate favicons/app icons from the avatar         |
| `make add pkg="name"`         | Add a dependency inside the container                 |
| `make clean`                  | Remove containers, volumes and build output           |

## Content

- Projects: `src/content/projects/{en,es}/<slug>.mdx`
- Profile: `src/content/profile/{en,es}.yaml` (no CV download by design: visitors contact first)
- UI strings: `src/i18n/{en,es}.json`

## Deploy

Push to `master` → GitHub Actions validates, tests, builds and publishes to GitHub Pages. If any step fails nothing is published.

Pull requests to `master` run validation and build only; nothing is published.

Requirement: _Settings → Pages → Source_ must be set to "GitHub Actions" (already set for this repo).

Optional: set repository variable `PUBLIC_WEBMCP_OT_TOKEN` (Chrome origin trial for WebMCP).

## Custom domain (later)

1. Change `SITE` in `astro.config.mjs`.
2. Add `public/CNAME` containing the domain.
3. Point DNS to GitHub Pages and set the domain in _Settings → Pages_.

## Previous version

The 2018 site is preserved at tag `v1-2018`.
