import { expect, test } from '@playwright/test';

const publishedRoutes = [
  '/',
  '/work/',
  '/work/missing-children-sa/',
  '/work/fraud-rule-engine/',
  '/work/agent-risk-monitor/',
  '/work/shelfiq/',
  '/journey/',
  '/profile/',
  '/guide/',
  '/privacy/',
] as const;

test.describe('release integrity', () => {
  test('resolves every published route and internal link', async ({ page, request, isMobile }) => {
    test.skip(isMobile, 'One browser pass covers static route and link resolution.');
    const internalTargets = new Map<string, Set<string>>();

    for (const route of publishedRoutes) {
      const response = await request.get(route);
      expect(response.ok(), `${route} should return a successful response`).toBe(true);

      await page.goto(route);
      const hrefs = await page
        .locator('a[href]')
        .evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));
      for (const href of hrefs) {
        const url = new URL(href);
        if (url.origin !== new URL(page.url()).origin) continue;
        const fragments = internalTargets.get(url.pathname) ?? new Set<string>();
        if (url.hash) fragments.add(decodeURIComponent(url.hash.slice(1)));
        internalTargets.set(url.pathname, fragments);
      }
    }

    for (const [path, fragments] of internalTargets) {
      const response = await request.get(path);
      expect(response.ok(), `${path} should resolve from an internal link`).toBe(true);
      if (fragments.size === 0 || !response.headers()['content-type']?.includes('text/html')) continue;
      await page.goto(path);
      for (const fragment of fragments) {
        await expect(page.locator(`#${fragment}`), `${path}#${fragment} should exist`).toHaveCount(1);
      }
    }
  });

  test('removes project entrance motion when reduced motion is requested', async ({ page }) => {
    await page.goto('/work/fraud-rule-engine/');
    await expect(page.locator('.case-study__hero h1')).not.toHaveCSS('animation-name', 'none');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await expect(page.locator('.case-study__hero h1')).toHaveCSS('animation-name', 'none');
    await expect(page.locator('.case-study__visual > *')).toHaveCSS('animation-name', 'none');
  });

  test('keeps every published route free of browser errors', async ({ page, isMobile }) => {
    test.skip(isMobile, 'One browser pass covers route-level console behavior.');
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`${page.url()}: ${message.text()}`);
    });
    page.on('pageerror', (error) => errors.push(`${page.url()}: ${error.message}`));

    for (const route of publishedRoutes) {
      await page.goto(route);
    }

    expect(errors).toEqual([]);
  });
});
