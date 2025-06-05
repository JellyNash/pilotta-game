# CSS !important Refactoring Implementation Guide

## Phase 1: Remove Container Query Conflict (Quick Win)

### Problem
`/src/layouts/responsive.css` line 78-79 sets `container-type: size` on `.card-container`, which breaks absolute positioning in PlayerHand.

### Solution
1. Remove container queries from card containers
2. Apply container queries to parent elements only

### Implementation Steps:

#### Step 1: Update responsive.css
```css
/* OLD - Remove this */
.card-container {
  container-type: size;
}

/* NEW - Apply to game wrapper instead */
.game-table-wrapper {
  container-type: size;
}
```

#### Step 2: Remove container-type overrides from PlayerHand.css
```css
/* Remove all instances of: */
container-type: normal !important;
```

## Phase 2: Fix CSS Cascade Order

### Current Import Order (in index.css):
```css
@import './layouts/responsive-variables.css';
@import './layouts/responsive.css';
/* Component styles loaded after */
```

### Recommended Order:
1. CSS Reset/Normalize
2. Design tokens (variables)
3. Base/Generic styles
4. Layout systems
5. Component styles
6. Utility/Override styles

## Phase 3: Refactor Card Positioning Without !important

### Current Approach (BAD):
```css
.player-hand-wrapper[data-position="south"] .card-slot:nth-child(1) { 
  transform: translateX(-50%) translateX(calc(-3.5 * 120px * 0.85)) rotate(-15deg) translateY(35px) !important;
}
```

### New Approach (GOOD):
```css
/* Use CSS custom properties for configuration */
.player-hand-wrapper[data-position="south"] {
  --card-width: 120px;
  --card-height: 168px;
  --card-spacing: 0.85;
  --fan-angle: 5deg;
}

/* Use data attributes for card index */
.player-hand-wrapper[data-position="south"] .card-slot[data-index="1"] {
  --card-offset: -3.5;
  --card-rotation: calc(var(--card-offset) * var(--fan-angle));
  --card-elevation: calc(abs(var(--card-offset)) * 10px);
  
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: 
    translateX(-50%) 
    translateX(calc(var(--card-offset) * var(--card-width) * var(--card-spacing)))
    rotate(var(--card-rotation))
    translateY(var(--card-elevation));
}
```

## Phase 4: Create Isolated Component Styles

### Option 1: CSS Modules
```typescript
// PlayerHand.module.css
.wrapper { /* scoped automatically */ }
.cardSlot { /* scoped automatically */ }

// PlayerHand.tsx
import styles from './PlayerHand.module.css';
<div className={styles.wrapper}>
```

### Option 2: Increase Specificity Naturally
```css
/* Instead of using !important, be more specific */
.game-table .player-zone .player-hand-wrapper[data-position="south"] .card-slot {
  /* These rules will win without !important */
}
```

### Option 3: Use :where() to Control Specificity
```css
/* Low specificity base styles */
:where(.card-slot) {
  position: relative;
  width: var(--card-width, 120px);
}

/* Higher specificity component styles */
.player-hand-wrapper .card-slot {
  position: absolute;
  /* Wins over :where() without !important */
}
```

## Phase 5: Testing Strategy

### Visual Regression Tests
1. Capture screenshots at key viewports:
   - 1280x720 (HD)
   - 1920x1080 (Full HD)
   - 2560x1440 (2K)
   - 3840x2160 (4K)

2. Test scenarios:
   - 8 cards in hand
   - 4 cards in hand
   - 1 card in hand
   - Hover states
   - All player positions

### Manual Testing Checklist
- [ ] Cards display in correct fan formation
- [ ] Hover effects work properly
- [ ] No z-index issues
- [ ] Cards maintain size at all viewports
- [ ] East/West rotation is correct
- [ ] No visual glitches during animations

## Implementation Timeline

1. **Hour 1**: Remove container query conflicts
2. **Hour 2**: Restructure CSS cascade
3. **Hour 3-4**: Refactor south player (human) styles
4. **Hour 5**: Refactor north player styles
5. **Hour 6**: Refactor east/west player styles
6. **Hour 7**: Testing and bug fixes
7. **Hour 8**: Documentation and cleanup

## Success Metrics

- **0** !important declarations in PlayerHand.css
- **< 10** !important declarations total (only critical overrides)
- No visual regressions
- Improved maintainability
- Clear CSS architecture documentation