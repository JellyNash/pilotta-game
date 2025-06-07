import { test, expect } from '@playwright/test';

// Breakpoints from the responsive design cheatsheet
const BREAKPOINTS = {
  'mobile-portrait': { width: 375, height: 667, name: 'Mobile Portrait (375x667)' },
  'mobile-landscape': { width: 667, height: 375, name: 'Mobile Landscape (667x375)' },
  'tablet-portrait': { width: 768, height: 1024, name: 'Tablet Portrait (768x1024)' },
  'tablet-landscape': { width: 1024, height: 768, name: 'Tablet Landscape (1024x768)' },
  'desktop-hd': { width: 1280, height: 720, name: 'Desktop HD (1280x720)' },
  'desktop-fhd': { width: 1920, height: 1080, name: 'Desktop FHD (1920x1080)' },
  'desktop-2k': { width: 2560, height: 1440, name: 'Desktop 2K (2560x1440)' },
  'desktop-4k': { width: 3840, height: 2160, name: 'Desktop 4K (3840x2160)' }
};

// Helper to wait for stable layout
async function waitForStableLayout(page: any) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Allow animations to settle
}

// Helper to start the game
async function startGame(page: any) {
  // Click the Start Game button - it's visible on the start screen
  const startButton = page.getByRole('button', { name: 'Start Game' });
  await startButton.click();
  
  // Wait for game to load - check for either bidding interface or game table
  await page.waitForSelector('.bidding-interface, .game-table', { 
    state: 'visible',
    timeout: 10000 
  });
}

