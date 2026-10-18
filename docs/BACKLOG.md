# Backlog — pending work

Living list of future work for the portfolio. Update it when something is done (move it to **Done** with the
date) or when a new idea comes up. Last reviewed: 2026-10-18.

Priority: **P1** = soon / high impact · **P2** = valuable, not urgent · **P3** = nice to have.

## Launch follow-up

- [ ] **P1 · ~2026-10-25 · Sitemap status** — Search Console → Sitemaps: `sitemap-index.xml?v=2` and
      `sitemap-0.xml` (resubmitted 2026-10-18) should show a "Last read" date, **Success** and 12 discovered
      pages. The files are valid and reachable (checked 2026-10-18); "Couldn't fetch" with an empty "Last read"
      only means Google has not tried yet. If still empty on 10-25: run "Test live URL" on the sitemap and
      search `site:mariovzc.github.io`; the lasting fix is a **Domain** property (DNS TXT in Cloudflare) once
      the custom domain is live.
- [ ] **P1 · 2026-11-08 · Measure name SEO** — Search Console → Performance → Search results → Queries (last
      28 days): look for "mario vizcaino", "mario vizcaino soto", "mario alberto vizcaino soto", "mariovzc"
      (impressions, clicks, position). Repeat the incognito searches for those names and compare with
      2026-10-18 (site, LinkedIn, GitHub positions).
- [ ] **P2 · Refresh social previews** — run the link through LinkedIn Post Inspector; WhatsApp may keep the old
      coming-soon preview for a while (OG images are now content-hashed, so new shares pick up the new one).

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

- [ ] **P3 · Visual QA pass** — manual review on real devices (iOS Safari, Android Chrome) in light and dark mode.

## Tech debt (from code reviews)

- [ ] **P3 · `og-image.mjs` reads `SITE` by regex** — breaks if the constant is renamed; share the value from one
      module instead.
- [ ] **P3 · `lighthouse.mjs` robustness** — handle `spawn` errors, kill the preview process group, add a
      per-request timeout in `waitForServer`.
- [ ] **P3 · Dist collision** — `make test-e2e` (fixture content) and `make build` share `dist/`; consider a
      separate output dir for the fixture build.
- [ ] **P3 · ThemeToggle hydration** — server render shows the "switch to dark" label until hydration (now wrong on first paint, since dark is the default).
- [ ] **P3 · Remove `dangerouslyProcessSVG`** — only needed for the SVG fixture covers; drop it if fixtures move
      to raster images.
- [ ] **P3 · WebMCP** — the API is still an origin trial and changed during 2026 (`navigator` →
      `document.modelContext`); recheck the spec and add the origin-trial token (`PUBLIC_WEBMCP_OT_TOKEN`) if
      Chrome support matures.

## Done

- [x] 2026-10-18 — Branches cleaned up (`redesign`, `design-polish` deleted; only `master`). Author meta tag added.
- [x] 2026-10-18 — Design polish: project covers, portfolio screenshots and OG images in lime on ink;
      "What do you need built?" services picker (tools + proving project + mailto) replaces the icon cards;
      "Have a similar problem?" CTA on project pages; section eyebrows removed; security & quality moved
      from services to an About skills group; ISO 27001 hero fact and bio mention removed.
- [x] 2026-10-18 — Brand: "mv." monogram for favicons/icons; same real photo on LinkedIn, GitHub and Credly;
      LinkedIn banner. `make test-e2e` restores `.astro/` for the real content afterwards.
- [x] 2026-10-18 — Name SEO off-site: LinkedIn name "Mario Alberto Vizcaino Soto" (additional name "Mario Vizcaino", public profile on), GitHub name/bio/website + profile README (repo `mariovzc/mariovzc` linking every project), Credly name + summary (profile linked from the site), Search Console indexing requested for `/` and `/es/`, sitemaps resubmitted.
- [x] 2026-10-18 — Redesign: "lime on ink" palette (dark by default), new home hero (headline + AI pipeline panel with Gemini 2.5 Pro, facts row), bento removed; AI project now says Gemini 2.5 Pro (covers re-rendered).
- [x] 2026-10-18 — Name SEO on-site: `fullName` + `alternateNames` in the profile → JSON-LD `alternateName`, full name in bio, meta description, footer and `llms.txt`.
- [x] 2026-10-18 — `make dev` uses `--ignore-lock` (stale `.astro/dev.json` blocked startup in Docker).
- [x] 2026-10-12 — LinkedIn updated: headline, About (EN/ES), website + Featured link to the portfolio, Alto
      experience (ISO 25010, AI pipeline, background-check platform), new skills.
- [x] 2026-10-12 — Specific icon per service (optional `icon` on each profile service; names in `src/lib/icons.ts`).
- [x] 2026-10-12 — Sitemap draft detection moved to `isDraftSource()` (tolerates `# comments` and YAML casing),
      unit-tested.
- [x] 2026-10-12 — Featured bento tile: optional `cardCover` (square diagram) for the AI project so the
      narrow tile isn't cropped.
- [x] 2026-10-12 — Google Search Console: URL-prefix property verified (meta tag in `BaseLayout.astro`),
      sitemap submitted, indexing requested for `/` and `/es/`.
- [x] 2026-10-12 — Astro 7 rebuild, Bento verde design, EN/ES, SEO, `llms.txt`, WebMCP, Docker + Makefile,
      CI deploy, tests, Lighthouse 99–100.
- [x] 2026-10-12 — Real profile, education, certifications, 5 projects (2 confidential case studies), favicon
      from avatar, custom 404, launch (coming-soon mode off).
