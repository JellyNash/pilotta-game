// Stub implementation for removed accessibility features
// According to CLAUDE.md, all accessibility features have been removed for performance

export const useAccessibility = () => {
  return {
    settings: {
      keyboard: { enabled: false },
      theme: 'default',
      colorblindMode: 'none',
      suitPatterns: false,
      animations: { cardAnimations: true }
    },
    announceToScreenReader: () => {},
    isHighContrast: false,
    isReducedMotion: false,
    isScreenReaderActive: false,
    updateSettings: () => {},
    updateSettingPath: () => {},
    resetSettings: () => {}
  };
};

export const AccessibilityProvider = ({ children }: { children: React.ReactNode }) => children;

export const useKeyboardNavigation = () => {};

export const KeyboardHelp = ({ isOpen, onClose }: any) => null;

export const AccessibilitySettings = ({ isOpen, onClose }: any) => null;