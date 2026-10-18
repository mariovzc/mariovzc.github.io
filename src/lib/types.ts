import type { Locale } from '../i18n/utils';

export interface ProfileData {
  name: string;
  /** Full legal name, shown in the footer and used for search (JSON-LD alternateName, llms.txt). */
  fullName?: string;
  /** Other name combinations people search for; JSON-LD alternateName only. */
  alternateNames: string[];
  headline: string;
  role: string;
  location?: string;
  bio: string;
  availability?: string;
  heroFacts: { value: string; label: string }[];
  services: { title: string; description: string; tools?: string; project?: string }[];
  experience: { company: string; role: string; start: string; end?: string; summary: string }[];
  education: { institution: string; degree: string; start: string; end?: string }[];
  certifications: { name: string; issuer: string; year: string; url?: string }[];
  stack: { frontend: string[]; backend: string[]; tools: string[]; practices: string[] };
  contact: { email: string; github?: string; linkedin?: string; x?: string; credly?: string };
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
  /** Anonymized case study: no screenshots or code shared. */
  confidential: boolean;
  contentLang: Locale;
}

export interface SiteData {
  site: string;
  profiles: Record<Locale, ProfileData>;
  projects: Record<Locale, ProjectSummary[]>;
}
