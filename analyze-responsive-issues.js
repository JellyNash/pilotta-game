// Comprehensive CSS Responsiveness Analysis Script
// Run this in the browser console when the game is loaded

function analyzeResponsiveness() {
  const report = {
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    },
    issues: [],
    warnings: [],
    elements: {}
  };

  // Test different viewport sizes
  const viewportSizes = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'Desktop', width: 1366, height: 768 },
    { name: 'Full HD', width: 1920, height: 1080 }
  ];

  // Check main containers
  const containers = [
    { selector: '#root', name: 'Root' },
    { selector: '.app', name: 'App' },
    { selector: '.game-content', name: 'Game Content' },
    { selector: '.game-table-grid', name: 'Game Grid' }
  ];

  containers.forEach(({ selector, name }) => {
    const el = document.querySelector(selector);
    if (el) {
      const styles = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      
      report.elements[name] = {
        dimensions: `${rect.width}x${rect.height}`,
        overflow: styles.overflow,
        position: styles.position,
        hasFixedDimensions: styles.width.includes('px') || styles.height.includes('px'),
        styles: {
          width: styles.width,
          height: styles.height,
          overflow: styles.overflow,
          position: styles.position
        }
      };

      // Check for issues
      if (styles.overflow === 'hidden') {
        report.warnings.push(`${name} has overflow:hidden - may clip content`);
      }
      if (rect.width > window.innerWidth || rect.height > window.innerHeight) {
        report.issues.push(`${name} exceeds viewport: ${rect.width}x${rect.height}`);
      }
    }
  });

  // Check specific components
  const components = [
    { selector: '.bidding-interface-modal', name: 'Bidding Modal' },
    { selector: '.contract-indicator', name: 'Contract Indicator' },
    { selector: '.player-area-south', name: 'South Player Area' },
    { selector: '.trick-area', name: 'Trick Area' },
    { selector: '.announcement-system', name: 'Announcements' }
  ];

  components.forEach(({ selector, name }) => {
    const el = document.querySelector(selector);
    if (el) {
      const styles = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      
      // Check if element is visible
      const isVisible = rect.width > 0 && rect.height > 0 && 
                       rect.top < window.innerHeight && 
                       rect.bottom > 0 &&
                       rect.left < window.innerWidth &&
                       rect.right > 0;

      // Check for clipping
      const parent = el.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const isClipped = rect.top < parentRect.top || 
                         rect.bottom > parentRect.bottom ||
                         rect.left < parentRect.left ||
                         rect.right > parentRect.right;
        
        if (isClipped) {
          report.issues.push(`${name} is being clipped by parent`);
        }
      }

      report.elements[name] = {
        visible: isVisible,
        position: styles.position,
        dimensions: `${rect.width}x${rect.height}`,
        location: `(${rect.left}, ${rect.top})`,
        zIndex: styles.zIndex,
        overflow: styles.overflow
      };

      // Check for responsive issues
      if (styles.position === 'absolute' && !styles.inset && 
          (!styles.left.includes('%') && !styles.right.includes('%'))) {
        report.warnings.push(`${name} uses absolute positioning without responsive units`);
      }

      if (styles.width.includes('px') && parseFloat(styles.width) > 300) {
        report.warnings.push(`${name} has fixed width: ${styles.width}`);
      }
    }
  });

  // Check cards
  const cards = document.querySelectorAll('.playing-card');
  let visibleCards = 0;
  let clippedCards = 0;
  
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const styles = window.getComputedStyle(card);
    
    if (rect.width > 0 && rect.height > 0) {
      visibleCards++;
      
      // Check if card is within viewport
      if (rect.top < 0 || rect.bottom > window.innerHeight ||
          rect.left < 0 || rect.right > window.innerWidth) {
        clippedCards++;
      }
    }
  });

  report.elements['Cards'] = {
    total: cards.length,
    visible: visibleCards,
    clipped: clippedCards
  };

  // Check for scrollbars
  report.scrollbars = {
    horizontal: document.documentElement.scrollWidth > window.innerWidth,
    vertical: document.documentElement.scrollHeight > window.innerHeight,
    bodyOverflow: window.getComputedStyle(document.body).overflow
  };

  // Media query analysis
  const mediaQueries = [
    '(max-width: 640px)',
    '(max-width: 768px)', 
    '(max-width: 1024px)',
    '(min-width: 1440px)'
  ];

  report.activeMediaQueries = mediaQueries.filter(mq => window.matchMedia(mq).matches);

  return report;
}

// Run analysis
const analysis = analyzeResponsiveness();
console.log('=== RESPONSIVE ANALYSIS ===');
console.log(analysis);

// Create visual report
function createVisualReport(report) {
  const div = document.createElement('div');
  div.id = 'responsive-report';
  div.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    background: rgba(0,0,0,0.9);
    color: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 99999;
    font-family: monospace;
    font-size: 12px;
  `;

  let html = '<h3>Responsive Analysis Report</h3>';
  html += `<p><strong>Viewport:</strong> ${report.viewport.width}x${report.viewport.height} (${report.viewport.orientation})</p>`;
  
  if (report.issues.length > 0) {
    html += '<h4 style="color: #ff6b6b;">Issues:</h4><ul>';
    report.issues.forEach(issue => {
      html += `<li style="color: #ff6b6b;">${issue}</li>`;
    });
    html += '</ul>';
  }

  if (report.warnings.length > 0) {
    html += '<h4 style="color: #ffd43b;">Warnings:</h4><ul>';
    report.warnings.forEach(warning => {
      html += `<li style="color: #ffd43b;">${warning}</li>`;
    });
    html += '</ul>';
  }

  html += '<h4>Elements:</h4>';
  Object.entries(report.elements).forEach(([name, data]) => {
    html += `<details><summary>${name}</summary><pre>${JSON.stringify(data, null, 2)}</pre></details>`;
  });

  html += '<h4>Scrollbars:</h4>';
  html += `<pre>${JSON.stringify(report.scrollbars, null, 2)}</pre>`;

  html += '<button onclick="document.getElementById(\'responsive-report\').remove()">Close</button>';

  div.innerHTML = html;
  document.body.appendChild(div);
}

// Show visual report
createVisualReport(analysis);

// Test card visibility
function testCardVisibility() {
  const cards = document.querySelectorAll('.playing-card');
  cards.forEach((card, i) => {
    const rect = card.getBoundingClientRect();
    const isVisible = rect.top >= 0 && rect.left >= 0 && 
                     rect.bottom <= window.innerHeight && 
                     rect.right <= window.innerWidth;
    
    if (!isVisible) {
      card.style.outline = '3px solid red';
      console.warn(`Card ${i} is outside viewport or clipped`);
    }
  });
}

testCardVisibility();