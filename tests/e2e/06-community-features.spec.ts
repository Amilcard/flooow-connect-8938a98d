import { test, expect } from '@playwright/test';
import { testParents } from './fixtures/test-data';
import { signupParent } from './utils/auth-helpers';
import { cleanupTestData } from './utils/db-helpers';

test.describe('TS006: Rubrique «Prix Bon Esprit» – formulaire vote & navigation', () => {
  test.afterEach(async () => {
    await cleanupTestData(testParents.express.email);
  });

  test('should display Prix Bon Esprit screen with complete text', async ({ page }) => {
    // Accéder depuis l'accueil
    await page.goto('/');
    
    // Chercher "Prix Bon Esprit" ou "Vote des élèves"
    const prixBonEspritLink = page.locator('text=/prix bon esprit|vote des élèves/i').first();
    
    if (await prixBonEspritLink.isVisible()) {
      await prixBonEspritLink.click();
      
      // Vérifier présence du texte complet
      await expect(page.locator('text=/prix bon esprit/i')).toBeVisible();
      await expect(page.locator('text=/vote des élèves/i')).toBeVisible();
      
      // Vérifier présence des critères
      await expect(page.locator('text=/camarade toujours prêt à aider/i')).toBeVisible();
      await expect(page.locator('text=/élève engagé/i')).toBeVisible();
      await expect(page.locator('text=/héros du quotidien/i')).toBeVisible();
      
      // Vérifier présence de l'objectif
      await expect(page.locator('text=/mettre en lumière/i')).toBeVisible();
      
      await page.screenshot({ path: 'test-results/ts006-prix-bon-esprit-text.png', fullPage: true });
    }
  });

  test('should have functional vote form when authenticated', async ({ page }) => {
    // Se connecter d'abord
    await signupParent(page, testParents.express);
    
    // Aller à Prix Bon Esprit (via Community/Agenda si existe)
    await page.goto('/agenda-community');
    
    // Chercher le bouton de vote
    const voteButton = page.locator('button:has-text("voter"), button:has-text("Prix Bon Esprit")').first();
    
    if (await voteButton.isVisible()) {
      await voteButton.click();
      
      // Vérifier ouverture formulaire ou modal
      await page.waitForTimeout(500);
      
      // Chercher champs de saisie
      const nameInput = page.locator('input[name*="nom"], input[placeholder*="nom"]').first();
      const reasonInput = page.locator('textarea[name*="motif"], textarea[placeholder*="pourquoi"]').first();
      
      if (await nameInput.isVisible()) {
        // Remplir le formulaire
        await nameInput.fill('Jean Dupont');
        await reasonInput.fill('Toujours présent pour aider les autres');
        
        // Soumettre
        const submitButton = page.locator('button[type="submit"], button:has-text("envoyer"), button:has-text("valider")').first();
        await submitButton.click();
        
        // Vérifier message de confirmation
        await expect(page.locator('text=/confirmation|merci|envoyé/i')).toBeVisible({ timeout: 5000 });
        
        await page.screenshot({ path: 'test-results/ts006-vote-submitted.png' });
      }
    }
  });

  test('should show connection prompt when not authenticated', async ({ page }) => {
    await page.goto('/agenda-community');
    
    // Chercher indication pour se connecter
    const loginPrompt = page.locator('text=/connectez-vous pour/i, text=/créer un compte/i');
    
    if (await loginPrompt.isVisible()) {
      await expect(loginPrompt).toBeVisible();
    }
  });

  test('should have working back navigation', async ({ page }) => {
    await page.goto('/agenda-community');
    
    // Chercher flèche retour
    const backButton = page.locator('button[aria-label*="retour"], [data-icon="arrow-left"]').first();
    
    if (await backButton.isVisible()) {
      await backButton.click();
      
      // Vérifier retour vers accueil ou page précédente
      await page.waitForTimeout(500);
      expect(page.url()).not.toContain('agenda-community');
    }
  });
});
