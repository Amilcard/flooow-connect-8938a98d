import { test, expect } from '@playwright/test';
import { testParents } from './fixtures/test-data';
import { signupParent, loginParent } from './utils/auth-helpers';
import { cleanupTestData } from './utils/db-helpers';

test.describe('TS002: Connexion – utilisateur existant', () => {
  test.beforeEach(async ({ page }) => {
    // Créer un utilisateur de test
    await signupParent(page, testParents.express);
    await page.goto('/auth');
  });

  test.afterEach(async () => {
    await cleanupTestData(testParents.express.email);
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Saisir email/mot de passe valides
    await page.fill('input[name="email"]', testParents.express.email);
    await page.fill('input[name="password"]', testParents.express.password);
    
    // Soumettre
    await page.click('button[type="submit"]');
    
    // Vérifier redirection vers tableau de bord/accueil
    await page.waitForURL('/', { timeout: 10000 });
    
    // Vérifier qu'on est bien connecté (présence du menu compte)
    await expect(page.locator('[aria-label="Mon compte"]')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/ts002-login-success.png' });
  });

  test('should show error with incorrect email', async ({ page }) => {
    // Saisir email incorrect
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', testParents.express.password);
    
    // Soumettre
    await page.click('button[type="submit"]');
    
    // Vérifier affichage message d'erreur
    await expect(page.locator('text=/identifiants invalides|email incorrect|utilisateur introuvable/i')).toBeVisible({ timeout: 5000 });
    
    // Vérifier qu'on reste sur la page auth
    expect(page.url()).toContain('/auth');
  });

  test('should show error with incorrect password', async ({ page }) => {
    // Saisir mot de passe incorrect
    await page.fill('input[name="email"]', testParents.express.email);
    await page.fill('input[name="password"]', 'WrongPassword123!');
    
    // Soumettre
    await page.click('button[type="submit"]');
    
    // Vérifier affichage message d'erreur adapté
    await expect(page.locator('text=/identifiants invalides|mot de passe incorrect/i')).toBeVisible({ timeout: 5000 });
    
    // Vérifier qu'on reste sur la page auth
    expect(page.url()).toContain('/auth');
  });

  test('should not crash on invalid credentials', async ({ page }) => {
    // Tenter connexion avec identifiants invalides
    await page.fill('input[name="email"]', 'invalid@test.com');
    await page.fill('input[name="password"]', 'invalid');
    await page.click('button[type="submit"]');
    
    // Attendre un peu
    await page.waitForTimeout(2000);
    
    // Vérifier que la page n'a pas crashé
    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();
    
    // Vérifier qu'on peut toujours interagir avec le formulaire
    await expect(page.locator('input[name="email"]')).toBeEnabled();
  });
});
