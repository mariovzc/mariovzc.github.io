import { DEFAULT_LOCALE, LOCALES, localizePath, type Locale } from '../i18n/utils';
import type { ProfileData, ProjectSummary } from './types';

export function absoluteUrl(site: string, path: string): string {
  return new URL(path, site).href;
}

export function canonicalFor(o: {
  site: string;
  path: string;
  lang: Locale;
  translations: Locale[];
}): string {
  const target = o.translations.includes(o.lang) ? o.lang : (o.translations[0] ?? DEFAULT_LOCALE);
  return absoluteUrl(o.site, localizePath(o.path, target));
}

export function buildAlternates(o: {
  site: string;
  path: string;
  translations: Locale[];
}): { hreflang: string; href: string }[] {
  const langs = LOCALES.filter((l) => o.translations.includes(l));
  const alternates: { hreflang: string; href: string }[] = langs.map((l) => ({
    hreflang: l,
    href: absoluteUrl(o.site, localizePath(o.path, l)),
  }));
  const fallback = langs.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : langs[0];
  if (fallback) {
    alternates.push({
      hreflang: 'x-default',
      href: absoluteUrl(o.site, localizePath(o.path, fallback)),
    });
  }
  return alternates;
}

export function personJsonLd(profile: ProfileData, site: string): Record<string, unknown> {
  const { github, linkedin, x, credly } = profile.contact;
  const institutions = [...new Set(profile.education.map((e) => e.institution))];
  // Other names people search for (full legal name, partial combinations) → same Person.
  const alternates = [
    ...new Set([profile.fullName, ...profile.alternateNames].filter((n): n is string => !!n)),
  ].filter((n) => n !== profile.name);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    ...(alternates.length && { alternateName: alternates }),
    jobTitle: profile.role,
    description: profile.bio,
    url: site,
    email: `mailto:${profile.contact.email}`,
    sameAs: [github, linkedin, x, credly].filter((v): v is string => Boolean(v)),
    ...(institutions.length && {
      alumniOf: institutions.map((name) => ({ '@type': 'EducationalOrganization', name })),
    }),
    ...(profile.certifications.length && {
      hasCredential: profile.certifications.map((c) => ({
        '@type': 'EducationalOccupationalCredential',
        name: c.name,
        recognizedBy: { '@type': 'Organization', name: c.issuer },
      })),
    }),
  };
}

export function websiteJsonLd(profile: ProfileData, site: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: profile.name,
    url: site,
    inLanguage: [...LOCALES],
  };
}

export function projectJsonLd(p: ProjectSummary, profile: ProfileData): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.title,
    description: p.summary,
    url: p.url,
    dateCreated: String(p.year),
    inLanguage: p.contentLang,
    keywords: p.stack.join(', '),
    author: { '@type': 'Person', name: profile.name },
  };
}

/** JSON that can be embedded inside a <script> element without closing it. */
export function safeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/** Truncates at a word boundary, appending "…"; the result never exceeds `max` characters. */
export function truncateText(text: string, max: number): string {
  if (text.length <= max) return text;
  const room = max - 1;
  const cut = text.slice(0, room + 1);
  const lastSpace = cut.lastIndexOf(' ');
  const head = lastSpace > 0 ? cut.slice(0, lastSpace) : text.slice(0, room);
  return `${head.trimEnd()}…`;
}
