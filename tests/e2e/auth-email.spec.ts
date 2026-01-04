import { test, expect, TestContext, setupErrorCapture, attachErrorArtifacts } from './utils/test-harness';
import { testParents } from './fixtures/test-data';
import { cleanupTestData } from './utils/db-helpers';

/**
 * Test Suite: Auth Email Flow
 * Covers: signup, login, logout + header connected state verification
 * Bug coverage: Authentication flow stability
 */
test.describe('Auth Email - Signup/Login/Logout Flow', () => {
  let testContext: TestContext;

  // Generate unique email for each test run to avoid conflicts
  const generateTestEmail = () => `test.${Date.now()}@test.inklusif.fr`;

  test.beforeEach(async ({ page }) => {
    testContext = setupErrorCapture(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await attachErrorArtifacts(page, testInfo, testContext);
  });

  test('should signup a new user with email and password', async ({ page }) => {
    const testEmail = generateTestEmail();
    const testPassword = 'SecurePass123!';

    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Click on "Créer un compte" tab
    await page.click('text=Créer un compte');
    await page.waitForTimeout(500);

    // Fill signup form
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    // Look for confirm password field
    const confirmPasswordField = page.locator('input[name="confirmPassword"]');
    if (await confirmPasswordField.isVisible()) {
      await confirmPasswordField.fill(testPassword);
    }

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for either redirect to home or success message
    await Promise.race([
      page.waitForURL('/', { timeout: 15000 }),
      page.waitForURL('/home', { timeout: 15000 }),
      page.waitForSelector('text=/Bienvenue|compte créé|vérifiez votre email/i', { timeout: 15000 }),
    ]);

    // Capture screenshot of success state
    await page.screenshot({ path: 'test-results/auth-email-signup-success.png' });

    // Cleanup
    await cleanupTestData(testEmail);
  });

  test('should login with existing credentials', async ({ page }) => {
    // First create a user
    const testEmail = generateTestEmail();
    const testPassword = 'SecurePass123!';

    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Create account first
    await page.click('text=Créer un compte');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    const confirmPasswordField = page.locator('input[name="confirmPassword"]');
    if (await confirmPasswordField.isVisible()) {
      await confirmPasswordField.fill(testPassword);
    }

    await page.click('button[type="submit"]');

    // Wait for signup completion
    await Promise.race([
      page.waitForURL('/', { timeout: 15000 }),
      page.waitForURL('/home', { timeout: 15000 }),
      page.waitForTimeout(3000),
    ]);

    // Logout if we're logged in
    await page.goto('/auth');

    // Now test login
    await page.waitForLoadState('networkidle');

    // Fill login form (should be on login tab by default)
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    // Submit
    await page.click('button[type="submit"]');

    // Wait for redirect to home
    await Promise.race([
      page.waitForURL('/', { timeout: 15000 }),
      page.waitForURL('/home', { timeout: 15000 }),
    ]);

    // Verify connected state - check for account button in bottom nav
    const accountButton = page.locator('[aria-label="Mon compte"], [data-tour-id="account"]');
    await expect(accountButton).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: 'test-results/auth-email-login-success.png' });

    // Cleanup
    await cleanupTestData(testEmail);
  });

  test('should logout successfully and redirect to home', async ({ page }) => {
    const testEmail = generateTestEmail();
    const testPassword = 'SecurePass123!';

    // Create and login
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
    ]);

    // Navigate to account page
    await page.goto('/mon-compte');
    await page.waitForLoadState('networkidle');

    // Find and click logout button
    const logoutButton = page.locator('text=Se déconnecter, text=Déconnexion').first();
    await expect(logoutButton).toBeVisible({ timeout: 5000 });
    await logoutButton.click();

    // Should redirect to home or auth page
    await Promise.race([
      page.waitForURL('/home', { timeout: 10000 }),
      page.waitForURL('/auth', { timeout: 10000 }),
      page.waitForURL('/login', { timeout: 10000 }),
      page.waitForURL('/', { timeout: 10000 }),
    ]);

    // Verify we're logged out - account button should redirect to auth
    await page.goto('/mon-compte');

    // Should redirect to login if not authenticated
    await Promise.race([
      page.waitForURL('/auth', { timeout: 5000 }),
      page.waitForURL('/login', { timeout: 5000 }),
      page.waitForSelector('text=/connexion|se connecter/i', { timeout: 5000 }),
    ]);

    await page.screenshot({ path: 'test-results/auth-email-logout-success.png' });

    // Cleanup
    await cleanupTestData(testEmail);
  });

  test('should display connected header after login', async ({ page }) => {
    const testEmail = generateTestEmail();
    const testPassword = 'SecurePass123!';

    // Create account and login
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
    ]);

    // Navigate to home to check header
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify connected state indicators
    // Check for bottom navigation with Mon compte button
    const accountButton = page.locator('[aria-label="Mon compte"]');

    if (await accountButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(accountButton).toBeVisible();
    } else {
      // Alternative: check for any profile-related indicator
      const profileIndicators = page.locator('[data-tour-id="account"], .avatar, text=/Mon compte/i');
      await expect(profileIndicators.first()).toBeVisible({ timeout: 5000 });
    }

    await page.screenshot({ path: 'test-results/auth-email-header-connected.png' });

    // Cleanup
    await cleanupTestData(testEmail);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Try to login with invalid credentials
    await page.fill('input[name="email"]', 'invalid@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(
      page.locator('text=/identifiants invalides|email incorrect|mot de passe incorrect|erreur/i')
    ).toBeVisible({ timeout: 10000 });

    // Should stay on auth page
    expect(page.url()).toContain('/auth');

    await page.screenshot({ path: 'test-results/auth-email-invalid-credentials.png' });
  });
});
