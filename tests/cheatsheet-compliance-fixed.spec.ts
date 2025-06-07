import { test, expect } from '@playwright/test';

// Helper to start the game
async function startGame(page: any) {
  const startButton = page.getByRole('button', { name: 'Start Game' });
  await startButton.click();
  await page.waitForSelector('.bidding-interface, .game-table', { 
    state: 'visible',
    timeout: 10000 
  });
}

test.describe('Responsive Design Cheatsheet Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  // Rule 1: No fixed pixels without clamp()
  test('Check for fixed pixel values without clamp()', async ({ page }) => {
    await startGame(page);
    await page.waitForTimeout(1000);

    const violations = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const violations: any[] = [];
      const stats = {
        totalElements: allElements.length,
        elementsWithStyles: 0,
        fixedPixelCount: 0
      };
      
      allElements.forEach(element => {
        const styles = getComputedStyle(element);
        if (styles.length > 0) stats.elementsWithStyles++;
        
        // Check key properties for fixed pixels
        ['width', 'height', 'font-size', 'padding-top', 'padding-bottom', 
         'padding-left', 'padding-right', 'margin-top', 'margin-bottom',
         'margin-left', 'margin-right', 'gap'].forEach(prop => {
          const value = styles.getPropertyValue(prop);
          
          // Check if value contains px but not clamp or var
          if (value && value.includes('px') && 
              !value.includes('clamp') && 
              !value.includes('var(--') &&
              value !== '0px' && 
              !prop.includes('border')) {
            stats.fixedPixelCount++;
            if (violations.length < 20) { // Limit to first 20
              violations.push({
                selector: element.className || element.tagName.toLowerCase(),
                property: prop,
                value: value
              });
            }
          }
        });
      });

      return { violations, stats };
    });

    console.log('Fixed pixel analysis:', violations.stats);
    console.log(`Sample violations (${violations.violations.length} shown):`, violations.violations);
  });

  // Rule 2: Using correct responsive units
  test('Check usage of responsive units (--rsp-*)', async ({ page }) => {
    await startGame(page);
    await page.waitForTimeout(1000);

    const usage = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const stats = {
        totalElements: elements.length,
        elementsUsingRsp: 0,
        rspVariables: new Set<string>(),
        sampleUsages: [] as any[]
      };

      elements.forEach(element => {
        const styles = getComputedStyle(element);
        let usesRsp = false;
        
        // Check all computed styles
        for (let i = 0; i < styles.length; i++) {
          const prop = styles[i];
          const value = styles.getPropertyValue(prop);
          
          if (value.includes('var(--rsp-')) {
            usesRsp = true;
            // Extract variable names
            const matches = value.match(/var\(--rsp-[^)]+\)/g);
            matches?.forEach(match => {
              const varName = match.replace('var(', '').replace(')', '');
              stats.rspVariables.add(varName);
            });
            
            if (stats.sampleUsages.length < 10) {
              stats.sampleUsages.push({
                element: element.className || element.tagName,
                property: prop,
                value: value
              });
            }
          }
        }
        
        if (usesRsp) stats.elementsUsingRsp++;
      });

      return {
        ...stats,
        rspVariables: Array.from(stats.rspVariables)
      };
    });

    console.log(`Responsive unit usage: ${usage.elementsUsingRsp}/${usage.totalElements} elements`);
    console.log('RSP variables found:', usage.rspVariables);
    console.log('Sample usages:', usage.sampleUsages);
  });

  // Rule 3: CSS Custom Properties are defined
  test('Verify CSS custom properties are properly defined', async ({ page }) => {
    const customProps = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      const props: Record<string, any> = {
        all: {},
        responsive: {},
        colors: {},
        spacing: {}
      };
      
      // Collect all custom properties
      for (let i = 0; i < styles.length; i++) {
        const prop = styles[i];
        if (prop.startsWith('--')) {
          const value = styles.getPropertyValue(prop);
          props.all[prop] = value;
          
          // Categorize
          if (prop.includes('rsp')) {
            props.responsive[prop] = value;
          } else if (prop.includes('color') || prop.includes('bg')) {
            props.colors[prop] = value;
          } else if (prop.includes('space') || prop.includes('gap')) {
            props.spacing[prop] = value;
          }
        }
      }
      
      return {
        totalCount: Object.keys(props.all).length,
        responsiveCount: Object.keys(props.responsive).length,
        colorCount: Object.keys(props.colors).length,
        spacingCount: Object.keys(props.spacing).length,
        responsive: props.responsive
      };
    });

    console.log('CSS Custom Properties Summary:');
    console.log(`- Total: ${customProps.totalCount}`);
    console.log(`- Responsive (--rsp-*): ${customProps.responsiveCount}`);
    console.log(`- Colors: ${customProps.colorCount}`);
    console.log(`- Spacing: ${customProps.spacingCount}`);
    
    if (customProps.responsiveCount > 0) {
      console.log('\nResponsive properties:', customProps.responsive);
    }
  });

  // Rule 4: Touch target compliance (44x44 minimum)
  test('Verify touch targets meet minimum size', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await startGame(page);
    await page.waitForTimeout(1000);

    const results = await page.evaluate(() => {
      const interactive = document.querySelectorAll('button, a, input, select, [role="button"], .card');
      const analysis = {
        total: interactive.length,
        compliant: 0,
        nonCompliant: [] as any[],
        byType: {} as Record<string, number>
      };

      interactive.forEach(element => {
        const rect = element.getBoundingClientRect();
        const type = element.classList.contains('card') ? 'card' : element.tagName.toLowerCase();
        
        analysis.byType[type] = (analysis.byType[type] || 0) + 1;
        
        if (rect.width >= 44 && rect.height >= 44) {
          analysis.compliant++;
        } else if (type !== 'card') { // Cards are exempt
          analysis.nonCompliant.push({
            type,
            class: element.className,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            text: element.textContent?.trim().substring(0, 30)
          });
        }
      });

      return analysis;
    });

    console.log(`Touch targets: ${results.compliant}/${results.total} compliant`);
    console.log('By type:', results.byType);
    if (results.nonCompliant.length > 0) {
      console.log('Non-compliant targets:', results.nonCompliant);
    }
  });

  // Rule 5: Component scaling validation
  test('Verify components scale proportionally', async ({ page }) => {
    await startGame(page);
    
    const measurements: any[] = [];
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 720, name: 'desktop' },
      { width: 2560, height: 1440, name: '2k' }
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(500);

      const sizes = await page.evaluate(() => {
        // Find key elements
        const card = document.querySelector('.card');
        const button = document.querySelector('.bidding-interface button, .game-table button');
        const container = document.querySelector('.game-table, .bidding-interface');
        
        return {
          card: card ? {
            width: card.getBoundingClientRect().width,
            height: card.getBoundingClientRect().height,
            fontSize: getComputedStyle(card).fontSize
          } : null,
          button: button ? {
            width: button.getBoundingClientRect().width,
            height: button.getBoundingClientRect().height,
            fontSize: getComputedStyle(button).fontSize,
            padding: getComputedStyle(button).padding
          } : null,
          container: container ? {
            width: container.getBoundingClientRect().width,
            height: container.getBoundingClientRect().height
          } : null
        };
      });

      measurements.push({ 
        viewport: vp.name, 
        width: vp.width,
        ...sizes 
      });
    }

    console.log('\nComponent scaling across viewports:');
    measurements.forEach(m => {
      console.log(`${m.viewport} (${m.width}px):`);
      if (m.card) console.log(`  - Card: ${Math.round(m.card.width)}x${Math.round(m.card.height)}px, font: ${m.card.fontSize}`);
      if (m.button) console.log(`  - Button: ${Math.round(m.button.width)}x${Math.round(m.button.height)}px, font: ${m.button.fontSize}`);
      if (m.container) console.log(`  - Container: ${Math.round(m.container.width)}x${Math.round(m.container.height)}px`);
    });

    // Calculate scaling factors
    if (measurements[0].card && measurements[3].card) {
      const mobileCard = measurements[0].card.width;
      const desktopCard = measurements[3].card.width;
      const scaleFactor = desktopCard / mobileCard;
      
      console.log(`\nCard scaling factor (2K/mobile): ${scaleFactor.toFixed(2)}x`);
      expect(scaleFactor).toBeGreaterThan(1.5);
      expect(scaleFactor).toBeLessThan(4);
    }
  });

  // Rule 6: Performance - Layout shift
  test('Measure layout shift during interactions', async ({ page }) => {
    // Enable layout shift tracking
    await page.evaluateOnNewDocument(() => {
      (window as any).layoutShifts = [];
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            (window as any).layoutShifts.push({
              value: (entry as any).value,
              time: entry.startTime
            });
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    });

    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
    
    // Perform interactions
    await startGame(page);
    await page.waitForTimeout(2000);

    const shifts = await page.evaluate(() => (window as any).layoutShifts || []);
    const totalShift = shifts.reduce((sum: number, shift: any) => sum + shift.value, 0);

    console.log(`Layout shifts: ${shifts.length} detected`);
    console.log(`Total CLS value: ${totalShift.toFixed(4)}`);
    
    // CLS should be less than 0.1 for good experience
    expect(totalShift).toBeLessThan(0.1);
  });
});