import { test, expect } from '@playwright/test';

test.describe('Calculateur aides financières', () => {
  
  test('Activité scolaire → bloc QF non visible', async ({ page }) => {
    await page.goto('/activity/1a96a4e5-7cc0-43d5-a6ad-67d81657c1fc');
    await page.waitForLoadState('networkidle');
    
    const qfBlock = page.locator('text=/quotient familial/i').first();
    await expect(qfBlock).not.toBeVisible();
  });

  test('Activité vacances → bloc QF visible', async ({ page }) => {
    await page.goto('/activity/d930f154-0d6c-4d99-a682-a511b98ebc7e');
    await page.waitForLoadState('networkidle');
    
    const qfBlock = page.locator('text=/quotient familial/i').first();
    await expect(qfBlock).toBeVisible();
  });

  test('Âge hors tranche → message erreur', async ({ page }) => {
    await page.goto('/activity/1a96a4e5-7cc0-43d5-a6ad-67d81657c1fc');
    await page.waitForLoadState('networkidle');
    
    // Saisir un âge hors tranche (ex: 2 ans pour activité 3-17)
    const ageInput = page.locator('input[type="number"]').first();
    await ageInput.fill('2');
    
    // Vérifier message erreur
    const errorMsg = page.locator('text=/âge.*tranche/i');
    await expect(errorMsg).toBeVisible();
    
    // Vérifier que le calcul ne s'affiche pas
    const resultat = page.locator('text=/montant.*aide/i');
    await expect(resultat).not.toBeVisible();
  });

  test('Âge OK → calcul fonctionne', async ({ page }) => {
    await page.goto('/activity/1a96a4e5-7cc0-43d5-a6ad-67d81657c1fc');
    await page.waitForLoadState('networkidle');
    
    // Saisir un âge valide
    const ageInput = page.locator('input[type="number"]').first();
    await ageInput.fill('10');
    
    // Vérifier que le calcul s'affiche
    const resultat = page.locator('text=/montant|aide|tarif/i').first();
    await expect(resultat).toBeVisible();
  });

});
