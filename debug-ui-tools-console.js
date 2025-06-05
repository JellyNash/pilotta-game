// Copy and paste this entire code block into your browser console

(function() {
  window.UIDebugger = {
    // Generate comprehensive UI report
    generateReport() {
      console.log('🔍 UI Debug Report');
      console.log('==================');
      
      // Check z-index issues
      const zIndexIssues = this.findZIndexIssues();
      console.log(`\n📊 Z-Index Issues: ${zIndexIssues.length}`);
      zIndexIssues.forEach(issue => console.log(`  - ${issue}`));
      
      // Check overlapping elements
      const overlaps = this.findOverlappingElements();
      console.log(`\n🔄 Overlapping Elements: ${overlaps.length}`);
      overlaps.forEach(overlap => console.log(`  - ${overlap}`));
      
      // Check responsive issues
      const responsiveIssues = this.checkResponsiveIssues();
      console.log(`\n📱 Responsive Issues: ${responsiveIssues.length}`);
      responsiveIssues.forEach(issue => console.log(`  - ${issue}`));
      
      // Check CSS layer order
      const layerIssues = this.checkLayerOrder();
      console.log(`\n🎨 CSS Layer Issues: ${layerIssues.length}`);
      layerIssues.forEach(issue => console.log(`  - ${issue}`));
      
      // Check performance metrics
      const perfMetrics = this.checkPerformance();
      console.log(`\n⚡ Performance Metrics:`);
      Object.entries(perfMetrics).forEach(([key, value]) => console.log(`  - ${key}: ${value}`));
      
      return {
        zIndexIssues,
        overlaps,
        responsiveIssues,
        layerIssues,
        perfMetrics
      };
    },

    // Find z-index stacking issues
    findZIndexIssues() {
      const issues = [];
      const elements = document.querySelectorAll('*');
      const zIndexMap = new Map();
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const zIndex = parseInt(style.zIndex);
        
        if (!isNaN(zIndex) && zIndex !== 0) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            if (!zIndexMap.has(zIndex)) {
              zIndexMap.set(zIndex, []);
            }
            zIndexMap.get(zIndex).push({
              element: el,
              selector: this.getSelector(el),
              rect
            });
          }
        }
      });
      
      // Check for overlapping elements with same z-index
      zIndexMap.forEach((elements, zIndex) => {
        if (elements.length > 1) {
          for (let i = 0; i < elements.length - 1; i++) {
            for (let j = i + 1; j < elements.length; j++) {
              if (this.rectsOverlap(elements[i].rect, elements[j].rect)) {
                issues.push(`Z-index ${zIndex}: ${elements[i].selector} overlaps with ${elements[j].selector}`);
              }
            }
          }
        }
      });
      
      return issues;
    },

    // Highlight elements with z-index issues
    highlightZIndexIssues() {
      const elements = document.querySelectorAll('*');
      const highlights = [];
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const zIndex = parseInt(style.zIndex);
        
        if (!isNaN(zIndex) && zIndex !== 0) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const highlight = document.createElement('div');
            highlight.className = 'debug-z-index-highlight';
            highlight.style.cssText = `
              position: fixed;
              top: ${rect.top}px;
              left: ${rect.left}px;
              width: ${rect.width}px;
              height: ${rect.height}px;
              border: 2px solid ${this.getZIndexColor(zIndex)};
              background: ${this.getZIndexColor(zIndex)}20;
              pointer-events: none;
              z-index: 999999;
            `;
            
            const label = document.createElement('div');
            label.style.cssText = `
              position: absolute;
              top: -20px;
              left: 0;
              background: ${this.getZIndexColor(zIndex)};
              color: white;
              padding: 2px 6px;
              font-size: 12px;
              font-family: monospace;
              border-radius: 3px;
            `;
            label.textContent = `z: ${zIndex} - ${this.getSelector(el)}`;
            highlight.appendChild(label);
            
            document.body.appendChild(highlight);
            highlights.push(highlight);
          }
        }
      });
      
      // Remove highlights after 5 seconds
      setTimeout(() => {
        highlights.forEach(h => h.remove());
      }, 5000);
      
      console.log(`Highlighted ${highlights.length} elements with z-index values`);
    },

    // Find overlapping elements
    findOverlappingElements() {
      const issues = [];
      const elements = Array.from(document.querySelectorAll('.game-card, .player-hand, .trick-area, .announcement-container'));
      
      for (let i = 0; i < elements.length - 1; i++) {
        for (let j = i + 1; j < elements.length; j++) {
          const rect1 = elements[i].getBoundingClientRect();
          const rect2 = elements[j].getBoundingClientRect();
          
          if (this.rectsOverlap(rect1, rect2) && !this.isParentChild(elements[i], elements[j])) {
            issues.push(`${this.getSelector(elements[i])} overlaps with ${this.getSelector(elements[j])}`);
          }
        }
      }
      
      return issues;
    },

    // Check responsive issues
    checkResponsiveIssues() {
      const issues = [];
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      
      // Check for elements outside viewport
      document.querySelectorAll('*').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          if (rect.right > viewport.width) {
            issues.push(`${this.getSelector(el)} extends beyond viewport (right: ${rect.right}px)`);
          }
          if (rect.bottom > viewport.height) {
            issues.push(`${this.getSelector(el)} extends beyond viewport (bottom: ${rect.bottom}px)`);
          }
        }
      });
      
      // Check font sizes
      document.querySelectorAll('*').forEach(el => {
        const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
        if (fontSize < 12 && el.textContent.trim()) {
          issues.push(`${this.getSelector(el)} has small font size: ${fontSize}px`);
        }
      });
      
      return issues;
    },

    // Check CSS layer order
    checkLayerOrder() {
      const issues = [];
      const stylesheets = Array.from(document.styleSheets);
      
      stylesheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach(rule => {
            if (rule.type === CSSRule.STYLE_RULE) {
              const declaration = rule.style;
              for (let i = 0; i < declaration.length; i++) {
                const prop = declaration[i];
                const value = declaration.getPropertyValue(prop);
                const priority = declaration.getPropertyPriority(prop);
                
                if (priority === 'important' && !rule.selectorText.includes('overrides')) {
                  issues.push(`!important found outside overrides: ${rule.selectorText} { ${prop}: ${value} !important; }`);
                }
              }
            }
          });
        } catch (e) {
          // Cross-origin stylesheet
        }
      });
      
      return issues;
    },

    // Check performance metrics
    checkPerformance() {
      const metrics = {};
      
      // Count DOM nodes
      metrics['DOM Nodes'] = document.querySelectorAll('*').length;
      
      // Check for expensive selectors
      let expensiveSelectors = 0;
      document.styleSheets.forEach(sheet => {
        try {
          Array.from(sheet.cssRules || []).forEach(rule => {
            if (rule.selectorText && rule.selectorText.match(/[\*\>\+\~]|:nth-/)) {
              expensiveSelectors++;
            }
          });
        } catch (e) {}
      });
      metrics['Expensive Selectors'] = expensiveSelectors;
      
      // Check reflow triggers
      const reflows = this.countReflowTriggers();
      metrics['Potential Reflows'] = reflows;
      
      // Check CSS containment
      const containment = this.checkContainment();
      metrics['Elements with Containment'] = containment;
      
      return metrics;
    },

    // Isolate a component for debugging
    isolateComponent(selector) {
      const target = document.querySelector(selector);
      if (!target) {
        console.error(`Element not found: ${selector}`);
        return;
      }
      
      // Hide all other elements
      document.querySelectorAll('body > *').forEach(el => {
        if (!el.contains(target) && el !== target) {
          el.style.opacity = '0.1';
          el.style.pointerEvents = 'none';
        }
      });
      
      // Highlight the target
      target.style.outline = '3px solid red';
      target.style.outlineOffset = '2px';
      
      // Show computed styles
      const styles = window.getComputedStyle(target);
      console.log('Computed Styles:', {
        position: styles.position,
        display: styles.display,
        width: styles.width,
        height: styles.height,
        zIndex: styles.zIndex,
        transform: styles.transform,
        contain: styles.contain
      });
      
      // Restore after 5 seconds
      setTimeout(() => {
        document.querySelectorAll('body > *').forEach(el => {
          el.style.opacity = '';
          el.style.pointerEvents = '';
        });
        target.style.outline = '';
        target.style.outlineOffset = '';
      }, 5000);
    },

    // Helper functions
    getSelector(element) {
      if (element.id) return `#${element.id}`;
      if (element.className && typeof element.className === 'string') {
        return `.${element.className.split(' ').join('.')}`;
      }
      return element.tagName.toLowerCase();
    },

    rectsOverlap(rect1, rect2) {
      return !(rect1.right < rect2.left || 
               rect1.left > rect2.right || 
               rect1.bottom < rect2.top || 
               rect1.top > rect2.bottom);
    },

    isParentChild(el1, el2) {
      return el1.contains(el2) || el2.contains(el1);
    },

    getZIndexColor(zIndex) {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      return colors[Math.abs(zIndex) % colors.length];
    },

    countReflowTriggers() {
      let count = 0;
      document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);
        // Check for properties that trigger reflow
        if (style.position === 'absolute' || style.position === 'fixed') count++;
        if (style.float !== 'none') count++;
        if (style.display === 'table' || style.display === 'table-cell') count++;
      });
      return count;
    },

    checkContainment() {
      let count = 0;
      document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.contain !== 'none' && style.contain !== '') count++;
      });
      return count;
    }
  };

  console.log('🛠️ UI Debugger loaded! Available commands:');
  console.log('  - UIDebugger.generateReport()');
  console.log('  - UIDebugger.highlightZIndexIssues()');
  console.log('  - UIDebugger.isolateComponent(selector)');
  console.log('  - UIDebugger.testResponsiveness() [removed from inline version]');
})();