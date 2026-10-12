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
