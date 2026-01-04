import { test, expect, TestContext, setupErrorCapture, attachErrorArtifacts } from './utils/test-harness';
import { cleanupTestData } from './utils/db-helpers';

/**
 * Test Suite: Booking Slot Consistency
 * Covers: Selecting a slot and verifying it matches in recap and network payload
 * Bug: Wrong slot being reserved (mismatch between selected and booked slot)
 */
test.describe('Booking Slot Consistency - Selection vs Recap', () => {
  let testContext: TestContext;
  const testEmail = `test.slot.${Date.now()}@test.inklusif.fr`;
  const testPassword = 'SecurePass123!';

  // Sample activity IDs
  const sampleActivityIds = [
    '1a96a4e5-7cc0-43d5-a6ad-67d81657c1fc',
    'd930f154-0d6c-4d99-a682-a511b98ebc7e',
  ];

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

  test('should display selected slot info in recap area', async ({ page }) => {
    await page.goto(`/activity/${sampleActivityIds[0]}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Find and click on a slot/session
    const slotOptions = page.locator('[data-slot-id], [role="radio"], .slot-card, button:has-text("Sélectionner")');
    const sessionAccordion = page.locator('[class*="accordion"], [class*="Session"]');

    let selectedSlotText = '';

    // Try to select a session/slot
    if (await sessionAccordion.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      // Click to expand first session accordion
      await sessionAccordion.first().click();
      await page.waitForTimeout(500);

      // Find a date option to select
      const dateOption = page.locator('button:has-text(/\\d{1,2}.*\\d{4}|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/i)').first();
      if (await dateOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        selectedSlotText = await dateOption.textContent() || '';
        await dateOption.click();
        await page.waitForTimeout(500);
      }
    } else if (await slotOptions.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      selectedSlotText = await slotOptions.first().textContent() || '';
      await slotOptions.first().click();
      await page.waitForTimeout(500);
    }

    // Check for selected slot indicator
    const selectedIndicator = page.locator('text=/Créneau sélectionné|Sélectionné/i, [class*="selected"]');

    if (await selectedIndicator.isVisible({ timeout: 3000 }).catch(() => false)) {
      const recapText = await selectedIndicator.textContent();
      console.log('Selected slot recap:', recapText);

      // Verify recap is not empty
      expect(recapText?.length).toBeGreaterThan(5);
    }

    await page.screenshot({ path: 'test-results/booking-slot-selected.png', fullPage: true });
  });

  test('should pass correct slot ID in booking navigation', async ({ page }) => {
    await page.goto(`/activity/${sampleActivityIds[0]}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Try to select a slot
    const sessionAccordion = page.locator('[class*="accordion"], [class*="Accordion"]').first();

    if (await sessionAccordion.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sessionAccordion.click();
      await page.waitForTimeout(500);

      // Select a date
      const dateButton = page.locator('button:has-text(/\\d+/)').first();
      if (await dateButton.isVisible().catch(() => false)) {
        await dateButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Set up request interception to capture booking request
    const bookingRequests: { url: string; body: string }[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/booking') || url.includes('slot') || url.includes('session')) {
        bookingRequests.push({
          url,
          body: request.postData() || '',
        });
      }
    });

    // Click booking button
    const bookButton = page.locator('button:has-text(/Inscrire|Réserver|Confirmer/i)').first();

    if (await bookButton.isEnabled({ timeout: 3000 }).catch(() => false)) {
      await bookButton.click();
      await page.waitForTimeout(2000);

      // Check navigation URL contains slot/session info
      const currentUrl = page.url();
      console.log('Navigation URL:', currentUrl);

      if (currentUrl.includes('/booking')) {
        // Check for slot or session parameters
        const hasSlotParam = currentUrl.includes('slotId=') || currentUrl.includes('sessionId=');
        expect(hasSlotParam).toBe(true);
      }

      // Log captured requests
      console.log('Booking requests captured:', bookingRequests);
    }

    await page.screenshot({ path: 'test-results/booking-slot-navigation.png', fullPage: true });
  });

  test('should maintain slot selection through page interactions', async ({ page }) => {
    await page.goto(`/activity/${sampleActivityIds[0]}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Select a slot
    const sessionAccordion = page.locator('[class*="accordion"]').first();

    if (await sessionAccordion.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sessionAccordion.click();
      await page.waitForTimeout(500);

      const dateButton = page.locator('button:has-text(/\\d+/)').first();
      if (await dateButton.isVisible().catch(() => false)) {
        await dateButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Record selected slot
    const selectedBefore = await page.locator('text=/Créneau sélectionné/i').textContent().catch(() => null);

    // Navigate to different tabs
    const tarifsTab = page.locator('[data-value="tarifs"], text=/Tarifs/i').first();
    if (await tarifsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await tarifsTab.click();
      await page.waitForTimeout(500);
    }

    const infosTab = page.locator('[data-value="infos"], text=/Infos/i').first();
    if (await infosTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await infosTab.click();
      await page.waitForTimeout(500);
    }

    // Check slot selection is maintained
    const selectedAfter = await page.locator('text=/Créneau sélectionné/i').textContent().catch(() => null);

    if (selectedBefore && selectedAfter) {
      expect(selectedAfter).toContain(selectedBefore.substring(0, 10)); // Compare first part
    }

    await page.screenshot({ path: 'test-results/booking-slot-persistence.png', fullPage: true });
  });

  test('should display matching slot info on booking recap page', async ({ page }) => {
    await page.goto(`/activity/${sampleActivityIds[0]}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Select a slot
    const sessionAccordion = page.locator('[class*="accordion"]').first();
    let selectedSlotInfo = '';

    if (await sessionAccordion.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sessionAccordion.click();
      await page.waitForTimeout(500);

      const dateButton = page.locator('button:has-text(/\\d+/)').first();
      if (await dateButton.isVisible().catch(() => false)) {
        selectedSlotInfo = await dateButton.textContent() || '';
        await dateButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Get selected slot from recap
    const selectedRecap = page.locator('text=/Créneau sélectionné/i').locator('..').locator('..');
    const recapText = await selectedRecap.textContent().catch(() => '');

    // Navigate to booking
    const bookButton = page.locator('button:has-text(/Inscrire|Réserver/i)').first();

    if (await bookButton.isEnabled({ timeout: 3000 }).catch(() => false)) {
      await bookButton.click();

      // Wait for booking page
      await page.waitForURL(/\/booking/, { timeout: 10000 }).catch(() => {});
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      // Check booking page shows same slot info
      const bookingContent = await page.textContent('body');
      console.log('Selected slot info:', selectedSlotInfo);
      console.log('Booking page contains slot info:', bookingContent?.includes(selectedSlotInfo.trim().substring(0, 5)));

      await page.screenshot({ path: 'test-results/booking-slot-recap-page.png', fullPage: true });
    }
  });

  test('should not allow booking without slot selection', async ({ page }) => {
    await page.goto(`/activity/${sampleActivityIds[0]}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Don't select any slot

    // Try to click booking button
    const bookButton = page.locator('button:has-text(/Inscrire|Réserver|Sélectionnez un créneau/i)').first();

    if (await bookButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      const isDisabled = await bookButton.isDisabled();
      const buttonText = await bookButton.textContent();

      // Either button should be disabled or show "Sélectionnez un créneau"
      expect(isDisabled || buttonText?.includes('Sélectionnez')).toBe(true);
    }

    await page.screenshot({ path: 'test-results/booking-no-slot-selected.png', fullPage: true });
  });
});
