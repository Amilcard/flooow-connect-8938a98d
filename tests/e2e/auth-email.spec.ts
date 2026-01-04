import { test, expect, TestContext, setupErrorCapture, attachErrorArtifacts } from './utils/test-harness';
import { ensureUserTypeGateDismissed } from './utils/ui-gates';
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

    // Dismiss any blocking modals
    await ensureUserTypeGateDismissed(page, 'adult');

    // Click on "Créer un compte" tab using role-based selector
    const signupTab = page.getByRole('tab', { name: /Créer un compte/i });
    await signupTab.click();
    await page.waitForTimeout(300);

    // Fill signup form using more robust selectors
    const emailInput = page.getByLabel(/Email/i).first();
    await emailInput.fill(testEmail);

    // Password field
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill(testPassword);

    // Confirm password if visible
    const confirmPasswordInput = page.getByLabel(/Confirmer/i);
    if (await confirmPasswordInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmPasswordInput.fill(testPassword);
    }

    // Submit using button role
    const submitButton = page.getByRole('button', { name: /Créer mon compte|Créer/i });
    await submitButton.click();

    // Wait for either redirect to home or success message
    await Promise.race([
      page.waitForURL('/', { timeout: 15000 }),
      page.waitForURL('/home', { timeout: 15000 }),
      page.waitForURL('/onboarding', { timeout: 15000 }),
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
    await ensureUserTypeGateDismissed(page, 'adult');

    // Create account first
    const signupTab = page.getByRole('tab', { name: /Créer un compte/i });
    await signupTab.click();
    await page.waitForTimeout(300);

    const emailInput = page.getByLabel(/Email/i).first();
    await emailInput.fill(testEmail);

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill(testPassword);

    const confirmPasswordInput = page.getByLabel(/Confirmer/i);
    if (await confirmPasswordInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmPasswordInput.fill(testPassword);
    }

    const createButton = page.getByRole('button', { name: /Créer mon compte|Créer/i });
    await createButton.click();

    // Wait for signup completion
    await Promise.race([
      page.waitForURL('/', { timeout: 15000 }),
      page.waitForURL('/home', { timeout: 15000 }),
      page.waitForURL('/onboarding', { timeout: 15000 }),
      page.waitForTimeout(5000),
    ]);

    // Go back to auth page for login test
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    await ensureUserTypeGateDismissed(page, 'adult');

    // Now test login - should be on login tab by default
    const loginEmailInput = page.locator('#login-email');
    if (await loginEmailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await loginEmailInput.fill(testEmail);
    } else {
      await page.getByLabel(/Email/i).first().fill(testEmail);
    }

    const loginPasswordInput = page.locator('#login-password');
    if (await loginPasswordInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await loginPasswordInput.fill(testPassword);
    } else {
      await page.locator('input[type="password"]').first().fill(testPassword);
    }

    // Submit login
    const loginButton = page.getByRole('button', { name: /Se connecter|Connexion/i });
    await loginButton.click();

    // Wait for redirect to home
    await Promise.race([
      page.waitForURL('/', { timeout: 15000 }),
      page.waitForURL('/home', { timeout: 15000 }),
    ]);

    await ensureUserTypeGateDismissed(page, 'adult');

    // Verify connected state - check for account button in bottom nav
    const accountButton = page.locator('[aria-label="Mon compte"], [data-tour-id="account"]');
    await expect(accountButton.first()).toBeVisible({ timeout: 5000 });

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
    await ensureUserTypeGateDismissed(page, 'adult');

    const signupTab = page.getByRole('tab', { name: /Créer un compte/i });
    await signupTab.click();
    await page.waitForTimeout(300);

    const emailInput = page.getByLabel(/Email/i).first();
    await emailInput.fill(testEmail);

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill(testPassword);

    const confirmPasswordInput = page.getByLabel(/Confirmer/i);
    if (await confirmPasswordInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmPasswordInput.fill(testPassword);
    }

    const createButton = page.getByRole('button', { name: /Créer mon compte|Créer/i });
    await createButton.click();

    await Promise.race([
      page.waitForURL('/', { timeout: 15000 }),
      page.waitForURL('/home', { timeout: 15000 }),
      page.waitForURL('/onboarding', { timeout: 15000 }),
    ]);

    await ensureUserTypeGateDismissed(page, 'adult');

    // Navigate to account page
    await page.goto('/mon-compte');
    await page.waitForLoadState('networkidle');
    await ensureUserTypeGateDismissed(page, 'adult');

    // Find and click logout button
    const logoutButton = page.getByRole('button', { name: /Se déconnecter|Déconnexion/i }).or(
      page.locator('text=Se déconnecter')
    ).first();
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
    await ensureUserTypeGateDismissed(page, 'adult');

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
    await ensureUserTypeGateDismissed(page, 'adult');

    const signupTab = page.getByRole('tab', { name: /Créer un compte/i });
    await signupTab.click();
    await page.waitForTimeout(300);

    const emailInput = page.getByLabel(/Email/i).first();
    await emailInput.fill(testEmail);

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill(testPassword);

    const confirmPasswordInput = page.getByLabel(/Confirmer/i);
    if (await confirmPasswordInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmPasswordInput.fill(testPassword);
    }

    const createButton = page.getByRole('button', { name: /Créer mon compte|Créer/i });
    await createButton.click();

    await Promise.race([
      page.waitForURL('/', { timeout: 15000 }),
      page.waitForURL('/home', { timeout: 15000 }),
      page.waitForURL('/onboarding', { timeout: 15000 }),
    ]);

    await ensureUserTypeGateDismissed(page, 'adult');

    // Navigate to home to check header
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await ensureUserTypeGateDismissed(page, 'adult');

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
    await ensureUserTypeGateDismissed(page, 'adult');

    // Try to login with invalid credentials using ID-based selectors
    const loginEmailInput = page.locator('#login-email');
    if (await loginEmailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await loginEmailInput.fill('invalid@test.com');
    } else {
      await page.getByLabel(/Email/i).first().fill('invalid@test.com');
    }

    const loginPasswordInput = page.locator('#login-password');
    if (await loginPasswordInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await loginPasswordInput.fill('wrongpassword');
    } else {
      await page.locator('input[type="password"]').first().fill('wrongpassword');
    }

    const loginButton = page.getByRole('button', { name: /Se connecter|Connexion/i });
    await loginButton.click();

    // Wait for error message
    await expect(
      page.locator('text=/identifiants invalides|email incorrect|mot de passe incorrect|erreur|incorrects/i')
    ).toBeVisible({ timeout: 10000 });

    // Should stay on auth page
    expect(page.url()).toContain('/auth');

    await page.screenshot({ path: 'test-results/auth-email-invalid-credentials.png' });
  });
});
