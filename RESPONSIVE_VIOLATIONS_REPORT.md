# Responsive Design Violations Report

Generated: 2025-01-07

## Summary

This report identifies all violations of the responsive design principles outlined in `/docs/RESPONSIVE_DESIGN_CHEATSHEET.md`. The main violations include:
- Fixed pixel values not using clamp()
- Missing rem units for dimensions
- Hardcoded values in inline styles
- Media queries using px instead of rem

## CSS File Violations

### 1. `/src/components/ContractIndicator.css`
- **Line 19**: `width: clamp(140px, 25vw, 200px);`
  - ❌ Should use rem units: `width: clamp(8.75rem, 25vw, 12.5rem);`

### 2. `/src/components/BiddingInterface.module.css`
- **Line 56**: `flex: 1 1 clamp(180px, 60%, 500px);`
  - ❌ Should use rem: `flex: 1 1 clamp(11.25rem, 60%, 31.25rem);`
- **Line 62**: `flex: 0 1 clamp(120px, 35%, 300px);`
  - ❌ Should use rem: `flex: 0 1 clamp(7.5rem, 35%, 18.75rem);`
- **Lines 161, 188, 196**: Media queries using px
  - ❌ `@media (max-width: 640px)` → `@media (max-width: 40rem)`
  - ❌ `@media (max-width: 480px)` → `@media (max-width: 30rem)`
  - ❌ `@media (max-width: 320px)` → `@media (max-width: 20rem)`

### 3. `/src/components/PlayerHandFlex.css`
- **Line 48-49**: `min-width: 44px; min-height: 44px;`
  - ❌ Should use rem: `min-width: 2.75rem; min-height: 2.75rem;`
- **Line 71**: `width: min(95vw, 800px);`
  - ❌ Should use rem: `width: min(95vw, 50rem);`
- **Line 76**: `perspective: 1000px;`
  - ❌ Should use rem: `perspective: 62.5rem;`
- **Line 116**: `20px` in translateY
  - ❌ Should use CSS variable: `var(--space-lg)`
- **Line 124**: `max-width: clamp(300px, 70vw, 600px);`
  - ❌ Should use rem: `max-width: clamp(18.75rem, 70vw, 37.5rem);`
- **Line 152**: `max-height: clamp(400px, 80vh, 700px);`
  - ❌ Should use rem: `max-height: clamp(25rem, 80vh, 43.75rem);`
- **Line 254**: `25px` in translateY
  - ❌ Should use CSS variable: `var(--space-xl)`
- **Line 282**: `--ph-arc-lift-step: 6px;`
  - ❌ Should use rem: `--ph-arc-lift-step: 0.375rem;`
- **Lines 196, 204, 278**: Media queries using px
  - ❌ Should use rem units

### 4. `/src/components/RoundTransitionScreen.css`
- **Line 24**: `max-width: clamp(300px, 90vw, 600px);`
  - ❌ Should use rem: `max-width: clamp(18.75rem, 90vw, 37.5rem);`
- **Line 192**: `height: 4px;`
  - ❌ Should use rem: `height: 0.25rem;`
- **Line 219**: `@media (max-width: 640px)`
  - ❌ Should use rem: `@media (max-width: 40rem)`

### 5. `/src/components/TrickArea.css`
- **Lines 46-47, 53-54**: Fixed pixel calculations
  ```css
  --card-width-base: calc(120px * var(--card-scale));
  --card-height-base: calc(168px * var(--card-scale));
  ```
  - ❌ Should use rem: `calc(7.5rem * var(--card-scale))`

### 6. `/src/components/TrickPileViewer.css`
- **Line 13**: `padding: 1rem;`
  - ❌ Should use CSS variable: `padding: var(--space-md);`
- **Line 21**: `width: clamp(320px, 90vw, 800px);`
  - ❌ Should use rem: `width: clamp(20rem, 90vw, 50rem);`
- **Line 41**: `gap: 1.5rem;`
  - ❌ Should use: `gap: var(--space-lg);`
- **Line 48**: `padding: 0.25rem 0.75rem;`
  - ❌ Should use: `padding: var(--space-xs) var(--space-sm);`
- **Line 75-76**: `width: 2rem; height: 2rem;`
  - ❌ Should use: `width: var(--space-2xl); height: var(--space-2xl);`
- **Line 191-192**: `width: 1.5rem; height: 1.5rem;`
  - ❌ Should use CSS variables
- **Line 219**: `inset: -1rem;`
  - ❌ Should use: `inset: calc(var(--space-md) * -1);`
- **Line 229**: `bottom: -1.5rem;`
  - ❌ Should use: `bottom: calc(var(--space-lg) * -1);`
- **Line 232-233**: `width: 1.75rem; height: 1.75rem;`
  - ❌ Should use CSS variables

## TSX Inline Style Violations

### 1. `/src/components/Card.tsx`
- **Line 228**: `marginTop: '0px'`
  - ❌ Should use CSS class with variable
- **Line 256, 267**: `textShadow: '2px 2px 3px rgba(0,0,0,0.3)'`
  - ❌ Should use CSS variable: `var(--shadow-text-sm)`
- **Line 269**: `marginTop: '-2px'`
  - ❌ Should use CSS variable: `calc(var(--space-2xs) * -1)`

### 2. `/src/components/TrickPile.tsx`
- **Line 46**: `transform: translateY(${index * 2}px) translateX(${index * 1}px)`
  - ❌ Should use rem or CSS variables

### 3. `/src/components/DeclarationCardsDisplay.tsx`
- **Line 82-83**: `filter: 'blur(10px)'` and `filter: 'blur(0px)'`
  - ❌ Should use CSS variables: `var(--blur-md)` and `var(--blur-none)`
- **Line 147**: `filter: 'blur(20px)'`
  - ❌ Should use: `var(--blur-lg)`

### 4. `/src/components/AnnouncementSystem.tsx`
- **Line 182, 189, 198**: `filter: 'blur(10px)'` and `filter: 'blur(0px)'`
  - ❌ Should use CSS variables
- **Line 224**: Complex boxShadow with inline values
  - ❌ Should use CSS variable composition
- **Line 240**: `filter: 'blur(20px)'`
  - ❌ Should use: `var(--blur-lg)`

## Recommendations

1. **Create Helper CSS Variables**:
   ```css
   --min-touch-target: 2.75rem; /* 44px */
   --perspective-default: 62.5rem; /* 1000px */
   --card-translate-hover: var(--space-lg);
   --card-translate-selected: var(--space-xl);
   ```

2. **Update Media Query Breakpoints**:
   - Replace all px-based media queries with rem units
   - Consider using CSS custom properties for breakpoints

3. **Replace Inline Styles**:
   - Move all inline style calculations to CSS classes
   - Use CSS variables for all spacing and effects

4. **Add ESLint Rule**:
   - Configure a rule to prevent hardcoded pixel values in both CSS and TSX files

## Priority Fixes

1. **High Priority** (Breaking responsive design):
   - Media queries using px units
   - Fixed pixel dimensions in clamp() functions
   - Inline styles with hardcoded values

2. **Medium Priority** (Maintenance concerns):
   - Direct rem/em values instead of CSS variables
   - Complex inline style calculations

3. **Low Priority** (Enhancement):
   - 1px borders (sometimes acceptable)
   - Transform values for subtle effects

## Next Steps

1. Update all files to use rem units in clamp() functions
2. Replace media query breakpoints with rem units
3. Create additional CSS variables for common values
4. Move inline styles to CSS classes
5. Run another audit after fixes to ensure compliance