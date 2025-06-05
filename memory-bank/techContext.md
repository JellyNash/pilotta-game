# Tech Context

## Technologies Used
- React (TypeScript)
- Tailwind CSS (utility-first CSS framework)
- Custom CSS (component and global styles)
- CSS Variables (for theming and dynamic styling)
- PostCSS (build-time CSS processing)
- Stylelint (CSS linting and style enforcement)
- Vite (build tool)
- Redux Toolkit for state management
- Framer Motion for animations
- React DnD for drag and drop
- React Context API for accessibility settings

## Development Setup
- Node.js, npm
- Vite for local development and builds
- Tailwind and PostCSS config files for styling pipeline
- TypeScript for type safety

## Technical Constraints
- Must support modern browsers (Chrome 95+, Firefox 92+, Safari 15+, Edge - all support clamp())
- Responsive design required for mobile (320px+), tablet, desktop, 4K displays
- Clamp-first responsive approach - minimal media queries
- Accessibility partially restored - keyboard navigation and ARIA labels complete
- No hardcoded pixel values - everything must scale
- Single source of truth for all responsive values (tokens.css)
- WCAG 2.1 Level AA compliance target

## Responsive Architecture (Session 27 Completed)
- **Design Tokens**: 50+ CSS variables with clamp() in tokens.css
- **Z-Index System**: Hierarchical layering (base: 1, cards: 10, trick: 20, etc.)
- **Viewport Space Reservation**: Prevents zoom clipping with reserved margins
- **Card Overlap**: 50% for bot players, 55% for 8 cards
- **Bidding Interface**: Flex-based responsive with mobile stacking at 640px
- **Container Strategy**: overflow: visible everywhere, proper stacking contexts
- **Testing Breakpoints**: 320px, 375px, 768px, 1024px, 1440px, 2560px

## Dependencies
- tailwindcss
- postcss
- stylelint
- react, react-dom
- typescript

## Tool Usage Patterns
- Tailwind for most layout and utility classes
- Custom CSS for overrides and special cases
- CSS variables for theme and runtime styling
- PostCSS for build-time CSS transformations
- Stylelint for code quality

## This Document
Update as dependencies or technical setup changes.
