import { test, expect } from '@playwright/test';

test.describe('Podea Studio Onboarding Flow', () => {
  test('should allow a new user to register a studio and be redirected to dashboard', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Check that we are on the onboarding page
    await expect(page.getByText(/Podea Premium starten/i)).toBeVisible();

    const uniqueId = Date.now();
    const studioName = `Playwright Test Studio ${uniqueId}`;
    const email = `testadmin_${uniqueId}@podea.app`;

    // Step 1: Personal Details
    await page.fill('input[id="vorname"]', 'John');
    await page.fill('input[id="nachname"]', 'Doe');
    await page.fill('input[id="inhaber-e-mail"]', email);
    await page.click('button:has-text("Weiter")');

    // Step 2: Studio Details
    await page.fill('input[id="studio-name"]', studioName);
    await page.click('button:has-text("Weiter")');

    // Step 3: Location Details
    await page.fill('input[id="straße"]', 'Main Street');
    await page.fill('input[id="hausnummer"]', '42');
    await page.fill('input[id="ort-/-stadt"]', 'Berlin');
    await page.fill('input[id="postleitzahl-(optional)"]', '10115');
    await page.fill('input[id="bundesland"]', 'Berlin');
    await page.selectOption('select[id="country-select"]', 'DE');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify confirmation message
    await expect(page.getByText(/Registrierungs-Link gesendet!/i)).toBeVisible({ timeout: 15000 });

    // Extract the debug link
    const debugLink = await page.locator('div a').first().getAttribute('href');
    expect(debugLink).toContain('/verify-email?token=');

    // Navigate to the verification/password creation page
    await page.goto(debugLink!);

    // Fill password form
    await page.fill('input[id="passwort"]', 'SecurePassword123');
    await page.fill('input[id="passwort-bestätigen"]', 'SecurePassword123');

    // Complete onboarding
    await page.click('button[type="submit"]');

    // Verify redirection to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page.getByText(/Welcome back, Studio Manager/i)).toBeVisible({ timeout: 15000 });
  });
});
