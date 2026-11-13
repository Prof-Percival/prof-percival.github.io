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

type LocalAiMockBehavior = 'ready' | 'loading' | 'error';

async function mockLocalAiWorker(page: Page, behavior: LocalAiMockBehavior = 'ready') {
  const state = { requests: 0 };
  await page.route('**/*guide-ai.worker*.js', async (route) => {
    state.requests += 1;
    const workerSource = `
      self.onmessage = (event) => {
        const message = event.data;
        if (message.type === 'initialize') {
          self.postMessage({ type: 'progress', stage: 'download', progress: 25, loaded: 10, total: 40 });
          if ('${behavior}' === 'ready') {
            setTimeout(() => self.postMessage({ type: 'ready' }), 120);
          } else if ('${behavior}' === 'error') {
            setTimeout(() => self.postMessage({ type: 'error' }), 30);
          }
          return;
        }
        if (message.type === 'rank') {
          self.postMessage({
            type: 'result',
            requestId: message.requestId,
            answerIds: ['featured-system'],
          });
        }
      };
    `;
    await route.fulfill({ status: 200, contentType: 'application/javascript', body: workerSource });
  });
  return state;
}

test.describe('interactive portfolio hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('presents a concise identity and focused routes', async ({ page }) => {
    await expect(page).toHaveTitle(/Phadima Percival Maredi/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/dependable systems/i);
    await expect(page.getByText(/Full-stack product engineering with strong back-end depth/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Explore the systems/i })).toHaveAttribute('href', '/work/');

    for (const [name, href] of [
      ['See systems, not a screenshot wall.', '/work/'],
      ['Trace the work behind the roles.', '/journey/'],
      ['See the range behind the depth.', '/profile/'],
      ['Ask a question. Inspect the source.', '/guide/'],
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
    await expect(rail.getByRole('link', { name: /Ask the verified guide/ })).toHaveAttribute('href', '/guide/');
  });

  test('keeps analytics disabled on local previews', async ({ page }) => {
    await expect(page.locator('script[src="https://gc.zgo.at/count.js"]')).toHaveCount(0);
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
    await expect(csp).not.toHaveAttribute('content', /wasm-unsafe-eval|huggingface\.co|worker-src/);

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
    await expect(navigation.getByRole('link', { name: 'Guide' })).toHaveAttribute('href', '/guide/');

    await navigation.getByRole('link', { name: 'Work' }).click();
    await expect(page).toHaveURL(/\/work\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Systems with decisions/);
  });
});

