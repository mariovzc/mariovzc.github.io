// Lighthouse audit of the production build. Run via `make lighthouse` (inside the e2e container).
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

const PORT = 4323;
const BASE = `http://localhost:${PORT}`;
const PAGES = ['/', '/es/', '/projects/sample-full/'];
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const MIN = 0.95;

const server = spawn(
  'npx',
  ['astro', 'preview', '--ignore-lock', '--host', '0.0.0.0', '--port', String(PORT)],
  {
    stdio: 'ignore',
  },
);

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('Preview server did not start');
}

let failed = false;
let chrome;
try {
  await waitForServer();
  chrome = await chromeLauncher.launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
  });
  mkdirSync('reports', { recursive: true });

  for (const path of PAGES) {
    const result = await lighthouse(`${BASE}${path}`, {
      port: chrome.port,
      output: 'html',
      logLevel: 'error',
      onlyCategories: CATEGORIES,
    });
    const name = path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '-');
    writeFileSync(`reports/${name}.html`, result.report);
    const scores = CATEGORIES.map((c) => [c, result.lhr.categories[c].score]);
    console.log(path, Object.fromEntries(scores.map(([c, s]) => [c, Math.round(s * 100)])));
    if (scores.some(([, s]) => s < MIN)) failed = true;
  }
} finally {
  await chrome?.kill();
  server.kill();
}

if (failed) {
  console.error(`Some scores are below ${MIN * 100}. See reports/.`);
  process.exit(1);
}
