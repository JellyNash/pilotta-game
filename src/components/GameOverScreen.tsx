import React from 'react';
import { useAppSelector } from '../store/hooks';
import { gameManager } from '../game/GameManager';

const GameOverScreen: React.FC = () => {
  const teams = useAppSelector(state => state.game.teams);
  const targetScore = useAppSelector(state => state.game.targetScore);
  
  const winner = teams.A.score >= targetScore ? 'A' : 'B';
  const winnerScore = teams[winner].score;
  const loserScore = teams[winner === 'A' ? 'B' : 'A'].score;
  const isHumanWinner = winner === 'A'; // Human is always on team A

  const handleNewGame = () => {
    gameManager.startNewGame(targetScore);
  };

  const handleBackToMenu = () => {
    window.location.reload(); // Simple way to go back to start screen
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="text-center">
          {/* Victory/Defeat Animation */}
          <div className={`mb-6 ${isHumanWinner ? 'text-green-400' : 'text-red-400'}`}>
            <div className="text-6xl mb-2">
              {isHumanWinner ? '🏆' : '😔'}
            </div>
            <h1 className="text-4xl font-bold">
              {isHumanWinner ? 'Victory!' : 'Defeat'}
            </h1>
          </div>

          {/* Score Display */}
          <div className="bg-slate-700/50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-300">Final Score</h2>
            
            <div className="flex justify-between items-center mb-4">
              <div className={`text-lg ${winner === 'A' ? 'text-green-400' : 'text-slate-400'}`}>
                <p className="font-medium">Team A (You & Partner)</p>
                <p className="text-3xl font-bold">{teams.A.score}</p>
              </div>
              
              <div className="text-slate-500 text-2xl">vs</div>
              
              <div className={`text-lg text-right ${winner === 'B' ? 'text-green-400' : 'text-slate-400'}`}>
                <p className="font-medium">Team B (Opponents)</p>
                <p className="text-3xl font-bold">{teams.B.score}</p>
              </div>
            </div>

            <div className="text-sm text-slate-400 pt-4 border-t border-slate-600">
              <p>Target Score: {targetScore}</p>
              <p>Score Difference: {Math.abs(winnerScore - loserScore)} points</p>
            </div>
          </div>

          {/* Game Summary */}
          <div className="text-slate-300 mb-6">
            {isHumanWinner ? (
              <p>Congratulations! You and your partner played brilliantly!</p>
            ) : (
              <p>Better luck next time! Keep practicing to improve your strategy.</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleNewGame}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transform transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Play Again
            </button>
            
            <button
              onClick={handleBackToMenu}
              className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
