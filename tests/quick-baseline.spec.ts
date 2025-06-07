import { test, expect } from '@playwright/test';

const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'desktop-2k', width: 2560, height: 1440 }
];

test.describe('Quick Baseline Screenshots', () => {
  test.describe.configure({ mode: 'parallel' });

  for (const bp of BREAKPOINTS) {
    test(`Capture ${bp.name} (${bp.width}x${bp.height})`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize({ width: bp.width, height: bp.height });
      
      // Go to app
      await page.goto('http://localhost:3000');
      
      // Wait for app to load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Screenshot 1: Start screen
      await page.screenshot({ 
        path: `test-results/baseline-${bp.name}-start.png`,
        fullPage: false 
      });
      
      // Try to start game
      const startButton = page.getByRole('button', { name: /start game/i });
      if (await startButton.isVisible()) {
        await startButton.click();
        await page.waitForTimeout(2000);
        
        // Screenshot 2: Game screen
        await page.screenshot({ 
          path: `test-results/baseline-${bp.name}-game.png`,
          fullPage: false 
        });
      }
    });
  }

  test('Check responsive units', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const cssVars = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      const vars: Record<string, string> = {};
      
      // Get all CSS variables
      for (let i = 0; i < styles.length; i++) {
        const prop = styles[i];
        if (prop.startsWith('--')) {
          vars[prop] = styles.getPropertyValue(prop);
        }
      }
      
      return vars;
    });
    
    console.log('CSS Variables found:', Object.keys(cssVars).filter(k => k.includes('rsp')));
  });
});