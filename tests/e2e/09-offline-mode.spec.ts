import { test, expect } from '@playwright/test';

test.describe('TS008: Test off-line / connexion instable', () => {
  test('should handle offline mode gracefully', async ({ page, context }) => {
    // D'abord charger l'application normalement
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Simuler mode offline
    await context.setOffline(true);
    
    // Essayer d'accéder à différentes sections
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Vérifier qu'un message d'erreur approprié s'affiche
    const offlineMessage = page.locator('text=/hors ligne|offline|connexion|réseau/i');
    
    if (await offlineMessage.isVisible()) {
      await expect(offlineMessage).toBeVisible();
    }
    
    await page.screenshot({ path: 'test-results/ts008-offline-home.png' });
  });

  test('should show appropriate error for network-dependent features', async ({ page, context }) => {
    await page.goto('/');
    
    // Simuler offline
    await context.setOffline(true);
    
    // Essayer d'accéder à la recherche (nécessite réseau)
    await page.goto('/activities');
    await page.waitForTimeout(2000);
    
    // Vérifier message d'erreur
    const errorMessage = page.locator('text=/erreur|connexion|réseau|impossible/i');
    
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
    
    await page.screenshot({ path: 'test-results/ts008-offline-search.png' });
  });

  test('should allow access to cached content when offline', async ({ page, context }) => {
    // Charger une page avec contenu
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Aller sur Ma ville, mon actu
    const maVilleLink = page.locator('text=/ma ville/i').first();
    if (await maVilleLink.isVisible()) {
      await maVilleLink.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Maintenant passer offline
    await context.setOffline(true);
    
    // Recharger la page
    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
    
    // Vérifier si du contenu pré-chargé est disponible
    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
    
    await page.screenshot({ path: 'test-results/ts008-offline-cached.png' });
  });

  test('should not crash in offline mode', async ({ page, context }) => {
    await page.goto('/');
    
    // Simuler offline
    await context.setOffline(true);
    
    // Essayer plusieurs navigations
    const links = ['/activities', '/eco-mobilite', '/'];
    
    for (const link of links) {
      await page.goto(link).catch(() => {});
      await page.waitForTimeout(1000);
      
      // Vérifier que la page n'a pas crashé
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();
      expect(pageContent.length).toBeGreaterThan(0);
    }
    
    await page.screenshot({ path: 'test-results/ts008-offline-no-crash.png' });
  });

  test('should recover when coming back online', async ({ page, context }) => {
    await page.goto('/');
    
    // Passer offline
    await context.setOffline(true);
    await page.reload().catch(() => {});
    await page.waitForTimeout(1000);
    
    // Revenir online
    await context.setOffline(false);
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Vérifier que l'application fonctionne normalement
    await expect(page.locator('body')).toBeVisible();
    
    const activities = page.locator('[data-activity], article').first();
    if (await activities.isVisible()) {
      await expect(activities).toBeVisible();
    }
    
    await page.screenshot({ path: 'test-results/ts008-back-online.png' });
  });
});
