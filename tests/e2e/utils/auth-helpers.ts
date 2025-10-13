import { Page } from '@playwright/test';
import { testParents } from '../fixtures/test-data';

/**
 * Helper functions for authentication flows
 */

export async function signupParent(
  page: Page,
  userData: typeof testParents.express
) {
  await page.goto('/auth');
  
  // Switch to signup tab
  await page.click('text=Créer un compte');
  
  // Fill signup form
  await page.fill('input[name="email"]', userData.email);
  await page.fill('input[name="password"]', userData.password);
  await page.fill('input[name="confirmPassword"]', userData.password);
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Wait for redirect to home
  await page.waitForURL('/', { timeout: 10000 });
}

export async function loginParent(
  page: Page,
  email: string,
  password: string
) {
  await page.goto('/auth');
  
  // Fill login form
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Wait for redirect
  await page.waitForURL('/', { timeout: 10000 });
}

export async function logoutUser(page: Page) {
  // Click on Mon compte in bottom nav
  await page.click('[aria-label="Mon compte"]');
  
  // Wait for profile page
  await page.waitForURL('/profile');
  
  // Click logout button
  await page.click('text=Déconnexion');
  
  // Should redirect to auth
  await page.waitForURL('/auth', { timeout: 5000 });
}

export async function isLoggedIn(page: Page): Promise<boolean> {
  // Check if bottom nav shows "Mon compte" (only visible when logged in)
  const accountButton = await page.$('[aria-label="Mon compte"]');
  return accountButton !== null;
}
