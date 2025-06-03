import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { injectTestHands, testScenarios } from '../utils/testScenarios';
import { dealCards, startBidding, makeBid, startPlaying } from '../store/gameSlice';
import { Suit } from '../core/types';

const DevTools: React.FC = () => {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector(state => state.game);
  const [showDevTools, setShowDevTools] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<'strong' | 'medium' | 'weak' | 'mixed'>('mixed');

  const applyTestScenario = () => {
    // Create a copy of current hands structure
    const playerHands: Record<string, any[]> = {};
    
    // Create a mock state to inject hands into
    const mockState = { players: gameState.players.map(p => ({ ...p })) };
    
    // Inject test hands
    const updatedState = injectTestHands(mockState, selectedScenario);
    
    // Extract hands for each player
    updatedState.players.forEach((player, index) => {
      playerHands[player.id] = player.hand;
    });
    
    // Dispatch deal cards with test hands
    dispatch(dealCards({ playerHands }));
    
    // Auto-complete bidding phase to get to declarations
    setTimeout(() => {
      dispatch(startBidding());
      
      // Make a simple bid to establish contract
      setTimeout(() => {
        const firstPlayer = gameState.players[1]; // AI player
        dispatch(makeBid({ 
          playerId: firstPlayer.id, 
          bid: 100, 
          trump: Suit.Hearts 
        }));
        
        // Pass for other players
        setTimeout(() => {
          for (let i = 0; i < 3; i++) {
            const playerIndex = (2 + i) % 4;
            dispatch(makeBid({ 
              playerId: gameState.players[playerIndex].id, 
              bid: 'pass' 
            }));
          }
        }, 100);
      }, 100);
    }, 100);
  };

  const skipToTrick = (trickNumber: number) => {
    // This would require more complex state manipulation
    // For now, just log the intention
    console.log(`Skip to trick ${trickNumber} - requires manual play through`);
  };

  if (!showDevTools) {
    return (
      <button
        onClick={() => setShowDevTools(true)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
      >
        Dev Tools
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border border-purple-600 rounded-lg p-4 shadow-xl max-w-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-purple-400 font-bold">Declaration Test Tools</h3>
        <button
          onClick={() => setShowDevTools(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3">
        {/* Scenario selector */}
        <div>
          <label className="text-sm text-gray-300 block mb-1">Test Scenario</label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value as any)}
            className="w-full bg-slate-800 text-white rounded px-2 py-1 text-sm"
          >
            <option value="strong">Strong vs Weak (Team A wins)</option>
            <option value="medium">Medium declarations (close match)</option>
            <option value="weak">Weak/No declarations</option>
            <option value="mixed">Mixed (various declarations)</option>
          </select>
        </div>
        
        {/* Apply scenario button */}
        <button
          onClick={applyTestScenario}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-sm font-medium"
        >
          Apply Test Scenario
        </button>
        
        {/* Current state info */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>Phase: {gameState.phase}</p>
          <p>Trick: {gameState.trickNumber}/8</p>
          <p>Current Player: {gameState.players[gameState.currentPlayerIndex]?.name}</p>
        </div>
        
        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => skipToTrick(1)}
            className="bg-slate-700 hover:bg-slate-600 text-white py-1 rounded text-xs"
          >
            Trick 1
          </button>
          <button
            onClick={() => skipToTrick(2)}
            className="bg-slate-700 hover:bg-slate-600 text-white py-1 rounded text-xs"
          >
            Trick 2
          </button>
          <button
            onClick={() => skipToTrick(3)}
            className="bg-slate-700 hover:bg-slate-600 text-white py-1 rounded text-xs"
          >
            Trick 3
          </button>
        </div>
        
        {/* Test scenarios list */}
        <div className="border-t border-slate-700 pt-2">
          <p className="text-xs text-gray-300 mb-1">Test Scenarios:</p>
          <div className="text-xs text-gray-500 space-y-1 max-h-32 overflow-y-auto">
            {testScenarios.map((scenario, index) => (
              <div key={index} className="pb-1">
                <p className="text-purple-400">{scenario.name}</p>
                <p className="text-gray-600 text-xs">{scenario.setup}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevTools;
