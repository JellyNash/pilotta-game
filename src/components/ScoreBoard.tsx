import React, { useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { useAccessibility } from '../accessibility';

const ScoreBoard: React.FC = () => {
  const { settings, announceToScreenReader } = useAccessibility();
  const teams = useAppSelector(state => state.game.teams);
  const round = useAppSelector(state => state.game.round);
  const targetScore = useAppSelector(state => state.game.targetScore);
  const contract = useAppSelector(state => state.game.contract);
  const trumpSuit = useAppSelector(state => state.game.trumpSuit);
  
  // Announce score changes
  useEffect(() => {
    if (teams.A.roundScore > 0 || teams.B.roundScore > 0) {
      announceToScreenReader(
        `Current scores: Team A ${teams.A.score}, Team B ${teams.B.score}`
      );
    }
  }, [teams.A.score, teams.B.score, teams.A.roundScore, teams.B.roundScore, announceToScreenReader]);

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
    if (settings.theme === 'colorblind-safe' || settings.colorblindMode !== 'none') {
      return `suit-${suit}`;
    }
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-slate-900';
  };

  return (
    <div 
      id="score"
      className="flex items-center justify-between w-full max-w-6xl mx-auto"
      role="region"
      aria-label="Scoreboard"
      aria-live="polite"
    >
      {/* Team A Score */}
      <div className="flex items-center space-x-4">
        <div className="text-center" role="group" aria-label="Team A score">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Team A</p>
          <p className="text-2xl font-bold text-white" aria-label={`Team A score: ${teams.A.score} points`}>
            {teams.A.score}
          </p>
          {teams.A.roundScore > 0 && (
            <p className="text-sm text-green-400" aria-label={`Round score: plus ${teams.A.roundScore}`}>
              +{teams.A.roundScore}
            </p>
          )}
        </div>
      </div>

      {/* Center Info */}
      <div className="flex items-center space-x-6">
        {/* Round Info */}
        <div className="text-center" role="group" aria-label="Round information">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Round</p>
          <p className="text-xl font-semibold text-white" aria-label={`Round ${round}`}>
            {round}
          </p>
        </div>

        {/* Contract Info */}
        {contract && (
          <div 
            className="text-center bg-slate-800/50 px-4 py-2 rounded-lg"
            role="group"
            aria-label="Current contract"
          >
            <p className="text-xs text-slate-400 uppercase tracking-wide">Contract</p>
            <div className="flex items-center space-x-2">
              <p className="text-lg font-semibold text-white" aria-label={`Contract value: ${contract.value}`}>
                {contract.value}
              </p>
              {trumpSuit && (
                <span 
                  className={`text-2xl ${getSuitColor(trumpSuit)} ${settings.indicators.suitPatterns ? `suit-pattern-${trumpSuit}` : ''}`}
                  aria-label={`Trump suit: ${getSuitName(trumpSuit)}`}
                >
                  {getSuitSymbol(trumpSuit)}
                </span>
              )}
              {contract.doubled && !contract.redoubled && (
                <span className="text-xs bg-orange-500 text-white px-1 rounded" aria-label="Doubled">
                  2x
                </span>
              )}
              {contract.redoubled && (
                <span className="text-xs bg-red-500 text-white px-1 rounded" aria-label="Redoubled">
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
        <div className="text-center" role="group" aria-label="Target score">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Target</p>
          <p className="text-xl font-semibold text-white" aria-label={`Target score: ${targetScore} points`}>
            {targetScore}
          </p>
        </div>
      </div>

      {/* Team B Score */}
      <div className="flex items-center space-x-4">
        <div className="text-center" role="group" aria-label="Team B score">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Team B</p>
          <p className="text-2xl font-bold text-white" aria-label={`Team B score: ${teams.B.score} points`}>
            {teams.B.score}
          </p>
          {teams.B.roundScore > 0 && (
            <p className="text-sm text-green-400" aria-label={`Round score: plus ${teams.B.roundScore}`}>
              +{teams.B.roundScore}
            </p>
          )}
        </div>
      </div>
      
      {/* Screen reader status summary */}
      <div className="sr-only" role="status" aria-live="assertive">
        Game status: Round {round}. 
        Team A has {teams.A.score} points. 
        Team B has {teams.B.score} points. 
        Target score is {targetScore}.
        {contract && `Current contract: ${contract.value} ${trumpSuit ? getSuitName(trumpSuit) : ''} by Team ${contract.team}.`}
      </div>
    </div>
  );
};

export default ScoreBoard;
