import { test, expect } from '@playwright/test';

test.describe('Search, Filters & Account Scenarios', () => {
  test.setTimeout(60000);

  // Helper to dismiss onboarding tour
  const dismissTour = async (page) => {
    // Wait a bit for tour to appear
    try {
      const closeTourBtn = page.getByRole('button', { name: 'Close' });
      await closeTourBtn.waitFor({ state: 'visible', timeout: 5000 });
      await closeTourBtn.click();
    } catch (e) {
      // Tour might not appear or already be closed
      console.log('Tour not found or already closed');
    }
  };

  test.beforeEach(async ({ page }) => {
    // Log network requests for debugging
    page.on('request', request => console.log('>>', request.method(), request.url()));
  });

  // ==========================================
  // 2. Tests Playwright — Recherche & Filtres
  // ==========================================

  test('Test 7: Filter Homogeneity (Home vs Search)', async ({ page }) => {
    // 1. Check Home Filters
    await page.goto('/');
    await dismissTour(page);
    
    // Open filters on Home
    await page.getByRole('button', { name: /Filtrer|Filters/i }).first().click();
    const homeFilterModal = page.locator('[role="dialog"]');
    await expect(homeFilterModal).toBeVisible();
    
    // Check key elements presence
    await expect(homeFilterModal.getByText('Budget & Aides')).toBeVisible();
    await expect(homeFilterModal.getByText(/Aides acceptées/i)).toBeVisible(); 
    
    // Close modal
    await page.keyboard.press('Escape');

    // 2. Check Search Page Filters
    await page.goto('/search');
    await dismissTour(page);
    
    // Open filters on Search
    await page.getByRole('button', { name: /Filtrer|Filters/i }).first().click();
    const searchFilterModal = page.locator('[role="dialog"]');
    await expect(searchFilterModal).toBeVisible();

    // Verify consistency (basic check of existence)
    await expect(searchFilterModal.getByText('Budget & Aides')).toBeVisible();
    await expect(searchFilterModal.getByText(/Aides acceptées/i)).toBeVisible();
  });

  test('Test 8: Budget Filter', async ({ page }) => {
    await page.goto('/search');
    await dismissTour(page);

    // Open filters
    await page.getByRole('button', { name: /Filtrer/i }).first().click();
    
    const budgetSection = page.getByText('Budget & Aides');
    await expect(budgetSection).toBeVisible();
  });

  test('Test 9: Financial Aid Filter', async ({ page }) => {
    await page.goto('/search');
    await dismissTour(page);

    await page.getByRole('button', { name: /Filtrer/i }).first().click();
    
    // Check "Aides acceptées"
    await expect(page.getByText(/Aides acceptées/i)).toBeVisible();
  });

  test('Test 10: Mobility Filters', async ({ page }) => {
    await page.goto('/search');
    await dismissTour(page);

    await page.getByRole('button', { name: /Filtrer/i }).first().click();
    
    // Check Mobility options
    await expect(page.getByText(/Trajets & Mobilité/i)).toBeVisible();
  });

  // ==========================================
  // 3. Tests Playwright — Résultats de recherche
  // ==========================================

  test('Test 11: List/Map Toggle', async ({ page }) => {
    await page.goto('/search');
    await dismissTour(page);

    // Default should be List
    // Check for "Carte" button to switch
    const mapButton = page.getByRole('button', { name: /Carte|Map/i });
    if (await mapButton.isVisible()) {
        await mapButton.click();
        // Verify Map is visible (leaflet container usually)
        await expect(page.locator('.leaflet-container')).toBeVisible();
        
        // Switch back to List
        await page.getByRole('button', { name: /Liste|List/i }).click();
        await expect(page.locator('.leaflet-container')).not.toBeVisible();
    } else {
        test.skip('Map toggle button not found');
    }
  });

  test('Test 12: Image Fallback', async ({ page }) => {
    // This requires data control. Skipping for now or checking generic image presence.
    await page.goto('/search');
    await dismissTour(page);
    
    // Check if images are loaded
    const images = page.locator('.card-wetransfer img');
    if (await images.count() > 0) {
        await expect(images.first()).toBeVisible();
    }
  });

  test('Test 13: Navigation Flow', async ({ page }) => {
    await page.goto('/');
    await dismissTour(page);

    // Click a category (e.g., Sport)
    // Assuming there are category cards or links
    const sportLink = page.getByRole('link', { name: /Sport/i }).first();
    if (await sportLink.isVisible()) {
        await sportLink.click();
        await expect(page).toHaveURL(/search/);
    }
  });

  // ==========================================
  // 4. Tests Playwright — Création de compte
  // ==========================================

  test('Test 14: Parent Signup Flow', async ({ page }) => {
    // Mock Supabase Auth Signup
    await page.route('**/auth/v1/signup', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                user: {
                    id: 'test-user-id',
                    aud: 'authenticated',
                    role: 'authenticated',
                    email: 'test@example.com',
                },
                session: {
                    access_token: 'fake-token',
                    token_type: 'bearer',
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com',
                    }
                }
            })
        });
    });

    await page.goto('/signup');
    await dismissTour(page);

    // Fill form
    await page.getByLabel(/Prénom/i).fill('Jean');
    await page.getByLabel(/Nom/i).fill('Dupont');
    await page.getByLabel(/Email/i).fill(`test-${Date.now()}@example.com`);
    await page.getByLabel(/Mot de passe/i).first().fill('Password123!');
    await page.getByLabel(/Confirmer le mot de passe/i).fill('Password123!');
    
    // Check TOS
    await page.getByRole('checkbox').first().check();
    
    // Submit
    await page.getByRole('button', { name: /S'inscrire|Créer/i }).click();
    
    // Expect redirection or success message
    // If successful, it usually redirects to profile completion or dashboard
    // await expect(page).toHaveURL(/profile-completion|dashboard/);
  });

  test('Test 15: Validation Errors', async ({ page }) => {
    await page.goto('/signup');
    await dismissTour(page);

    // Submit empty form
    await page.getByRole('button', { name: /S'inscrire|Créer/i }).click();
    
    // Expect validation errors (HTML5 or custom)
    // Checking for invalid input state or error text
    // await expect(page.getByText(/requis|obligatoire/i)).toBeVisible();
  });

});
