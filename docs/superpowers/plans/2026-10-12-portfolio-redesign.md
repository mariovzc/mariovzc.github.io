# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 2018 Materialize site with a bilingual (EN/ES) Astro 7 portfolio — "B1 Editorial light" design, content collections, SEO, `llms.txt`, WebMCP — developed entirely in Docker and deployed to GitHub Pages via GitHub Actions.

**Architecture:** Static Astro site. All content lives in content collections (`projects` MDX, `profile` YAML) validated by Zod. Every non-visual rule (i18n paths, project localization/fallback, SEO alternates, JSON-LD, `llms.txt`, robots, WebMCP tools) is a pure function in `src/i18n/` or `src/lib/`, unit-tested with Vitest; `.astro` files only render. React is used only for interactive islands (`ThemeToggle`, `ImageGallery`).

**Tech Stack:** Astro 7.3, @astrojs/react 7, @astrojs/mdx 8, @astrojs/sitemap 3.7, React 19.3, Tailwind CSS 4.3 (`@tailwindcss/vite`), TypeScript 6 (strict), Vitest 5, Playwright 1.64.0, Lighthouse 13, Node 22 (Docker `node:22-bookworm-slim`), GitHub Actions (`checkout@v7`, `setup-node@v7`, `upload-pages-artifact@v5`, `deploy-pages@v5`).

**Spec:** `docs/superpowers/specs/2026-10-12-portfolio-redesign-design.md`

## Global Constraints

- Never run `node`, `npm` or `npx` on the host. Every command goes through `make <target>` or `docker compose run --rm <service> …`.
- Node `>=22.12.0` (Astro 7 engine requirement); dev image `node:22-bookworm-slim`. **Not Alpine**: `node_modules` is shared with the glibc-based Playwright image, so musl binaries would break.
- Playwright npm package pinned to exactly `1.64.0` to match image `mcr.microsoft.com/playwright:v1.64.0-noble`.
- TypeScript `^6` (`@astrojs/check` peer range is `^5 || ^6`; TS 7 is unsupported).
- Zod is imported from `astro/zod` (never from `astro:content`). Zod 4 syntax: `z.email()`, `z.url()`.
- Astro 7 Rust compiler: every non-void tag must be closed; no block elements inside `<p>`. Default `compressHTML: 'jsx'` strips whitespace between inline elements — use `{" "}` where a space is needed.
- `site` = `https://mariovzc.github.io`, `trailingSlash: 'always'`. All internal links end with `/`.
- Locales: `en` (default, unprefixed, `/`) and `es` (`/es/`). No automatic language redirect.
- Design tokens (B1): light `--bg #f6f3ee`, `--fg #1b1a17`, `--muted #6b665d`, `--line #ddd6ca`, `--surface #ece6dc`, `--accent #c2410c`; dark `--bg #1a1816`, `--fg #ece6dc`, `--muted #a8a092`, `--line #3a3530`, `--surface #24211e`, `--accent #fb923c`. Serif headings: Fraunces Variable; body: Inter Variable (self-hosted via Fontsource).
- Every image has non-empty `alt`. WCAG AA contrast. `prefers-reduced-motion` disables animation.
- `resume2026.pdf` and any root `*.pdf` are never committed.
- Commit messages: Conventional Commits, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Work on branch `redesign`. Do not push or merge to `master` without the user's approval.

## Review Focus

1. **Spanish version missing for a project** — `/es/projects/<slug>/` must render the English content with a notice, canonical pointing to the EN URL, no `hreflang="es"`, and the page excluded from the sitemap (tests in Task 3, Task 4, Task 10).
2. **Project with only required fields** (no `links`, no `gallery`, no `tags`) — page renders without empty "Live site"/"Source"/"Gallery" sections (e2e in Task 10, sample `sample-en-only`).
3. **Profile without `cv`** — no "Download CV" link is rendered, never a broken `href` (e2e in Task 10).
4. **`localStorage` unavailable** (private mode / blocked) — page renders, theme follows system preference, toggle still switches the theme for the session (unit in Task 5, e2e in Task 10).
5. **Content containing `</script>` or `<`** in titles/summaries — inline JSON (JSON-LD and WebMCP data) must stay valid and not break out of its `<script>` (unit `safeJson` in Task 4).

---

## File Map

| File | Responsibility |
|---|---|
| `Dockerfile`, `docker-compose.yml`, `Makefile` | Dockerized dev/test toolchain |
| `astro.config.mjs` | Site URL, i18n, integrations, sitemap filter, Vite polling |
| `src/i18n/{en,es}.json`, `src/i18n/utils.ts` | UI strings, locale/path helpers |
| `src/content.config.ts` | Zod schemas for `projects` and `profile` |
| `src/content/projects/{en,es}/*.mdx`, `src/content/profile/{en,es}.yaml` | Content |
| `src/assets/projects/<slug>/*` | Project images |
| `src/lib/types.ts` | Shared plain types (`ProfileData`, `ProjectSummary`, `SiteData`) |
| `src/lib/projects.ts` | Pure: id parsing, localization + fallback, featured, prev/next |
| `src/lib/site-data.ts` | Astro-only: reads collections, builds `SiteData` |
| `src/lib/seo.ts` | Pure: URLs, alternates, canonical, JSON-LD, `safeJson` |
| `src/lib/robots.ts` | Pure: robots.txt text |
| `src/lib/llms.ts` | Pure: llms.txt text |
| `src/lib/theme.ts` | Pure: theme resolution |
| `src/lib/webmcp-tools.ts` | Pure: WebMCP tool definitions + model-context detection |
| `src/scripts/webmcp.ts` | Browser: registers tools |
| `src/styles/global.css` | Tailwind + tokens + fonts |
| `src/layouts/BaseLayout.astro` | `<html>`, SEO, theme script, nav/footer, WebMCP data |
| `src/components/astro/*.astro` | Static UI: SEO, Nav, Footer, Hero, ProjectCard, ProjectsSection, About, Services, Experience, Contact |
| `src/components/react/{ThemeToggle,ImageGallery}.tsx` | Islands |
| `src/views/{HomePage,ProjectPage}.astro` | Page bodies shared by EN/ES routes |
| `src/pages/**` | Thin routes + `llms.txt.ts`, `robots.txt.ts`, `404.astro` |
| `tests/unit/*.test.ts`, `tests/e2e/*.spec.ts` | Vitest / Playwright |
| `scripts/lighthouse.mjs`, `scripts/og-image.mjs` | Lighthouse audit, OG image generator |
| `.github/workflows/deploy.yml` | CI + Pages deploy |
| `AGENTS.md`, `CLAUDE.md`, `README.md` | Agent + human docs |

> Note vs spec: `LangSwitcher` is implemented as a plain Astro link inside `Nav.astro` (zero JS) instead of a React island — it only needs an `href`. `robots.txt` is generated by an endpoint (not a static file) so the domain lives in one place (`site`).

---

### Task 1: Docker toolchain, Astro scaffold, legacy removal

**Files:**
- Delete: `index.html`, `css/`, `js/`, `images/`, `bs4/`
- Create: `.gitignore`, `.dockerignore`, `Dockerfile`, `docker-compose.yml`, `Makefile`, `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.prettierrc.json`, `.prettierignore`, `src/pages/index.astro`, `tests/unit/smoke.test.ts`

**Interfaces:**
- Produces: make targets `install dev stop build preview check test test-unit test-e2e lighthouse og add add-dev format clean`; npm scripts `dev build preview check test:unit test:e2e lighthouse og format`; services `app` (dev, port 4321) and `e2e` (Playwright image).

- [ ] **Step 1: Remove legacy files**

```bash
git rm -r -q index.html css js images bs4
```

- [ ] **Step 2: Create `.gitignore`**

```gitignore
node_modules/
dist/
.astro/
reports/
test-results/
playwright-report/
.superpowers/
.DS_Store
.env
/*.pdf
```

- [ ] **Step 3: Create `.dockerignore`**

```
node_modules
dist
.astro
.git
reports
*.pdf
```

- [ ] **Step 4: Create `Dockerfile`**

```dockerfile
# Dev toolchain only. Source is bind-mounted; node_modules lives in a named volume.
FROM node:22-bookworm-slim
WORKDIR /app
ENV ASTRO_TELEMETRY_DISABLED=1 \
    DOCKER=1
EXPOSE 4321
CMD ["npm", "run", "dev"]
```

- [ ] **Step 5: Create `docker-compose.yml`**

```yaml
services:
  app:
    build: .
    working_dir: /app
    volumes:
      - .:/app
      - node_modules:/app/node_modules
    ports:
      - "4321:4321"
    environment:
      DOCKER: "1"
      ASTRO_TELEMETRY_DISABLED: "1"

  # Browser tooling (Playwright, Lighthouse, OG image). Same glibc family as `app`,
  # so the shared node_modules volume works in both.
  e2e:
    image: mcr.microsoft.com/playwright:v1.64.0-noble
    working_dir: /app
    ipc: host
    volumes:
      - .:/app
      - node_modules:/app/node_modules
    environment:
      DOCKER: "1"
      CI: "1"
      ASTRO_TELEMETRY_DISABLED: "1"

volumes:
  node_modules:
```

- [ ] **Step 6: Create `Makefile`** (recipes must be indented with a real TAB)

```makefile
DC  := docker compose
RUN := $(DC) run --rm app
E2E := $(DC) run --rm e2e

.PHONY: install dev stop build preview check test test-unit test-e2e lighthouse og add add-dev format clean

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

check: ## Types, content schemas and formatting
	$(RUN) npm run check

test: test-unit test-e2e

test-unit:
	$(RUN) npm run test:unit

test-e2e: build
	$(E2E) npm run test:e2e

lighthouse: build ## Lighthouse audit, reports in reports/
	$(E2E) npm run lighthouse

og: ## Regenerate public/og-default.png
	$(E2E) npm run og

add: ## make add pkg="name other"
	$(RUN) npm install $(pkg)

add-dev: ## make add-dev pkg="name"
	$(RUN) npm install -D $(pkg)

format:
	$(RUN) npm run format

clean:
	$(DC) down -v --remove-orphans
	rm -rf dist .astro reports test-results playwright-report
```

- [ ] **Step 7: Create `package.json`**

```json
{
  "name": "mariovzc-portfolio",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev --host 0.0.0.0",
    "build": "astro build",
    "preview": "astro preview --host 0.0.0.0",
    "check": "astro check && prettier --check .",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "lighthouse": "node scripts/lighthouse.mjs",
    "og": "node scripts/og-image.mjs",
    "format": "prettier --write ."
  }
}
```

- [ ] **Step 8: Build the image and install dependencies (inside Docker)**

```bash
docker compose build app
make add pkg="astro@^7.3 @astrojs/react@^7 @astrojs/mdx@^8 @astrojs/sitemap@^3.7 react@^19.3 react-dom@^19.3 sharp tailwindcss@^4.3 @tailwindcss/vite@^4.3 @fontsource-variable/fraunces @fontsource-variable/inter"
make add-dev pkg="typescript@^6 @astrojs/check @types/react@^19.3 @types/react-dom@^19.3 vitest@^5 @playwright/test@1.64.0 lighthouse@^13 chrome-launcher prettier prettier-plugin-astro"
```

Expected: `package-lock.json` created; no errors. If npm reports a peer conflict for `typescript`, install the highest `6.x`.

- [ ] **Step 9: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { existsSync, readdirSync } from 'node:fs';

const SITE = 'https://mariovzc.github.io';

// Pages that only exist as a fallback (other locale's content) are canonicalized
// to the original and must not appear in the sitemap.
function fallbackUrls() {
  const slugs = (lang) => {
    const dir = `./src/content/projects/${lang}`;
    if (!existsSync(dir)) return new Set();
    return new Set(
      readdirSync(dir)
        .filter((f) => f.endsWith('.mdx'))
        .map((f) => f.replace(/\.mdx$/, '')),
    );
  };
  const en = slugs('en');
  const es = slugs('es');
  return new Set([
    ...[...en].filter((s) => !es.has(s)).map((s) => `${SITE}/es/projects/${s}/`),
    ...[...es].filter((s) => !en.has(s)).map((s) => `${SITE}/projects/${s}/`),
  ]);
}

const excluded = fallbackUrls();

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !excluded.has(page) && !page.includes('/404'),
      i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es' } },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    // File events from macOS bind mounts are unreliable inside Docker.
    server: { watch: { usePolling: process.env.DOCKER === '1' } },
  },
});
```

- [ ] **Step 10: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 11: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 12: Create `.prettierrc.json` and `.prettierignore`**

```json
{
  "singleQuote": true,
  "printWidth": 100,
  "plugins": ["prettier-plugin-astro"],
  "overrides": [{ "files": "*.astro", "options": { "parser": "astro" } }]
}
```

```
dist
.astro
node_modules
package-lock.json
reports
docs
.superpowers
public
```

- [ ] **Step 13: Create placeholder `src/pages/index.astro`**

```astro
---
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Mario Vizcaino</title>
  </head>
  <body>
    <h1>Mario Vizcaino</h1>
  </body>
</html>
```

- [ ] **Step 14: Create `tests/unit/smoke.test.ts`**

```ts
import { describe, expect, it } from 'vitest';

describe('toolchain', () => {
  it('runs vitest inside docker', () => {
    expect(process.env.DOCKER).toBe('1');
  });
});
```

- [ ] **Step 15: Verify the toolchain**

Run: `make test-unit`
Expected: `1 passed`.

Run: `make build`
Expected: `dist/index.html` exists and the build output ends with `Complete!`.

Run: `make format && make check`
Expected: `0 errors` from `astro check`, prettier reports all files formatted.

Run: `make dev`, open `http://localhost:4321`, see "Mario Vizcaino"; edit the `<h1>` text, confirm the browser reloads; revert; `make stop`.

- [ ] **Step 16: Commit**

