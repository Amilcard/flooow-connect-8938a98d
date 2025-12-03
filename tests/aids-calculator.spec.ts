import { test, expect } from '@playwright/test';

test.describe('Calculateur aides financières', () => {
  
  test('Activité scolaire → bloc QF non visible', async ({ page }) => {
    await page.goto('/activity/football-club');
    await page.waitForLoadState('networkidle');
    
    const qfBlock = page.locator('text=/quotient familial/i').first();
    await expect(qfBlock).not.toBeVisible();
  });

  test('Activité vacances → bloc QF visible', async ({ page }) => {
    await page.goto('/activity/camp-ski');
    await page.waitForLoadState('networkidle');
    
    const qfBlock = page.locator('text=/quotient familial/i').first();
    await expect(qfBlock).toBeVisible();
  });

  test('Âge hors tranche → message erreur', async ({ page }) => {
    await page.goto('/activity/football-club');
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
    await page.goto('/activity/football-club');
    await page.waitForLoadState('networkidle');
    
    // Saisir un âge valide
    const ageInput = page.locator('input[type="number"]').first();
    await ageInput.fill('10');
    
    // Vérifier que le calcul s'affiche
    const resultat = page.locator('text=/montant|aide|tarif/i').first();
    await expect(resultat).toBeVisible();
  });

});
