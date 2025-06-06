import { test, expect } from '@playwright/test';
import { startGame, getPlayerCards, waitForBiddingPhase } from './test-utils';

test('basic test - game loads', async ({ page }) => {
  await page.goto('/');
  
  // Check if the start screen is visible
  await expect(page.getByText('Pilotta')).toBeVisible();
  await expect(page.getByText('Start Game')).toBeVisible();
});

test('can start a game', async ({ page }) => {
  await startGame(page);
  
  // Check if cards are dealt (should see player zones)
  await expect(page.locator('.player-zone')).toHaveCount(4);
  
  // Check if player has cards
  const playerCards = await getPlayerCards(page);
  await expect(playerCards).toHaveCount(8);
});

test('bidding phase starts after dealing', async ({ page }) => {
  await startGame(page);
  await waitForBiddingPhase(page);
  
  // Verify bidding interface is visible
  await expect(page.locator('.bidding-interface')).toBeVisible();
  
  // Check for bidding buttons
  await expect(page.getByText('Pass')).toBeVisible();
  await expect(page.getByText('Take')).toBeVisible();
});