import type { ProfileData } from './types';

/**
 * Years since the earliest experience start. Each `start` must begin with a 4-digit
 * year (e.g. "2019" or "2019-03"); entries that don't are ignored.
 * Returns null when no year can be parsed. Never negative.
 */
export function yearsOfExperience(
  experience: { start: string }[],
  now: Date = new Date(),
): number | null {
  const years = experience
    .map((e) => /^(\d{4})/.exec(e.start)?.[1])
    .filter((y): y is string => y !== undefined)
    .map(Number);
  if (years.length === 0) return null;
  return Math.max(0, now.getFullYear() - Math.min(...years));
}

/**
 * Technologies shown on the home bento Stack tile: the curated `highlights` when
 * non-empty, otherwise the first 3 of frontend + backend.
 */
export function stackHighlights(
  profile: Pick<ProfileData, 'stack'> & { highlights?: string[] },
): string[] {
  if (profile.highlights && profile.highlights.length > 0) return profile.highlights;
  return [...profile.stack.frontend, ...profile.stack.backend].slice(0, 3);
}

/** How many distinct stack technologies are not shown on the bento Stack tile. */
export function remainingStackCount(stack: ProfileData['stack'], shown: string[]): number {
  const all = new Set([...stack.frontend, ...stack.backend, ...stack.tools]);
  for (const s of shown) all.delete(s);
  return all.size;
}
