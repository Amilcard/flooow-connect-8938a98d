import { test, expect } from '@playwright/test';
import { testParents, testChildren, testActivities, generateIdempotencyKey } from './fixtures/test-data';
import { signupParent, loginParent } from './utils/auth-helpers';
import { cleanupTestData, getActivityByTitle, createTestSlot } from './utils/db-helpers';

test.describe('Scenario 4: Booking Standard', () => {
  let activityId: string;
  let slotId: string;

  test.beforeEach(async () => {
    // Get Tennis activity
    const activity = await getActivityByTitle(testActivities.tennis.title);
    activityId = activity.id;
    
    // Create test slot with available seats
    const slot = await createTestSlot(activityId, 5);
    slotId = slot.id;
  });

  test.afterEach(async () => {
    await cleanupTestData(testParents.express.email);
  });

  test('should complete full booking flow with idempotency', async ({ page }) => {
    const startTime = Date.now();
    const idempotencyKey = generateIdempotencyKey();

    // Step 1: Setup - Create parent and child
    await signupParent(page, testParents.express);
    
    // Add child via API for faster setup
    // (In real test, would go through UI)
    await page.goto('/profile/children/add');
    await page.fill('input[name="first_name"]', testChildren.minimal.first_name);
    await page.fill('input[name="dob"]', testChildren.minimal.dob);
    await page.click('button[type="submit"]');

    // Step 2: Search for activity
    await page.goto('/');
    const searchBar = page.locator('input[aria-label="Rechercher des activités"]');
    await searchBar.fill('Tennis');
    await searchBar.press('Enter');
    
    // Step 3: Open activity detail
    await page.click(`text=${testActivities.tennis.title}`);
    await page.waitForURL(`/activity/${activityId}`);
    
    // Verify activity details
    await expect(page.locator('h2')).toContainText(testActivities.tennis.title);
    await expect(page.locator('text=180€')).toBeVisible();
    
    // Step 4: Select time slot
    const slotCard = page.locator('[data-slot-id]').first();
    await slotCard.click();
    
    // Step 5: Select child
    await page.click(`text=${testChildren.minimal.first_name}`);
    
    // Step 6: Simulate financial aid selection
    await page.click('text=Ajouter une aide');
    await page.selectOption('select[name="aid_type"]', 'CAF');
    await page.fill('input[name="aid_amount"]', '50');
    await page.fill('input[name="aid_reference"]', 'CAF123456');
    await page.click('button:has-text("Valider l\'aide")');
    
    // Step 7: Submit booking with idempotency key
    // (Idempotency key should be auto-generated or set in hidden field)
    await page.click('button:has-text("Inscription")');
    
    // Wait for confirmation
    await expect(page.locator('text=Demande envoyée')).toBeVisible({ timeout: 5000 });
    
    // Step 8: Verify booking status is "en_attente"
    await page.goto('/bookings');
    await expect(page.locator('text=En attente')).toBeVisible();
    
    const duration = Date.now() - startTime;
    console.log(`✅ Standard booking completed in ${duration}ms`);
    
    // Verify idempotency - retry should not create duplicate
    await page.click('button:has-text("Inscription")');
    
    // Should show message about existing booking
    await expect(page.locator('text=réservation existe déjà')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/04-booking-standard.png', fullPage: true });
  });

  test('should measure latency for activity search', async ({ page }) => {
    await page.goto('/');
    
    const startTime = performance.now();
    
    const searchBar = page.locator('input[aria-label="Rechercher des activités"]');
    await searchBar.fill('Tennis');
    await searchBar.press('Enter');
    
    // Wait for results to appear
    await page.waitForSelector('[data-activity-card]', { timeout: 5000 });
    
    const endTime = performance.now();
    const latency = endTime - startTime;
    
    console.log(`🕐 Search latency: ${latency.toFixed(2)}ms`);
    
    // Assert latency is under 2 seconds
    expect(latency).toBeLessThan(2000);
  });
});
