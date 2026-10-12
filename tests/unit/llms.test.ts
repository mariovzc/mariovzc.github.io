import { describe, expect, it } from 'vitest';
import { buildLlmsTxt } from '../../src/lib/llms';
import type { ProfileData, SiteData } from '../../src/lib/types';

const profile: ProfileData = {
  name: 'Mario Vizcaino',
  headline: 'Software that feels simple.',
  role: 'Full-stack developer',
  bio: 'I build web products.',
  services: [{ title: 'Web apps', description: 'React apps.' }],
  experience: [],
  stack: { frontend: ['React'], backend: ['Node.js'], tools: [] },
  contact: { email: 'a@b.co', github: 'https://github.com/mariovzc' },
};

const data: SiteData = {
  site: 'https://mariovzc.github.io/',
  profiles: { en: profile, es: { ...profile, role: 'Desarrollador' } },
  projects: {
    en: [
      {
        slug: 'x',
        title: 'Project X',
        summary: 'Does X.',
        year: 2025,
        role: 'Lead',
        stack: ['React', 'Node.js'],
        tags: [],
        url: 'https://mariovzc.github.io/projects/x/',
        links: {},
        contentLang: 'en',
      },
    ],
    es: [],
  },
};

describe('buildLlmsTxt', () => {
  const txt = buildLlmsTxt(data);

  it('starts with an H1 name and a blockquote summary', () => {
    expect(
      txt.startsWith('# Mario Vizcaino\n\n> Full-stack developer. Software that feels simple.\n'),
    ).toBe(true);
  });

  it('lists services, projects with absolute links, and contact', () => {
    expect(txt).toContain('## Services\n\n- **Web apps**: React apps.');
    expect(txt).toContain(
      '- [Project X](https://mariovzc.github.io/projects/x/): Does X. (2025; React, Node.js)',
    );
    expect(txt).toContain('- Email: a@b.co');
    expect(txt).toContain('- GitHub: https://github.com/mariovzc');
    expect(txt).not.toContain('CV');
  });

  it('links the Spanish version under Optional', () => {
    expect(txt).toContain('## Optional\n\n- [Versión en español](https://mariovzc.github.io/es/)');
  });

  it('omits sections with no content', () => {
    const empty = buildLlmsTxt({ ...data, projects: { en: [], es: [] } });
    expect(empty).not.toContain('## Projects');
  });
});
