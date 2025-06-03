import React from 'react';
import { gameManager } from '../game/GameManager';
import { AIPersonality } from '../core/types';

const StartScreen: React.FC = () => {
  const [targetScore, setTargetScore] = React.useState(151);
  const [aiDifficulty, setAiDifficulty] = React.useState<'easy' | 'normal' | 'hard'>('normal');
  const [enableMCTS, setEnableMCTS] = React.useState(false);

  const handleStart = () => {
    // Configure AI based on difficulty
    const aiPersonalities: Record<string, AIPersonality[]> = {
      easy: [AIPersonality.Conservative, AIPersonality.Conservative, AIPersonality.Conservative],
      normal: [AIPersonality.Balanced, AIPersonality.Conservative, AIPersonality.Aggressive],
      hard: [AIPersonality.Adaptive, AIPersonality.Balanced, AIPersonality.Adaptive]
    };

    // Set AI personalities for the 3 AI players
    const gameState = gameManager.getGameState();
    const aiPlayers = gameState.players.filter(p => p.isAI);
    const personalities = aiPersonalities[aiDifficulty];
    
    aiPlayers.forEach((player, index) => {
      gameManager.setAIPersonality(player.id, personalities[index]);
    });

    // Enable MCTS for hard difficulty
    gameManager.enableAdvancedAI(aiDifficulty === 'hard' || enableMCTS);

    // Start the game
    gameManager.startNewGame(targetScore);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        <h1 className="text-4xl font-bold text-center mb-2 text-white">
          Pilotta
        </h1>
        <p className="text-center text-slate-400 mb-8">
          The Classic Cypriot Card Game
        </p>

        <div className="space-y-6">
          {/* Target Score */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Target Score
            </label>
            <select
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={151}>151 Points (Standard)</option>
              <option value={101}>101 Points (Quick)</option>
              <option value={201}>201 Points (Long)</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Round points are divided by 10 and rounded up
            </p>
          </div>

          {/* AI Difficulty */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              AI Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'normal', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setAiDifficulty(level)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    aiDifficulty === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced AI Toggle */}
          <div className="flex items-center justify-between">
            <label htmlFor="mcts-toggle" className="text-sm font-medium text-slate-300">
              Enable Advanced AI (MCTS)
            </label>
            <button
              id="mcts-toggle"
              onClick={() => setEnableMCTS(!enableMCTS)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enableMCTS ? 'bg-blue-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableMCTS ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Difficulty Description */}
          <div className="bg-slate-700/50 rounded-lg p-4 text-sm text-slate-300">
            {aiDifficulty === 'easy' && (
              <p>AI players make conservative bids and basic plays. Good for beginners.</p>
            )}
            {aiDifficulty === 'normal' && (
              <p>AI players use mixed strategies and make reasonable decisions.</p>
            )}
            {aiDifficulty === 'hard' && (
              <p>AI players adapt to your play style and use advanced strategies.</p>
            )}
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transform transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Start Game
          </button>
        </div>

        {/* Rules Link */}
        <div className="mt-6 text-center">
          <button className="text-sm text-blue-400 hover:text-blue-300 underline">
            How to Play
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
