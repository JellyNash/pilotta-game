# UI Debug Tools Guide

## Setup

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Load debugging tools in browser console:**
   ```javascript
   const script = document.createElement('script');
   script.src = '/debug-ui-issues.js';
   document.head.appendChild(script);
   ```

## Available Commands

### 1. Generate Complete Report
```javascript
UIDebugger.generateReport()
```
Provides a comprehensive analysis of:
- Z-index stacking issues
- Overlapping elements
- Responsive layout problems
- CSS layer violations
- Performance metrics

### 2. Highlight Z-Index Issues
```javascript
UIDebugger.highlightZIndexIssues()
```
Visually highlights all elements with z-index values, showing:
- Z-index value
- Element selector
- Color-coded by z-index level
- Auto-removes after 5 seconds

### 3. Isolate Component
```javascript
UIDebugger.isolateComponent('.player-hand[data-position="south"]')
```
Isolates a specific component for debugging:
- Fades out all other elements
- Highlights the target element
- Shows computed styles in console
- Auto-restores after 5 seconds

### 4. Test Responsiveness
```javascript
UIDebugger.testResponsiveness()
```
Creates iframes at different breakpoints:
- Mobile Small (480×854)
- Mobile Large (768×1024)
- Tablet (1024×768)
- Desktop (1280×720)
- Desktop XL (2560×1440)

## CSS Linting

Run linter to check for violations:
```bash
npm run lint:css
```

Check for specific issues:
```bash
# Check for !important declarations
npm run lint:css 2>&1 | grep "important"

# Check for errors only
npm run lint:css 2>&1 | grep "error"
```

## Visual Regression Testing

Run visual tests across resolutions:
```bash
npm run test:visual
```

This captures screenshots at:
- 1280×720
- 1600×900
- 1920×1080
- 2560×1440

## Common Issues to Check

### 1. Z-Index Conflicts
```javascript
// Find overlapping elements with same z-index
UIDebugger.findZIndexIssues()
```

### 2. Layout Overflow
```javascript
// Check if elements extend beyond viewport
UIDebugger.checkResponsiveIssues()
```

### 3. Performance Problems
```javascript
// Check DOM node count and expensive selectors
UIDebugger.checkPerformance()
```

### 4. CSS Layer Violations
```javascript
// Find !important outside overrides layer
UIDebugger.checkLayerOrder()
```

## Debugging Workflow

1. **Initial Analysis**
   ```javascript
   const report = UIDebugger.generateReport();
   ```

2. **Visual Inspection**
   ```javascript
   UIDebugger.highlightZIndexIssues();
   ```

3. **Component Isolation**
   ```javascript
   // Isolate problem components
   debugger.isolateComponent('.announcement-container');
   debugger.isolateComponent('.bidding-modal');
   ```

4. **Responsive Testing**
   ```javascript
   UIDebugger.testResponsiveness();
   ```

5. **Fix & Verify**
   - Make CSS changes
   - Run `npm run lint:css`
   - Re-run debugging tools

## Performance Tips

- Elements with `contain` CSS: Check with `UIDebugger.checkPerformance()`
- DOM node count should be < 1500 for optimal performance
- Expensive selectors should be minimized
- Use CSS layers to control cascade instead of !important

## Browser DevTools Integration

The debugger works alongside Chrome DevTools:
1. Use Elements panel to inspect highlighted issues
2. Use Performance panel to measure render performance
3. Use Coverage panel to find unused CSS
4. Use Rendering panel to visualize layer compositing