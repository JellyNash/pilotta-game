/**
 * Unified breakpoint system - Single source of truth for all responsive values
 * Import this file wherever breakpoints are needed instead of hardcoding values
 */

export const BREAKPOINTS = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1440,
  '2xl': 1920,
  '4k': 2560,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Media query strings for use in CSS-in-JS or styled-components
 */
export const MEDIA_QUERIES = {
  xs: `(min-width: ${BREAKPOINTS.xs}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`,
  '4k': `(min-width: ${BREAKPOINTS['4k']}px)`,
} as const;

/**
 * Helper to get the current breakpoint based on window width
 */
export function getCurrentBreakpoint(width: number): BreakpointKey {
  if (width >= BREAKPOINTS['4k']) return '4k';
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Device type detection based on breakpoints
 */
export function getDeviceType(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (width < BREAKPOINTS.md) return 'mobile';
  if (width < BREAKPOINTS.lg) return 'tablet';
  return 'desktop';
}

/**
 * CSS variable names for breakpoints to sync with tokens.css
 */
export const BREAKPOINT_CSS_VARS = {
  mobile: '--breakpoint-mobile',
  tablet: '--breakpoint-tablet',
  laptop: '--breakpoint-laptop',
  desktop: '--breakpoint-desktop',
  wide: '--breakpoint-wide',
  ultrawide: '--breakpoint-ultrawide',
} as const;