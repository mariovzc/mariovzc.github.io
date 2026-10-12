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
