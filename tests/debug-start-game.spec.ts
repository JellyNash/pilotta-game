import { test, expect } from '@playwright/test';

test('Debug start game flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Take screenshot of start screen
  await page.screenshot({ path: 'test-results/debug-1-start-screen.png' });
  
  // Find and click start button
  const startButton = page.getByRole('button', { name: 'Start Game' });
  console.log('Start button found:', await startButton.isVisible());
  
  await startButton.click();
  console.log('Start button clicked');
  
  // Wait a bit and see what happens
  await page.waitForTimeout(2000);
  
  // Take screenshot after click
  await page.screenshot({ path: 'test-results/debug-2-after-click.png' });
  
  // Check what's visible now
  const elements = await page.evaluate(() => {
    return {
      gameTable: !!document.querySelector('.game-table'),
      biddingInterface: !!document.querySelector('.bidding-interface'),
      startScreen: !!document.querySelector('h1'),
      visibleText: Array.from(document.querySelectorAll('h1, h2, h3, button')).map(el => el.textContent?.trim()).filter(Boolean)
    };
  });
  
  console.log('Visible elements:', elements);
  
  // Check for any errors in console
  page.on('console', msg => console.log('Console:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('Page error:', err.message));
});