import { describe, expect, it } from 'vitest';
import { isComingSoon, comingSoonSitemapAllows } from '../../src/lib/site-mode';

describe('isComingSoon', () => {
  it("is on only when PUBLIC_COMING_SOON is exactly 'true'", () => {
    expect(isComingSoon({ PUBLIC_COMING_SOON: 'true' })).toBe(true);
  });

  it.each([undefined, '', 'false', 'TRUE', '1', 'yes', ' true'])('is off for %j', (value) => {
    expect(isComingSoon({ PUBLIC_COMING_SOON: value })).toBe(false);
  });

  it('is off when the variable is missing', () => {
    expect(isComingSoon({})).toBe(false);
  });
});

describe('comingSoonSitemapAllows', () => {
  const site = 'https://mariovzc.github.io';

  it('keeps both home pages', () => {
    expect(comingSoonSitemapAllows('https://mariovzc.github.io/', site)).toBe(true);
    expect(comingSoonSitemapAllows('https://mariovzc.github.io/es/', site)).toBe(true);
  });

  it('works with a trailing slash on site', () => {
    expect(comingSoonSitemapAllows('https://mariovzc.github.io/es/', `${site}/`)).toBe(true);
  });

  it('drops every other page', () => {
    expect(comingSoonSitemapAllows('https://mariovzc.github.io/projects/x/', site)).toBe(false);
    expect(comingSoonSitemapAllows('https://mariovzc.github.io/es/projects/x/', site)).toBe(false);
    expect(comingSoonSitemapAllows('https://mariovzc.github.io/404/', site)).toBe(false);
  });
});
