# Styling Guide - Pilotta Game

## Overview

This guide establishes clear boundaries between the three styling systems used in the Pilotta game:
1. **Tailwind CSS** - Utility-first framework
2. **Custom CSS** - Component-specific and complex styles  
3. **Inline Styles** - Dynamic values and runtime calculations

## Styling System Boundaries

### 1. Tailwind CSS - Use For:

✅ **Basic Utilities**
- Spacing: `p-4`, `m-2`, `space-x-4`
- Typography: `text-lg`, `font-bold`, `text-center`
- Simple layouts: `flex`, `grid`, `absolute`, `relative`
- Basic colors: `bg-slate-800`, `text-white`
- Borders and shadows: `rounded-lg`, `shadow-xl`
- Simple transitions: `transition-colors`, `duration-300`

✅ **Responsive Utilities**
- Breakpoint prefixes: `sm:`, `md:`, `lg:`
- Simple responsive behavior

❌ **Don't Use For:**
- Dynamic color generation
- Complex animations
- Game-specific positioning
- Runtime-calculated values

### 2. Custom CSS - Use For:

✅ **Complex Layouts**
- Card fan arrangements
- Center-based positioning system
- Game table layout
- Player zones

✅ **Animations & Transitions**
- Card dealing animations
- Trick collection animations
- Complex hover states
- Framer Motion variant definitions

✅ **Component-Specific Styles**
- PlayerHand arc calculations
- TrickArea positioning
- AnnouncementSystem effects
- BiddingInterface modal

✅ **CSS Variables**
- All design tokens
- Responsive calculations
- Theme values

❌ **Don't Use For:**
- Simple utilities that Tailwind provides
- Inline-only calculations

### 3. Inline Styles - Use For:

✅ **Dynamic Values**
- Runtime calculations: `width: ${cardWidth}px`
- Dynamic colors: `color: getSuitColor(suit)`
- Animation delays: `animationDelay: ${index * 0.1}s`
- Conditional styling based on game state

✅ **Performance Optimizations**
- Transform calculations
- Position offsets
- Size adjustments

❌ **Don't Use For:**
- Static styles
- Values that could be CSS variables
- Styles that should be reusable

## File Organization

```
src/
├── styles/
│   ├── app.css          # Layer imports
│   ├── tokens.css       # CSS variables
│   ├── containment.css  # Layout utilities
│   ├── responsive-fixes.css
│   └── overrides.css    # Last-resort !important
├── components/
│   ├── Component.tsx    # Component logic
│   └── Component.css    # Component styles
└── layouts/
    ├── game-grid.css    # Layout styles
    ├── table-center.css # Positioning
    └── responsive.css   # Responsive system
```

## CSS Architecture (@layer)

Our CSS uses the modern `@layer` system for predictable cascade:

```css
@layer reset, base, tokens, tailwind, layout, components, states, utilities, overrides;
```

- **reset**: Browser normalization
- **base**: Element defaults
- **tokens**: CSS variables
- **tailwind**: Utility classes
- **layout**: Structural styles
- **components**: Component-specific
- **states**: Interactive states
- **utilities**: Helper classes
- **overrides**: !important rules (minimize)

## Best Practices

### 1. CSS Variables

Always define in `tokens.css`:
```css
:root {
  --card-base-width: 120px;
  --z-modal: 100;
}
```

### 2. Responsive Design

Use the centralized system:
```typescript
// Use hooks
const { isMobile, breakpoint } = useResponsive();

// Use CSS variables
var(--text-responsive);
```

### 3. Z-index Management

Always use CSS variables:
```css
/* Good */
z-index: var(--z-modal);

/* Bad */
z-index: 100;
```

### 4. Color System

For dynamic colors, use inline styles:
```typescript
// Good - inline style
<div style={{ color: getSuitColorValue(suit) }}>

// Bad - dynamic class
<div className={`text-${color}-500`}>
```

### 5. Component Isolation

- Use specific selectors
- Avoid global selectors
- Prefix component classes

```css
/* Good */
.ph-wrapper[data-position="south"] .ph-card-slot { }

/* Bad */
.card-slot { }
```

## Migration Path

When refactoring existing code:

1. **Identify the style type**
   - Is it static? → Tailwind or Custom CSS
   - Is it dynamic? → Inline styles
   - Is it complex? → Custom CSS

2. **Check for conflicts**
   - Search for duplicate definitions
   - Verify z-index values
   - Test responsive behavior

3. **Update systematically**
   - One component at a time
   - Test after each change
   - Update documentation

## Common Patterns

### Card Styling
```tsx
// Static classes (Tailwind)
className="rounded-lg shadow-md"

// Dynamic colors (inline)
style={{ color: getSuitColorValue(suit) }}

// Complex positioning (Custom CSS)
className="ph-card-slot"
```

### Responsive Containers
```tsx
// Tailwind responsive
className="p-4 md:p-6 lg:p-8"

// Custom responsive
className="game-grid-responsive"

// Dynamic responsive
style={{ fontSize: `${baseSize * scale}px` }}
```

### Animations
```css
/* Custom CSS for complex animations */
@keyframes cardDeal {
  from { transform: translateY(-200px) rotate(180deg); }
  to { transform: translateY(0) rotate(0); }
}

/* Framer Motion for interactive animations */
whileHover={{ scale: 1.1 }}
```

## Debugging Tips

1. **Check cascade order**: Use browser DevTools
2. **Verify CSS variables**: Look in :root
3. **Test responsive**: Use device emulation
4. **Check z-index stack**: Use 3D view in DevTools
5. **Profile performance**: Monitor repaints

## Future Improvements

- Consider CSS Modules for better isolation
- Implement CSS-in-JS for dynamic styles
- Create visual regression tests
- Build design token generator
- Add CSS linting rules

By following these guidelines, we maintain a clean, performant, and maintainable styling system.