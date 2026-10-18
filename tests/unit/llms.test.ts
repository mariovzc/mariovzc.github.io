import { describe, expect, it } from 'vitest';
import { buildComingSoonLlmsTxt, buildLlmsTxt } from '../../src/lib/llms';
import type { ProfileData, SiteData } from '../../src/lib/types';

const profile: ProfileData = {
  name: 'Mario Vizcaino',
  headline: 'Software that feels simple.',
  role: 'Full-stack developer',
  bio: 'I build web products.',
  services: [{ title: 'Web apps', description: 'React apps.' }],
  experience: [],
  education: [],
  certifications: [],
  heroFacts: [],
  alternateNames: [],
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
        confidential: false,
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

  it('marks confidential projects in the project bullet only', () => {
    const conf = {
      ...data,
      projects: {
        ...data.projects,
        en: [
          { ...data.projects.en[0]!, confidential: true },
          { ...data.projects.en[0]!, slug: 'y', title: 'Project Y' },
        ],
      },
    };
    const out = buildLlmsTxt(conf);
    expect(out).toContain('(2025; React, Node.js) (confidential, anonymized)');
    expect(out).toMatch(/\[Project Y\].*React, Node\.js\)\n/);
  });

  it('links the Spanish version under Optional', () => {
    expect(txt).toContain('## Optional\n\n- [Versión en español](https://mariovzc.github.io/es/)');
  });

  it('omits sections with no content', () => {
    const empty = buildLlmsTxt({ ...data, projects: { en: [], es: [] } });
    expect(empty).not.toContain('## Projects');
  });

  it('lists education and certifications only when present', () => {
    expect(txt).not.toContain('## Education');
    expect(txt).not.toContain('## Certifications');
    const full = buildLlmsTxt({
      ...data,
      profiles: {
        ...data.profiles,
        en: {
          ...profile,
          education: [{ institution: 'Uni', degree: 'B.S. Systems', start: '2010', end: '2015' }],
          certifications: [
            { name: 'Cert A', issuer: 'Org', year: '2024', url: 'https://example.com/a' },
            { name: 'Cert B', issuer: 'Org2', year: '2023' },
          ],
        },
      },
    });
    expect(full).toContain('## Education\n\n- B.S. Systems, Uni (2010–2015)');
    expect(full).toContain(
      '## Certifications\n\n- Cert A — Org (2024) https://example.com/a\n- Cert B — Org2 (2023)',
    );
    expect(full.indexOf('## Projects')).toBeLessThan(full.indexOf('## Education'));
    expect(full.indexOf('## Certifications')).toBeLessThan(full.indexOf('## Contact'));
  });
});

describe('buildComingSoonLlmsTxt', () => {
  const txt = buildComingSoonLlmsTxt(profile);

  it('has name, role and the coming-soon note', () => {
    expect(txt.startsWith('# Mario Vizcaino\n')).toBe(true);
    expect(txt).toContain('> Full-stack developer');
    expect(txt).toContain('Portfolio coming soon');
  });

  it('lists only the contact links that exist', () => {
    expect(txt).toContain('- Email: a@b.co');
    expect(txt).toContain('- GitHub: https://github.com/mariovzc');
    expect(txt).not.toContain('LinkedIn');
  });

  it('does not leak bio, services or projects', () => {
    expect(txt).not.toContain('I build web products.');
    expect(txt).not.toContain('## Services');
    expect(txt).not.toContain('## Projects');
  });
});
