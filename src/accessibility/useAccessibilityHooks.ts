import { useEffect, useRef, useCallback } from 'react';
import { useAccessibility } from './AccessibilityContext';
import { KeyBindings, defaultKeyBindings } from './accessibilityTypes';

// Hook for keyboard navigation
export const useKeyboardNavigation = (
  items: any[],
  onSelect: (index: number) => void,
  onActivate: (index: number) => void
) => {
  const { settings } = useAccessibility();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  
  const bindings = { ...defaultKeyBindings, ...settings.keyboard.customBindings };
  
  useEffect(() => {
    if (!settings.keyboard.enabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case bindings.nextCard:
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % items.length);
          break;
        case bindings.previousCard:
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case bindings.selectCard:
          e.preventDefault();
          onSelect(selectedIndex);
          break;
        case bindings.playCard:
          e.preventDefault();
          onActivate(selectedIndex);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboard.enabled, selectedIndex, items.length, onSelect, onActivate, bindings]);
  
  useEffect(() => {
    itemRefs.current[selectedIndex]?.focus();
  }, [selectedIndex]);
  
  return {
    selectedIndex,
    setSelectedIndex,
    itemRefs,
  };
};

// Hook for screen reader announcements
export const useAnnounce = () => {
  const { announceToScreenReader } = useAccessibility();
  
  return useCallback((message: string, priority?: 'polite' | 'assertive') => {
    announceToScreenReader(message, priority);
  }, [announceToScreenReader]);
};

// Hook for haptic feedback
export const useHaptics = () => {
  const { settings } = useAccessibility();
  
  const vibrate = useCallback((pattern: number | number[]) => {
    if (!settings.haptics.enabled || !navigator.vibrate) return;
    
    const intensity = settings.haptics.intensity / 100;
    const adjustedPattern = Array.isArray(pattern) 
      ? pattern.map(p => Math.round(p * intensity))
      : Math.round(pattern * intensity);
    
    navigator.vibrate(adjustedPattern);
  }, [settings.haptics.enabled, settings.haptics.intensity]);
  
  return {
    light: () => vibrate(10),
    medium: () => vibrate(25),
    heavy: () => vibrate(50),
    pattern: (pattern: number[]) => vibrate(pattern),
  };
};

// Hook for focus management
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    firstFocusable?.focus();
    
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);
  
  return containerRef;
};

// Hook for skip links
export const useSkipLinks = () => {
  const { settings } = useAccessibility();
  const announce = useAnnounce();
  
  useEffect(() => {
    if (!settings.keyboard.skipLinks) return;
    
    const bindings = { ...defaultKeyBindings, ...settings.keyboard.customBindings };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      let target: string | null = null;
      
      switch (e.key) {
        case bindings.skipToHand:
          target = '#player-hand';
          break;
        case bindings.skipToTable:
          target = '#game-table';
          break;
        case bindings.skipToScore:
          target = '#scoreboard';
          break;
      }
      
      if (target) {
        e.preventDefault();
        const element = document.querySelector(target) as HTMLElement;
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          announce(`Navigated to ${target.replace('#', '').replace('-', ' ')}`);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboard.skipLinks, settings.keyboard.customBindings, announce]);
};

// Hook for animation preferences
export const useAnimationPreference = () => {
  const { settings } = useAccessibility();
  
  return {
    enabled: settings.animations.enabled && !settings.animations.reducedMotion,
    duration: settings.animations.speed,
    reducedMotion: settings.animations.reducedMotion,
  };
};

// Hook for legal move highlighting
export const useLegalMoves = (legalMoves: number[], currentPlayer: boolean) => {
  const { settings } = useAccessibility();
  const announce = useAnnounce();
  
  useEffect(() => {
    if (!settings.highlighting.legalMoves || !currentPlayer) return;
    
    const count = legalMoves.length;
    if (count > 0) {
      announce(`You have ${count} legal move${count > 1 ? 's' : ''} available`, 'polite');
    }
  }, [settings.highlighting.legalMoves, legalMoves, currentPlayer, announce]);
  
  return settings.highlighting.legalMoves ? legalMoves : [];
};

// Hook for multi-modal alerts
export const useMultiModalAlert = () => {
  const { settings } = useAccessibility();
  const announce = useAnnounce();
  const haptics = useHaptics();
  
  const alert = useCallback((message: string, type: 'info' | 'warning' | 'error' = 'info') => {
    if (!settings.indicators.multiModalAlerts) {
      // Just announce for screen reader
      announce(message, type === 'error' ? 'assertive' : 'polite');
      return;
    }
    
    // Visual alert (handled by component)
    const alertElement = document.createElement('div');
    alertElement.className = 'multi-modal-alert';
    alertElement.textContent = message;
    alertElement.setAttribute('role', 'alert');
    alertElement.setAttribute('aria-live', 'assertive');
    document.body.appendChild(alertElement);
    
    // Audio alert
    if (settings.audio.enabled && settings.audio.cues.gameEvents) {
      // Play sound based on type
      // soundManager.play(type);
    }
    
    // Haptic alert
    if (type === 'error') {
      haptics.heavy();
    } else if (type === 'warning') {
      haptics.medium();
    } else {
      haptics.light();
    }
    
    // Screen reader
    announce(message, type === 'error' ? 'assertive' : 'polite');
    
    // Remove after 3 seconds
    setTimeout(() => {
      alertElement.remove();
    }, 3000);
  }, [settings, announce, haptics]);
  
  return alert;
};

// Hook for theme-aware styling
export const useThemeStyles = () => {
  const { settings } = useAccessibility();
  
  return {
    cardStyle: {
      background: `var(--card-bg)`,
      border: `2px solid var(--card-border)`,
      boxShadow: `0 2px 4px var(--card-shadow)`,
    },
    textStyle: {
      color: `var(--text-primary)`,
    },
    suitStyle: (suit: string) => ({
      color: `var(--suit-${suit.toLowerCase()})`,
      ...(settings.suitPatterns && {
        maskImage: `var(--suit-pattern-${suit.toLowerCase()})`,
        WebkitMaskImage: `var(--suit-pattern-${suit.toLowerCase()})`,
      }),
    }),
  };
};

// Hook for responsive card sizing
export const useCardSize = () => {
  const { settings } = useAccessibility();
  const [viewportWidth, setViewportWidth] = React.useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const baseSize = viewportWidth < 768 ? 60 : 80;
  const scaledSize = baseSize * (settings.cardSize / 100);
  
  return {
    width: scaledSize,
    height: scaledSize * 1.4, // Standard card ratio
    fontSize: scaledSize * 0.2,
  };
};

// Hook for practice mode undo
export const usePracticeMode = (onUndo: () => void) => {
  const { settings } = useAccessibility();
  const [canUndo, setCanUndo] = React.useState(false);
  
  useEffect(() => {
    if (!settings.cognitive.practiceMode) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && canUndo) {
        e.preventDefault();
        onUndo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.cognitive.practiceMode, canUndo, onUndo]);
  
  return {
    practiceMode: settings.cognitive.practiceMode,
    setCanUndo,
  };
};
