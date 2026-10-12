import { describe, expect, it } from 'vitest';
import { notFoundLang } from '../../src/lib/not-found';

describe('notFoundLang', () => {
  it('detects Spanish paths', () => {
    expect(notFoundLang('/es/')).toBe('es');
    expect(notFoundLang('/es')).toBe('es');
    expect(notFoundLang('/es/no-existe/')).toBe('es');
  });

  it('defaults to English', () => {
    expect(notFoundLang('/')).toBe('en');
    expect(notFoundLang('/nope/')).toBe('en');
    expect(notFoundLang('/espresso/')).toBe('en');
    expect(notFoundLang('/projects/es/')).toBe('en');
    expect(notFoundLang('')).toBe('en');
  });
});
