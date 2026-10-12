import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { contentRoot } from './src/lib/content-root.ts';
import { fallbackUrls } from './src/lib/sitemap.ts';
import { comingSoonSitemapAllows, isComingSoon } from './src/lib/site-mode.ts';

const SITE = 'https://mariovzc.github.io';

// Project file names must be lowercase kebab-case (enforced by a unit test), so the
// file name equals the glob-loader slug.
function projectFiles() {
  return ['en', 'es'].flatMap((lang) => {
    const dir = `./${contentRoot()}/projects/${lang}`;
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => {
        const head = readFileSync(`${dir}/${f}`, 'utf8').split(/^---\s*$/m)[1] ?? '';
        return {
          lang,
          slug: f.replace(/\.mdx$/, ''),
          draft: /^draft:\s*true\s*$/m.test(head),
        };
      });
  });
}

// Pages that only exist as a fallback (other locale's content) are canonicalized
// to the original and must not appear in the sitemap.
const excluded = fallbackUrls(SITE, projectFiles());
// Coming-soon mode (PUBLIC_COMING_SOON='true', set in deploy.yml) publishes only the home pages.
const soon = isComingSoon(process.env);

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  // Sample/placeholder covers are repo-owned SVGs; sharp rasterizes them to WebP/PNG, which needs this flag. Drop once all project images are raster.
  image: { dangerouslyProcessSVG: true },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) =>
        soon ? comingSoonSitemapAllows(page, SITE) : !excluded.has(page) && !page.includes('/404'),
      i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es' } },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    // File events from macOS bind mounts are unreliable inside Docker.
    server: { watch: { usePolling: process.env.DOCKER === '1' } },
  },
});
