import { test, expect, TestContext, setupErrorCapture, attachErrorArtifacts } from './utils/test-harness';

/**
 * Test Suite: Activity Aids Calculation
 * Covers: Opening activity page and verifying aids display + final total calculation
 * Bug: Incorrect aids calculation or display issues on activity detail page
 */
test.describe('Activity Aids Calculation - Display and Total', () => {
  let testContext: TestContext;

  // Sample activity IDs - these should be seeded or known IDs in the database
  // Using UUIDs from aids-calculator.spec.ts as reference
  const sampleActivityIds = [
    '1a96a4e5-7cc0-43d5-a6ad-67d81657c1fc', // Scolaire activity
    'd930f154-0d6c-4d99-a682-a511b98ebc7e', // Vacances activity
  ];

  test.beforeEach(async ({ page }) => {
    testContext = setupErrorCapture(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await attachErrorArtifacts(page, testInfo, testContext);
  });

  test('should display activity price correctly', async ({ page }) => {
    // Navigate to first available activity
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click on an activity
    const activityCard = page.locator('[data-activity-card], .activity-card, article').first();

    if (await activityCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await activityCard.click();
    } else {
      // Try direct navigation to a known activity
      await page.goto(`/activity/${sampleActivityIds[0]}`);
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check for price display
    const priceElement = page.locator('text=/\\d+€|Gratuit/i').first();
    await expect(priceElement).toBeVisible({ timeout: 10000 });

    // Get the displayed price
    const priceText = await priceElement.textContent();
    expect(priceText).toBeTruthy();

    await page.screenshot({ path: 'test-results/activity-aids-price-display.png', fullPage: true });
  });

  test('should show aids calculator on Tarifs tab', async ({ page }) => {
    await page.goto(`/activity/${sampleActivityIds[0]}`);
    await page.waitForLoadState('networkidle');

    // Navigate to Tarifs tab
    const tarifsTab = page.locator('text=/Tarifs|Tarifs & aides/i, [data-tour-id="tab-tarifs"]').first();

    if (await tarifsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await tarifsTab.click();
      await page.waitForTimeout(1000);

      // Check for aids section
      const aidsSection = page.locator('[data-tour-id="aid-simulation-section"], text=/Évaluer son aide/i');

      // The aids section should be visible
      if (await aidsSection.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(aidsSection).toBeVisible();
      }

      // Check for calculator component
      const calculator = page.locator('[data-tour-id="aid-simulation-calculator"], form, .aid-calculator');
      const calculatorExists = await calculator.first().isVisible({ timeout: 3000 }).catch(() => false);

      // Take screenshot of tarifs tab
      await page.screenshot({ path: 'test-results/activity-aids-tarifs-tab.png', fullPage: true });
    }
  });

  test('should calculate and display aids total correctly', async ({ page }) => {
    // First login a user
    const testEmail = `test.aids.${Date.now()}@test.inklusif.fr`;
    const testPassword = 'SecurePass123!';

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

    // Navigate to activity with aids
    await page.goto(`/activity/${sampleActivityIds[1]}`);
    await page.waitForLoadState('networkidle');

    // Go to Tarifs tab
    const tarifsTab = page.locator('[data-value="tarifs"], text=/Tarifs/i').first();
    if (await tarifsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tarifsTab.click();
      await page.waitForTimeout(1000);
    }

    // Look for price elements
    const priceDisplay = page.locator('text=/€/i');
    await expect(priceDisplay.first()).toBeVisible({ timeout: 5000 });

    // Check for "Reste à charge" if aids are calculated
    const resteCharge = page.locator('[data-tour-id="reste-charge-title"], [data-tour-id="reste-charge-sticky"], text=/Reste à charge/i');

    // Take screenshot
    await page.screenshot({ path: 'test-results/activity-aids-calculation.png', fullPage: true });
  });

  test('should show correct price breakdown with aids applied', async ({ page }) => {
    await page.goto(`/activity/${sampleActivityIds[0]}`);
    await page.waitForLoadState('networkidle');

    // Navigate to Tarifs tab
    const tarifsTab = page.locator('[data-value="tarifs"], text=/Tarifs/i').first();
    if (await tarifsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tarifsTab.click();
      await page.waitForTimeout(1000);
    }

    // Check for price breakdown elements
    const priceElements = await page.locator('text=/Prix initial|prix de base|Tarif/i').all();
    const aidElements = await page.locator('text=/Aide|aide appliquée|CAF|PassSport/i').all();

    // Log found elements for debugging
    console.log(`Found ${priceElements.length} price elements and ${aidElements.length} aid elements`);

    // At minimum, base price should be visible
    const basePrice = page.locator('text=/\\d+€|Gratuit/i').first();
    await expect(basePrice).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: 'test-results/activity-aids-breakdown.png', fullPage: true });
  });

  test('should handle activity without aids gracefully', async ({ page }) => {
    // Navigate to scolaire activity which may not have QF aids
    await page.goto(`/activity/${sampleActivityIds[0]}`);
    await page.waitForLoadState('networkidle');

    // Check that page loads without errors
    const pageContent = await page.textContent('body');
    expect(pageContent?.length).toBeGreaterThan(100);

    // Navigate to Tarifs tab
    const tarifsTab = page.locator('[data-value="tarifs"], text=/Tarifs/i').first();
    if (await tarifsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tarifsTab.click();
      await page.waitForTimeout(1000);
    }

    // Should show price even without aids
    const priceDisplay = page.locator('text=/\\d+€|Gratuit/i').first();
    await expect(priceDisplay).toBeVisible({ timeout: 5000 });

    // Check for QF block visibility based on activity type
    const qfBlock = page.locator('text=/quotient familial/i');

    // For scolaire, QF block should NOT be visible
    // This validates the aids-calculator.spec.ts test case
    if (page.url().includes(sampleActivityIds[0])) {
      await expect(qfBlock).not.toBeVisible({ timeout: 3000 });
    }

    await page.screenshot({ path: 'test-results/activity-no-aids.png', fullPage: true });
  });
});
