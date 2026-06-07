import { test, expect } from '@playwright/test';

test.describe('Podea Studio Onboarding Flow', () => {
  test('should allow a new user to register a studio and be redirected to dashboard', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Check that we are on the onboarding page
    await expect(page.getByText(/Studio Registrieren/i)).toBeVisible();

    // Fill the onboarding form
    await page.fill('input[name="studioName"]', 'Playwright Test Studio');
    await page.fill('input[name="email"]', 'testadmin@podea.app');
    await page.fill('input[name="password"]', 'securepassword123');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for the simulated checkout / webhook fulfillment
    // and verify the user lands on the dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.locator('text=Playwright Test Studio')).toBeVisible();
  });
});
