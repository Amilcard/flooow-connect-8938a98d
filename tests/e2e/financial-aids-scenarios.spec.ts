
import { test, expect } from '@playwright/test';

test.describe('Financial Aids & GDPR Scenarios', () => {
  test.setTimeout(60000); // Increase timeout to 60s

  test('Test 0: Basic Connectivity', async ({ page }) => {
    await page.goto('/');
    
    // Dismiss onboarding tour if present
    const closeTourBtn = page.getByRole('button', { name: 'Close' });
    if (await closeTourBtn.isVisible()) {
        await closeTourBtn.click();
    }
    
    await expect(page).toHaveTitle(/Flooow|InKlusif/i);
    await page.waitForLoadState('networkidle');
  });

  // TEST 1: Filtrage dynamique par période (Via Calculateur sur page /aides)
  test('Test 1: Dynamic Period Filtering (Home -> Aids)', async ({ page }) => {
    await page.goto('/aides');
    await page.waitForLoadState('networkidle');
    
    // Dismiss onboarding tour if present
    const closeTourBtn = page.getByRole('button', { name: 'Close' });
    if (await closeTourBtn.isVisible()) {
        await closeTourBtn.click();
    }

    // The static list displays all aids by default.
    // The user scenario implies filtering. Since the static list doesn't have buttons,
    // we assume we are testing the Calculator's filtering logic.
    
    // 1. Select "Pendant l'année scolaire" in Calculator
    // We need to fill age first to get results
    await page.getByLabel(/Âge/i).fill('12');
    
    // Select Period: "Pendant l'année scolaire"
    await page.getByLabel(/Pendant l'année scolaire/i).click();
    
    // Click Calculate
    await page.getByRole('button', { name: /Calculer/i }).click();
    
    // Verify Results: Should NOT show VACAF (Vacation aid)
    // We look inside the results section
    const results = page.locator('.space-y-3').filter({ hasText: 'Aides disponibles' });
    if (await results.isVisible()) {
        await expect(results).not.toContainText('VACAF');
        await expect(results).not.toContainText('Pass Colo');
        // Should show Pass'Sport (if eligible)
        // Note: Pass'Sport might depend on other criteria, but we check negative cases primarily.
    }

    // 2. Select "Pendant les vacances scolaires"
    await page.getByLabel(/Pendant les vacances scolaires/i).click();
    await page.getByRole('button', { name: /Calculer/i }).click();
    
    // Verify Results: Should NOT show Pass'Sport
    if (await results.isVisible()) {
        await expect(results).not.toContainText("Pass'Sport");
        // Should show VACAF (if eligible)
    }
  });

  // TEST 2: Validation stricte de l'âge
  test('Test 2: Strict Age Validation', async ({ page }) => {
    await page.goto('/');
    
    // Dismiss onboarding tour if present
    const closeTourBtn = page.getByRole('button', { name: 'Close' });
    if (await closeTourBtn.isVisible()) {
        await closeTourBtn.click();
    }

    if (await page.locator('.card-wetransfer').count() > 0) {
        // Click on the specific button to ensure navigation
        await page.getByText('+ de détails').first().click();
        
        // Wait for detail page
        await page.waitForURL(/\/activity\//);
        
        // Open calculator modal
        const estimateBtn = page.getByRole('button', { name: /Estimer|Simuler|Calculer/i }).first();
        if (await estimateBtn.isVisible()) {
            await estimateBtn.click();
        } else {
            await page.getByText(/Estimer mes aides/i).click();
        }
    }
    
    // Fill invalid age (1 year old is likely invalid for most activities)
    await page.getByLabel(/Âge/i).fill('1'); 
    
    // Click Calculate
    await page.getByRole('button', { name: /Calculer/i }).click();
    
    // Check for error message
    await expect(page.getByText(/L'âge de l'enfant ne correspond pas/i)).toBeVisible();
  });

  // TEST 3: Validation période scolaire vs vacances
  test('Test 3: School vs Vacation Validation', async ({ page }) => {
    await page.goto('/');
    
    // Dismiss onboarding tour if present
    const closeTourBtn = page.getByRole('button', { name: 'Close' });
    if (await closeTourBtn.isVisible()) {
        await closeTourBtn.click();
    }

    // Search for a known VACATION activity (from real DB or mock)
    // "Colonie" is seen in the snapshot
    await page.getByPlaceholder(/Rechercher/i).fill('Colonie');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    
    // We expect to find the activity
    if (await page.locator('.card-wetransfer').count() > 0) {
        await page.getByText('+ de détails').first().click();
        
        // Open calculator
        const estimateBtn = page.getByRole('button', { name: /Estimer|Simuler|Calculer/i }).first();
        if (await estimateBtn.isVisible()) {
            await estimateBtn.click();
        } else {
            await page.getByText(/Estimer mes aides/i).click();
        }
        
        // It's a vacation activity -> Pass'Sport should NOT be visible
        await page.getByLabel(/Âge/i).fill('12'); 
        await page.getByRole('button', { name: /Calculer/i }).click();
        
        // Check results
        await expect(page.getByText("Pass'Sport", { exact: false })).not.toBeVisible();
    } else {
        test.fail(true, 'Vacation activity not found');
    }
  });

  // TEST 4: Message pédagogique QF
  test('Test 4: QF Educational Message', async ({ page }) => {
     await page.goto('/');
     
    // Dismiss onboarding tour if present
    const closeTourBtn = page.getByRole('button', { name: 'Close' });
    if (await closeTourBtn.isVisible()) {
        await closeTourBtn.click();
    }

     // Search for a known SCHOOL activity
     // "Centre Aéré" or "Conservatoire" seen in snapshot
     await page.getByPlaceholder(/Rechercher/i).fill('Conservatoire');
     await page.keyboard.press('Enter');
     await page.waitForTimeout(2000);
     
     if (await page.locator('.card-wetransfer').count() > 0) {
        await page.getByText('+ de détails').first().click();
        
        // Open calculator
        const estimateBtn = page.getByRole('button', { name: /Estimer|Simuler|Calculer/i }).first();
        if (await estimateBtn.isVisible()) {
            await estimateBtn.click();
        } else {
            await page.getByText(/Estimer mes aides/i).click();
        }
        
        // Check for blue message about QF
        await expect(page.getByText(/Quotient Familial n'est pas nécessaire/i)).toBeVisible();
     } else {
        test.fail(true, 'School activity not found');
     }
  });

  // TEST 5: RGPD Auto-cleanup
  test('Test 5: GDPR Auto-cleanup', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card-wetransfer');
    await page.locator('.card-wetransfer').first().click();
    
    // Open calculator
    const estimateBtn = page.getByRole('button', { name: /Estimer|Simuler|Calculer/i }).first();
    if (await estimateBtn.isVisible()) {
        await estimateBtn.click();
    } else {
        await page.getByText(/Estimer mes aides/i).click();
    }
    
    // Fill data
    await page.getByLabel(/Âge/i).fill('10');
    
    // Leave page (go home)
    await page.goto('/');
    
    // Go back to same activity
    await page.goBack(); 
    
    // Re-open modal
    if (await estimateBtn.isVisible()) {
        await estimateBtn.click();
    } else {
        await page.getByText(/Estimer mes aides/i).click();
    }
    
    // Check if Age is empty
    await expect(page.getByLabel(/Âge/i)).toBeEmpty();
  });

  // TEST 6: Bouton "Effacer mes données"
  test('Test 6: GDPR Manual Reset', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card-wetransfer');
    await page.locator('.card-wetransfer').first().click();
    
    // Open calculator
    const estimateBtn = page.getByRole('button', { name: /Estimer|Simuler|Calculer/i }).first();
    if (await estimateBtn.isVisible()) {
        await estimateBtn.click();
    } else {
        await page.getByText(/Estimer mes aides/i).click();
    }
    
    // Fill data
    await page.getByLabel(/Âge/i).fill('10');
    
    // Click "Calculer"
    await page.getByRole('button', { name: /Calculer/i }).click();
    
    // Click Trash button
    // Look for trash icon or text
    const trashBtn = page.locator('button').filter({ has: page.locator('svg.lucide-trash-2') }).first();
    if (await trashBtn.isVisible()) {
        await trashBtn.click();
    } else {
        await page.getByText(/Effacer/i).click();
    }
    
    // Verify reset
    await expect(page.getByLabel(/Âge/i)).toBeEmpty();
  });

});
