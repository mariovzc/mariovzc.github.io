// Renders src/assets/brand/og-{en,es}.png (1200x630) with Playwright's Chromium. Run via `make og`.
// They live in src/assets so Astro emits them with a content hash: every change gets a new URL,
// which forces WhatsApp/LinkedIn/X to refresh their cached link previews.
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { parse } from 'yaml';

const site = readFileSync('astro.config.mjs', 'utf8').match(/const SITE = '([^']+)'/)?.[1];
if (!site) throw new Error('SITE constant not found in astro.config.mjs');
const domain = new URL(site).host;
const esc = (v) => String(v).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

const font = readFileSync(
  'node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2',
).toString('base64');

const render = (profile) => `<!doctype html><html><head><style>
@font-face{font-family:'Plus Jakarta Sans';src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:200 800}
</style></head><body style="margin:0">
<div style="width:1200px;height:630px;box-sizing:border-box;padding:80px;color:#fff;
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;display:flex;flex-direction:column;justify-content:space-between;
  background:radial-gradient(rgba(255,255,255,.15) 1.5px,transparent 1.5px) 0 0/28px 28px,linear-gradient(135deg,#187a35,#0f5a26)">
  <div style="font-size:26px;font-weight:700;letter-spacing:5px;text-transform:uppercase">${esc(profile.role)}</div>
  <div>
    <div style="font-size:112px;line-height:1;font-weight:800;letter-spacing:-0.02em">${esc(profile.name)}</div>
    <div style="font-size:48px;font-weight:700;letter-spacing:-0.01em;margin-top:28px;opacity:.92">${esc(profile.headline)}</div>
  </div>
  <div style="align-self:flex-start;font-size:26px;font-weight:700;color:#187a35;background:#fff;border-radius:9999px;padding:12px 28px">${esc(domain)}</div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const lang of ['en', 'es']) {
  const profile = parse(readFileSync(`src/content/profile/${lang}.yaml`, 'utf8'));
  await page.setContent(render(profile));
  await page.evaluate(() => document.fonts.ready);
  const out = `src/assets/brand/og-${lang}.png`;
  await page.screenshot({ path: out });
  console.log(`Wrote ${out}`);
}
await browser.close();
