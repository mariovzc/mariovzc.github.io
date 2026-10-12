import type { APIRoute } from 'astro';
import { buildRobotsTxt } from '../lib/robots';

export const GET: APIRoute = ({ site }) =>
  new Response(buildRobotsTxt(site!.href), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
