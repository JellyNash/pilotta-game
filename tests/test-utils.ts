import { Page, expect } from '@playwright/test';

/**
 * Common test utilities for Pilotta game tests
 */

/**
 * Start a new game and wait for it to load
 */
export async function startGame(page: Page) {
  await page.goto('/');
  await page.click('text=Start Game');
  await page.waitForSelector('.game-table', { state: 'visible' });
  await page.waitForTimeout(500); // Allow animations to complete
}

/**
 * Wait for the bidding phase to start
 */
export async function waitForBiddingPhase(page: Page) {
  await page.waitForSelector('.bidding-interface', { state: 'visible', timeout: 10000 });
}

/**
 * Wait for the playing phase to start
 */
export async function waitForPlayingPhase(page: Page) {
  // Wait for bidding to complete
  await page.waitForSelector('.bidding-interface', { state: 'hidden', timeout: 30000 });
  // Wait for contract indicator to appear
  await page.waitForSelector('.contract-indicator', { state: 'visible' });
}

/**
 * Get the current player's cards
 */
export async function getPlayerCards(page: Page) {
  return page.locator('.player-zone--south .card');
}

/**
 * Play a card by clicking on it
 */
export async function playCard(page: Page, cardIndex: number = 0) {
  const cards = await getPlayerCards(page);
  const card = cards.nth(cardIndex);
  
  if (await card.isVisible()) {
    await card.click();
    // Wait for card animation
    await page.waitForTimeout(500);
    return true;
  }
  return false;
}

/**
 * Get the current trick cards
 */
export async function getTrickCards(page: Page) {
  return page.locator('.trick-area .card');
}

/**
 * Make a bid in the bidding phase
 */
export async function makeBid(page: Page, suit: 'hearts' | 'diamonds' | 'clubs' | 'spades') {
  // Select suit
  await page.click(`button[aria-label*="${suit}"]`);
  // Click Take button
  await page.click('text=Take');
  await page.waitForTimeout(500);
}

/**
 * Pass in the bidding phase
 */
export async function passBid(page: Page) {
  await page.click('text=Pass');
  await page.waitForTimeout(500);
}

/**
 * Check if it's the human player's turn
 */
export async function isPlayerTurn(page: Page): Promise<boolean> {
  // Check if human player cards have the playable state
  const playerCards = await getPlayerCards(page);
  const firstCard = playerCards.first();
  
  if (await firstCard.isVisible()) {
    // Check if card is clickable/playable
    const isDisabled = await firstCard.evaluate(el => {
      return el.classList.contains('card--disabled') || 
             el.style.pointerEvents === 'none' ||
             el.hasAttribute('disabled');
    });
    return !isDisabled;
  }
  return false;
}

/**
 * Get the current scores
 */
export async function getScores(page: Page): Promise<{ teamA: number; teamB: number }> {
  const scoreboard = page.locator('.score-board');
  
  // Extract scores - this might need adjustment based on actual HTML structure
  const scores = await scoreboard.locator('.score-value').allTextContents();
  
  return {
    teamA: parseInt(scores[0] || '0'),
    teamB: parseInt(scores[1] || '0')
  };
}

/**
 * Wait for round to complete and transition screen to appear
 */
export async function waitForRoundEnd(page: Page) {
  await page.waitForSelector('.round-transition-screen', { state: 'visible', timeout: 60000 });
}

/**
 * Set viewport size for responsive testing
 */
export async function setViewport(page: Page, device: 'mobile' | 'tablet' | 'desktop' | 'desktop-xl') {
  const viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 },
    'desktop-xl': { width: 2560, height: 1440 }
  };
  
  await page.setViewportSize(viewports[device]);
  await page.waitForTimeout(300); // Allow layout to adjust
}

/**
 * Take a screenshot with consistent settings
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `tests/screenshots/${name}.png`,
    fullPage: false,
    animations: 'disabled'
  });
}

/**
 * Check if element is in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector).first();
  
  if (!await element.isVisible()) {
    return false;
  }
  
  return await element.evaluate(el => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  });
}