import { test, expect } from '@playwright/test';
import { testParents, testChildren } from './fixtures/test-data';
import { signupParent, loginParent, isLoggedIn } from './utils/auth-helpers';
import { cleanupTestData } from './utils/db-helpers';

test.describe('Scenario 1: Parent Express Signup', () => {
  test.afterEach(async () => {
    await cleanupTestData(testParents.express.email);
  });

  test('should allow parent to register with minimal info and add child later', async ({ page }) => {
    const startTime = Date.now();

    // Step 1: Register parent with minimal info
    await signupParent(page, testParents.express);
    
    // Verify logged in
    expect(await isLoggedIn(page)).toBe(true);
    
    // Step 2: Navigate to profile to add child
    await page.click('[aria-label="Mon compte"]');
    await page.waitForURL('/profile');
    
    // Step 3: Click "Ajouter un enfant"
    await page.click('text=Ajouter un enfant');
    
    // Step 4: Fill minimal child info
    await page.fill('input[name="first_name"]', testChildren.minimal.first_name);
    await page.fill('input[name="dob"]', testChildren.minimal.dob);
    
    // Step 5: Submit
    await page.click('button[type="submit"]');
    
    // Verify child appears in list
    await expect(page.locator(`text=${testChildren.minimal.first_name}`)).toBeVisible();
    
    const duration = Date.now() - startTime;
    console.log(`✅ Express signup completed in ${duration}ms`);
    
    // Screenshot for report
    await page.screenshot({ path: 'test-results/01-express-signup.png', fullPage: true });
  });
});

test.describe('Scenario 2: Parent Full Signup', () => {
  test.afterEach(async () => {
    await cleanupTestData(testParents.full.email);
  });

  test('should allow parent to complete full profile with child during signup', async ({ page }) => {
    const startTime = Date.now();

    // Step 1: Register parent
    await signupParent(page, testParents.full);
    
    // Step 2: Complete profile (if onboarding flow exists)
    // This would navigate through profile completion steps
    await page.goto('/profile/complete');
    
    await page.fill('input[name="first_name"]', testParents.full.profile.first_name);
    await page.fill('input[name="last_name"]', testParents.full.profile.last_name);
    await page.fill('input[name="phone"]', testParents.full.profile.phone);
    await page.fill('input[name="address"]', testParents.full.profile.address);
    
    await page.click('button:has-text("Suivant")');
    
    // Step 3: Add child with needs
    await page.fill('input[name="first_name"]', testChildren.withNeeds.first_name);
    await page.fill('input[name="dob"]', testChildren.withNeeds.dob);
    
    // Check accessibility flags
    await page.check('input[name="wheelchair"]');
    
    await page.fill('textarea[name="medical_notes"]', testChildren.withNeeds.needs_json.medical_notes);
    
    await page.click('button[type="submit"]');
    
    // Verify completion
    await page.waitForURL('/');
    
    const duration = Date.now() - startTime;
    console.log(`✅ Full signup completed in ${duration}ms`);
    
    await page.screenshot({ path: 'test-results/02-full-signup.png', fullPage: true });
  });
});
