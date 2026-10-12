export const AI_CRAWLERS = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];

export function buildRobotsTxt(site: string): string {
  const blocks = ['*', ...AI_CRAWLERS].map((agent) => `User-agent: ${agent}\nAllow: /`);
  return `${blocks.join('\n\n')}\n\nSitemap: ${new URL('/sitemap-index.xml', site).href}\n`;
}
