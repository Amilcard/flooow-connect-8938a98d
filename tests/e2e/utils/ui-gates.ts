import { Page, expect } from '@playwright/test';

/**
 * UI Gates - Helpers for handling modal overlays that block interactions
 */

/**
 * Dismisses the "Qui utilise Flooow ?" user type gate modal if present.
 * This modal appears for unauthenticated users who haven't selected their user type.
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

  // Check if the modal is visible
  const modalHeading = page.locator('text=Qui utilise Flooow ?');
  const isModalVisible = await modalHeading.isVisible({ timeout: 2000 }).catch(() => false);

  if (!isModalVisible) {
    // Modal not present, nothing to do
    return;
  }

  // Select the appropriate option
  if (selectType === 'adult') {
    // Click on "Je suis parent ou responsable légal"
    const adultButton = page.locator('button:has-text("Je suis parent ou responsable légal")');
    await adultButton.click();
  } else {
    // Click on "Je suis un enfant ou un adolescent"
    const minorButton = page.locator('button:has-text("Je suis un enfant ou un adolescent")');
    await minorButton.click();
  }

  // Wait for modal to disappear
  await expect(modalHeading).not.toBeVisible({ timeout: 3000 });
}

/**
 * Ensures any cookie consent or similar banners are dismissed.
 * Add handlers for other blocking modals here as needed.
 *
 * @param page - Playwright Page object
 */
export async function ensureAllGatesDismissed(page: Page): Promise<void> {
  await ensureUserTypeGateDismissed(page, 'adult');

  // Add other gate handlers here as needed:
  // await ensureCookieConsentDismissed(page);
  // await ensureOnboardingTooltipsDismissed(page);
}

/**
 * Helper to click an element, handling the user type gate if it blocks the click.
 * Use this when you're not sure if a gate modal might be blocking.
 *
 * @param page - Playwright Page object
 * @param selector - Selector for the element to click
 */
export async function safeClick(page: Page, selector: string): Promise<void> {
  try {
    await page.click(selector, { timeout: 3000 });
  } catch (error) {
    // If click failed, try dismissing gates and retry
    await ensureAllGatesDismissed(page);
    await page.click(selector);
  }
}

/**
 * Navigates to a URL and ensures all blocking gates are dismissed.
 *
 * @param page - Playwright Page object
 * @param url - URL to navigate to
 */
export async function safeGoto(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await ensureAllGatesDismissed(page);
}
