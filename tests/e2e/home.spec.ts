import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('presents the portfolio identity and primary actions', async ({ page }) => {
    await expect(page).toHaveTitle(/Phadima Percival Maredi/);
    await expect(page.getByText('Software Engineer · Cape Town')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/dependable systems/i);
    await expect(page.getByText(/full product stack/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /explore my work/i })).toHaveAttribute('href', '#work');
    await expect(page.getByRole('link', { name: /^CV/ }).first()).toHaveAttribute(
      'href',
      '/resume/percival-maredi-cv.pdf'
    );
  });

  test('shows the selected case study and every earlier project', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Missing Children SA' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Read the case study' })).toHaveAttribute(
      'href',
      '/work/missing-children-sa/'
    );

    for (const title of [
      'SIC Data Analysis and Visualization',
      'MMEA',
      'CRS Rentals',
      'Contacts Management',
      'Matrix Multiplication',
    ]) {
      await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    }
  });

  test('uses the general software-engineer identity while preserving the exact current role', async ({ page }) => {
    await expect(page.getByText('Software Engineer: Back-End', { exact: true })).toBeVisible();
    await expect(page.getByText('Software Development Engineer, EC2', { exact: true })).toBeVisible();
    await expect(page.getByText(/Software Development Engineer II|Level 2/)).toHaveCount(0);
  });

  test('keeps anchored sections clear of the sticky header', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop navigation is hidden at narrow widths.');
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Work' }).click();
    await expect(page).toHaveURL(/#work$/);

    const header = await page.locator('.site-header').boundingBox();
    const heading = await page.getByRole('heading', { name: /Systems with a reason/ }).boundingBox();
    expect(header).not.toBeNull();
    expect(heading).not.toBeNull();
    expect(heading!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
    await expect(page.getByRole('link', { name: 'Skip to content' })).not.toBeInViewport();
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

    await navigation.getByRole('link', { name: 'Work' }).click();
    await expect(page.getByRole('heading', { name: /Systems with a reason/ })).toBeInViewport();
    await expect(page.getByRole('link', { name: 'Skip to content' })).not.toBeInViewport();
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

test.describe('Missing Children SA case study', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/work/missing-children-sa/');
  });

  test('explains the connected system and its engineering decisions', async ({ page }) => {
    await expect(page).toHaveTitle(/Missing Children SA.*Case study/);
    await expect(page.getByRole('heading', { level: 1, name: 'Missing Children SA' })).toBeVisible();

    for (const surface of ['API', 'Desktop', 'Mobile']) {
      await expect(page.getByRole('heading', { level: 3, name: surface })).toBeVisible();
    }

    await expect(page.getByRole('heading', { name: 'Moderation before visibility' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'History that can be recovered' })).toBeVisible();
  });

  test('is accessible and has no horizontal overflow', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);

    const sizes = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(sizes.document).toBeLessThanOrEqual(sizes.viewport);
  });
});
