import { Page, expect } from '@playwright/test';

/**
 * UI Gates - Helpers for handling modal overlays that block interactions
 *
 * Order of overlays (by z-index):
 * 1. UserTypeGate (z-70) - "Qui utilise Flooow ?"
 * 2. ConsentBanner (z-60) - "Flooow est en phase de test"
 * 3. ParentGateModal (z-50) - "On fait connaissance ?"
 */

/**
 * Dismisses the user type gate modal if present.
 * Handles BOTH variants:
 * - Variant A: "Qui utilise Flooow ?" with "Je suis parent ou responsable légal"
 * - Variant B: "On fait connaissance ?" with "J'ai 18 ans ou plus"
 *
 * @param page - Playwright Page object
 * @param selectType - Which option to select: 'adult' (default) or 'minor'
 */
export async function ensureUserTypeGateDismissed(
  page: Page,
  selectType: 'adult' | 'minor' = 'adult'
): Promise<void> {
  // Wait a short moment for any modals to appear after navigation
  await page.waitForTimeout(500);

  // Check for Variant A: "Qui utilise Flooow ?"
  const variantAHeading = page.locator('text=Qui utilise Flooow ?');
  const isVariantAVisible = await variantAHeading.isVisible({ timeout: 1000 }).catch(() => false);

  if (isVariantAVisible) {
    if (selectType === 'adult') {
      const adultButton = page.locator('button:has-text("Je suis parent ou responsable légal")');
      await adultButton.click();
    } else {
      const minorButton = page.locator('button:has-text("Je suis un enfant ou un adolescent")');
      await minorButton.click();
    }
    await expect(variantAHeading).not.toBeVisible({ timeout: 3000 });
    return;
  }

  // Check for Variant B: "On fait connaissance ?"
  const variantBHeading = page.locator('text=On fait connaissance ?');
  const isVariantBVisible = await variantBHeading.isVisible({ timeout: 1000 }).catch(() => false);

  if (isVariantBVisible) {
    if (selectType === 'adult') {
      const adultButton = page.locator('button:has-text("J\'ai 18 ans ou plus")');
      await adultButton.click();
    } else {
      const minorButton = page.locator('button:has-text("J\'ai moins de 18 ans")');
      await minorButton.click();
    }
    await expect(variantBHeading).not.toBeVisible({ timeout: 3000 });
    return;
  }

  // No modal visible, nothing to do
}

/**
 * Dismisses the consent banner "Flooow est en phase de test" if visible.
 * This banner appears after the user type gate is dismissed.
 *
 * @param page - Playwright Page object
 * @param action - 'accept' or 'decline' (default: 'decline' for simpler test flow)
 */
export async function ensureConsentBannerDismissed(
  page: Page,
  action: 'accept' | 'decline' = 'decline'
): Promise<void> {
  // Wait a short moment for the banner to appear
  await page.waitForTimeout(300);

  // Check for consent banner
  const bannerHeading = page.locator('text=Flooow est en phase de test');
  const isBannerVisible = await bannerHeading.isVisible({ timeout: 1000 }).catch(() => false);

  if (!isBannerVisible) {
    return; // Banner not present
  }

  if (action === 'accept') {
    const acceptButton = page.getByRole('button', { name: /Oui.*accepte/i });
    await acceptButton.click();
  } else {
    // Try the "Non, merci" button or the X close button
    const declineButton = page.getByRole('button', { name: /Non.*merci/i });
    if (await declineButton.isVisible({ timeout: 500 }).catch(() => false)) {
      await declineButton.click();
    } else {
      // Fallback: click the X button
      const closeButton = page.locator('[aria-label="Fermer"]');
      if (await closeButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await closeButton.click();
      }
    }
  }

  // Wait for banner to disappear
  await expect(bannerHeading).not.toBeVisible({ timeout: 3000 });
}

/**
 * Ensures ALL blocking overlays are dismissed in the correct order.
 * Call this after any navigation before interacting with page elements.
 *
 * @param page - Playwright Page object
 */
export async function ensureAllGatesDismissed(page: Page): Promise<void> {
  // Dismiss user type gate first (highest z-index)
  await ensureUserTypeGateDismissed(page, 'adult');

  // Then dismiss consent banner if it appears
  await ensureConsentBannerDismissed(page, 'decline');
}

/**
 * Clicks on the signup tab/button on the auth page.
 * Tries multiple selector strategies for robustness.
 *
 * @param page - Playwright Page object
 */
export async function clickSignupTab(page: Page): Promise<void> {
  // Strategy 1: Try role="tab" (Radix UI Tabs)
  const tabTrigger = page.getByRole('tab', { name: /Créer un compte/i });
  if (await tabTrigger.isVisible({ timeout: 1000 }).catch(() => false)) {
    await tabTrigger.click();
    return;
  }

  // Strategy 2: Try as a button
  const buttonTrigger = page.getByRole('button', { name: /Créer un compte|S'inscrire|Inscription/i });
  if (await buttonTrigger.isVisible({ timeout: 1000 }).catch(() => false)) {
    await buttonTrigger.click();
    return;
  }

  // Strategy 3: Try as a link
  const linkTrigger = page.getByRole('link', { name: /Créer un compte|S'inscrire|Inscription/i });
  if (await linkTrigger.isVisible({ timeout: 1000 }).catch(() => false)) {
    await linkTrigger.click();
    return;
  }

  // Strategy 4: Fallback to text locator
  const textTrigger = page.locator('text=/Créer un compte|S\'inscrire|Inscription/i').first();
  await textTrigger.click();
}

/**
 * Waits for a connected state after login/signup.
 * Verifies the user is actually logged in before proceeding.
 *
 * @param page - Playwright Page object
 * @param timeout - Maximum time to wait in ms (default: 15000)
 */
export async function waitForConnectedState(page: Page, timeout = 15000): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    // Check for various indicators of connected state
    const indicators = [
      page.locator('[aria-label="Mon compte"]'),
      page.locator('text=Déconnexion'),
      page.locator('text=Se déconnecter'),
      page.locator('text=/Bonjour/i'),
      page.locator('[data-tour-id="account"]'),
      page.locator('.avatar'),
    ];

    for (const indicator of indicators) {
      if (await indicator.isVisible({ timeout: 500 }).catch(() => false)) {
        return true;
      }
    }

    await page.waitForTimeout(500);
  }

  return false;
}

/**
 * Verifies the signup form is visible and ready for input.
 *
 * @param page - Playwright Page object
 */
export async function verifySignupFormVisible(page: Page): Promise<boolean> {
  // Check for email input in signup form (has id="signup-email" or similar)
  const emailInput = page.locator('#signup-email, input[type="email"]').first();
  const passwordInput = page.locator('input[type="password"]').first();

  const emailVisible = await emailInput.isVisible({ timeout: 3000 }).catch(() => false);
  const passwordVisible = await passwordInput.isVisible({ timeout: 1000 }).catch(() => false);

  return emailVisible && passwordVisible;
}

/**
 * Safe navigation to a URL with automatic gate dismissal.
 *
 * @param page - Playwright Page object
 * @param url - URL to navigate to
 */
export async function safeGoto(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await ensureAllGatesDismissed(page);
}

/**
 * Helper to perform a click, handling any blocking gates.
 *
 * @param page - Playwright Page object
 * @param selector - Selector for the element to click
 */
export async function safeClick(page: Page, selector: string): Promise<void> {
  try {
    await page.click(selector, { timeout: 3000 });
  } catch {
    // If click failed, try dismissing gates and retry
    await ensureAllGatesDismissed(page);
    await page.click(selector);
  }
}
