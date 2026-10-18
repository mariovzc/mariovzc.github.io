import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { contentRoot } from './lib/content-root.ts';

const root = contentRoot();

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: `./${root}/projects` }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      summary: z.string().min(1).max(160),
      year: z.number().int().min(2000).max(2100),
      role: z.string().min(1),
      stack: z.array(z.string().min(1)).min(1),
      tags: z.array(z.string().min(1)).default([]),
      cover: image(),
      coverAlt: z.string().min(1),
      gallery: z.array(z.object({ src: image(), alt: z.string().min(1) })).default([]),
      links: z.object({ live: z.url().optional(), repo: z.url().optional() }).default({}),
      confidential: z.boolean().default(false),
      featured: z.boolean().default(false),
      order: z.number().default(100),
      draft: z.boolean().default(false),
    }),
});

const profile = defineCollection({
  loader: glob({ pattern: '*.yaml', base: `./${root}/profile` }),
  schema: z.object({
    name: z.string().min(1),
    fullName: z.string().min(1).optional(),
    alternateNames: z.array(z.string().min(1)).default([]),
    headline: z.string().min(1),
    role: z.string().min(1),
    location: z.string().optional(),
    bio: z.string().min(1),
    availability: z.string().optional(),
    // Short proof points under the home hero (e.g. "ISO 27001" / "led the team that passed the audit").
    heroFacts: z
      .array(z.object({ value: z.string().min(1), label: z.string().min(1) }))
      .max(2)
      .default([]),
    services: z
      .array(
        z.object({
          title: z.string().min(1),
          description: z.string().min(1),
          tools: z.string().min(1).optional(),
          // Slug of the project that proves this service (linked from the home "What do you need built?" panel).
          project: z.string().min(1).optional(),
        }),
      )
      .min(1),
    experience: z
      .array(
        z.object({
          company: z.string().min(1),
          role: z.string().min(1),
          start: z.string().min(4),
          end: z.string().optional(),
          summary: z.string().min(1),
        }),
      )
      .default([]),
    education: z
      .array(
        z.object({
          institution: z.string().min(1),
          degree: z.string().min(1),
          start: z.string().min(4),
          end: z.string().optional(),
        }),
      )
      .default([]),
    certifications: z
      .array(
        z.object({
          name: z.string().min(1),
          issuer: z.string().min(1),
          year: z.string().min(4),
          url: z.url().optional(),
        }),
      )
      .default([]),
    stack: z.object({
      frontend: z.array(z.string()).default([]),
      backend: z.array(z.string()).default([]),
      tools: z.array(z.string()).default([]),
      // Security & quality practices (ISO 27001, OWASP…) shown as skills, not sold as a service.
      practices: z.array(z.string()).default([]),
    }),
    contact: z.object({
      email: z.email(),
      github: z.url().optional(),
      linkedin: z.url().optional(),
      credly: z.url().optional(),
      x: z.url().optional(),
    }),
  }),
});

export const collections = { projects, profile };
