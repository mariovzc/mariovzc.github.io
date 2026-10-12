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
