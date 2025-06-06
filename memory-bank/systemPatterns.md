# System Patterns

## System Architecture
- React + TypeScript SPA.
- Modular component structure.
- CSS handled via a combination of Tailwind, custom CSS, and CSS variables.
- Responsive design via CSS, utility classes, and custom hooks.

## Key Technical Decisions
- Clamp-first responsive approach - all values scale smoothly
- Minimal media queries - only for structural layout changes
- Single source of truth - all responsive values in tokens.css
- No hardcoded pixels - everything must participate in scaling
- CSS Grid-based layout system replacing absolute positioning
- Unified card layout (PlayerHandFlex) - removing legacy Arc system
- Viewport space reservation for zoom feature (Session 27)
- Z-index hierarchy strictly enforced (Session 27)
- Container overflow strategy: visible everywhere (Session 27)
- **tokens.css as ONLY source** - removed all conflicting z-index systems (Session 29)
- **No stacking context creators** - removed isolation/contain properties (Session 29)
- **CSS architecture consolidation** - deleted obsolete files, single import chain (Session 29)

## Design Patterns in Use
- Container/presenter separation in UI.
- Centralized state management (Redux or similar).
- Component-level encapsulation of styles.
- Use of utility classes for rapid prototyping and consistency.

## Component Relationships
- GameTable, PlayerHand, TrickArea, BiddingInterface, etc., compose the main game UI.
- Layouts and positioning systems manage responsive adaptation.
- Accessibility components wrap the app with context providers.

## Accessibility Patterns
- Context-based settings management with localStorage persistence
- Hook-based keyboard navigation (useKeyboardNavigation)
- ARIA-first approach with semantic HTML
- Progressive enhancement - works without JS for basic functionality
- System preference detection (prefers-reduced-motion, prefers-contrast)
- Focus management with visible indicators using design tokens

## Critical Implementation Paths
- Style application order: Tailwind base → custom CSS → overrides.
- Responsive token system: Define in tokens.css → Use via clamp() → No hardcoded values.
- Layout hierarchy: GameLayout grid → Component positioning → No absolute positioning.
- Scaling enforcement: Every element uses tokens → Audit for violations → ESLint rules.
- Linting configuration: ESLint (.eslintrc) and Stylelint (.stylelintrc) in JSON format.

## Responsive Implementation Patterns (Sessions 27-29)
- **Card Overlap**: Use CSS variables (--card-overlap-compact: 0.5) with negative margins
- **Viewport Bounds**: Reserve space with --zoom-reserve-x/y, apply margins to game-table
- **Z-Index Management**: Use CSS variables exclusively from tokens.css, increment with calc()
- **Mobile Breakpoints**: Structural changes only (hide/show, flex direction)
- **Declaration Positioning**: Clamp-based offsets allowing temporary overlap
- **Bidding Layout**: Flex with named classes (.bid-suits-section, .bid-current-section)

## Game Logic Patterns (Session 28)
- **Early Termination**: Check after each trick if contract is mathematically impossible
- **Auto-play**: Detect single legal move and play automatically after delay
- **AI Contract Analysis**: Evaluate points needed vs available, adjust strategy
- **Failed Contract Scoring**: Ensure contract team gets exactly 0 points
- **Declaration Ties**: Enable both teams to show when values are equal

## Final Architecture (Session 30)
- **Component Structure**: Small, focused components with single responsibility
- **State Management**: Redux Toolkit with typed slices and selectors
- **Styling Strategy**: CSS Modules + Tailwind utilities + CSS variables
- **Performance**: React.memo, useMemo, useCallback throughout
- **Animation**: Pre-defined Framer Motion variants to prevent recreations
- **Documentation**: Comprehensive technical guide maintained alongside code

## This Document
Updated with final architectural patterns from Sessions 27-30. Project architecture is now stable and well-documented.
