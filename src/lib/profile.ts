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
 * Splits the profile headline at its first " — " so the home hero can set the
 * first part as the h1 and the rest as the lead line. The h1 gets a full stop
 * when it has no end punctuation; the lead is capitalized without its full stop.
 */
export function splitHeadline(headline: string): { main: string; lead: string | null } {
  const i = headline.indexOf(' — ');
  if (i === -1) return { main: headline, lead: null };
  const first = headline.slice(0, i).trim();
  const rest = headline
    .slice(i + 3)
    .trim()
    .replace(/\.$/, '');
  return {
    main: /[.!?]$/.test(first) ? first : `${first}.`,
    lead: rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : null,
  };
}
