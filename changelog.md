# Changelog

## 2025-01-06 - Major Updates

### Card UI Improvements
- Implemented downward arc layout for human player cards
- Added hover animations with 10% size increase and 20px lift
- Cards horizontally squeezed by 30% to save space
- Enlarged top-left corner legends to 18% of card height
- Removed bottom-right corner legends for cleaner look
- Added multiple card styles: classic, modern, accessible, minimalist

### Bidding Interface Redesign
- Redesigned with three-row layout structure
- Standardized all action buttons to w-[160px] or w-[200px]
- Implemented glass morphism and modern 2025 style
- Added responsive scaling with CSS variables
- Improved touch targets with proper spacing

### Right-Click Card Zoom Feature
- Added 200% zoom on right-click
- Smooth animations with dark backdrop
- Toggle setting in game settings
- Maintains all card styles in zoom view

### Performance Optimizations
- Fixed audio memory leak by removing DOM elements after playback
- Added React.memo to Card, PlayerHand, TrickArea, BiddingInterface, ScoreBoard components
- Extracted all animation variants to prevent recreation on render
- Removed conflicting CSS transitions
- Fixed setTimeout cleanup in multiple components
- Implemented useMemo and useCallback for expensive operations

### Responsive Desktop Optimizations
- Added 4K desktop support with responsive font sizes
- Scoreboard, control icons, and modals scale with viewport
- Animations use viewport units instead of fixed pixels
- Contract indicator repositioned responsively

### Game Logic Improvements
- Changed to counter-clockwise game progression (traditional Pilotta)
- Random initial dealer selection
- Fixed team trick pile positions (Team A left of south, Team B left of west)
- Added previous trick viewer with visual indicators
- Fixed Belote/Rebelote automatic announcements
- Updated bidding history to show counter-clockwise order

### Layout System Overhaul
- Implemented center-based positioning system
- All elements positioned relative to table center
- CSS Grid layout with defined areas
- Responsive variables for consistent scaling
- Works perfectly from 1280x720 to 2560x1440+
- Added visual regression testing with Puppeteer

### Accessibility Changes
- Completely removed all accessibility features for performance
- No keyboard navigation or screen reader support
- Focus on visual gameplay only

### Technical Infrastructure
- Created AI web worker implementation (needs Vite config fixes)
- Redux selectors with reselect for memoization
- New modular Redux slices created (not yet integrated)
- Added test:visual script for regression testing

### Known Issues
- CSS !important overuse in PlayerHand.css needs refactoring
- AI web worker needs Vite configuration fixes
- New Redux structure created but not integrated

## 2025-01-06 - Session 14 Updates

### CSS Architecture Improvements
- **Removed all !important declarations** from PlayerHand CSS
- Identified and fixed root cause: inline `position: relative` in Card.tsx
- Created clean CSS with unique `ph-` prefix to avoid conflicts
- Implemented proper CSS cascade without specificity hacks
- Fixed container query conflicts from responsive.css

### Human Player Card Fan Redesign
- **Mathematical arc system** with parabolic curve formula
- Implemented proper downward arc (frown shape) as requested
- **Increased card size by 30%** (156px × 218px base)
- Fixed excessive elevation of cards 1 and 8 with dampening factor
- Smooth rotation range reduced to -25° to +25° for natural look
- Adjusted spacing to 0.65 overlap for larger cards

### Technical Improvements
- Initial experiments introduced `PlayerHandArcImproved.css` with a scalable architecture (now removed in favor of `PlayerHandFlex.css`)
- CSS variables for all dimensions and parameters
- Integrated with existing Redux cardSize settings
- Support for dynamic card counts (future-ready)
- Clean separation of concerns without inline styles

### Bug Fixes
- Fixed `actualWidth is not defined` error in Card.tsx
- Added missing width calculation for zoomed card overlay
- Resolved card stacking issues from previous sessions

-### Files Created/Modified
- *(Removed)* `/src/components/PlayerHandArcImproved.css` was replaced by `PlayerHandFlex.css`
- `/src/components/Card.tsx` - Fixed undefined variable and removed inline position
- `/src/layouts/responsive.css` - Fixed container query target
- `/CARD_FAN_ARC_DESIGN.md` - Mathematical documentation
- `/CSS_REAL_SOLUTION_SUMMARY.md` - Clean CSS approach documentation

## 2025-01-06 - Session 15 Updates

### Trick Pile System Complete Overhaul

#### Phase 1: Two-Pile System
- **Reduced from 4 to 2 piles** - one per team instead of per player
- **Fixed positions**:
  - Team B: Upper left corner (opponents)
  - Team A: Lower right corner (human player's team)
- Removed trick piles from individual player zones
- Implemented as overlay elements for consistent positioning

#### Phase 2: TrickPileViewer Card Overlap Fix
- **Problem**: Cards were piling on top of each other in a mess
- **Solution**: Implemented CSS Grid layout with proper spacing
- **Cross formation**:
  - 3x3 grid with named areas (top, left, center, right, bottom)
  - Human player always at bottom
  - Partner at top, opponents on sides
  - Center shows lead suit in circular design
- **Initial design included**:
  - Player names and multiple badges
  - Crown emoji for winner
  - Rotating star animations
  - Bottom legend explaining all symbols

#### Phase 3: Minimal Redesign (Final)
- **User feedback**: Design was too intrusive to gameplay
- **Changes made**:
  - Removed colored header bar → subtle team indicator
  - Removed all player names
  - Removed badges ("Lead", "You") 
  - Removed bottom legend section
  - Removed rotating animations
  - Crown + "Winner" badge → small "W" circle
  - Added modern dark play order circles (1-4)
  - Reduced backdrop blur to 4px
  - Changed to medium-sized cards
- **Result**: Clean, unobtrusive modal that shows essential info without distraction
- **Kept**: CSS Grid layout, golden glow on winner, cross formation

## 2025-01-07 - Cleanup & Token Additions

### Maintenance
- Removed obsolete `ResponsiveCardHand.css` and deleted built asset directories
  (`dist-baseline/` and `purged-css/`) from the repository.
- Added new design tokens in `tokens.css`:
  - `--announcement-border-width`
  - `--ph-card-gap`
  - `--ph-container-padding`
  - `--ph-card-scale`
- Updated `PlayerHandFlex` to rely entirely on these tokens for spacing, padding
  and card scaling.
