import { chromium } from '@playwright/test';

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const breakpoints = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 },
    { name: 'desktop-2k', width: 2560, height: 1440 }
  ];
  
  console.log('Starting screenshot capture...');
  
  for (const bp of breakpoints) {
    console.log(`\nCapturing ${bp.name} (${bp.width}x${bp.height})`);
    
    try {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Capture start screen
      await page.screenshot({ 
        path: `test-results/baseline-${bp.name}-start.png`,
        fullPage: false 
      });
      console.log(`✓ Start screen captured`);
      
      // Try to start game
      try {
        await page.click('button:has-text("Start Game")', { timeout: 5000 });
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: `test-results/baseline-${bp.name}-game.png`,
          fullPage: false 
        });
        console.log(`✓ Game screen captured`);
      } catch (e) {
        console.log(`✗ Could not capture game screen: ${e.message}`);
      }
      
      // Navigate back for next iteration
      await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    } catch (e) {
      console.log(`✗ Error with ${bp.name}: ${e.message}`);
    }
  }
  
  await browser.close();
  console.log('\nScreenshot capture complete!');
  console.log('Check test-results/ folder for images');
}

captureScreenshots().catch(console.error);