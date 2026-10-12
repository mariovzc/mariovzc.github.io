import { describe, expect, it } from 'vitest';
import { stackHighlights, yearsOfExperience } from '../../src/lib/profile';

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

describe('stackHighlights', () => {
  const stack = {
    frontend: ['React', 'JavaScript'],
    backend: ['Python', 'Node.js'],
    tools: ['Docker'],
  };

  it('returns highlights when present', () => {
    expect(stackHighlights({ highlights: ['Python', 'Flutter'], stack })).toEqual([
      'Python',
      'Flutter',
    ]);
  });

  it('falls back to the first 3 of frontend + backend when highlights is empty', () => {
    expect(stackHighlights({ highlights: [], stack })).toEqual(['React', 'JavaScript', 'Python']);
  });

  it('falls back when highlights is missing', () => {
    expect(stackHighlights({ stack })).toEqual(['React', 'JavaScript', 'Python']);
  });

  it('returns an empty list when nothing is available', () => {
    expect(
      stackHighlights({ highlights: [], stack: { frontend: [], backend: [], tools: ['Docker'] } }),
    ).toEqual([]);
  });
});
