// Single source of truth for where content collections are read from.
// Default is the real site content; e2e builds set CONTENT_ROOT=tests/fixtures/content.
export function contentRoot(env: Record<string, string | undefined> = process.env): string {
  const root = env.CONTENT_ROOT?.trim();
  return (root && root.replace(/\/+$/, '')) || 'src/content';
}
