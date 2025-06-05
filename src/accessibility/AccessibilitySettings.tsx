import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibility } from './AccessibilityContext';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettingPath, resetSettings } = useAccessibility();

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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-h-[80vh] overflow-y-auto"
            role="dialog"
            aria-labelledby="accessibility-settings-title"
            aria-modal="true"
          >
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-2xl min-w-[400px]">
              <h2 id="accessibility-settings-title" className="text-xl font-bold mb-6 text-white">
                Accessibility Settings
              </h2>
              
              {/* Keyboard Settings */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-200">Keyboard Navigation</h3>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={settings.keyboard.enabled}
                    onChange={(e) => updateSettingPath('keyboard.enabled', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <span className="text-gray-300">Enable keyboard navigation</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.keyboard.shortcuts}
                    onChange={(e) => updateSettingPath('keyboard.shortcuts', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <span className="text-gray-300">Enable keyboard shortcuts</span>
                </label>
              </div>

              {/* Visual Settings */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-200">Visual</h3>
                <div className="mb-3">
                  <label className="block text-gray-300 mb-1">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => updateSettingPath('theme', e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-gray-300"
                  >
                    <option value="default">Default</option>
                    <option value="dark">Dark</option>
                    <option value="highContrast">High Contrast</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="block text-gray-300 mb-1">Colorblind Mode</label>
                  <select
                    value={settings.colorblindMode}
                    onChange={(e) => updateSettingPath('colorblindMode', e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-gray-300"
                  >
                    <option value="none">None</option>
                    <option value="protanopia">Protanopia (Red-blind)</option>
                    <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                    <option value="tritanopia">Tritanopia (Blue-blind)</option>
                  </select>
                </div>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.suitPatterns}
                    onChange={(e) => updateSettingPath('suitPatterns', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <span className="text-gray-300">Show suit patterns on cards</span>
                </label>
              </div>

              {/* Animation Settings */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-200">Animations</h3>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={settings.animations.cardAnimations}
                    onChange={(e) => updateSettingPath('animations.cardAnimations', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <span className="text-gray-300">Card animations</span>
                </label>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={settings.animations.transitions}
                    onChange={(e) => updateSettingPath('animations.transitions', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <span className="text-gray-300">UI transitions</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.animations.dealingAnimation}
                    onChange={(e) => updateSettingPath('animations.dealingAnimation', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <span className="text-gray-300">Card dealing animation</span>
                </label>
              </div>

              {/* Screen Reader Settings */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-200">Screen Reader</h3>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={settings.screenReader.announceAllActions}
                    onChange={(e) => updateSettingPath('screenReader.announceAllActions', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <span className="text-gray-300">Announce all actions</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.screenReader.verboseMode}
                    onChange={(e) => updateSettingPath('screenReader.verboseMode', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <span className="text-gray-300">Verbose descriptions</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={resetSettings}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};