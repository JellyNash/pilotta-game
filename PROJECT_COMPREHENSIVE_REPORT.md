# Pilotta Game - Comprehensive Project Report

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [File Tree Structure](#file-tree-structure)
5. [Game Flow](#game-flow)
6. [CSS Architecture & Responsive Strategy](#css-architecture--responsive-strategy)
7. [Key Features](#key-features)
8. [Development Guidelines](#development-guidelines)

## Project Overview

Pilotta is a digital implementation of the traditional Mediterranean trick-taking card game. This web-based version provides a modern, accessible, and responsive gaming experience that works seamlessly across all devices from mobile phones (320px) to 4K displays.

### Core Objectives
- **Authentic Gameplay**: Faithful implementation of Pilotta rules including bidding, declarations, and scoring
- **Cross-Platform**: Responsive design that adapts to any screen size
- **Accessibility**: Keyboard navigation and ARIA labels for inclusive gaming
- **AI Opponents**: Multiple AI personalities with different playing styles
- **Modern UX**: Smooth animations, intuitive controls, and visual feedback

### Game Summary
Pilotta is a partnership card game for 4 players (2 teams). Players bid for contracts, declare card combinations for bonus points, and play tricks to fulfill their contracts. The first team to reach 1000 points wins.

## Technology Stack

### Frontend Framework
- **React 18**: Component-based UI with hooks
- **TypeScript**: Type-safe development
- **Redux Toolkit**: Centralized state management
- **Vite**: Lightning-fast build tool and dev server

### Styling & Animation
- **CSS Modules**: Scoped styling with modern CSS features
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Declarative animations
- **CSS Custom Properties**: Dynamic theming with CSS variables

### Game Mechanics
- **React DnD**: Drag-and-drop card interactions
- **Custom Game Engine**: Pure TypeScript game logic
- **AI System**: Monte Carlo Tree Search (MCTS) for intelligent opponents

## Project Architecture

```
┌─────────────────────┐
│   UI Components     │ ← React + TypeScript
├─────────────────────┤
│   State Management  │ ← Redux Toolkit
├─────────────────────┤
│   Game Engine       │ ← Core game logic
├─────────────────────┤
│   AI System         │ ← Strategy patterns + MCTS
├─────────────────────┤
│   Layout System     │ ← CSS Grid + Responsive
└─────────────────────┘
```

### Key Architectural Patterns
1. **Separation of Concerns**: UI, state, and game logic are clearly separated
2. **Component Composition**: Small, reusable components combined into features
3. **Immutable State**: Redux ensures predictable state updates
4. **Event-Driven**: User actions dispatch Redux actions
5. **Responsive-First**: All components designed for multiple viewports

## File Tree Structure

```
pilotta-game/
├── src/
│   ├── core/                    # Game engine and rules
│   │   ├── types.ts            # TypeScript type definitions for entire game
│   │   ├── gameRules.ts        # Game logic, validation, and scoring
│   │   └── cardUtils.ts        # Card manipulation utilities
│   │
│   ├── game/                    # Game flow management
│   │   ├── GameManager.ts      # Singleton orchestrating game flow
│   │   └── GameFlowController.ts # Phase transitions and progression
│   │
│   ├── ai/                      # AI player system
│   │   ├── aiStrategy.ts       # AI decision making and personalities
│   │   ├── AIStrategyClass.ts  # OOP AI implementation
│   │   ├── mcts.ts            # Monte Carlo Tree Search algorithm
│   │   └── MCTSPlayer.ts      # MCTS player implementation
│   │
│   ├── store/                   # Redux state management
│   │   ├── index.ts           # Store configuration
│   │   ├── gameSlice.ts       # Game state and actions
│   │   ├── hooks.ts          # Typed Redux hooks
│   │   └── selectors.ts      # Memoized state selectors
│   │
│   ├── components/              # React UI components
│   │   ├── GameTable.tsx      # Main game board container
│   │   ├── PlayerZone.tsx     # Player area with hand and info
│   │   ├── PlayerHandFlex.tsx # Responsive card hand display
│   │   ├── Card.tsx          # Individual playing card
│   │   ├── BiddingInterface.tsx # Bidding phase UI
│   │   ├── TrickArea.tsx     # Central play area for tricks
│   │   ├── ScoreBoard.tsx    # Score tracking display
│   │   ├── ContractIndicator.tsx # Current contract display
│   │   ├── AnnouncementSystem.tsx # In-game notifications
│   │   └── [other components...]
│   │
│   ├── layouts/                 # Layout and positioning system
│   │   ├── GameLayout.tsx     # Main game layout container
│   │   ├── ResponsiveSystem.ts # Responsive breakpoint logic
│   │   ├── game-grid.css      # CSS Grid layout definitions
│   │   ├── table-center.css   # Center-based positioning
│   │   └── responsive.css     # Responsive utilities
│   │
│   ├── styles/                  # Global styles and tokens
│   │   ├── tokens.css         # CSS custom properties (variables)
│   │   ├── app.css           # Global application styles
│   │   ├── breakpoints.ts    # TypeScript breakpoint definitions
│   │   └── scoped-overrides.css # Scoped style overrides
│   │
│   ├── accessibility/           # Accessibility features
│   │   ├── AccessibilityContext.tsx # A11y state management
│   │   ├── useKeyboardNavigation.ts # Keyboard controls
│   │   └── KeyboardHelp.tsx   # Keyboard shortcut guide
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useResponsive.ts   # Responsive design hook
│   │   └── useViewportSize.ts # Viewport dimensions hook
│   │
│   ├── utils/                   # Utility functions
│   │   ├── soundManager.ts    # Audio effects management
│   │   ├── cardSorting.ts     # Card sorting algorithms
│   │   └── positionMapping.ts # Player position utilities
│   │
│   ├── App.tsx                 # Root application component
│   ├── main.tsx               # Application entry point
│   └── index.css              # Root styles
│
├── public/                      # Static assets
├── docs/                       # Documentation
├── memory-bank/               # AI context files for development
├── package.json              # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

### Key File Explanations

#### Core Game Engine (`/src/core/`)
- **types.ts**: Defines all TypeScript interfaces and types (Card, Player, GameState, etc.)
- **gameRules.ts**: Implements Pilotta rules including trump obligations, scoring, and valid moves
- **cardUtils.ts**: Helper functions for card comparisons, sorting, and deck operations

#### State Management (`/src/store/`)
- **gameSlice.ts**: Redux slice containing all game state and action creators
- **selectors.ts**: Memoized selectors for efficient state access
- Uses Redux Toolkit for reduced boilerplate and better developer experience

#### Component Architecture (`/src/components/`)
- Components follow single-responsibility principle
- Props are strongly typed with TypeScript
- Memoization used for performance optimization
- Each component has accompanying CSS module when needed

#### Layout System (`/src/layouts/`)
- CSS Grid-based responsive layout
- Center-based positioning for consistent scaling
- Mobile-first approach with progressive enhancement

## Game Flow

### 1. Game Initialization
```
Start Game → Select Difficulty → Random Dealer Selection → Team Formation
```

### 2. Round Flow
```
┌─→ Deal Cards (8 per player)
│   ↓
│   Bidding Phase
│   • Players bid or pass
│   • Minimum bid: 80 points
│   • Options: Pass, Bid, Double, Redouble
│   • Highest bidder becomes declarer
│   ↓
│   Declaration Phase (Optional)
│   • Announce sequences (3+ consecutive cards)
│   • Announce four of a kind
│   • Points: 20-200 based on combination
│   ↓
│   Playing Phase
│   • 8 tricks played
│   • Must follow suit if possible
│   • Trump obligation when applicable
│   • Declarer leads first trick
│   ↓
│   Scoring Phase
│   • Count card points
│   • Add declaration bonuses
│   • Check contract fulfillment
│   • Update team scores
│   ↓
└─← Next Round (until 1000 points)
```

### 3. Card Values
- **Trump Suit**: Jack (20), Nine (14), Ace (11), Ten (10), King (4), Queen (3), Eight/Seven (0)
- **Non-Trump**: Ace (11), Ten (10), King (4), Queen (3), Jack (2), Nine/Eight/Seven (0)

### 4. Special Rules
- **Belote/Rebelote**: Automatic 20 points for King-Queen of trump
- **All Trumps**: 24 contract where all suits are trump
- **No Trumps**: 26 contract with no trump suit
- **Capot**: Bonus 100 points for taking all tricks
- **Early Termination**: Game ends if contract becomes mathematically impossible

## CSS Architecture & Responsive Strategy

### 1. Modern CSS Architecture

```
┌─────────────────────────┐
│    CSS Layers (@layer)  │
├─────────────────────────┤
│ • base                  │ ← Reset and foundations
│ • tokens               │ ← Design system variables
│ • layout               │ ← Grid and positioning
│ • components           │ ← Component styles
│ • utilities            │ ← Helper classes
│ • overrides            │ ← Specificity management
└─────────────────────────┘
```

### 2. Design Token System (`tokens.css`)

The project uses a comprehensive token system with CSS custom properties:

```css
/* Typography Scale - Fluid with clamp() */
--fs-3xs: clamp(0.5rem, 0.4rem + 0.5vw, 0.625rem);
--fs-2xs: clamp(0.625rem, 0.5rem + 0.625vw, 0.75rem);
--fs-xs: clamp(0.75rem, 0.625rem + 0.625vw, 0.875rem);
/* ... up to --fs-3xl */

/* Spacing Scale - Responsive */
--space-3xs: clamp(0.125rem, 0.1rem + 0.125vw, 0.1875rem);
--space-2xs: clamp(0.25rem, 0.2rem + 0.25vw, 0.375rem);
/* ... up to --space-4xl */

/* Component Dimensions */
--card-width: clamp(60px, 8vw + 20px, 120px);
--card-height: clamp(84px, 11.2vw + 28px, 168px);
```

### 3. Responsive Strategy

#### Clamp-First Approach
- **No Media Queries for Sizing**: All dimensions use `clamp()` for smooth scaling
- **Fluid Typography**: Font sizes scale proportionally with viewport
- **Dynamic Spacing**: Padding and margins adapt to screen size
- **Continuous Scaling**: No jarring breakpoint jumps

#### Breakpoint System (Structural Changes Only)
```typescript
// breakpoints.ts
export const BREAKPOINTS = {
  xs: 375,   // Small phones
  sm: 640,   // Large phones
  md: 768,   // Tablets
  lg: 1024,  // Desktop
  xl: 1440   // Large screens
};
```

Media queries are used sparingly for:
- Layout structure changes (grid columns)
- Component visibility (hide/show elements)
- Interaction changes (touch vs mouse)

### 4. CSS Organization

#### Component Styles
Each component has its own CSS module:
```css
/* Card.css */
.card {
  width: var(--card-width);
  height: var(--card-height);
  font-size: var(--fs-base);
  /* No hardcoded pixels! */
}
```

#### Layout System
```css
/* game-grid.css */
.game-layout {
  display: grid;
  grid-template-areas:
    "north-west  north      north-east"
    "west        center     east"
    "south-west  south      south-east";
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);
  gap: var(--space-md);
}
```

### 5. Performance Optimizations

- **CSS Containment**: `contain: layout style` on key containers
- **Will-change**: Applied to animated properties
- **Hardware Acceleration**: `transform: translateZ(0)` for smooth animations
- **Minimal Reflows**: Batch DOM updates, use transforms over position

## Key Features

### 1. Responsive Design
- **320px to 4K Support**: Tested across all device sizes
- **Touch-Friendly**: Large touch targets, swipe gestures
- **Orientation Support**: Landscape and portrait layouts
- **Dynamic Scaling**: All elements scale proportionally

### 2. AI System
- **4 Personalities**: Conservative, Aggressive, Balanced, Adaptive
- **MCTS Algorithm**: Advanced decision-making for challenging gameplay
- **Contextual Decisions**: AI adapts based on game state and score
- **Realistic Timing**: AI "thinks" before playing

### 3. Accessibility
- **Keyboard Navigation**: Full game control via keyboard
- **ARIA Labels**: Screen reader support
- **Focus Indicators**: Clear visual feedback
- **High Contrast**: Readable text and clear boundaries

### 4. Visual Features
- **Smooth Animations**: Framer Motion for fluid transitions
- **Glass Morphism**: Modern UI with backdrop blur effects
- **Visual Feedback**: Clear indicators for game state
- **Celebration Effects**: Victory animations and particles

### 5. Game Features
- **Auto-play Last Card**: Saves time when only one legal move
- **Early Termination**: Ends round when outcome is certain
- **Previous Trick Viewer**: Review the last played trick
- **Comprehensive Scoring**: Detailed breakdown of points

## Development Guidelines

### 1. Code Standards
```typescript
// Use TypeScript interfaces for all props
interface CardProps {
  card: Card;
  onClick?: (card: Card) => void;
  disabled?: boolean;
}

// Memoize expensive components
export const Card = React.memo(({ card, onClick }: CardProps) => {
  // Component logic
});
```

### 2. CSS Best Practices
```css
/* Always use design tokens */
.component {
  padding: var(--space-md);
  font-size: var(--fs-base);
  
  /* Never use hardcoded pixels */
  /* BAD: padding: 16px; */
}
```

### 3. State Management
```typescript
// Use Redux Toolkit slices
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    dealCards: (state) => {
      // Immutable updates with Immer
    }
  }
});
```

### 4. Performance Considerations
- Memoize selectors with createSelector
- Use React.memo for pure components
- Debounce expensive operations
- Lazy load large components

### 5. Testing Strategy
- Unit tests for game logic
- Integration tests for Redux flows
- Visual regression tests with Puppeteer
- Manual testing across devices

## Conclusion

The Pilotta game project represents a modern approach to implementing traditional card games for the web. With its responsive design, accessibility features, and sophisticated AI, it provides an engaging experience across all platforms while maintaining clean, maintainable code architecture.

The project's success lies in its:
- **Technical Excellence**: Modern stack with TypeScript and React
- **Design System**: Comprehensive token-based approach
- **User Experience**: Smooth animations and intuitive controls
- **Code Quality**: Well-organized, typed, and documented
- **Future-Ready**: Scalable architecture for new features

This foundation allows for easy maintenance and feature additions while ensuring a consistent, high-quality gaming experience for all users.