/**
 * Visual Regression Test Helper for Pilotta Game
 * Captures screenshots of UI components for visual comparison
 */

class VisualRegressionTester {
  constructor() {
    this.captures = new Map();
    this.diffs = [];
  }

  // Capture element as canvas
  async captureElement(selector, name) {
    const element = document.querySelector(selector);
    if (!element) {
      console.error(`Element not found: ${selector}`);
      return null;
    }

    // Use html2canvas if available, otherwise use DOM-to-Image approach
    try {
      const canvas = await this.elementToCanvas(element);
      this.captures.set(name, {
        selector,
        canvas,
        timestamp: new Date().toISOString(),
        dimensions: {
          width: element.offsetWidth,
          height: element.offsetHeight
        }
      });
      
      console.log(`✅ Captured: ${name}`);
      return canvas;
    } catch (error) {
      console.error(`Failed to capture ${name}:`, error);
      return null;
    }
  }

  // Convert element to canvas (simplified approach)
  async elementToCanvas(element) {
    const rect = element.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Create a data URL from the element
    const data = await this.serializeElement(element);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = data;
    });
  }

  // Serialize element as SVG data URL
  async serializeElement(element) {
    const rect = element.getBoundingClientRect();
    const styles = await this.getComputedStyles(element);
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="${styles}">
            ${element.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `;
    
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // Get all computed styles as string
  async getComputedStyles(element) {
    const computed = window.getComputedStyle(element);
    const styles = [];
    
    for (let i = 0; i < computed.length; i++) {
      const prop = computed[i];
      styles.push(`${prop}: ${computed.getPropertyValue(prop)}`);
    }
    
    return styles.join('; ');
  }

  // Capture common UI components
  async captureUIComponents() {
    const components = [
      { selector: '.game-table', name: 'game-table' },
      { selector: '.player-hand[data-position="south"]', name: 'player-hand-south' },
      { selector: '.playing-card', name: 'playing-card-sample' },
      { selector: '.trick-area', name: 'trick-area' },
      { selector: '.bidding-interface', name: 'bidding-interface' },
      { selector: '.declaration-manager', name: 'declaration-manager' }
    ];

    console.log('Capturing UI components...\n');
    
    for (const component of components) {
      await this.captureElement(component.selector, component.name);
    }

    console.log(`\nCaptured ${this.captures.size} components`);
  }

  // Test responsive behavior
  async testResponsive() {
    const breakpoints = [
      { name: 'mobile', width: 480, height: 800 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'desktop-xl', width: 2560, height: 1440 }
    ];

    console.log('Testing responsive layouts...\n');

    for (const bp of breakpoints) {
      // Resize window
      window.resizeTo(bp.width, bp.height);
      
      // Wait for reflow
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Capture key components
      await this.captureElement('.game-table', `game-table-${bp.name}`);
      await this.captureElement('.player-hand[data-position="south"]', `player-hand-${bp.name}`);
      
      console.log(`✅ Tested ${bp.name} (${bp.width}x${bp.height})`);
    }
  }

  // Check for visual differences
  compareCaptures(name1, name2) {
    const capture1 = this.captures.get(name1);
    const capture2 = this.captures.get(name2);
    
    if (!capture1 || !capture2) {
      console.error('Captures not found for comparison');
      return null;
    }

    // Simple dimension comparison
    const dimDiff = {
      width: Math.abs(capture1.dimensions.width - capture2.dimensions.width),
      height: Math.abs(capture1.dimensions.height - capture2.dimensions.height)
    };

    if (dimDiff.width > 0 || dimDiff.height > 0) {
      console.warn(`Dimension difference between ${name1} and ${name2}:`);
      console.warn(`  Width: ${dimDiff.width}px`);
      console.warn(`  Height: ${dimDiff.height}px`);
    }

    return dimDiff;
  }

  // Generate visual report
  generateReport() {
    const report = document.createElement('div');
    report.id = 'visual-regression-report';
    report.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: white;
      z-index: 10000;
      overflow: auto;
      padding: 20px;
    `;

    // Add title
    const title = document.createElement('h1');
    title.textContent = 'Visual Regression Test Report';
    title.style.cssText = 'color: #333; font-family: Arial, sans-serif;';
    report.appendChild(title);

    // Add captures
    this.captures.forEach((capture, name) => {
      const section = document.createElement('div');
      section.style.cssText = 'margin: 20px 0; border: 1px solid #ddd; padding: 10px;';
      
      const heading = document.createElement('h3');
      heading.textContent = `${name} (${capture.dimensions.width}x${capture.dimensions.height})`;
      heading.style.cssText = 'color: #666; font-family: Arial, sans-serif;';
      section.appendChild(heading);
      
      const info = document.createElement('p');
      info.textContent = `Selector: ${capture.selector} | Captured: ${capture.timestamp}`;
      info.style.cssText = 'color: #999; font-size: 12px;';
      section.appendChild(info);
      
      section.appendChild(capture.canvas);
      report.appendChild(section);
    });

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close Report';
    closeBtn.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #333;
      color: white;
      border: none;
      cursor: pointer;
    `;
    closeBtn.onclick = () => report.remove();
    report.appendChild(closeBtn);

    document.body.appendChild(report);
  }

  // Test specific UI states
  async testUIStates() {
    const tests = [
      {
        name: 'Card Hover State',
        setup: () => {
          const card = document.querySelector('.playing-card');
          if (card) card.classList.add('hover');
        },
        cleanup: () => {
          const card = document.querySelector('.playing-card');
          if (card) card.classList.remove('hover');
        }
      },
      {
        name: 'Card Selected State',
        setup: () => {
          const card = document.querySelector('.playing-card');
          if (card) card.classList.add('ring-4', 'ring-blue-500');
        },
        cleanup: () => {
          const card = document.querySelector('.playing-card');
          if (card) card.classList.remove('ring-4', 'ring-blue-500');
        }
      },
      {
        name: 'Modal Open State',
        setup: () => {
          const modal = document.querySelector('.bidding-interface');
          if (modal) modal.style.display = 'block';
        },
        cleanup: () => {
          const modal = document.querySelector('.bidding-interface');
          if (modal) modal.style.display = 'none';
        }
      }
    ];

    console.log('Testing UI states...\n');

    for (const test of tests) {
      // Setup state
      test.setup();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capture
      await this.captureElement('.game-table', `state-${test.name.toLowerCase().replace(/\s+/g, '-')}`);
      
      // Cleanup
      test.cleanup();
      
      console.log(`✅ Tested: ${test.name}`);
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('Starting Visual Regression Tests...\n');
    
    // Capture baseline
    await this.captureUIComponents();
    
    // Test responsive
    await this.testResponsive();
    
    // Test UI states
    await this.testUIStates();
    
    // Generate report
    this.generateReport();
    
    console.log('\n✅ All tests complete! Report generated.');
  }
}

// Note about html2canvas
console.log(`
Visual Regression Tester Loaded!

Note: For better screenshot quality, include html2canvas library:
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

Available commands:
const tester = new VisualRegressionTester();

tester.captureElement(selector, name)     - Capture specific element
tester.captureUIComponents()              - Capture all main components
tester.testResponsive()                   - Test all breakpoints
tester.testUIStates()                     - Test interactive states
tester.runAllTests()                      - Run complete test suite
tester.generateReport()                   - Show visual report
tester.compareCaptures(name1, name2)      - Compare two captures

Example: tester.runAllTests()
`);
