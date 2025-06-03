// Responsive breakpoint system following mobile-first approach
export const breakpoints = {
  xs: 0,      // Mobile portrait
  sm: 640,    // Mobile landscape
  md: 768,    // Tablet portrait
  lg: 1024,   // Tablet landscape / Small desktop
  xl: 1280,   // Desktop
  '2xl': 1536 // Large desktop
} as const;

// Type-safe breakpoint keys
export type Breakpoint = keyof typeof breakpoints;

// Responsive spacing scale (in rem units for better accessibility)
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

// Z-index scale for proper layering
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  notification: 80,
  debug: 90
} as const;

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
    return typeof values === 'object' ? (values.xs ?? Object.values(values)[0]) : values;
  }

  const width = window.innerWidth;
  
  if (typeof values !== 'object') {
    return values;
  }

  // Find the appropriate value for current screen size
  let result: T | undefined;
  
  for (const [breakpoint, minWidth] of Object.entries(breakpoints).reverse()) {
    if (width >= minWidth && values[breakpoint as Breakpoint] !== undefined) {
      result = values[breakpoint as Breakpoint];
      break;
    }
  }

  return result ?? (values.xs ?? Object.values(values)[0]);
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