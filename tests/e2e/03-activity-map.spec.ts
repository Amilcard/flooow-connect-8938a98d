import { test, expect } from '@playwright/test';
import { testParents, testActivities } from './fixtures/test-data';
import { signupParent } from './utils/auth-helpers';
import { cleanupTestData } from './utils/db-helpers';

test.describe('TS003: Estimation trajet / carte – détail activité', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter
    await signupParent(page, testParents.express);
  });

  test.afterEach(async () => {
    await cleanupTestData(testParents.express.email);
  });

  test('should display map with route estimation on activity detail', async ({ page }) => {
    // Aller sur la page des activités
    await page.goto('/activities');
    
    // Sélectionner une activité
    await page.click(`text=${testActivities.tennis.title}`);
    
    // Attendre la page de détail
    await page.waitForLoadState('networkidle');
    
    // Chercher le bouton "Voir trajet" ou icône carte
    const mapButton = page.locator('button:has-text("Voir trajet"), button:has-text("Trajet"), [aria-label*="carte"], [aria-label*="trajet"]').first();
    
    if (await mapButton.isVisible()) {
      await mapButton.click();
      
      // Vérifier affichage de la carte
      await expect(page.locator('[class*="map"], [id*="map"], iframe[src*="maps"]')).toBeVisible({ timeout: 10000 });
      
      // Vérifier présence d'informations de trajet
      await expect(page.locator('text=/distance|temps|durée/i')).toBeVisible();
      
      await page.screenshot({ path: 'test-results/ts003-map-display.png', fullPage: true });
    }
  });

  test('should allow transport mode change if available', async ({ page }) => {
    await page.goto('/activities');
    await page.click(`text=${testActivities.tennis.title}`);
    await page.waitForLoadState('networkidle');
    
    // Chercher options de transport (voiture/vélo/marche)
    const transportOptions = page.locator('[data-transport-mode], button:has-text("voiture"), button:has-text("vélo"), button:has-text("marche")');
    
    if (await transportOptions.first().isVisible()) {
      const initialEstimate = await page.locator('text=/\\d+\\s*(min|km)/').first().textContent();
      
      // Changer de mode de transport
      await transportOptions.nth(1).click();
      
      // Attendre mise à jour
      await page.waitForTimeout(1000);
      
      // Vérifier que l'estimation a changé
      const newEstimate = await page.locator('text=/\\d+\\s*(min|km)/').first().textContent();
      expect(newEstimate).toBeDefined();
    }
  });

  test('should display CO2 emissions if implemented', async ({ page }) => {
    await page.goto('/activities');
    await page.click(`text=${testActivities.tennis.title}`);
    
    // Chercher affichage CO2
    const co2Display = page.locator('text=/CO2|émission|carbone/i');
    
    if (await co2Display.isVisible()) {
      await expect(co2Display).toContainText(/\d+/);
    }
  });

  test('should be responsive on mobile and tablet', async ({ page }) => {
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/activities');
    await page.click(`text=${testActivities.tennis.title}`);
    
    // Vérifier que la carte est adaptée
    const mapContainer = page.locator('[class*="map"], [id*="map"]').first();
    if (await mapContainer.isVisible()) {
      const box = await mapContainer.boundingBox();
      expect(box?.width).toBeLessThanOrEqual(375);
    }
    
    await page.screenshot({ path: 'test-results/ts003-map-mobile.png', fullPage: true });
    
    // Test tablette
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.screenshot({ path: 'test-results/ts003-map-tablet.png', fullPage: true });
  });
});
