import { useState, useEffect, useCallback } from 'react';
import { breakpoints, Breakpoint } from '../layouts/ResponsiveSystem';

interface ScreenInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  orientation: 'portrait' | 'landscape';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
}

/**
 * Professional responsive hook with debouncing and performance optimizations
 */
export const useResponsive = (): ScreenInfo => {
  const [screenInfo, setScreenInfo] = useState<ScreenInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        breakpoint: 'lg',
        orientation: 'landscape',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouch: false
      };
    }

    return getScreenInfo();
  });

  const updateScreenInfo = useCallback(() => {
    setScreenInfo(getScreenInfo());
  }, []);

  useEffect(() => {
    // Debounced resize handler
    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(updateScreenInfo, 150);
    };

    // Listen to resize and orientation change
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', updateScreenInfo);

    // Initial update
    updateScreenInfo();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', updateScreenInfo);
    };
  }, [updateScreenInfo]);

  return screenInfo;
};

function getScreenInfo(): ScreenInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Determine current breakpoint
  let currentBreakpoint: Breakpoint = 'xs';
  for (const [breakpoint, minWidth] of Object.entries(breakpoints).reverse()) {
    if (width >= minWidth) {
      currentBreakpoint = breakpoint as Breakpoint;
      break;
    }
  }

  // Detect touch capability
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return {
    width,
    height,
    breakpoint: currentBreakpoint,
    orientation: width > height ? 'landscape' : 'portrait',
    isMobile: width < breakpoints.md,
    isTablet: width >= breakpoints.md && width < breakpoints.lg,
    isDesktop: width >= breakpoints.lg,
    isTouch
  };
}

/**
 * Hook for container queries
 */
export const useContainerQuery = (ref: React.RefObject<HTMLElement>) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return dimensions;
};

/**
 * Hook for matching media queries
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } 
    // Legacy browsers
    else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
};

/**
 * Hook for responsive values based on breakpoints
 */
export const useResponsiveValue = <T,>(
  values: Partial<Record<Breakpoint, T>> & { default: T }
): T => {
  const { breakpoint } = useResponsive();
  
  // Find the value for current breakpoint or fall back to smaller breakpoints
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp]!;
    }
  }
  
  return values.default;
};