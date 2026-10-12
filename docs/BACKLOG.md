# Backlog — pending work

Living list of future work for the portfolio. Update it when something is done (move it to **Done** with the
date) or when a new idea comes up. Last reviewed: 2026-10-12.

Priority: **P1** = soon / high impact · **P2** = valuable, not urgent · **P3** = nice to have.

## Launch follow-up

- [ ] **P2 · Check indexing** — in a week or two, search `site:mariovzc.github.io` and review Search Console
      (Pages / Sitemaps) for errors. When the custom domain is live, add a **Domain** property verified with a
      DNS TXT record in Cloudflare and resubmit the sitemap.
- [ ] **P1 · LinkedIn update** — new headline ("Senior Full Stack & AI Engineer · Tech Leader | …"), new
      "About" text (EN/ES drafts agreed in the session of 2026-10-12), add the portfolio link to *Featured*,
      add ISO 25010 and the AI project to the Alto experience, add skills (Gemini/Vertex AI, LLMs, Flutter,
      Swift, FastAPI, Airflow, ISO 25010). (Owner action.)
- [ ] **P2 · Refresh social previews** — run the link through LinkedIn Post Inspector; WhatsApp may keep the old
      coming-soon preview for a while (OG images are now content-hashed, so new shares pick up the new one).
- [ ] **P3 · Clean up the remote `redesign` branch** — no longer used (everything is on `master`).

## Custom domain

- [ ] **P1 · Buy the domain on Cloudflare Registrar** — candidates: `mariovizcaino.dev` (recommended) and
      `mariovzc.com` (both looked available on 2026-10-12; `mariovizcaino.com` is taken).
- [ ] **P1 · Point the site to the domain** — `SITE` in `astro.config.mjs`, `SITE` in `tests/e2e/site.spec.ts`,
      `public/CNAME`, DNS records for GitHub Pages, custom domain + "Enforce HTTPS" in *Settings → Pages*,
      then `make og` (the OG images show the domain).
- [ ] **P2 · Domain email** — `hola@<domain>` via Cloudflare Email Routing forwarding to Gmail (optionally send-as
      with Zoho Mail free); then replace `vzcdeveloper@gmail.com` in both profile YAMLs.
- [ ] **P3 · Redirect** — if a second domain is bought (e.g. `mariovzc.com`), redirect it to the main one.

## Sharing & feedback

- [ ] **P2 · Private previews** — Cloudflare Pages connected to the repo for per-branch preview URLs, protected
      with Cloudflare Access (allow-list of emails), to collect feedback before publishing big changes.
      (Local quick tunnels were intentionally not used.)

## Content

- [ ] **P2 · Verification links for certifications** — add `url` to *Software Architecture* (Universidad El
      Bosque) if a public credential link exists. (Advanced React and Python for AI already link to
      Coursera/Credly.)
- [ ] **P2 · Better Bright App visuals** — App Store screenshots only show sign-in/capture/form; replace the
      gallery/cover if screenshots of the smile simulation or the admin panel become available (no patient data).
- [ ] **P3 · More public work** — consider adding a small open-source project (e.g. the Dockerized starters
      `rails_base` / `python_base` / `vue_base`) only if it adds something the current 5 projects don't.
- [ ] **P3 · Blog** — the spec leaves room for `src/content/blog/` + `src/pages/blog/` (articles about AI in real
      workflows, Docker-only workflows, WebMCP). Not started.

## Design & UX

- [ ] **P3 · Service icons** — services reuse a cycling set of generic icons; give each service a specific icon
      (AI, web, mobile, cloud, security, data).
- [ ] **P3 · Visual QA pass** — manual review on real devices (iOS Safari, Android Chrome) in light and dark mode.

## Tech debt (from code reviews)

- [ ] **P2 · Sitemap draft regex** — `astro.config.mjs` reads `draft:` with a regex that misses
      `draft: true # comment`; tolerate trailing comments.
- [ ] **P3 · `og-image.mjs` reads `SITE` by regex** — breaks if the constant is renamed; share the value from one
      module instead.
- [ ] **P3 · `lighthouse.mjs` robustness** — handle `spawn` errors, kill the preview process group, add a
      per-request timeout in `waitForServer`.
- [ ] **P3 · Dist collision** — `make test-e2e` (fixture content) and `make build` share `dist/`; consider a
      separate output dir for the fixture build.
- [ ] **P3 · ThemeToggle hydration** — server render always shows the "switch to dark" label until hydration.
- [ ] **P3 · Remove `dangerouslyProcessSVG`** — only needed for the SVG fixture covers; drop it if fixtures move
      to raster images.
- [ ] **P3 · WebMCP** — the API is still an origin trial and changed during 2026 (`navigator` →
      `document.modelContext`); recheck the spec and add the origin-trial token (`PUBLIC_WEBMCP_OT_TOKEN`) if
      Chrome support matures.

## Done

- [x] 2026-10-12 — Featured bento tile: optional `cardCover` (square diagram) for the AI project so the
      narrow tile isn't cropped.
- [x] 2026-10-12 — Google Search Console: URL-prefix property verified (meta tag in `BaseLayout.astro`),
      sitemap submitted, indexing requested for `/` and `/es/`.
- [x] 2026-10-12 — Astro 7 rebuild, Bento verde design, EN/ES, SEO, `llms.txt`, WebMCP, Docker + Makefile,
      CI deploy, tests, Lighthouse 99–100.
- [x] 2026-10-12 — Real profile, education, certifications, 5 projects (2 confidential case studies), favicon
      from avatar, custom 404, launch (coming-soon mode off).
