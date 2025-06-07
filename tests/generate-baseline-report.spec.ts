import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'desktop-2k', width: 2560, height: 1440 }
];

test.describe('Generate Baseline Report', () => {
  test('Generate comprehensive baseline report', async ({ page, context }) => {
    const report: any = {
      timestamp: new Date().toISOString(),
      breakpoints: {},
      cssAnalysis: {
        customProperties: 0,
        responsiveUnits: [],
        fixedPixelUsage: []
      }
    };

    // Test each breakpoint
    for (const bp of BREAKPOINTS) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Take start screen screenshot
      const startScreenPath = `test-results/baseline-${bp.name}-start.png`;
      await page.screenshot({ path: startScreenPath });

      // Analyze CSS at this breakpoint
      const cssAnalysis = await page.evaluate(() => {
        const root = document.documentElement;
        const styles = getComputedStyle(root);
        const analysis: any = {
          customProps: {},
          elementsWithFixedPx: 0,
          viewportInfo: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        };

        // Get custom properties
        for (let i = 0; i < styles.length; i++) {
          const prop = styles[i];
          if (prop.startsWith('--')) {
            analysis.customProps[prop] = styles.getPropertyValue(prop);
          }
        }

        // Check for fixed pixels
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
          const elStyles = getComputedStyle(el);
          ['width', 'height', 'font-size', 'padding', 'margin'].forEach(prop => {
            const value = elStyles.getPropertyValue(prop);
            if (value.includes('px') && !value.includes('clamp') && value !== '0px') {
              analysis.elementsWithFixedPx++;
            }
          });
        });

        return analysis;
      });

      // Try to start game and capture game state
      let gameScreenPath = '';
      try {
        const startButton = page.getByRole('button', { name: 'Start Game' });
        if (await startButton.isVisible({ timeout: 2000 })) {
          await startButton.click();
          await page.waitForTimeout(3000);
          
          gameScreenPath = `test-results/baseline-${bp.name}-game.png`;
          await page.screenshot({ path: gameScreenPath });
        }
      } catch (e) {
        console.log(`Could not start game at ${bp.name}`);
      }

      report.breakpoints[bp.name] = {
        viewport: bp,
        screenshots: {
          start: startScreenPath,
          game: gameScreenPath
        },
        cssAnalysis
      };

      // Go back to start for next iteration
      await page.goto('http://localhost:3000');
    }

    // Generate markdown report
    const reportContent = `# Responsive Design Baseline Report

Generated: ${report.timestamp}

## Breakpoint Analysis

${Object.entries(report.breakpoints).map(([name, data]: any) => `
### ${name} (${data.viewport.width}x${data.viewport.height})

**Screenshots:**
- Start Screen: ${data.screenshots.start}
- Game Screen: ${data.screenshots.game || 'Not captured'}

**CSS Analysis:**
- Custom Properties Found: ${Object.keys(data.cssAnalysis.customProps).length}
- Elements with Fixed Pixels: ${data.cssAnalysis.elementsWithFixedPx}
- Viewport: ${data.cssAnalysis.viewportInfo.width}x${data.cssAnalysis.viewportInfo.height}

${Object.keys(data.cssAnalysis.customProps).length > 0 ? 
`**Custom Properties (first 10):**
${Object.entries(data.cssAnalysis.customProps).slice(0, 10).map(([k, v]) => `- ${k}: ${v}`).join('\n')}` : 
'No custom properties found'}
`).join('\n')}

## Summary

- Total breakpoints tested: ${Object.keys(report.breakpoints).length}
- Screenshots generated: ${Object.values(report.breakpoints).reduce((acc: number, bp: any) => 
    acc + (bp.screenshots.start ? 1 : 0) + (bp.screenshots.game ? 1 : 0), 0)}

## Recommendations

Based on the analysis:
1. ${Object.values(report.breakpoints).some((bp: any) => Object.keys(bp.cssAnalysis.customProps).length === 0) ? 
   'CSS custom properties are not being detected - check if tokens.css is loaded' : 
   'CSS custom properties are properly loaded'}
2. Fixed pixel usage detected across all breakpoints - consider migrating to responsive units
3. Review the responsive design cheatsheet for compliance guidelines
`;

    // Save report
    const reportPath = path.join('test-results', 'baseline-report.md');
    fs.writeFileSync(reportPath, reportContent);
    console.log(`Report saved to: ${reportPath}`);

    // Also log summary to console
    console.log('\n=== BASELINE REPORT SUMMARY ===');
    Object.entries(report.breakpoints).forEach(([name, data]: any) => {
      console.log(`\n${name}:`);
      console.log(`- Custom props: ${Object.keys(data.cssAnalysis.customProps).length}`);
      console.log(`- Fixed pixels: ${data.cssAnalysis.elementsWithFixedPx} elements`);
    });
  });
});