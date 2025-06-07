# CLAUDE.md - Pilotta Game Development Guide

This file provides guidance to Claude Code when working with this repository. It maintains project standards and tracks development progress.

## 🚨 CRITICAL REQUIREMENTS 🚨

### 1. **MANDATORY RESPONSIVE DESIGN COMPLIANCE**
- **ALL styling MUST follow**: `/docs/RESPONSIVE_DESIGN_CHEATSHEET.md`
- **NO EXCEPTIONS** - This is the Single Source of Truth (SSoT) for styling
- **Key Rules**:
  - ❌ Never use fixed pixels without clamp()
  - ❌ Never use Tailwind utilities for sizing
  - ✅ Always use the responsive system defined in the cheatsheet
  - ✅ Notify user if requirements cannot be met

### 2. **DOCUMENTATION REQUIREMENTS**
- All new documentation goes in `/docs/` folder
- Update relevant docs when making changes
- Reference documentation in code comments

## 📋 PROJECT STATUS

### Development Environment
- **Dev Server**: http://localhost:3000
- **Build Tool**: Vite
- **Package Manager**: npm

### Quick Commands
```bash
npm run dev         # Start development server
npm run build       # Production build
npm run preview     # Preview production build
npm run lint        # ESLint checks
npm run test        # Jest tests (not implemented)
npm run test:visual # Visual regression tests
```

## 🏗️ ARCHITECTURE OVERVIEW

### Technology Stack
- **Frontend**: React 18 + TypeScript
- **State**: Redux Toolkit
- **Styling**: Tailwind CSS + CSS Modules + Custom Responsive System
- **Animations**: Framer Motion
- **Drag & Drop**: react-dnd (HTML5 + Touch)

### Core Architecture Layers

#### 1. **Game Engine** (`/src/core/`)
- `types.ts` - Central type definitions
- `gameRules.ts` - Game logic and validation
- `cardUtils.ts` - Card utilities

#### 2. **State Management** (`/src/store/`)
- `gameSlice.ts` - All game state (players, cards, scores, phases)
- Typed Redux actions for state transitions

#### 3. **Game Flow** (`/src/game/`)
- `GameManager.ts` - Singleton orchestrator
- `GameFlowController.ts` - Phase transitions
- Handles async operations (AI, animations)

#### 4. **AI System** (`/src/ai/`)
- Multiple personalities (Conservative, Aggressive, Balanced, Adaptive)
- MCTS implementation for decision making

#### 5. **Components** (`/src/components/`)
- Modular React components
- Key: GameTable, PlayerHand, BiddingInterface, TrickArea
- Performance-optimized with memoization

#### 6. **Layout System** (`/src/layouts/`)
- CSS Grid-based responsive design
- Center-based positioning
- Scales from 1280x720 to 2560x1440+

## 🎮 GAME FLOW

1. **Dealing** → 2. **Bidding** → 3. **Declaring** → 4. **Playing** → 5. **Scoring**

## 🔑 KEY IMPLEMENTATION PATTERNS

1. **Event-Driven**: Redux actions for all state changes
2. **Async AI**: Non-blocking AI decisions
3. **Mobile-First**: Touch support throughout
4. **Performance**: Memoization, optimized animations, proper cleanup

## 📊 CURRENT IMPLEMENTATION STATUS

### ✅ Completed Features
- [x] Full Pilotta rules implementation
- [x] Counter-clockwise game progression
- [x] Multiple card styles (classic, modern, accessible, minimalist)
- [x] Right-click card zoom (200% scale)
- [x] Responsive card sizing
- [x] Three-row bidding interface with modern design
- [x] Touch-friendly UI targets
- [x] Random dealer selection
- [x] Fixed team trick pile positions
- [x] Previous trick viewer
- [x] Automatic Belote/Rebelote announcements
- [x] Component memoization (Card, PlayerHand, TrickArea, etc.)
- [x] Extracted animation variants
- [x] Audio memory management

### ⚠️ Partial Implementation
- [ ] Basic keyboard navigation (limited coverage)
- [ ] ARIA labels (basic implementation)
- [ ] Focus indicators (partial)

### ❌ Not Implemented
- [ ] Jest unit tests
- [ ] Full accessibility standards
- [ ] Save/load game state
- [ ] Online multiplayer

## 📁 CRITICAL FILES REFERENCE

### Responsive System
- **SSoT**: `/docs/RESPONSIVE_DESIGN_CHEATSHEET.md`
- **Tokens**: `/src/styles/tokens.css`
- **Grid**: `/src/layouts/game-grid.css`
- **Variables**: `/src/layouts/responsive-variables.css`
- **Center System**: `/src/layouts/table-center.css`

### Core Components
- **Positioning**: `/src/layouts/PositioningSystem.tsx`
- **Player Zones**: `/src/components/PlayerZone.tsx`

### Configuration
- **ESLint**: `.eslintrc.cjs`
- **Stylelint**: `stylelint.config.cjs`
- **Playwright**: `playwright.config.ts`

### Performance
- **Animations**: `/src/animations/animationVariants.ts`
- **Sound**: `/src/game/soundManager.ts`

## 🎯 DEVELOPMENT PRIORITIES

1. **Maintain responsive design compliance** - Check cheatsheet before ANY styling
2. **Performance first** - Memoize components, optimize renders
3. **Follow existing patterns** - Check similar implementations before creating new ones
4. **Document changes** - Update relevant docs when making changes

## 🐛 KNOWN ISSUES

- Limited accessibility implementation
- No test coverage
- [Add new issues here as discovered]

## 📈 MILESTONES & PROGRESS

### Phase 1: Core Game (✅ COMPLETE)
- Basic game mechanics
- AI implementation
- Responsive layout

### Phase 2: Polish (🔄 IN PROGRESS)
- Performance optimizations
- Animation refinements
- Sound system

### Phase 3: Testing (❌ NOT STARTED)
- Unit tests
- Visual regression tests
- E2E tests

### Phase 4: Accessibility (⚠️ PARTIAL)
- Full keyboard navigation
- Screen reader support
- WCAG compliance

---
**Last Updated**: [Update this date when making changes]
**Version**: 1.0