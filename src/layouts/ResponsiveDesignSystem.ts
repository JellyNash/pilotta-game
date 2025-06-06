// Responsive breakpoint system
export const breakpoints = {
  sm: 640,    // Small screens
  md: 768,    // Medium screens  
  lg: 1024,   // Large screens
  xl: 1280,   // Extra large screens
  '2xl': 1536, // 2X large screens
  '4k': 2560   // 4K screens
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Z-index values removed - use CSS variables from tokens.css instead
// Example: style={{ zIndex: 'var(--z-card-base)' }}
// Available variables:
// --z-base, --z-card-base, --z-card-hover, --z-modal, etc.

// Responsive spacing using CSS custom properties
export const spacing = {
  '--edge-gap': 'clamp(0.5rem, 1vw, 2rem)',
  '--badge-offset': '0.5rem',
  '--card-separation': 'clamp(3rem, 5vw, 5rem)',
  '--grid-gap': 'clamp(1rem, 2vw, 3rem)',
  '--dynamic-padding': 'clamp(1rem, 2vw, 3rem)'
} as const;

// Component-specific responsive values
export const components = {
  card: {
    '--card-width-base': 'clamp(4rem, 6vw, 8rem)',
    '--card-height-base': 'calc(var(--card-width-base) * 1.4)',
    '--card-overlap': '0.85', // Maintain current overlap ratio
    '--fan-arc-depth': 'clamp(3rem, 5vw, 5rem)' // For human player fan
  },
  table: {
    '--trick-area-size': 'min(60vw, 60vh)',
    '--trick-area-max': '40rem'
  },
  bidding: {
    '--bid-modal-width': 'min(90vw, 60rem)',
    '--bid-button-width': 'clamp(10rem, 15vw, 14rem)',
    '--suit-button-size': 'clamp(5rem, 8vw, 7rem)'
  }
} as const;