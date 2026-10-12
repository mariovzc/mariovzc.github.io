import type { ProfileData, SiteData } from './types';

function contactLines(p: ProfileData): string {
  return [
    `- Email: ${p.contact.email}`,
    p.contact.github && `- GitHub: ${p.contact.github}`,
    p.contact.linkedin && `- LinkedIn: ${p.contact.linkedin}`,
    p.contact.x && `- X: ${p.contact.x}`,
  ]
    .filter(Boolean)
    .join('\n');
}

/** https://llmstxt.org format, English as primary language. */
export function buildLlmsTxt(data: SiteData): string {
  const p = data.profiles.en;
  const abs = (path: string) => new URL(path, data.site).href;
  const sections: string[] = [];

  sections.push(`# ${p.name}\n\n> ${p.role}. ${p.headline}\n\n${p.bio}`);

  if (p.services.length) {
    sections.push(
      `## Services\n\n${p.services.map((s) => `- **${s.title}**: ${s.description}`).join('\n')}`,
    );
  }

  if (data.projects.en.length) {
    const items = data.projects.en.map(
      (x) =>
        `- [${x.title}](${x.url}): ${x.summary} (${x.year}; ${x.stack.join(', ')})${x.confidential ? ' (confidential, anonymized)' : ''}`,
    );
    sections.push(`## Projects\n\n${items.join('\n')}`);
  }

  if (p.education.length) {
    const items = p.education.map(
      (e) => `- ${e.degree}, ${e.institution} (${e.start}${e.end ? `–${e.end}` : ''})`,
    );
    sections.push(`## Education\n\n${items.join('\n')}`);
  }

  if (p.certifications.length) {
    const items = p.certifications.map(
      (c) => `- ${c.name} — ${c.issuer} (${c.year})${c.url ? ` ${c.url}` : ''}`,
    );
    sections.push(`## Certifications\n\n${items.join('\n')}`);
  }

  sections.push(`## Contact\n\n${contactLines(p)}`);

  sections.push(
    `## Optional\n\n- [Versión en español](${abs('/es/')}): Spanish version of this site`,
  );

  return `${sections.join('\n\n')}\n`;
}

/** Minimal llms.txt while the site is in coming-soon mode (see site-mode.ts). */
export function buildComingSoonLlmsTxt(p: ProfileData): string {
  return `# ${p.name}\n\n> ${p.role}\n\nPortfolio coming soon.\n\n## Contact\n\n${contactLines(p)}\n`;
}