```bash
git add -A
git commit -m "chore: replace legacy site with dockerized Astro scaffold

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: i18n strings and locale/path helpers

**Files:**
- Create: `src/i18n/en.json`, `src/i18n/es.json`, `src/i18n/utils.ts`
- Test: `tests/unit/i18n.test.ts`
- Delete: `tests/unit/smoke.test.ts`

**Interfaces:**
- Produces (`src/i18n/utils.ts`):
  - `LOCALES: readonly ['en', 'es']`, `type Locale = 'en' | 'es'`, `DEFAULT_LOCALE: Locale = 'en'`
  - `type UiKey = keyof typeof en`
  - `t(lang: Locale, key: UiKey): string`
  - `isLocale(value: string): value is Locale`
  - `otherLocale(lang: Locale): Locale`
  - `localizePath(path: string, lang: Locale): string` — `path` is the unlocalized route (`/`, `/projects/x/`); always returns leading and trailing slash.
  - `splitLocalePath(pathname: string): { lang: Locale; path: string }`
  - `switchLocalePath(pathname: string, target: Locale): string`

- [ ] **Step 1: Write the failing test `tests/unit/i18n.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import en from '../../src/i18n/en.json';
import es from '../../src/i18n/es.json';
import {
  isLocale,
  localizePath,
  otherLocale,
  splitLocalePath,
  switchLocalePath,
  t,
} from '../../src/i18n/utils';

describe('ui strings', () => {
  it('en and es define exactly the same keys', () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
  });

  it('no string is empty', () => {
    for (const dict of [en, es]) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value, key).not.toBe('');
      }
    }
  });

  it('t returns the localized string', () => {
    expect(t('en', 'nav.contact')).toBe('Contact');
    expect(t('es', 'nav.contact')).toBe('Contacto');
  });
});

describe('locale helpers', () => {
  it('isLocale', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('es')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });

  it('otherLocale', () => {
    expect(otherLocale('en')).toBe('es');
    expect(otherLocale('es')).toBe('en');
  });
});

describe('localizePath', () => {
  it.each([
    ['/', 'en', '/'],
    ['/', 'es', '/es/'],
    ['/projects/foo/', 'en', '/projects/foo/'],
    ['/projects/foo/', 'es', '/es/projects/foo/'],
    ['projects/foo', 'es', '/es/projects/foo/'],
  ] as const)('%s in %s -> %s', (path, lang, expected) => {
    expect(localizePath(path, lang)).toBe(expected);
  });
});

describe('splitLocalePath', () => {
  it.each([
    ['/', { lang: 'en', path: '/' }],
    ['/projects/foo/', { lang: 'en', path: '/projects/foo/' }],
    ['/es/', { lang: 'es', path: '/' }],
    ['/es', { lang: 'es', path: '/' }],
    ['/es/projects/foo/', { lang: 'es', path: '/projects/foo/' }],
    ['/espresso/', { lang: 'en', path: '/espresso/' }],
  ] as const)('%s', (pathname, expected) => {
    expect(splitLocalePath(pathname)).toEqual(expected);
  });
});

describe('switchLocalePath', () => {
  it('keeps the same page in the other language', () => {
    expect(switchLocalePath('/projects/foo/', 'es')).toBe('/es/projects/foo/');
    expect(switchLocalePath('/es/projects/foo/', 'en')).toBe('/projects/foo/');
    expect(switchLocalePath('/es/', 'en')).toBe('/');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `make test-unit`
Expected: FAIL — `Failed to resolve import "../../src/i18n/en.json"`.

- [ ] **Step 3: Create `src/i18n/en.json`**

```json
{
  "nav.work": "Work",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.home": "Home",
  "nav.skip": "Skip to content",
  "hero.viewWork": "View work",
  "hero.contact": "Get in touch",
  "projects.title": "Selected work",
  "projects.view": "View project",
  "about.title": "About",
  "about.stack": "Stack",
  "stack.frontend": "Frontend",
  "stack.backend": "Backend",
  "stack.tools": "Tools",
  "services.title": "What I do",
  "experience.title": "Experience",
  "experience.present": "Present",
  "experience.downloadCv": "Download CV",
  "contact.title": "Let's work together",
  "contact.text": "Have a project in mind or just want to say hi? My inbox is open.",
  "project.year": "Year",
  "project.role": "Role",
  "project.stack": "Stack",
  "project.live": "Live site",
  "project.repo": "Source code",
  "project.prev": "Previous project",
  "project.next": "Next project",
  "project.back": "All projects",
  "project.gallery": "Gallery",
  "project.fallbackNotice": "This project is only available in Spanish.",
  "gallery.open": "Open image",
  "gallery.close": "Close",
  "theme.toLight": "Switch to light mode",
  "theme.toDark": "Switch to dark mode",
  "lang.switchLabel": "Leer en español",
  "lang.short": "ES",
  "notFound.title": "Page not found",
  "notFound.text": "The page you are looking for does not exist or was moved.",
  "notFound.home": "Back to home",
  "footer.built": "Built with Astro."
}
```

- [ ] **Step 4: Create `src/i18n/es.json`**

```json
{
  "nav.work": "Proyectos",
  "nav.about": "Sobre mí",
  "nav.contact": "Contacto",
  "nav.home": "Inicio",
  "nav.skip": "Saltar al contenido",
  "hero.viewWork": "Ver proyectos",
  "hero.contact": "Hablemos",
  "projects.title": "Proyectos destacados",
  "projects.view": "Ver proyecto",
  "about.title": "Sobre mí",
  "about.stack": "Stack",
  "stack.frontend": "Frontend",
  "stack.backend": "Backend",
  "stack.tools": "Herramientas",
  "services.title": "Qué hago",
  "experience.title": "Experiencia",
  "experience.present": "Actualidad",
  "experience.downloadCv": "Descargar CV",
  "contact.title": "Trabajemos juntos",
  "contact.text": "¿Tienes un proyecto en mente o solo quieres saludar? Escríbeme.",
  "project.year": "Año",
  "project.role": "Rol",
  "project.stack": "Stack",
  "project.live": "Sitio en vivo",
  "project.repo": "Código fuente",
  "project.prev": "Proyecto anterior",
  "project.next": "Proyecto siguiente",
  "project.back": "Todos los proyectos",
  "project.gallery": "Galería",
  "project.fallbackNotice": "Este proyecto solo está disponible en inglés.",
  "gallery.open": "Abrir imagen",
  "gallery.close": "Cerrar",
  "theme.toLight": "Cambiar a modo claro",
  "theme.toDark": "Cambiar a modo oscuro",
  "lang.switchLabel": "Read in English",
  "lang.short": "EN",
  "notFound.title": "Página no encontrada",
  "notFound.text": "La página que buscas no existe o fue movida.",
  "notFound.home": "Volver al inicio",
  "footer.built": "Hecho con Astro."
}
```

- [ ] **Step 5: Create `src/i18n/utils.ts`**

```ts
import en from './en.json';
import es from './es.json';

export const LOCALES = ['en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export type UiKey = keyof typeof en;

const dictionaries: Record<Locale, Record<UiKey, string>> = { en, es };

export function t(lang: Locale, key: UiKey): string {
  return dictionaries[lang][key] ?? dictionaries[DEFAULT_LOCALE][key];
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function otherLocale(lang: Locale): Locale {
  return lang === 'en' ? 'es' : 'en';
}

function normalize(path: string): string {
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  return trimmed === '' ? '/' : `/${trimmed}/`;
}

/** `path` is the unlocalized route, e.g. `/` or `/projects/foo/`. */
export function localizePath(path: string, lang: Locale): string {
  const clean = normalize(path);
  if (lang === DEFAULT_LOCALE) return clean;
  return clean === '/' ? `/${lang}/` : `/${lang}${clean}`;
}

export function splitLocalePath(pathname: string): { lang: Locale; path: string } {
  const clean = normalize(pathname);
  const [first] = clean.split('/').filter(Boolean);
  if (first && first !== DEFAULT_LOCALE && isLocale(first)) {
    return { lang: first, path: normalize(clean.slice(first.length + 1)) };
  }
  return { lang: DEFAULT_LOCALE, path: clean };
}

export function switchLocalePath(pathname: string, target: Locale): string {
  return localizePath(splitLocalePath(pathname).path, target);
}
```

- [ ] **Step 6: Delete the smoke test and run tests**

```bash
git rm -q tests/unit/smoke.test.ts
```

Run: `make test-unit`
Expected: all `i18n.test.ts` tests PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(i18n): add EN/ES UI strings and locale path helpers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Content model, sample content, project localization

**Files:**
- Create: `src/content.config.ts`, `src/lib/types.ts`, `src/lib/projects.ts`, `src/lib/site-data.ts`
- Create: `src/content/profile/en.yaml`, `src/content/profile/es.yaml`
- Create: `src/content/projects/en/sample-full.mdx`, `src/content/projects/es/sample-full.mdx`, `src/content/projects/en/sample-en-only.mdx`
- Create: `src/assets/projects/sample/cover.svg`, `src/assets/projects/sample/shot-1.svg`
- Test: `tests/unit/projects.test.ts`

**Interfaces:**
- Consumes: `Locale`, `LOCALES`, `isLocale`, `localizePath` from `src/i18n/utils.ts`.
- Produces:
  - `src/lib/types.ts`:
    ```ts
    interface ProfileData { name: string; headline: string; role: string; location?: string; bio: string; availability?: string;
      services: { title: string; description: string }[];
      experience: { company: string; role: string; start: string; end?: string; summary: string }[];
      stack: { frontend: string[]; backend: string[]; tools: string[] };
      contact: { email: string; github?: string; linkedin?: string; x?: string };
      cv?: string }
    interface ProjectSummary { slug: string; title: string; summary: string; year: number; role: string; stack: string[];
      tags: string[]; url: string; links: { live?: string; repo?: string }; contentLang: Locale }
    interface SiteData { site: string; profiles: Record<Locale, ProfileData>; projects: Record<Locale, ProjectSummary[]> }
    ```
  - `src/lib/projects.ts`:
    - `interface ProjectCore { year: number; featured: boolean; order: number; draft: boolean }`
    - `interface LocalizedProject<E> { slug: string; lang: Locale; contentLang: Locale; isFallback: boolean; translations: Locale[]; entry: E }`
    - `parseProjectId(id: string): { lang: Locale; slug: string }` (throws on bad id)
    - `localizeProjects<E extends { id: string; data: ProjectCore }>(entries: E[], lang: Locale): LocalizedProject<E>[]` — drafts excluded, fallback to other locale, sorted by `order` asc, then `year` desc, then `slug`.
    - `featuredProjects<E>(list: LocalizedProject<E>[]): LocalizedProject<E>[]`
    - `adjacentProjects<E>(list, slug): { prev?: LocalizedProject<E>; next?: LocalizedProject<E> }`
  - `src/lib/site-data.ts` (Astro-only, not unit tested):
    - `type ProjectEntry = CollectionEntry<'projects'>`
    - `getProjects(lang: Locale): Promise<LocalizedProject<ProjectEntry>[]>`
    - `getProfile(lang: Locale): Promise<ProfileData>`
    - `toSummary(p: LocalizedProject<ProjectEntry>, site: URL | string): ProjectSummary`
    - `getSiteData(site: URL | string): Promise<SiteData>`

- [ ] **Step 1: Write the failing test `tests/unit/projects.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import {
  adjacentProjects,
  featuredProjects,
  localizeProjects,
  parseProjectId,
} from '../../src/lib/projects';

type Fake = {
  id: string;
  data: { year: number; featured: boolean; order: number; draft: boolean; title: string };
};

const entry = (id: string, over: Partial<Fake['data']> = {}): Fake => ({
  id,
  data: { year: 2024, featured: false, order: 100, draft: false, title: id, ...over },
});

describe('parseProjectId', () => {
  it('splits locale folder and slug', () => {
    expect(parseProjectId('en/my-app')).toEqual({ lang: 'en', slug: 'my-app' });
    expect(parseProjectId('es/my-app')).toEqual({ lang: 'es', slug: 'my-app' });
  });

  it('throws on ids outside a locale folder', () => {
    expect(() => parseProjectId('my-app')).toThrow(/en\/ or es\//);
    expect(() => parseProjectId('fr/my-app')).toThrow(/en\/ or es\//);
  });
});

describe('localizeProjects', () => {
  const entries = [
    entry('en/both', { order: 2 }),
    entry('es/both', { order: 2, title: 'ambos' }),
    entry('en/en-only', { order: 1 }),
    entry('es/es-only', { order: 3 }),
    entry('en/hidden', { draft: true }),
  ];

  it('uses the requested locale when it exists', () => {
    const es = localizeProjects(entries, 'es');
    const both = es.find((p) => p.slug === 'both')!;
    expect(both.contentLang).toBe('es');
    expect(both.isFallback).toBe(false);
    expect(both.entry.data.title).toBe('ambos');
    expect(both.translations).toEqual(['en', 'es']);
  });

  it('falls back to the other locale when missing', () => {
    const es = localizeProjects(entries, 'es');
    const enOnly = es.find((p) => p.slug === 'en-only')!;
    expect(enOnly.lang).toBe('es');
    expect(enOnly.contentLang).toBe('en');
    expect(enOnly.isFallback).toBe(true);
    expect(enOnly.translations).toEqual(['en']);

    const en = localizeProjects(entries, 'en');
    expect(en.find((p) => p.slug === 'es-only')!.isFallback).toBe(true);
  });

  it('excludes drafts', () => {
    expect(localizeProjects(entries, 'en').map((p) => p.slug)).not.toContain('hidden');
  });

  it('a draft translation falls back to the published one', () => {
    const list = localizeProjects([entry('en/x'), entry('es/x', { draft: true })], 'es');
    expect(list[0]!.isFallback).toBe(true);
    expect(list[0]!.translations).toEqual(['en']);
  });

  it('sorts by order, then newest year, then slug', () => {
    const list = localizeProjects(
      [
        entry('en/b', { order: 1, year: 2020 }),
        entry('en/a', { order: 1, year: 2020 }),
        entry('en/new', { order: 1, year: 2025 }),
        entry('en/first', { order: 0 }),
      ],
      'en',
    );
    expect(list.map((p) => p.slug)).toEqual(['first', 'new', 'a', 'b']);
  });
});

describe('featuredProjects / adjacentProjects', () => {
  const list = localizeProjects(
    [
      entry('en/a', { order: 1, featured: true }),
      entry('en/b', { order: 2 }),
      entry('en/c', { order: 3, featured: true }),
    ],
    'en',
  );

  it('featured keeps order', () => {
    expect(featuredProjects(list).map((p) => p.slug)).toEqual(['a', 'c']);
  });

  it('adjacent returns neighbours, none at the edges', () => {
    expect(adjacentProjects(list, 'b').prev?.slug).toBe('a');
    expect(adjacentProjects(list, 'b').next?.slug).toBe('c');
    expect(adjacentProjects(list, 'a').prev).toBeUndefined();
    expect(adjacentProjects(list, 'c').next).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `make test-unit`
Expected: FAIL — `Failed to resolve import "../../src/lib/projects"`.

- [ ] **Step 3: Create `src/lib/projects.ts`**

```ts
import { isLocale, LOCALES, type Locale } from '../i18n/utils';

export interface ProjectCore {
  year: number;
  featured: boolean;
  order: number;
  draft: boolean;
}

export interface LocalizedProject<E> {
  slug: string;
  /** Locale of the page being rendered. */
  lang: Locale;
  /** Locale the content is actually written in. */
  contentLang: Locale;
  isFallback: boolean;
  /** Locales with a published (non-draft) file for this slug. */
  translations: Locale[];
  entry: E;
}

export function parseProjectId(id: string): { lang: Locale; slug: string } {
  const [lang, ...rest] = id.split('/');
  const slug = rest.join('/');
  if (!lang || !isLocale(lang) || !slug) {
    throw new Error(`Project "${id}" must live in src/content/projects/en/ or es/`);
  }
  return { lang, slug };
}

export function localizeProjects<E extends { id: string; data: ProjectCore }>(
  entries: E[],
  lang: Locale,
): LocalizedProject<E>[] {
  const bySlug = new Map<string, Partial<Record<Locale, E>>>();
  for (const e of entries) {
    if (e.data.draft) continue;
    const { lang: l, slug } = parseProjectId(e.id);
    bySlug.set(slug, { ...bySlug.get(slug), [l]: e });
  }

  const list: LocalizedProject<E>[] = [];
  for (const [slug, versions] of bySlug) {
    const translations = LOCALES.filter((l) => versions[l]);
    const contentLang = versions[lang] ? lang : translations[0]!;
    list.push({
      slug,
      lang,
      contentLang,
      isFallback: contentLang !== lang,
      translations,
      entry: versions[contentLang]!,
    });
  }

  return list.sort(
    (a, b) =>
      a.entry.data.order - b.entry.data.order ||
      b.entry.data.year - a.entry.data.year ||
      a.slug.localeCompare(b.slug),
  );
}

export function featuredProjects<E extends { data: ProjectCore }>(
  list: LocalizedProject<E>[],
): LocalizedProject<E>[] {
  return list.filter((p) => p.entry.data.featured);
}

export function adjacentProjects<E>(
  list: LocalizedProject<E>[],
  slug: string,
): { prev?: LocalizedProject<E>; next?: LocalizedProject<E> } {
  const i = list.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  return { prev: list[i - 1], next: list[i + 1] };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `make test-unit`
Expected: all `projects.test.ts` tests PASS.

- [ ] **Step 5: Create `src/lib/types.ts`**

```ts
import type { Locale } from '../i18n/utils';

export interface ProfileData {
  name: string;
  headline: string;
  role: string;
  location?: string;
  bio: string;
  availability?: string;
  services: { title: string; description: string }[];
  experience: { company: string; role: string; start: string; end?: string; summary: string }[];
  stack: { frontend: string[]; backend: string[]; tools: string[] };
  contact: { email: string; github?: string; linkedin?: string; x?: string };
  /** Site-relative path to a PDF in public/, e.g. /cv/mario-vizcaino-en.pdf */
  cv?: string;
}

export interface ProjectSummary {
  slug: string;
  title: string;
  summary: string;
  year: number;
  role: string;
  stack: string[];
  tags: string[];
  /** Absolute URL of the project page in the requested locale. */
  url: string;
  links: { live?: string; repo?: string };
  contentLang: Locale;
}

export interface SiteData {
  site: string;
  profiles: Record<Locale, ProfileData>;
  projects: Record<Locale, ProjectSummary[]>;
}
```

- [ ] **Step 6: Create `src/content.config.ts`**

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      summary: z.string().min(1).max(160),
      year: z.number().int().min(2000).max(2100),
      role: z.string().min(1),
      stack: z.array(z.string().min(1)).min(1),
      tags: z.array(z.string().min(1)).default([]),
      cover: image(),
      coverAlt: z.string().min(1),
      gallery: z.array(z.object({ src: image(), alt: z.string().min(1) })).default([]),
      links: z.object({ live: z.url().optional(), repo: z.url().optional() }).default({}),
      featured: z.boolean().default(false),
      order: z.number().default(100),
      draft: z.boolean().default(false),
    }),
});

const profile = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/profile' }),
  schema: z.object({
    name: z.string().min(1),
    headline: z.string().min(1),
    role: z.string().min(1),
    location: z.string().optional(),
    bio: z.string().min(1),
    availability: z.string().optional(),
    services: z.array(z.object({ title: z.string().min(1), description: z.string().min(1) })).min(1),
    experience: z
      .array(
        z.object({
          company: z.string().min(1),
          role: z.string().min(1),
          start: z.string().min(4),
          end: z.string().optional(),
          summary: z.string().min(1),
        }),
      )
      .default([]),
    stack: z.object({
      frontend: z.array(z.string()).default([]),
      backend: z.array(z.string()).default([]),
      tools: z.array(z.string()).default([]),
    }),
    contact: z.object({
      email: z.email(),
      github: z.url().optional(),
      linkedin: z.url().optional(),
      x: z.url().optional(),
    }),
    cv: z
      .string()
      .regex(/^\/.*\.pdf$/, 'cv must be a site-relative path to a PDF, e.g. /cv/file.pdf')
      .optional(),
  }),
});

