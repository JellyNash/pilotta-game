import { test, expect, Page } from '@playwright/test';

// Helper function to start a game
async function startGame(page: Page) {
  await page.goto('http://localhost:3000');
  await page.click('text=Start Game');
  await page.waitForSelector('.game-table', { state: 'visible' });
}

test.describe('Game Mechanics', () => {
  test('bidding interface appears after dealing', async ({ page }) => {
    await startGame(page);
    
    // Wait for bidding interface to appear
    await expect(page.locator('.bidding-interface')).toBeVisible();
    
    // Check if bidding buttons are present
    await expect(page.getByText('Pass')).toBeVisible();
    await expect(page.getByText('Take')).toBeVisible();
  });

  test('can make a bid', async ({ page }) => {
    await startGame(page);
    
    // Wait for bidding interface
    await page.waitForSelector('.bidding-interface');
    
    // Select a suit (if it's player's turn)
    const suitButtons = page.locator('.suit-button');
    if (await suitButtons.count() > 0) {
      await suitButtons.first().click();
      await page.click('text=Take');
      
      // Verify contract indicator shows the bid
      await expect(page.locator('.contract-indicator')).toBeVisible();
    }
  });

  test('cards can be played', async ({ page }) => {
    await startGame(page);
    
    // Wait for game to reach playing phase
    // This might require waiting for AI bidding to complete
    await page.waitForTimeout(5000);
    
    // Check if it's the human player's turn
    const playerCards = page.locator('.player-zone--south .card');
    const cardCount = await playerCards.count();
    
    if (cardCount > 0) {
      // Try to click a playable card
      await playerCards.first().click();
      
      // Check if card moved to trick area
      await expect(page.locator('.trick-area .card')).toBeVisible();
    }
  });
});

test.describe('Responsive Design', () => {
  test('mobile layout shows vertical bidding', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await startGame(page);
    
    // Wait for bidding interface
    await page.waitForSelector('.bidding-interface');
    
    // Check if bidding interface uses vertical layout on mobile
    const biddingInterface = page.locator('.bidding-interface');
    await expect(biddingInterface).toBeVisible();
    
    // Verify mobile-specific classes or styles are applied
    const hasVerticalLayout = await biddingInterface.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.flexDirection === 'column';
    });
    
    expect(hasVerticalLayout).toBeTruthy();
  });

  test('tablet layout maintains card visibility', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await startGame(page);
    
    // Verify all 4 player zones are visible
    await expect(page.locator('.player-zone')).toHaveCount(4);
    
    // Check that cards don't overflow
    const playerZone = page.locator('.player-zone--south');
    const isOverflowing = await playerZone.evaluate(el => {
      return el.scrollWidth > el.clientWidth;
    });
    
    expect(isOverflowing).toBeFalsy();
  });
});