import { describe, expect, it } from 'vitest';
import { splitHeadline, yearsOfExperience } from '../../src/lib/profile';

describe('splitHeadline', () => {
  it('splits at the em dash into a sentence and a capitalized lead', () => {
    expect(splitHeadline('Simple, secure, scalable software — built fast with AI.')).toEqual({
      main: 'Simple, secure, scalable software.',
      lead: 'Built fast with AI',
    });
    expect(
      splitHeadline('Software simple, seguro y escalable — construido rápido con IA.'),
    ).toEqual({ main: 'Software simple, seguro y escalable.', lead: 'Construido rápido con IA' });
  });

  it('returns the whole headline when there is no em dash', () => {
    expect(splitHeadline('Building tools.')).toEqual({ main: 'Building tools.', lead: null });
  });

  it('splits only at the first em dash and keeps existing end punctuation', () => {
    expect(splitHeadline('Ship it! — fast — and safe')).toEqual({
      main: 'Ship it!',
      lead: 'Fast — and safe',
    });
  });
});

const now = new Date('2026-06-01T00:00:00Z');

describe('yearsOfExperience', () => {
  it('returns null for empty input', () => {
    expect(yearsOfExperience([], now)).toBeNull();
  });

  it('counts from a single start year', () => {
    expect(yearsOfExperience([{ start: '2022' }], now)).toBe(4);
  });

  it('uses the earliest parseable year', () => {
    expect(yearsOfExperience([{ start: '2019-03' }, { start: '2021' }], now)).toBe(7);
  });

  it('returns null when no start has a leading 4-digit year', () => {
    expect(yearsOfExperience([{ start: 'soon' }, { start: '' }], now)).toBeNull();
  });

  it('ignores unparseable entries next to valid ones', () => {
    expect(yearsOfExperience([{ start: 'n/a' }, { start: '2020' }], now)).toBe(6);
  });

  it('never returns a negative number', () => {
    expect(yearsOfExperience([{ start: '2030' }], now)).toBe(0);
  });
});