export const collections = { projects, profile };
```

- [ ] **Step 7: Create `src/lib/site-data.ts`**

```ts
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { LOCALES, localizePath, type Locale } from '../i18n/utils';
import { localizeProjects, type LocalizedProject } from './projects';
import type { ProfileData, ProjectSummary, SiteData } from './types';

export type ProjectEntry = CollectionEntry<'projects'>;

export async function getProjects(lang: Locale): Promise<LocalizedProject<ProjectEntry>[]> {
  return localizeProjects(await getCollection('projects'), lang);
}

export async function getProfile(lang: Locale): Promise<ProfileData> {
  const entry = await getEntry('profile', lang);
  if (!entry) throw new Error(`Missing src/content/profile/${lang}.yaml`);
  return entry.data;
}

export function toSummary(p: LocalizedProject<ProjectEntry>, site: URL | string): ProjectSummary {
  const d = p.entry.data;
  return {
    slug: p.slug,
    title: d.title,
    summary: d.summary,
    year: d.year,
    role: d.role,
    stack: d.stack,
    tags: d.tags,
    url: new URL(localizePath(`/projects/${p.slug}/`, p.lang), site).href,
    links: d.links,
    contentLang: p.contentLang,
  };
}

export async function getSiteData(site: URL | string): Promise<SiteData> {
  const [profiles, projects] = await Promise.all([
    Promise.all(LOCALES.map(async (l) => [l, await getProfile(l)] as const)),
    Promise.all(
      LOCALES.map(async (l) => [l, (await getProjects(l)).map((p) => toSummary(p, site))] as const),
    ),
  ]);
  return {
    site: new URL('/', site).href,
    profiles: Object.fromEntries(profiles) as SiteData['profiles'],
    projects: Object.fromEntries(projects) as SiteData['projects'],
  };
}
```

- [ ] **Step 8: Create sample images**

`src/assets/projects/sample/cover.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <rect width="1600" height="1000" fill="#e7e0d4"/>
  <rect x="120" y="120" width="1360" height="760" rx="24" fill="#f6f3ee" stroke="#ddd6ca" stroke-width="4"/>
  <text x="800" y="530" font-family="Georgia, serif" font-size="96" text-anchor="middle" fill="#c2410c">Sample project</text>
</svg>
```

`src/assets/projects/sample/shot-1.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <rect width="1600" height="1000" fill="#24211e"/>
  <text x="800" y="530" font-family="Georgia, serif" font-size="96" text-anchor="middle" fill="#fb923c">Screenshot</text>
</svg>
```

- [ ] **Step 9: Create sample profiles**

`src/content/profile/en.yaml`:

```yaml
# SAMPLE CONTENT — replaced in the content phase (see spec §16).
name: Mario Vizcaino
headline: Software that feels simple.
role: Full-stack developer
location: Colombia
bio: >-
  I design and build web products end to end, from the interface people touch to the
  services behind it. Sample bio — to be replaced.
availability: Open for freelance projects
services:
  - title: Web applications
    description: Product-grade web apps with React and a solid backend.
  - title: Technical consulting
    description: Architecture reviews, performance and code quality.
experience:
  - company: Sample Company
    role: Senior developer
    start: '2022'
    summary: Sample entry — to be replaced.
stack:
  frontend: [React, TypeScript, Astro]
  backend: [Node.js, Ruby on Rails, PostgreSQL]
  tools: [Docker, Git, GitHub Actions]
contact:
  email: hello@example.com
  github: https://github.com/mariovzc
```

`src/content/profile/es.yaml`:

```yaml
# CONTENIDO DE EJEMPLO — se reemplaza en la fase de contenido (spec §16).
name: Mario Vizcaino
headline: Software que se siente simple.
role: Desarrollador full-stack
location: Colombia
bio: >-
  Diseño y construyo productos web de punta a punta, desde la interfaz hasta los
  servicios que la sostienen. Bio de ejemplo — se reemplaza.
availability: Disponible para proyectos freelance
services:
  - title: Aplicaciones web
    description: Apps web de nivel producto con React y un backend sólido.
  - title: Consultoría técnica
    description: Revisión de arquitectura, rendimiento y calidad de código.
experience:
  - company: Empresa de ejemplo
    role: Desarrollador senior
    start: '2022'
    summary: Entrada de ejemplo — se reemplaza.
stack:
  frontend: [React, TypeScript, Astro]
  backend: [Node.js, Ruby on Rails, PostgreSQL]
  tools: [Docker, Git, GitHub Actions]
contact:
  email: hello@example.com
  github: https://github.com/mariovzc
```

- [ ] **Step 10: Create sample projects**

`src/content/projects/en/sample-full.mdx`:

```mdx
---
title: Sample Full Project
summary: Sample project using every optional field — replaced in the content phase.
year: 2025
role: Full-stack developer
stack: [React, Node.js, PostgreSQL]
tags: [web, freelance]
cover: ../../../assets/projects/sample/cover.svg
coverAlt: Placeholder cover for the sample project
gallery:
  - src: ../../../assets/projects/sample/shot-1.svg
    alt: Placeholder screenshot
links:
  live: https://example.com
  repo: https://github.com/mariovzc
featured: true
order: 1
---

## The problem

Sample text describing the problem.

## The solution

Sample text describing the solution and my role.
```

`src/content/projects/es/sample-full.mdx`:

```mdx
---
title: Proyecto completo de ejemplo
summary: Proyecto de ejemplo con todos los campos opcionales — se reemplaza en la fase de contenido.
year: 2025
role: Desarrollador full-stack
stack: [React, Node.js, PostgreSQL]
tags: [web, freelance]
cover: ../../../assets/projects/sample/cover.svg
coverAlt: Portada de ejemplo del proyecto
gallery:
  - src: ../../../assets/projects/sample/shot-1.svg
    alt: Captura de ejemplo
links:
  live: https://example.com
  repo: https://github.com/mariovzc
featured: true
order: 1
---

## El problema

Texto de ejemplo describiendo el problema.

## La solución

Texto de ejemplo describiendo la solución y mi rol.
```

`src/content/projects/en/sample-en-only.mdx` (required fields only — no ES version on purpose):

```mdx
---
title: Sample English-only Project
summary: Minimal sample with only required fields and no Spanish version.
year: 2023
role: Frontend developer
stack: [Astro]
cover: ../../../assets/projects/sample/cover.svg
coverAlt: Placeholder cover for the minimal sample
featured: true
order: 2
---

Minimal sample body.
```

- [ ] **Step 11: Verify schemas**

Run: `make check`
Expected: `0 errors`. Then temporarily delete the `year:` line from `sample-en-only.mdx`, run `make build`, and confirm the error names `sample-en-only` and `year`; restore the line.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat(content): add project/profile schemas, sample content and localization

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: SEO helpers and robots.txt

**Files:**
- Create: `src/lib/seo.ts`, `src/lib/robots.ts`, `src/pages/robots.txt.ts`
- Test: `tests/unit/seo.test.ts`, `tests/unit/robots.test.ts`

**Interfaces:**
- Consumes: `Locale`, `localizePath`, `DEFAULT_LOCALE` (Task 2); `ProfileData`, `ProjectSummary` (Task 3).
- Produces (`src/lib/seo.ts`):
  - `absoluteUrl(site: string, path: string): string`
  - `canonicalFor(o: { site: string; path: string; lang: Locale; translations: Locale[] }): string`
  - `buildAlternates(o: { site: string; path: string; translations: Locale[] }): { hreflang: string; href: string }[]`
  - `personJsonLd(profile: ProfileData, site: string): Record<string, unknown>`
  - `websiteJsonLd(profile: ProfileData, site: string): Record<string, unknown>`
  - `projectJsonLd(p: ProjectSummary, profile: ProfileData): Record<string, unknown>`
  - `safeJson(value: unknown): string` — JSON safe to embed in `<script>`.
- Produces (`src/lib/robots.ts`): `AI_CRAWLERS: string[]`, `buildRobotsTxt(site: string): string`

- [ ] **Step 1: Write failing tests**

`tests/unit/seo.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  absoluteUrl,
  buildAlternates,
  canonicalFor,
  personJsonLd,
  projectJsonLd,
  safeJson,
  websiteJsonLd,
} from '../../src/lib/seo';
import type { ProfileData, ProjectSummary } from '../../src/lib/types';

