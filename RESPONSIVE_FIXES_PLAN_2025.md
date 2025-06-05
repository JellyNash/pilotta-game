# Responsive Fixes Implementation Plan
**Date**: 2025-01-06
**Issues**: Bidding interface, card layouts, zoom clipping

## Overview
This plan addresses critical responsive issues that remain after the initial refactoring. All fixes will follow the established clamp-based approach with proper scaling at all viewport sizes.

## Issue 1: Bidding Interface Not Responsive

### Current Problems
- Fixed 2/3 and 1/3 width split breaks on small screens
- No structural changes for mobile layout
- Content gets cramped and unusable below 640px
- Hardcoded Tailwind classes don't scale

### Solution
1. **Replace fixed widths with responsive flex layout**:
   ```css
   /* BiddingInterface.css */
   .bid-suits-section {
     flex: 1 1 clamp(180px, 60%, 500px);
   }
   
   .bid-current-section {
     flex: 0 1 clamp(120px, 35%, 300px);
   }
   ```

2. **Add mobile breakpoint for vertical stacking**:
   ```css
   @media (max-width: 640px) {
     .bid-content-grid {
       flex-direction: column;
     }
     .bid-suits-section,
     .bid-current-section {
       flex: 1 1 100%;
       max-width: 100%;
     }
   }
   ```

3. **Scale button sizes with clamp()**:
   ```css
   .bid-suit-button {
     width: clamp(2.5rem, 5vw, 4rem);
     height: clamp(2.5rem, 5vw, 4rem);
     font-size: clamp(1rem, 2vw, 1.5rem);
   }
   ```

## Issue 2: East/West Card Layouts (50% Overlap)

### Current Problems
- Only 35% overlap causing cards to spread too wide
- Container max-height too restrictive (500px)
- No dynamic adjustment for card count
- Clipping when rotated

### Solution
1. **Increase overlap to 50%**:
   ```css
   .player-hand-east .card-wrapper,
   .player-hand-west .card-wrapper {
     margin-bottom: calc(var(--dynamic-card-height) * -0.5);
   }
   ```

2. **Increase container limits with clamp()**:
   ```css
   .player-hand-east,
   .player-hand-west {
     max-height: clamp(400px, 80vh, 700px);
     width: clamp(80px, 12vw, 120px);
   }
   ```

3. **Add card count adjustment**:
   ```css
   /* Dynamic overlap based on card count */
   .player-hand-east[data-card-count="8"] .card-wrapper,
   .player-hand-west[data-card-count="8"] .card-wrapper {
     margin-bottom: calc(var(--dynamic-card-height) * -0.55);
   }
   ```

## Issue 3: North Card Layout (50% Overlap)

### Current Problems
- Only 30% overlap causing horizontal spread
- Container max-width too restrictive (400px)
- Cards extend beyond allocated space

### Solution
1. **Increase overlap to 50%**:
   ```css
   .player-hand-north .card-wrapper {
     margin-right: calc(var(--dynamic-card-width) * -0.5);
   }
   ```

2. **Increase container width with clamp()**:
   ```css
   .player-hand-north {
     max-width: clamp(300px, 70vw, 600px);
     height: clamp(80px, 12vh, 120px);
   }
   ```

3. **Ensure proper z-index stacking**:
   ```css
   .player-hand-north .card-wrapper:nth-child(n) {
     z-index: calc(var(--z-index-card-base) + var(--index));
   }
   ```

## Issue 4: South Player Zoom Clipping

### Current Problems
- Fixed 2x scale exceeds viewport on small screens
- No boundary detection for positioning
- No safe area consideration

### Solution - Viewport Space Reservation
1. **Reserve space for zoom in viewport layout**:
   ```css
   /* tokens.css - Add zoom space reservation */
   :root {
     /* Zoom requires 2x card dimensions */
     --zoom-reserve-x: var(--card-width);  /* Reserve 1 card width on each side */
     --zoom-reserve-y: var(--card-height); /* Reserve 1 card height top/bottom */
     
     /* Game area bounds with zoom reservation */
     --game-area-width: calc(100vw - 2 * var(--zoom-reserve-x));
     --game-area-height: calc(100vh - 2 * var(--zoom-reserve-y));
   }
   ```

2. **Apply bounds to game table**:
   ```css
   /* table-center.css */
   .game-table {
     position: relative;
     width: var(--game-area-width);
     height: calc(var(--game-area-height) - 8rem); /* Header space */
     max-width: var(--game-area-width);
     max-height: calc(var(--game-area-height) - 8rem);
     margin: var(--zoom-reserve-y) var(--zoom-reserve-x);
     display: flex;
     justify-content: center;
     align-items: center;
     overflow: visible;
   }
   
   /* Adjust table radius to fit within reserved space */
   :root {
     --table-radius-max: min(
       calc((var(--game-area-width) - var(--card-width)) / 2),
       calc((var(--game-area-height) - var(--card-height)) / 2)
     );
     --table-radius: clamp(10rem, 30vh, var(--table-radius-max));
   }
   ```

3. **Keep zoom at fixed 2x scale**:
   ```css
   /* Card.css */
   .card-zoomed {
     transform: scale(2); /* Always 2x - space is reserved */
   }
   ```

This approach ensures:
- The game layout never uses the full viewport
- Edge cards always have space "behind" them for 2x zoom
- No clipping occurs because zoom space is pre-allocated
- Works consistently across all viewport sizes

## Issue 5: Declaration Cards Display Clipping (60-70% clipped)

### Current Problems
- Declaration cards positioned 2.5x card height above South player
- East/West use 1.8x card width offset
- These large offsets push cards beyond container bounds
- No responsive scaling for declaration positioning

