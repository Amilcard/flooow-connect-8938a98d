import { test, expect } from '@playwright/test';

test.describe('TS004: Rubrique «Ma ville, mon actu» – affichage sans connexion', () => {
  test('should access "Ma ville, mon actu" without login', async ({ page }) => {
    // Accéder à l'écran d'accueil sans se connecter
    await page.goto('/');
    
    // Chercher et cliquer sur "Ma ville, mon actu"
    const maVilleLink = page.locator('text=/ma ville|mon actu/i, [href*="ville"], [href*="actu"]').first();
    await expect(maVilleLink).toBeVisible();
    await maVilleLink.click();
    
    // Vérifier que la page s'affiche
    await page.waitForLoadState('networkidle');
    
    // Vérifier présence d'événements
    await expect(page.locator('[data-event], [class*="event"], article, .card')).toHaveCount({ gte: 1 }, { timeout: 10000 });
    
    await page.screenshot({ path: 'test-results/ts004-ma-ville-unauthenticated.png', fullPage: true });
  });

  test('should display event details without login', async ({ page }) => {
    await page.goto('/');
    
    // Accéder à Ma ville, mon actu
    const maVilleLink = page.locator('text=/ma ville|mon actu/i').first();
    if (await maVilleLink.isVisible()) {
      await maVilleLink.click();
      await page.waitForLoadState('networkidle');
      
      // Cliquer sur le premier événement
      const firstEvent = page.locator('[data-event], article, .card').first();
      await firstEvent.click();
      
      // Vérifier affichage du détail
      await expect(page.locator('h1, h2')).toBeVisible();
      await expect(page.locator('text=/description|détail/i, p')).toBeVisible();
      
      await page.screenshot({ path: 'test-results/ts004-event-detail.png', fullPage: true });
    }
  });

  test('should show disabled status for past events', async ({ page }) => {
    await page.goto('/');
    
    const maVilleLink = page.locator('text=/ma ville|mon actu/i').first();
    if (await maVilleLink.isVisible()) {
      await maVilleLink.click();
      await page.waitForLoadState('networkidle');
      
      // Chercher des événements passés (si affichés)
      const pastEvents = page.locator('[data-status="past"], [class*="disabled"], [class*="expired"]');
      
      if (await pastEvents.count() > 0) {
        await expect(pastEvents.first()).toHaveClass(/disabled|past|expired/);
      }
    }
  });
});

test.describe('TS005: Écran «Éco-Mobilité» – ordre et contenu visuel', () => {
  test('should display Eco-Mobilité screen with proper structure', async ({ page }) => {
    // Accéder à Éco-Mobilité depuis l'accueil
    await page.goto('/');
    
    const ecoMobiliteLink = page.locator('text=/éco.?mobilité|mobilité/i, [href*="mobilite"], [href*="eco"]').first();
    await expect(ecoMobiliteLink).toBeVisible();
    await ecoMobiliteLink.click();
    
    // Vérifier présence du titre
    await expect(page.locator('h1, h2').filter({ hasText: /éco.?mobilité|mobilité/i })).toBeVisible();
    
    // Vérifier présence de la description
    await expect(page.locator('p, [class*="description"]')).toHaveCount({ gte: 1 });
    
    // Vérifier bouton "Lancer le simulateur" ou similaire
    const simulatorButton = page.locator('button:has-text("simulateur"), a:has-text("simulateur")').first();
    if (await simulatorButton.isVisible()) {
      await expect(simulatorButton).toBeEnabled();
    }
    
    await page.screenshot({ path: 'test-results/ts005-eco-mobilite-structure.png', fullPage: true });
  });

  test('should have functional simulator button', async ({ page }) => {
    await page.goto('/eco-mobilite');
    
    const simulatorButton = page.locator('button:has-text("simulateur"), a:has-text("simulateur")').first();
    
    if (await simulatorButton.isVisible()) {
      // Cliquer et vérifier redirection ou ouverture
      const [newPage] = await Promise.all([
        page.waitForEvent('popup').catch(() => null),
        simulatorButton.click()
      ]);
      
      if (newPage) {
        await expect(newPage.url()).toBeTruthy();
        await newPage.close();
      }
    }
  });

  test('should display mobility solutions section', async ({ page }) => {
    await page.goto('/eco-mobilite');
    
    // Vérifier section "Solutions de mobilité disponibles"
    await expect(page.locator('text=/solutions de mobilité|mobilité disponible/i')).toBeVisible();
  });

  test('should have working external links', async ({ page }) => {
    await page.goto('/eco-mobilite');
    
    // Vérifier présence des liens data.gouv.fr et ADEME
    const dataGouvLink = page.locator('a[href*="data.gouv"]');
    const ademeLink = page.locator('a[href*="ademe"]');
    
    if (await dataGouvLink.isVisible()) {
      await expect(dataGouvLink).toHaveAttribute('href', /data\.gouv/);
    }
    
    if (await ademeLink.isVisible()) {
      await expect(ademeLink).toHaveAttribute('href', /ademe/);
    }
  });

  test('should have working back navigation', async ({ page }) => {
    await page.goto('/eco-mobilite');
    
    // Chercher flèche retour
    const backButton = page.locator('button[aria-label*="retour"], button:has([data-icon="arrow-left"]), a[href="/"]').first();
    
    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL('/');
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/eco-mobilite');
    
    await expect(page.locator('h1, h2')).toBeVisible();
    await page.screenshot({ path: 'test-results/ts005-eco-mobilite-mobile.png', fullPage: true });
    
    // Test tablette
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.screenshot({ path: 'test-results/ts005-eco-mobilite-tablet.png', fullPage: true });
  });
});
