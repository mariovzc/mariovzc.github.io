/**
 * Coming-soon mode: production shows only a placeholder home page until the full
 * site launches. Enabled at build time with PUBLIC_COMING_SOON='true' (exact match).
 */
export function isComingSoon(env: Record<string, string | undefined>): boolean {
  return env.PUBLIC_COMING_SOON === 'true';
}

/** Sitemap filter for coming-soon mode: only the EN and ES home pages. */
export function comingSoonSitemapAllows(page: string, site: string): boolean {
  return page === new URL('/', site).href || page === new URL('/es/', site).href;
}
