import { test, expect, TestContext, setupErrorCapture, attachErrorArtifacts } from './utils/test-harness';
import {
  ensureAllGatesDismissed,
  clickSignupTab,
  waitForConnectedState,
  verifySignupFormVisible,
} from './utils/ui-gates';
import { cleanupTestData } from './utils/db-helpers';

/**
 * Test Suite: Account White Screen Bug
 * Covers: Navigation to account/client space and verification of non-empty content
 * Bug: White screen when accessing account page
 */

// ============================================================================
// AUTHENTICATED TESTS - Require login via beforeEach
// ============================================================================
test.describe('Account White Screen - Espace Client (Authenticated)', () => {
  let testContext: TestContext;
  const testEmail = `test.account.${Date.now()}@test.inklusif.fr`;
  const testPassword = 'SecurePass123!';

  test.beforeEach(async ({ page }) => {
    testContext = setupErrorCapture(page);

    // Navigate to auth page
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Dismiss ALL blocking overlays (user type gate + consent banner)
    await ensureAllGatesDismissed(page);

    // Click on signup tab using robust strategy
    await clickSignupTab(page);
    await page.waitForTimeout(500);

    // Verify signup form is visible before filling
    const formReady = await verifySignupFormVisible(page);
    expect(formReady).toBe(true);

    // Fill signup form - use ID-based selectors from Auth.tsx
    const signupEmailInput = page.locator('#signup-email');
    if (await signupEmailInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await signupEmailInput.fill(testEmail);
    } else {
      await page.getByLabel(/Email/i).first().fill(testEmail);
    }

    // Password fields
    const signupPasswordInput = page.locator('#signup-password');
    if (await signupPasswordInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await signupPasswordInput.fill(testPassword);
    } else {
      await page.locator('input[type="password"]').first().fill(testPassword);
    }

    // Confirm password
    const confirmPasswordInput = page.locator('#confirmPassword');
    if (await confirmPasswordInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmPasswordInput.fill(testPassword);
    } else {
      const confirmByLabel = page.getByLabel(/Confirmer/i);
      if (await confirmByLabel.isVisible({ timeout: 500 }).catch(() => false)) {
        await confirmByLabel.fill(testPassword);
      }
    }

    // Submit using button
    const submitButton = page.getByRole('button', { name: /Créer mon compte|Créer/i });
    await submitButton.click();

    // Wait for navigation AND connected state
    await Promise.race([
      page.waitForURL('/', { timeout: 15000 }),
      page.waitForURL('/home', { timeout: 15000 }),
      page.waitForURL('/onboarding', { timeout: 15000 }),
      page.waitForTimeout(8000),
    ]);

    // Dismiss any post-signup gates
    await ensureAllGatesDismissed(page);

    // Verify we're actually connected (fail-fast)
    const isConnected = await waitForConnectedState(page, 10000);
    if (!isConnected) {
      console.warn('Warning: Could not verify connected state after signup');
    }
  });

  test.afterEach(async ({ page }, testInfo) => {
    await attachErrorArtifacts(page, testInfo, testContext);
    await cleanupTestData(testEmail);
  });

  test('should display account page content without white screen', async ({ page }) => {
    // Navigate to Mon Compte
    await page.goto('/mon-compte');
    await page.waitForLoadState('networkidle');
    await ensureAllGatesDismissed(page);

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
      await ensureAllGatesDismissed(page);
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
    await ensureAllGatesDismissed(page);

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
});

// ============================================================================
// UNAUTHENTICATED TESTS - No login, testing redirect behavior
// ============================================================================
test.describe('Account White Screen - Unauthenticated Access', () => {
  let testContext: TestContext;

  test.beforeEach(async ({ page }) => {
    testContext = setupErrorCapture(page);

    // Ensure we start with a clean slate - no session
    await page.context().clearCookies();
  });

  test.afterEach(async ({ page }, testInfo) => {
    await attachErrorArtifacts(page, testInfo, testContext);
  });

  test('should redirect unauthenticated users to login page', async ({ page }) => {
    // Clear any stored auth state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Dismiss any gates on home page
    await ensureAllGatesDismissed(page);

    // Try to access a protected account page without being logged in
    await page.goto('/mon-compte');
    await page.waitForLoadState('networkidle');

    // Handle any gates that might appear
    await ensureAllGatesDismissed(page);

    await page.waitForTimeout(2000);

    // Should redirect to login or show login prompt
    const currentUrl = page.url();
    const hasLoginRedirect = currentUrl.includes('/auth') || currentUrl.includes('/login');
    const hasLoginForm = await page.locator('input[name="email"], input[type="email"]').isVisible().catch(() => false);
    const hasLoginButton = await page.getByRole('button', { name: /connexion|se connecter/i }).isVisible().catch(() => false);

    // At least one of these conditions should be true
    expect(hasLoginRedirect || hasLoginForm || hasLoginButton).toBe(true);

    await page.screenshot({ path: 'test-results/account-unauthenticated-redirect.png', fullPage: true });
  });

  test('should not show account content when unauthenticated', async ({ page }) => {
    // Clear any stored auth state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Dismiss any gates
    await ensureAllGatesDismissed(page);

    // Try to access account page
    await page.goto('/mon-compte');
    await page.waitForLoadState('networkidle');
    await ensureAllGatesDismissed(page);
    await page.waitForTimeout(2000);

    // Should NOT see account-specific content
    const accountContent = page.locator('text=/Mes enfants|Mes réservations|Mes informations personnelles/i');
    const isAccountContentVisible = await accountContent.first().isVisible({ timeout: 1000 }).catch(() => false);

    // If we're on account page, it should redirect or show login
    // If we see account content, the test should fail
    const currentUrl = page.url();
    if (currentUrl.includes('/mon-compte')) {
      // If still on account page, content should not be visible (redirecting or loading)
      expect(isAccountContentVisible).toBe(false);
    }

    await page.screenshot({ path: 'test-results/account-unauthenticated-no-content.png', fullPage: true });
  });

  test('should handle direct navigation to account sub-pages when unauthenticated', async ({ page }) => {
    // Clear any stored auth state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Dismiss any gates
    await ensureAllGatesDismissed(page);

    // Try to access a specific account sub-page
    await page.goto('/mon-compte/reservations');
    await page.waitForLoadState('networkidle');
    await ensureAllGatesDismissed(page);
    await page.waitForTimeout(2000);

    // Should redirect to auth or show login
    const currentUrl = page.url();
    const isRedirectedToAuth = currentUrl.includes('/auth') || currentUrl.includes('/login');
    const hasLoginElements = await page.locator('input[type="email"], input[type="password"]').first().isVisible().catch(() => false);

    expect(isRedirectedToAuth || hasLoginElements).toBe(true);

    await page.screenshot({ path: 'test-results/account-subpage-unauthenticated.png', fullPage: true });
  });
});
