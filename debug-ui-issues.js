/**
 * UI/CSS Debugging Toolkit for Pilotta Game
 * Run this in the browser console while the game is running
 */

class UIDebugger {
  constructor() {
    this.issues = [];
    this.cssVariables = new Map();
    this.duplicateSelectors = new Map();
    this.importantUsage = [];
    this.unusedVariables = new Set();
  }

  // 1. Visual Inspection Helpers
  addDebugOverlay() {
    // Add visual grid overlay
    const overlay = document.createElement('div');
    overlay.id = 'debug-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      background-image: 
        repeating-linear-gradient(0deg, rgba(255,0,0,0.1) 0px, transparent 1px, transparent 99px, rgba(255,0,0,0.1) 100px),
        repeating-linear-gradient(90deg, rgba(255,0,0,0.1) 0px, transparent 1px, transparent 99px, rgba(255,0,0,0.1) 100px);
    `;
    document.body.appendChild(overlay);
    console.log('Debug overlay added. Remove with: document.getElementById("debug-overlay").remove()');
  }

  highlightZIndexIssues() {
    const elements = document.querySelectorAll('*');
    const zIndexMap = new Map();
    
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const zIndex = style.zIndex;
      if (zIndex !== 'auto' && zIndex !== '0') {
        if (!zIndexMap.has(zIndex)) {
          zIndexMap.set(zIndex, []);
        }
        zIndexMap.get(zIndex).push(el);
      }
    });

    // Sort by z-index value
    const sorted = Array.from(zIndexMap.entries()).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    
    console.log('Z-Index Stack:');
    sorted.forEach(([zIndex, elements]) => {
      console.log(`  z-index ${zIndex}: ${elements.length} elements`);
      elements.forEach(el => {
        console.log(`    - ${el.tagName}.${el.className}`);
      });
    });

    return sorted;
  }

  // 2. CSS Variable Inspection
  inspectCSSVariables() {
    const root = document.documentElement;
    const computedStyle = window.getComputedStyle(root);
    
    // Get all CSS properties
    Array.from(computedStyle).forEach(property => {
      if (property.startsWith('--')) {
        const value = computedStyle.getPropertyValue(property);
        this.cssVariables.set(property, value);
      }
    });

    console.log(`Found ${this.cssVariables.size} CSS variables`);
    
    // Check for undefined variables
    const undefinedVars = this.checkUndefinedVariables();
    if (undefinedVars.length > 0) {
      console.warn('Undefined CSS variables found:', undefinedVars);
      this.issues.push({ type: 'undefined-variables', items: undefinedVars });
    }

    return this.cssVariables;
  }

  checkUndefinedVariables() {
    const undefined = [];
    const sheets = Array.from(document.styleSheets);
    
    sheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          if (rule.style) {
            const cssText = rule.style.cssText;
            const varMatches = cssText.match(/var\(--[\w-]+\)/g) || [];
            varMatches.forEach(varMatch => {
              const varName = varMatch.match(/var\((--[\w-]+)\)/)[1];
              if (!this.cssVariables.has(varName)) {
                undefined.push({
                  variable: varName,
                  selector: rule.selectorText,
                  usage: varMatch
                });
              }
            });
          }
        });
      } catch (e) {
        // Cross-origin stylesheets will throw
      }
    });

    return undefined;
  }

  // 3. Component Isolation Testing
  isolateComponent(selector) {
    const component = document.querySelector(selector);
    if (!component) {
      console.error(`Component not found: ${selector}`);
      return;
    }

    // Create isolation container
    const isolationContainer = document.createElement('div');
    isolationContainer.id = 'component-isolation';
    isolationContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: white;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;

    // Clone component
    const clone = component.cloneNode(true);
    isolationContainer.appendChild(clone);
    document.body.appendChild(isolationContainer);

    console.log(`Component isolated. Remove with: document.getElementById("component-isolation").remove()`);
    return clone;
  }

  // 4. CSS Cascade Tracing
  traceCascade(selector, property) {
    const element = document.querySelector(selector);
    if (!element) {
      console.error(`Element not found: ${selector}`);
      return;
    }

    const sheets = Array.from(document.styleSheets);
    const matchingRules = [];

    sheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          if (rule.selectorText && element.matches(rule.selectorText)) {
            if (rule.style[property]) {
              matchingRules.push({
                selector: rule.selectorText,
                value: rule.style[property],
                specificity: this.calculateSpecificity(rule.selectorText),
                important: rule.style.getPropertyPriority(property) === 'important',
                source: sheet.href || 'inline'
              });
            }
          }
        });
      } catch (e) {
        // Cross-origin stylesheets
      }
    });

    // Sort by specificity
    matchingRules.sort((a, b) => {
      if (a.important && !b.important) return 1;
      if (!a.important && b.important) return -1;
      return b.specificity - a.specificity;
    });

    console.log(`Cascade for ${selector} -> ${property}:`);
    matchingRules.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.selector} = ${rule.value} ${rule.important ? '!important' : ''} (specificity: ${rule.specificity})`);
    });

    return matchingRules;
  }

  calculateSpecificity(selector) {
    // Simplified specificity calculation
    const ids = (selector.match(/#[\w-]+/g) || []).length;
    const classes = (selector.match(/\.[\w-]+/g) || []).length;
    const elements = (selector.match(/^[a-z]+|\s[a-z]+/gi) || []).length;
    return ids * 100 + classes * 10 + elements;
  }

  // 5. Responsive Testing
  testResponsiveness() {
    const breakpoints = [
      { name: 'mobile-small', width: 480, height: 800 },
      { name: 'mobile-large', width: 768, height: 1024 },
      { name: 'tablet', width: 1024, height: 768 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'desktop-xl', width: 2560, height: 1440 }
    ];

    console.log('Testing responsive breakpoints:');
    
    breakpoints.forEach(bp => {
      window.resizeTo(bp.width, bp.height);
      setTimeout(() => {
        const issues = this.checkLayoutIssues();
        console.log(`  ${bp.name} (${bp.width}x${bp.height}): ${issues.length} issues found`);
        if (issues.length > 0) {
          console.log('    Issues:', issues);
        }
      }, 100);
    });
  }

  checkLayoutIssues() {
    const issues = [];
    
    // Check for overflow
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      if (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) {
        issues.push({
          type: 'overflow',
          element: el,
          selector: this.getSelector(el)
        });
      }
    });

    // Check for overlapping elements
    const visibleElements = Array.from(elements).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    for (let i = 0; i < visibleElements.length; i++) {
      for (let j = i + 1; j < visibleElements.length; j++) {
        if (this.elementsOverlap(visibleElements[i], visibleElements[j])) {
          issues.push({
            type: 'overlap',
            elements: [visibleElements[i], visibleElements[j]],
            selectors: [this.getSelector(visibleElements[i]), this.getSelector(visibleElements[j])]
          });
        }
      }
    }

    return issues;
  }

  elementsOverlap(el1, el2) {
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();
    
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
  }

  getSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ').join('.')}`;
    return element.tagName.toLowerCase();
  }

  // 6. Performance Analysis
  analyzePerformance() {
    console.log('Analyzing CSS performance...');
    
    // Check for expensive selectors
    const expensiveSelectors = this.findExpensiveSelectors();
    if (expensiveSelectors.length > 0) {
      console.warn('Expensive selectors found:', expensiveSelectors);
      this.issues.push({ type: 'expensive-selectors', items: expensiveSelectors });
    }

    // Check for unused CSS
    const unusedCSS = this.findUnusedCSS();
    if (unusedCSS.length > 0) {
      console.warn(`Found ${unusedCSS.length} potentially unused CSS rules`);
      this.issues.push({ type: 'unused-css', items: unusedCSS });
    }

    // Check for duplicate rules
    const duplicates = this.findDuplicateRules();
    if (duplicates.length > 0) {
      console.warn('Duplicate CSS rules found:', duplicates);
      this.issues.push({ type: 'duplicate-rules', items: duplicates });
    }

    return this.issues;
  }

  findExpensiveSelectors() {
    const expensive = [];
    const sheets = Array.from(document.styleSheets);
    
    sheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          if (rule.selectorText) {
            // Check for expensive patterns
            if (rule.selectorText.includes('*') ||
                rule.selectorText.split(' ').length > 4 ||
                rule.selectorText.match(/:\w+\(.*\)/)) {
              expensive.push(rule.selectorText);
            }
          }
        });
      } catch (e) {
        // Cross-origin
      }
    });

    return expensive;
  }

  findUnusedCSS() {
    const unused = [];
    const sheets = Array.from(document.styleSheets);
    
    sheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          if (rule.selectorText) {
            try {
              const matches = document.querySelectorAll(rule.selectorText);
              if (matches.length === 0) {
                unused.push(rule.selectorText);
              }
            } catch (e) {
              // Invalid selector
            }
          }
        });
      } catch (e) {
        // Cross-origin
      }
    });

    return unused;
  }

  findDuplicateRules() {
    const duplicates = [];
    const seen = new Map();
    const sheets = Array.from(document.styleSheets);
    
    sheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          if (rule.selectorText) {
            const key = rule.selectorText + rule.style.cssText;
            if (seen.has(key)) {
              duplicates.push({
                selector: rule.selectorText,
                firstOccurrence: seen.get(key),
                duplicate: sheet.href || 'inline'
              });
            } else {
              seen.set(key, sheet.href || 'inline');
            }
          }
        });
      } catch (e) {
        // Cross-origin
      }
    });

    return duplicates;
  }

  // 7. Animation Performance
  checkAnimationPerformance() {
    const animatedElements = document.querySelectorAll('[class*="animate"], [class*="transition"]');
    const report = [];

    animatedElements.forEach(el => {
      const style = window.getComputedStyle(el);
      const willChange = style.willChange;
      const transform = style.transform;
      const backfaceVisibility = style.backfaceVisibility;

      report.push({
        element: this.getSelector(el),
        willChange,
        transform,
        backfaceVisibility,
        optimized: willChange !== 'auto' || transform.includes('translateZ')
      });
    });

    console.log('Animation Performance Report:');
    report.forEach(item => {
      console.log(`  ${item.element}: ${item.optimized ? '✓' : '✗'} optimized`);
      if (!item.optimized) {
        console.log(`    Consider adding: will-change: transform; or transform: translateZ(0);`);
      }
    });

    return report;
  }

  // 8. Generate Full Report
  generateReport() {
    console.log('=== UI/CSS Debug Report ===');
    
    // CSS Variables
    this.inspectCSSVariables();
    console.log(`\n1. CSS Variables: ${this.cssVariables.size} defined`);
    
    // Z-index issues
    const zIndexStack = this.highlightZIndexIssues();
    console.log(`\n2. Z-index Stack: ${zIndexStack.length} levels`);
    
    // Performance
    this.analyzePerformance();
    console.log(`\n3. Performance Issues: ${this.issues.length} found`);
    
    // Animation
    const animReport = this.checkAnimationPerformance();
    const unoptimized = animReport.filter(item => !item.optimized);
    console.log(`\n4. Animations: ${unoptimized.length} unoptimized elements`);
    
    // Layout issues
    const layoutIssues = this.checkLayoutIssues();
    console.log(`\n5. Layout Issues: ${layoutIssues.length} found`);
    
    // Summary
    console.log('\n=== Summary ===');
    console.log(`Total issues found: ${this.issues.length + layoutIssues.length + unoptimized.length}`);
    
    if (this.issues.length > 0) {
      console.log('\nDetailed Issues:');
      this.issues.forEach(issue => {
        console.log(`  ${issue.type}: ${issue.items.length} items`);
      });
    }

    return {
      cssVariables: this.cssVariables,
      zIndexStack,
      performanceIssues: this.issues,
      animationReport: animReport,
      layoutIssues
    };
  }
}

// Initialize debugger
const debugger = new UIDebugger();

console.log(`
UI Debugger Loaded! Available commands:

debugger.generateReport()           - Full UI/CSS analysis
debugger.addDebugOverlay()         - Add visual grid overlay
debugger.highlightZIndexIssues()   - Analyze z-index stack
debugger.inspectCSSVariables()     - Check CSS variables
debugger.isolateComponent(selector) - Test component in isolation
debugger.traceCascade(selector, property) - Trace CSS cascade
debugger.testResponsiveness()      - Test all breakpoints
debugger.checkAnimationPerformance() - Check animation optimization
debugger.analyzePerformance()      - Find CSS performance issues

Example: debugger.traceCascade('.playing-card', 'position')
`);

// Auto-run basic report
debugger.generateReport();
