import { Page } from '@playwright/test';
import { testParents } from '../fixtures/test-data';
import {
  ensureAllGatesDismissed,
  clickSignupTab,
  waitForConnectedState,
  verifySignupFormVisible,
} from './ui-gates';

/**
 * Helper functions for authentication flows
 */

export async function signupParent(
  page: Page,
  userData: typeof testParents.express
) {
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');

  // Dismiss all blocking overlays
  await ensureAllGatesDismissed(page);

  // Switch to signup tab using robust strategy
  await clickSignupTab(page);
  await page.waitForTimeout(500);

  // Verify form is ready
  const formReady = await verifySignupFormVisible(page);
  if (!formReady) {
    throw new Error('Signup form not visible after clicking signup tab');
  }

  // Fill signup form using ID-based selectors
  const signupEmailInput = page.locator('#signup-email');
  if (await signupEmailInput.isVisible({ timeout: 1000 }).catch(() => false)) {
    await signupEmailInput.fill(userData.email);
  } else {
    await page.getByLabel(/Email/i).first().fill(userData.email);
  }

  // Password
  const signupPasswordInput = page.locator('#signup-password');
  if (await signupPasswordInput.isVisible({ timeout: 1000 }).catch(() => false)) {
    await signupPasswordInput.fill(userData.password);
  } else {
    await page.locator('input[type="password"]').first().fill(userData.password);
  }

  // Confirm password
  const confirmPasswordInput = page.locator('#confirmPassword');
  if (await confirmPasswordInput.isVisible({ timeout: 1000 }).catch(() => false)) {
    await confirmPasswordInput.fill(userData.password);
  } else {
    const confirmByLabel = page.getByLabel(/Confirmer/i);
    if (await confirmByLabel.isVisible({ timeout: 500 }).catch(() => false)) {
      await confirmByLabel.fill(userData.password);
    }
  }

  // Submit
  const submitButton = page.getByRole('button', { name: /Créer mon compte|Créer/i });
  await submitButton.click();

  // Wait for redirect to home or onboarding
  await Promise.race([
    page.waitForURL('/', { timeout: 15000 }),
    page.waitForURL('/home', { timeout: 15000 }),
    page.waitForURL('/onboarding', { timeout: 15000 }),
  ]);

  // Handle any post-signup gates
  await ensureAllGatesDismissed(page);

  // Verify connected state
  const isConnected = await waitForConnectedState(page, 10000);
  if (!isConnected) {
    console.warn('Warning: Could not verify connected state after signup');
  }
}

export async function loginParent(
  page: Page,
  email: string,
  password: string
) {
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');

  // Dismiss all blocking overlays
  await ensureAllGatesDismissed(page);

  // Fill login form using ID-based selectors
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

  // Submit
  const loginButton = page.getByRole('button', { name: /Se connecter|Connexion/i });
  await loginButton.click();

  // Wait for redirect
  await Promise.race([
    page.waitForURL('/', { timeout: 15000 }),
    page.waitForURL('/home', { timeout: 15000 }),
  ]);

  // Handle any post-login gates
  await ensureAllGatesDismissed(page);

  // Verify connected state
  const isConnected = await waitForConnectedState(page, 10000);
  if (!isConnected) {
    console.warn('Warning: Could not verify connected state after login');
  }
}

export async function logoutUser(page: Page) {
  // Navigate to account page
  await page.goto('/mon-compte');
  await page.waitForLoadState('networkidle');
  await ensureAllGatesDismissed(page);

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
  await ensureAllGatesDismissed(page);

  // Use waitForConnectedState to check
  return waitForConnectedState(page, 3000);
}
