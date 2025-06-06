import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { startNextRound } from './store/gameSlice';
import { GamePhase } from './core/types';
import { gameManager } from './game/GameManager';
import GameTable from './components/GameTable';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import ScoreBoard from './components/ScoreBoard';
import BiddingInterface from './components/BiddingInterface';
import DoubleRedoubleButtons from './components/DoubleRedoubleButtons';
import RoundTransitionScreen from './components/RoundTransitionScreen';
import ScoreBreakdown from './components/ScoreBreakdown';
import Settings from './components/Settings';
import Tutorial from './components/Tutorial';
import VictoryCelebration from './components/VictoryCelebration';
import DetailedScoreboard from './components/DetailedScoreboard';
import DevTools from './components/DevTools';
import { AccessibilityProvider, KeyboardHelp, AccessibilitySettings } from './accessibility';
import './App.css';

// Detect if device supports touch
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const DndBackend = isTouchDevice ? TouchBackend : HTML5Backend;

// Migration function for old localStorage keys
function migrateSettings() {
  const migrations = {
    'cardScale': 'southCardScale',
    'southCardSize': 'southCardScale',
    'aiCardSize': 'otherCardScale',
    'aiCardSpacing': 'otherCardSpacing'
  };
  
  Object.entries(migrations).forEach(([oldKey, newKey]) => {
    const value = localStorage.getItem(oldKey);
    if (value && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, value);
      localStorage.removeItem(oldKey);
    }
  });
}

