// Renders public/og-default.png (1200x630) with Playwright's Chromium. Run via `make og`.
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { parse } from 'yaml';

const profile = parse(readFileSync('src/content/profile/en.yaml', 'utf8'));
const site = readFileSync('astro.config.mjs', 'utf8').match(/const SITE = '([^']+)'/)?.[1];
if (!site) throw new Error('SITE constant not found in astro.config.mjs');
const domain = new URL(site).host;
const esc = (v) => String(v).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

const html = `<!doctype html><html><body style="margin:0">
<div style="width:1200px;height:630px;box-sizing:border-box;padding:80px;background:#f6f3ee;
  color:#1b1a17;font-family:Georgia,'Times New Roman',serif;display:flex;flex-direction:column;justify-content:space-between">
  <div style="font-family:system-ui,sans-serif;font-size:28px;color:#6b665d;letter-spacing:4px;text-transform:uppercase">${esc(profile.role)}</div>
  <div>
    <div style="font-size:112px;line-height:1">${esc(profile.name)}</div>
    <div style="font-size:52px;font-style:italic;color:#c2410c;margin-top:24px">${esc(profile.headline)}</div>
  </div>
  <div style="font-family:system-ui,sans-serif;font-size:26px;color:#6b665d">${esc(domain)}</div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.screenshot({ path: 'public/og-default.png' });
await browser.close();
console.log('Wrote public/og-default.png');
