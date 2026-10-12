import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
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
      featured: z.boolean().default(false),
      order: z.number().default(100),
      draft: z.boolean().default(false),
    }),
});

const profile = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/profile' }),
  schema: z.object({
    name: z.string().min(1),
    headline: z.string().min(1),
    role: z.string().min(1),
    location: z.string().optional(),
    bio: z.string().min(1),
    availability: z.string().optional(),
    services: z
      .array(z.object({ title: z.string().min(1), description: z.string().min(1) }))
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
    highlights: z.array(z.string().min(1)).default([]),
    stack: z.object({
      frontend: z.array(z.string()).default([]),
      backend: z.array(z.string()).default([]),
      tools: z.array(z.string()).default([]),
    }),
    contact: z.object({
      email: z.email(),
      github: z.url().optional(),
      linkedin: z.url().optional(),
      x: z.url().optional(),
    }),
  }),
});

export const collections = { projects, profile };
