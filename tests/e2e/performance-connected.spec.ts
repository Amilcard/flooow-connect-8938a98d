import { test, expect, TestContext, setupErrorCapture, attachErrorArtifacts, measureElementAppearance } from './utils/test-harness';
import { cleanupTestData } from './utils/db-helpers';

/**
 * Test Suite: Performance Connected
 * Covers: Measuring load times for key elements when user is connected
 * Bug: Slowness/performance issues when connected
 */
test.describe('Performance Connected - Key Element Load Times', () => {
  let testContext: TestContext;
  const testEmail = `test.perf.${Date.now()}@test.inklusif.fr`;
  const testPassword = 'SecurePass123!';

  // Performance thresholds in milliseconds
  const THRESHOLDS = {
    HOME_CONTENT: 5000,      // Home content should appear within 5s
    ACTIVITY_DETAIL: 5000,   // Activity detail should load within 5s
    ACCOUNT_PAGE: 4000,      // Account page should load within 4s
    SEARCH_RESULTS: 4000,    // Search results should appear within 4s
    NAVIGATION: 2000,        // Navigation should complete within 2s
  };

  test.beforeEach(async ({ page }) => {
    testContext = setupErrorCapture(page);

    // Create and login a test user
    const signupStart = Date.now();

    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    await page.click('text=Créer un compte');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    const confirmPasswordField = page.locator('input[name="confirmPassword"]');
    if (await confirmPasswordField.isVisible()) {
      await confirmPasswordField.fill(testPassword);
    }

    await page.click('button[type="submit"]');

    await Promise.race([
      page.waitForURL('/', { timeout: 15000 }),
      page.waitForURL('/home', { timeout: 15000 }),
      page.waitForTimeout(8000),
    ]);

    const signupDuration = Date.now() - signupStart;
    console.log(`Signup and login took: ${signupDuration}ms`);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await attachErrorArtifacts(page, testInfo, testContext);
    await cleanupTestData(testEmail);
  });

  test('should load home page quickly when connected', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for main content to appear
    const contentAppeared = await Promise.race([
      page.waitForSelector('h1, h2, [data-activity-card], .activity-card, main', { timeout: THRESHOLDS.HOME_CONTENT }),
      page.waitForTimeout(THRESHOLDS.HOME_CONTENT),
    ]);

    const loadTime = Date.now() - startTime;
    console.log(`Home page connected load time: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(THRESHOLDS.HOME_CONTENT);

    // Verify page is interactive
    const isInteractive = await page.evaluate(() => {
      return document.readyState === 'complete' || document.readyState === 'interactive';
    });
    expect(isInteractive).toBe(true);

    await page.screenshot({ path: 'test-results/performance-home-connected.png' });
  });

  test('should load activity detail quickly when connected', async ({ page }) => {
    // Navigate to home first
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const startTime = Date.now();

    // Navigate to an activity
    await page.goto('/activity/1a96a4e5-7cc0-43d5-a6ad-67d81657c1fc');

    // Wait for activity title to appear
    const titleAppeared = await page.waitForSelector('h1, h2', { timeout: THRESHOLDS.ACTIVITY_DETAIL }).catch(() => null);

    const loadTime = Date.now() - startTime;
    console.log(`Activity detail load time: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(THRESHOLDS.ACTIVITY_DETAIL);
    expect(titleAppeared).toBeTruthy();

    await page.screenshot({ path: 'test-results/performance-activity-connected.png' });
  });

  test('should load account page quickly when connected', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/mon-compte');

    // Wait for account page content
    const contentAppeared = await Promise.race([
      page.waitForSelector('text=/Mon compte|Bonjour/i', { timeout: THRESHOLDS.ACCOUNT_PAGE }),
      page.waitForSelector('.card, h1, h2', { timeout: THRESHOLDS.ACCOUNT_PAGE }),
    ]).catch(() => null);

    const loadTime = Date.now() - startTime;
    console.log(`Account page load time: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(THRESHOLDS.ACCOUNT_PAGE);

    await page.screenshot({ path: 'test-results/performance-account-connected.png' });
  });

  test('should search and display results quickly when connected', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find search input
    const searchInput = page.locator('input[placeholder*="Rechercher"], input[aria-label*="Rechercher"], input[type="search"]').first();

    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const startTime = Date.now();

      await searchInput.fill('Sport');
      await searchInput.press('Enter');

      // Wait for results
      const resultsAppeared = await Promise.race([
        page.waitForSelector('[data-activity-card], .activity-card, article', { timeout: THRESHOLDS.SEARCH_RESULTS }),
        page.waitForSelector('text=/résultat|activité/i', { timeout: THRESHOLDS.SEARCH_RESULTS }),
      ]).catch(() => null);

      const searchTime = Date.now() - startTime;
      console.log(`Search results load time: ${searchTime}ms`);

      expect(searchTime).toBeLessThan(THRESHOLDS.SEARCH_RESULTS);
    }

    await page.screenshot({ path: 'test-results/performance-search-connected.png' });
  });

  test('should navigate between pages quickly when connected', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const navigationTimes: { from: string; to: string; time: number }[] = [];

    // Test navigation to different pages
    const routes = [
      { name: 'Account', path: '/mon-compte' },
      { name: 'Home', path: '/' },
      { name: 'Search', path: '/search' },
    ];

    for (let i = 0; i < routes.length - 1; i++) {
      const from = routes[i];
      const to = routes[i + 1];

      await page.goto(from.path);
      await page.waitForLoadState('networkidle');

      const startTime = Date.now();
      await page.goto(to.path);
      await page.waitForLoadState('domcontentloaded');

      const navTime = Date.now() - startTime;
      navigationTimes.push({ from: from.name, to: to.name, time: navTime });

      console.log(`Navigation ${from.name} -> ${to.name}: ${navTime}ms`);
      expect(navTime).toBeLessThan(THRESHOLDS.NAVIGATION);
    }

    await page.screenshot({ path: 'test-results/performance-navigation-connected.png' });
  });

  test('should measure time to interactive (TTI) when connected', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Measure time to first paint
    const firstPaint = await page.evaluate(() => {
      const paint = performance.getEntriesByType('paint').find(e => e.name === 'first-paint');
      return paint?.startTime || 0;
    });

    // Measure time to first contentful paint
    const firstContentfulPaint = await page.evaluate(() => {
      const paint = performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint');
      return paint?.startTime || 0;
    });

    // Wait for full load
    await page.waitForLoadState('networkidle');
    const fullLoadTime = Date.now() - startTime;

    console.log(`Performance metrics (connected):
      First Paint: ${firstPaint.toFixed(2)}ms
      First Contentful Paint: ${firstContentfulPaint.toFixed(2)}ms
      Full Load: ${fullLoadTime}ms`);

    // Assert reasonable performance
    expect(fullLoadTime).toBeLessThan(10000); // Max 10s for full load

    await page.screenshot({ path: 'test-results/performance-tti-connected.png' });
  });

  test('should not have excessive network requests when connected', async ({ page }) => {
    const requests: { url: string; type: string; size: number }[] = [];

    page.on('response', async (response) => {
      const request = response.request();
      try {
        const size = parseInt(response.headers()['content-length'] || '0');
        requests.push({
          url: request.url(),
          type: request.resourceType(),
          size,
        });
      } catch {
        // Ignore response processing errors
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Analyze requests
    const totalRequests = requests.length;
    const apiRequests = requests.filter(r => r.url.includes('/rest/') || r.url.includes('/api/')).length;
    const totalSize = requests.reduce((sum, r) => sum + r.size, 0);

    console.log(`Network metrics (connected):
      Total Requests: ${totalRequests}
      API Requests: ${apiRequests}
      Total Size: ${(totalSize / 1024).toFixed(2)}KB`);

    // Assert reasonable limits
    expect(apiRequests).toBeLessThan(50); // Max 50 API calls on initial load
    expect(totalRequests).toBeLessThan(100); // Max 100 total requests

    await page.screenshot({ path: 'test-results/performance-network-connected.png' });
  });

  test('should maintain performance during tab switching', async ({ page }) => {
    await page.goto('/activity/1a96a4e5-7cc0-43d5-a6ad-67d81657c1fc');
    await page.waitForLoadState('networkidle');

    const tabSwitchTimes: { tab: string; time: number }[] = [];

    const tabs = [
      { value: 'tarifs', label: 'Tarifs' },
      { value: 'trajets', label: 'Trajets' },
      { value: 'infos', label: 'Infos' },
    ];

    for (const tab of tabs) {
      const tabElement = page.locator(`[data-value="${tab.value}"], text=/${tab.label}/i`).first();

      if (await tabElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        const startTime = Date.now();
        await tabElement.click();
        await page.waitForTimeout(500); // Wait for content to render
        const switchTime = Date.now() - startTime;

        tabSwitchTimes.push({ tab: tab.label, time: switchTime });
        console.log(`Tab switch to ${tab.label}: ${switchTime}ms`);

        expect(switchTime).toBeLessThan(1000); // Tab switch should be under 1s
      }
    }

    await page.screenshot({ path: 'test-results/performance-tabs-connected.png' });
  });
});
