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
   - Recent focus on accessibility and responsive design

6. **Accessibility System** (`/src/accessibility/`)
   - Comprehensive accessibility context and settings
   - Keyboard navigation manager
   - Screen reader support with ARIA labels
   - Customizable UI for different visual needs

### Game Flow

The game follows a strict phase progression:
1. **Dealing**: Cards distributed to players
2. **Bidding**: Players bid for contract (with pass/double/redouble options)
3. **Declaring**: Optional declarations (sequences, four of a kind)
4. **Playing**: Trick-taking gameplay
5. **Scoring**: Points calculation and round transition

### Key Patterns

- **Event-Driven**: User actions dispatch Redux actions that update state
- **AI Integration**: AI players make decisions asynchronously without blocking UI
- **Responsive Design**: Mobile-first approach with touch support
- **Accessibility First**: All new features must maintain keyboard and screen reader support

### Important Considerations

- The game implements full Pilotta rules including complex scoring and declarations
- AI personalities affect bidding aggressiveness and playing style
- All card interactions support both drag-and-drop and click-to-play
- Animations use Framer Motion and should respect user preferences
- Sound effects are managed through `soundManager.ts` with accessibility options

## Recent Session Updates

### Card UI Improvements
1. **Human Player Card Layout**:
   - Cards arranged in downward arc (frown shape) with highest points at edges
   - Cards squeezed 30% horizontally to use less space
   - Hover behavior: 10% size increase, 20px upward lift, cards shift right to create space
   - Fast tween animations (0.15s) for snappy response
   - Cards automatically recenter when one is played

2. **Card Visual Updates**:
   - Enlarged top-left corner legends (18% of card height)
   - Removed bottom-right corner legends
   - Main rank/suit display offset toward bottom-right
   - Fixed variable naming conflict (cardStyle vs cardStyleProps)

3. **Card Style System**:
   - Added `cardStyle` setting: 'classic' | 'modern' | 'accessible' | 'minimalist'
   - Modern style uses rose-500/slate-800 colors with system fonts
   - Accessible style includes extra symbols and Roman numerals for face cards
   - Minimalist style has lighter background and no shadows
   - Settings integration in UI

4. **Trick Pile Positioning**:
   - Adjusted positioning away from center (left-65% for north player)
   - Fixed z-index issues with card hover states

### Bidding Interface Redesign (Latest Session)
1. **Three-Row Layout Structure**:
   - **Top Row**: Suit selection (left 2/3) + Current bid/Double button stack (right 1/3)
   - **Middle Row**: Pass, bid controls, and Bid button with equal widths
   - **Bottom Row**: Bidding history table

2. **Top Row Details**:
   - Suit selection buttons left-aligned with increased spacing (space-x-5)
   - No preselection - starts with null selected suit
   - Current bid indicator stacked above Double/Redouble button
   - Combined height of bid + button equals suit card height
   - All elements use consistent width (w-[160px])

3. **Button Standardization**:
   - Pass button: w-[160px]
   - Bid button: w-[160px]  
   - Double/Redouble buttons: w-[160px]
   - Increased spacing (space-x-6) to prevent misclicks

4. **Visual Improvements**:
   - Container transparency: bg-slate-800/75
   - Dark overlay: bg-black/40 (lighter to keep cards visible)
   - Bidding history pills use lighter backgrounds (bg-slate-600)
   - Current bid shows larger suit icon (text-5xl)
   - Removed min-max indication below bid amount

5. **Touch-Friendly Design**:
   - Larger touch targets with consistent sizing
   - Human cards remain visible/not dimmed during bidding
   - Placeholder div maintains layout height when no Double button shown

### Belote/Rebelote Implementation
1. **Game Logic Fixes**:
   - Fixed automatic Belote announcement when playing K or Q of trump
   - Works regardless of which card (K or Q) is played first
   - Compulsory announcement - not optional
   - Added notification system with GameNotification type
   - Updated beloteAnnounced to track both cards and announcement type

2. **AnnouncementDisplay Component**:
   - Animated popups for Belote/Rebelote announcements
   - Blue gradient for "Belote!", Purple for "Rebelote!"
   - Sparkle effects and glowing text animations
   - Auto-dismiss after 3 seconds
   - Integrated sound effects

3. **Modern Button Redesign (2025 Style)**:
   - **Pass Button**: Glass morphism with subtle shine, hover lift effect
   - **Bid Button**: Emerald gradient with suit symbol, glow on hover, disabled state handling
   - **Inc/Dec Buttons**: Circular design with rotation on hover, ping animation when held
   - **Double/Redouble**: Pulsing glow effect, intense hover glow, multiplier display
   - **Bid Display**: Rotating odometer effect with preview numbers, gradient fade masks
   - **Suit Cards**: 3D rotation on hover, glass morphism, floating particles, selected state glow

4. **Button Dimensions**:
   - All action buttons: w-[200px] for consistency
   - Current contract pill + double button height = suit card height
   - Proper alignment with mr-[15%] for right column

### Known Issues Fixed
- PlayerHand hover animation errors with availableWidth
- Card component CSS transition conflicts with Framer Motion
- Settings component undefined variable errors
- BiddingInterface initialization order issues
- Belote announcement not working (now fixed)
- Number flickering in bid display (replaced with smooth odometer)

### Game Rules Verified
1. **Trump Obligation**: ✅ Working correctly - players must play higher trump if they can
2. **Belote Announcement**: ✅ Fixed - automatic and compulsory
3. **Card Rankings**: Trump order correct (J-9-A-10-K-Q-8-7)

## Latest Session Updates (2025-01-06)

### Right-Click Card Zoom Feature
1. **Redux State Management**:
   - Added `rightClickZoom: boolean` to GameSettings interface
   - Added `zoomedCard: string | null` to GameState to track zoomed card
   - Created `toggleCardZoom` action in gameSlice
   - Default setting: `rightClickZoom: true`

2. **Card Component Updates**:
   - Added `onContextMenu` handler for right-click detection
   - Imports: `useAppDispatch`, `toggleCardZoom`, `motion`, `AnimatePresence`
   - Zoomed overlay shows card at 200% scale with dark backdrop (60% opacity)
   - Smooth animations: 0.2s duration with custom easing [0.16, 1, 0.3, 1]
   - Click anywhere or right-click again to dismiss zoom
   - Maintains all card styles (classic/modern/accessible/minimalist)

3. **Settings Integration**:
   - Added "Right-Click Card Zoom" toggle in Gameplay section
   - Shows after "Show Trick Pile Points" setting
   - Description: "Right-click any card to zoom 200%"
   - State properly synced with Redux store

4. **Global Right-Click Prevention**:
   - Added to App.tsx GameContent component
   - Prevents browser context menu on all elements EXCEPT:
     - Playing cards that are face-up (checks `.playing-card` class and `data-face-down="false"`)
   - Ensures clean UX without accidental context menus

### Implementation Details
- Zoom overlay uses `position: fixed` with `z-index: 9999/10000`
- Card content is duplicated in zoom view to maintain quality
- Backdrop click or right-click closes zoom
- Respects `rightClickZoom` setting - no zoom when disabled
- Works with all card sizes and positions