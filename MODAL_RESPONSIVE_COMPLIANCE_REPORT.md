# Modal & Overlay Responsive Compliance Report

## Executive Summary

After auditing all modal and overlay components in the Pilotta game, I found a mix of compliant and non-compliant implementations. While the newer CSS modules follow best practices, several components still use hardcoded values and missing responsive features.

## Compliance Status by Component

### ✅ COMPLIANT Components

#### 1. **BiddingInterface.module.css** (NEW)
- **Status**: Fully Compliant
- **Good Practices**:
  - Uses `var(--modal-max-width)` and `var(--modal-max-height)`
  - Proper clamp() for all dimensions
  - Container queries for responsive table
  - Text scaling with `var(--text-scale-factor)`
  - Safe area insets consideration

#### 2. **DetailedScoreboard.module.css** (NEW)
- **Status**: Fully Compliant
- **Good Practices**:
  - Width: `calc(min(90vw, 1200px) * var(--modal-width-scale))`
  - Height: `calc(var(--modal-max-height) - var(--space-4xl))`
  - Container queries for mobile transformation
  - Progressive enhancement approach
  - Proper scrollbar styling

#### 3. **RoundTransitionScreen.css**
- **Status**: Mostly Compliant
- **Good Practices**:
  - Max-width uses clamp: `clamp(300px, 90vw, 600px)`
  - All spacing uses tokens
  - Font sizes use tokens
- **Minor Issue**:
  - Uses `90vh` instead of `90dvh` with fallback

### ⚠️ PARTIALLY COMPLIANT Components

#### 4. **BiddingInterface.css** (LEGACY)
- **Status**: Partially Compliant
- **Good Practices**:
  - Uses tokens for most dimensions
  - Has clamp() for responsive properties
- **Issues**:
  - Mixed with inline styles in TSX
  - Some fixed pixel values in media queries
  - No dvh fallback

#### 5. **TrickPileViewer.css**
- **Status**: Partially Compliant
- **Good Practices**:
  - Width uses clamp: `clamp(320px, 90vw, 800px)`
  - Height uses clamp: `clamp(70vh, 85vh, 90vh)`
  - All spacing uses tokens
- **Issues**:
  - Uses `vh` without `dvh` fallback
  - Fixed `1rem` padding in overlay (should use token)

### ❌ NON-COMPLIANT Components

#### 6. **Settings.tsx**
- **Status**: Non-Compliant
- **Critical Issues**:
  - Hardcoded dimensions: `max-w-md` (Tailwind)
  - Fixed positioning: `right-0 top-0 h-full w-full`
  - No responsive modal width
  - No safe area insets
  - Uses Tailwind utilities instead of tokens
  - No dvh units or fallbacks

#### 7. **StartScreen.tsx**
- **Status**: Non-Compliant
- **Critical Issues**:
  - Hardcoded: `max-w-md w-full mx-4`
  - Uses `min-h-screen` without dvh
  - All styling via Tailwind utilities
  - No token system usage
  - No proper modal constraints

#### 8. **GameOverScreen.tsx**
- **Status**: Non-Compliant
- **Critical Issues**:
  - Identical issues to StartScreen
  - Hardcoded: `max-w-md w-full mx-4`
  - Uses `min-h-screen` without dvh
  - No responsive scaling

## Specific Non-Compliance Issues

### 1. **vh Units Without dvh Fallback**
```css
/* ❌ BAD - Found in multiple files */
max-height: 90vh;
height: 100vh;

/* ✅ GOOD - Should be */
max-height: min(90dvh, 90vh);
height: min(100dvh, 100vh);
```

### 2. **Fixed Pixel Values**
```css
/* ❌ BAD - Settings modal */
.fixed right-0 top-0 h-full w-full max-w-md

/* ✅ GOOD - Should be */
width: var(--modal-width);
max-width: var(--modal-max-width);
```

### 3. **Missing Safe Area Insets**
```css
/* ❌ BAD - No safe area consideration */
padding: 1rem;

/* ✅ GOOD - Should be */
padding: max(var(--space-md), env(safe-area-inset-top));
```

### 4. **Hardcoded Z-Index**
```css
/* ❌ BAD - StartScreen, GameOverScreen */
/* No z-index specified, relying on DOM order */

/* ✅ GOOD - Should be */
z-index: var(--z-modal);
```

### 5. **Tailwind Utilities Instead of Tokens**
```tsx
/* ❌ BAD - Settings, StartScreen, GameOverScreen */
className="max-w-md p-8 rounded-2xl"

/* ✅ GOOD - Should use CSS with tokens */
.modal {
  max-width: var(--modal-max-width);
  padding: var(--modal-padding);
  border-radius: var(--radius-lg);
}
```

## Recommendations

### Immediate Actions Required:

1. **Convert Settings Modal**:
   - Remove all Tailwind utility classes
   - Create `Settings.module.css` with proper tokens
   - Add responsive width/height constraints
   - Implement safe area insets

2. **Convert StartScreen & GameOverScreen**:
   - Create CSS modules for both
   - Use modal tokens consistently
   - Add proper z-index layering
   - Implement dvh units with fallbacks

3. **Update TrickPileViewer**:
   - Change `vh` to `min(dvh, vh)`
   - Replace fixed padding with tokens

4. **Fix RoundTransitionScreen**:
   - Update `90vh` to `min(90dvh, 90vh)`

### Token System Updates Needed:

```css
/* Add to tokens.css */
--modal-slide-width: clamp(320px, 90vw, 400px); /* For Settings */
--modal-content-width: clamp(280px, 85vw, 500px); /* For Start/GameOver */
--modal-padding-mobile: max(var(--space-md), env(safe-area-inset-left));
```

## Migration Priority

1. **High Priority**: Settings, StartScreen, GameOverScreen (completely non-compliant)
2. **Medium Priority**: BiddingInterface.tsx (remove inline styles)
3. **Low Priority**: TrickPileViewer, RoundTransitionScreen (minor fixes)

## Conclusion

While newer components follow the responsive guidelines well, the older modal components need significant updates. The main issues are:
- Reliance on Tailwind utilities instead of the token system
- Missing dvh units and safe area insets
- Hardcoded dimensions that don't scale properly
- Inconsistent z-index usage

All modals should follow the pattern established in the new CSS modules (BiddingInterface.module.css and DetailedScoreboard.module.css) for consistency and proper responsive behavior.