import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from '../utils/debounce';

interface ViewportSize {
  width: number;
  height: number;
}

export function useViewportSize(): ViewportSize {
  const [size, setSize] = useState<ViewportSize>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  }));

  const updateSize = useCallback(() => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  // Create debounced update function with useMemo to ensure stable reference
  const debouncedUpdate = useMemo(
    () => debounce(updateSize, 150),
    [updateSize]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Update immediately on mount
    updateSize();
    
    // Add event listeners for resize and orientation change
    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener('orientationchange', debouncedUpdate);
    
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', debouncedUpdate);
    };
  }, [debouncedUpdate, updateSize]);

  return size;
}