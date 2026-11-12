import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('presents the portfolio identity and primary actions', async ({ page }) => {
    await expect(page).toHaveTitle(/Phadima Percival Maredi/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/dependable systems/i);
    await expect(page.getByRole('link', { name: /explore my work/i })).toHaveAttribute('href', '#work');
    await expect(page.getByRole('link', { name: /^CV/ }).first()).toHaveAttribute(
      'href',
      '/resume/percival-maredi-cv.pdf'
    );
  });

  test('defaults to dark mode and remembers a light selection', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('button', { name: 'Switch to light mode' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.getByRole('button', { name: 'Switch to dark mode' }).first()).toBeVisible();
  });

  test('lets keyboard and pointer users inspect the systems map', async ({ page }) => {
    const apiNode = page.getByRole('button', { name: /02 API/ });
    await apiNode.focus();

    await expect(page.locator('#systems-map-detail')).toHaveText(/Stable contracts/);
    await expect(apiNode).toHaveAttribute('data-active', '');
  });

  test('has no detectable accessibility violations', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('does not overflow horizontally', async ({ page }) => {
    const sizes = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));

    expect(sizes.document).toBeLessThanOrEqual(sizes.viewport);
  });
});

test.describe('mobile navigation', () => {
  test('keeps every section reachable', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile navigation is visible only at narrow widths.');
    await page.goto('/');

    await page.locator('summary[aria-label="Open navigation"]').click();
    const navigation = page.getByRole('navigation', { name: 'Mobile navigation' });
    await expect(navigation.getByRole('link', { name: 'Work' })).toBeVisible();
    await expect(navigation.getByRole('link', { name: 'Contact' })).toBeVisible();
  });
});

test.describe('privacy page', () => {
  test('explains both external services and stays accessible', async ({ page }) => {
    await page.goto('/privacy/');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Clear about what this site collects/);
    await expect(page.getByText('GoatCounter')).toBeVisible();
    await expect(page.getByText('Formspree')).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
