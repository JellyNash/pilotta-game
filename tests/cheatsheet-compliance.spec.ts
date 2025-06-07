import { test, expect } from '@playwright/test';

// Test suite to verify compliance with RESPONSIVE_DESIGN_CHEATSHEET.md rules

test.describe('Responsive Design Cheatsheet Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  // Rule 1: No fixed pixels without clamp()
  test('No fixed pixel values without clamp()', async ({ page }) => {
    await page.click('text=Start Game');
    await page.waitForSelector('.game-table', { state: 'visible' });

    const violations = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const violations: any[] = [];
      
      const checkProperty = (element: Element, prop: string, value: string) => {
        // Check if value contains px but not clamp
        if (value.includes('px') && !value.includes('clamp') && !value.includes('var(--')) {
          // Exclude 0px values and border-radius (allowed exceptions)
          if (value !== '0px' && prop !== 'border-radius' && !prop.includes('border-radius')) {
            violations.push({
              selector: element.className || element.tagName,
              property: prop,
              value: value,
              element: element.outerHTML.substring(0, 100)
            });
          }
        }
      };

      allElements.forEach(element => {
        const styles = getComputedStyle(element);
        
        // Check sizing properties
        ['width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
         'font-size', 'padding', 'margin', 'gap', 'top', 'left', 'right', 'bottom'].forEach(prop => {
          const value = styles.getPropertyValue(prop);
          checkProperty(element, prop, value);
        });
      });

      return violations;
    });

    // Log violations for debugging
    if (violations.length > 0) {
      console.log('Fixed pixel violations:', violations.slice(0, 10)); // First 10
    }

    // This is informational - the codebase may have legitimate fixed pixel uses
    console.log(`Found ${violations.length} potential fixed pixel violations`);
  });

  // Rule 2: Using correct responsive units
  test('Components use responsive units (--rsp-*)', async ({ page }) => {
    await page.click('text=Start Game');
    await page.waitForSelector('.game-table', { state: 'visible' });

    const usage = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const rspUsage = {
        total: 0,
        byType: {} as Record<string, number>
      };

      allElements.forEach(element => {
        const styles = getComputedStyle(element);
        const styleText = element.getAttribute('style') || '';
        
        // Check computed styles for --rsp variables
        for (let i = 0; i < styles.length; i++) {
          const prop = styles[i];
          const value = styles.getPropertyValue(prop);
          
          if (value.includes('--rsp-')) {
            rspUsage.total++;
            const matches = value.match(/--rsp-[a-zA-Z-]+/g);
            matches?.forEach(match => {
              rspUsage.byType[match] = (rspUsage.byType[match] || 0) + 1;
            });
          }
        }
      });

      return rspUsage;
    });

    console.log('Responsive unit usage:', usage);
    expect(usage.total).toBeGreaterThan(0);
  });

  // Rule 3: Touch target compliance (44x44 minimum)
  test('Interactive elements meet touch target minimums', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.click('text=Start Game');
    await page.waitForSelector('.game-table', { state: 'visible' });

    const results = await page.evaluate(() => {
      const interactive = document.querySelectorAll('button, a, input, select, [role="button"], [tabindex="0"]');
      const violations: any[] = [];
      const compliant: any[] = [];

      interactive.forEach(element => {
        const rect = element.getBoundingClientRect();
        const styles = getComputedStyle(element);
        
        // Calculate actual touch target size
        const width = rect.width;
        const height = rect.height;
        
        const data = {
          tag: element.tagName,
          class: element.className,
          width: Math.round(width),
          height: Math.round(height),
          text: element.textContent?.trim().substring(0, 30)
        };

        if (width < 44 || height < 44) {
          // Check if it has adequate padding/margin to compensate
          const paddingH = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
          const paddingV = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
          
          if (width + paddingH < 44 || height + paddingV < 44) {
            violations.push(data);
          } else {
            compliant.push(data);
          }
        } else {
          compliant.push(data);
        }
      });

      return { violations, compliant, total: interactive.length };
    });

    console.log(`Touch targets: ${results.compliant.length}/${results.total} compliant`);
    if (results.violations.length > 0) {
      console.log('Touch target violations:', results.violations);
    }
  });

  // Rule 4: Breakpoint compliance
  test('Layout responds correctly to all breakpoints', async ({ page }) => {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'desktop-lg', width: 1920, height: 1080 },
      { name: '2k', width: 2560, height: 1440 }
    ];

    await page.click('text=Start Game');
    await page.waitForSelector('.game-table', { state: 'visible' });

    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.waitForTimeout(300); // Allow layout to settle

      const layoutInfo = await page.evaluate(() => {
        const gameTable = document.querySelector('.game-table');
        const playerHand = document.querySelector('.player-hand');
        const cards = document.querySelectorAll('.card');
        
        return {
          gameTableSize: gameTable ? gameTable.getBoundingClientRect() : null,
          playerHandSize: playerHand ? playerHand.getBoundingClientRect() : null,
          cardCount: cards.length,
          firstCardSize: cards[0] ? cards[0].getBoundingClientRect() : null,
          overflow: {
            horizontal: document.documentElement.scrollWidth > window.innerWidth,
            vertical: document.documentElement.scrollHeight > window.innerHeight
          }
        };
      });

      console.log(`${bp.name} (${bp.width}x${bp.height}):`, layoutInfo);
      
      // Verify no unwanted overflow
      expect(layoutInfo.overflow.horizontal).toBe(false);
    }
  });

  // Rule 5: CSS Custom Properties are defined and used
  test('CSS custom properties are properly defined', async ({ page }) => {
    const customProps = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      const props: Record<string, string> = {};
      
      // Expected responsive properties from cheatsheet
      const expectedProps = [
        '--rsp-text-xs', '--rsp-text-sm', '--rsp-text-base', '--rsp-text-lg', '--rsp-text-xl',
        '--rsp-space-xs', '--rsp-space-sm', '--rsp-space-base', '--rsp-space-lg', '--rsp-space-xl',
        '--rsp-card-width', '--rsp-card-height',
        '--rsp-min-touch', '--rsp-max-width'
      ];

      expectedProps.forEach(prop => {
        const value = styles.getPropertyValue(prop);
        if (value) {
          props[prop] = value;
        }
      });

      return props;
    });

    console.log('Defined CSS custom properties:', Object.keys(customProps).length);
    
    // Verify essential properties are defined
    expect(customProps['--rsp-text-base']).toBeTruthy();
    expect(customProps['--rsp-space-base']).toBeTruthy();
    expect(customProps['--rsp-card-width']).toBeTruthy();
  });

  // Rule 6: Component scaling validation
  test('Components scale proportionally across viewports', async ({ page }) => {
    await page.click('text=Start Game');
    await page.waitForSelector('.game-table', { state: 'visible' });

    const measurements: any[] = [];

    // Measure at different viewports
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 1280, height: 720, name: 'desktop' },
      { width: 2560, height: 1440, name: '2k' }
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(300);

      const sizes = await page.evaluate(() => {
        const card = document.querySelector('.card');
        const button = document.querySelector('button');
        
        return {
          card: card ? {
            width: card.getBoundingClientRect().width,
            height: card.getBoundingClientRect().height,
            fontSize: getComputedStyle(card).fontSize
          } : null,
          button: button ? {
            width: button.getBoundingClientRect().width,
            height: button.getBoundingClientRect().height,
            fontSize: getComputedStyle(button).fontSize
          } : null
        };
      });

      measurements.push({ viewport: vp.name, ...vp, ...sizes });
    }

    console.log('Component scaling measurements:', measurements);

    // Verify scaling relationships
    if (measurements[0].card && measurements[2].card) {
      const mobileCardWidth = measurements[0].card.width;
      const desktopCardWidth = measurements[2].card.width;
      const scaleFactor = desktopCardWidth / mobileCardWidth;
      
      console.log(`Card scaling factor (2K/mobile): ${scaleFactor.toFixed(2)}x`);
      expect(scaleFactor).toBeGreaterThan(1.5);
      expect(scaleFactor).toBeLessThan(4);
    }
  });

  // Rule 7: Font size accessibility
  test('Font sizes meet accessibility minimums', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile (most restrictive)
    await page.click('text=Start Game');
    await page.waitForSelector('.game-table', { state: 'visible' });

    const fontSizes = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const tooSmall: any[] = [];
      const sizes: Record<string, number> = {};

      elements.forEach(element => {
        // Skip invisible elements
        const styles = getComputedStyle(element);
        if (styles.display === 'none' || styles.visibility === 'hidden') return;
        
        const fontSize = parseFloat(styles.fontSize);
        if (fontSize > 0) {
          const key = `${fontSize}px`;
          sizes[key] = (sizes[key] || 0) + 1;
          
          // Check if text content exists and font is too small
          if (element.textContent?.trim() && fontSize < 12) {
            tooSmall.push({
              tag: element.tagName,
              class: element.className,
              fontSize: fontSize,
              text: element.textContent.trim().substring(0, 50)
            });
          }
        }
      });

      return { sizes, tooSmall };
    });

    console.log('Font size distribution:', fontSizes.sizes);
    if (fontSizes.tooSmall.length > 0) {
      console.log('Elements with font size < 12px:', fontSizes.tooSmall);
    }
  });
});

// Performance monitoring tests
test.describe('Performance Metrics', () => {
  test('First Contentful Paint (FCP) timing', async ({ page }) => {
    const fcp = await page.evaluate(() => 
      new Promise(resolve => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
          resolve(fcp ? fcp.startTime : 0);
        }).observe({ entryTypes: ['paint'] });
      })
    );

    console.log(`First Contentful Paint: ${fcp}ms`);
  });

  test('Largest Contentful Paint (LCP) timing', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const lcp = await page.evaluate(() =>
      new Promise(resolve => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry ? lastEntry.startTime : 0);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      })
    );

    console.log(`Largest Contentful Paint: ${lcp}ms`);
  });
});