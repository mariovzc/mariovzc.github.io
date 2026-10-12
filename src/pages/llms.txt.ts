import type { APIRoute } from 'astro';
import { buildLlmsTxt } from '../lib/llms';
import { getSiteData } from '../lib/site-data';

export const GET: APIRoute = async ({ site }) =>
  new Response(buildLlmsTxt(await getSiteData(site!)), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
