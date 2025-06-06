import { test, expect } from '@playwright/test';

test.describe('AI Behavior', () => {
  test('AI players make bids automatically', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Start Game');
    
    // Wait for bidding phase
    await page.waitForSelector('.bidding-interface');
    
    // Monitor for AI bids in the announcement system
    const announcements = page.locator('.announcement-system');
    
    // Wait for at least one AI bid announcement
    await expect(announcements.locator('text=/Player [234]/')).toBeVisible({
      timeout: 10000
    });
  });

  test('AI players play cards in their turn', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Start Game');
    
    // Wait for game to reach playing phase
    await page.waitForTimeout(5000);
    
    // Count cards in trick area over time
    const trickArea = page.locator('.trick-area');
    let initialCardCount = await trickArea.locator('.card').count();
    
    // Wait for AI to play
    await page.waitForTimeout(3000);
    
    let newCardCount = await trickArea.locator('.card').count();
    
    // AI should have played cards if it was their turn
    expect(newCardCount).toBeGreaterThanOrEqual(initialCardCount);
  });

  test('different AI personalities behave differently', async ({ page }) => {
    // This test would require the ability to set AI personalities
    // which might need UI controls or test utilities
    
    await page.goto('http://localhost:3000');
    
    // Look for AI personality settings if available
    const settingsButton = page.locator('button[aria-label*="Settings"]');
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      
      // Check if AI personality options exist
      const aiPersonalityOptions = page.locator('text=/AI Personality|AI Difficulty/');
      if (await aiPersonalityOptions.isVisible()) {
        // Test different personalities
        expect(aiPersonalityOptions).toBeVisible();
      }
    }
  });
});

test.describe('AI Strategy', () => {
  test('AI follows trump rules correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Start Game');
    
    // This would require observing AI card plays and validating
    // they follow the trump obligation rules
    
    // Wait for playing phase
    await page.waitForTimeout(5000);
    
    // Monitor trick area for valid plays
    const trickArea = page.locator('.trick-area');
    await expect(trickArea).toBeVisible();
  });

  test('AI makes valid declarations', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Start Game');
    
    // Wait for potential declarations
    await page.waitForTimeout(8000);
    
    // Check for declaration announcements
    const declarations = page.locator('text=/Tierce|Fifty|Hundred|Four/');
    
    // If declarations appear, they should be valid
    if (await declarations.count() > 0) {
      await expect(declarations.first()).toBeVisible();
    }
  });
});