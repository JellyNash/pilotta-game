# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

**Development:**
```bash
npm run dev        # Start development server on http://localhost:3000
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint checks
npm run test       # Run Jest tests (no tests currently implemented)
npm run test:visual # Run visual regression tests with Puppeteer
```

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 + TypeScript
- **State Management**: Redux Toolkit
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + CSS modules
- **Animations**: Framer Motion
- **Drag & Drop**: react-dnd (HTML5 + Touch backends)

### Core Architecture

The application follows a layered architecture with clear separation of concerns:

1. **Game Engine Layer** (`/src/core/`)
   - `types.ts`: Central type definitions for the entire game
   - `gameRules.ts`: Core game logic and rule validation
   - `cardUtils.ts`: Card manipulation and comparison utilities

2. **State Management** (`/src/store/`)
   - Single Redux store with typed slices
   - `gameSlice.ts`: Manages all game state including players, cards, scores, and game phases
   - Actions handle all state transitions (dealing, bidding, playing cards, scoring)

3. **Game Flow Control** (`/src/game/`)
   - `GameManager.ts`: Singleton that orchestrates the game flow
   - `GameFlowController.ts`: Manages phase transitions and game progression
   - Handles async operations like AI thinking time and animations

4. **AI System** (`/src/ai/`)
   - Multiple AI personalities (Conservative, Aggressive, Balanced, Adaptive)
   - MCTS (Monte Carlo Tree Search) implementation for advanced decision making
   - Strategy evaluation based on game state and player behavior

5. **Component Layer** (`/src/components/`)
   - Modular React components for all UI elements
   - Key components: GameTable, PlayerHand, BiddingInterface, TrickArea
   - Focus on responsive design and performance

6. **Layout System** (`/src/layouts/`)
   - Responsive design system with CSS Grid and custom properties
   - Center-based positioning for consistent layout at all resolutions
   - Responsive variables for scaling across different screen sizes

### Game Flow

The game follows a strict phase progression:
1. **Dealing**: Cards distributed to players counter-clockwise
2. **Bidding**: Players bid for contract (with pass/double/redouble options)
3. **Declaring**: Optional declarations (sequences, four of a kind)
4. **Playing**: Trick-taking gameplay
5. **Scoring**: Points calculation and round transition

### Key Patterns

- **Event-Driven**: User actions dispatch Redux actions that update state
- **AI Integration**: AI players make decisions asynchronously without blocking UI
- **Responsive Design**: Mobile-first approach with touch support
- **Performance First**: Memoized components, optimized animations, extracted animation variants

### Important Considerations

- The game implements full Pilotta rules including complex scoring and declarations
- AI personalities affect bidding aggressiveness and playing style
- All card interactions support both drag-and-drop and click-to-play
- Animations use Framer Motion with pre-defined variants to prevent recreations
- Sound effects are managed through `soundManager.ts` with proper cleanup

## Current State of the Project

### UI Features
1. **Card System**:
   - Human player cards in downward arc with hover animations
   - Multiple card styles: classic, modern, accessible, minimalist
   - Right-click zoom feature (200% scale)
   - Responsive sizing based on viewport

2. **Bidding Interface**:
   - Three-row layout with consistent button sizing
   - Touch-friendly targets with proper spacing
   - Responsive scaling with CSS variables
   - Modern glass morphism design with 2025 style

3. **Game Features**:
   - Counter-clockwise game progression (traditional Pilotta)
   - Random initial dealer selection
   - Fixed team trick pile positions
   - Previous trick viewer with visual indicators
   - Automatic Belote/Rebelote announcements

### Performance Optimizations
1. **Component Memoization**: Card, PlayerHand, TrickArea, BiddingInterface, ScoreBoard
2. **Animation Variants**: Extracted to `/src/animations/animationVariants.ts`
3. **Audio Memory Management**: Proper cleanup of audio elements
4. **React Hooks**: useMemo and useCallback for expensive operations

### Responsive Layout System
- CSS Grid-based layout with defined areas
- Center-based positioning system in `/src/layouts/table-center.css`
- Responsive variables in `/src/layouts/responsive-variables.css`
- Scales from 1280x720 to 2560x1440+

