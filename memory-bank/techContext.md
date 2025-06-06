# Tech Context

## Technologies Used
- React (TypeScript)
- Tailwind CSS (utility-first CSS framework)
- Custom CSS (component and global styles)
- CSS Variables (for theming and dynamic styling)
- PostCSS (build-time CSS processing)
- Stylelint (CSS linting and style enforcement)
- ESLint (JavaScript/TypeScript linting)
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
- ESLint (.eslintrc) and Stylelint (.stylelintrc) configuration files in JSON format

## Technical Constraints
- Must support modern browsers (Chrome 95+, Firefox 92+, Safari 15+, Edge - all support clamp())
- Responsive design required for mobile (320px+), tablet, desktop, 4K displays
- Clamp-first responsive approach - minimal media queries
- Accessibility partially restored - keyboard navigation and ARIA labels complete
- No hardcoded pixel values - everything must scale
- Single source of truth for all responsive values (tokens.css)
- WCAG 2.1 Level AA compliance target

## Responsive Architecture (Final - Sessions 27-30)
- **Design Tokens**: 50+ CSS variables with clamp() in tokens.css (single source of truth)
- **Z-Index System**: Hierarchical layering exclusively from tokens.css
- **Viewport Space Reservation**: Prevents zoom clipping with reserved margins
- **Card Overlap**: 50% for all bot players, dynamic for card count
- **Bidding Interface**: Flex-based responsive with mobile stacking at 640px
- **Container Strategy**: overflow: visible everywhere, no stacking context creators
- **Testing Breakpoints**: 320px, 375px, 768px, 1024px, 1440px, 2560px, 4K

## Project Architecture
- **Frontend**: React 18 + TypeScript + Redux Toolkit
- **Build**: Vite for fast development and optimized production builds
- **Styling**: CSS Modules + Tailwind CSS + CSS Custom Properties
- **Animation**: Framer Motion with pre-defined variants
- **AI**: MCTS algorithm with multiple personality strategies
- **Audio**: Web Audio API with proper memory management

## Dependencies
- Core: react, react-dom, typescript, @reduxjs/toolkit
- Styling: tailwindcss, postcss, autoprefixer
- Animation: framer-motion
- Drag & Drop: react-dnd, react-dnd-html5-backend, react-dnd-touch-backend
- Dev Tools: vite, eslint, stylelint, prettier
- Type Definitions: @types/react, @types/react-dom, vite/client

## Performance Optimizations
- Component memoization throughout
- Redux selectors with createSelector
- Debounced viewport resize handling
- Extracted animation variants
- Lazy loading for large components
- Hardware-accelerated animations

## Browser Support
- Chrome 95+ (clamp() support)
- Firefox 92+ (clamp() support)
- Safari 15+ (clamp() support)
- Edge (Chromium-based)
- Mobile browsers on iOS/Android

## This Document
Updated with final technical architecture from Sessions 27-30. Project uses modern web technologies with excellent browser support.
