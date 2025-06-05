# Declaration Cards Display Fix

## Problem
Declaration cards were being clipped by 60-70% when displayed after announcements. The cards were positioned too far above the player's hand area, causing them to extend beyond the visible container bounds.

## Root Cause Analysis
1. **Excessive Bottom Offset**: The south player's declaration cards used `bottom: calc(var(--card-height-responsive) * 2.5)`, which positioned them 420px above the player hand (with default card height of 168px).
2. **Container Constraints**: The PlayerZone container didn't have enough vertical space to accommodate cards positioned so far above.
3. **Card Size**: Cards were set to "medium" size, making them larger and more prone to clipping.
4. **Overlap Spacing**: Cards had `-space-x-10` (40px negative margin), causing excessive overlap.

## Solution Implemented

### 1. Adjusted Positioning Multipliers
- **South**: Reduced from `2.5` to `1.2` (now ~202px above instead of 420px)
- **East/West**: Reduced from `1.8` to `1.2` for consistency
- **North**: Kept at `0.7` as it was working correctly

### 2. Reduced Card Overlap
- Changed from `-space-x-10` to `-space-x-6` (24px negative margin)
- This provides better visibility of each card while maintaining the fan effect

### 3. Smaller Card Size
- Changed card size from "medium" to "small"
- Added explicit width/height: 100% to ensure cards fill their containers

## Files Modified
- `/src/components/DeclarationCardsDisplay.tsx`

## Testing
Created `test-declaration-positioning.html` to visualize the positioning issue and verify the fix.

## Alternative Solutions (If Still Clipping)

### Option 1: Move to Overlay Layer
Instead of rendering within PlayerZone, render declaration cards as overlays in GameTable:
```tsx
// In GameTable overlays section
{declarations.map(decl => (
  <DeclarationCardsDisplay
    key={decl.player.id}
    declarations={[decl]}
    position={decl.player.position}
    show={shouldShow}
    isHumanPlayer={!decl.player.isAI}
  />
))}
```

### Option 2: Use Viewport-Based Positioning
Change from absolute to fixed positioning with viewport units:
```tsx
case 'south':
  return {
    ...baseStyle,
    position: 'fixed',
    bottom: '20vh', // 20% from bottom of viewport
    left: '50vw',
    transform: 'translateX(-50%)'
  };
```

### Option 3: Dynamic Height Calculation
Calculate position based on actual container height:
```tsx
const containerHeight = useRef<HTMLDivElement>(null);
const bottomOffset = containerHeight.current ? 
  Math.min(containerHeight.current.offsetHeight * 0.8, cardHeight * 1.2) : 
  cardHeight * 1.2;
```

## Result
Declaration cards should now be fully visible above the player's hand without clipping. The positioning is more conservative while still clearly showing the declared cards with their golden glow effect and point values.