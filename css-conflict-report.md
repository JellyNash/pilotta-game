# CSS Conflict Analysis Report

## Executive Summary

Found significant CSS conflicts across 18 CSS files with:
- **48 duplicate selectors** defined in multiple files
- **45 z-index declarations** with potential layering conflicts  
- **109 stacking context creators** that can break z-index inheritance
- **3 !important declarations** (minimal, which is good)
- Multiple overflow property conflicts

## Critical Conflicts Found

### 1. Duplicate Selectors (Same selector in multiple files)

#### High Priority Duplicates:
- `.app` - defined in both `App.css` and `index.css`
- `.game-header` - defined in `App.css` and `index.css` (twice!)
- `.game-content` - defined in `App.css`, `index.css`, and `responsive-fixes.css`
- `.game-table` - defined in `index.css`, `table-center.css` (twice), and `containment.css`
- `.player-zone` - defined in `PlayerZone.css` and `responsive-fixes.css`
- `.playing-card` - defined in `Card.css` and `index.css`
- `.announcement-container` - defined in `AnnouncementSystem.css` and `containment.css`

#### Card-related Duplicates:
- `.playing-card:focus-visible` - defined twice in `Card.css` and once in `index.css`
- Multiple `.ph-flex-*` selectors duplicated within `PlayerHandFlex.css`
- `.trick-card-*` position selectors duplicated in `TrickArea.css`

### 2. Z-Index Conflicts

#### Z-Index Hierarchy Issues:
```
Highest to Lowest:
- z-index: 100 → .game-header (hardcoded in index.css)
- z-index: var(--z-tooltip) → tooltips and zoomed cards
- z-index: var(--z-modal) → modals
- z-index: var(--z-bidding-interface) → bidding interface
- z-index: var(--z-ui-overlay) → UI overlays
- z-index: var(--z-card-hover) → hovered cards
- z-index: calc(var(--z-card-base) + 15) → south player area
- z-index: calc(var(--z-card-base) + 10) → other player areas
- z-index: var(--z-card-base) → base cards
- z-index: 20 → south player hand (hardcoded in index.css)
- z-index: -1, -2 → announcement decorations
```

**Conflicts:**
- South player has both `z-index: 20` (hardcoded) and `calc(var(--z-card-base) + 15)`
- Multiple competing z-index systems (hardcoded vs CSS variables)

### 3. Stacking Context Conflicts

**109 elements create new stacking contexts**, which can break z-index inheritance:

#### Major Stacking Context Creators:
- `.game-table-grid` - uses `isolation: isolate`
- All player areas use `position: relative/absolute` + `z-index`
- All announcement elements use `transform`
- Card elements use combinations of:
  - `transform` (for animations/rotations)
  - `position` + `z-index`
  - `filter` and `backdrop-filter` (glass effects)
  - `opacity < 1`

### 4. Overflow Conflicts

**Conflicting overflow strategies:**
- `.game-table` set to `overflow: visible` in `table-center.css`
- `.announcement-container` set to `overflow: hidden` in `AnnouncementSystem.css`
- Multiple files trying to control overflow on same elements
- Responsive fallback uses `overflow: auto` for small screens

### 5. Position Property Conflicts

**Position usage breakdown:**
- 23 elements use `position: relative`
- 17 elements use `position: absolute`  
- 7 elements use `position: fixed`

**Potential conflicts:**
- Cards use both `position: relative` (Card.css) and transforms
- Player zones mix absolute and relative positioning
- Fixed positioning used for modals and announcements may conflict

### 6. CSS Specificity Wars

Found multiple instances of increasingly specific selectors targeting the same elements:
- `.card` vs `.playing-card` vs `.ph-flex-card`
- `.player-zone` vs `.player-area-*` vs `.player-seat`
- Generic vs position-specific selectors (e.g., `[data-position="south"]`)

## Recommendations

### Immediate Actions:
1. **Consolidate duplicate selectors** - Move shared styles to a single file
2. **Standardize z-index system** - Remove hardcoded values (100, 20) and use only CSS variables
3. **Fix stacking context issues** - Review transform usage on containers
4. **Resolve overflow conflicts** - Establish clear overflow strategy per component

### Architecture Improvements:
1. **Use CSS Layers** (`@layer`) to establish clear precedence
2. **Implement naming conventions** (BEM or similar) to avoid conflicts
3. **Create single source of truth** for layout and positioning
4. **Document z-index scale** in tokens.css

### Critical Fixes:
1. Remove duplicate `.game-header` definitions
2. Consolidate `.playing-card` styles
3. Fix competing z-index systems for south player
4. Resolve overflow property conflicts on `.game-table`