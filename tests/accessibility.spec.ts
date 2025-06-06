import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('keyboard navigation works on start screen', async ({ page }) => {
    // Tab to start button
    await page.keyboard.press('Tab');
    
    // Check if start button is focused
    const startButton = page.getByText('Start Game');
    await expect(startButton).toBeFocused();
    
    // Press Enter to start game
    await page.keyboard.press('Enter');
    
    // Verify game started
    await expect(page.locator('.game-table')).toBeVisible();
  });

  test('cards have proper ARIA labels', async ({ page }) => {
    await page.click('text=Start Game');
    await page.waitForSelector('.game-table');
    
    // Check if cards have aria-label attributes
    const cards = page.locator('.player-zone--south .card');
    const cardCount = await cards.count();
    
    if (cardCount > 0) {
      const firstCard = cards.first();
      const ariaLabel = await firstCard.getAttribute('aria-label');
      
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toMatch(/of/); // Should contain "X of Y" format
    }
  });

  test('focus indicators are visible', async ({ page }) => {
    await page.click('text=Start Game');
    await page.waitForSelector('.game-table');
    
    // Tab through interface elements
    await page.keyboard.press('Tab');
    
    // Check if focused element has visible outline
    const focusedElement = page.locator(':focus');
    const hasVisibleOutline = await focusedElement.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.outline !== 'none' && styles.outline !== '';
    });
    
    expect(hasVisibleOutline).toBeTruthy();
  });

  test('settings modal is keyboard accessible', async ({ page }) => {
    // Look for settings button and click it
    const settingsButton = page.locator('button[aria-label*="Settings"]');
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      
      // Check if settings modal is visible
      const settingsModal = page.locator('[role="dialog"]');
      await expect(settingsModal).toBeVisible();
      
      // Test Escape key closes modal
      await page.keyboard.press('Escape');
      await expect(settingsModal).not.toBeVisible();
    }
  });
});

test.describe('Screen Reader Support', () => {
  test('game state announcements are present', async ({ page }) => {
    await page.click('text=Start Game');
    await page.waitForSelector('.game-table');
    
    // Check for aria-live regions
    const liveRegions = page.locator('[aria-live]');
    const count = await liveRegions.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('player zones have proper roles', async ({ page }) => {
    await page.click('text=Start Game');
    await page.waitForSelector('.game-table');
    
    // Check player zones have appropriate ARIA roles
    const playerZones = page.locator('.player-zone');
    const firstZone = playerZones.first();
    
    const role = await firstZone.getAttribute('role');
    expect(role).toBeTruthy();
  });
});