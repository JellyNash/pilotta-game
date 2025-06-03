import { useEffect, useCallback } from 'react';
import { useAccessibility } from './AccessibilityContext';

export interface KeyBinding {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
  category: 'navigation' | 'game' | 'settings' | 'help';
}

class KeyboardManager {
  private bindings: Map<string, KeyBinding> = new Map();
  private enabled: boolean = true;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initializeDefaultBindings();
  }

  private initializeDefaultBindings() {
    // Navigation bindings
    this.addBinding({
      key: 'Tab',
      action: () => this.focusNextArea(),
      description: 'Move to next game area',
      category: 'navigation'
    });

    this.addBinding({
      key: 'Tab',
      shift: true,
      action: () => this.focusPreviousArea(),
      description: 'Move to previous game area',
      category: 'navigation'
    });

    // Game bindings
    this.addBinding({
      key: 'h',
      action: () => this.focusHand(),
      description: 'Focus on your hand',
      category: 'game'
    });

    this.addBinding({
      key: 't',
      action: () => this.focusTable(),
      description: 'Focus on table',
      category: 'game'
    });

    this.addBinding({
      key: 's',
      action: () => this.focusScore(),
      description: 'Focus on scoreboard',
      category: 'game'
    });

    // Settings bindings
    this.addBinding({
      key: '?',
      action: () => this.showHelp(),
      description: 'Show keyboard shortcuts help',
      category: 'help'
    });

    this.addBinding({
      key: 'Escape',
      action: () => this.closeModals(),
      description: 'Close current dialog',
      category: 'navigation'
    });
  }

  private createBindingKey(binding: Omit<KeyBinding, 'action' | 'description' | 'category'>): string {
    const parts: string[] = [];
    if (binding.ctrl) parts.push('ctrl');
    if (binding.alt) parts.push('alt');
    if (binding.shift) parts.push('shift');
    parts.push(binding.key.toLowerCase());
    return parts.join('+');
  }

  addBinding(binding: KeyBinding) {
    const key = this.createBindingKey(binding);
    this.bindings.set(key, binding);
    this.notifyListeners();
  }

  removeBinding(key: string, modifiers?: { ctrl?: boolean; alt?: boolean; shift?: boolean }) {
    const bindingKey = this.createBindingKey({ key, ...modifiers });
    this.bindings.delete(bindingKey);
    this.notifyListeners();
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    if (!this.enabled) return false;

    const key = this.createBindingKey({
      key: event.key,
      ctrl: event.ctrlKey,
      alt: event.altKey,
      shift: event.shiftKey
    });

    const binding = this.bindings.get(key);
    if (binding) {
      event.preventDefault();
      binding.action();
      return true;
    }

    return false;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  getBindings(): KeyBinding[] {
    return Array.from(this.bindings.values());
  }

  getBindingsByCategory(category: KeyBinding['category']): KeyBinding[] {
    return this.getBindings().filter(b => b.category === category);
  }

  // Navigation helpers
  private focusNextArea() {
    const areas = ['hand', 'table', 'score', 'bidding'];
    const currentElement = document.activeElement;
    let currentArea = '';

    for (const area of areas) {
      const element = document.getElementById(area);
      if (element?.contains(currentElement)) {
        currentArea = area;
        break;
      }
    }

    const currentIndex = areas.indexOf(currentArea);
    const nextIndex = (currentIndex + 1) % areas.length;
    const nextElement = document.getElementById(areas[nextIndex]);
    
    if (nextElement) {
      const focusable = nextElement.querySelector('[tabindex="0"], button, input, [role="button"]');
      (focusable as HTMLElement)?.focus();
    }
  }

  private focusPreviousArea() {
    const areas = ['hand', 'table', 'score', 'bidding'];
    const currentElement = document.activeElement;
    let currentArea = '';

    for (const area of areas) {
      const element = document.getElementById(area);
      if (element?.contains(currentElement)) {
        currentArea = area;
        break;
      }
    }

    const currentIndex = areas.indexOf(currentArea);
    const prevIndex = (currentIndex - 1 + areas.length) % areas.length;
    const prevElement = document.getElementById(areas[prevIndex]);
    
    if (prevElement) {
      const focusable = prevElement.querySelector('[tabindex="0"], button, input, [role="button"]');
      (focusable as HTMLElement)?.focus();
    }
  }

  private focusHand() {
    const hand = document.getElementById('hand');
    const firstCard = hand?.querySelector('[role="button"][tabindex="0"]');
    (firstCard as HTMLElement)?.focus();
  }

  private focusTable() {
    const table = document.getElementById('table');
    table?.focus();
  }

  private focusScore() {
    const score = document.getElementById('score');
    score?.focus();
  }

  private showHelp() {
    // This will be handled by the component using the keyboard manager
    const event = new CustomEvent('show-keyboard-help');
    window.dispatchEvent(event);
  }

  private closeModals() {
    // Close any open modals
    const event = new CustomEvent('close-modals');
    window.dispatchEvent(event);
  }

  // Listener management
  addListener(listener: () => void) {
    this.listeners.add(listener);
  }

  removeListener(listener: () => void) {
    this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

// Singleton instance
export const keyboardManager = new KeyboardManager();

// React hook for using keyboard manager
export function useKeyboardNavigation() {
  const { settings } = useAccessibility();

  useEffect(() => {
    if (!settings.keyboard.enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      keyboardManager.handleKeyDown(event);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboard.enabled]);

  const updateBinding = useCallback((oldKey: string, newBinding: Partial<KeyBinding>) => {
    const existingBinding = keyboardManager.getBindings().find(b => b.key === oldKey);
    if (existingBinding) {
      keyboardManager.removeBinding(oldKey);
      keyboardManager.addBinding({ ...existingBinding, ...newBinding });
    }
  }, []);

  return {
    bindings: keyboardManager.getBindings(),
    updateBinding,
    addBinding: (binding: KeyBinding) => keyboardManager.addBinding(binding),
    removeBinding: (key: string) => keyboardManager.removeBinding(key)
  };
}
