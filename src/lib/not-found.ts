export type NotFoundLang = 'en' | 'es';

/** Keep in sync with the inline script in src/views/NotFoundPage.astro (it cannot import modules). */
export function notFoundLang(pathname: string): NotFoundLang {
  return pathname === '/es' || pathname.startsWith('/es/') ? 'es' : 'en';
}
