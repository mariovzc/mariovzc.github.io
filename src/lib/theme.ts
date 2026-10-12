export const THEME_KEY = 'theme';
export type Theme = 'light' | 'dark';

/** Keep in sync with the inline script in BaseLayout.astro (it cannot import modules). */
export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersDark ? 'dark' : 'light';
}
