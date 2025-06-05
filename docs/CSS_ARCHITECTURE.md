# CSS Architecture

## Overview

This project uses a modern, layered CSS architecture designed for maintainability, performance, and predictability.

## Layer Hierarchy

CSS is organized using the `@layer` directive to ensure proper cascade order:

```css
@layer reset, base, tokens, tailwind, layout, components, states, utilities, overrides;
```

### Layer Descriptions

1. **reset** - Browser normalization and resets
2. **base** - Element defaults (body, links, etc.)
3. **tokens** - Design tokens and CSS custom properties
4. **tailwind** - Tailwind CSS utilities
5. **layout** - Structural styles (grids, containers)
6. **components** - Component-specific styles
7. **states** - Interactive states (hover, focus, active)
8. **utilities** - Helper classes and performance optimizations
9. **overrides** - Last resort `!important` rules (should be minimal)

## File Structure

```
src/
├── styles/
│   ├── app.css          # Main entry point with @layer definitions
│   ├── tokens.css       # All CSS custom properties
│   ├── containment.css  # CSS containment rules for performance
│   └── overrides.css    # Minimal !important overrides
├── layouts/
│   ├── game-grid.css    # Grid layout system
│   ├── table-center.css # Center-based positioning
│   └── responsive.css   # Responsive utilities
└── components/
    ├── [component].css  # Component-specific styles
    └── ...
```

## Design Tokens

All CSS custom properties are centralized in `tokens.css`:

- **Spacing**: `--space-xs` through `--space-2xl`
- **Typography**: `--text-xs` through `--text-3xl`
- **Card Dimensions**: Various card-related measurements
- **Z-index System**: Managed z-index values
- **Animation**: Timing and easing values

## Naming Conventions

### CSS Classes
- **Components**: `.component-name` (kebab-case)
- **Modifiers**: `.component-name--modifier`
- **States**: `.component-name.is-active`
- **Utilities**: `.u-utility-name`

### CSS Variables
- **Global**: `--variable-name`
- **Component-scoped**: `--component-variable-name`
- **Prefixed**: `--ph-` for PlayerHand, `--announcement-` for announcements

## Performance Optimizations

### CSS Containment
Applied strategically to improve rendering performance:
- `contain: layout` - For components with internal layout changes
- `contain: style` - For components with style isolation
- `contain: strict` - For modal overlays
- `content-visibility: auto` - For off-screen elements

### Bundle Size
- Original CSS: 103KB
- Optimized CSS: 84KB (18.4% reduction)
- Zero unused selectors (verified with PurgeCSS)
- Zero !important declarations outside overrides layer

## Responsive Design

### Breakpoints
- Mobile Small: 480px
- Mobile Large: 768px
- Tablet: 1024px
- Desktop: 1280px
- Desktop XL: 2560px

### Approach
- Mobile-first using `min-width` media queries
- Fluid typography with `clamp()`
- Container queries for component-level responsiveness

## Linting and Testing

### CSS Linting
```bash
npm run lint:css
```

Rules:
- No duplicate selectors
- No !important outside overrides layer
- Consistent naming patterns

### Visual Regression Testing
```bash
npm run test:visual
```

Captures screenshots at all breakpoints and measures CLS.

## Migration Guide

When adding new styles:

1. **Determine the appropriate layer** - Most styles go in `components`
2. **Use existing tokens** - Check `tokens.css` before creating new variables
3. **Avoid !important** - Use proper specificity and cascade layers instead
4. **Test responsiveness** - Ensure styles work at all breakpoints
5. **Run linting** - Verify no errors before committing

## Best Practices

1. **Never use inline styles** - All styles should be in CSS files
2. **Prefer CSS variables** - For any value used more than once
3. **Use semantic class names** - Describe purpose, not appearance
4. **Leverage cascade layers** - Instead of specificity wars
5. **Document complex styles** - Add comments for non-obvious implementations