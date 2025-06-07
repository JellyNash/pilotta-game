# Responsive System Documentation

## Overview

The Pilotta game uses a modern, single-source-of-truth responsive system based on CSS custom properties (variables) and the clamp() function. This ensures smooth scaling across all devices from 320px mobile phones to 4K displays.

## Core Principles

1. **Single Source of Truth**: All dimensions are controlled through tokens.css
2. **No Compound Calculations**: Variables are calculated once, not chained
3. **Clamp-First Approach**: Use clamp() for fluid scaling, minimal media queries
4. **User Control**: Key UI elements can be scaled via Settings

## User-Controlled Variables

These variables can be adjusted in the Settings panel and persist in localStorage:

### Card System Variables
- `--south-card-scale`: Controls human player card size (0.6-1.2)
- `--south-card-spacing`: Controls card overlap for human player (0.3-0.7)
- `--other-card-scale`: Controls AI player card size (0.5-1.0)
- `--other-card-spacing`: Controls card overlap for AI players (0.3-0.7)

### UI Variables
- `--ui-text-scale`: Global text scaling factor (0.8-1.3)
- `--modal-width-scale`: Modal width relative to viewport (0.8-1.0)
- `--table-density`: Table row spacing and padding (0.7-1.0)

## Computed Variables

These are automatically calculated from user settings:

```css
/* Card dimensions */
--south-card-width: calc(var(--card-width) * var(--south-card-scale));
--south-card-height: calc(var(--card-height) * var(--south-card-scale));
--other-card-width: calc(var(--card-width) * var(--other-card-scale));
--other-card-height: calc(var(--card-height) * var(--other-card-scale));

/* UI scaling */
--modal-max-width: calc(min(90vw, 850px) * var(--modal-width-scale));
--text-scale-factor: var(--ui-text-scale);
```

## Typography System

All text sizes use clamp() for smooth scaling:

```css
--fs-3xs: clamp(0.5rem, 1.5vw, 0.625rem);    /* 8px -> 10px */
--fs-2xs: clamp(0.625rem, 1.75vw, 0.75rem);  /* 10px -> 12px */
--fs-xs: clamp(0.75rem, 2vw, 0.875rem);      /* 12px -> 14px */
--fs-sm: clamp(0.875rem, 2.25vw, 1rem);      /* 14px -> 16px */
--fs-base: clamp(1rem, 2.5vw, 1.125rem);     /* 16px -> 18px */
--fs-lg: clamp(1.125rem, 3vw, 1.25rem);      /* 18px -> 20px */
--fs-xl: clamp(1.25rem, 3.5vw, 1.5rem);      /* 20px -> 24px */
--fs-2xl: clamp(1.5rem, 4vw, 2rem);          /* 24px -> 32px */
--fs-3xl: clamp(2rem, 5vw, 3rem);            /* 32px -> 48px */
```

Text is further scaled by `--text-scale-factor` for user control:
```css
font-size: calc(var(--fs-lg) * var(--text-scale-factor));
```

## Spacing System

Consistent spacing rhythm using clamp():

```css
--space-3xs: clamp(0.125rem, 0.5vw, 0.25rem);   /* 2px -> 4px */
--space-2xs: clamp(0.25rem, 0.75vw, 0.375rem);  /* 4px -> 6px */
--space-xs: clamp(0.375rem, 1vw, 0.5rem);       /* 6px -> 8px */
--space-sm: clamp(0.5rem, 1.5vw, 0.75rem);      /* 8px -> 12px */
--space-md: clamp(0.75rem, 2vw, 1rem);          /* 12px -> 16px */
--space-lg: clamp(1rem, 2.5vw, 1.5rem);         /* 16px -> 24px */
--space-xl: clamp(1.5rem, 3vw, 2rem);           /* 24px -> 32px */
--space-2xl: clamp(2rem, 4vw, 3rem);            /* 32px -> 48px */
--space-3xl: clamp(3rem, 5vw, 4rem);            /* 48px -> 64px */
--space-4xl: clamp(4rem, 6vw, 6rem);            /* 64px -> 96px */
```

## Component-Specific Scaling

### Cards
- Base dimensions use clamp() for viewport-based scaling
- User settings multiply these base values
- Overlap controlled by spacing variables

### Modals
- Max width/height constrained by viewport
- User can adjust width scale for preference
- Content scrolls when necessary

### Tables
- Font size scales with both viewport and user settings
- Density control affects padding and row height
- Responsive design converts to cards on mobile

## Early Initialization

CSS variables are initialized before React hydration to prevent flash of unstyled content:

```javascript
// In index.html
import { initializeCSS } from './src/styles/init-variables.ts';
initializeCSS();
```

## Migration from Old System

The system automatically migrates old localStorage keys:
- `cardScale` → `southCardScale`
- `southCardSize` → `southCardScale`
- `aiCardSize` → `otherCardScale`
- `aiCardSpacing` → `otherCardSpacing`

## Best Practices

1. **Always use tokens**: Never hardcode pixel values
2. **Prefer clamp()**: For any dimension that should scale
3. **Single calculation**: Compute values once, not in chains
4. **Test at extremes**: Check 320px and 4K displays
5. **Container queries**: Use for component-level responsiveness

## CSS Module Pattern

New components should use CSS modules:

```css
/* Component.module.css */
.container {
  max-width: var(--modal-max-width);
  padding: var(--space-lg);
  font-size: calc(var(--fs-base) * var(--text-scale-factor));
}
```

## Safe Area Support

For notched devices (iPhone, etc.):

```css
padding-top: max(var(--space-md), env(safe-area-inset-top));
```

## Performance Considerations

1. **Limit clamp() in animations**: Pre-calculate when possible
2. **Use content-visibility**: For long scrollable lists
3. **CSS containment**: Apply to isolated components
4. **Will-change**: Only for active animations

## Testing Checklist

- [ ] 320×568 (iPhone SE)
- [ ] 375×667 (iPhone 8)
- [ ] 768×1024 (iPad)
- [ ] 1366×768 (Laptop)
- [ ] 1920×1080 (Desktop)
- [ ] 2560×1440 (2K)
- [ ] 3840×2160 (4K)

## Debugging

Use browser DevTools to:
1. Check computed CSS variable values
2. Test different viewport sizes
3. Verify clamp() calculations
4. Inspect container query breakpoints

## Future Enhancements

- Additional user controls for animation speed
- Per-component density settings
- Theme-based scaling presets
- Accessibility zoom support up to 500%