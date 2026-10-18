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
<div style="width:1200px;height:630px;box-sizing:border-box;padding:80px;color:#f2f5f0;background:#0c100d;
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;display:flex;flex-direction:column;justify-content:space-between">
  <div style="font-size:28px;font-weight:600;color:#a9b3ab">${esc(profile.role)}</div>
  <div>
    <div style="font-size:112px;line-height:1;font-weight:800;letter-spacing:-0.03em">${esc(profile.name)}<span style="color:#b8f24a;margin-left:-0.06em">.</span></div>
    <div style="font-size:46px;font-weight:700;letter-spacing:-0.015em;margin-top:28px;color:#d8ded9">${esc(profile.headline)}</div>
  </div>
  <div style="font-size:28px;font-weight:700;color:#b8f24a">${esc(domain)}</div>
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
