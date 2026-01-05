import { test, expect, TestContext, setupErrorCapture, attachErrorArtifacts, hasHorizontalOverflow, getOverflowingElements } from './utils/test-harness';

/**
 * Test Suite: Activity Overflow Mobile
 * Covers: Checking for horizontal scroll and text overflow on mobile viewports
 * Bug: Text overflow and horizontal scrolling on mobile devices
 */

// Mobile viewport configurations
const mobileDevices = [
  { name: 'iPhone 13', width: 390, height: 844 },
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'Pixel 7', width: 412, height: 915 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800 },
];

// Sample activity IDs
const sampleActivityIds = [
  '1a96a4e5-7cc0-43d5-a6ad-67d81657c1fc',
  'd930f154-0d6c-4d99-a682-a511b98ebc7e',
];

test.describe('Activity Overflow Mobile - No Horizontal Scroll', () => {
  let testContext: TestContext;

  test.beforeEach(async ({ page }) => {
    testContext = setupErrorCapture(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await attachErrorArtifacts(page, testInfo, testContext);
  });

  for (const device of mobileDevices) {
    test(`should have no horizontal overflow on ${device.name}`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize({ width: device.width, height: device.height });

      // Navigate to activity detail
      await page.goto(`/activity/${sampleActivityIds[0]}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      // Check for horizontal overflow
      const hasOverflow = await hasHorizontalOverflow(page);

      if (hasOverflow) {
        // Get details about overflowing elements
        const overflowingElements = await getOverflowingElements(page);
        console.log(`Overflowing elements on ${device.name}:`, overflowingElements);
      }

      expect(hasOverflow).toBe(false);

      await page.screenshot({
        path: `test-results/activity-overflow-${device.name.replace(/\s/g, '-')}.png`,
        fullPage: true
      });
    });
  }

  test('should display text without truncation issues on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`/activity/${sampleActivityIds[0]}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check title is visible and not overflowing
    const title = page.locator('h1, h2').first();
    await expect(title).toBeVisible({ timeout: 5000 });

    const titleBox = await title.boundingBox();
    if (titleBox) {
      // Title should be within viewport
      expect(titleBox.x).toBeGreaterThanOrEqual(0);
      expect(titleBox.x + titleBox.width).toBeLessThanOrEqual(375 + 5); // Small margin for rounding
    }

    // Check description text
    const description = page.locator('p').first();
    if (await description.isVisible().catch(() => false)) {
      const descBox = await description.boundingBox();
      if (descBox) {
        expect(descBox.x).toBeGreaterThanOrEqual(0);
        expect(descBox.x + descBox.width).toBeLessThanOrEqual(375 + 5);
      }
    }

    await page.screenshot({ path: 'test-results/activity-text-mobile.png', fullPage: true });
  });

  test('should have proper button sizing on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`/activity/${sampleActivityIds[0]}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check all buttons are within viewport
    const buttons = await page.locator('button').all();

    for (const button of buttons.slice(0, 10)) { // Check first 10 buttons
      if (await button.isVisible().catch(() => false)) {
        const box = await button.boundingBox();
        if (box) {
          expect(box.x).toBeGreaterThanOrEqual(-5); // Small tolerance
          expect(box.x + box.width).toBeLessThanOrEqual(380); // viewport + tolerance
        }
      }
    }

    await page.screenshot({ path: 'test-results/activity-buttons-mobile.png', fullPage: true });
  });

  test('should navigate tabs without overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`/activity/${sampleActivityIds[0]}`);
    await page.waitForLoadState('networkidle');

    const tabs = ['infos', 'tarifs', 'trajets'];

    for (const tabName of tabs) {
      const tab = page.locator(`[data-value="${tabName}"], text=/${tabName}/i`).first();

      if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(500);

        // Check no overflow after tab change
        const hasOverflow = await hasHorizontalOverflow(page);

        if (hasOverflow) {
          const overflowingElements = await getOverflowingElements(page);
          console.log(`Overflowing elements on tab ${tabName}:`, overflowingElements);
        }

        expect(hasOverflow).toBe(false);

        await page.screenshot({
          path: `test-results/activity-tab-${tabName}-mobile.png`,
          fullPage: true
        });
      }
    }
  });

  test('should display cards properly without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`/activity/${sampleActivityIds[0]}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check card elements
    const cards = await page.locator('.card, [class*="Card"]').all();

    for (const card of cards.slice(0, 5)) { // Check first 5 cards
      if (await card.isVisible().catch(() => false)) {
        const box = await card.boundingBox();
        if (box) {
          expect(box.x).toBeGreaterThanOrEqual(-5);
          expect(box.x + box.width).toBeLessThanOrEqual(380);
        }
      }
    }

    await page.screenshot({ path: 'test-results/activity-cards-mobile.png', fullPage: true });
  });

  test('should scroll vertically without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`/activity/${sampleActivityIds[0]}`);
    await page.waitForLoadState('networkidle');

    // Scroll down the page
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    let hasOverflow = await hasHorizontalOverflow(page);
    expect(hasOverflow).toBe(false);

    // Scroll more
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);

    hasOverflow = await hasHorizontalOverflow(page);
    expect(hasOverflow).toBe(false);

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    hasOverflow = await hasHorizontalOverflow(page);
    expect(hasOverflow).toBe(false);

    await page.screenshot({ path: 'test-results/activity-scroll-bottom-mobile.png', fullPage: true });
  });

  test('should display slot selection without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`/activity/${sampleActivityIds[0]}`);
    await page.waitForLoadState('networkidle');

    // Look for slot/session selection area
    const slotsSection = page.locator('[data-tour-id="aid-creneaux-list"], text=/Horaires|Créneaux/i');

    if (await slotsSection.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      // Scroll to slots section
      await slotsSection.first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      const hasOverflow = await hasHorizontalOverflow(page);
      expect(hasOverflow).toBe(false);

      await page.screenshot({ path: 'test-results/activity-slots-mobile.png', fullPage: true });
    }
  });
});
