import type { Locale } from '../i18n/utils';

export interface ProfileData {
  name: string;
  headline: string;
  role: string;
  location?: string;
  bio: string;
  availability?: string;
  services: { title: string; description: string }[];
  experience: { company: string; role: string; start: string; end?: string; summary: string }[];
  education: { institution: string; degree: string; start: string; end?: string }[];
  certifications: { name: string; issuer: string; year: string; url?: string }[];
  stack: { frontend: string[]; backend: string[]; tools: string[] };
  contact: { email: string; github?: string; linkedin?: string; x?: string };
}

export interface ProjectSummary {
  slug: string;
  title: string;
  summary: string;
  year: number;
  role: string;
  stack: string[];
  tags: string[];
  /** Absolute URL of the project page in the requested locale. */
  url: string;
  links: { live?: string; repo?: string };
  contentLang: Locale;
}

export interface SiteData {
  site: string;
  profiles: Record<Locale, ProfileData>;
  projects: Record<Locale, ProjectSummary[]>;
}
