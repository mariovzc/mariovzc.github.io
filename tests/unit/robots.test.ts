import { describe, expect, it } from 'vitest';
import { AI_CRAWLERS, buildRobotsTxt } from '../../src/lib/robots';

describe('robots.txt', () => {
  const txt = buildRobotsTxt('https://mariovzc.github.io/');

  it('allows everyone', () => {
    expect(txt).toContain('User-agent: *\nAllow: /');
  });

  it('explicitly allows AI crawlers', () => {
    for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
      expect(AI_CRAWLERS).toContain(bot);
      expect(txt).toContain(`User-agent: ${bot}\nAllow: /`);
    }
  });

  it('declares the sitemap with an absolute URL', () => {
    expect(txt).toContain('Sitemap: https://mariovzc.github.io/sitemap-index.xml');
  });
});