### Solution - Prioritize Visibility (Temporary Display)
1. **Use clamp() for declaration card positioning**:
   ```css
   /* Add to tokens.css */
   :root {
     /* Declaration cards offset - can overlap since temporary */
     --declaration-offset-v: clamp(
       calc(var(--card-height) * 1.2),    /* Min: 120% of card height */
       15vh,                               /* Preferred: 15% of viewport */
       calc(var(--card-height) * 1.8)     /* Max: 180% of card height */
     );
     --declaration-offset-h: clamp(
       calc(var(--card-width) * 1.2),     /* Min: 120% of card width */
       15vw,                              /* Preferred: 15% of viewport */
       calc(var(--card-width) * 1.8)      /* Max: 180% of card width */
     );
   }
   ```

2. **Update DeclarationCardsDisplay positioning**:
   ```tsx
   // Responsive positioning that maintains relative position
   const getDeclarationPosition = (position: Position) => {
     switch (position) {
       case Position.South:
         return `translateY(calc(-1 * var(--declaration-offset-v)))`;
       case Position.North:
         return `translateY(var(--declaration-offset-v))`;
       case Position.East:
         return `translateX(calc(-1 * var(--declaration-offset-h)))`;
       case Position.West:
         return `translateX(var(--declaration-offset-h))`;
     }
   };
   ```

3. **High z-index for temporary overlay**:
   ```css
   .declaration-cards-container {
     position: absolute;
     z-index: calc(var(--z-index-modal) - 10); /* Just below modals */
     /* No bounds checking - overlap is acceptable for momentary display */
   }
   ```

Note: Since this is a temporary display (3 seconds for AI, until trick end for human), overlapping other elements is acceptable. The priority is clear visibility of the declaration.

## Issue 6: Z-Index Hierarchy - Table Elements Clipping Cards

### Current Problems
- `.trick-area-centered` has same z-index as cards (--z-card-base)
- `.center-circle` has no z-index specified
- Table decorative elements can clip player cards
- No clear visual hierarchy established

### Solution
1. **Fix z-index assignments in table-center.css**:
   ```css
   /* Center circle should be below all cards */
   .center-circle {
     z-index: var(--z-base); /* 1 - lowest layer */
   }
   
   /* Trick area should use trick cards z-index */
   .trick-area-centered {
     z-index: var(--z-trick-cards); /* 20 - above regular cards */
   }
   
   /* Any table decorations */
   .table-decoration,
   .table-surface {
     z-index: var(--z-base); /* 1 - below all cards */
   }
   ```

2. **Ensure all player zones are above table**:
   ```css
   .player-seat,
   .player-hand-container {
     z-index: var(--z-card-base); /* 10 - above table elements */
     position: relative; /* Create stacking context */
   }
   ```

3. **Update tokens.css for clarity**:
   ```css
   :root {
     /* Z-index hierarchy - clear separation */
     --z-table-surface: 1;      /* Table decorations, center circle */
     --z-card-base: 10;         /* All player cards start here */
     --z-trick-cards: 20;       /* Cards in trick area */
     --z-south-player: 25;      /* Human player priority */
     --z-card-hover: 40;        /* Hovered cards */
     /* ... rest remains the same */
   }
   ```

This ensures cards are never clipped by table elements.

## Issue 7: Container Overflow Hierarchy

### Current Problems
- Mixed overflow strategies causing unexpected clipping
- Grid cells constraining content
- Z-index contexts trapping overflow

### Solution
1. **Remove constraining properties**:
   ```css
   /* game-grid.css */
   .player-north,
   .player-east,
   .player-south,
   .player-west {
     /* Remove these */
     /* min-width: 0; */
     /* min-height: 0; */
     
     /* Add proper containment */
     contain: layout style;
     overflow: visible;
   }
   ```

2. **Ensure proper stacking contexts**:
   ```css
   .game-table-grid {
     isolation: isolate;
   }
   
   .player-zone {
     z-index: var(--z-index-card-base);
     position: relative;
   }
   ```

## Issue 6: Additional Token Variables Needed

Add to tokens.css:
```css
:root {
  /* Card overlap ratios */
  --card-overlap-minimal: 0.2;
  --card-overlap-normal: 0.35;
  --card-overlap-compact: 0.5;
  --card-overlap-tight: 0.55;
  
  /* Responsive container limits */
  --hand-container-width: clamp(200px, 60vw, 600px);
  --hand-container-height: clamp(100px, 20vh, 200px);
  
  /* Zoom constraints */
  --zoom-scale-max: 2;
  --zoom-viewport-padding: clamp(10px, 5vw, 40px);
  
  /* Bidding responsive */
  --bid-button-size: clamp(2.5rem, 5vw, 4rem);
  --bid-section-min: 180px;
  --bid-breakpoint: 640px;
}
```

## Implementation Order

1. **Phase 1**: Fix container overflow hierarchy (foundation)
2. **Phase 2**: Update card layouts with 50% overlap
3. **Phase 3**: Fix zoom implementation
4. **Phase 4**: Refactor bidding interface
5. **Phase 5**: Test at all breakpoints

## Testing Checklist

- [ ] 320px (iPhone SE) - All elements visible, no horizontal scroll
- [ ] 375px (iPhone) - Cards properly overlapped, bidding stacked
- [ ] 768px (iPad) - Transition to horizontal bidding layout
- [ ] 1024px (Desktop) - Full layout with proper spacing
- [ ] 1440px (Large) - Scaled appropriately, no excessive gaps
- [ ] 2560px (4K) - Maximum scaling applied, centered layout

## Success Criteria

1. **No clipping** at any viewport size
2. **50% card overlap** for all bot players
3. **Bidding interface** usable on 320px screens
4. **Zoom feature** stays within viewport
5. **All values use clamp()** - no hardcoded pixels
6. **Smooth scaling** between all breakpoints