// Inner component with game logic
function GameContent() {
  const dispatch = useAppDispatch();
  const gamePhase = useAppSelector(state => state.game.phase);
  const round = useAppSelector(state => state.game.round);
  const gameStarted = gamePhase !== GamePhase.GameOver && gamePhase !== GamePhase.Dealing || round > 1;
  const contract = useAppSelector(state => state.game.contract);
  const lastRoundScore = useAppSelector(state => state.game.lastRoundScore);
  const winner = useAppSelector(state => {
    const scores = state.game.scores;
    if (gamePhase === GamePhase.GameOver) {
      return scores.team1 > scores.team2 ? 'team1' : 'team2';
    }
    return null;
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [showRoundTransition, setShowRoundTransition] = useState(false);
  const [showDetailedScoreboard, setShowDetailedScoreboard] = useState(false);
  const [showVictoryCelebration, setShowVictoryCelebration] = useState<'victory' | 'defeat' | 'contract-made' | null>(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);

  // Prevent right-click context menu globally
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Allow right-click only on playing cards that are not face down
      const target = e.target as HTMLElement;
      const cardElement = target.closest('.playing-card');
      
      if (!cardElement || cardElement.getAttribute('data-face-down') === 'true') {
        e.preventDefault();
      }
      // Card component will handle its own right-click behavior
    };

    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    // Run migrations on mount
    migrateSettings();
    
    // Initialize game manager on mount
    gameManager.setAnimationSpeed('normal');
    
    const handleCloseModals = () => {
      setShowSettings(false);
      setShowTutorial(false);
      setShowScoreBreakdown(false);
      setShowDetailedScoreboard(false);
      setShowKeyboardHelp(false);
      setShowAccessibilitySettings(false);
    };
    
    window.addEventListener('close-modals', handleCloseModals);
    
    // Keyboard shortcut for help
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setShowKeyboardHelp(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('close-modals', handleCloseModals);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Track if we've shown scoreboards for current scoring phase
  const [scoreboardsShownForRound, setScoreboardsShownForRound] = useState<number | null>(null);

  // Show round transition when scoring phase starts
  useEffect(() => {
    // Only show scoreboards during Scoring phase, and only once per round
    if (gamePhase === GamePhase.Scoring && lastRoundScore) {
      // Check if this is a new scoring phase we haven't shown scoreboards for
      const scoringKey = `${round}-${Date.now()}`;
      if (scoreboardsShownForRound !== round) {
        setShowRoundTransition(true);
        setScoreboardsShownForRound(round);
        // Contract success is already shown in RoundTransitionScreen
      }
    }
  }, [gamePhase, lastRoundScore, round, scoreboardsShownForRound]);

  // FEATURE LOGIC: Automatically show the detailed scoreboard during scoring phase with a 1s delay, then hide after 4s (total 5s).
  useEffect(() => {
    // Only show during Scoring phase, not during other phases
    if (gamePhase === GamePhase.Scoring && lastRoundScore && scoreboardsShownForRound !== round) {
      const showTimer = setTimeout(() => {
        setShowDetailedScoreboard(true);
      }, 1000);
      const hideTimer = setTimeout(() => {
        setShowDetailedScoreboard(false);
      }, 5000); // 1s delay then visible for 4s

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [gamePhase, lastRoundScore, round, scoreboardsShownForRound]);

  // Show victory celebration on game over
  useEffect(() => {
    if (gamePhase === GamePhase.GameOver && winner) {
      const humanTeam = 'team1'; // Assuming human is always team 1
      setShowVictoryCelebration(winner === humanTeam ? 'victory' : 'defeat');
    }
  }, [gamePhase, winner]);

  if (!gameStarted && gamePhase === GamePhase.Dealing) {
    return <StartScreen />;
  }

  if (gamePhase === GamePhase.GameOver) {
    return <GameOverScreen />;
  }

  return (
    <div className="app pilotta-game">
        <DndProvider backend={DndBackend}>
        <div className="game-header">
          <ScoreBoard />
          
          {/* Header buttons */}
          <div className="absolute right-4 top-4 flex space-x-2">
            <button
              onClick={() => setShowDetailedScoreboard(true)}
              className="p-2 bg-purple-700 hover:bg-purple-600 rounded-lg transition-colors"
              title="Full Scoreboard"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              onClick={() => setShowScoreBreakdown(true)}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              title="Score Details"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button
              onClick={() => setShowTutorial(true)}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              title="How to Play"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={() => setShowKeyboardHelp(true)}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              title="Keyboard Shortcuts (Shift+?)"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
              </svg>
            </button>
            <button
              onClick={() => setShowAccessibilitySettings(true)}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              title="Accessibility Settings"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              title="Settings"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        <main className="game-content">
          <GameTable />
          
          {gamePhase === GamePhase.Bidding && (
            <div id="bidding">
              <BiddingInterface />
              <DoubleRedoubleButtons />
            </div>
          )}
        </main>
        
        {/* Modals and overlays */}
        <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
        <Tutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
        <ScoreBreakdown show={showScoreBreakdown} onClose={() => setShowScoreBreakdown(false)} />
        <DetailedScoreboard show={showDetailedScoreboard} onClose={() => setShowDetailedScoreboard(false)} />
        {showRoundTransition && (
          <RoundTransitionScreen 
            onComplete={() => {
              setShowRoundTransition(false);
              // Start next round after modal closes
              if (gamePhase === GamePhase.Scoring) {
                dispatch(startNextRound());
                // GameManager will handle continuing the game flow
                setTimeout(() => gameManager.runGameFlow(), 100);
              }
            }}
          />
        )}
        <VictoryCelebration 
          show={showVictoryCelebration !== null} 
          type={showVictoryCelebration || 'victory'} 
        />
        
        {/* Accessibility modals */}
        <KeyboardHelp isOpen={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />
        <AccessibilitySettings isOpen={showAccessibilitySettings} onClose={() => setShowAccessibilitySettings(false)} />
        
        {/* Development tools - only show in development mode */}
        {process.env.NODE_ENV === 'development' && <DevTools />}
        
        </DndProvider>
    </div>
  );
}

// Main App component
function App() {
  // Initialize card scale from localStorage on mount
  useEffect(() => {
    const root = document.documentElement;
    const savedCardScale = parseFloat(localStorage.getItem('cardScale') || '1');
    root.style.setProperty('--card-scale', savedCardScale.toString());
  }, []);

  return (
    <AccessibilityProvider>
      <GameContent />
    </AccessibilityProvider>
  );
}

export default App;