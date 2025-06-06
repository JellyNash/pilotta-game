import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface KeyboardHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardHelp: React.FC<KeyboardHelpProps> = ({ isOpen, onClose }) => {
  const shortcuts = [
    { key: '←/→', description: 'Navigate between cards' },
    { key: 'Home', description: 'Select first card' },
    { key: 'End', description: 'Select last card' },
    { key: 'Enter/Space', description: 'Play selected card' },
    { key: 'Esc', description: 'Cancel selection' },
    { key: 'Tab', description: 'Navigate UI elements' },
    { key: 'Shift+Tab', description: 'Navigate backwards' },
    { key: '?', description: 'Show this help' }
  ];

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
            role="dialog"
            aria-labelledby="keyboard-help-title"
            aria-modal="true"
          >
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-2xl min-w-[300px]">
              <h2 id="keyboard-help-title" className="text-xl font-bold mb-4 text-white">
                Keyboard Shortcuts
              </h2>
              
              <div className="space-y-2">
                {shortcuts.map(({ key, description }) => (
                  <div key={key} className="flex justify-between items-center">
                    <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm font-mono text-gray-300">
                      {key}
                    </kbd>
                    <span className="text-gray-400 ml-4">{description}</span>
                  </div>
                ))}
              </div>
              
              <button
                onClick={onClose}
                className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};