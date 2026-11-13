import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

async function expectAccessibleAndContained(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  const sizes = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(sizes.document).toBeLessThanOrEqual(sizes.viewport);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
}

test.describe('interactive portfolio hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('presents a concise identity and four clear routes', async ({ page }) => {
    await expect(page).toHaveTitle(/Phadima Percival Maredi/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/dependable systems/i);
    await expect(page.getByText(/Full-stack product engineering with strong back-end depth/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Explore the systems/i })).toHaveAttribute('href', '/work/');

    for (const [name, href] of [
      ['See systems, not a screenshot wall.', '/work/'],
      ['Trace the work behind the roles.', '/journey/'],
      ['See the range behind the depth.', '/profile/'],
    ]) {
      await expect(page.getByRole('link', { name: new RegExp(name) })).toHaveAttribute('href', href);
    }
  });

  test('uses the persistent route rail on desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'The persistent rail becomes compact navigation on mobile.');
    const rail = page.getByRole('complementary', { name: 'Portfolio navigation' });
    await expect(rail).toBeVisible();
    await expect(rail.getByRole('link', { name: /Phadima Percival Maredi.*portfolio home/i })).toBeVisible();
    const routes = rail.getByRole('navigation', { name: 'Portfolio routes' });
    await expect(routes.getByRole('link', { name: /Home/ })).toHaveAttribute('aria-current', 'page');
    await expect(routes.getByRole('link', { name: /Work/ })).toHaveAttribute('href', '/work/');
    await expect(routes.getByRole('link', { name: /Journey/ })).toHaveAttribute('href', '/journey/');
    await expect(routes.getByRole('link', { name: /Profile/ })).toHaveAttribute('href', '/profile/');
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
  });

  test('lets keyboard and pointer users inspect the systems map', async ({ page }) => {
    const apiNode = page.getByRole('button', { name: /02 API/ });
    await apiNode.focus();
    await expect(page.locator('#systems-map-detail')).toHaveText(/Stable contracts/);
    await expect(apiNode).toHaveAttribute('data-active', '');
  });

  test('is accessible and contained', async ({ page }) => {
    await expectAccessibleAndContained(page);
  });
});

test.describe('mobile route navigation', () => {
  test('reaches every focused route', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Compact navigation is visible only at narrow widths.');
    await page.goto('/');

    await page.locator('summary[aria-label="Open navigation"]').click();
    const navigation = page.getByRole('navigation', { name: 'Mobile navigation' });
    await expect(navigation.getByRole('link', { name: 'Work' })).toHaveAttribute('href', '/work/');
    await expect(navigation.getByRole('link', { name: 'Journey' })).toHaveAttribute('href', '/journey/');
    await expect(navigation.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/profile/');

    await navigation.getByRole('link', { name: 'Work' }).click();
    await expect(page).toHaveURL(/\/work\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Systems with decisions/);
  });
});

test.describe('work route', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/work/');
  });

  test('presents selected and earlier work on a focused route', async ({ page }) => {
    await expect(page).toHaveTitle('Work | Phadima Percival Maredi');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Systems with decisions/);
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

  test('is accessible and contained', async ({ page }) => {
    await expectAccessibleAndContained(page);
  });
});

test.describe('journey route', () => {
  test('keeps the career story focused and accurate', async ({ page }) => {
    await page.goto('/journey/');
    await expect(page).toHaveTitle('Journey | Phadima Percival Maredi');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/career connected/i);
    await expect(page.getByText('Software Engineer: Back-End', { exact: true })).toBeVisible();
    await expect(page.getByText('Software Development Engineer, EC2', { exact: true })).toBeVisible();
    await expect(page.getByText(/Software Development Engineer II|Level 2/)).toHaveCount(0);
    await expectAccessibleAndContained(page);
  });
});

test.describe('profile route', () => {
  test('shows capabilities, credentials, languages, and community experience', async ({ page }) => {
    await page.goto('/profile/');
    await expect(page).toHaveTitle('Profile | Phadima Percival Maredi');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Full-stack range/);

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
    await expectAccessibleAndContained(page);
  });
});

test.describe('contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile/#contact');
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
  });

  test('reports successful and failed provider responses without leaving the route', async ({ page }) => {
    let status = 200;
    await page.route('https://formspree.io/f/xaeondbn', (route) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ ok: status === 200 }) })
    );

    const submit = async () => {
      await page.getByLabel('Name', { exact: true }).fill('Portfolio Visitor');
      await page.getByLabel('Email', { exact: true }).fill('visitor@example.com');
      await page.getByLabel('What is this about?').selectOption('Project or collaboration');
      await page
        .getByLabel('Message', { exact: true })
        .fill('I would like to discuss a software engineering project with you.');
      await page.getByRole('button', { name: 'Send message' }).click();
    };

    await submit();
    await expect(page.getByRole('status')).toHaveText(/Message sent/);
    await expect(page).toHaveURL(/\/profile\/#contact$/);

    status = 503;
    await submit();
    await expect(page.getByRole('status')).toHaveText(/could not be sent/);
    await expect(page.getByRole('button', { name: 'Send message' })).toBeEnabled();
  });
});

test.describe('supporting routes', () => {
  test('keeps privacy and the custom 404 accessible', async ({ page }) => {
    await page.goto('/privacy/');
    await expect(page).toHaveTitle('Privacy | Phadima Percival Maredi');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Clear about what this site collects/);
    await expect(page.getByText('GoatCounter')).toBeVisible();
    await expect(page.getByText('Formspree')).toBeVisible();
    await expectAccessibleAndContained(page);

    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/This path ends here/);
    await expectAccessibleAndContained(page);
  });
});

test.describe('Missing Children SA case study', () => {
  test('explains the connected system and its engineering decisions', async ({ page }) => {
    await page.goto('/work/missing-children-sa/');
    await expect(page).toHaveTitle(/Missing Children SA.*Case study.*Phadima Percival Maredi/);
    await expect(page.getByRole('heading', { level: 1, name: 'Missing Children SA' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to selected work/ })).toHaveAttribute('href', '/work/');

    for (const surface of ['API', 'Desktop', 'Mobile']) {
      await expect(page.getByRole('heading', { level: 3, name: surface })).toBeVisible();
    }
    await expect(page.getByRole('heading', { name: 'Moderation before visibility' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'History that can be recovered' })).toBeVisible();
    await expectAccessibleAndContained(page);
  });
});