const SITE = 'https://mariovzc.github.io/';

const profile: ProfileData = {
  name: 'Mario Vizcaino',
  headline: 'h',
  role: 'Full-stack developer',
  bio: 'bio',
  services: [{ title: 's', description: 'd' }],
  experience: [],
  stack: { frontend: [], backend: [], tools: [] },
  contact: { email: 'a@b.co', github: 'https://github.com/mariovzc' },
};

describe('urls', () => {
  it('absoluteUrl', () => {
    expect(absoluteUrl(SITE, '/es/projects/x/')).toBe('https://mariovzc.github.io/es/projects/x/');
  });

  it('canonical is the page itself when content exists in that locale', () => {
    expect(canonicalFor({ site: SITE, path: '/projects/x/', lang: 'es', translations: ['en', 'es'] })).toBe(
      'https://mariovzc.github.io/es/projects/x/',
    );
  });

  it('canonical of a fallback page points to the original locale', () => {
    expect(canonicalFor({ site: SITE, path: '/projects/x/', lang: 'es', translations: ['en'] })).toBe(
      'https://mariovzc.github.io/projects/x/',
    );
  });

  it('alternates list only real translations plus x-default', () => {
    expect(buildAlternates({ site: SITE, path: '/', translations: ['en', 'es'] })).toEqual([
      { hreflang: 'en', href: 'https://mariovzc.github.io/' },
      { hreflang: 'es', href: 'https://mariovzc.github.io/es/' },
      { hreflang: 'x-default', href: 'https://mariovzc.github.io/' },
    ]);
    expect(buildAlternates({ site: SITE, path: '/projects/x/', translations: ['en'] })).toEqual([
      { hreflang: 'en', href: 'https://mariovzc.github.io/projects/x/' },
      { hreflang: 'x-default', href: 'https://mariovzc.github.io/projects/x/' },
    ]);
  });
});

describe('json-ld', () => {
  it('person includes sameAs only for defined profiles', () => {
    const p = personJsonLd(profile, SITE);
    expect(p['@type']).toBe('Person');
    expect(p.name).toBe('Mario Vizcaino');
    expect(p.jobTitle).toBe('Full-stack developer');
    expect(p.sameAs).toEqual(['https://github.com/mariovzc']);
  });

  it('website', () => {
    const w = websiteJsonLd(profile, SITE);
    expect(w['@type']).toBe('WebSite');
    expect(w.url).toBe(SITE);
    expect(w.inLanguage).toEqual(['en', 'es']);
  });

  it('project', () => {
    const summary: ProjectSummary = {
      slug: 'x',
      title: 'X',
      summary: 'sum',
      year: 2025,
      role: 'r',
      stack: ['React', 'Node.js'],
      tags: [],
      url: `${SITE}projects/x/`,
      links: {},
      contentLang: 'en',
    };
    const j = projectJsonLd(summary, profile);
    expect(j['@type']).toBe('CreativeWork');
    expect(j.keywords).toBe('React, Node.js');
    expect(j.inLanguage).toBe('en');
    expect((j.author as Record<string, unknown>).name).toBe('Mario Vizcaino');
  });
});

