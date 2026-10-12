import type { SiteData } from './types';

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
      (x) => `- [${x.title}](${x.url}): ${x.summary} (${x.year}; ${x.stack.join(', ')})`,
    );
    sections.push(`## Projects\n\n${items.join('\n')}`);
  }

  const contact = [
    `- Email: ${p.contact.email}`,
    p.contact.github && `- GitHub: ${p.contact.github}`,
    p.contact.linkedin && `- LinkedIn: ${p.contact.linkedin}`,
    p.contact.x && `- X: ${p.contact.x}`,
  ].filter(Boolean);
  sections.push(`## Contact\n\n${contact.join('\n')}`);

  sections.push(
    `## Optional\n\n- [Versión en español](${abs('/es/')}): Spanish version of this site`,
  );

  return `${sections.join('\n\n')}\n`;
}
