# Responsive Refactoring Plan - Pilotta Game

## Executive Summary
Complete responsive system overhaul from mixed approaches (CSS media queries, Tailwind, ResponsiveSystem.ts) to a modern clamp-first approach with minimal breakpoints.

## Current State Analysis

### Major Issues Identified (from audit):

1. **Multiple Breakpoint Systems** - 3 parallel responsive approaches causing conflicts
2. **Mixed Positioning Schemes** - Grid layout vs absolute positioning
3. **Legacy Card Layouts** - Two card systems (Arc vs Flex) 
4. **150+ Hardcoded Pixel Values** - Preventing smooth scaling
5. **65 Media Queries** - Most can be replaced with clamp()
6. **Missing CSS Variables** - Undefined tokens causing fallbacks
7. **Duplicate CSS Definitions** - Same selectors in multiple files
8. **No Accessibility** - Removed for performance, needs restoration
9. **Incomplete Testing** - Limited viewport coverage

### Files with Most Issues:
- `Card.tsx` - Inline pixel calculations (lines 226-280)
- `TrickPileViewer.css` - 15+ hardcoded dimensions
- `AnnouncementSystem.css` - Fixed transforms and blurs
- `index.css` - 20+ fixed dimensions
- `PlayerHandFlex.css` - Hardcoded card sizes

## Implementation Strategy

### Phase 1: Design Token System
Create comprehensive tokens in `tokens.css`:

```css
:root {
  /* Typography (9 sizes) */
  --fs-3xs: clamp(0.5rem, 1.5vw, 0.625rem);
  --fs-2xs: clamp(0.625rem, 1.75vw, 0.75rem);
  --fs-xs: clamp(0.75rem, 2vw, 0.875rem);
  --fs-sm: clamp(0.875rem, 2.25vw, 1rem);
  --fs-base: clamp(1rem, 2.5vw, 1.125rem);
  --fs-lg: clamp(1.125rem, 3vw, 1.25rem);
  --fs-xl: clamp(1.25rem, 3.5vw, 1.5rem);
  --fs-2xl: clamp(1.5rem, 4vw, 2rem);
  --fs-3xl: clamp(2rem, 5vw, 3rem);

  /* Spacing (10 sizes) */
  --space-3xs: clamp(0.125rem, 0.5vw, 0.25rem);
  --space-2xs: clamp(0.25rem, 0.75vw, 0.375rem);
  --space-xs: clamp(0.375rem, 1vw, 0.5rem);
  --space-sm: clamp(0.5rem, 1.5vw, 0.75rem);
  --space-md: clamp(0.75rem, 2vw, 1rem);
  --space-lg: clamp(1rem, 2.5vw, 1.5rem);
  --space-xl: clamp(1.5rem, 3vw, 2rem);
  --space-2xl: clamp(2rem, 4vw, 3rem);
  --space-3xl: clamp(3rem, 5vw, 4rem);
  --space-4xl: clamp(4rem, 6vw, 6rem);

  /* Components */
  --card-width: clamp(60px, 10vw, 120px);
  --card-height: clamp(84px, 14vw, 168px);
  --button-height: clamp(2rem, 5vw, 3rem);
  --modal-width: clamp(280px, 80vw, 600px);
  
  /* Effects */
  --blur-sm: clamp(4px, 0.5vw, 8px);
  --blur-md: clamp(8px, 1vw, 16px);
  --blur-lg: clamp(16px, 2vw, 32px);
}
```

### Phase 2: Component Migration Priority

1. **Card System** (Critical)
   - Remove inline calculations from Card.tsx
   - Consolidate to PlayerHandFlex only
   - Remove PlayerHandArcImproved

2. **Typography** (High)
   - Replace all font-size media queries
   - Use token system exclusively

3. **Layout Components** (High)
   - Migrate from absolute to grid positioning
   - Use GameLayout for all UI elements

4. **Decorative Elements** (Medium)
   - Convert shadows, borders, radii to tokens
   - Scale blur effects proportionally

### Phase 3: Clean Up

1. **Remove Duplicate CSS**
   - Consolidate selectors to single definitions
   - Fix z-index hierarchy with variables

2. **Reduce Media Queries**
   - From 65 to ~20 (structural only)
   - Keep only for layout changes (hide/show)

3. **Fix Global Overrides**
   - Remove generic `.absolute` selector
   - Scope modal selectors properly

### Phase 4: Accessibility Restoration

1. **Keyboard Navigation**
   - Arrow keys for card selection
   - Enter to play cards
   - Tab navigation for UI elements

2. **ARIA Labels**
   - Card descriptions
   - Game state announcements
   - Interactive element labels

3. **Focus Indicators**
   - Visible outlines
   - High contrast mode support

## Testing Requirements

### Viewport Matrix:
- 320px (min mobile)
- 375px (iPhone SE)
- 768px (tablet)
- 1024px (desktop)
- 1440px (large desktop)
- 1920px (full HD)
- 3840px (4K)

### Browser Coverage:
- Chrome 95+
- Safari 15+
- Firefox 92+
- Edge (latest)

## Enforcement

### ESLint Rule:
```javascript
"no-restricted-syntax": [
  "error",
  {
    "selector": "Literal[value=/^\\d+px$/]",
    "message": "Use clamp() tokens instead of hardcoded pixels"
  }
]
```

### Audit Script:
```bash
# Find remaining pixel values
grep -r ":[[:space:]]*[0-9]\+px" src/
```

## Success Criteria

1. **Zero hardcoded pixel values** (except min touch targets)
2. **Smooth scaling** from 320px to 4K
3. **< 20 media queries** (structural only)
4. **Single layout system** (grid-based)
5. **Full keyboard accessibility**
6. **All elements participate in scaling**

## Migration Checklist

- [ ] Create comprehensive token system
- [ ] Audit all components for pixel values
- [ ] Convert Card system to tokens
- [ ] Convert Typography to clamp()
- [ ] Convert Spacing to clamp()
- [ ] Convert Dimensions to clamp()
- [ ] Migrate to unified layout system
- [ ] Remove duplicate CSS
- [ ] Reduce media queries
- [ ] Add accessibility features
- [ ] Test all viewports
- [ ] Document patterns
- [ ] Add enforcement rules

## Notes

- All modern browsers support clamp() (95%+ coverage)
- Use rem for min/max (respects zoom), vw for fluid part
- Document all token calculations for future maintenance
- Every element must scale - no exceptions