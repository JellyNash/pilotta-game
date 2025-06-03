import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AccessibilitySettings, defaultAccessibilitySettings } from './accessibilityTypes';

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (partial: Partial<AccessibilitySettings>) => void;
  updateSettingPath: (path: string, value: any) => void;
  resetSettings: () => void;
  isHighContrast: boolean;
  isReducedMotion: boolean;
  isScreenReaderActive: boolean;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('pilotta-accessibility');
    if (saved) {
      try {
        return { ...defaultAccessibilitySettings, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse accessibility settings:', e);
      }
    }
    
    // Check system preferences
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    return {
      ...defaultAccessibilitySettings,
      theme: prefersDark ? 'dark' : 'default',
      animations: {
        ...defaultAccessibilitySettings.animations,
        reducedMotion: prefersReducedMotion,
      },
      contrast: {
        ...defaultAccessibilitySettings.contrast,
        enabled: prefersHighContrast,
      },
    };
  });
  
  // Screen reader announcement element
  const [announcement, setAnnouncement] = useState<{
    message: string;
    priority: 'polite' | 'assertive';
    key: number;
  }>({ message: '', priority: 'polite', key: 0 });
  
  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Theme
    root.setAttribute('data-theme', settings.theme);
    
    // Font size
    root.style.fontSize = `${settings.fontSize}%`;
    
    // Animations
    if (settings.animations.reducedMotion || !settings.animations.enabled) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Animation speed
    root.style.setProperty('--animation-speed', `${1 / settings.animations.speed}`);
    
    // High contrast
    if (settings.contrast.enabled) {
      root.classList.add('high-contrast');
      root.setAttribute('data-contrast-level', settings.contrast.level);
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Colorblind mode
    root.setAttribute('data-colorblind-mode', settings.colorblindMode);
    
    // Focus visibility
    root.style.setProperty('--focus-thickness', `${settings.focus.thickness}px`);
    root.style.setProperty('--focus-color', settings.focus.color);
    
    // Card magnification
    root.style.setProperty('--card-magnification', `${settings.highlighting.magnification}`);
    
    // Save to localStorage
    localStorage.setItem('pilotta-accessibility', JSON.stringify(settings));
  }, [settings]);
  
  // Listen for system preference changes
  useEffect(() => {
    const mediaQueries = {
      dark: window.matchMedia('(prefers-color-scheme: dark)'),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
    };
    
    const handlers = {
      dark: (e: MediaQueryListEvent) => {
        if (settings.theme === 'default' || settings.theme === 'dark') {
          updateSettings({ theme: e.matches ? 'dark' : 'default' });
        }
      },
      reducedMotion: (e: MediaQueryListEvent) => {
        updateSettings({
          animations: { ...settings.animations, reducedMotion: e.matches },
        });
      },
      highContrast: (e: MediaQueryListEvent) => {
        updateSettings({
          contrast: { ...settings.contrast, enabled: e.matches },
        });
      },
    };
    
    // Add listeners
    Object.entries(mediaQueries).forEach(([key, mq]) => {
      mq.addEventListener('change', handlers[key as keyof typeof handlers]);
    });
    
    // Cleanup
    return () => {
      Object.entries(mediaQueries).forEach(([key, mq]) => {
        mq.removeEventListener('change', handlers[key as keyof typeof handlers]);
      });
    };
  }, [settings.theme, settings.animations, settings.contrast]);
  
  const updateSettings = useCallback((partial: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);
  
  const updateSettingPath = useCallback((path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  }, []);
  
  const resetSettings = useCallback(() => {
    setSettings(defaultAccessibilitySettings);
    localStorage.removeItem('pilotta-accessibility');
  }, []);
  
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (settings.screenReader.enabled) {
      setAnnouncement(prev => ({
        message,
        priority,
        key: prev.key + 1,
      }));
    }
  }, [settings.screenReader.enabled]);
  
  const value: AccessibilityContextType = {
    settings,
    updateSettings,
    updateSettingPath,
    resetSettings,
    isHighContrast: settings.contrast.enabled,
    isReducedMotion: settings.animations.reducedMotion || !settings.animations.enabled,
    isScreenReaderActive: settings.screenReader.enabled,
    announceToScreenReader,
  };
  
  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Screen reader announcement element */}
      <div
        key={announcement.key}
        role="status"
        aria-live={announcement.priority}
        aria-atomic="true"
        className="sr-only"
      >
        {announcement.message}
      </div>
    </AccessibilityContext.Provider>
  );
};
