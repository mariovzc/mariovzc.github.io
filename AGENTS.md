# AGENTS.md

Personal portfolio of Mario Vizcaino. Astro 7 static site, bilingual (EN default at `/`, ES at `/es/`), deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to `master`.

## Hard rules

- **Never run `node`, `npm` or `npx` on the host.** Everything runs in Docker via `make`:
  `make install | dev | stop | build | preview | check | test | test-unit | test-e2e | lighthouse | og | add pkg="x" | add-dev pkg="x" | format | clean`.
- Never commit `resume2026.pdf` or any root `*.pdf` (personal data).
- Zod comes from `astro/zod`, not `astro:content`.
- Astro 7 uses a Rust compiler: close every non-void tag; no block elements inside `<p>`.
- Internal links always end with `/` (`trailingSlash: 'always'`). Build them with `localizePath()`.
- Keep logic in pure functions under `src/lib/` or `src/i18n/` with Vitest tests; `.astro` files only render.
- `astro.config.mjs` sets `image: { dangerouslyProcessSVG: true }` because the sample/placeholder project covers are SVG: sharp rasterizes them to WebP/PNG (covers use `format="webp"`), which requires the flag. Do not remove it until every project image is raster (PNG/JPG/WebP).
- Playwright (`playwright.config.ts`) and `scripts/lighthouse.mjs` run `astro preview --ignore-lock` because a stale preview lock can persist in the shared Docker node_modules volume. Keep the flag.

## Layout

- `src/content/projects/{en,es}/<slug>.mdx` — one file per project per language; same slug links translations. Schema in `src/content.config.ts`.
- `src/content/profile/{en,es}.yaml` — bio, services, experience, stack, contact. There is deliberately no CV download (visitors must contact first); do not add a `cv` field or public PDF.
- `src/i18n/{en,es}.json` — UI strings; keys must match in both files (unit test enforces it).
- `src/lib/` — `projects.ts` (localization/fallback), `sitemap.ts` (fallback-page sitemap exclusion), `seo.ts`, `llms.ts`, `robots.ts`, `theme.ts`, `webmcp-tools.ts`, `site-data.ts` (only file that reads collections).
- `src/views/` — page bodies shared by EN/ES routes in `src/pages/`.
- Design tokens in `src/styles/global.css` ("Bento verde": light gray canvas, white rounded tiles, green accent and gradient, Plus Jakarta Sans 800 headings). Shared component classes there: `.tile`, `.tile-hover`, `.pill*`, `.chip`, `.eyebrow`, `.hero-surface`, `heavy` utility.
- `src/lib/profile.ts` — `yearsOfExperience()` for the home bento tile.

## Common tasks

- **Add a project:** create `src/content/projects/en/<slug>.mdx` (and optionally `es/<slug>.mdx`), put images in `src/assets/projects/<slug>/`, run `make check && make test`. A missing ES file falls back to EN automatically.
- **File names:** project files must be lowercase kebab-case (`my-app.mdx`); a unit test enforces it because `astro.config.mjs` derives slugs from file names for the sitemap.
- **Hide a project:** `draft: true`. Drafts are still visible in the public GitHub repo.
- **Add a UI string:** add the key to both `en.json` and `es.json`.
- **Change domain:** update `SITE` in `astro.config.mjs` and the `SITE` constant in `tests/e2e/site.spec.ts`, add `public/CNAME`, configure DNS (see README), then regenerate the OG image with `make og` (it reads the domain from `astro.config.mjs` and name/role/headline from `src/content/profile/en.yaml`).

## AI surfaces

- `/llms.txt` — generated from content (`src/lib/llms.ts`).
- JSON-LD in `src/components/astro/SEO.astro`.
- WebMCP read-only tools (`src/lib/webmcp-tools.ts`, registered by `src/scripts/webmcp.ts`). The API is experimental; detection supports `document.modelContext` and `navigator.modelContext`.
