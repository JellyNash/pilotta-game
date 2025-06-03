import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundSettings } from '../utils/soundManager';
import { gameManager } from '../game/GameManager';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateSettings } from '../store/gameSlice';
import { AccessibilitySettings } from '../accessibility';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const gameSettings = useSelector((state: RootState) => state.game.settings);
  const { enabled: soundEnabled, setEnabled: setSoundEnabled, volume, setVolume } = useSoundSettings();
  const [animationSpeed, setAnimationSpeed] = useState<'fast' | 'normal' | 'slow'>('normal');
  const [advancedAI, setAdvancedAI] = useState(false);
  const [cardSize, setCardSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>(
    (localStorage.getItem('cardSize') as 'small' | 'medium' | 'large' | 'xlarge') || 'large'  // Default to large for low vision
  );
  const [showTrickPilePoints, setShowTrickPilePoints] = useState(gameSettings?.showTrickPilePoints || false);
  const [rightClickZoom, setRightClickZoom] = useState(gameSettings?.rightClickZoom ?? true);
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);

  const handleAnimationSpeedChange = (speed: 'fast' | 'normal' | 'slow') => {
    setAnimationSpeed(speed);
    gameManager.setAnimationSpeed(speed);
  };

  const handleAdvancedAIChange = (enabled: boolean) => {
    setAdvancedAI(enabled);
    gameManager.enableAdvancedAI(enabled);
  };
  
  const handleCardSizeChange = (size: 'small' | 'medium' | 'large' | 'xlarge') => {
    setCardSize(size);
    localStorage.setItem('cardSize', size);
    gameManager.setCardSize(size);
  };

  const handleShowTrickPilePointsChange = (show: boolean) => {
    setShowTrickPilePoints(show);
    dispatch(updateSettings({ showTrickPilePoints: show }));
  };

  const handleRightClickZoomChange = (enabled: boolean) => {
    setRightClickZoom(enabled);
    dispatch(updateSettings({ rightClickZoom: enabled }));
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

          {/* Settings Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-800 shadow-2xl z-50"
          >
            <div className="h-full overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Settings</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Accessibility Settings Button */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Accessibility
                      </h3>
                      <p className="text-sm text-white/90 mt-1">
                        Visual, audio, and input customization options
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAccessibilitySettings(true)}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
                    >
                      Open
                    </button>
                  </div>
                </div>
                {/* Card Size Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Card Size</h3>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-3">Card Display Size</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['small', 'medium', 'large', 'xlarge'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => handleCardSizeChange(size)}
                          className={`
                            py-2 px-4 rounded-lg font-medium capitalize transition-all
                            ${cardSize === size
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }
                          `}
                        >
                          {size === 'xlarge' ? 'Extra Large' : size}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Large or Extra Large recommended for low vision users
                    </p>
                  </div>
                </div>
                
                {/* Card Style Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Card Style</h3>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-3">Visual Card Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['classic', 'modern', 'accessible', 'minimalist'] as const).map((style) => (
                        <button
                          key={style}
                          onClick={() => dispatch(updateSettings({ cardStyle: style }))}
                          className={`
                            py-2 px-4 rounded-lg font-medium capitalize transition-all
                            ${gameSettings?.cardStyle === style
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }
                          `}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Accessible style includes additional symbols for low vision users
                    </p>
                  </div>
                </div>
                {/* Sound Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Sound</h3>
                  
                  <div className="space-y-4">
                    {/* Sound Toggle */}
                    <div className="flex items-center justify-between">
                      <label className="text-slate-300">Sound Effects</label>
                      <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`
                          relative w-14 h-8 rounded-full transition-colors
                          ${soundEnabled ? 'bg-blue-600' : 'bg-slate-600'}
                        `}
                      >
                        <motion.div
                          animate={{ x: soundEnabled ? 24 : 4 }}
                          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                        />
                      </button>
                    </div>

                    {/* Volume Slider */}
                    {soundEnabled && (
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Volume</label>
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume * 100}
                            onChange={(e) => setVolume(Number(e.target.value) / 100)}
                            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-sm text-slate-400 w-10 text-right">
                            {Math.round(volume * 100)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Animation Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Animations</h3>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-3">Animation Speed</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['fast', 'normal', 'slow'] as const).map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleAnimationSpeedChange(speed)}
                          className={`
                            py-2 px-4 rounded-lg font-medium capitalize transition-all
                            ${animationSpeed === speed
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }
                          `}
                        >
                          {speed}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Game Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Game Display</h3>
                  
                  <div className="space-y-4">
                    {/* Show Trick Pile Points Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-slate-300">Show Trick Pile Points</label>
                        <p className="text-sm text-slate-500 mt-1">
                          Display point totals on trick piles
                        </p>
                      </div>
                      <button
                        onClick={() => handleShowTrickPilePointsChange(!showTrickPilePoints)}
                        className={`
                          relative w-14 h-8 rounded-full transition-colors
                          ${showTrickPilePoints ? 'bg-blue-600' : 'bg-slate-600'}
                        `}
                      >
                        <motion.div
                          animate={{ x: showTrickPilePoints ? 24 : 4 }}
                          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                        />
                      </button>
                    </div>

                    {/* Right Click Zoom Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-slate-300">Right-Click Card Zoom</label>
                        <p className="text-sm text-slate-500 mt-1">
                          Right-click any card to zoom 200%
                        </p>
                      </div>
                      <button
                        onClick={() => handleRightClickZoomChange(!rightClickZoom)}
                        className={`
                          relative w-14 h-8 rounded-full transition-colors
                          ${rightClickZoom ? 'bg-blue-600' : 'bg-slate-600'}
                        `}
                      >
                        <motion.div
                          animate={{ x: rightClickZoom ? 24 : 4 }}
                          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">AI Difficulty</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-slate-300">Advanced AI (MCTS)</label>
                        <p className="text-sm text-slate-500 mt-1">
                          Uses Monte Carlo Tree Search for smarter plays
                        </p>
                      </div>
                      <button
                        onClick={() => handleAdvancedAIChange(!advancedAI)}
                        className={`
                          relative w-14 h-8 rounded-full transition-colors
                          ${advancedAI ? 'bg-blue-600' : 'bg-slate-600'}
                        `}
                      >
                        <motion.div
                          animate={{ x: advancedAI ? 24 : 4 }}
                          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                        />
                      </button>
                    </div>
                    
                    {advancedAI && (
                      <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3">
                        <p className="text-sm text-amber-400">
                          ⚠️ Advanced AI may take longer to make decisions
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Game Rules */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Game Rules</h3>
                  
                  <div className="space-y-3 text-sm text-slate-400">
                    <p>• First to reach the target score wins</p>
                    <p>• Trump suit beats all other suits</p>
                    <p>• Must follow suit if possible</p>
                    <p>• Must overtrump if partner isn't winning</p>
                    <p>• Last trick is worth 10 bonus points</p>
                    <p>• Belote (K+Q of trump) is worth 20 points</p>
                  </div>
                </div>

                {/* About */}
                <div className="border-t border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">About</h3>
                  <p className="text-sm text-slate-400">
                    Pilotta is a traditional Cypriot card game. This digital version 
                    features adaptive AI opponents that learn from your playing style.
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Version 1.0.0
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Accessibility Settings Modal */}
          <AccessibilitySettings 
            isOpen={showAccessibilitySettings} 
            onClose={() => setShowAccessibilitySettings(false)} 
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default Settings;
