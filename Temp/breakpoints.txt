/**
 * Breakpoint helpers that read values from CSS custom properties defined in
 * `tokens.css`. This keeps the TypeScript utilities in sync with the design
 * tokens and removes the need for a separately maintained constant map.
 */

export const BREAKPOINT_KEYS = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '4k',
] as const;

export type BreakpointKey = typeof BREAKPOINT_KEYS[number];

const FALLBACK_BREAKPOINTS: Record<BreakpointKey, number> = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1440,
  '2xl': 1920,
  '4k': 2560,
};

function readBreakpoint(key: BreakpointKey): number {
  if (typeof window === 'undefined') {
    return FALLBACK_BREAKPOINTS[key];
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--breakpoint-${key}`)
    .trim();
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? FALLBACK_BREAKPOINTS[key] : parsed;
}

/**
 * Breakpoints proxy that resolves values from CSS variables on demand.
 */
export const breakpoints: Record<BreakpointKey, number> = {} as Record<
  BreakpointKey,
  number
>;

for (const key of BREAKPOINT_KEYS) {
  Object.defineProperty(breakpoints, key, {
    get: () => readBreakpoint(key),
    enumerable: true,
  });
}

/**
 * Media query strings for use in CSS-in-JS or styled-components
 */
export const MEDIA_QUERIES: Record<BreakpointKey, string> = {} as Record<
  BreakpointKey,
  string
>;

for (const key of BREAKPOINT_KEYS) {
  Object.defineProperty(MEDIA_QUERIES, key, {
    get: () => `(min-width: ${readBreakpoint(key)}px)`,
    enumerable: true,
  });
}

/**
 * Helper to get the current breakpoint based on window width
 */
export function getCurrentBreakpoint(width: number): BreakpointKey {
  if (width >= readBreakpoint('4k')) return '4k';
  if (width >= readBreakpoint('2xl')) return '2xl';
  if (width >= readBreakpoint('xl')) return 'xl';
  if (width >= readBreakpoint('lg')) return 'lg';
  if (width >= readBreakpoint('md')) return 'md';
  if (width >= readBreakpoint('sm')) return 'sm';
  return 'xs';
}

/**
 * Device type detection based on breakpoints
 */
export function getDeviceType(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (width < readBreakpoint('md')) return 'mobile';
  if (width < readBreakpoint('lg')) return 'tablet';
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

