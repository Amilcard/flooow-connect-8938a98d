import { test, expect, TestContext, setupErrorCapture, attachErrorArtifacts, assertNoCriticalErrors } from './utils/test-harness';
import { testParents } from './fixtures/test-data';
import { cleanupTestData } from './utils/db-helpers';

/**
 * Test Suite: Account White Screen Bug
 * Covers: Navigation to account/client space and verification of non-empty content
 * Bug: White screen when accessing account page
 */
test.describe('Account White Screen - Espace Client Navigation', () => {
  let testContext: TestContext;
  const testEmail = `test.account.${Date.now()}@test.inklusif.fr`;
  const testPassword = 'SecurePass123!';

  test.beforeEach(async ({ page }) => {
    testContext = setupErrorCapture(page);

    // Create and login a test user
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
      page.waitForTimeout(5000),
    ]);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await attachErrorArtifacts(page, testInfo, testContext);
    await cleanupTestData(testEmail);
  });

  test('should display account page content without white screen', async ({ page }) => {
    // Navigate to Mon Compte
    await page.goto('/mon-compte');
    await page.waitForLoadState('networkidle');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check that the page is not blank
    const bodyContent = await page.textContent('body');
    expect(bodyContent?.trim().length).toBeGreaterThan(50);

    // Check for expected content on account page
    const expectedElements = [
      page.locator('text=/Mon compte|Bonjour/i'),
      page.locator('text=/Mes informations|informations personnelles/i'),
      page.locator('text=/Mes enfants/i'),
      page.locator('text=/Déconnexion|Se déconnecter/i'),
    ];

    // At least one of these should be visible
    let foundExpectedContent = false;
    for (const element of expectedElements) {
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        foundExpectedContent = true;
        break;
      }
    }

    expect(foundExpectedContent).toBe(true);

    // Check for no console errors that indicate crash
    const criticalErrors = testContext.consoleLogs.errors.filter(
      (e) => e.includes('TypeError') || e.includes('Cannot read') || e.includes('undefined')
    );
    expect(criticalErrors.length).toBe(0);

    // Take screenshot
    await page.screenshot({ path: 'test-results/account-white-screen-check.png', fullPage: true });
  });

  test('should navigate to all account sub-pages without crash', async ({ page }) => {
    const subPages = [
      { path: '/mon-compte/informations', name: 'Mes informations' },
      { path: '/mon-compte/enfants', name: 'Mes enfants' },
      { path: '/mon-compte/reservations', name: 'Mes réservations' },
      { path: '/mon-compte/notifications', name: 'Mes notifications' },
      { path: '/mon-compte/eligibilite', name: 'Profil éligibilité' },
    ];

    for (const subPage of subPages) {
      await page.goto(subPage.path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      // Verify page is not blank
      const bodyContent = await page.textContent('body');
      expect(bodyContent?.trim().length).toBeGreaterThan(20);

      // Check for loading spinner or content
      const hasContent = await Promise.race([
        page.waitForSelector('h1, h2, h3, [role="main"], .card', { timeout: 5000 }).then(() => true),
        page.waitForTimeout(5000).then(() => false),
      ]);

      expect(hasContent).toBe(true);

      // No page errors
      const recentErrors = testContext.pageErrors.slice(-5);
      expect(recentErrors.filter(e => !e.message.includes('ResizeObserver')).length).toBe(0);

      await page.screenshot({
        path: `test-results/account-subpage-${subPage.path.replace(/\//g, '-')}.png`,
        fullPage: true
      });
    }
  });

  test('should display loading state, then content on account page', async ({ page }) => {
    await page.goto('/mon-compte');

    // Either loading state or content should appear quickly
    const firstVisible = await Promise.race([
      page.waitForSelector('text=/Chargement/i', { timeout: 3000 }).then(() => 'loading'),
      page.waitForSelector('text=/Mon compte|Bonjour/i', { timeout: 3000 }).then(() => 'content'),
    ]).catch(() => 'none');

    expect(firstVisible).not.toBe('none');

    // Wait for content to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Content should now be visible
    const mainContent = page.locator('text=/Mon compte|Bonjour|Mes espaces/i');
    await expect(mainContent.first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/account-loading-complete.png', fullPage: true });
  });

  test('should handle unauthenticated access gracefully', async ({ page }) => {
    // Clear session
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Try to access account page
    await page.goto('/mon-compte');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should redirect to login or show login prompt
    const currentUrl = page.url();
    const hasLoginRedirect = currentUrl.includes('/auth') || currentUrl.includes('/login');
    const hasLoginForm = await page.locator('input[name="email"], input[type="email"]').isVisible().catch(() => false);

    expect(hasLoginRedirect || hasLoginForm).toBe(true);

    await page.screenshot({ path: 'test-results/account-unauthenticated.png', fullPage: true });
  });
});