test.describe('verified portfolio guide', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/guide/');
  });

  test('matches suggested and typed questions to published answers', async ({ page }) => {
    await expect(page).toHaveTitle('Verified portfolio guide | Phadima Percival Maredi');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Ask a focused question/);
    await expect(page.getByRole('button', { name: 'Verified' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText(/does not generate new claims/i)).toBeVisible();
    const csp = page.locator('meta[http-equiv="Content-Security-Policy"]');
    await expect(csp).toHaveAttribute('content', /'wasm-unsafe-eval'/);
    await expect(csp).toHaveAttribute('content', /worker-src 'self'/);
    await expect(csp).toHaveAttribute('content', /https:\/\/huggingface\.co/);
    await expect(csp).toHaveAttribute('content', /https:\/\/us\.aws\.cdn\.hf\.co/);

    await page.getByRole('link', { name: 'What kind of engineer is Phadima?' }).click();
    await expect(page.getByRole('heading', { name: 'Full-stack range with back-end depth' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText(/Showing .* verified answer/);

    const query = page.getByLabel('What would you like to know?');
    await query.fill('What cloud and delivery experience does Phadima have?');
    await page.getByRole('button', { name: 'Find an answer' }).click();
    await expect(page.locator('[data-guide-answer]:visible').first()).toHaveAttribute(
      'data-guide-answer',
      'cloud-delivery'
    );
    await expect(page.getByRole('heading', { name: 'Cloud delivery backed by operational work' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Career and cloud capabilities' })).toHaveAttribute(
      'href',
      '/journey/'
    );
  });

  test('does not load model assets before explicit enablement', async ({ page }) => {
    const modelRequests: string[] = [];
    page.on('request', (request) => {
      if (/guide-ai\.worker|huggingface\.co|\.hf\.co|ort-wasm/.test(request.url())) modelRequests.push(request.url());
    });

    await page.reload();
    await page.waitForTimeout(100);
    expect(modelRequests).toEqual([]);

    await page.getByRole('button', { name: 'Local AI', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Semantic matching on this device.' })).toBeVisible();
    await expect(page.getByText('About 39 MB')).toBeVisible();
    expect(modelRequests).toEqual([]);
    await expectAccessibleAndContained(page);
  });

  test('enables mocked local AI and ranks only curated answers', async ({ page }) => {
    const worker = await mockLocalAiWorker(page);
    await page.getByRole('button', { name: 'Local AI', exact: true }).click();
    expect(worker.requests).toBe(0);

    await page.getByRole('button', { name: 'Enable local AI' }).click();
    await expect(page.getByText('25%', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Local AI' })).toHaveAttribute('aria-pressed', 'true');
    expect(worker.requests).toBe(1);

    await page.getByLabel('What would you like to know?').fill('Where should I begin?');
    await page.getByRole('button', { name: 'Rank locally' }).click();
    await expect(page.locator('[data-guide-answer]:visible').first()).toHaveAttribute(
      'data-guide-answer',
      'featured-system'
    );
    await expect(page.getByRole('heading', { name: 'Start with Missing Children SA' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText(/Local AI ranked 1 curated answer/);
    await expect(page.getByText(/connects an ASP.NET Core API/)).toBeVisible();
    await expectAccessibleAndContained(page);
  });

  test('cancels model loading and keeps Verified mode active', async ({ page }) => {
    await mockLocalAiWorker(page, 'loading');
    await page.getByRole('button', { name: 'Local AI', exact: true }).click();
    await page.getByRole('button', { name: 'Enable local AI' }).click();
    await expect(page.getByRole('button', { name: 'Cancel model download' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancel model download' }).click();
    await expect(page.getByRole('status')).toHaveText(/loading cancelled/);
    await expect(page.getByRole('button', { name: 'Verified' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('falls back after model failure and respects data saver', async ({ page }) => {
    await mockLocalAiWorker(page, 'error');
    await page.getByRole('button', { name: 'Local AI', exact: true }).click();
    await page.getByRole('button', { name: 'Enable local AI' }).click();
    await expect(page.getByRole('status')).toHaveText(/could not start.*Verified mode remains active/);
    await expect(page.getByRole('button', { name: 'Try local AI again' })).toBeVisible();

    await page.evaluate(() => {
      Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } });
    });
    await page.getByRole('button', { name: 'Local AI', exact: true }).click();
    await expect(page.locator('[data-local-ai-unavailable]')).toHaveText(/data saver enabled/);
    await expect(page.getByRole('button', { name: 'Enable local AI' })).toBeHidden();
  });

  test('shows no-result and reset states without inventing an answer', async ({ page }) => {
    const query = page.getByLabel('What would you like to know?');
    await query.fill('quantum gardening');
    await page.getByRole('button', { name: 'Find an answer' }).click();

    await expect(page.getByRole('heading', { name: 'Try a different question.' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText(/No verified answer matched/);
    await expect(page.locator('[data-guide-answer]:visible')).toHaveCount(0);

    await page.getByRole('button', { name: 'Clear question' }).click();
    await expect(page.getByRole('heading', { name: 'Choose what you want to know.' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText(/Verified guide ready/);
  });

  test('remains accessible and contained at desktop and 320 pixels', async ({ page }) => {
    await expectAccessibleAndContained(page);
    await page.setViewportSize({ width: 320, height: 800 });
    await expectAccessibleAndContained(page);
  });

  test('keeps every answer available without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({
      baseURL: 'http://127.0.0.1:4321',
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    try {
      await page.goto('/guide/');
      await expect(page.locator('[data-guide-answer]')).toHaveCount(12);
      await expect(page.getByRole('heading', { name: 'Start with Missing Children SA' })).toBeVisible();
      await expect(page.getByText(/All verified answers remain available/i)).toBeVisible();
    } finally {
      await context.close();
    }
  });
});

test.describe('work route', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/work/');
  });

  test('presents selected and earlier work on a focused route', async ({ page }) => {
    await expect(page).toHaveTitle('Work | Phadima Percival Maredi');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Systems with decisions/);
    for (const [name, href] of [
      ['Explore Missing Children SA', '/work/missing-children-sa/'],
      ['Explore Fraud Rule Engine', '/work/fraud-rule-engine/'],
      ['Explore Agent Activity Risk Monitor', '/work/agent-risk-monitor/'],
    ]) {
      await expect(page.getByRole('link', { name })).toHaveAttribute('href', href);
    }
    await expect(page.getByRole('heading', { name: 'Missing Children SA' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Fraud Rule Engine' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Agent Activity Risk Monitor' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'ShelfIQ', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explore the ShelfIQ story' })).toHaveAttribute(
      'href',
      '/work/shelfiq/'
    );
    await expect(page.getByText('Not publicly launched', { exact: true })).toBeVisible();

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

test.describe('Fraud Rule Engine case study', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/work/fraud-rule-engine/');
  });

  test('presents public-safe architecture and a six-chapter guide', async ({ page }) => {
    await expect(page).toHaveTitle(/Fraud Rule Engine.*Case study.*Phadima Percival Maredi/);
    await expect(page.getByRole('heading', { level: 1, name: 'Fraud Rule Engine' })).toBeVisible();
    await expect(page.getByText('Private source', { exact: true })).toBeVisible();
    await expect(page.getByText('Synthetic demo', { exact: true })).toBeVisible();
    await expect(page.locator('[data-case-deck] [data-deck-tab]')).toHaveCount(6);

    const deck = page.locator('[data-case-deck]');
    await deck.getByRole('button', { name: /Constraints/ }).click();
    await expect(deck.getByRole('heading', { name: /History, retries, and changing policy/ })).toBeVisible();
    await expect(deck.getByRole('status')).toHaveText(/Chapter 2 of 6: Constraints/);
  });

  test('evaluates a stacked synthetic transaction with explainable outcomes', async ({ page }) => {
    await expect(page.locator('[data-fraud-score]')).toHaveText('25');
    await expect(page.locator('[data-fraud-decision]')).toHaveText('Approve');

    await page.getByLabel('Amount in ZAR').fill('30000');
    await page.getByLabel('Category').selectOption('Cryptocurrency');
    await page.getByLabel('Merchant is on the deny list').check();
    await page.getByLabel('Local hour').fill('2');
    await page.getByLabel('Transactions in 15 minutes').fill('5');
    await page.getByLabel('Implied travel speed in km/h').fill('1200');
    await page.getByLabel('Baseline average in ZAR').fill('1000');
    await page.getByRole('button', { name: 'Evaluate transaction' }).click();

    await expect(page.locator('[data-fraud-score]')).toHaveText('100');
    await expect(page.locator('[data-fraud-decision]')).toHaveText('Decline');
    await expect(page.locator('[data-fraud-outcome][data-triggered="true"]')).toHaveCount(8);
    await expect(page.getByRole('status').last()).toHaveText(/Score 100.*Decision Decline/);
  });

  test('is accessible and contained', async ({ page }) => {
    await expectAccessibleAndContained(page);
  });
});

test.describe('Agent Activity Risk Monitor case study', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/work/agent-risk-monitor/');
  });

  test('presents the cross-language system and guided decisions', async ({ page }) => {
    await expect(page).toHaveTitle(/Agent Activity Risk Monitor.*Case study.*Phadima Percival Maredi/);
    await expect(page.getByRole('heading', { level: 1, name: 'Agent Activity Risk Monitor' })).toBeVisible();
    await expect(page.getByText('Private source', { exact: true })).toBeVisible();
    await expect(page.locator('[data-case-deck] [data-deck-tab]')).toHaveCount(6);
    await expect(page.getByText('47 unit tests', { exact: true })).toBeVisible();
    await expect(page.getByText('38 end-to-end tests', { exact: true })).toBeVisible();
  });

  test('traces a duplicate synthetic event to one critical alert', async ({ page }) => {
    await page.getByLabel('Synthetic activity event').selectOption('remote_code_execution');
    await page.getByLabel('Send the same event twice').check();
    await page.getByRole('button', { name: 'Run synthetic event' }).click();

    await expect(page.locator('[data-agent-received]')).toHaveText('2');
    await expect(page.locator('[data-agent-stored]')).toHaveText('1');
    await expect(page.locator('[data-agent-alert-count]')).toHaveText('1');
    await expect(page.locator('[data-agent-alert-severity]')).toHaveText('critical');
    await expect(page.locator('[data-agent-alert-rule]')).toHaveText('remote_code_execution');
    await expect(page.getByRole('status').last()).toHaveText(/critical alert raised/);

    await page.locator('[data-agent-stage]').filter({ hasText: 'Alert' }).click();
    await expect(page.locator('[data-agent-stage-detail]')).toHaveText(/written once.*unique/);
  });

  test('is accessible and contained', async ({ page }) => {
    await expectAccessibleAndContained(page);
  });
});

test.describe('ShelfIQ project story', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/work/shelfiq/');
  });

  test('states what exists and what remains before launch', async ({ page }) => {
    await expect(page).toHaveTitle(/ShelfIQ.*In-development project.*Phadima Percival Maredi/);
    await expect(page.getByRole('heading', { level: 1, name: 'ShelfIQ' })).toBeVisible();
    await expect(page.getByText('In development', { exact: true })).toBeVisible();
    await expect(page.getByText('Private source', { exact: true })).toBeVisible();
    await expect(page.getByText('Not publicly launched', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Protect the core rules with automated tests' })).toBeVisible();
    await expect(page.getByText(/No launch, customer usage, or production outcome is claimed/)).toBeVisible();
  });

  test('lets visitors inspect the implemented product boundaries', async ({ page }) => {
    const workflow = page.locator('[data-shelfiq-workflow]');
    await workflow.getByRole('button', { name: /Verify/ }).click();
    await expect(
      workflow.getByRole('heading', { name: 'Resolve a barcode and retain the useful result.' })
    ).toBeVisible();
    await expect(workflow.locator('[data-shelfiq-boundary]')).toHaveText(/public lookup exposes product verification/);
    await expect(workflow.getByRole('status')).toHaveText('Verify stage selected.');

    await workflow.getByRole('button', { name: /Media/ }).click();
    await expect(workflow.locator('[data-shelfiq-boundary]')).toHaveText(/no original ShelfIQ media has been cleared/);
  });

  test('is accessible and contained', async ({ page }) => {
    await expectAccessibleAndContained(page);
  });
});

test.describe('journey route', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/journey/');
  });

  test('keeps the career story focused and accurate', async ({ page }) => {
    await expect(page).toHaveTitle('Journey | Phadima Percival Maredi');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/career connected/i);
    const chronology = page.locator('#experience');
    await expect(chronology.getByText('Software Engineer: Back-End', { exact: true })).toBeVisible();
    await expect(chronology.getByText('Software Development Engineer, EC2', { exact: true })).toBeVisible();
    await expect(page.getByText(/Software Development Engineer II|Level 2/)).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Every role, in document order.' })).toBeVisible();
    await expectAccessibleAndContained(page);
  });

  test('selects connected role chapters and thematic evidence', async ({ page }) => {
    const map = page.locator('[data-journey-map]');
    await expect(map.locator('[data-journey-node]')).toHaveCount(5);
    await expect(map.getByRole('button', { name: /Capitec Bank/ })).toHaveAttribute('aria-pressed', 'true');

    await map.getByRole('button', { name: /Amazon/ }).click();
    await expect(map.getByRole('heading', { name: 'Amazon' })).toBeVisible();
    await expect(map.getByText('Software Development Engineer, EC2', { exact: true })).toBeVisible();
    await expect(map.getByRole('link', { name: /Cloud and delivery/ })).toHaveAttribute(
      'href',
      '/profile/#capabilities-title'
    );
    await expect(
      page
        .getByRole('navigation', { name: /Portfolio systems presented separately/ })
        .getByRole('link', { name: /Agent Activity Risk Monitor/ })
    ).toHaveAttribute('href', '/work/agent-risk-monitor/');
    await expect(map.getByRole('status')).toHaveText(/Amazon selected/);
  });

  test('supports arrow-key movement across the route', async ({ page }) => {
    const map = page.locator('[data-journey-map]');
    const olx = map.getByRole('button', { name: /OLX/ });
    await olx.focus();
    await olx.press('ArrowRight');

    await expect(map.getByRole('button', { name: /Amazon/ })).toBeFocused();
    await expect(map.getByRole('button', { name: /Amazon/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('removes route animation when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    const animationName = await page
      .locator('[data-journey-node]')
      .first()
      .evaluate((node) => getComputedStyle(node).animationName);
    expect(animationName).toBe('none');
  });
});

test.describe('profile route', () => {
  test('shows capabilities, credentials, languages, and community experience', async ({ page }) => {
    await page.goto('/profile/');
    await expect(page).toHaveTitle('Profile | Phadima Percival Maredi');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Full-stack range/);

    const pageIndex = page.getByRole('navigation', { name: 'Profile sections' });
    for (const [label, href] of [
      ['Capabilities', '#capabilities'],
      ['About', '#about'],
      ['Certifications', '#credentials'],
      ['Languages', '#languages'],
      ['Community', '#community'],
      ['Contact', '#contact'],
    ]) {
      await expect(pageIndex.getByRole('link', { name: new RegExp(label) })).toHaveAttribute('href', href);
    }

    for (const credential of [
      'Java',
      'Data Science Foundations - Level 1',
      'Data Science Tools',
      'Python Essentials 1',
      'Introduction to Cybersecurity',
    ]) {
      await expect(page.getByRole('link', { name: new RegExp(credential) })).toBeVisible();
    }
    await expect(page.getByText('Eighteen shown from 114+ certifications listed on LinkedIn.')).toBeVisible();
    await expect(page.getByRole('heading', { level: 4, name: 'Certificate previews' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 4, name: 'More certifications' })).toBeVisible();
    await expect(page.locator('[data-certification-card]')).toHaveCount(18);
    await expect(page.locator('.certificate-feature-card')).toHaveCount(4);
    await expect(page.locator('.credential-grid > a')).toHaveCount(14);
    await expect(page.locator('.credential-card__category')).toHaveCount(18);
    await expect(page.locator('.credential-card__recent')).toHaveCount(8);
    await expect(page.locator('[data-credential-source="portfolio"]')).toHaveCount(4);
    await expect(page.locator('[data-credential-source="issuer"]')).toHaveCount(14);
    for (const [title, href] of [
      ['From Prototype toward Production with AgentCore', '/certificates/agentcore/'],
      ['Building Generative AI Solutions - OLX', '/certificates/building-generative-ai-solutions/'],
      ['ALX Software Engineering', '/certificates/alx-software-engineering/'],
      ['OMET Peer Buddy Leadership', '/certificates/omet-peer-buddy-leadership/'],
    ]) {
      const previewLink = page.getByRole('link', { name: new RegExp(title) });
      await expect(previewLink).toHaveAttribute('href', href);
      await expect(previewLink).not.toHaveAttribute('target', '_blank');
    }
    expect(
      await page
        .locator('[data-certification-card]')
        .evaluateAll((links) =>
          links
            .map((link) => (link as HTMLAnchorElement).href)
            .filter((href) => new URL(href).hostname.endsWith('linkedin.com'))
        )
    ).toEqual([]);
    await expect(page.getByRole('link', { name: /View all certifications on LinkedIn/ })).toHaveAttribute(
      'href',
      'https://za.linkedin.com/in/prof-percival'
    );

    await pageIndex.getByRole('link', { name: /Languages/ }).click();
    await expect(page).toHaveURL(/#languages$/);
    await expect(page.locator('#languages')).toBeInViewport();

    for (const language of ['Sepedi', 'English', 'Sesotho', 'Setswana', 'IsiXhosa', 'IsiZulu']) {
      await expect(page.locator('.language-list dt').filter({ hasText: new RegExp(`^${language}$`) })).toBeVisible();
    }
    await expect(page.getByRole('heading', { name: 'Peer Buddy', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Student Intern' })).toBeVisible();
    await expectAccessibleAndContained(page);
  });

  test('filters certification highlights without hiding the default evidence set', async ({ page }) => {
    await page.goto('/profile/');
    const showcase = page.locator('[data-certifications]');
    const filters = showcase.getByRole('group', { name: 'Filter certifications by focus' });
    await expect(filters.getByRole('button')).toHaveCount(5);
    await expect(showcase.locator('[data-certification-card]:visible')).toHaveCount(18);

    await filters.getByRole('button', { name: 'Cloud and data' }).click();
    await expect(showcase.locator('[data-certification-card]:visible')).toHaveCount(3);
    await expect(showcase.locator('[data-certification-section="featured"]')).toBeHidden();
    await expect(showcase.getByRole('status')).toHaveText('Showing 3 of 18 certifications in Cloud and data.');

    await filters.getByRole('button', { name: 'Leadership' }).click();
    await expect(showcase.locator('[data-certification-card]:visible')).toHaveCount(1);
    await expect(showcase.locator('[data-certification-section="featured"]')).toBeVisible();
    await expect(showcase.locator('[data-certification-section="highlights"]')).toBeHidden();

    await filters.getByRole('button', { name: 'All', exact: true }).click();
    await expect(showcase.locator('[data-certification-card]:visible')).toHaveCount(18);
    await expect(showcase.getByRole('status')).toHaveText('Showing all 18 certifications.');
    await expectAccessibleAndContained(page);
  });

  test('keeps all certification highlights available without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({
      baseURL: 'http://127.0.0.1:4321',
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    try {
      await page.goto('/profile/');
      await expect(page.locator('[data-certification-filter]')).toBeHidden();
      await expect(page.locator('[data-certification-card]')).toHaveCount(18);
      await expect(page.locator('[data-certification-card]:visible')).toHaveCount(18);
    } finally {
      await context.close();
    }
  });

  test('adapts credential cards to their available section width', async ({ page, isMobile }) => {
    test.skip(isMobile, 'One desktop browser can exercise both container widths.');

    const columnCountsAt = async (width: number) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/profile/');
      return page
        .locator('.certificate-feature-grid, .credential-grid')
        .evaluateAll((grids) => grids.map((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length));
    };

    expect((await columnCountsAt(1366)).every((count) => count > 1)).toBe(true);
    expect(await columnCountsAt(700)).toEqual([1, 1]);
  });

  test('keeps languages and community content separate at intermediate desktop widths', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Intermediate desktop widths use the desktop browser project.');

    for (const width of [1024, 1152, 1280, 1366]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/profile/');
      const secondary = page.locator('.profile-details__secondary');
      await secondary.scrollIntoViewIfNeeded();

      const layout = await secondary.evaluate((element) => {
        const rectangle = (selector: string) => {
          const target = element.querySelector<HTMLElement>(selector);
          if (!target) throw new Error(`Missing profile element: ${selector}`);
          const bounds = target.getBoundingClientRect();
          return {
            top: bounds.top,
            right: bounds.right,
            bottom: bounds.bottom,
            left: bounds.left,
          };
        };
        const overlaps = (left: ReturnType<typeof rectangle>, right: ReturnType<typeof rectangle>) =>
          left.left < right.right && left.right > right.left && left.top < right.bottom && left.bottom > right.top;
        const languageSection = rectangle('.language-section');
        const languageHeading = rectangle('.language-section .profile-subheading h3');
        const communityHeading = rectangle('.community-section .profile-subheading');
        const communitySection = element.querySelector<HTMLElement>('.community-section');
        if (!communitySection) throw new Error('Missing community section');

        return {
          headingsOverlap: overlaps(languageHeading, communityHeading),
          languageHeadingContained:
            languageHeading.left >= languageSection.left && languageHeading.right <= languageSection.right + 1,
          secondaryOverflow: element.scrollWidth - element.clientWidth,
          communityOverflow: communitySection.scrollWidth - communitySection.clientWidth,
        };
      });

      expect(layout.headingsOverlap, `${width}px headings should not overlap`).toBe(false);
      expect(layout.languageHeadingContained, `${width}px language heading should stay in its section`).toBe(true);
      expect(layout.secondaryOverflow, `${width}px secondary content should not overflow`).toBeLessThanOrEqual(0);
      expect(layout.communityOverflow, `${width}px community content should not overflow`).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('certificate previews', () => {
  test('provides local high-resolution views and preview downloads', async ({ page }) => {
    const previews = [
      {
        route: '/certificates/agentcore/',
        title: 'From Prototype toward Production with AgentCore',
        image: '/certificates/agentcore.jpg',
        width: 1929,
        height: 1364,
        download: 'phadima-maredi-agentcore-certificate-preview.jpg',
      },
      {
        route: '/certificates/building-generative-ai-solutions/',
        title: 'Building Generative AI Solutions - OLX',
        image: '/certificates/building-generative-ai-solutions.jpg',
        width: 1269,
        height: 981,
        download: 'phadima-maredi-building-generative-ai-solutions-certificate-preview.jpg',
      },
      {
        route: '/certificates/alx-software-engineering/',
        title: 'ALX Software Engineering',
        image: '/certificates/alx-software-engineering.png',
        width: 1280,
        height: 720,
        download: 'phadima-maredi-alx-software-engineering-certificate-preview.png',
      },
      {
        route: '/certificates/omet-peer-buddy-leadership/',
        title: 'OMET Peer Buddy Leadership',
        image: '/certificates/omet-peer-buddy-leadership.jpg',
        width: 1929,
        height: 1364,
        download: 'phadima-maredi-omet-peer-buddy-leadership-certificate-preview.jpg',
      },
    ] as const;

    for (const preview of previews) {
      await page.goto(preview.route);
      await expect(page.getByRole('heading', { level: 1, name: preview.title })).toBeVisible();
      await expect(page.getByRole('link', { name: /Back to certifications/ })).toHaveAttribute(
        'href',
        '/profile/#credentials'
      );
      const image = page.locator('.certificate-document img');
      await expect(image).toHaveAttribute('src', preview.image);
      await image.evaluate((element: HTMLImageElement) => element.decode());
      expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBe(preview.width);
      expect(await image.evaluate((element: HTMLImageElement) => element.naturalHeight)).toBe(preview.height);
      await expect(page.getByRole('link', { name: /View full-size preview/ }).last()).toHaveAttribute(
        'target',
        '_blank'
      );
      await expect(page.getByRole('link', { name: /Download preview/ })).toHaveAttribute('download', preview.download);
      await expect(page.getByText(/original PDF was not included in the saved LinkedIn page source/i)).toBeVisible();
      await expectAccessibleAndContained(page);
    }
  });
});

test.describe('contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile/#contact');
  });

  test('aligns the contact deep link after the page finishes loading', async ({ page }) => {
    await page.waitForLoadState('load');
    const heading = page.getByRole('heading', { name: 'Good systems start with a clear conversation.' });
    await expect
      .poll(async () => {
        const bounds = await heading.boundingBox();
        return Boolean(bounds && bounds.y >= 0 && bounds.y < page.viewportSize()!.height / 2);
      })
      .toBe(true);
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
    await expect(page.locator('[data-form-status]')).toHaveText(/Message sent/);
    await expect(page).toHaveURL(/\/profile\/#contact$/);

    status = 503;
    await submit();
    await expect(page.locator('[data-form-status]')).toHaveText(/could not be sent/);
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
    await expect(page.getByRole('heading', { name: 'Portfolio guide' })).toBeVisible();
    await expect(page.getByText(/downloads a model and inference runtime from Hugging Face/)).toBeVisible();
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
    await expect(page.locator('[data-case-deck] [data-deck-tab]')).toHaveCount(6);
    await expectAccessibleAndContained(page);
  });

  test('moves a synthetic report through the controlled publication path', async ({ page }) => {
    await page.goto('/work/missing-children-sa/');
    const workflow = page.locator('[data-missing-workflow]');
    await expect(workflow.getByRole('button', { name: /Submission/ })).toHaveAttribute('aria-current', 'step');

    for (let index = 0; index < 4; index += 1) {
      await workflow.getByRole('button', { name: 'Move case forward' }).click();
    }

    await expect(workflow.getByRole('button', { name: /Public listing/ })).toHaveAttribute('aria-current', 'step');
    await expect(workflow.locator('[data-workflow-boundary]')).toHaveText(/no real person, report, or image/i);
    await expect(workflow.getByRole('status')).toHaveText(/public listing stage/);

    await workflow.getByRole('button', { name: 'Reset case' }).click();
    await expect(workflow.getByRole('button', { name: /Submission/ })).toHaveAttribute('aria-current', 'step');
  });
});
