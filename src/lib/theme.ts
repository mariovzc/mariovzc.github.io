export const THEME_KEY = 'theme';
export type Theme = 'light' | 'dark';

/**
 * Dark is the brand default; only an explicit stored "light" switches it.
 * Keep in sync with the inline script in BaseLayout.astro (it cannot import modules).
 */
export function resolveTheme(stored: string | null): Theme {
  return stored === 'light' ? 'light' : 'dark';
}
