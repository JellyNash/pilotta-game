import { chromium } from '@playwright/test';
import fs from 'fs';

async function generateComplianceReport() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const report: any = {
    timestamp: new Date().toISOString(),
    breakpoints: {},
    cssVariables: {},
    violations: {
      fixedPixels: [],
      touchTargets: [],
      missingResponsiveUnits: []
    },
    metrics: {}
  };

  const breakpoints = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 },
    { name: 'desktop-2k', width: 2560, height: 1440 }
  ];

  try {
    // Test each breakpoint
    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      // Check CSS variables
      const cssVars = await page.evaluate(() => {
        const root = document.documentElement;
        const styles = getComputedStyle(root);
        const vars: Record<string, string> = {};
        
        for (let i = 0; i < styles.length; i++) {
          const prop = styles[i];
          if (prop.startsWith('--rsp-')) {
            vars[prop] = styles.getPropertyValue(prop);
          }
        }
        
        return vars;
      });
      
      report.breakpoints[bp.name] = {
        viewport: bp,
        cssVariables: cssVars,
        screenshot: `baseline-${bp.name}-report.png`
      };
      
      // Take screenshot
      await page.screenshot({ 
        path: `test-results/baseline-${bp.name}-report.png`,
        fullPage: false 
      });
    }
    
    // Check for fixed pixel violations
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:3000');
    
    const pixelViolations = await page.evaluate(() => {
      const violations: any[] = [];
      const elements = document.querySelectorAll('*');
      
      elements.forEach(el => {
        const styles = getComputedStyle(el);
        const props = ['width', 'height', 'font-size', 'padding', 'margin'];
        
        props.forEach(prop => {
          const value = styles.getPropertyValue(prop);
          if (value.includes('px') && !value.includes('clamp') && 
              !value.includes('var(--') && value !== '0px') {
            violations.push({
              element: el.tagName + (el.className ? `.${el.className}` : ''),
              property: prop,
              value: value
            });
          }
        });
      });
      
      return violations.slice(0, 20); // First 20 violations
    });
    
    report.violations.fixedPixels = pixelViolations;
    
    // Generate report file
    const reportContent = `# Responsive Design Compliance Report
    
Generated: ${report.timestamp}

## CSS Variables by Breakpoint

${Object.entries(report.breakpoints).map(([name, data]: any) => `
### ${name} (${data.viewport.width}x${data.viewport.height})
CSS Variables found: ${Object.keys(data.cssVariables).length}
${Object.entries(data.cssVariables).slice(0, 10).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
`).join('\n')}

## Violations Summary

### Fixed Pixel Values (${report.violations.fixedPixels.length} found)
${report.violations.fixedPixels.slice(0, 10).map((v: any) => 
  `- ${v.element}: ${v.property} = ${v.value}`
).join('\n')}

## Screenshots Generated
${Object.entries(report.breakpoints).map(([name, data]: any) => 
  `- ${data.screenshot}`
).join('\n')}
`;

    fs.writeFileSync('test-results/compliance-report.md', reportContent);
    console.log('Compliance report generated: test-results/compliance-report.md');
    
  } catch (error) {
    console.error('Error generating report:', error);
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  generateComplianceReport();
}