describe('safeJson', () => {
  it('cannot close the surrounding script tag', () => {
    const out = safeJson({ title: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script');
    expect(out).not.toContain('<');
    expect(JSON.parse(out)).toEqual({ title: '</script><script>alert(1)</script>' });
  });
});
```

`tests/unit/robots.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { AI_CRAWLERS, buildRobotsTxt } from '../../src/lib/robots';

describe('robots.txt', () => {
  const txt = buildRobotsTxt('https://mariovzc.github.io/');

  it('allows everyone', () => {
    expect(txt).toContain('User-agent: *\nAllow: /');
  });

  it('explicitly allows AI crawlers', () => {
    for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
      expect(AI_CRAWLERS).toContain(bot);
      expect(txt).toContain(`User-agent: ${bot}\nAllow: /`);
    }
  });

  it('declares the sitemap with an absolute URL', () => {
    expect(txt).toContain('Sitemap: https://mariovzc.github.io/sitemap-index.xml');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `make test-unit`
Expected: FAIL — cannot resolve `../../src/lib/seo` and `../../src/lib/robots`.

- [ ] **Step 3: Create `src/lib/seo.ts`**

```ts
import { DEFAULT_LOCALE, LOCALES, localizePath, type Locale } from '../i18n/utils';
import type { ProfileData, ProjectSummary } from './types';

export function absoluteUrl(site: string, path: string): string {
  return new URL(path, site).href;
}

export function canonicalFor(o: {
  site: string;
  path: string;
  lang: Locale;
  translations: Locale[];
}): string {
  const target = o.translations.includes(o.lang) ? o.lang : (o.translations[0] ?? DEFAULT_LOCALE);
  return absoluteUrl(o.site, localizePath(o.path, target));
}

export function buildAlternates(o: {
  site: string;
  path: string;
  translations: Locale[];
}): { hreflang: string; href: string }[] {
  const langs = LOCALES.filter((l) => o.translations.includes(l));
  const alternates = langs.map((l) => ({
    hreflang: l,
    href: absoluteUrl(o.site, localizePath(o.path, l)),
  }));
  const fallback = langs.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : langs[0];
  if (fallback) {
    alternates.push({
      hreflang: 'x-default',
      href: absoluteUrl(o.site, localizePath(o.path, fallback)),
    });
  }
  return alternates;
}

export function personJsonLd(profile: ProfileData, site: string): Record<string, unknown> {
  const { github, linkedin, x } = profile.contact;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    description: profile.bio,
    url: site,
    email: `mailto:${profile.contact.email}`,
    sameAs: [github, linkedin, x].filter((v): v is string => Boolean(v)),
  };
}

export function websiteJsonLd(profile: ProfileData, site: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: profile.name,
    url: site,
    inLanguage: [...LOCALES],
  };
}

export function projectJsonLd(p: ProjectSummary, profile: ProfileData): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.title,
    description: p.summary,
    url: p.url,
    dateCreated: String(p.year),
    inLanguage: p.contentLang,
    keywords: p.stack.join(', '),
    author: { '@type': 'Person', name: profile.name },
  };
}

/** JSON that can be embedded inside a <script> element without closing it. */
export function safeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/ /g, '\\u2028')
    .replace(/ /g, '\\u2029');
}
```

- [ ] **Step 4: Create `src/lib/robots.ts`**

```ts
export const AI_CRAWLERS = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];

export function buildRobotsTxt(site: string): string {
  const blocks = ['*', ...AI_CRAWLERS].map((agent) => `User-agent: ${agent}\nAllow: /`);
  return `${blocks.join('\n\n')}\n\nSitemap: ${new URL('/sitemap-index.xml', site).href}\n`;
}
```

- [ ] **Step 5: Create `src/pages/robots.txt.ts`**

```ts
import type { APIRoute } from 'astro';
import { buildRobotsTxt } from '../lib/robots';

export const GET: APIRoute = ({ site }) =>
  new Response(buildRobotsTxt(site!.href), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
```

- [ ] **Step 6: Run tests and build**

Run: `make test-unit`
Expected: all PASS.

Run: `make build && cat dist/robots.txt`
Expected: contains `Sitemap: https://mariovzc.github.io/sitemap-index.xml`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(seo): add canonical/hreflang/JSON-LD helpers and robots.txt

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Design system, theme, base layout

**Files:**
- Create: `src/styles/global.css`, `src/lib/theme.ts`, `src/components/react/ThemeToggle.tsx`, `src/components/astro/SEO.astro`, `src/components/astro/Nav.astro`, `src/components/astro/Footer.astro`, `src/layouts/BaseLayout.astro`, `public/favicon.svg`
- Modify: `src/pages/index.astro` (use layout)
- Test: `tests/unit/theme.test.ts`

**Interfaces:**
- Consumes: `t`, `localizePath`, `switchLocalePath`, `otherLocale`, `Locale` (Task 2); `getProfile` (Task 3); `canonicalFor`, `buildAlternates`, `safeJson` (Task 4).
- Produces:
  - `src/lib/theme.ts`: `THEME_KEY = 'theme'`, `type Theme = 'light' | 'dark'`, `resolveTheme(stored: string | null, prefersDark: boolean): Theme`
  - `BaseLayout.astro` props: `{ lang: Locale; title: string; description: string; path: string; translations?: Locale[]; image?: string; jsonLd?: Record<string, unknown>[]; type?: 'website' | 'article'; noindex?: boolean }` (`path` = unlocalized route; `translations` defaults to `['en','es']`; `image` = absolute or site-relative URL)
  - Tailwind color utilities: `bg-bg text-fg text-muted border-line bg-surface text-accent`; fonts `font-serif font-sans`.

- [ ] **Step 1: Write the failing test `tests/unit/theme.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { resolveTheme } from '../../src/lib/theme';

describe('resolveTheme', () => {
  it('stored preference wins', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
  });

  it('falls back to system preference when nothing valid is stored', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
    expect(resolveTheme('purple', true)).toBe('dark');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `make test-unit`
Expected: FAIL — cannot resolve `../../src/lib/theme`.

- [ ] **Step 3: Create `src/lib/theme.ts`**

```ts
export const THEME_KEY = 'theme';
export type Theme = 'light' | 'dark';

/** Keep in sync with the inline script in BaseLayout.astro (it cannot import modules). */
export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersDark ? 'dark' : 'light';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `make test-unit`
Expected: PASS.

- [ ] **Step 5: Create `src/styles/global.css`**

```css
@import 'tailwindcss';
@import '@fontsource-variable/fraunces';
@import '@fontsource-variable/inter';

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --bg: #f6f3ee;
  --fg: #1b1a17;
  --muted: #6b665d;
  --line: #ddd6ca;
  --surface: #ece6dc;
  --accent: #c2410c;
  color-scheme: light;
}

.dark {
  --bg: #1a1816;
  --fg: #ece6dc;
  --muted: #a8a092;
  --line: #3a3530;
  --surface: #24211e;
  --accent: #fb923c;
  color-scheme: dark;
}

@theme inline {
  --color-bg: var(--bg);
  --color-fg: var(--fg);
  --color-muted: var(--muted);
  --color-line: var(--line);
  --color-surface: var(--surface);
  --color-accent: var(--accent);
  --font-serif: 'Fraunces Variable', Georgia, 'Times New Roman', serif;
  --font-sans: 'Inter Variable', system-ui, sans-serif;
}

html {
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-sans);
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.prose-content h2 {
  font-family: var(--font-serif);
  font-size: 1.75rem;
  margin: 2.5rem 0 1rem;
}
.prose-content p {
  margin: 0 0 1.25rem;
  line-height: 1.75;
}
.prose-content a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.prose-content ul {
  list-style: disc;
  padding-left: 1.5rem;
  margin: 0 0 1.25rem;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 6: Create `src/components/react/ThemeToggle.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { THEME_KEY, type Theme } from '../../lib/theme';

interface Props {
  labels: { toLight: string; toDark: string };
}

export default function ThemeToggle({ labels }: Props) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage unavailable (private mode): theme still applies for this page view.
    }
    setTheme(next);
  }

  const label = theme === 'dark' ? labels.toLight : labels.toDark;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      data-testid="theme-toggle"
      className="rounded-full border border-line px-3 py-1 text-sm text-muted transition-colors hover:text-fg"
    >
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
    </button>
  );
}
```

- [ ] **Step 7: Create `src/components/astro/SEO.astro`**

```astro
---
import type { Locale } from '../../i18n/utils';
import { buildAlternates, canonicalFor, safeJson } from '../../lib/seo';

interface Props {
  lang: Locale;
  title: string;
  description: string;
  path: string;
  translations: Locale[];
  image: string;
  type: 'website' | 'article';
  jsonLd: Record<string, unknown>[];
  noindex: boolean;
}

const { lang, title, description, path, translations, image, type, jsonLd, noindex } = Astro.props;
const site = Astro.site!.href;
const canonical = canonicalFor({ site, path, lang, translations });
const alternates = buildAlternates({ site, path, translations });
const imageUrl = new URL(image, site).href;
---

<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
{noindex && <meta name="robots" content="noindex" />}
{alternates.map((a) => <link rel="alternate" hreflang={a.hreflang} href={a.href} />)}

<meta property="og:type" content={type} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={imageUrl} />
<meta property="og:locale" content={lang === 'es' ? 'es_ES' : 'en_US'} />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={imageUrl} />

{jsonLd.map((data) => <script type="application/ld+json" set:html={safeJson(data)} />)}
```

- [ ] **Step 8: Create `src/components/astro/Nav.astro`**

```astro
---
import ThemeToggle from '../react/ThemeToggle';
import { localizePath, otherLocale, t, type Locale } from '../../i18n/utils';

interface Props {
  lang: Locale;
  path: string;
  name: string;
}

const { lang, path, name } = Astro.props;
const home = localizePath('/', lang);
const other = otherLocale(lang);
---

<header class="border-b border-line">
  <nav
    class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 text-sm sm:px-6"
    aria-label="Main"
  >
    <a href={home} class="font-semibold text-fg">{name}</a>
    <div class="flex items-center gap-4 text-muted sm:gap-6">
      <a href={`${home}#work`} class="hidden hover:text-fg sm:inline">{t(lang, 'nav.work')}</a>
      <a href={`${home}#about`} class="hidden hover:text-fg sm:inline">{t(lang, 'nav.about')}</a>
      <a href={`${home}#contact`} class="hover:text-fg">{t(lang, 'nav.contact')}</a>
      <a
        href={localizePath(path, other)}
        hreflang={other}
        lang={other}
        aria-label={t(lang, 'lang.switchLabel')}
        data-testid="lang-switch"
        class="font-medium hover:text-fg">{t(lang, 'lang.short')}</a
      >
      <ThemeToggle
        client:load
        labels={{ toLight: t(lang, 'theme.toLight'), toDark: t(lang, 'theme.toDark') }}
      />
    </div>
  </nav>
</header>
```

- [ ] **Step 9: Create `src/components/astro/Footer.astro`**

```astro
---
import { t, type Locale } from '../../i18n/utils';

interface Props {
  lang: Locale;
  name: string;
}

const { lang, name } = Astro.props;
const year = new Date().getFullYear();
---

<footer class="mt-24 border-t border-line">
  <div
    class="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:justify-between sm:px-6"
  >
    <p>© {year} {name}</p>
    <p>{t(lang, 'footer.built')}</p>
  </div>
</footer>
```

- [ ] **Step 10: Create `src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/global.css';
import SEO from '../components/astro/SEO.astro';
import Nav from '../components/astro/Nav.astro';
import Footer from '../components/astro/Footer.astro';
import { LOCALES, t, type Locale } from '../i18n/utils';
import { getProfile } from '../lib/site-data';

interface Props {
  lang: Locale;
  title: string;
  description: string;
  /** Unlocalized route, e.g. "/" or "/projects/foo/". */
  path: string;
  translations?: Locale[];
  image?: string;
  jsonLd?: Record<string, unknown>[];
  type?: 'website' | 'article';
  noindex?: boolean;
}

const {
  lang,
  title,
  description,
  path,
  translations = [...LOCALES],
  image = '/og-default.png',
  jsonLd = [],
  type = 'website',
  noindex = false,
} = Astro.props;

const profile = await getProfile(lang);
---

<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <script is:inline>
      // Mirrors resolveTheme() in src/lib/theme.ts. Runs before first paint.
      (function () {
        var stored = null;
        try {
          stored = localStorage.getItem('theme');
        } catch (e) {}
        var dark =
          stored === 'dark' ||
          (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', dark);
      })();
    </script>
    <SEO
      lang={lang}
      title={title}
      description={description}
      path={path}
      translations={translations}
      image={image}
      type={type}
      jsonLd={jsonLd}
      noindex={noindex}
    />
  </head>
  <body class="min-h-screen bg-bg text-fg">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-surface focus:px-3 focus:py-2"
      >{t(lang, 'nav.skip')}</a
    >
    <Nav lang={lang} path={path} name={profile.name} />
    <main id="main" class="mx-auto max-w-5xl px-4 sm:px-6">
      <slot />
    </main>
    <Footer lang={lang} name={profile.name} />
  </body>
</html>
```

- [ ] **Step 11: Create `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#c2410c"/>
  <text x="32" y="44" font-family="Georgia, serif" font-size="36" text-anchor="middle" fill="#f6f3ee">M</text>
</svg>
```

- [ ] **Step 12: Replace `src/pages/index.astro` to use the layout**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout lang="en" title="Mario Vizcaino" description="Portfolio" path="/">
  <h1 class="py-24 font-serif text-5xl">Mario Vizcaino</h1>
</BaseLayout>
```

- [ ] **Step 13: Verify**

Run: `make check && make build`
Expected: `0 errors`; build completes.

Run: `make dev`, open `http://localhost:4321`:
- page uses warm off-white background and serif heading;
- toggle switches to dark, reload keeps dark, no flash of light theme;
- DevTools → Application → clear storage + set OS to dark → page loads dark.
Then `make stop`.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat(ui): add B1 design tokens, theme toggle, SEO head and base layout

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Home page sections (EN + ES)

**Files:**
- Create: `src/components/astro/Section.astro`, `Hero.astro`, `ProjectCard.astro`, `ProjectsSection.astro`, `About.astro`, `Services.astro`, `Experience.astro`, `Contact.astro` (all under `src/components/astro/`)
- Create: `src/views/HomePage.astro`, `src/pages/es/index.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `BaseLayout` (Task 5), `getProfile`, `getProjects`, `ProjectEntry` (Task 3), `featuredProjects` (Task 3), `personJsonLd`, `websiteJsonLd` (Task 4), `t`, `localizePath` (Task 2).
- Produces: `HomePage.astro` props `{ lang: Locale }`. Section anchors `#work`, `#about`, `#services`, `#experience`, `#contact`. `data-testid` hooks: `project-card`, `cv-link`.

- [ ] **Step 1: Create `src/components/astro/Section.astro`**

```astro
---
interface Props {
  id: string;
  title: string;
}
const { id, title } = Astro.props;
---

<section id={id} aria-labelledby={`${id}-title`} class="scroll-mt-20 border-t border-line py-16">
  <h2 id={`${id}-title`} class="mb-10 font-serif text-3xl sm:text-4xl">{title}</h2>
  <slot />
</section>
```

- [ ] **Step 2: Create `src/components/astro/Hero.astro`**

```astro
---
import { localizePath, t, type Locale } from '../../i18n/utils';
import type { ProfileData } from '../../lib/types';

interface Props {
  lang: Locale;
  profile: ProfileData;
}
const { lang, profile } = Astro.props;
const home = localizePath('/', lang);
---

<section class="py-20 sm:py-28">
  {
    profile.availability && (
      <p class="mb-6 inline-block rounded-full border border-line px-3 py-1 text-xs text-muted">
        {profile.availability}
      </p>
    )
  }
  <p class="mb-3 text-sm uppercase tracking-widest text-muted">{profile.role}</p>
  <h1 class="font-serif text-5xl leading-[1.05] sm:text-7xl">{profile.name}</h1>
  <p class="mt-6 max-w-2xl font-serif text-2xl italic text-accent sm:text-3xl">
    {profile.headline}
  </p>
  <div class="mt-10 flex flex-wrap gap-4 text-sm">
    <a href={`${home}#work`} class="rounded-full bg-fg px-5 py-2.5 font-medium text-bg"
      >{t(lang, 'hero.viewWork')}</a
    >
    <a href={`${home}#contact`} class="rounded-full border border-line px-5 py-2.5 hover:border-fg"
      >{t(lang, 'hero.contact')}</a
    >
  </div>
</section>
```

- [ ] **Step 3: Create `src/components/astro/ProjectCard.astro`**

```astro
---
import { Image } from 'astro:assets';
import { localizePath, t, type Locale } from '../../i18n/utils';
import type { LocalizedProject } from '../../lib/projects';
import type { ProjectEntry } from '../../lib/site-data';

interface Props {
  lang: Locale;
  project: LocalizedProject<ProjectEntry>;
}
const { lang, project } = Astro.props;
const d = project.entry.data;
const href = localizePath(`/projects/${project.slug}/`, lang);
---

<article data-testid="project-card" class="group">
  <a href={href} class="block" aria-label={`${t(lang, 'projects.view')}: ${d.title}`}>
    <div class="overflow-hidden rounded-lg bg-surface">
      <Image
        src={d.cover}
        alt={d.coverAlt}
        widths={[480, 960]}
        sizes="(min-width: 768px) 50vw, 100vw"
        class="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
    </div>
    <div class="mt-4 flex items-baseline justify-between gap-4">
      <h3 class="font-serif text-2xl" lang={project.contentLang}>{d.title}</h3>
      <span class="text-sm text-muted">{d.year}</span>
    </div>
    <p class="mt-2 text-muted" lang={project.contentLang}>{d.summary}</p>
    <ul class="mt-3 flex flex-wrap gap-2 text-xs text-muted">
      {d.stack.map((s) => <li class="rounded-full border border-line px-2 py-0.5">{s}</li>)}
    </ul>
  </a>
</article>
```

- [ ] **Step 4: Create `src/components/astro/ProjectsSection.astro`**

```astro
---
import Section from './Section.astro';
import ProjectCard from './ProjectCard.astro';
import { t, type Locale } from '../../i18n/utils';
import type { LocalizedProject } from '../../lib/projects';
import type { ProjectEntry } from '../../lib/site-data';

interface Props {
  lang: Locale;
  projects: LocalizedProject<ProjectEntry>[];
}
const { lang, projects } = Astro.props;
---

<Section id="work" title={t(lang, 'projects.title')}>
  <div class="grid gap-12 md:grid-cols-2">
    {projects.map((p) => <ProjectCard lang={lang} project={p} />)}
  </div>
</Section>
```

- [ ] **Step 5: Create `src/components/astro/About.astro`**

```astro
---
import Section from './Section.astro';
import { t, type Locale, type UiKey } from '../../i18n/utils';
import type { ProfileData } from '../../lib/types';

interface Props {
  lang: Locale;
  profile: ProfileData;
}
const { lang, profile } = Astro.props;
const groups = (['frontend', 'backend', 'tools'] as const)
  .map((key) => ({ key, label: t(lang, `stack.${key}` as UiKey), items: profile.stack[key] }))
  .filter((g) => g.items.length > 0);
---

<Section id="about" title={t(lang, 'about.title')}>
  <div class="grid gap-12 md:grid-cols-[3fr_2fr]">
    <p class="text-lg leading-relaxed">{profile.bio}</p>
    <div>
      <h3 class="mb-4 text-sm uppercase tracking-widest text-muted">{t(lang, 'about.stack')}</h3>
      <dl class="space-y-4">
        {
          groups.map((g) => (
            <div>
              <dt class="text-sm text-muted">{g.label}</dt>
              <dd class="mt-1">{g.items.join(' · ')}</dd>
            </div>
          ))
        }
      </dl>
    </div>
  </div>
</Section>
```

- [ ] **Step 6: Create `src/components/astro/Services.astro`**

```astro
---
import Section from './Section.astro';
import { t, type Locale } from '../../i18n/utils';
import type { ProfileData } from '../../lib/types';

interface Props {
  lang: Locale;
  profile: ProfileData;
}
const { lang, profile } = Astro.props;
---

<Section id="services" title={t(lang, 'services.title')}>
  <ul class="grid gap-8 md:grid-cols-2">
    {
      profile.services.map((s) => (
        <li class="rounded-lg border border-line p-6">
          <h3 class="font-serif text-xl">{s.title}</h3>
          <p class="mt-2 text-muted">{s.description}</p>
        </li>
      ))
    }
  </ul>
</Section>
```

- [ ] **Step 7: Create `src/components/astro/Experience.astro`**

```astro
---
import Section from './Section.astro';
import { t, type Locale } from '../../i18n/utils';
import type { ProfileData } from '../../lib/types';

interface Props {
  lang: Locale;
  profile: ProfileData;
}
const { lang, profile } = Astro.props;
const hasContent = profile.experience.length > 0 || Boolean(profile.cv);
---

{
  hasContent && (
    <Section id="experience" title={t(lang, 'experience.title')}>
      <ol class="space-y-8">
        {profile.experience.map((e) => (
          <li class="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-6">
            <p class="text-sm text-muted">
              {e.start} – {e.end ?? t(lang, 'experience.present')}
            </p>
            <div>
              <h3 class="font-medium">
                {e.role} · {e.company}
              </h3>
              <p class="mt-1 text-muted">{e.summary}</p>
            </div>
          </li>
        ))}
      </ol>
      {profile.cv && (
        <a
          href={profile.cv}
          download
          data-testid="cv-link"
          class="mt-10 inline-block text-accent underline underline-offset-4"
        >
          {t(lang, 'experience.downloadCv')}
        </a>
      )}
    </Section>
  )
}
```

- [ ] **Step 8: Create `src/components/astro/Contact.astro`**

```astro
---
import Section from './Section.astro';
import { t, type Locale } from '../../i18n/utils';
import type { ProfileData } from '../../lib/types';

interface Props {
  lang: Locale;
  profile: ProfileData;
}
const { lang, profile } = Astro.props;
const { email, github, linkedin, x } = profile.contact;
const socials = [
  { label: 'GitHub', href: github },
  { label: 'LinkedIn', href: linkedin },
  { label: 'X', href: x },
].filter((s): s is { label: string; href: string } => Boolean(s.href));
---

<Section id="contact" title={t(lang, 'contact.title')}>
  <p class="max-w-xl text-lg text-muted">{t(lang, 'contact.text')}</p>
  <a
    href={`mailto:${email}`}
    class="mt-6 inline-block font-serif text-3xl text-accent underline underline-offset-8 sm:text-4xl"
    >{email}</a
  >
  <ul class="mt-8 flex gap-6 text-sm">
    {
      socials.map((s) => (
        <li>
          <a href={s.href} rel="me noopener" target="_blank" class="text-muted hover:text-fg">
            {s.label}
          </a>
        </li>
      ))
    }
  </ul>
</Section>
```

- [ ] **Step 9: Create `src/views/HomePage.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/astro/Hero.astro';
import ProjectsSection from '../components/astro/ProjectsSection.astro';
import About from '../components/astro/About.astro';
import Services from '../components/astro/Services.astro';
import Experience from '../components/astro/Experience.astro';
import Contact from '../components/astro/Contact.astro';
import type { Locale } from '../i18n/utils';
import { featuredProjects } from '../lib/projects';
import { getProfile, getProjects } from '../lib/site-data';
import { personJsonLd, websiteJsonLd } from '../lib/seo';

interface Props {
  lang: Locale;
}
const { lang } = Astro.props;
const profile = await getProfile(lang);
const projects = featuredProjects(await getProjects(lang));
const site = Astro.site!.href;
---

<BaseLayout
  lang={lang}
  title={`${profile.name} — ${profile.role}`}
  description={`${profile.headline} ${profile.bio}`.slice(0, 160)}
  path="/"
  jsonLd={[personJsonLd(profile, site), websiteJsonLd(profile, site)]}
>
  <Hero lang={lang} profile={profile} />
  <ProjectsSection lang={lang} projects={projects} />
  <About lang={lang} profile={profile} />
  <Services lang={lang} profile={profile} />
  <Experience lang={lang} profile={profile} />
  <Contact lang={lang} profile={profile} />
</BaseLayout>
```

- [ ] **Step 10: Replace `src/pages/index.astro` and create `src/pages/es/index.astro`**

`src/pages/index.astro`:

```astro
---
import HomePage from '../views/HomePage.astro';
---

<HomePage lang="en" />
```

`src/pages/es/index.astro`:

```astro
---
import HomePage from '../../views/HomePage.astro';
---

<HomePage lang="es" />
```

- [ ] **Step 11: Verify**

Run: `make format && make check && make build`
Expected: `0 errors`; `dist/index.html` and `dist/es/index.html` exist.

Run: `grep -c 'data-testid="project-card"' dist/index.html` → `2`.
Run: `grep -c 'cv-link' dist/index.html` → `0` (sample profile has no `cv`).

Run: `make dev` → check `/` and `/es/` at 375 px and 1280 px widths: no horizontal scroll, sections in order Hero → Work → About → Services → Experience → Contact. `make stop`.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat(home): add hero, projects, about, services, experience and contact sections

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Project detail pages, image gallery, 404

**Files:**
- Create: `src/components/react/ImageGallery.tsx`, `src/views/ProjectPage.astro`, `src/pages/projects/[slug].astro`, `src/pages/es/projects/[slug].astro`, `src/pages/404.astro`

**Interfaces:**
- Consumes: `getProjects`, `getProfile`, `toSummary`, `ProjectEntry` (Task 3); `adjacentProjects`, `LocalizedProject` (Task 3); `projectJsonLd` (Task 4); `BaseLayout` (Task 5).
- Produces:
  - `ImageGallery` props: `{ images: { thumb: string; full: string; alt: string; width: number; height: number }[]; labels: { open: string; close: string } }`
  - `ProjectPage.astro` props: `{ lang: Locale; project: LocalizedProject<ProjectEntry>; all: LocalizedProject<ProjectEntry>[] }`
  - `data-testid` hooks: `fallback-notice`, `project-live`, `project-repo`, `project-gallery`, `project-prev`, `project-next`.

- [ ] **Step 1: Create `src/components/react/ImageGallery.tsx`**

```tsx
import { useRef, useState } from 'react';

interface GalleryImage {
  thumb: string;
  full: string;
  alt: string;
  width: number;
  height: number;
}

interface Props {
  images: GalleryImage[];
  labels: { open: string; close: string };
}

export default function ImageGallery({ images, labels }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<GalleryImage | null>(null);

  function open(img: GalleryImage) {
    setActive(img);
    dialog.current?.showModal();
  }

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {images.map((img) => (
          <li key={img.full}>
            <button
              type="button"
              onClick={() => open(img)}
              aria-label={`${labels.open}: ${img.alt}`}
              className="block w-full overflow-hidden rounded-lg bg-surface"
            >
              <img
                src={img.thumb}
                alt={img.alt}
                width={img.width}
                height={img.height}
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialog}
        onClose={() => setActive(null)}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto max-h-[90vh] max-w-[90vw] rounded-lg bg-bg p-0 backdrop:bg-black/70"
      >
        {active && (
          <figure className="relative">
            <img src={active.full} alt={active.alt} className="max-h-[85vh] w-auto" />
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="absolute right-3 top-3 rounded-full bg-bg px-3 py-1 text-sm"
            >
              {labels.close}
            </button>
          </figure>
        )}
      </dialog>
    </>
  );
}
```

- [ ] **Step 2: Create `src/views/ProjectPage.astro`**

```astro
---
import { Image, getImage } from 'astro:assets';
import { render } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import ImageGallery from '../components/react/ImageGallery';
import { localizePath, t, type Locale } from '../i18n/utils';
import { adjacentProjects, type LocalizedProject } from '../lib/projects';
import { getProfile, toSummary, type ProjectEntry } from '../lib/site-data';
import { projectJsonLd } from '../lib/seo';

interface Props {
  lang: Locale;
  project: LocalizedProject<ProjectEntry>;
  all: LocalizedProject<ProjectEntry>[];
}

const { lang, project, all } = Astro.props;
const d = project.entry.data;
const { Content } = await render(project.entry);
const profile = await getProfile(lang);
const summary = toSummary(project, Astro.site!);
const { prev, next } = adjacentProjects(all, project.slug);
const og = await getImage({ src: d.cover, width: 1200, height: 630, fit: 'cover', format: 'png' });
const gallery = await Promise.all(
  d.gallery.map(async (g) => {
    const thumb = await getImage({ src: g.src, width: 800, format: 'webp' });
    const full = await getImage({ src: g.src, width: 1600, format: 'webp' });
    return {
      thumb: thumb.src,
      full: full.src,
      alt: g.alt,
      width: Number(thumb.attributes.width ?? 800),
      height: Number(thumb.attributes.height ?? 500),
    };
  }),
);
const projectHref = (slug: string) => localizePath(`/projects/${slug}/`, lang);
---

<BaseLayout
  lang={lang}
  title={`${d.title} — ${profile.name}`}
  description={d.summary}
  path={`/projects/${project.slug}/`}
  translations={project.translations}
  image={og.src}
  type="article"
  jsonLd={[projectJsonLd(summary, profile)]}
>
  <article class="py-16">
    <a href={`${localizePath('/', lang)}#work`} class="text-sm text-muted hover:text-fg"
      >← {t(lang, 'project.back')}</a
    >

    {
      project.isFallback && (
        <p
          data-testid="fallback-notice"
          class="mt-6 rounded-lg border border-line bg-surface px-4 py-3 text-sm"
        >
          {t(lang, 'project.fallbackNotice')}
        </p>
      )
    }

    <div lang={project.contentLang}>
      <h1 class="mt-6 font-serif text-4xl leading-tight sm:text-6xl">{d.title}</h1>
      <p class="mt-4 max-w-2xl text-xl text-muted">{d.summary}</p>

      <dl class="mt-10 grid gap-6 border-y border-line py-6 text-sm sm:grid-cols-3">
        <div>
          <dt class="text-muted">{t(lang, 'project.year')}</dt>
          <dd class="mt-1">{d.year}</dd>
        </div>
        <div>
          <dt class="text-muted">{t(lang, 'project.role')}</dt>
          <dd class="mt-1">{d.role}</dd>
        </div>
        <div>
          <dt class="text-muted">{t(lang, 'project.stack')}</dt>
          <dd class="mt-1">{d.stack.join(' · ')}</dd>
        </div>
      </dl>

      {
        (d.links.live || d.links.repo) && (
          <p class="mt-6 flex gap-6 text-sm">
            {d.links.live && (
              <a
                href={d.links.live}
                data-testid="project-live"
                target="_blank"
                rel="noopener"
                class="text-accent underline underline-offset-4"
              >
                {t(lang, 'project.live')} ↗
              </a>
            )}
            {d.links.repo && (
              <a
                href={d.links.repo}
                data-testid="project-repo"
                target="_blank"
                rel="noopener"
                class="text-accent underline underline-offset-4"
              >
                {t(lang, 'project.repo')} ↗
              </a>
            )}
          </p>
        )
      }

      <div class="mt-10 overflow-hidden rounded-lg bg-surface">
        <Image
          src={d.cover}
          alt={d.coverAlt}
          widths={[800, 1600]}
          sizes="(min-width: 1024px) 1024px, 100vw"
          class="w-full"
          loading="eager"
        />
      </div>

      <div class="prose-content mt-12 max-w-2xl">
        <Content />
      </div>

      {
        gallery.length > 0 && (
          <section data-testid="project-gallery" class="mt-16">
            <h2 class="mb-6 font-serif text-2xl">{t(lang, 'project.gallery')}</h2>
            <ImageGallery
              client:visible
              images={gallery}
              labels={{ open: t(lang, 'gallery.open'), close: t(lang, 'gallery.close') }}
            />
          </section>
        )
      }
    </div>

    <nav class="mt-20 flex justify-between gap-6 border-t border-line pt-8 text-sm" aria-label="Projects">
      {
        prev ? (
          <a href={projectHref(prev.slug)} data-testid="project-prev" class="hover:text-accent">
            ← {t(lang, 'project.prev')}
            <span class="block font-serif text-lg">{prev.entry.data.title}</span>
          </a>
        ) : (
          <span />
        )
      }
      {
        next && (
          <a
            href={projectHref(next.slug)}
            data-testid="project-next"
            class="text-right hover:text-accent"
          >
            {t(lang, 'project.next')} →
            <span class="block font-serif text-lg">{next.entry.data.title}</span>
          </a>
        )
      }
    </nav>
  </article>
</BaseLayout>
```

- [ ] **Step 3: Create `src/pages/projects/[slug].astro`**

```astro
---
import ProjectPage from '../../views/ProjectPage.astro';
import { getProjects } from '../../lib/site-data';

export async function getStaticPaths() {
  const all = await getProjects('en');
  return all.map((project) => ({ params: { slug: project.slug }, props: { project, all } }));
}

const { project, all } = Astro.props;
---

<ProjectPage lang="en" project={project} all={all} />
```

- [ ] **Step 4: Create `src/pages/es/projects/[slug].astro`**

```astro
---
import ProjectPage from '../../../views/ProjectPage.astro';
import { getProjects } from '../../../lib/site-data';

export async function getStaticPaths() {
  const all = await getProjects('es');
  return all.map((project) => ({ params: { slug: project.slug }, props: { project, all } }));
}

const { project, all } = Astro.props;
---

<ProjectPage lang="es" project={project} all={all} />
```

- [ ] **Step 5: Create `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { t } from '../i18n/utils';
---

<BaseLayout
  lang="en"
  title={`${t('en', 'notFound.title')} — 404`}
  description={t('en', 'notFound.text')}
  path="/404/"
  translations={['en']}
  noindex
>
  <section class="py-28">
    <p class="text-sm uppercase tracking-widest text-muted">404</p>
    <h1 class="mt-4 font-serif text-5xl">{t('en', 'notFound.title')}</h1>
    <p class="mt-4 text-lg text-muted">{t('en', 'notFound.text')}</p>
    <p class="mt-2 text-lg text-muted" lang="es">{t('es', 'notFound.text')}</p>
    <p class="mt-10 flex gap-6">
      <a href="/" class="text-accent underline underline-offset-4">{t('en', 'notFound.home')}</a>
      <a href="/es/" lang="es" class="text-accent underline underline-offset-4"
        >{t('es', 'notFound.home')}</a
      >
    </p>
  </section>
</BaseLayout>
```

- [ ] **Step 6: Verify**

Run: `make format && make check && make build`
Expected: `0 errors`; these files exist: `dist/projects/sample-full/index.html`, `dist/projects/sample-en-only/index.html`, `dist/es/projects/sample-full/index.html`, `dist/es/projects/sample-en-only/index.html`, `dist/404.html`.

Run: `grep -o 'rel="canonical" href="[^"]*"' dist/es/projects/sample-en-only/index.html`
Expected: `rel="canonical" href="https://mariovzc.github.io/projects/sample-en-only/"`.

Run: `grep -c 'hreflang="es"' dist/es/projects/sample-en-only/index.html` → `0`.

Run: `grep -c '/es/projects/sample-en-only/' dist/sitemap-0.xml` → `0`.

Run: `make dev` → open `/projects/sample-full/`: gallery thumbnail opens a modal; Esc and Close button close it; `ES` link goes to `/es/projects/sample-full/`. `make stop`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(projects): add bilingual project pages with gallery and 404

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: llms.txt

**Files:**
- Create: `src/lib/llms.ts`, `src/pages/llms.txt.ts`
- Test: `tests/unit/llms.test.ts`

**Interfaces:**
- Consumes: `SiteData` (Task 3), `getSiteData` (Task 3).
- Produces: `buildLlmsTxt(data: SiteData): string`.

- [ ] **Step 1: Write the failing test `tests/unit/llms.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { buildLlmsTxt } from '../../src/lib/llms';
import type { ProfileData, SiteData } from '../../src/lib/types';

const profile: ProfileData = {
  name: 'Mario Vizcaino',
  headline: 'Software that feels simple.',
  role: 'Full-stack developer',
  bio: 'I build web products.',
  services: [{ title: 'Web apps', description: 'React apps.' }],
  experience: [],
  stack: { frontend: ['React'], backend: ['Node.js'], tools: [] },
  contact: { email: 'a@b.co', github: 'https://github.com/mariovzc' },
  cv: '/cv/cv.pdf',
};

const data: SiteData = {
  site: 'https://mariovzc.github.io/',
  profiles: { en: profile, es: { ...profile, role: 'Desarrollador' } },
  projects: {
    en: [
      {
        slug: 'x',
        title: 'Project X',
        summary: 'Does X.',
        year: 2025,
        role: 'Lead',
        stack: ['React', 'Node.js'],
        tags: [],
        url: 'https://mariovzc.github.io/projects/x/',
        links: {},
        contentLang: 'en',
      },
    ],
    es: [],
  },
};

describe('buildLlmsTxt', () => {
  const txt = buildLlmsTxt(data);

  it('starts with an H1 name and a blockquote summary', () => {
    expect(txt.startsWith('# Mario Vizcaino\n\n> Full-stack developer. Software that feels simple.\n')).toBe(
      true,
    );
  });

  it('lists services, projects with absolute links, and contact', () => {
    expect(txt).toContain('## Services\n\n- **Web apps**: React apps.');
    expect(txt).toContain('- [Project X](https://mariovzc.github.io/projects/x/): Does X. (2025; React, Node.js)');
    expect(txt).toContain('- Email: a@b.co');
    expect(txt).toContain('- GitHub: https://github.com/mariovzc');
    expect(txt).toContain('- CV: https://mariovzc.github.io/cv/cv.pdf');
  });

  it('links the Spanish version under Optional', () => {
    expect(txt).toContain('## Optional\n\n- [Versión en español](https://mariovzc.github.io/es/)');
  });

  it('omits sections with no content', () => {
    const empty = buildLlmsTxt({ ...data, projects: { en: [], es: [] } });
    expect(empty).not.toContain('## Projects');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `make test-unit`
Expected: FAIL — cannot resolve `../../src/lib/llms`.

- [ ] **Step 3: Create `src/lib/llms.ts`**

```ts
import type { SiteData } from './types';

/** https://llmstxt.org format, English as primary language. */
export function buildLlmsTxt(data: SiteData): string {
  const p = data.profiles.en;
  const abs = (path: string) => new URL(path, data.site).href;
  const sections: string[] = [];

  sections.push(`# ${p.name}\n\n> ${p.role}. ${p.headline}\n\n${p.bio}`);

  if (p.services.length) {
    sections.push(
      `## Services\n\n${p.services.map((s) => `- **${s.title}**: ${s.description}`).join('\n')}`,
    );
  }

  if (data.projects.en.length) {
    const items = data.projects.en.map(
      (x) => `- [${x.title}](${x.url}): ${x.summary} (${x.year}; ${x.stack.join(', ')})`,
    );
    sections.push(`## Projects\n\n${items.join('\n')}`);
  }

  const contact = [
    `- Email: ${p.contact.email}`,
    p.contact.github && `- GitHub: ${p.contact.github}`,
    p.contact.linkedin && `- LinkedIn: ${p.contact.linkedin}`,
    p.contact.x && `- X: ${p.contact.x}`,
    p.cv && `- CV: ${abs(p.cv)}`,
  ].filter(Boolean);
  sections.push(`## Contact\n\n${contact.join('\n')}`);

  sections.push(`## Optional\n\n- [Versión en español](${abs('/es/')}): Spanish version of this site`);

  return `${sections.join('\n\n')}\n`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `make test-unit`
Expected: PASS.

- [ ] **Step 5: Create `src/pages/llms.txt.ts`**

```ts
import type { APIRoute } from 'astro';
import { buildLlmsTxt } from '../lib/llms';
import { getSiteData } from '../lib/site-data';

export const GET: APIRoute = async ({ site }) =>
  new Response(buildLlmsTxt(await getSiteData(site!)), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
```

- [ ] **Step 6: Verify**

Run: `make build && cat dist/llms.txt`
Expected: starts with `# Mario Vizcaino`, lists both sample projects with `https://mariovzc.github.io/projects/...` URLs.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(ai): generate llms.txt from site content

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: WebMCP tools

**Files:**
- Create: `src/lib/webmcp-tools.ts`, `src/scripts/webmcp.ts`
- Modify: `src/layouts/BaseLayout.astro` (inject data + script + origin-trial meta)
- Create: `.env.example`
- Test: `tests/unit/webmcp-tools.test.ts`

**Interfaces:**
- Consumes: `SiteData` (Task 3), `getSiteData` (Task 3), `safeJson` (Task 4), `isLocale`, `Locale` (Task 2).
- Produces (`src/lib/webmcp-tools.ts`):
  - `interface ToolResult { content: { type: 'text'; text: string }[]; isError?: boolean }`
  - `interface ToolDef { name: string; description: string; inputSchema: Record<string, unknown>; annotations: { readOnlyHint: true }; execute(args?: Record<string, unknown>): Promise<ToolResult> }`
  - `interface ModelContextLike { registerTool(tool: ToolDef, options?: { signal?: AbortSignal }): unknown }`
  - `pickModelContext(doc: unknown, nav: unknown): ModelContextLike | undefined`
  - `createTools(data: SiteData): ToolDef[]` — names `list_projects`, `get_project`, `get_profile`, `get_contact`.
- DOM contract: `<script type="application/json" id="webmcp-data">` holds `safeJson(SiteData)`.

- [ ] **Step 1: Write the failing test `tests/unit/webmcp-tools.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { createTools, pickModelContext, type ToolDef } from '../../src/lib/webmcp-tools';
import type { ProfileData, ProjectSummary, SiteData } from '../../src/lib/types';

const profile: ProfileData = {
  name: 'Mario Vizcaino',
  headline: 'h',
  role: 'Full-stack developer',
  bio: 'bio',
  services: [{ title: 'Web apps', description: 'd' }],
  experience: [],
  stack: { frontend: ['React'], backend: [], tools: [] },
  contact: { email: 'a@b.co', github: 'https://github.com/mariovzc' },
  cv: '/cv/cv.pdf',
};

const project = (slug: string, stack: string[], tags: string[] = []): ProjectSummary => ({
  slug,
  title: slug.toUpperCase(),
  summary: `${slug} summary`,
  year: 2025,
  role: 'Lead',
  stack,
  tags,
  url: `https://mariovzc.github.io/projects/${slug}/`,
  links: {},
  contentLang: 'en',
});

const data: SiteData = {
  site: 'https://mariovzc.github.io/',
  profiles: { en: profile, es: { ...profile, role: 'Desarrollador full-stack' } },
  projects: {
    en: [project('alpha', ['React', 'Node.js'], ['web']), project('beta', ['Astro'])],
    es: [{ ...project('alpha', ['React']), title: 'ALFA' }],
  },
};

const tools = createTools(data);
const tool = (name: string) => tools.find((x) => x.name === name) as ToolDef;
const json = async (name: string, args?: Record<string, unknown>) =>
  JSON.parse((await tool(name).execute(args)).content[0]!.text);

describe('createTools', () => {
  it('defines four read-only tools with JSON schemas', () => {
    expect(tools.map((x) => x.name)).toEqual([
      'list_projects',
      'get_project',
      'get_profile',
      'get_contact',
    ]);
    for (const x of tools) {
      expect(x.description.length).toBeGreaterThan(10);
      expect(x.inputSchema.type).toBe('object');
      expect(x.annotations.readOnlyHint).toBe(true);
    }
  });

  it('list_projects defaults to English and filters by stack/tag case-insensitively', async () => {
    expect((await json('list_projects')).map((p: ProjectSummary) => p.slug)).toEqual(['alpha', 'beta']);
    expect((await json('list_projects', { stack: 'react' })).map((p: ProjectSummary) => p.slug)).toEqual([
      'alpha',
    ]);
    expect((await json('list_projects', { tag: 'WEB' })).length).toBe(1);
  });

  it('list_projects honours lang and ignores invalid lang', async () => {
    expect((await json('list_projects', { lang: 'es' }))[0].title).toBe('ALFA');
    expect((await json('list_projects', { lang: 'fr' })).length).toBe(2);
  });

  it('get_project returns a project or a helpful error', async () => {
    expect((await json('get_project', { slug: 'beta' })).title).toBe('BETA');
    const missing = await tool('get_project').execute({ slug: 'nope' });
    expect(missing.isError).toBe(true);
    expect(missing.content[0]!.text).toContain('alpha, beta');
  });

  it('get_profile and get_contact', async () => {
    expect((await json('get_profile', { lang: 'es' })).role).toBe('Desarrollador full-stack');
    expect(await json('get_contact')).toEqual({
      email: 'a@b.co',
      github: 'https://github.com/mariovzc',
      cv: 'https://mariovzc.github.io/cv/cv.pdf',
    });
  });
});

describe('pickModelContext', () => {
  const mc = { registerTool: () => undefined };

  it('prefers document.modelContext', () => {
    const other = { registerTool: () => undefined };
    expect(pickModelContext({ modelContext: mc }, { modelContext: other })).toBe(mc);
  });

  it('falls back to navigator.modelContext', () => {
    expect(pickModelContext({}, { modelContext: mc })).toBe(mc);
  });

  it('returns undefined when unsupported or malformed', () => {
    expect(pickModelContext({}, {})).toBeUndefined();
    expect(pickModelContext({ modelContext: {} }, undefined)).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `make test-unit`
Expected: FAIL — cannot resolve `../../src/lib/webmcp-tools`.

- [ ] **Step 3: Create `src/lib/webmcp-tools.ts`**

```ts
import { DEFAULT_LOCALE, isLocale, type Locale } from '../i18n/utils';
import type { SiteData } from './types';

export interface ToolResult {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}

export interface ToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: true };
  execute(args?: Record<string, unknown>): Promise<ToolResult>;
}

export interface ModelContextLike {
  registerTool(tool: ToolDef, options?: { signal?: AbortSignal }): unknown;
}

function hasRegisterTool(value: unknown): value is ModelContextLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { registerTool?: unknown }).registerTool === 'function'
  );
}

/** WebMCP moved from navigator.modelContext to document.modelContext in 2026; support both. */
export function pickModelContext(doc: unknown, nav: unknown): ModelContextLike | undefined {
  for (const host of [doc, nav]) {
    const mc = (host as { modelContext?: unknown } | undefined)?.modelContext;
    if (hasRegisterTool(mc)) return mc;
  }
  return undefined;
}

const LANG_PROP = {
  type: 'string',
  enum: ['en', 'es'],
  description: 'Response language. Defaults to "en".',
};

const ok = (value: unknown): ToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(value) }],
});
const fail = (message: string): ToolResult => ({
  content: [{ type: 'text', text: message }],
  isError: true,
});

function langOf(args?: Record<string, unknown>): Locale {
  const v = args?.lang;
  return typeof v === 'string' && isLocale(v) ? v : DEFAULT_LOCALE;
}

function str(args: Record<string, unknown> | undefined, key: string): string | undefined {
  const v = args?.[key];
  return typeof v === 'string' && v.trim() !== '' ? v.trim().toLowerCase() : undefined;
}

export function createTools(data: SiteData): ToolDef[] {
  const abs = (path: string) => new URL(path, data.site).href;
  const readOnly = { readOnlyHint: true } as const;

  return [
    {
      name: 'list_projects',
      description:
        "List Mario Vizcaino's portfolio projects, optionally filtered by technology or tag.",
      inputSchema: {
        type: 'object',
        properties: {
          stack: { type: 'string', description: 'Technology to filter by, e.g. "React".' },
          tag: { type: 'string', description: 'Tag to filter by, e.g. "freelance".' },
          lang: LANG_PROP,
        },
      },
      annotations: readOnly,
      async execute(args) {
        const stack = str(args, 'stack');
        const tag = str(args, 'tag');
        const list = data.projects[langOf(args)].filter(
          (p) =>
            (!stack || p.stack.some((s) => s.toLowerCase() === stack)) &&
            (!tag || p.tags.some((x) => x.toLowerCase() === tag)),
        );
        return ok(list);
      },
    },
    {
      name: 'get_project',
      description: 'Get the details of one portfolio project by its slug.',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Project slug as returned by list_projects.' },
          lang: LANG_PROP,
        },
        required: ['slug'],
      },
      annotations: readOnly,
      async execute(args) {
        const list = data.projects[langOf(args)];
        const slug = str(args, 'slug');
        const found = list.find((p) => p.slug === slug);
        if (!found) {
          return fail(
            `Project "${slug ?? ''}" not found. Available: ${list.map((p) => p.slug).join(', ')}`,
          );
        }
        return ok(found);
      },
    },
    {
      name: 'get_profile',
      description: "Get Mario Vizcaino's professional profile: bio, role, stack, services, experience.",
      inputSchema: { type: 'object', properties: { lang: LANG_PROP } },
      annotations: readOnly,
      async execute(args) {
        return ok(data.profiles[langOf(args)]);
      },
    },
    {
      name: 'get_contact',
      description: 'Get contact details for Mario Vizcaino: email, social profiles and CV link.',
      inputSchema: { type: 'object', properties: {} },
      annotations: readOnly,
      async execute() {
        const p = data.profiles[DEFAULT_LOCALE];
        return ok({ ...p.contact, ...(p.cv ? { cv: abs(p.cv) } : {}) });
      },
    },
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `make test-unit`
Expected: PASS.

- [ ] **Step 5: Create `src/scripts/webmcp.ts`**

```ts
import { createTools, pickModelContext } from '../lib/webmcp-tools';
import type { SiteData } from '../lib/types';

async function registerWebMcpTools() {
  const mc = pickModelContext(document, navigator);
  if (!mc) return;

  const el = document.getElementById('webmcp-data');
  if (!el?.textContent) return;

  let data: SiteData;
  try {
    data = JSON.parse(el.textContent) as SiteData;
  } catch {
    return;
  }

  for (const tool of createTools(data)) {
    try {
      // Current spec returns a Promise; older Chrome builds return synchronously.
      await Promise.resolve(mc.registerTool(tool));
    } catch {
      // Duplicate registration or API mismatch: ignore, the page works without it.
    }
  }
}

void registerWebMcpTools();
```

- [ ] **Step 6: Modify `src/layouts/BaseLayout.astro`**

Add to the frontmatter imports:

```ts
import { getSiteData } from '../lib/site-data';
import { safeJson } from '../lib/seo';
```

Add after `const profile = await getProfile(lang);`:

```ts
const siteData = await getSiteData(Astro.site!);
const originTrialToken = import.meta.env.PUBLIC_WEBMCP_OT_TOKEN;
```

Add inside `<head>`, right after the favicon `<link>`:

```astro
{originTrialToken && <meta http-equiv="origin-trial" content={originTrialToken} />}
```

Add just before `</body>`:

```astro
<script type="application/json" id="webmcp-data" set:html={safeJson(siteData)} />
<script>
  import '../scripts/webmcp.ts';
</script>
```

- [ ] **Step 7: Create `.env.example`**

```bash
# Optional: Chrome origin-trial token for WebMCP (https://developer.chrome.com/origintrials).
# Copy to .env (gitignored) locally; in CI set it as a repository variable.
PUBLIC_WEBMCP_OT_TOKEN=
```

- [ ] **Step 8: Verify**

Run: `make check && make build`
Expected: `0 errors`.

Run: `grep -c 'id="webmcp-data"' dist/index.html` → `1`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(ai): expose read-only WebMCP tools with feature detection

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: End-to-end tests, Lighthouse, OG image

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/site.spec.ts`, `scripts/lighthouse.mjs`, `scripts/og-image.mjs`, `public/og-default.png` (generated)

**Interfaces:**
- Consumes: everything above; `data-testid` hooks from Tasks 5–7; `#webmcp-data` contract from Task 9.
- Produces: `make test-e2e`, `make lighthouse` (writes `reports/*.html`, exits 1 if any category < 95), `make og`.

- [ ] **Step 1: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

const PORT = 4322;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `npx astro preview --host 0.0.0.0 --port ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

- [ ] **Step 2: Write `tests/e2e/site.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

const SITE = 'https://mariovzc.github.io';

test.describe('home', () => {
  test('english home has SEO essentials', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toContainText('Mario Vizcaino');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}/`);
    await expect(page.locator('link[hreflang="es"]')).toHaveAttribute('href', `${SITE}/es/`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\//);
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.map((s) => JSON.parse(s)['@type'])).toEqual(['Person', 'WebSite']);
  });

  test('spanish home', async ({ page }) => {
    await page.goto('/es/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}/es/`);
    await expect(page.getByRole('heading', { name: 'Proyectos destacados' })).toBeVisible();
  });

  test('no CV link when profile has no cv', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('cv-link')).toHaveCount(0);
  });
});

test.describe('projects', () => {
  test('language switch keeps the same project', async ({ page }) => {
    await page.goto('/projects/sample-full/');
    await page.getByTestId('lang-switch').click();
    await expect(page).toHaveURL(/\/es\/projects\/sample-full\/$/);
    await expect(page.locator('h1')).toHaveText('Proyecto completo de ejemplo');
  });

  test('missing translation falls back with notice and canonical', async ({ page }) => {
    await page.goto('/es/projects/sample-en-only/');
    await expect(page.getByTestId('fallback-notice')).toBeVisible();
    await expect(page.locator('h1')).toHaveText('Sample English-only Project');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${SITE}/projects/sample-en-only/`,
    );
    await expect(page.locator('link[hreflang="es"]')).toHaveCount(0);
  });

  test('project with only required fields has no empty sections', async ({ page }) => {
    await page.goto('/projects/sample-en-only/');
    await expect(page.getByTestId('project-live')).toHaveCount(0);
    await expect(page.getByTestId('project-repo')).toHaveCount(0);
    await expect(page.getByTestId('project-gallery')).toHaveCount(0);
  });

  test('full project shows links, gallery and next/prev', async ({ page }) => {
    await page.goto('/projects/sample-full/');
    await expect(page.getByTestId('project-live')).toBeVisible();
    await expect(page.getByTestId('project-repo')).toBeVisible();
    await page.getByTestId('project-gallery').getByRole('button').first().click();
    await expect(page.locator('dialog[open]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    await expect(page.getByTestId('project-next')).toHaveAttribute(
      'href',
      '/projects/sample-en-only/',
    );
  });
});

test.describe('theme', () => {
  test('follows system preference on first visit', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await ctx.close();
  });

  test('toggle persists across reloads', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('works when localStorage is blocked', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new Error('blocked');
        },
      });
    });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    expect(errors).toEqual([]);
  });
});

test.describe('site files', () => {
  test('every internal link resolves', async ({ page, request }) => {
    const seen = new Set<string>();
    for (const start of ['/', '/es/', '/projects/sample-full/', '/es/projects/sample-en-only/']) {
      await page.goto(start);
      const hrefs = await page
        .locator('a[href^="/"]')
        .evaluateAll((as) => as.map((a) => a.getAttribute('href')!.split('#')[0]!));
      hrefs.forEach((h) => seen.add(h));
    }
    for (const href of seen) {
      const res = await request.get(href);
      expect(res.status(), href).toBe(200);
    }
  });

  test('unknown page returns the 404 page', async ({ request }) => {
    const res = await request.get('/does-not-exist/');
    expect(res.status()).toBe(404);
    expect(await res.text()).toContain('Page not found');
  });

  test('llms.txt, robots.txt and sitemap', async ({ request }) => {
    const llms = await request.get('/llms.txt');
    expect(llms.status()).toBe(200);
    expect(await llms.text()).toMatch(/^# Mario Vizcaino/);

    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('User-agent: ClaudeBot');

    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    expect(sitemap).toContain(`${SITE}/projects/sample-en-only/`);
    expect(sitemap).not.toContain(`${SITE}/es/projects/sample-en-only/`);
  });
});

test.describe('webmcp', () => {
  test('registers tools when document.modelContext exists', async ({ page }) => {
    await page.addInitScript(() => {
      const tools: { name: string; execute: (a?: unknown) => Promise<unknown> }[] = [];
      (window as unknown as { __tools: typeof tools }).__tools = tools;
      Object.defineProperty(document, 'modelContext', {
        value: { registerTool: async (t: (typeof tools)[number]) => void tools.push(t) },
      });
    });
    await page.goto('/');
    await expect
      .poll(() => page.evaluate(() => (window as any).__tools.map((t: any) => t.name)))
      .toEqual(['list_projects', 'get_project', 'get_profile', 'get_contact']);
    const text = await page.evaluate(async () => {
      const r = await (window as any).__tools[0].execute({});
      return r.content[0].text as string;
    });
    expect(JSON.parse(text).map((p: { slug: string }) => p.slug)).toContain('sample-full');
  });

  test('no errors when WebMCP is unsupported', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    expect(errors).toEqual([]);
  });
});
```

- [ ] **Step 3: Run e2e tests**

Run: `make test-e2e`
Expected: all tests PASS. If one fails, fix the component it points to (not the test) unless the test contradicts the spec.

- [ ] **Step 4: Create `scripts/og-image.mjs`**

```js
// Renders public/og-default.png (1200x630) with Playwright's Chromium. Run via `make og`.
import { chromium } from '@playwright/test';

const html = `<!doctype html><html><body style="margin:0">
<div style="width:1200px;height:630px;box-sizing:border-box;padding:80px;background:#f6f3ee;
  color:#1b1a17;font-family:Georgia,'Times New Roman',serif;display:flex;flex-direction:column;justify-content:space-between">
  <div style="font-family:system-ui,sans-serif;font-size:28px;color:#6b665d;letter-spacing:4px;text-transform:uppercase">Full-stack developer</div>
  <div>
    <div style="font-size:112px;line-height:1">Mario Vizcaino</div>
    <div style="font-size:52px;font-style:italic;color:#c2410c;margin-top:24px">Software that feels simple.</div>
  </div>
  <div style="font-family:system-ui,sans-serif;font-size:26px;color:#6b665d">mariovzc.github.io</div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.screenshot({ path: 'public/og-default.png' });
await browser.close();
console.log('Wrote public/og-default.png');
```

- [ ] **Step 5: Generate the OG image**

Run: `make og`
Expected: `Wrote public/og-default.png`; open the file and confirm it shows the name and headline.

- [ ] **Step 6: Create `scripts/lighthouse.mjs`**

```js
// Lighthouse audit of the production build. Run via `make lighthouse` (inside the e2e container).
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

const PORT = 4323;
const BASE = `http://localhost:${PORT}`;
const PAGES = ['/', '/es/', '/projects/sample-full/'];
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const MIN = 0.95;

const server = spawn('npx', ['astro', 'preview', '--host', '0.0.0.0', '--port', String(PORT)], {
  stdio: 'ignore',
});

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('Preview server did not start');
}

let failed = false;
let chrome;
try {
  await waitForServer();
  chrome = await chromeLauncher.launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
  });
  mkdirSync('reports', { recursive: true });

  for (const path of PAGES) {
    const result = await lighthouse(`${BASE}${path}`, {
      port: chrome.port,
      output: 'html',
      logLevel: 'error',
      onlyCategories: CATEGORIES,
    });
    const name = path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '-');
    writeFileSync(`reports/${name}.html`, result.report);
    const scores = CATEGORIES.map((c) => [c, result.lhr.categories[c].score]);
    console.log(path, Object.fromEntries(scores.map(([c, s]) => [c, Math.round(s * 100)])));
    if (scores.some(([, s]) => s < MIN)) failed = true;
  }
} finally {
  await chrome?.kill();
  server.kill();
}

if (failed) {
  console.error(`Some scores are below ${MIN * 100}. See reports/.`);
  process.exit(1);
}
```

- [ ] **Step 7: Run Lighthouse**

Run: `make lighthouse`
Expected: three lines of scores, all ≥ 95; `reports/home.html`, `reports/es.html`, `reports/projects-sample-full.html` exist. If a score is below 95, open its report, fix the reported issue (typical: contrast, missing `alt`, image sizes), re-run.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "test: add Playwright e2e suite, Lighthouse audit and OG image generator

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: CI deploy workflow and agent/human docs

**Files:**
- Create: `.github/workflows/deploy.yml`, `AGENTS.md`, `CLAUDE.md`, `README.md`

**Interfaces:**
- Consumes: npm scripts `check`, `test:unit`, `build` (Task 1).

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      ASTRO_TELEMETRY_DISABLED: '1'
      PUBLIC_WEBMCP_OT_TOKEN: ${{ vars.PUBLIC_WEBMCP_OT_TOKEN }}
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run check
      - run: npm run test:unit
      - run: npm run build
      - uses: actions/upload-pages-artifact@v5
        if: github.event_name != 'pull_request'
        with:
          path: dist

  deploy:
    if: github.event_name != 'pull_request' && github.ref == 'refs/heads/master'
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: Create `AGENTS.md`**

````markdown
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

## Layout

- `src/content/projects/{en,es}/<slug>.mdx` — one file per project per language; same slug links translations. Schema in `src/content.config.ts`.
- `src/content/profile/{en,es}.yaml` — bio, services, experience, stack, contact, optional `cv`.
- `src/i18n/{en,es}.json` — UI strings; keys must match in both files (unit test enforces it).
- `src/lib/` — `projects.ts` (localization/fallback), `seo.ts`, `llms.ts`, `robots.ts`, `theme.ts`, `webmcp-tools.ts`, `site-data.ts` (only file that reads collections).
- `src/views/` — page bodies shared by EN/ES routes in `src/pages/`.
- Design tokens in `src/styles/global.css` (B1 Editorial light: warm off-white, Fraunces + Inter, terracotta accent).

## Common tasks

- **Add a project:** create `src/content/projects/en/<slug>.mdx` (and optionally `es/<slug>.mdx`), put images in `src/assets/projects/<slug>/`, run `make check && make test`. A missing ES file falls back to EN automatically.
- **Hide a project:** `draft: true`. Drafts are still visible in the public GitHub repo.
- **Add a UI string:** add the key to both `en.json` and `es.json`.
- **Change domain:** update `SITE` in `astro.config.mjs`, add `public/CNAME`, configure DNS (see README).

## AI surfaces

- `/llms.txt` — generated from content (`src/lib/llms.ts`).
- JSON-LD in `src/components/astro/SEO.astro`.
- WebMCP read-only tools (`src/lib/webmcp-tools.ts`, registered by `src/scripts/webmcp.ts`). The API is experimental; detection supports `document.modelContext` and `navigator.modelContext`.
````

- [ ] **Step 3: Create `CLAUDE.md`**

```markdown
@AGENTS.md
```

- [ ] **Step 4: Create `README.md`**

````markdown
# mariovzc.github.io

Personal portfolio — Astro 7, React islands, Tailwind 4. English at `/`, Spanish at `/es/`.

## Requirements

Only Docker (Desktop) and `make`. Nothing else is installed on the host.

## Getting started

```bash
make install   # build the dev image and install dependencies in a Docker volume
make dev       # http://localhost:4321 with hot reload
```

| Command | What it does |
|---|---|
| `make dev` / `make stop` | Start / stop the dev server |
| `make build` / `make preview` | Production build / serve it on :4321 |
| `make check` | Types, content schemas, formatting |
| `make test` | Unit (Vitest) + browser (Playwright) tests |
| `make lighthouse` | Lighthouse audit (≥ 95 target), reports in `reports/` |
| `make og` | Regenerate `public/og-default.png` |
| `make add pkg="name"` | Add a dependency inside the container |
| `make clean` | Remove containers, volumes and build output |

## Content

- Projects: `src/content/projects/{en,es}/<slug>.mdx`
- Profile: `src/content/profile/{en,es}.yaml`
- UI strings: `src/i18n/{en,es}.json`

## Deploy

Push to `master` → GitHub Actions validates, tests, builds and publishes to GitHub Pages. If any step fails nothing is published.

Optional: set repository variable `PUBLIC_WEBMCP_OT_TOKEN` (Chrome origin trial for WebMCP).

## Custom domain (later)

1. Change `SITE` in `astro.config.mjs`.
2. Add `public/CNAME` containing the domain.
3. Point DNS to GitHub Pages and set the domain in *Settings → Pages*.

## Previous version

The 2018 site is preserved at tag `v1-2018`.
````

- [ ] **Step 5: Verify locally what CI runs**

Run: `make format && make check && make test-unit && make build`
Expected: all succeed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "ci: deploy to GitHub Pages; docs: add AGENTS.md, CLAUDE.md and README

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 7: Final verification before handing back**

Run: `make clean && make install && make check && make test && make lighthouse`
Expected: everything passes on a clean volume. Report results to the user; **do not push or merge** until they approve.
