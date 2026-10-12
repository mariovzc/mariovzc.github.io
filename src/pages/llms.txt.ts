import type { APIRoute } from 'astro';
import { buildComingSoonLlmsTxt, buildLlmsTxt } from '../lib/llms';
import { getProfile, getSiteData } from '../lib/site-data';
import { isComingSoon } from '../lib/site-mode';

export const GET: APIRoute = async ({ site }) =>
  new Response(
    isComingSoon(import.meta.env)
      ? buildComingSoonLlmsTxt(await getProfile('en'))
      : buildLlmsTxt(await getSiteData(site!)),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
