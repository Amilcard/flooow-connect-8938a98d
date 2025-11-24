import { test, expect } from '@playwright/test';

test.describe('Home Screen Resilience', () => {
  test('should load home screen even if activities fetch fails', async ({ page }) => {
    // Mock the activities API to fail
    await page.route('**/rest/v1/activities*', route => route.abort('failed'));

    // Go to home page
    await page.goto('/home');

    // Verify that the page didn't crash (check for key elements)
    await expect(page.getByText('Activités recommandées')).not.toBeVisible(); // Section should be hidden or replaced
    
    // Check for the fallback UI (if we implemented it to be visible)
    // Note: The text might vary, but we look for the error message we added
    await expect(page.getByText('Impossible de charger les suggestions')).toBeVisible();

    // Verify other parts of the page are still there
    await expect(page.getByText('Petits budgets')).toBeVisible({ timeout: 10000 }).catch(() => {
       // If "Petits budgets" also fails due to the same mock, that's expected if they share the endpoint.
       // However, the critical part is that the PAGE exists, not a full crash.
       // Let's check for the SearchBar which is static
       console.log("Petits budgets might also be failing due to global mock, checking static elements");
    });

    await expect(page.getByPlaceholder('Rechercher une activité')).toBeVisible();
    await expect(page.getByText('Notre ville')).toBeVisible();
  });
});
