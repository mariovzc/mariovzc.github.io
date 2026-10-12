import { describe, expect, it } from 'vitest';
import {
  absoluteUrl,
  buildAlternates,
  canonicalFor,
  personJsonLd,
  projectJsonLd,
  safeJson,
  truncateText,
  websiteJsonLd,
} from '../../src/lib/seo';
import type { ProfileData, ProjectSummary } from '../../src/lib/types';

const SITE = 'https://mariovzc.github.io/';

const profile: ProfileData = {
  name: 'Mario Vizcaino',
  headline: 'h',
  role: 'Full-stack developer',
  bio: 'bio',
  services: [{ title: 's', description: 'd' }],
  experience: [],
  education: [],
  certifications: [],
  highlights: [],
  stack: { frontend: [], backend: [], tools: [] },
  contact: { email: 'a@b.co', github: 'https://github.com/mariovzc' },
};

describe('urls', () => {
  it('absoluteUrl', () => {
    expect(absoluteUrl(SITE, '/es/projects/x/')).toBe('https://mariovzc.github.io/es/projects/x/');
  });

  it('canonical is the page itself when content exists in that locale', () => {
    expect(
      canonicalFor({ site: SITE, path: '/projects/x/', lang: 'es', translations: ['en', 'es'] }),
    ).toBe('https://mariovzc.github.io/es/projects/x/');
  });

  it('canonical of a fallback page points to the original locale', () => {
    expect(
      canonicalFor({ site: SITE, path: '/projects/x/', lang: 'es', translations: ['en'] }),
    ).toBe('https://mariovzc.github.io/projects/x/');
  });

  it('alternates list only real translations plus x-default', () => {
    expect(buildAlternates({ site: SITE, path: '/', translations: ['en', 'es'] })).toEqual([
      { hreflang: 'en', href: 'https://mariovzc.github.io/' },
      { hreflang: 'es', href: 'https://mariovzc.github.io/es/' },
      { hreflang: 'x-default', href: 'https://mariovzc.github.io/' },
    ]);
    expect(buildAlternates({ site: SITE, path: '/projects/x/', translations: ['en'] })).toEqual([
      { hreflang: 'en', href: 'https://mariovzc.github.io/projects/x/' },
      { hreflang: 'x-default', href: 'https://mariovzc.github.io/projects/x/' },
    ]);
  });
});

describe('json-ld', () => {
  it('person includes sameAs only for defined profiles', () => {
    const p = personJsonLd(profile, SITE);
    expect(p['@type']).toBe('Person');
    expect(p.name).toBe('Mario Vizcaino');
    expect(p.jobTitle).toBe('Full-stack developer');
    expect(p.sameAs).toEqual(['https://github.com/mariovzc']);
  });

  it('person omits alumniOf and hasCredential when empty', () => {
    const p = personJsonLd(profile, SITE);
    expect(p).not.toHaveProperty('alumniOf');
    expect(p).not.toHaveProperty('hasCredential');
  });

  it('person adds deduplicated alumniOf and hasCredential', () => {
    const p = personJsonLd(
      {
        ...profile,
        education: [
          { institution: 'Uni', degree: 'A', start: '2010', end: '2012' },
          { institution: 'Uni', degree: 'B', start: '2013' },
          { institution: 'Other', degree: 'C', start: '2014' },
        ],
        certifications: [{ name: 'Cert', issuer: 'Org', year: '2024' }],
      },
      SITE,
    );
    expect(p.alumniOf).toEqual([
      { '@type': 'EducationalOrganization', name: 'Uni' },
      { '@type': 'EducationalOrganization', name: 'Other' },
    ]);
    expect(p.hasCredential).toEqual([
      {
        '@type': 'EducationalOccupationalCredential',
        name: 'Cert',
        recognizedBy: { '@type': 'Organization', name: 'Org' },
      },
    ]);
  });

  it('website', () => {
    const w = websiteJsonLd(profile, SITE);
    expect(w['@type']).toBe('WebSite');
    expect(w.url).toBe(SITE);
    expect(w.inLanguage).toEqual(['en', 'es']);
  });

  it('project', () => {
    const summary: ProjectSummary = {
      slug: 'x',
      title: 'X',
      summary: 'sum',
      year: 2025,
      role: 'r',
      stack: ['React', 'Node.js'],
      tags: [],
      url: `${SITE}projects/x/`,
      links: {},
      confidential: false,
      contentLang: 'en',
    };
    const j = projectJsonLd(summary, profile);
    expect(j['@type']).toBe('CreativeWork');
    expect(j.keywords).toBe('React, Node.js');
    expect(j.inLanguage).toBe('en');
    expect((j.author as Record<string, unknown>).name).toBe('Mario Vizcaino');
  });
});

describe('safeJson', () => {
  it('cannot close the surrounding script tag', () => {
    const out = safeJson({ title: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script');
    expect(out).not.toContain('<');
    expect(JSON.parse(out)).toEqual({ title: '</script><script>alert(1)</script>' });
  });
});

describe('truncateText', () => {
  it('returns short text unchanged', () => {
    expect(truncateText('hello world', 20)).toBe('hello world');
  });
  it('cuts at a word boundary and appends an ellipsis within the limit', () => {
    const out = truncateText('alpha beta gamma delta', 14);
    expect(out).toBe('alpha beta…');
    expect(out.length).toBeLessThanOrEqual(14);
  });
  it('hard-cuts a single long word', () => {
    expect(truncateText('abcdefghij', 5)).toBe('abcd…');
  });
});
