# Accessibility Implementation Quick Reference

## File Structure Created

```
src/accessibility/
├── accessibilityTypes.ts      # All TypeScript interfaces and types
├── AccessibilityContext.tsx   # React Context provider
├── AccessibilitySettings.tsx  # Settings modal UI (5 tabs)
└── accessibility.css          # Theme system and CSS (INCOMPLETE)
```

## Key Interfaces

### AccessibilitySettings
```typescript
{
  theme: 'default' | 'high-contrast' | 'dark' | 'colorblind-safe'
  fontSize: 100-200 (percentage)
  cardSize: 100-200 (percentage)
  animations: { enabled, speed, reducedMotion }
  contrast: { enabled, level: 'AA' | 'AAA' }
  colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochrome'
  suitPatterns: boolean
  screenReader: { enabled, verbosity, announceAll }
  audio: { enabled, volume, cues, spatialAudio, voiceSelection }
  keyboard: { enabled, customBindings, skipLinks }
  focus: { visible, thickness, color }
  haptics: { enabled, intensity }
  highlighting: { activeCard, magnification, legalMoves, teamColors, dynamicOutlines }
  indicators: { trumpAlwaysVisible, largeStatusText, multiModalAlerts, cardLabels }
  cognitive: { simplifiedMode, playHints, gameSpeed, practiceMode }
  comfort: { blueLightFilter, backgroundPattern, tableFelt, cardBacks }
}
```

## Usage in Components

### 1. Import and use the hook:
```typescript
import { useAccessibility } from '../accessibility/AccessibilityContext';

const MyComponent = () => {
  const { settings, announceToScreenReader } = useAccessibility();
  
  // Use settings
  if (settings.animations.enabled) {
    // animate
  }
  
  // Announce to screen reader
  announceToScreenReader('Your turn to play', 'polite');
};
```

### 2. Add ARIA labels:
```typescript
<div
  role="button"
  aria-label={`${rank} of ${suit}, ${points} points${isTrump ? ', trump suit' : ''}`}
  tabIndex={0}
>
```

### 3. Apply conditional classes:
```typescript
className={`
  card 
  ${settings.highlighting.legalMoves && isLegalMove ? 'legal-move' : ''}
  ${settings.suitPatterns ? `suit-pattern-${suit}` : ''}
  ${settings.highlighting.teamColors ? `team-band-${team}` : ''}
`}
```

### 4. Handle keyboard navigation:
```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch(e.key) {
    case 'ArrowLeft':
      selectPreviousCard();
      break;
    case 'ArrowRight':
      selectNextCard();
      break;
    case 'Enter':
      playSelectedCard();
      break;
  }
};
```

## CSS Classes Available

- `.reduced-motion` - Applied when animations should be minimal
- `.high-contrast` - Applied for high contrast theme
- `.sr-only` - Screen reader only content
- `.skip-link` - Skip navigation links
- `.legal-move` - Highlight legal moves
- `.team-band-1`, `.team-band-2` - Team color indicators
- `.suit-pattern-*` - Patterns for colorblind mode

## Implementation Checklist for Each Component

- [ ] Import useAccessibility hook
- [ ] Add ARIA labels and roles
- [ ] Implement keyboard navigation
- [ ] Add focus indicators
- [ ] Respect animation preferences
- [ ] Scale with fontSize/cardSize settings
- [ ] Announce changes to screen reader
- [ ] Apply theme-aware colors
- [ ] Add skip links if needed
- [ ] Test with screen reader

## Common Patterns

### Announcing Game Events
```typescript
useEffect(() => {
  if (isMyTurn && settings.audio.cues.turnPrompt) {
    announceToScreenReader('Your turn to play', 'assertive');
    playSound('turnPrompt');
  }
}, [isMyTurn]);
```

### Conditional Rendering for Simplified Mode
```typescript
{!settings.cognitive.simplifiedMode && (
  <ComplexUIElement />
)}
```

### Respecting Animation Speed
```typescript
style={{
  transitionDuration: `${300 / settings.animations.speed}ms`
}}
```

### Card Magnification
```typescript
style={{
  transform: isHovered 
    ? `scale(${settings.highlighting.magnification})` 
    : 'scale(1)'
}}
```

## Testing Commands

```bash
# Test with screen reader (Windows)
# 1. Enable NVDA
# 2. Navigate with Tab key
# 3. Use arrow keys in card areas
# 4. Listen for announcements

# Test high contrast
# 1. Open settings with comma key
# 2. Enable high contrast
# 3. Verify 7:1 contrast ratios

# Test keyboard only
# 1. Unplug mouse
# 2. Play entire game with keyboard
# 3. Verify all actions possible
```

## Next Component to Update

Start with `Card.tsx` as it needs the most accessibility features:
1. ARIA labels
2. Suit patterns
3. Card labels
4. Keyboard support
5. Magnification
6. Legal move indicators
