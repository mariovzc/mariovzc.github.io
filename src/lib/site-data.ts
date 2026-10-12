import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { LOCALES, localizePath, type Locale } from '../i18n/utils';
import { localizeProjects, type LocalizedProject } from './projects';
import type { ProfileData, ProjectSummary, SiteData } from './types';

export type ProjectEntry = CollectionEntry<'projects'>;

export async function getProjects(lang: Locale): Promise<LocalizedProject<ProjectEntry>[]> {
  return localizeProjects(await getCollection('projects'), lang);
}

export async function getProfile(lang: Locale): Promise<ProfileData> {
  const entry = await getEntry('profile', lang);
  if (!entry) throw new Error(`Missing src/content/profile/${lang}.yaml`);
  return entry.data;
}

export function toSummary(p: LocalizedProject<ProjectEntry>, site: URL | string): ProjectSummary {
  const d = p.entry.data;
  return {
    slug: p.slug,
    title: d.title,
    summary: d.summary,
    year: d.year,
    role: d.role,
    stack: d.stack,
    tags: d.tags,
    url: new URL(localizePath(`/projects/${p.slug}/`, p.lang), site).href,
    links: d.links,
    confidential: d.confidential,
    contentLang: p.contentLang,
  };
}

export async function getSiteData(site: URL | string): Promise<SiteData> {
  const [profiles, projects] = await Promise.all([
    Promise.all(LOCALES.map(async (l) => [l, await getProfile(l)] as const)),
    Promise.all(
      LOCALES.map(async (l) => [l, (await getProjects(l)).map((p) => toSummary(p, site))] as const),
    ),
  ]);
  return {
    site: new URL('/', site).href,
    profiles: Object.fromEntries(profiles) as SiteData['profiles'],
    projects: Object.fromEntries(projects) as SiteData['projects'],
  };
}
