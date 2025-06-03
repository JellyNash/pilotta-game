import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { keyboardManager, KeyBinding } from './KeyboardManager';
import { useAccessibility } from './AccessibilityContext';

interface KeyboardHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardHelp: React.FC<KeyboardHelpProps> = ({ isOpen, onClose }) => {
  const { settings } = useAccessibility();
  const [bindings, setBindings] = useState<KeyBinding[]>([]);

  useEffect(() => {
    const updateBindings = () => {
      setBindings(keyboardManager.getBindings());
    };

    updateBindings();
    keyboardManager.addListener(updateBindings);

    return () => {
      keyboardManager.removeListener(updateBindings);
    };
  }, []);

  const categories = ['navigation', 'game', 'settings', 'help'] as const;
  const categoryLabels = {
    navigation: 'Navigation',
    game: 'Game Controls',
    settings: 'Settings',
    help: 'Help'
  };

  const formatKey = (binding: KeyBinding): string => {
    const parts: string[] = [];
    if (binding.ctrl) parts.push('Ctrl');
    if (binding.alt) parts.push('Alt');
    if (binding.shift) parts.push('Shift');
    parts.push(binding.key.length === 1 ? binding.key.toUpperCase() : binding.key);
    return parts.join(' + ');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Help Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-xl shadow-2xl z-50 max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  aria-label="Close keyboard help"
                >
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {categories.map(category => {
                const categoryBindings = bindings.filter(b => b.category === category);
                if (categoryBindings.length === 0) return null;

                return (
                  <div key={category} className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {categoryLabels[category]}
                    </h3>
                    <div className="space-y-2">
                      {categoryBindings.map((binding, index) => (
                        <div
                          key={`${category}-${index}`}
                          className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3"
                        >
                          <span className="text-slate-300">{binding.description}</span>
                          <kbd className="px-3 py-1 bg-slate-900 text-slate-200 rounded text-sm font-mono">
                            {formatKey(binding)}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Game-Specific Shortcuts</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• <kbd className="px-2 py-0.5 bg-slate-900 text-slate-200 rounded text-xs">Arrow Keys</kbd> - Navigate cards in hand</li>
                  <li>• <kbd className="px-2 py-0.5 bg-slate-900 text-slate-200 rounded text-xs">Enter/Space</kbd> - Play selected card</li>
                  <li>• <kbd className="px-2 py-0.5 bg-slate-900 text-slate-200 rounded text-xs">B</kbd> - Bid (during bidding phase)</li>
                  <li>• <kbd className="px-2 py-0.5 bg-slate-900 text-slate-200 rounded text-xs">P</kbd> - Pass (during bidding phase)</li>
                  <li>• <kbd className="px-2 py-0.5 bg-slate-900 text-slate-200 rounded text-xs">D</kbd> - Double (when available)</li>
                  <li>• <kbd className="px-2 py-0.5 bg-slate-900 text-slate-200 rounded text-xs">R</kbd> - Redouble (when available)</li>
                </ul>
              </div>

              {settings.input.customKeyBindings && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      onClose();
                      // Open accessibility settings to key bindings tab
                      const event = new CustomEvent('open-accessibility-settings', { detail: { tab: 'input' } });
                      window.dispatchEvent(event);
                    }}
                    className="text-blue-400 hover:text-blue-300 underline text-sm"
                  >
                    Customize Key Bindings
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
