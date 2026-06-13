import { test, expect } from '@playwright/test';

test.describe('Podea Landing Page', () => {
  test('should load landing page, toggle language, and switch pricing plans correctly', async ({ page }) => {
    // 1. Go to root page
    await page.goto('/');

    // 2. Check that the headline exists (either German or English depending on language)
    const deHeadline = page.locator('h1', { hasText: 'Wo Ankommen zur Fürsorge wird.' });
    const enHeadline = page.locator('h1', { hasText: 'Where arrival becomes care.' });
    
    // Check if one of them is visible
    const isDeVisible = await deHeadline.isVisible();
    const isEnVisible = await enHeadline.isVisible();
    expect(isDeVisible || isEnVisible).toBe(true);

    // Force German language if it loaded in English
    if (isEnVisible) {
      // Find and click language button (toggles to German)
      await page.click('.lp-lang-btn');
      await expect(deHeadline).toBeVisible();
    }

    // 3. Verify Initial Pricing State (default is Jährlich / yearly)
    // Jährlich (yearly) prices should be discounted: €29, €69, €149
    await expect(page.locator('.lp-pricing-amount').first()).toHaveText('29');
    
    // Verify Jährlich label has active class
    await expect(page.locator('.lp-toggle-label', { hasText: 'Jährlich' })).toHaveClass(/active/);
    await expect(page.locator('.lp-toggle-label', { hasText: 'Monatlich' })).not.toHaveClass(/active/);

    // 4. Toggle billing cycle to Monatlich
    await page.click('.lp-toggle-switch');

    // Prices should now be monthly: €39, €89, €189
    await expect(page.locator('.lp-pricing-amount').first()).toHaveText('39');

    // Verify Monatlich label has active class
    await expect(page.locator('.lp-toggle-label', { hasText: 'Monatlich' })).toHaveClass(/active/);
    await expect(page.locator('.lp-toggle-label', { hasText: 'Jährlich' })).not.toHaveClass(/active/);

    // 5. Toggle back to Jährlich
    await page.click('.lp-toggle-switch');
    await expect(page.locator('.lp-pricing-amount').first()).toHaveText('29');
    
    // 6. Test Demo anchor scroll
    await page.click('a[href="#demo"]');
    // Verify URL hash is updated to #demo
    expect(page.url()).toContain('#demo');

    // 7. Test Trial CTA navigates to Onboarding
    await page.click('text=Kostenlos starten');
    await page.waitForURL('**/onboarding');
    await expect(page).toHaveURL(/.*onboarding/);
  });
});
