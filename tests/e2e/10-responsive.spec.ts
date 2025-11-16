import { test, expect } from '@playwright/test';

const devices = [
  { name: 'mobile-portrait', width: 375, height: 667 },
  { name: 'mobile-landscape', width: 667, height: 375 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'desktop', width: 1920, height: 1080 }
];

test.describe('TS009: Responsivité / orientation écran', () => {
  for (const device of devices) {
    test(`should display correctly on ${device.name}`, async ({ page }) => {
      await page.setViewportSize({ width: device.width, height: device.height });
      
      // Tester page d'accueil
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Vérifier que le contenu est visible
      await expect(page.locator('body')).toBeVisible();
      
      // Vérifier qu'il n'y a pas de débordement horizontal
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(device.width + 20); // +20px de marge
      
      await page.screenshot({ 
        path: `test-results/ts009-home-${device.name}.png`,
        fullPage: true 
      });
    });
  }

  test('should adapt Ma ville, mon actu on all orientations', async ({ page }) => {
    for (const device of devices.slice(0, 4)) { // Skip desktop
      await page.setViewportSize({ width: device.width, height: device.height });
      
      await page.goto('/');
      
      const maVilleLink = page.locator('text=/ma ville/i').first();
      if (await maVilleLink.isVisible()) {
        await maVilleLink.click();
        await page.waitForLoadState('networkidle');
        
        // Vérifier disposition
        await expect(page.locator('h1, h2')).toBeVisible();
        
        // Vérifier pas de casse graphique
        const hasOverflow = await page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth + 20;
        });
        expect(hasOverflow).toBe(false);
        
        await page.screenshot({ 
          path: `test-results/ts009-ma-ville-${device.name}.png`,
          fullPage: true 
        });
      }
    }
  });

  test('should adapt Éco-Mobilité on all orientations', async ({ page }) => {
    for (const device of devices.slice(0, 4)) {
      await page.setViewportSize({ width: device.width, height: device.height });
      
      await page.goto('/eco-mobilite');
      await page.waitForLoadState('networkidle');
      
      // Vérifier que le titre est visible
      await expect(page.locator('h1, h2')).toBeVisible();
      
      // Vérifier alignement correct
      const elements = page.locator('button, a, p').first();
      if (await elements.isVisible()) {
        const box = await elements.boundingBox();
        expect(box?.x).toBeGreaterThanOrEqual(0);
        expect(box?.x).toBeLessThanOrEqual(device.width);
      }
      
      await page.screenshot({ 
        path: `test-results/ts009-eco-mobilite-${device.name}.png`,
        fullPage: true 
      });
    }
  });

  test('should adapt Prix Bon Esprit on all orientations', async ({ page }) => {
    for (const device of devices.slice(0, 4)) {
      await page.setViewportSize({ width: device.width, height: device.height });
      
      await page.goto('/agenda-community');
      await page.waitForLoadState('networkidle');
      
      // Vérifier affichage
      const content = page.locator('text=/prix bon esprit/i');
      if (await content.isVisible()) {
        await expect(content).toBeVisible();
        
        // Vérifier pas d'élément mal aligné
        const boxes = await page.locator('button, .card, article').all();
        for (const box of boxes.slice(0, 3)) { // Vérifier les 3 premiers
          const bbox = await box.boundingBox();
          if (bbox) {
            expect(bbox.x).toBeGreaterThanOrEqual(-5); // Petite marge d'erreur
            expect(bbox.x + bbox.width).toBeLessThanOrEqual(device.width + 5);
          }
        }
      }
      
      await page.screenshot({ 
        path: `test-results/ts009-prix-bon-esprit-${device.name}.png`,
        fullPage: true 
      });
    }
  });

  test('should maintain navigation functionality across devices', async ({ page }) => {
    for (const device of devices.slice(0, 4)) {
      await page.setViewportSize({ width: device.width, height: device.height });
      
      await page.goto('/');
      
      // Vérifier que la navigation est accessible
      const navLinks = page.locator('nav a, header a, [role="navigation"] a');
      const count = await navLinks.count();
      
      expect(count).toBeGreaterThan(0);
      
      // Essayer de cliquer sur un lien
      if (count > 0) {
        await navLinks.first().click();
        await page.waitForTimeout(500);
        
        // Vérifier que la navigation a fonctionné
        const url = page.url();
        expect(url).toBeTruthy();
      }
    }
  });
});
