import React from 'react';
import { motion } from 'framer-motion';
import { Trick, Suit } from '../core/types';
import Card from './Card';

interface TrickPileViewerProps {
  tricks: Trick[];
  teamId: 'A' | 'B';
  onClose: () => void;
  currentTrickNumber: number;
}

const TrickPileViewer: React.FC<TrickPileViewerProps> = ({ tricks, teamId, onClose, currentTrickNumber }) => {
  // Only show the last trick (previous trick to the current one)
  const previousTrickIndex = currentTrickNumber - 2; // -2 because currentTrickNumber is 1-based and we want previous
  const lastTrick = previousTrickIndex >= 0 && previousTrickIndex < tricks.length ? tricks[previousTrickIndex] : null;
  
  // Use useEffect to handle closing when there's no trick to show
  React.useEffect(() => {
    if (!lastTrick) {
      onClose();
    }
  }, [lastTrick, onClose]);
  
  if (!lastTrick) {
    return null;
  }
  
  const totalPoints = tricks.reduce((sum, trick) => sum + trick.points, 0);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${
          teamId === 'A' ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-red-600 to-red-700'
        } px-6 py-4 flex justify-between items-center`}>
          <h2 className="text-2xl font-bold text-white">
            Previous Trick (Trick {previousTrickIndex + 1})
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-white">
              <span className="text-sm opacity-80">Total Points:</span>
              <span className="text-2xl font-bold ml-2">{totalPoints}</span>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Single trick display */}
        <div className="p-6">
          <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-700/50 rounded-xl p-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    Trick {previousTrickIndex + 1}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">
                      Lead: {getSuitSymbol(lastTrick.leadSuit)}
                    </span>
                    <span className="text-sm text-slate-400">
                      Winner: {lastTrick.winner?.name}
                    </span>
                    <span className={`text-sm font-bold ${
                      teamId === 'A' ? 'text-blue-400' : 'text-red-400'
                    }`}>
                      {lastTrick.points} pts
                    </span>
                  </div>
                </div>
                
                {/* Cards in trick */}
                <div className="grid grid-cols-4 gap-3">
                  {lastTrick.cards.map((trickCard, cardIndex) => (
                    <div key={cardIndex} className="text-center">
                      <div className="text-xs text-slate-400 mb-1">
                        {trickCard.player.name}
                      </div>
                      <div className="flex justify-center">
                        <div className="transform scale-75">
                          <Card
                            card={trickCard.card}
                            faceUp={true}
                            size="small"
                            disabled={true}
                          />
                        </div>
                      </div>
                      {trickCard.player.id === lastTrick.winner?.id && (
                        <div className="text-xs text-green-400 mt-1">Winner</div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Helper function to get suit symbol
const getSuitSymbol = (suit: Suit): string => {
  switch (suit) {
    case Suit.Hearts:
      return '♥';
    case Suit.Diamonds:
      return '♦';
    case Suit.Clubs:
      return '♣';
    case Suit.Spades:
      return '♠';
    default:
      return '';
  }
};

export default TrickPileViewer;
