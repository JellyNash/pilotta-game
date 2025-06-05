# Flexbox Card Layout Implementation

## Overview
Implemented a modern flexbox-based card layout system to replace the absolute positioning approach. This addresses card clipping issues and provides better responsive behavior.

## Changes Made

### 1. New Flexbox Components
- **PlayerHandFlex.css**: New CSS file with flexbox layout rules
- **PlayerHandFlex.tsx**: New component using flexbox layout
- **GameTable.tsx**: Added toggle to test flexbox layout (USE_FLEXBOX_LAYOUT = true)

### 2. Key Improvements

#### Card Container (`.ph-flex-container`)
```css
display: flex;
flex-direction: row;
flex-wrap: nowrap;
gap: var(--ph-card-gap, 8px);
align-items: center;
justify-content: center;
overflow: visible;
```

#### Card Items (`.ph-flex-card`)
```css
/* Flex item properties */
flex: 0 1 auto; /* Don't grow, can shrink, auto basis */
min-width: 0; /* Allow shrinking below content size */
min-height: 0; /* Allow shrinking below content size */
position: relative; /* Not absolute! */
```

### 3. Arc Effect Implementation
Instead of absolute positioning, the arc effect is achieved with transforms:
- Each card gets a rotation and translateY based on its position
- Hover states lift cards up while maintaining their arc position
- Smooth transitions for all interactions

### 4. Responsive Behavior
- Mobile (<640px): Smaller scale (0.6x), reduced arc
- Tablet (641-768px): 0.7x scale
- Desktop (769-1024px): 0.85x scale
- Large (1025-1440px): 0.95x scale
- Ultra-wide (>1440px): Full scale

### 5. Overflow Handling
- On small screens, horizontal scrolling is enabled if needed
- Scroll behavior is smooth with touch support
- Padding added before/after cards for scroll comfort

## Benefits

1. **No Clipping**: Cards no longer get cut off by container boundaries
2. **True Responsive**: Cards properly shrink and adapt to container size
3. **Better Performance**: No complex position calculations
4. **Cleaner Code**: Simpler CSS without absolute positioning math
5. **Natural Flow**: Cards follow document flow while maintaining visual appeal

## Testing

To toggle between the old and new layout:
1. Edit `GameTable.tsx`
2. Change `USE_FLEXBOX_LAYOUT` to `true` (flexbox) or `false` (absolute)
3. The flexbox layout is currently active

## Next Steps

1. Test thoroughly across different screen sizes
2. Fine-tune the arc curve if needed
3. Adjust responsive breakpoints based on testing
4. Once validated, remove the old absolute positioning code
5. Update all references to use the flexbox version

## Known Differences

- Arc calculation is slightly different (uses fixed rotations vs mathematical curve)
- Card spacing uses gap instead of overlapping positions
- Hover effects are simpler but more predictable