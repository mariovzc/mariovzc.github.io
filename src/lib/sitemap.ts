import { LOCALES, localizePath, type Locale } from '../i18n/utils';
import { localizeProjects } from './projects';

export interface ProjectFile {
  lang: Locale;
  slug: string;
  draft: boolean;
}

/**
 * Absolute URLs of project pages that only exist as a fallback (content from
 * another locale). They canonicalize to the original and stay out of the sitemap.
 * Mirrors the page logic by reusing localizeProjects.
 */
export function fallbackUrls(site: string, files: ProjectFile[]): Set<string> {
  const entries = files.map((f) => ({
    id: `${f.lang}/${f.slug}`,
    data: { year: 0, featured: false, order: 0, draft: f.draft },
  }));
  const urls = new Set<string>();
  for (const lang of LOCALES) {
    for (const p of localizeProjects(entries, lang)) {
      if (p.isFallback) urls.add(new URL(localizePath(`/projects/${p.slug}/`, lang), site).href);
    }
  }
  return urls;
}

/**
 * Whether an MDX source has `draft: true` in its frontmatter (tolerates YAML casing and a
 * trailing `# comment`). Used by astro.config.mjs, which runs before content collections load.
 */
export function isDraftSource(source: string): boolean {
  const frontmatter = source.split(/^---\s*$/m)[1] ?? '';
  return /^draft:\s*(?:true|True|TRUE)\s*(?:#.*)?$/m.test(frontmatter);
}
