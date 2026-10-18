import { describe, expect, it } from 'vitest';
import { resolveTheme } from '../../src/lib/theme';

describe('resolveTheme', () => {
  it('stored preference wins', () => {
    expect(resolveTheme('dark')).toBe('dark');
    expect(resolveTheme('light')).toBe('light');
  });

  it('defaults to dark when nothing valid is stored', () => {
    expect(resolveTheme(null)).toBe('dark');
    expect(resolveTheme('purple')).toBe('dark');
  });
});
