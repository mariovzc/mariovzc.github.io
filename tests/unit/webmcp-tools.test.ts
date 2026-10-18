import { describe, expect, it } from 'vitest';
import { createTools, pickModelContext, type ToolDef } from '../../src/lib/webmcp-tools';
import type { ProfileData, ProjectSummary, SiteData } from '../../src/lib/types';

const profile: ProfileData = {
  name: 'Mario Vizcaino',
  headline: 'h',
  role: 'Full-stack developer',
  bio: 'bio',
  services: [{ title: 'Web apps', description: 'd' }],
  experience: [],
  education: [],
  certifications: [],
  heroFacts: [],
  alternateNames: [],
  stack: { frontend: ['React'], backend: [], tools: [] },
  contact: { email: 'a@b.co', github: 'https://github.com/mariovzc' },
};

const project = (slug: string, stack: string[], tags: string[] = []): ProjectSummary => ({
  slug,
  title: slug.toUpperCase(),
  summary: `${slug} summary`,
  year: 2025,
  role: 'Lead',
  stack,
  tags,
  url: `https://mariovzc.github.io/projects/${slug}/`,
  links: {},
  confidential: false,
  contentLang: 'en',
});

const data: SiteData = {
  site: 'https://mariovzc.github.io/',
  profiles: { en: profile, es: { ...profile, role: 'Desarrollador full-stack' } },
  projects: {
    en: [project('alpha', ['React', 'Node.js'], ['web']), project('beta', ['Astro'])],
    es: [{ ...project('alpha', ['React']), title: 'ALFA' }],
  },
};

const tools = createTools(data);
const tool = (name: string) => tools.find((x) => x.name === name) as ToolDef;
const json = async (name: string, args?: Record<string, unknown>) =>
  JSON.parse((await tool(name).execute(args)).content[0]!.text);

describe('createTools', () => {
  it('defines four read-only tools with JSON schemas', () => {
    expect(tools.map((x) => x.name)).toEqual([
      'list_projects',
      'get_project',
      'get_profile',
      'get_contact',
    ]);
    for (const x of tools) {
      expect(x.description.length).toBeGreaterThan(10);
      expect(x.inputSchema.type).toBe('object');
      expect(x.annotations.readOnlyHint).toBe(true);
    }
  });

  it('list_projects defaults to English and filters by stack/tag case-insensitively', async () => {
    expect((await json('list_projects')).map((p: ProjectSummary) => p.slug)).toEqual([
      'alpha',
      'beta',
    ]);
    expect(
      (await json('list_projects', { stack: 'react' })).map((p: ProjectSummary) => p.slug),
    ).toEqual(['alpha']);
    expect((await json('list_projects', { tag: 'WEB' })).length).toBe(1);
  });

  it('list_projects exposes the confidential flag', async () => {
    const list = await json('list_projects');
    expect(list.every((p: ProjectSummary) => p.confidential === false)).toBe(true);
  });

  it('list_projects honours lang and ignores invalid lang', async () => {
    expect((await json('list_projects', { lang: 'es' }))[0].title).toBe('ALFA');
    expect((await json('list_projects', { lang: 'fr' })).length).toBe(2);
  });

  it('get_project returns a project or a helpful error', async () => {
    expect((await json('get_project', { slug: 'beta' })).title).toBe('BETA');
    const missing = await tool('get_project').execute({ slug: 'nope' });
    expect(missing.isError).toBe(true);
    expect(missing.content[0]!.text).toContain('alpha, beta');
  });

  it('get_profile and get_contact', async () => {
    expect((await json('get_profile', { lang: 'es' })).role).toBe('Desarrollador full-stack');
    expect(await json('get_contact')).toEqual({
      email: 'a@b.co',
      github: 'https://github.com/mariovzc',
    });
  });
});

describe('pickModelContext', () => {
  const mc = { registerTool: () => undefined };

  it('prefers document.modelContext', () => {
    const other = { registerTool: () => undefined };
    expect(pickModelContext({ modelContext: mc }, { modelContext: other })).toBe(mc);
  });

  it('falls back to navigator.modelContext', () => {
    expect(pickModelContext({}, { modelContext: mc })).toBe(mc);
  });

  it('returns undefined when unsupported or malformed', () => {
    expect(pickModelContext({}, {})).toBeUndefined();
    expect(pickModelContext({ modelContext: {} }, undefined)).toBeUndefined();
  });
});
