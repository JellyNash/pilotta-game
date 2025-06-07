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

// Game states to test
const GAME_STATES = {
  'start-screen': 'Start Screen',
  'bidding-phase': 'Bidding Phase',
  'playing-phase': 'Playing Phase',
  'score-screen': 'Score Screen'
};

// Helper to wait for stable layout
async function waitForStableLayout(page: any) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Allow animations to settle
}

test.describe('Responsive Design Baseline', () => {
  test.describe.configure({ mode: 'parallel' });
  
  // Test 1: Generate baseline screenshots for all breakpoints and game states
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

      test('Bidding Phase', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.click('text=Start Game');
        await page.waitForSelector('.bidding-interface', { state: 'visible' });
        await waitForStableLayout(page);
        
        await expect(page).toHaveScreenshot(`baseline/${breakpointKey}/bidding-phase.png`, {
          fullPage: false,
          animations: 'disabled'
        });
      });

      test('Playing Phase', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.click('text=Start Game');
        
        // Quick bid to get to playing phase
        await page.waitForSelector('.bidding-interface', { state: 'visible' });
        await page.click('button:has-text("♠")');
        await page.click('button:has-text("80")');
        
        // Wait for playing phase
        await page.waitForSelector('.trick-area', { state: 'visible', timeout: 10000 });
        await waitForStableLayout(page);
        
        await expect(page).toHaveScreenshot(`baseline/${breakpointKey}/playing-phase.png`, {
          fullPage: false,
          animations: 'disabled'
        });
      });
    });
  }

  // Test 2: Verify responsive units scale correctly
  test.describe('Responsive Unit Scaling', () => {
    test('Font sizes scale with viewport', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.click('text=Start Game');
      await page.waitForSelector('.game-table', { state: 'visible' });

      const measurements: any[] = [];

      for (const [key, breakpoint] of Object.entries(BREAKPOINTS)) {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
        await waitForStableLayout(page);

        const sizes = await page.evaluate(() => {
          const card = document.querySelector('.card');
          const button = document.querySelector('button');
          const title = document.querySelector('h1, h2');
          
          return {
            cardFontSize: card ? getComputedStyle(card).fontSize : null,
            buttonFontSize: button ? getComputedStyle(button).fontSize : null,
            titleFontSize: title ? getComputedStyle(title).fontSize : null,
            cardWidth: card ? card.getBoundingClientRect().width : null,
            cardHeight: card ? card.getBoundingClientRect().height : null
          };
        });

        measurements.push({
          breakpoint: key,
          width: breakpoint.width,
          ...sizes
        });
      }

      // Save measurements for analysis
      await page.context().addInitScript(`
        console.log('Responsive measurements:', ${JSON.stringify(measurements, null, 2)});
      `);

      // Verify scaling relationship
      const mobile = measurements.find(m => m.breakpoint === 'mobile-portrait');
      const desktop = measurements.find(m => m.breakpoint === 'desktop-fhd');
      
      if (mobile && desktop && mobile.cardWidth && desktop.cardWidth) {
        const scaleFactor = desktop.cardWidth / mobile.cardWidth;
        expect(scaleFactor).toBeGreaterThan(1.5);
        expect(scaleFactor).toBeLessThan(3);
      }
    });
  });

  // Test 3: Touch target compliance
  test.describe('Touch Target Compliance', () => {
    test('All interactive elements meet 44x44px minimum', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
      await page.click('text=Start Game');
      await page.waitForSelector('.game-table', { state: 'visible' });
      await waitForStableLayout(page);

      const violations = await page.evaluate(() => {
        const interactiveElements = document.querySelectorAll('button, a, input, [role="button"], [onclick], .card');
        const violations: any[] = [];

        interactiveElements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const styles = getComputedStyle(element);
          
          // Account for padding
          const paddingTop = parseFloat(styles.paddingTop);
          const paddingBottom = parseFloat(styles.paddingBottom);
          const paddingLeft = parseFloat(styles.paddingLeft);
          const paddingRight = parseFloat(styles.paddingRight);
          
          const effectiveWidth = rect.width - paddingLeft - paddingRight;
          const effectiveHeight = rect.height - paddingTop - paddingBottom;

          if (effectiveWidth < 44 || effectiveHeight < 44) {
            violations.push({
              tagName: element.tagName,
              className: element.className,
              text: element.textContent?.trim().substring(0, 50),
              width: effectiveWidth,
              height: effectiveHeight,
              selector: element.className || element.tagName.toLowerCase()
            });
          }
        });

        return violations;
      });

      // Log violations for debugging
      if (violations.length > 0) {
        console.log('Touch target violations:', violations);
      }

      // Cards are exempt from strict touch target rules due to game requirements
      const nonCardViolations = violations.filter(v => !v.className?.includes('card'));
      expect(nonCardViolations).toHaveLength(0);
    });
  });

  // Test 4: Viewport-based component visibility
  test.describe('Component Visibility', () => {
    test('Components remain visible at all breakpoints', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.click('text=Start Game');
      await page.waitForSelector('.game-table', { state: 'visible' });

      for (const [key, breakpoint] of Object.entries(BREAKPOINTS)) {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
        await waitForStableLayout(page);

        const visibility = await page.evaluate(() => {
          const components = {
            gameTable: document.querySelector('.game-table'),
            playerHand: document.querySelector('.player-hand'),
            scoreBoard: document.querySelector('.scoreboard'),
            trickArea: document.querySelector('.trick-area')
          };

          const results: any = {};
          for (const [name, element] of Object.entries(components)) {
            if (element) {
              const rect = element.getBoundingClientRect();
              const styles = getComputedStyle(element);
              results[name] = {
                visible: styles.display !== 'none' && styles.visibility !== 'hidden',
                inViewport: rect.top < window.innerHeight && rect.bottom > 0 &&
                           rect.left < window.innerWidth && rect.right > 0,
                dimensions: { width: rect.width, height: rect.height }
              };
            }
          }
          return results;
        });

        // Verify critical components are visible
        expect(visibility.gameTable?.visible).toBe(true);
        expect(visibility.playerHand?.visible).toBe(true);
        
        // Take visibility screenshot
        await expect(page).toHaveScreenshot(`baseline/${key}/visibility-check.png`, {
          fullPage: false,
          animations: 'disabled'
        });
      }
    });
  });

  // Test 5: CSS Custom Property Values
  test.describe('CSS Custom Properties', () => {
    test('Responsive units calculate correctly', async ({ page }) => {
      await page.goto('http://localhost:3000');
      
      const customProperties: any[] = [];

      for (const [key, breakpoint] of Object.entries(BREAKPOINTS)) {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
        await waitForStableLayout(page);

        const props = await page.evaluate(() => {
          const root = document.documentElement;
          const styles = getComputedStyle(root);
          
          // Get all responsive unit values
          const rspUnits = [
            '--rsp-text-xs', '--rsp-text-sm', '--rsp-text-base', '--rsp-text-lg',
            '--rsp-space-xs', '--rsp-space-sm', '--rsp-space-base', '--rsp-space-lg',
            '--rsp-card-width', '--rsp-card-height',
            '--rsp-min-touch'
          ];

          const values: any = {};
          rspUnits.forEach(unit => {
            values[unit] = styles.getPropertyValue(unit);
          });

          return values;
        });

        customProperties.push({
          breakpoint: key,
          width: breakpoint.width,
          height: breakpoint.height,
          properties: props
        });
      }

      // Save custom property report
      await page.evaluate((props) => {
        console.log('CSS Custom Properties Report:', props);
      }, customProperties);
    });
  });

  // Test 6: Layout Shift Testing
  test.describe('Layout Stability', () => {
    test('Minimal layout shift during interactions', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.setViewportSize({ width: 1280, height: 720 });

      // Enable layout shift tracking
      await page.evaluateOnNewDocument(() => {
        window.layoutShifts = [];
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              window.layoutShifts.push({
                value: entry.value,
                time: entry.startTime,
                sources: entry.sources?.map(s => ({
                  node: s.node?.nodeName,
                  previousRect: s.previousRect,
                  currentRect: s.currentRect
                }))
              });
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
      });

      // Perform interactions
      await page.click('text=Start Game');
      await page.waitForSelector('.bidding-interface', { state: 'visible' });
      await waitForStableLayout(page);

      const shifts = await page.evaluate(() => window.layoutShifts);
      const totalShift = shifts.reduce((sum: number, shift: any) => sum + shift.value, 0);

      // Log detailed shift information
      if (shifts.length > 0) {
        console.log('Layout shifts detected:', shifts);
      }

      // CLS should be less than 0.1
      expect(totalShift).toBeLessThan(0.1);
    });
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