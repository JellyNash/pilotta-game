# Card Fan Arc Design

## Current Issues
1. Cards 1, 7, 8 are out of position
2. Rotation jumps irregularly (card 8 jumps to 20deg instead of 15deg)
3. Y-offsets don't follow a smooth curve
4. Not scalable for different card sizes

## New Mathematical Approach

### Arc Formula
Using an inverted parabolic curve for smooth, natural downward arc (frown shape):

```
Y = arcHeight * normalizedPos²
```

Where:
- `normalizedPos` ranges from -1 to 1 across the fan
- Center cards (pos ≈ 0) are lowest (at base)
- Edge cards (pos ≈ ±1) are highest

### Key Parameters
```css
--ph-fan-spread: 0.85;           /* Horizontal overlap */
--ph-fan-arc-height: 50px;       /* Maximum arc height */
--ph-fan-rotation-range: 35deg;  /* Total rotation range */
--ph-card-scale: 1;              /* For size adjustment */
```

### Card Positioning

For 8 cards (index 0-7):
1. **X Position**: Linear spacing with overlap
   - Position = (index - 3.5) * cardWidth * spread
   
2. **Y Position**: Parabolic arc
   - normalizedPos = (index - 3.5) / 4
   - Y = arcHeight * (1 - normalizedPos²)
   
3. **Rotation**: Linear progression
   - rotation = rotationRange * normalizedPos
   - Ranges from -30.6deg to +30.6deg

### Visual Result
```
  1               8
    2           7
      3       6
        4   5
```

Cards form a smooth downward arc (frown shape) with:
- Card 1: -30.6deg rotation, 38.3px elevation (highest)
- Card 2: -21.9deg rotation, 19.5px elevation
- Card 3: -13.1deg rotation, 7.0px elevation
- Card 4: -4.4deg rotation, 0.8px elevation (lowest)
- Card 5: +4.4deg rotation, 0.8px elevation (lowest)
- Card 6: +13.1deg rotation, 7.0px elevation
- Card 7: +21.9deg rotation, 19.5px elevation
- Card 8: +30.6deg rotation, 38.3px elevation (highest)

## Scalability Features

### 1. Card Size Adjustment
```css
/* Controlled by --ph-card-scale variable */
data-card-size="small"       /* 0.8x */
data-card-size="medium"      /* 1.0x */
data-card-size="large"       /* 1.2x */
data-card-size="extra-large" /* 1.4x */
```

### 2. Dynamic Card Count
The formula adapts to different card counts:
- For N cards: normalizedPos = (index - (N-1)/2) / (N/2)
- Maintains smooth arc regardless of count

### 3. Responsive Scaling
All dimensions use CSS calc() with variables:
- Width adjusts with card count and scale
- Height maintains proportions
- Arc parameters scale smoothly

## Implementation Benefits

1. **Smooth Arc**: Parabolic curve looks natural
2. **Consistent Rotation**: No sudden jumps
3. **Scalable**: Works with any card size
4. **Maintainable**: Parameters in CSS variables
5. **Performance**: Pure CSS, no JavaScript
6. **Accessible**: Maintains hover/focus states

## Future Enhancements

1. **Dynamic Arc Height**: Adjust based on viewport
2. **Card Count Adaptation**: CSS custom properties for any count
3. **Animation**: Smooth transitions when cards added/removed
4. **Touch Optimization**: Larger touch targets on mobile