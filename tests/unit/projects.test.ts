import { describe, expect, it } from 'vitest';
import {
  adjacentProjects,
  featuredProjects,
  localizeProjects,
  parseProjectId,
} from '../../src/lib/projects';

type Fake = {
  id: string;
  data: { year: number; featured: boolean; order: number; draft: boolean; title: string };
};

const entry = (id: string, over: Partial<Fake['data']> = {}): Fake => ({
  id,
  data: { year: 2024, featured: false, order: 100, draft: false, title: id, ...over },
});

describe('parseProjectId', () => {
  it('splits locale folder and slug', () => {
    expect(parseProjectId('en/my-app')).toEqual({ lang: 'en', slug: 'my-app' });
    expect(parseProjectId('es/my-app')).toEqual({ lang: 'es', slug: 'my-app' });
  });

  it('throws on ids outside a locale folder', () => {
    expect(() => parseProjectId('my-app')).toThrow(/en\/ or es\//);
    expect(() => parseProjectId('fr/my-app')).toThrow(/en\/ or es\//);
  });
});

describe('localizeProjects', () => {
  const entries = [
    entry('en/both', { order: 2 }),
    entry('es/both', { order: 2, title: 'ambos' }),
    entry('en/en-only', { order: 1 }),
    entry('es/es-only', { order: 3 }),
    entry('en/hidden', { draft: true }),
  ];

  it('uses the requested locale when it exists', () => {
    const es = localizeProjects(entries, 'es');
    const both = es.find((p) => p.slug === 'both')!;
    expect(both.contentLang).toBe('es');
    expect(both.isFallback).toBe(false);
    expect(both.entry.data.title).toBe('ambos');
    expect(both.translations).toEqual(['en', 'es']);
  });

  it('falls back to the other locale when missing', () => {
    const es = localizeProjects(entries, 'es');
    const enOnly = es.find((p) => p.slug === 'en-only')!;
    expect(enOnly.lang).toBe('es');
    expect(enOnly.contentLang).toBe('en');
    expect(enOnly.isFallback).toBe(true);
    expect(enOnly.translations).toEqual(['en']);

    const en = localizeProjects(entries, 'en');
    expect(en.find((p) => p.slug === 'es-only')!.isFallback).toBe(true);
  });

  it('excludes drafts', () => {
    expect(localizeProjects(entries, 'en').map((p) => p.slug)).not.toContain('hidden');
  });

  it('a draft translation falls back to the published one', () => {
    const list = localizeProjects([entry('en/x'), entry('es/x', { draft: true })], 'es');
    expect(list[0]!.isFallback).toBe(true);
    expect(list[0]!.translations).toEqual(['en']);
  });

  it('sorts by order, then newest year, then slug', () => {
    const list = localizeProjects(
      [
        entry('en/b', { order: 1, year: 2020 }),
        entry('en/a', { order: 1, year: 2020 }),
        entry('en/new', { order: 1, year: 2025 }),
        entry('en/first', { order: 0 }),
      ],
      'en',
    );
    expect(list.map((p) => p.slug)).toEqual(['first', 'new', 'a', 'b']);
  });
});

describe('featuredProjects / adjacentProjects', () => {
  const list = localizeProjects(
    [
      entry('en/a', { order: 1, featured: true }),
      entry('en/b', { order: 2 }),
      entry('en/c', { order: 3, featured: true }),
    ],
    'en',
  );

  it('featured keeps order', () => {
    expect(featuredProjects(list).map((p) => p.slug)).toEqual(['a', 'c']);
  });

  it('adjacent returns neighbours, none at the edges', () => {
    expect(adjacentProjects(list, 'b').prev?.slug).toBe('a');
    expect(adjacentProjects(list, 'b').next?.slug).toBe('c');
    expect(adjacentProjects(list, 'a').prev).toBeUndefined();
    expect(adjacentProjects(list, 'c').next).toBeUndefined();
  });
});
