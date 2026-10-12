import { DEFAULT_LOCALE, isLocale, type Locale } from '../i18n/utils';
import type { SiteData } from './types';

export interface ToolResult {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}

export interface ToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: true };
  execute(args?: Record<string, unknown>): Promise<ToolResult>;
}

export interface ModelContextLike {
  registerTool(tool: ToolDef, options?: { signal?: AbortSignal }): unknown;
}

function hasRegisterTool(value: unknown): value is ModelContextLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { registerTool?: unknown }).registerTool === 'function'
  );
}

/** WebMCP moved from navigator.modelContext to document.modelContext in 2026; support both. */
export function pickModelContext(doc: unknown, nav: unknown): ModelContextLike | undefined {
  for (const host of [doc, nav]) {
    const mc = (host as { modelContext?: unknown } | undefined)?.modelContext;
    if (hasRegisterTool(mc)) return mc;
  }
  return undefined;
}

const LANG_PROP = {
  type: 'string',
  enum: ['en', 'es'],
  description: 'Response language. Defaults to "en".',
};

const ok = (value: unknown): ToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(value) }],
});
const fail = (message: string): ToolResult => ({
  content: [{ type: 'text', text: message }],
  isError: true,
});

function langOf(args?: Record<string, unknown>): Locale {
  const v = args?.lang;
  return typeof v === 'string' && isLocale(v) ? v : DEFAULT_LOCALE;
}

function str(args: Record<string, unknown> | undefined, key: string): string | undefined {
  const v = args?.[key];
  return typeof v === 'string' && v.trim() !== '' ? v.trim().toLowerCase() : undefined;
}

export function createTools(data: SiteData): ToolDef[] {
  const abs = (path: string) => new URL(path, data.site).href;
  const readOnly = { readOnlyHint: true } as const;

  return [
    {
      name: 'list_projects',
      description:
        "List Mario Vizcaino's portfolio projects, optionally filtered by technology or tag.",
      inputSchema: {
        type: 'object',
        properties: {
          stack: { type: 'string', description: 'Technology to filter by, e.g. "React".' },
          tag: { type: 'string', description: 'Tag to filter by, e.g. "freelance".' },
          lang: LANG_PROP,
        },
      },
      annotations: readOnly,
      async execute(args) {
        const stack = str(args, 'stack');
        const tag = str(args, 'tag');
        const list = data.projects[langOf(args)].filter(
          (p) =>
            (!stack || p.stack.some((s) => s.toLowerCase() === stack)) &&
            (!tag || p.tags.some((x) => x.toLowerCase() === tag)),
        );
        return ok(list);
      },
    },
    {
      name: 'get_project',
      description: 'Get the details of one portfolio project by its slug.',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Project slug as returned by list_projects.' },
          lang: LANG_PROP,
        },
        required: ['slug'],
      },
      annotations: readOnly,
      async execute(args) {
        const list = data.projects[langOf(args)];
        const slug = str(args, 'slug');
        const found = list.find((p) => p.slug === slug);
        if (!found) {
          return fail(
            `Project "${slug ?? ''}" not found. Available: ${list.map((p) => p.slug).join(', ')}`,
          );
        }
        return ok(found);
      },
    },
    {
      name: 'get_profile',
      description:
        "Get Mario Vizcaino's professional profile: bio, role, stack, services, experience.",
      inputSchema: { type: 'object', properties: { lang: LANG_PROP } },
      annotations: readOnly,
      async execute(args) {
        return ok(data.profiles[langOf(args)]);
      },
    },
    {
      name: 'get_contact',
      description: 'Get contact details for Mario Vizcaino: email, social profiles and CV link.',
      inputSchema: { type: 'object', properties: {} },
      annotations: readOnly,
      async execute() {
        const p = data.profiles[DEFAULT_LOCALE];
        return ok({ ...p.contact, ...(p.cv ? { cv: abs(p.cv) } : {}) });
      },
    },
  ];
}
