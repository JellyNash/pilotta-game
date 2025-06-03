import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibility } from './AccessibilityContext';
import { X, Eye, Ear, Keyboard, Brain, Palette, Sliders } from 'lucide-react';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, updateSettingPath, resetSettings } = useAccessibility();
  const [activeTab, setActiveTab] = useState<'visual' | 'audio' | 'input' | 'cognitive' | 'comfort'>('visual');

  const tabs = [
    { id: 'visual', label: 'Visual', icon: Eye },
    { id: 'audio', label: 'Audio & Haptic', icon: Ear },
    { id: 'input', label: 'Input', icon: Keyboard },
    { id: 'cognitive', label: 'Cognitive', icon: Brain },
    { id: 'comfort', label: 'Comfort', icon: Palette },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                     md:w-[800px] md:max-h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 
                     flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Accessibility Settings"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold">Accessibility Settings</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close settings"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 min-w-fit transition-colors
                              ${activeTab === tab.id 
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    aria-selected={activeTab === tab.id}
                    role="tab"
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'visual' && <VisualSettings />}
              {activeTab === 'audio' && <AudioSettings />}
              {activeTab === 'input' && <InputSettings />}
              {activeTab === 'cognitive' && <CognitiveSettings />}
              {activeTab === 'comfort' && <ComfortSettings />}
            </div>
            
            {/* Footer */}
            <div className="flex justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={resetSettings}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 
                         dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Reset to Defaults
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Visual Settings Tab
const VisualSettings: React.FC = () => {
  const { settings, updateSettings, updateSettingPath } = useAccessibility();
  
  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Theme</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['default', 'high-contrast', 'dark', 'colorblind-safe'].map((theme) => (
            <button
              key={theme}
              onClick={() => updateSettings({ theme: theme as any })}
              className={`p-3 rounded-lg border-2 transition-all
                        ${settings.theme === theme 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}
            >
              <span className="text-sm capitalize">{theme.replace('-', ' ')}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Font Size */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Font Size: {settings.fontSize}%</h3>
        <input
          type="range"
          min="100"
          max="200"
          step="10"
          value={settings.fontSize}
          onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
          className="w-full"
          aria-label="Font size percentage"
        />
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
          <span>100%</span>
          <span>150%</span>
          <span>200%</span>
        </div>
      </div>
      
      {/* Card Size */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Card Size: {settings.cardSize}%</h3>
        <input
          type="range"
          min="100"
          max="200"
          step="10"
          value={settings.cardSize}
          onChange={(e) => updateSettings({ cardSize: parseInt(e.target.value) })}
          className="w-full"
          aria-label="Card size percentage"
        />
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
          <span>100%</span>
          <span>150%</span>
          <span>200%</span>
        </div>
      </div>
      
      {/* Contrast Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Contrast</h3>
        <label className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={settings.contrast.enabled}
            onChange={(e) => updateSettingPath('contrast.enabled', e.target.checked)}
            className="w-5 h-5"
          />
          <span>Enable High Contrast</span>
        </label>
        {settings.contrast.enabled && (
          <div className="ml-8 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="contrast-level"
                checked={settings.contrast.level === 'AA'}
                onChange={() => updateSettingPath('contrast.level', 'AA')}
              />
              <span>WCAG AA (4.5:1)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="contrast-level"
                checked={settings.contrast.level === 'AAA'}
                onChange={() => updateSettingPath('contrast.level', 'AAA')}
              />
              <span>WCAG AAA (7:1)</span>
            </label>
          </div>
        )}
      </div>
      
      {/* Colorblind Mode */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Colorblind Mode</h3>
        <select
          value={settings.colorblindMode}
          onChange={(e) => updateSettings({ colorblindMode: e.target.value as any })}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="none">None</option>
          <option value="protanopia">Protanopia (Red-Green)</option>
          <option value="deuteranopia">Deuteranopia (Red-Green)</option>
          <option value="tritanopia">Tritanopia (Blue-Yellow)</option>
          <option value="monochrome">Monochrome</option>
        </select>
      </div>
      
      {/* Visual Aids */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Visual Aids</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.suitPatterns}
              onChange={(e) => updateSettings({ suitPatterns: e.target.checked })}
              className="w-5 h-5"
            />
            <span>Add patterns to card suits</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.indicators.cardLabels}
              onChange={(e) => updateSettingPath('indicators.cardLabels', e.target.checked)}
              className="w-5 h-5"
            />
            <span>Show card labels (e.g., "J♥")</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.highlighting.legalMoves}
              onChange={(e) => updateSettingPath('highlighting.legalMoves', e.target.checked)}
              className="w-5 h-5"
            />
            <span>Highlight legal moves</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.highlighting.teamColors}
              onChange={(e) => updateSettingPath('highlighting.teamColors', e.target.checked)}
              className="w-5 h-5"
            />
            <span>Show team color bands</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.highlighting.dynamicOutlines}
              onChange={(e) => updateSettingPath('highlighting.dynamicOutlines', e.target.checked)}
              className="w-5 h-5"
            />
            <span>Dynamic card outlines</span>
          </label>
        </div>
      </div>
      
      {/* Animations */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Animations</h3>
        <label className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={settings.animations.enabled}
            onChange={(e) => updateSettingPath('animations.enabled', e.target.checked)}
            className="w-5 h-5"
          />
          <span>Enable animations</span>
        </label>
        {settings.animations.enabled && (
          <>
            <label className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                checked={settings.animations.reducedMotion}
                onChange={(e) => updateSettingPath('animations.reducedMotion', e.target.checked)}
                className="w-5 h-5"
              />
              <span>Reduced motion</span>
            </label>
            <div className="mb-2">
              <label>Animation Speed: {settings.animations.speed}x</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.animations.speed}
                onChange={(e) => updateSettingPath('animations.speed', parseFloat(e.target.value))}
                className="w-full mt-1"
                aria-label="Animation speed multiplier"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>0.5x</span>
                <span>1x</span>
                <span>2x</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Audio Settings Tab
const AudioSettings: React.FC = () => {
  const { settings, updateSettingPath } = useAccessibility();
  
  return (
    <div className="space-y-6">
      {/* Master Audio */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Audio</h3>
        <label className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={settings.audio.enabled}
            onChange={(e) => updateSettingPath('audio.enabled', e.target.checked)}
            className="w-5 h-5"
          />
          <span>Enable audio</span>
        </label>
        {settings.audio.enabled && (
          <div>
            <label>Volume: {settings.audio.volume}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.audio.volume}
              onChange={(e) => updateSettingPath('audio.volume', parseInt(e.target.value))}
              className="w-full mt-1"
              aria-label="Audio volume"
            />
          </div>
        )}
      </div>
      
      {/* Audio Cues */}
      {settings.audio.enabled && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Audio Cues</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.audio.cues.turnPrompt}
                onChange={(e) => updateSettingPath('audio.cues.turnPrompt', e.target.checked)}
                className="w-5 h-5"
              />
              <span>Turn prompt</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.audio.cues.trickWin}
                onChange={(e) => updateSettingPath('audio.cues.trickWin', e.target.checked)}
                className="w-5 h-5"
              />
              <span>Trick win</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.audio.cues.belote}
                onChange={(e) => updateSettingPath('audio.cues.belote', e.target.checked)}
                className="w-5 h-5"
              />
              <span>Belote announcement</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.audio.cues.bidChange}
                onChange={(e) => updateSettingPath('audio.cues.bidChange', e.target.checked)}
                className="w-5 h-5"
              />
              <span>Bid changes</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.audio.cues.gameEvents}
                onChange={(e) => updateSettingPath('audio.cues.gameEvents', e.target.checked)}
                className="w-5 h-5"
              />
              <span>Game events</span>
            </label>
          </div>
        </div>
      )}
      
      {/* Advanced Audio */}
      {settings.audio.enabled && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Advanced Audio</h3>
          <label className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              checked={settings.audio.spatialAudio}
              onChange={(e) => updateSettingPath('audio.spatialAudio', e.target.checked)}
              className="w-5 h-5"
            />
            <span>Spatial audio (3D positioning)</span>
          </label>
          <div>
            <label>Voice Selection</label>
            <select
              value={settings.audio.voiceSelection}
              onChange={(e) => updateSettingPath('audio.voiceSelection', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
            >
              <option value="default">Default</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
        </div>
      )}
      
      {/* Screen Reader */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Screen Reader</h3>
        <label className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={settings.screenReader.enabled}
            onChange={(e) => updateSettingPath('screenReader.enabled', e.target.checked)}
            className="w-5 h-5"
          />
          <span>Enable screen reader support</span>
        </label>
        {settings.screenReader.enabled && (
          <div className="space-y-3">
            <div>
              <label>Verbosity</label>
              <select
                value={settings.screenReader.verbosity}
                onChange={(e) => updateSettingPath('screenReader.verbosity', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
              >
                <option value="compact">Compact</option>
                <option value="verbose">Verbose</option>
              </select>
            </div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.screenReader.announceAll}
                onChange={(e) => updateSettingPath('screenReader.announceAll', e.target.checked)}
                className="w-5 h-5"
              />
              <span>Announce all game events</span>
            </label>
          </div>
        )}
      </div>
      
      {/* Haptics */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Haptics (Mobile)</h3>
        <label className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={settings.haptics.enabled}
            onChange={(e) => updateSettingPath('haptics.enabled', e.target.checked)}
            className="w-5 h-5"
          />
          <span>Enable haptic feedback</span>
        </label>
        {settings.haptics.enabled && (
          <div>
            <label>Intensity: {settings.haptics.intensity}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.haptics.intensity}
              onChange={(e) => updateSettingPath('haptics.intensity', parseInt(e.target.value))}
              className="w-full mt-1"
              aria-label="Haptic intensity"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Input Settings Tab
const InputSettings: React.FC = () => {
  const { settings, updateSettingPath } = useAccessibility();
  
  return (
    <div className="space-y-6">
      {/* Keyboard */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Keyboard Navigation</h3>
        <label className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={settings.keyboard.enabled}
            onChange={(e) => updateSettingPath('keyboard.enabled', e.target.checked)}
            className="w-5 h-5"
          />
          <span>Enable keyboard navigation</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.keyboard.skipLinks}
            onChange={(e) => updateSettingPath('keyboard.skipLinks', e.target.checked)}
            className="w-5 h-5"
          />
          <span>Show skip links</span>
        </label>
      </div>
      
      {/* Focus Indicators */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Focus Indicators</h3>
        <label className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={settings.focus.visible}
            onChange={(e) => updateSettingPath('focus.visible', e.target.checked)}
            className="w-5 h-5"
          />
          <span>Show focus indicators</span>
        </label>
        {settings.focus.visible && (
          <>
            <div className="mb-3">
              <label>Thickness: {settings.focus.thickness}px</label>
              <input
                type="range"
                min="2"
                max="5"
                value={settings.focus.thickness}
                onChange={(e) => updateSettingPath('focus.thickness', parseInt(e.target.value))}
                className="w-full mt-1"
                aria-label="Focus indicator thickness"
              />
            </div>
            <div>
              <label>Focus Color</label>
              <input
                type="color"
                value={settings.focus.color}
                onChange={(e) => updateSettingPath('focus.color', e.target.value)}
                className="w-full h-10 mt-1"
                aria-label="Focus indicator color"
              />
            </div>
          </>
        )}
      </div>
      
      {/* Card Interaction */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Card Interaction</h3>
        <label className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={settings.highlighting.activeCard}
            onChange={(e) => updateSettingPath('highlighting.activeCard', e.target.checked)}
            className="w-5 h-5"
          />
          <span>Magnify card on hover/focus</span>
        </label>
        {settings.highlighting.activeCard && (
          <div>
            <label>Magnification: {settings.highlighting.magnification}x</label>
            <input
              type="range"
              min="1"
              max="1.5"
              step="0.05"
              value={settings.highlighting.magnification}
              onChange={(e) => updateSettingPath('highlighting.magnification', parseFloat(e.target.value))}
              className="w-full mt-1"
              aria-label="Card magnification amount"
            />
          </div>
        )}
      </div>
      
      {/* Key Bindings (simplified for brevity) */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Key Bindings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Default key bindings are configured. Custom bindings coming soon.
        </p>
        <div className="space-y-1 text-sm">
          <div>← → Arrow Keys: Navigate cards</div>
          <div>Space: Select card</div>
          <div>Enter: Play card</div>
          <div>S: Skip to hand</div>
          <div>T: Skip to table</div>
          <div>R: Announce trump</div>
          <div>?: Show help</div>
        </div>
      </div>
    </div>
  );
};

// Cognitive Settings Tab
const CognitiveSettings: React.FC = () => {
  const { settings, updateSettingPath } = useAccessibility();
  
  return (
    <div className="space-y-6">
      {/* Simplified Mode */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Interface Complexity</h3>
        <label className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={settings.cognitive.simplifiedMode}
            onChange={(e) => updateSettingPath('cognitive.simplifiedMode', e.target.checked)}
            className="w-5 h-5"
          />
          <span>Simplified mode (reduce visual clutter)</span>
        </label>
      </div>
      
      {/* Play Assistance */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Play Assistance</h3>
        <label className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={settings.cognitive.playHints}
            onChange={(e) => updateSettingPath('cognitive.playHints', e.target.checked)}
            className="w-5 h-5"
          />
          <span>Show play hints</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.cognitive.practiceMode}
            onChange={(e) => updateSettingPath('cognitive.practiceMode', e.target.checked)}
            className="w-5 h-5"
          />
          <span>Practice mode (allow undo)</span>
        </label>
      </div>
      
      {/* Game Speed */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Game Speed</h3>
        <label>AI Thinking Time: {settings.cognitive.gameSpeed}x</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={settings.cognitive.gameSpeed}
          onChange={(e) => updateSettingPath('cognitive.gameSpeed', parseFloat(e.target.value))}
          className="w-full mt-1"
          aria-label="AI thinking time multiplier"
        />
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
          <span>Slower</span>
          <span>Normal</span>
          <span>Faster</span>
        </div>
      </div>
      
      {/* Status Indicators */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Status Indicators</h3>
        <label className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={settings.indicators.trumpAlwaysVisible}
            onChange={(e) => updateSettingPath('indicators.trumpAlwaysVisible', e.target.checked)}
            className="w-5 h-5"
          />
          <span>Always show trump indicator</span>
        </label>
        <label className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={settings.indicators.largeStatusText}
            onChange={(e) => updateSettingPath('indicators.largeStatusText', e.target.checked)}
            className="w-5 h-5"
          />
          <span>Large status text</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.indicators.multiModalAlerts}
            onChange={(e) => updateSettingPath('indicators.multiModalAlerts', e.target.checked)}
            className="w-5 h-5"
          />
          <span>Multi-modal alerts (visual + audio + haptic)</span>
        </label>
      </div>
    </div>
  );
};

// Comfort Settings Tab
const ComfortSettings: React.FC = () => {
  const { settings, updateSettingPath } = useAccessibility();
  
  return (
    <div className="space-y-6">
      {/* Visual Comfort */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Visual Comfort</h3>
        <label className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={settings.comfort.blueLightFilter}
            onChange={(e) => updateSettingPath('comfort.blueLightFilter', e.target.checked)}
            className="w-5 h-5"
          />
          <span>Blue light filter</span>
        </label>
      </div>
      
      {/* Background Pattern */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Background Pattern</h3>
        <select
          value={settings.comfort.backgroundPattern}
          onChange={(e) => updateSettingPath('comfort.backgroundPattern', e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="none">None</option>
          <option value="subtle">Subtle texture</option>
          <option value="dots">Dots</option>
          <option value="lines">Lines</option>
        </select>
      </div>
      
      {/* Table Felt */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Table Felt Color</h3>
        <div className="grid grid-cols-3 gap-3">
          {['green', 'blue', 'red', 'gray', 'high-contrast'].map((color) => (
            <button
              key={color}
              onClick={() => updateSettingPath('comfort.tableFelt', color)}
              className={`p-3 rounded-lg border-2 transition-all capitalize
                        ${settings.comfort.tableFelt === color 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}
            >
              {color.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>
      
      {/* Card Backs */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Card Back Design</h3>
        <div className="grid grid-cols-2 gap-3">
          {['default', 'high-contrast', 'pattern1', 'pattern2'].map((design) => (
            <button
              key={design}
              onClick={() => updateSettingPath('comfort.cardBacks', design)}
              className={`p-3 rounded-lg border-2 transition-all capitalize
                        ${settings.comfort.cardBacks === design 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}
            >
              {design.replace(/(\d)/, ' $1')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