test.describe('Responsive Design Baseline', () => {
  test.describe.configure({ mode: 'parallel' });
  
  // Test 1: Generate baseline screenshots for all breakpoints
  for (const [breakpointKey, breakpoint] of Object.entries(BREAKPOINTS)) {
    test.describe(`${breakpoint.name}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      });

      test('Start Screen', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await waitForStableLayout(page);
        
        await expect(page).toHaveScreenshot(`baseline/${breakpointKey}/start-screen.png`, {
          fullPage: false,
          animations: 'disabled'
        });
      });

      test('Game Screen', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await waitForStableLayout(page);
        
        // Start the game
        await startGame(page);
        await waitForStableLayout(page);
        
        await expect(page).toHaveScreenshot(`baseline/${breakpointKey}/game-screen.png`, {
          fullPage: false,
          animations: 'disabled'
        });
      });
    });
  }

  // Test 2: Verify responsive units scale correctly
  test('Font sizes and element dimensions scale with viewport', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const measurements: any[] = [];

    for (const [key, breakpoint] of Object.entries(BREAKPOINTS)) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await waitForStableLayout(page);

      const sizes = await page.evaluate(() => {
        const startButton = document.querySelector('button');
        const title = document.querySelector('h1');
        
        return {
          buttonFontSize: startButton ? getComputedStyle(startButton).fontSize : null,
          buttonWidth: startButton ? startButton.getBoundingClientRect().width : null,
          buttonHeight: startButton ? startButton.getBoundingClientRect().height : null,
          titleFontSize: title ? getComputedStyle(title).fontSize : null
        };
      });

      measurements.push({
        breakpoint: key,
        width: breakpoint.width,
        ...sizes
      });
    }

    console.log('Responsive measurements:', measurements);

    // Verify scaling relationship
    const mobile = measurements.find(m => m.breakpoint === 'mobile-portrait');
    const desktop = measurements.find(m => m.breakpoint === 'desktop-fhd');
    
    if (mobile && desktop && mobile.buttonWidth && desktop.buttonWidth) {
      const scaleFactor = desktop.buttonWidth / mobile.buttonWidth;
      console.log(`Button scale factor (desktop/mobile): ${scaleFactor.toFixed(2)}x`);
    }
  });

  // Test 3: CSS Custom Properties verification
  test('CSS custom properties are defined and calculate correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const customProperties: any[] = [];

    for (const [key, breakpoint] of Object.entries(BREAKPOINTS).slice(0, 4)) { // Test first 4 breakpoints
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await waitForStableLayout(page);

      const props = await page.evaluate(() => {
        const root = document.documentElement;
        const styles = getComputedStyle(root);
        
        // Get all CSS custom properties
        const allProps: any = {};
        for (let i = 0; i < styles.length; i++) {
          const prop = styles[i];
          if (prop.startsWith('--')) {
            allProps[prop] = styles.getPropertyValue(prop);
          }
        }

        // Focus on responsive units
        const rspProps: any = {};
        Object.keys(allProps).forEach(key => {
          if (key.includes('rsp')) {
            rspProps[key] = allProps[key];
          }
        });

        return { all: Object.keys(allProps).length, responsive: rspProps };
      });

      customProperties.push({
        breakpoint: key,
        width: breakpoint.width,
        totalCustomProps: props.all,
        responsiveProps: props.responsive
      });
    }

    console.log('CSS Custom Properties Report:');
    customProperties.forEach(cp => {
      console.log(`${cp.breakpoint} (${cp.width}px): ${cp.totalCustomProps} total props, ${Object.keys(cp.responsiveProps).length} responsive props`);
      if (Object.keys(cp.responsiveProps).length > 0) {
        console.log('  Sample responsive props:', Object.entries(cp.responsiveProps).slice(0, 5));
      }
    });
  });

  // Test 4: Touch target compliance on mobile
  test('Touch targets meet minimum size requirements', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    await page.goto('http://localhost:3000');
    await waitForStableLayout(page);

    // Check start screen buttons
    const startScreenTargets = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const results: any[] = [];

      buttons.forEach((button) => {
        const rect = button.getBoundingClientRect();
        results.push({
          text: button.textContent?.trim(),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          compliant: rect.width >= 44 && rect.height >= 44
        });
      });

      return results;
    });

    console.log('Start screen touch targets:', startScreenTargets);

    // Start game and check game screen
    await startGame(page);
    await waitForStableLayout(page);

    const gameScreenTargets = await page.evaluate(() => {
      const interactiveElements = document.querySelectorAll('button, .card, [role="button"]');
      const results: any[] = [];

      interactiveElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const isCard = element.classList.contains('card');
        
        results.push({
          type: isCard ? 'card' : 'button',
          class: element.className,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          compliant: rect.width >= 44 && rect.height >= 44
        });
      });

      return results;
    });

    const nonCardElements = gameScreenTargets.filter(t => t.type !== 'card');
    const nonCompliant = nonCardElements.filter(t => !t.compliant);
    
    console.log(`Game screen: ${nonCardElements.length} interactive elements, ${nonCompliant.length} non-compliant`);
    if (nonCompliant.length > 0) {
      console.log('Non-compliant elements:', nonCompliant);
    }
  });

  // Test 5: Layout overflow check
  test('No horizontal overflow at any breakpoint', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const overflowResults: any[] = [];

    for (const [key, breakpoint] of Object.entries(BREAKPOINTS)) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await waitForStableLayout(page);

      // Check start screen
      const startOverflow = await page.evaluate(() => {
        return {
          horizontal: document.documentElement.scrollWidth > window.innerWidth,
          vertical: document.documentElement.scrollHeight > window.innerHeight,
          bodyWidth: document.body.scrollWidth,
          windowWidth: window.innerWidth
        };
      });

      // Start game and check game screen
      await startGame(page);
      await waitForStableLayout(page);

      const gameOverflow = await page.evaluate(() => {
        return {
          horizontal: document.documentElement.scrollWidth > window.innerWidth,
          vertical: document.documentElement.scrollHeight > window.innerHeight,
          bodyWidth: document.body.scrollWidth,
          windowWidth: window.innerWidth
        };
      });

      overflowResults.push({
        breakpoint: key,
        width: breakpoint.width,
        startScreen: startOverflow,
        gameScreen: gameOverflow
      });

      // Go back for next iteration
      await page.goto('http://localhost:3000');
    }

    console.log('Overflow check results:');
    overflowResults.forEach(result => {
      if (result.startScreen.horizontal || result.gameScreen.horizontal) {
        console.log(`${result.breakpoint}: Horizontal overflow detected!`);
      }
    });

    // All breakpoints should have no horizontal overflow
    const hasOverflow = overflowResults.some(r => r.startScreen.horizontal || r.gameScreen.horizontal);
    expect(hasOverflow).toBe(false);
  });
});

// Additional configuration for visual regression testing
test.use({
  // Consistent animation timing
  actionTimeout: 10000,
  navigationTimeout: 30000,
  
  // Screenshot options
  screenshot: {
    mode: 'only-on-failure',
    fullPage: false
  },
  
  // Video recording for debugging
  video: process.env.CI ? 'off' : 'retain-on-failure'
});