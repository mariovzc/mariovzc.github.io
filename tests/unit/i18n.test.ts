import { describe, expect, it } from 'vitest';
import en from '../../src/i18n/en.json';
import es from '../../src/i18n/es.json';
import {
  isLocale,
  localizePath,
  otherLocale,
  splitLocalePath,
  switchLocalePath,
  t,
} from '../../src/i18n/utils';

describe('ui strings', () => {
  it('en and es define exactly the same keys', () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
  });

  it('no string is empty', () => {
    for (const dict of [en, es]) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value, key).not.toBe('');
      }
    }
  });

  it('t returns the localized string', () => {
    expect(t('en', 'nav.contact')).toBe('Contact');
    expect(t('es', 'nav.contact')).toBe('Contacto');
  });
});

describe('locale helpers', () => {
  it('isLocale', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('es')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });

  it('otherLocale', () => {
    expect(otherLocale('en')).toBe('es');
    expect(otherLocale('es')).toBe('en');
  });
});

describe('localizePath', () => {
  it.each([
    ['/', 'en', '/'],
    ['/', 'es', '/es/'],
    ['/projects/foo/', 'en', '/projects/foo/'],
    ['/projects/foo/', 'es', '/es/projects/foo/'],
    ['projects/foo', 'es', '/es/projects/foo/'],
  ] as const)('%s in %s -> %s', (path, lang, expected) => {
    expect(localizePath(path, lang)).toBe(expected);
  });
});

describe('splitLocalePath', () => {
  it.each([
    ['/', { lang: 'en', path: '/' }],
    ['/projects/foo/', { lang: 'en', path: '/projects/foo/' }],
    ['/es/', { lang: 'es', path: '/' }],
    ['/es', { lang: 'es', path: '/' }],
    ['/es/projects/foo/', { lang: 'es', path: '/projects/foo/' }],
    ['/espresso/', { lang: 'en', path: '/espresso/' }],
  ] as const)('%s', (pathname, expected) => {
    expect(splitLocalePath(pathname)).toEqual(expected);
  });
});

describe('switchLocalePath', () => {
  it('keeps the same page in the other language', () => {
    expect(switchLocalePath('/projects/foo/', 'es')).toBe('/es/projects/foo/');
    expect(switchLocalePath('/es/projects/foo/', 'en')).toBe('/projects/foo/');
    expect(switchLocalePath('/es/', 'en')).toBe('/');
  });
});