### Technical Debt
- **CSS !important Usage**: PlayerHand.css uses many !important declarations that need refactoring
- **Web Worker**: AI worker implementation exists but needs Vite configuration fixes
- **Redux Structure**: New modular slices created but not yet integrated

### Important Files
- Animation Variants: `/src/animations/animationVariants.ts`
- Responsive CSS: `/src/layouts/responsive-variables.css`, `/src/layouts/game-grid.css`
- Layout Components: `/src/components/PlayerZone.tsx`, `/src/layouts/PositioningSystem.tsx`
- Performance Testing: `test-visual-regression.cjs`

### Accessibility Status
- All accessibility features have been removed for performance
- No keyboard navigation or screen reader support
- Focus is purely on visual gameplay

### Game Rules Compliance
- ✅ Trump obligation working correctly
- ✅ Belote announcement automatic and compulsory
- ✅ Card rankings correct (Trump: J-9-A-10-K-Q-8-7)
- ✅ Counter-clockwise progression
- ✅ Team-based scoring and trick piles

## Latest Session Updates (2025-01-06)

### Session 18 - Enhanced Animations & Declaration Display System
1. **Announcement System Professional Animations**:
   - **Entry/Exit Effects**: Scale from 0 with 10px blur, directional exit with rotation
   - **Enhanced Spring Physics**: stiffness: 500, damping: 25, mass: 0.5
   - **Multi-layer Visual Effects**:
     - 3D transforms with perspective and depth layers
     - 8 particle effects with complex orbital paths for high-value announcements
     - Multiple shimmer waves with staggered delays
     - Pulsing radial glow effects
     - Rotating trump suit symbols (360° over 20s)
   - **Glass Morphism 2.0**: 20px blur with 200% saturation and brightness adjustment
   - **Hover Effects**: 3D depth with translateZ and scale transforms

2. **Declaration Cards Display Improvements**:
   - **Smart Timing System**:
     - 3-second auto-hide for AI players
     - Persistent display for human player throughout the round
     - Clean state management with useEffect hooks
   - **3D Card Animations**:
     - rotateY flip entrance (-180° to 0°)
     - Staggered appearance with spring physics
     - Fan arrangement with 5° increments
     - Blur transitions (10px to 0px)
   - **Minimal Design**:
     - Subtle pulsing golden glow
     - Clean points indicator with backdrop blur
     - Thin amber borders (0.4 opacity)
     - Bottom-positioned points badge

3. **CSS Enhancements**:
   - Multi-layer shadows for depth perception
   - Inner glow gradients with ::after pseudo-elements
   - Transform-style: preserve-3d for true 3D effects
   - Will-change optimization for transform, opacity, and filter

4. **Files Modified**:
   - `AnnouncementSystem.tsx`: Complete animation overhaul
   - `AnnouncementSystem.css`: Enhanced 3D effects and depth
   - `DeclarationCardsDisplay.tsx`: Added timing logic and 3D animations
   - `GameTable.tsx`: Added isHumanPlayer prop for declarations

### Session 17 - Announcement System Fixed & Declaration UI Enhanced (RESOLVED)
1. **Fixed Announcement Positioning System**:
   - **Root Cause**: Center-based positioning with fixed elements doesn't work properly
   - **Solution**: Switched to viewport-based positioning (vw/vh units)
   - **New Positions**:
     - North: 50% left, 15vh top
     - South: 50% left, 75vh top (65vh when bidding active)
     - East: 80vw left, 50% top
     - West: 20vw left, 50% top
   - **Animations**: Smooth directional enter/exit with spring physics

2. **Professional Animation System**:
   - Custom easing curve: `[0.23, 1, 0.32, 1]`
   - Directional animations based on player position
   - Glass morphism effects with backdrop blur
   - Hardware-accelerated with `will-change` and `backface-visibility`
   - Sparkle and shimmer effects for high-value announcements

3. **Fixed Duplicate Issues**:
   - Added `shownNotificationTimestamps` Set to track Belote/Rebelote
   - Added `shownDeclarationIds` Set to track declaration announcements
   - Proper cleanup and lifecycle management
   - No more duplicate announcements

4. **Declaration UI Enhancements**:
   - **Simplified Announcements**: Shows only the number (no "points" text)
   - **Larger Font**: 1.5x size for declaration numbers
   - **Declaration Cards Display**: New component shows actual cards
     - Cards appear in front of player's hand in trick 2
     - Perspective-aware rotation for each position
     - Golden glow effect on declaration cards
     - Points badge with counter-rotation for readability
     - Smooth staggered animations

