import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { fallbackUrls, isDraftSource } from '../../src/lib/sitemap';

const SITE = 'https://example.com';
const f = (lang: 'en' | 'es', slug: string, draft = false) => ({ lang, slug, draft });

describe('fallbackUrls', () => {
  it('flags the ES page when the ES file is missing', () => {
    expect([...fallbackUrls(SITE, [f('en', 'a')])]).toEqual([`${SITE}/es/projects/a/`]);
  });
  it('flags the EN page when only ES exists', () => {
    expect([...fallbackUrls(SITE, [f('es', 'a')])]).toEqual([`${SITE}/projects/a/`]);
  });
  it('treats an ES draft as missing', () => {
    expect([...fallbackUrls(SITE, [f('en', 'a'), f('es', 'a', true)])]).toEqual([
      `${SITE}/es/projects/a/`,
    ]);
  });
  it('treats an EN draft as missing', () => {
    expect([...fallbackUrls(SITE, [f('en', 'a', true), f('es', 'a')])]).toEqual([
      `${SITE}/projects/a/`,
    ]);
  });
  it('has no fallbacks when both are published', () => {
    expect(fallbackUrls(SITE, [f('en', 'a'), f('es', 'a')]).size).toBe(0);
  });
  it('ignores slugs that are drafts in every locale', () => {
    expect(fallbackUrls(SITE, [f('en', 'a', true), f('es', 'a', true)]).size).toBe(0);
  });
});

describe('project file names', () => {
  it('are lowercase kebab-case so slugs match the glob loader', () => {
    for (const root of ['src/content', 'tests/fixtures/content']) {
      for (const lang of ['en', 'es']) {
        const dir = `${root}/projects/${lang}`;
        for (const file of readdirSync(dir)) {
          expect(file, `${dir}/${file}`).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*\.mdx$/);
        }
      }
    }
  });
});

describe('isDraftSource', () => {
  const mdx = (fm: string) => `---\ntitle: X\n${fm}\n---\n\nBody with draft: true in the text.\n`;

  it('detects draft: true', () => {
    expect(isDraftSource(mdx('draft: true'))).toBe(true);
  });

  it('tolerates a trailing comment and YAML casing', () => {
    expect(isDraftSource(mdx('draft: true # hide for now'))).toBe(true);
    expect(isDraftSource(mdx('draft: True'))).toBe(true);
  });

  it('is false for draft: false, a missing key, or "draft" only in the body', () => {
    expect(isDraftSource(mdx('draft: false # keep'))).toBe(false);
    expect(isDraftSource(mdx('featured: true'))).toBe(false);
  });
});
