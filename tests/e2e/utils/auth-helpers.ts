import { Page } from '@playwright/test';
import { testParents } from '../fixtures/test-data';
import { ensureUserTypeGateDismissed } from './ui-gates';

/**
 * Helper functions for authentication flows
 */

export async function signupParent(
  page: Page,
  userData: typeof testParents.express
) {
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');

  // Dismiss any blocking modals (e.g., "Qui utilise Flooow ?")
  await ensureUserTypeGateDismissed(page, 'adult');

  // Switch to signup tab using role-based selector
  const signupTab = page.getByRole('tab', { name: /Créer un compte/i });
  await signupTab.click();
  await page.waitForTimeout(300);

  // Fill signup form using label-based selectors
  const emailInput = page.getByLabel(/Email/i).first();
  await emailInput.fill(userData.email);

  // Password fields
  const passwordInputs = page.locator('input[type="password"]');
  await passwordInputs.first().fill(userData.password);

  // Confirm password if visible
  const confirmPasswordInput = page.getByLabel(/Confirmer/i);
  if (await confirmPasswordInput.isVisible({ timeout: 1000 }).catch(() => false)) {
    await confirmPasswordInput.fill(userData.password);
  }

  // Submit using button role
  const submitButton = page.getByRole('button', { name: /Créer mon compte|Créer/i });
  await submitButton.click();

  // Wait for redirect to home or onboarding
  await Promise.race([
    page.waitForURL('/', { timeout: 15000 }),
    page.waitForURL('/home', { timeout: 15000 }),
    page.waitForURL('/onboarding', { timeout: 15000 }),
  ]);

  // Handle any post-signup gates
  await ensureUserTypeGateDismissed(page, 'adult');
}

export async function loginParent(
  page: Page,
  email: string,
  password: string
) {
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');

  // Dismiss any blocking modals
  await ensureUserTypeGateDismissed(page, 'adult');

  // Fill login form using ID-based selectors (more specific)
  const loginEmailInput = page.locator('#login-email');
  if (await loginEmailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await loginEmailInput.fill(email);
  } else {
    await page.getByLabel(/Email/i).first().fill(email);
  }

  const loginPasswordInput = page.locator('#login-password');
  if (await loginPasswordInput.isVisible({ timeout: 1000 }).catch(() => false)) {
    await loginPasswordInput.fill(password);
  } else {
    await page.locator('input[type="password"]').first().fill(password);
  }

  // Submit using button role
  const loginButton = page.getByRole('button', { name: /Se connecter|Connexion/i });
  await loginButton.click();

  // Wait for redirect
  await Promise.race([
    page.waitForURL('/', { timeout: 15000 }),
    page.waitForURL('/home', { timeout: 15000 }),
  ]);

  // Handle any post-login gates
  await ensureUserTypeGateDismissed(page, 'adult');
}

export async function logoutUser(page: Page) {
  // Navigate to account page
  await page.goto('/mon-compte');
  await page.waitForLoadState('networkidle');
  await ensureUserTypeGateDismissed(page, 'adult');

  // Click logout button
  const logoutButton = page.getByRole('button', { name: /Se déconnecter|Déconnexion/i }).or(
    page.locator('text=Se déconnecter')
  ).first();
  await logoutButton.click();

  // Should redirect to home or auth
  await Promise.race([
    page.waitForURL('/auth', { timeout: 10000 }),
    page.waitForURL('/home', { timeout: 10000 }),
    page.waitForURL('/', { timeout: 10000 }),
  ]);
}

export async function isLoggedIn(page: Page): Promise<boolean> {
  // Handle any gates first
  await ensureUserTypeGateDismissed(page, 'adult');

  // Check if bottom nav shows "Mon compte" (only visible when logged in)
  const accountButton = page.locator('[aria-label="Mon compte"]');
  return accountButton.isVisible({ timeout: 2000 }).catch(() => false);
}