5. **Files Modified**:
   - `AnnouncementSystem.tsx`: Fixed positioning logic
   - `AnnouncementSystem.css`: Enhanced with professional styles
   - `GameTable.tsx`: Added duplicate prevention and declaration display
   - `DeclarationCardsDisplay.tsx`: New component for showing cards

### Session 16 - Announcement System Issues (Initial Attempt)
1. **Announcement System Redesign Attempted**:
   - Created new AnnouncementSystem component to replace UnifiedAnnouncement
   - Intended to fix: Small size, easy to miss, bidding interface overlap
   - Implemented features:
     - Larger, more visible announcements with animations
     - Sparkle effects for important announcements
     - Responsive sizing with CSS variables
     - Should replace announcements per position (not stack)

2. **Critical Issues Found**:
   - **Centering Problem**: Announcements appear on top of each other at center
   - **Position Bug**: All announcements render at same location regardless of player position
   - **Duplicate Announcements**: Despite processedIds tracking, duplicates still appear
   - **Declaration Flow**: Should show points only in first trick, cards in second trick

3. **Technical Details**:
   - Attempted center-based positioning like cards (40% radius from center)
   - Used transform translations but positions not working correctly
   - Need to debug why all announcements collapse to center
   - Files: AnnouncementSystem.tsx, AnnouncementSystem.css, GameTable.tsx

### Session 15 - Trick Pile System Complete Overhaul
1. **Changed to 2-pile system**:
   - Previously: Each player could have their own trick pile (up to 4 piles)
   - Now: Only 2 piles total, one per team
   - Team B pile: Upper left corner (top-4 left-4)
   - Team A pile: Lower right corner (bottom-4 right-4) - Human player's team
   - Removed trick piles from individual player zones
   - Piles now rendered as overlays in GameTable component

2. **TrickPileViewer Complete Redesign**:
   - **Initial fix**: Resolved card overlap issue using CSS Grid layout
   - **Cross formation**: Human at bottom, partner at top, opponents on sides
   - **Final minimal design**:
     - Removed colored header bar - subtle team indicator instead
     - Removed player names and all badges ("Lead", "You")
     - Removed bottom legend section
     - Removed rotating animations
     - Small "W" circle for winner (no crown emoji)
     - Modern dark play order circles (1-4) with contrast
     - Subtle 4px backdrop blur
     - Medium-sized cards for visibility
     - Kept subtle golden glow on winner
   - **Result**: Clean, unobtrusive design that doesn't distract from gameplay

## Session 14 Updates

### CSS !important Refactoring
1. **Root Cause Analysis**:
   - Identified inline `position: relative` in Card.tsx overriding CSS
   - Found container query conflicts from responsive.css
   - CSS specificity wars between multiple files

2. **Real Solution Implemented**:
   - Removed inline style conflict from Card.tsx
   - Created `PlayerHand-clean.css` with unique `ph-` prefix
   - Achieved 0 !important declarations in card layout CSS
   - Used proper CSS cascade and specificity

3. **Clean CSS Architecture**:
   - Reset container queries explicitly
   - Created proper stacking context
   - Prevented child positioning issues
   - Maintained all animations and features

### Human Player Card Fan Improvements
1. **Mathematical Arc System**:
   - Implemented parabolic curve for natural downward arc (frown shape)
   - Formula: `Y = arcHeight * normalizedPos² * dampening`
   - Smooth rotation progression from -25° to +25°
   - Fixed cards 1, 7, 8 positioning issues

2. **Card Size Enhancement**:
   - Increased base card size by 30% (156px × 218px)
   - Adjusted fan spread to 0.65 for proper spacing
   - Reduced arc height to 30px for gentler curve
   - Applied dampening factor to limit edge card elevation

3. **Scalability Features**:
   - Dynamic sizing with CSS variables
   - Settings integration (small: 0.6x, medium: 0.77x, large: 1x, xlarge: 1.15x)
   - All calculations use relative units
   - Future-ready for different card counts

### Bug Fixes
- Fixed `actualWidth is not defined` error in Card.tsx
- Added missing width calculation for zoomed card display