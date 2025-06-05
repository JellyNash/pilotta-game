import { test, expect } from '@playwright/test';

const breakpoints = [
  { name: 'mobile-sm', width: 480, height: 854 },
  { name: 'mobile-lg', width: 768, height: 1024 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'desktop-xl', width: 2560, height: 1440 }
];

test.describe('Responsive Design Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Start a game
    await page.click('text=Start Game');
    // Wait for game to load
    await page.waitForSelector('.game-table', { state: 'visible' });
  });

  breakpoints.forEach(({ name, width, height }) => {
    test(`Screenshot at ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      
      // Wait for any animations to complete
      await page.waitForTimeout(500);
      
      // Take screenshot
      await expect(page).toHaveScreenshot(`game-${name}.png`, {
        fullPage: false,
        animations: 'disabled'
      });
    });
  });

  test('CLS (Cumulative Layout Shift) measurement', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Measure CLS
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        
        // Wait for page to stabilize
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 3000);
      });
    });

    // CLS should be less than 0.1 for good user experience
    expect(cls).toBeLessThan(0.1);
  });
});