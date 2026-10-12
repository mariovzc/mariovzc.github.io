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
