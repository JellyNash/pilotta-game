# System Patterns

## System Architecture
- React + TypeScript SPA.
- Modular component structure.
- CSS handled via a combination of Tailwind, custom CSS, and CSS variables.
- Responsive design via CSS, utility classes, and custom hooks.

## Key Technical Decisions
- Use of Tailwind for utility-first styling.
- Custom CSS for component-specific and global overrides.
- Responsive hooks and layout components for device adaptation.
- CSS variables for theme and dynamic styling.

## Design Patterns in Use
- Container/presenter separation in UI.
- Centralized state management (Redux or similar).
- Component-level encapsulation of styles.
- Use of utility classes for rapid prototyping and consistency.

## Component Relationships
- GameTable, PlayerHand, TrickArea, BiddingInterface, etc., compose the main game UI.
- Layouts and positioning systems manage responsive adaptation.

## Critical Implementation Paths
- Style application order: Tailwind base → custom CSS → overrides.
- Responsive breakpoints and dynamic layout switching.
- CSS variable resolution and fallback handling.

## This Document
Update as new patterns or architectural changes are introduced.
