import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('presents the portfolio identity and primary actions', async ({ page }) => {
    await expect(page).toHaveTitle(/Phadima Percival Maredi/);
    await expect(page.getByRole('banner').getByText('Phadima Percival Maredi')).toBeVisible();
    await expect(page.getByText('Software Engineer · Cape Town')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/dependable systems/i);
    await expect(page.getByText(/full product stack/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /explore my work/i })).toHaveAttribute('href', '#work');
    await expect(page.getByRole('link', { name: /^CV/ }).first()).toHaveAttribute(
      'href',
      '/resume/percival-maredi-cv.pdf'
    );
  });

  test('publishes metadata and machine-readable discovery files', async ({ page }) => {
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/site.webmanifest');
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
      'content',
      'Phadima Percival Maredi, Software Engineer'
    );

    const csp = page.locator('meta[http-equiv="Content-Security-Policy"]');
    await expect(csp).toHaveAttribute('content', /formspree\.io/);
    await expect(csp).toHaveAttribute('content', /goatcounter\.com/);

    const manifest = await page.request.get('/site.webmanifest');
    expect(manifest.ok()).toBe(true);
    await expect(manifest.json()).resolves.toMatchObject({
      name: 'Phadima Percival Maredi',
      short_name: 'PM Portfolio',
      start_url: '/',
    });

    const robots = await page.request.get('/robots.txt');
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toContain('Sitemap: https://prof-percival.github.io/sitemap-index.xml');
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

    const sicCard = page
      .getByRole('article')
      .filter({ has: page.getByRole('heading', { name: 'SIC Data Analysis and Visualization', exact: true }) });
    await expect(sicCard.getByRole('img', { name: /data-analysis view/i })).toBeVisible();
    await expect(sicCard.locator('img')).toHaveCount(0);
  });

  test('gives the SIC visualization deliberate use of its frame', async ({ page, isMobile }) => {
    test.skip(isMobile, 'The wide project card uses a stacked layout on mobile.');
    const sicCard = page
      .getByRole('article')
      .filter({ has: page.getByRole('heading', { name: 'SIC Data Analysis and Visualization', exact: true }) });
    const frame = await sicCard.locator('.project-card__image').boundingBox();
    const visual = await sicCard.getByRole('img', { name: /data-analysis view/i }).boundingBox();

    expect(frame).not.toBeNull();
    expect(visual).not.toBeNull();
    expect(visual!.width / frame!.width).toBeGreaterThan(0.85);
    expect(visual!.height / frame!.height).toBeGreaterThan(0.85);
  });

  test('keeps every project image inside its mobile media frame', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This regression covers the narrow project-card layout.');

    for (const title of ['MMEA', 'CRS Rentals', 'Contacts Management', 'Matrix Multiplication']) {
      const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
      const image = card.locator('img');
      await card.scrollIntoViewIfNeeded();
      await image.evaluate((element: HTMLImageElement) => element.decode());

      const frameBox = await card.locator('.project-card__image').boundingBox();
      const imageBox = await image.boundingBox();
      expect(frameBox).not.toBeNull();
      expect(imageBox).not.toBeNull();
      expect(imageBox!.y).toBeGreaterThanOrEqual(frameBox!.y);
      expect(imageBox!.y + imageBox!.height).toBeLessThanOrEqual(frameBox!.y + frameBox!.height);
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

  test('shows certifications, languages, and community experience from the professional profiles', async ({ page }) => {
    for (const credential of [
      'Java',
      'Data Science Foundations, Level 1',
      'Data Science Tools',
      'Python Essentials 1',
      'Introduction to Cybersecurity',
    ]) {
      await expect(page.getByRole('link', { name: new RegExp(credential) })).toBeVisible();
    }
    for (const language of ['Sepedi', 'English', 'Sesotho', 'Setswana', 'IsiXhosa', 'IsiZulu']) {
      await expect(page.locator('.language-list dt').filter({ hasText: new RegExp(`^${language}$`) })).toBeVisible();
    }
    await expect(page.getByRole('heading', { name: 'Peer Buddy' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Student Intern' })).toBeVisible();
  });

  test('renders analytics only on the configured public host', async ({ page }) => {
    await expect(page.locator('script[src="https://gc.zgo.at/count.js"]')).toHaveCount(0);
  });

  test('defaults to dark mode and remembers a light selection', async ({ page }) => {
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(themeColor).toHaveAttribute('content', '#090d12');

    await page.getByRole('button', { name: 'Switch to light mode' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(themeColor).toHaveAttribute('content', '#f4f0e8');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(themeColor).toHaveAttribute('content', '#f4f0e8');
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

test.describe('contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#contact');
  });

  test('uses the dedicated Formspree endpoint and visible labels', async ({ page }) => {
    const form = page.locator('[data-contact-form]');
    await expect(form).toHaveAttribute('action', 'https://formspree.io/f/xaeondbn');
    await expect(form.locator('input[name="_subject"]')).toHaveValue(
      'New message from the Phadima Percival Maredi portfolio'
    );
    await expect(page.getByLabel('Name', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
    await expect(page.getByLabel('What is this about?')).toBeVisible();
    await expect(page.getByLabel('Message', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Privacy details' })).toHaveAttribute('href', '/privacy/');
  });

  test('uses native validation before making a submission', async ({ page }) => {
    let submissions = 0;
    await page.route('https://formspree.io/f/xaeondbn', (route) => {
      submissions += 1;
      return route.abort();
    });

    const name = page.getByLabel('Name', { exact: true });
    await page.getByRole('button', { name: 'Send message' }).click();

    expect(await name.evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true);
    expect(submissions).toBe(0);
    await expect(page.getByRole('status')).toHaveText('');
  });

  test('reports a successful submission without leaving the page', async ({ page }) => {
    await page.route('https://formspree.io/f/xaeondbn', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
    );
    await page.getByLabel('Name', { exact: true }).fill('Portfolio Visitor');
    await page.getByLabel('Email', { exact: true }).fill('visitor@example.com');
    await page.getByLabel('What is this about?').selectOption('Project or collaboration');
    await page
      .getByLabel('Message', { exact: true })
      .fill('I would like to discuss a software engineering project with you.');
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(page.getByRole('status')).toHaveText(/Message sent/);
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue('');
    await expect(page).toHaveURL(/#contact$/);
  });

  test('keeps the form available after a provider failure', async ({ page }) => {
    await page.route('https://formspree.io/f/xaeondbn', (route) => route.fulfill({ status: 503 }));
    await page.getByLabel('Name', { exact: true }).fill('Portfolio Visitor');
    await page.getByLabel('Email', { exact: true }).fill('visitor@example.com');
    await page.getByLabel('What is this about?').selectOption('Role or opportunity');
    await page
      .getByLabel('Message', { exact: true })
      .fill('I would like to discuss a software engineering opportunity with you.');
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(page.getByRole('status')).toHaveText(/could not be sent/);
    await expect(page.getByRole('button', { name: 'Send message' })).toBeEnabled();
  });
});

test.describe('privacy page', () => {
  test('explains both external services and stays accessible', async ({ page }) => {
    await page.goto('/privacy/');

    await expect(page).toHaveTitle('Privacy | Phadima Percival Maredi');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Clear about what this site collects/);
    await expect(page.getByText('GoatCounter')).toBeVisible();
    await expect(page.getByText('Formspree')).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);

    const sizes = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(sizes.document).toBeLessThanOrEqual(sizes.viewport);
  });
});

test.describe('custom 404 page', () => {
  test('returns a branded, accessible response without horizontal overflow', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(/Page not found/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/This path ends here/);
    await expect(page.getByRole('link', { name: 'Return to the portfolio' })).toHaveAttribute('href', '/');

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);

    const sizes = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(sizes.document).toBeLessThanOrEqual(sizes.viewport);
  });
});

test.describe('Missing Children SA case study', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/work/missing-children-sa/');
  });

  test('explains the connected system and its engineering decisions', async ({ page }) => {
    await expect(page).toHaveTitle(/Missing Children SA.*Case study.*Phadima Percival Maredi/);
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
