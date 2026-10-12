import { expect, test } from '@playwright/test';

const SITE = 'https://mariovzc.github.io';

test.describe('home', () => {
  test('english home has SEO essentials', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toContainText('Sample Person');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}/`);
    await expect(page.locator('link[hreflang="es"]')).toHaveAttribute('href', `${SITE}/es/`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /^https:\/\//,
    );
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.map((s) => JSON.parse(s)['@type'])).toEqual(['Person', 'WebSite']);
  });

  test('spanish home', async ({ page }) => {
    await page.goto('/es/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}/es/`);
    await expect(page.getByRole('heading', { name: 'Proyectos destacados' })).toBeVisible();
  });
});

test.describe('projects', () => {
  test('language switch keeps the same project', async ({ page }) => {
    await page.goto('/projects/sample-full/');
    await page.getByTestId('lang-switch').click();
    await expect(page).toHaveURL(/\/es\/projects\/sample-full\/$/);
    await expect(page.locator('h1')).toHaveText('Proyecto completo de ejemplo');
  });

  test('missing translation falls back with notice and canonical', async ({ page }) => {
    await page.goto('/es/projects/sample-en-only/');
    await expect(page.getByTestId('fallback-notice')).toBeVisible();
    await expect(page.locator('h1')).toHaveText('Sample English-only Project');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${SITE}/projects/sample-en-only/`,
    );
    await expect(page.locator('link[hreflang="es"]')).toHaveCount(0);
  });

  test('project with only required fields has no empty sections', async ({ page }) => {
    await page.goto('/projects/sample-en-only/');
    await expect(page.getByTestId('project-live')).toHaveCount(0);
    await expect(page.getByTestId('project-repo')).toHaveCount(0);
    await expect(page.getByTestId('project-gallery')).toHaveCount(0);
  });

  test('confidential project shows badge on its card and notice on its page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('confidential-badge')).toHaveCount(1);
    await page.goto('/projects/sample-confidential/');
    await expect(page.getByTestId('confidential-notice')).toBeVisible();
    await expect(page.getByTestId('project-live')).toHaveCount(0);
    await expect(page.getByTestId('project-gallery')).toHaveCount(0);
    await page.goto('/es/projects/sample-confidential/');
    await expect(page.getByTestId('confidential-notice')).toBeVisible();
  });

  test('full project shows links, gallery and next/prev', async ({ page }) => {
    await page.goto('/projects/sample-full/');
    await expect(page.getByTestId('project-live')).toBeVisible();
    await expect(page.getByTestId('project-repo')).toBeVisible();
    const gallery = page.getByTestId('project-gallery');
    await gallery.scrollIntoViewIfNeeded();
    // client:visible island: wait for hydration before clicking
    await expect(gallery.locator('astro-island:not([ssr])')).toHaveCount(1);
    await gallery.getByRole('button').first().click();
    await expect(page.locator('dialog[open]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    await expect(page.getByTestId('project-next')).toHaveAttribute(
      'href',
      '/projects/sample-en-only/',
    );
  });
});

test.describe('theme', () => {
  test('follows system preference on first visit', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await ctx.close();
  });

  test('toggle persists across reloads', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('works when localStorage is blocked', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new Error('blocked');
        },
      });
    });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    expect(errors).toEqual([]);
  });
});

test.describe('site files', () => {
  test('every internal link resolves', async ({ page, request }) => {
    const seen = new Set<string>();
    for (const start of [
      '/',
      '/es/',
      '/projects/sample-full/',
      '/es/projects/sample-en-only/',
      '/does-not-exist/',
    ]) {
      // The 404 start page itself returns 404; only its links are checked.
      await page.goto(start);
      const hrefs = await page
        .locator('a[href^="/"]')
        .evaluateAll((as) => as.map((a) => a.getAttribute('href')!.split('#')[0]!));
      hrefs.forEach((h) => seen.add(h));
    }
    for (const href of seen) {
      const res = await request.get(href);
      expect(res.status(), href).toBe(200);
    }
  });

  test('unknown page returns the 404 page', async ({ request }) => {
    const res = await request.get('/does-not-exist/');
    expect(res.status()).toBe(404);
    expect(await res.text()).toContain('Page not found');
  });

  test('404 shows English for unknown paths', async ({ page }) => {
    await page.goto('/nope/');
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Página no encontrada' })).toBeHidden();
    await expect(page.getByTestId('not-found-terminal')).toContainText('/nope/');
    await expect(page.locator('a[href*="#work"]')).toHaveCount(0);
  });

  test('404 shows Spanish under /es/', async ({ page }) => {
    await page.goto('/es/no-existe/');
    await expect(page.getByRole('heading', { name: 'Página no encontrada' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeHidden();
  });

  test('llms.txt, robots.txt and sitemap', async ({ request }) => {
    const llms = await request.get('/llms.txt');
    expect(llms.status()).toBe(200);
    expect(await llms.text()).toMatch(/^# Sample Person/);

    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('User-agent: ClaudeBot');

    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    expect(sitemap).toContain(`${SITE}/projects/sample-en-only/`);
    expect(sitemap).not.toContain(`${SITE}/es/projects/sample-en-only/`);
  });
});

test.describe('webmcp', () => {
  test('registers tools when document.modelContext exists', async ({ page }) => {
    await page.addInitScript(() => {
      const tools: { name: string; execute: (a?: unknown) => Promise<unknown> }[] = [];
      (window as unknown as { __tools: typeof tools }).__tools = tools;
      Object.defineProperty(document, 'modelContext', {
        value: { registerTool: async (t: (typeof tools)[number]) => void tools.push(t) },
      });
    });
    await page.goto('/');
    await expect
      .poll(() => page.evaluate(() => (window as any).__tools.map((t: any) => t.name)))
      .toEqual(['list_projects', 'get_project', 'get_profile', 'get_contact']);
    const text = await page.evaluate(async () => {
      const r = await (window as any).__tools[0].execute({});
      return r.content[0].text as string;
    });
    expect(JSON.parse(text).map((p: { slug: string }) => p.slug)).toContain('sample-full');
  });

  test('no errors when WebMCP is unsupported', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    expect(errors).toEqual([]);
  });
});
