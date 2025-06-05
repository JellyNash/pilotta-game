import React, { useEffect } from 'react';
import { useAppSelector } from '../store/hooks';

const ScoreBoard: React.FC = () => {
  const teams = useAppSelector(state => state.game.teams);
  const round = useAppSelector(state => state.game.round);
  const targetScore = useAppSelector(state => state.game.targetScore);
  const contract = useAppSelector(state => state.game.contract);
  const trumpSuit = useAppSelector(state => state.game.trumpSuit);
  

  const getSuitSymbol = (suit: string) => {
    const symbols: Record<string, string> = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠'
    };
    return symbols[suit] || '';
  };

  const getSuitName = (suit: string) => {
    const names: Record<string, string> = {
      hearts: 'Hearts',
      diamonds: 'Diamonds',
      clubs: 'Clubs',
      spades: 'Spades'
    };
    return names[suit] || suit;
  };

  const getSuitColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-slate-900';
  };

  return (
    <div 
      id="score"
      className="flex items-center justify-between w-full max-w-6xl mx-auto"
    >
      {/* Team A Score */}
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Team A</p>
          <p className="text-2xl font-bold text-white">
            {teams.A.score}
          </p>
          {teams.A.roundScore > 0 && (
            <p className="text-sm text-green-400">
              +{teams.A.roundScore}
            </p>
          )}
        </div>
      </div>

      {/* Center Info */}
      <div className="flex items-center space-x-6">
        {/* Round Info */}
        <div className="text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Round</p>
          <p className="text-xl font-semibold text-white">
            {round}
          </p>
        </div>

        {/* Contract Info */}
        {contract && (
          <div 
            className="text-center bg-slate-800/50 px-4 py-2 rounded-lg"
          >
            <p className="text-xs text-slate-400 uppercase tracking-wide">Contract</p>
            <div className="flex items-center space-x-2">
              <p className="text-lg font-semibold text-white">
                {contract.value}
              </p>
              {trumpSuit && (
                <span 
                  className={`text-2xl ${getSuitColor(trumpSuit)}`}
                >
                  {getSuitSymbol(trumpSuit)}
                </span>
              )}
              {contract.doubled && !contract.redoubled && (
                <span className="text-xs bg-orange-500 text-white px-1 rounded">
                  2x
                </span>
              )}
              {contract.redoubled && (
                <span className="text-xs bg-red-500 text-white px-1 rounded">
                  4x
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              by Team {contract.team}
            </p>
          </div>
        )}

        {/* Target Score */}
        <div className="text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Target</p>
          <p className="text-xl font-semibold text-white">
            {targetScore}
          </p>
        </div>
      </div>

      {/* Team B Score */}
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Team B</p>
          <p className="text-2xl font-bold text-white">
            {teams.B.score}
          </p>
          {teams.B.roundScore > 0 && (
            <p className="text-sm text-green-400">
              +{teams.B.roundScore}
            </p>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default ScoreBoard;
