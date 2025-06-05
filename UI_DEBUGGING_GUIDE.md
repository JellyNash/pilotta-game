# UI/CSS Debugging Checklist for Pilotta Game

## Quick Start
1. Start the development server: `npm run dev`
2. Open browser DevTools (F12)
3. Load the debugging script in console: 
   ```javascript
   const script = document.createElement('script');
   script.src = '/debug-ui-issues.js';
   document.head.appendChild(script);
   ```

## 1. Visual Inspection Checklist

### Browser DevTools
- [ ] **Elements Panel**
  - Check computed styles for unexpected values
  - Look for overridden styles (crossed out)
  - Verify CSS variables are resolving correctly
  - Check box model for unexpected margins/padding

- [ ] **Device Emulation**
  - Test at these breakpoints:
    - Mobile: 480x800
    - Tablet: 768x1024  
    - Desktop: 1280x720
    - Desktop XL: 2560x1440
  - Check for overflow issues
  - Verify responsive behavior

- [ ] **Performance Panel**
  - Check for layout thrashing
  - Monitor paint and composite times
  - Look for forced reflows

## 2. Common Issues to Check

### Card Display Issues
```javascript
// Check card positioning
debugger.traceCascade('.playing-card', 'position');
debugger.traceCascade('.playing-card', 'z-index');

// Check card container
debugger.isolateComponent('.player-hand[data-position="south"]');
```

### Z-Index Problems
```javascript
// Analyze z-index stack
debugger.highlightZIndexIssues();

// Expected z-index hierarchy:
// - Base cards: 10
// - Selected cards: 90
// - Hover cards: 100
// - UI overlays: 50
// - Modals: 100
```

### CSS Variable Issues
```javascript
// Check all variables are defined
debugger.inspectCSSVariables();

// Common problematic variables:
// --card-width, --card-height
// --bid-modal-width, --suit-button-size
// --announcement-spacing
```

### Responsive Issues
```javascript
// Test all breakpoints
debugger.testResponsiveness();

// Check specific components at different sizes
window.resizeTo(480, 800); // Mobile
debugger.checkLayoutIssues();
```

## 3. Component-Specific Debugging

### ResponsiveCardHand
- [ ] Cards display in correct fan formation
- [ ] Hover effects work (scale: 1.1, translateY: -20px)
- [ ] Cards don't overflow container
- [ ] Proper overlap spacing

### BiddingInterface
- [ ] Modal centers correctly
- [ ] Buttons are clickable
- [ ] Trump suit selection visible
- [ ] No positioning conflicts

### DeclarationManager
- [ ] Button appears in bottom-right for human
- [ ] Announcements display correctly
- [ ] Cards flip animation works
- [ ] Auto-hide timing correct (3-4 seconds)

### BiddingAnnouncement
- [ ] Appears in front of player cards
- [ ] Correct position for each player
- [ ] Spring animations smooth
- [ ] Auto-hide after 3 seconds

## 4. CSS Architecture Checks

### Layer Order (should be):
1. reset
2. base
3. tokens
4. tailwind
5. layout
6. components
7. states
8. utilities
9. overrides

### Check for violations:
```javascript
// Find !important usage outside overrides
debugger.analyzePerformance();

// Check for duplicate selectors
const report = debugger.generateReport();
console.log(report.performanceIssues);
```

## 5. Animation Performance

```javascript
// Check all animations are optimized
debugger.checkAnimationPerformance();

// Should have:
// - will-change: transform
// - transform: translateZ(0)
// - backface-visibility: hidden
```

## 6. Automated Tests

### Run CSS Linting
```bash
npm run lint:css
```

### Run Visual Regression Tests
```bash
npm run test:visual
```

## 7. Manual Test Scenarios

### Card Sorting
1. Start new game
2. Verify cards are sorted by rank within suits
3. Check alternating red-black pattern
4. Confirm trump suit on far right
5. Change trump - verify reorganization

### Bidding Flow
1. Enter bidding phase
2. Click bid amount controls
3. Test hold-to-accelerate
4. Select trump suit
5. Submit bid
6. Verify announcement appears

### Declaration System
1. Get hand with declarations
2. Click "Declare!" button
3. Verify announcement shows
4. On next trick, click "Show!"
5. Check card flip animations

## 8. Debugging Specific Issues

### If cards are misaligned:
```javascript
// Check container queries
debugger.traceCascade('.card-container', 'container-type');
debugger.traceCascade('.game-table-wrapper', 'container-type');
```

### If animations are janky:
```javascript
// Check for GPU acceleration
const cards = document.querySelectorAll('.playing-card');
cards.forEach(card => {
  const style = getComputedStyle(card);
  console.log('Transform:', style.transform);
  console.log('Will-change:', style.willChange);
});
```

### If responsive breaks:
```javascript
// Check viewport units
debugger.traceCascade(':root', '--card-width-responsive');
debugger.traceCascade(':root', '--space-md');
```

## 9. Performance Optimization

### Check for:
- [ ] Unnecessary reflows
- [ ] Excessive DOM manipulation
- [ ] Unoptimized selectors
- [ ] Missing CSS containment
- [ ] Inefficient animations

### Tools:
```javascript
// Find expensive selectors
const expensive = debugger.findExpensiveSelectors();
console.log('Expensive selectors:', expensive);

// Find unused CSS
const unused = debugger.findUnusedCSS();
console.log('Unused CSS rules:', unused.length);
```

## 10. Final Verification

- [ ] All gameplay features work
- [ ] No console errors
- [ ] Smooth animations (60 FPS)
- [ ] Responsive at all breakpoints
- [ ] Accessibility compliant
- [ ] Performance metrics good

## Troubleshooting Commands Reference

```javascript
// Full analysis
debugger.generateReport();

// Visual helpers
debugger.addDebugOverlay();

// Component testing
debugger.isolateComponent('.component-selector');

// CSS debugging
debugger.traceCascade('.selector', 'property');
debugger.inspectCSSVariables();

// Performance
debugger.checkAnimationPerformance();
debugger.analyzePerformance();

// Layout
debugger.checkLayoutIssues();
debugger.testResponsiveness();
```
