# UI Analysis Commands to Run

Run these commands in your browser console now that UIDebugger is loaded:

## 1. Full Report
```javascript
UIDebugger.generateReport()
```

## 2. Visual Z-Index Check
```javascript
UIDebugger.highlightZIndexIssues()
```
This will highlight all elements with z-index values for 5 seconds.

## 3. Check Specific Components
```javascript
// Check player hands
UIDebugger.isolateComponent('.player-hand-wrapper[data-position="south"]')

// Check bidding interface (when visible)
UIDebugger.isolateComponent('.bidding-modal')

// Check announcement system
UIDebugger.isolateComponent('.announcement-container')
```

## 4. Performance Check
```javascript
UIDebugger.checkPerformance()
```

## Expected Good Results

After our CSS refactoring, you should see:
- **Z-Index Issues**: 0 or minimal
- **CSS Layer Issues**: 0 (!important only in overrides)
- **DOM Nodes**: < 1500
- **Elements with Containment**: 5-10
- **Responsive Issues**: 0 or minimal

## Common Issues to Look For

1. **Overlapping Elements**: Check if any game components overlap unexpectedly
2. **Z-Index Conflicts**: Same z-index on overlapping elements
3. **Viewport Overflow**: Elements extending beyond screen edges
4. **Small Fonts**: Text smaller than 12px
5. **Performance**: High DOM node count or many expensive selectors

Run `UIDebugger.generateReport()` first to get the overview!