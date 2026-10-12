import { createTools, pickModelContext } from '../lib/webmcp-tools';
import type { SiteData } from '../lib/types';

async function registerWebMcpTools() {
  const mc = pickModelContext(document, navigator);
  if (!mc) return;

  const el = document.getElementById('webmcp-data');
  if (!el?.textContent) return;

  let data: SiteData;
  try {
    data = JSON.parse(el.textContent) as SiteData;
  } catch {
    return;
  }

  for (const tool of createTools(data)) {
    try {
      // Current spec returns a Promise; older Chrome builds return synchronously.
      await Promise.resolve(mc.registerTool(tool));
    } catch {
      // Duplicate registration or API mismatch: ignore, the page works without it.
    }
  }
}

void registerWebMcpTools();
