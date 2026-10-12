import { describe, expect, it } from 'vitest';
import { contentRoot } from '../../src/lib/content-root.ts';

describe('contentRoot', () => {
  it('defaults to src/content', () => {
    expect(contentRoot({})).toBe('src/content');
    expect(contentRoot({ CONTENT_ROOT: '  ' })).toBe('src/content');
  });
  it('honours CONTENT_ROOT and strips trailing slashes', () => {
    expect(contentRoot({ CONTENT_ROOT: 'tests/fixtures/content/' })).toBe('tests/fixtures/content');
  });
});
