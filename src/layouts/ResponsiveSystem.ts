// Breakpoints utilities
import { breakpoints, type BreakpointKey as Breakpoint } from '../styles/breakpoints';
export { breakpoints, Breakpoint };

// Responsive spacing scale (in rem units)
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const;

// Z-index values removed - use CSS variables from tokens.css instead
// Example: style={{ zIndex: 'var(--z-card-base)' }}
// Available variables from tokens.css:
// --z-base: 1
// --z-table-surface: 1
// --z-card-base: 10
// --z-trick-cards: 20
// --z-south-player: 25
// --z-player-indicator: 30
// --z-card-hover: 40
// --z-card-selected: 50
// --z-ui-overlay: 60
// --z-trick-pile: 70
// --z-announcement: 80
// --z-bidding-interface: 90
// --z-modal-backdrop: 100
// --z-modal: 110
// --z-header: 120
// --z-notification: 150
// --z-tooltip: 200

// Container queries for component-level responsiveness
export const containerQueries = {
  card: {
    sm: '(min-width: 200px)',
    md: '(min-width: 300px)',
    lg: '(min-width: 400px)'
  },
  hand: {
    compact: '(max-width: 600px)',
    normal: '(min-width: 601px) and (max-width: 900px)',
    spacious: '(min-width: 901px)'
  }
} as const;

// Responsive value helper type
export type ResponsiveValue<T> = T | {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
};

// Helper to generate responsive CSS classes
export function getResponsiveClasses<T extends string>(
  value: ResponsiveValue<T>,
  prefix: string
): string {
  if (typeof value === 'string') {
    return `${prefix}-${value}`;
  }

  return Object.entries(value)
    .map(([breakpoint, val]) => {
      if (breakpoint === 'xs') {
        return `${prefix}-${val}`;
      }
      return `${breakpoint}:${prefix}-${val}`;
    })
    .join(' ');
}

// Media query helper
export function mediaQuery(breakpoint: Breakpoint): string {
  return `@media (min-width: ${breakpoints[breakpoint]}px)`;
}

// Hook for responsive values
export function useResponsiveValue<T>(values: ResponsiveValue<T>): T {
  if (typeof window === 'undefined') {
    const serverDefault =
      typeof values === 'object'
        ? (values as Record<Breakpoint, T>).xs ?? Object.values(values as Record<string, T>)[0]
        : values;
    return serverDefault;
  }

  const width = window.innerWidth;
  
  if (typeof values !== 'object') {
    return values;
  }

  // Find the appropriate value for current screen size
  let result: T | undefined;
  
  for (const [key, minWidth] of Object.entries(breakpoints) as [Breakpoint, number][]) {
    if (width >= minWidth && typeof values === 'object' && (values as Record<Breakpoint, T>)[key] !== undefined) {
      result = (values as Record<Breakpoint, T>)[key];
      break;
    }
  }

  const firstValue = Object.values(values as Record<string, T>)[0];
  const fallback =
    typeof values === 'object' && (values as Record<Breakpoint, T>).xs !== undefined
      ? (values as Record<Breakpoint, T>).xs
      : firstValue;
  return result ?? fallback;
}

// Viewport units with fallback
export const viewport = {
  height: (percentage: number) => ({
    height: `${percentage}vh`,
    minHeight: `${percentage * 6}px` // Fallback for older browsers
  }),
  width: (percentage: number) => ({
    width: `${percentage}vw`,
    minWidth: `${percentage * 10}px` // Fallback for older browsers
  })
} as const;