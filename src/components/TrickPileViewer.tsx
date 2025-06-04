import React from 'react';
import { motion } from 'framer-motion';
import { Trick, Suit } from '../core/types';
import Card from './Card';
import './TrickPileViewer.css';

interface TrickPileViewerProps {
  tricks: Trick[];
  teamId: 'A' | 'B';
  onClose: () => void;
  currentTrickNumber: number;
  isLastTrickPile?: boolean;
}

const getSuitSymbol = (suit: Suit): string => {
  const symbols = {
    [Suit.Hearts]: '♥',
    [Suit.Diamonds]: '♦',
    [Suit.Clubs]: '♣',
    [Suit.Spades]: '♠'
  };
  return symbols[suit];
};

const TrickPileViewer: React.FC<TrickPileViewerProps> = ({ tricks, teamId, onClose, currentTrickNumber, isLastTrickPile = false }) => {
  // Show the most recent trick in this team's pile
  const lastTrick = tricks.length > 0 ? tricks[tricks.length - 1] : null;
  
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700/50 max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${
          teamId === 'A' ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-red-600 to-red-700'
        } px-6 py-4 flex justify-between items-center rounded-t-3xl`}>
          <h2 className="text-2xl font-bold text-white">
            {isLastTrickPile ? 'Previous Trick' : `Last Trick Won by Team ${teamId}`}
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
        
        {/* Cards display in cross layout */}
        <div className="p-8">
          <div className="trick-viewer-container">
            {/* Table background circle */}
            <div className="trick-table-circle" />
            
            {/* Cards positioned using center-based layout */}
            {lastTrick.cards.map((trickCard, index) => {
              const isWinner = trickCard.player.id === lastTrick.winner?.id;
              const playerPosition = trickCard.player.position;
              
              return (
                <motion.div
                  key={index}
                  className={`trick-card-position ${playerPosition}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="trick-card-wrapper">
                    {/* Player name */}
                    <div className={`text-sm font-medium ${isWinner ? 'text-yellow-400' : 'text-slate-400'}`}>
                      {trickCard.player.name}
                    </div>
                    
                    {/* Card with winner glow */}
                    <div className={`relative ${isWinner ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-900 rounded-lg' : ''}`}>
                      <Card
                        card={trickCard.card}
                        faceDown={false}
                        size="large"
                      />
                      {isWinner && (
                        <motion.div
                          className="absolute -inset-2 bg-yellow-400/20 rounded-lg -z-10"
                          animate={{ opacity: [0.5, 0.8, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>
                    
                    {/* Winner badge */}
                    {isWinner && (
                      <motion.div 
                        className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        WINNER
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
            
            {/* Center info */}
            <div className="trick-viewer-center">
              <div className="trick-center-info">
                <div className="text-sm text-slate-400 mb-1">Lead Suit</div>
                <div className={`text-4xl mb-2 ${
                  lastTrick.leadSuit === Suit.Hearts || lastTrick.leadSuit === Suit.Diamonds 
                    ? 'text-red-500' 
                    : 'text-gray-900'
                }`}>
                  {getSuitSymbol(lastTrick.leadSuit)}
                </div>
                <div className={`text-2xl font-bold ${
                  teamId === 'A' ? 'text-blue-400' : 'text-red-400'
                }`}>
                  {lastTrick.points} pts
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TrickPileViewer;
