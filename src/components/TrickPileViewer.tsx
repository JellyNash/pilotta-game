import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trick, Suit } from '../core/types';
import Card from './Card';
import './TrickPileViewer.css';

interface TrickPileViewerProps {
  tricks: Trick[];
  teamId: 'A' | 'B';
  onClose: () => void;
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

const TrickPileViewer: React.FC<TrickPileViewerProps> = ({ tricks, teamId, onClose }) => {
  // Show the most recent trick in this team's pile
  const lastTrick = tricks.length > 0 ? tricks[tricks.length - 1] : null;
  
  // Use useEffect to handle closing when there's no trick to show
  React.useEffect(() => {
    if (!lastTrick) {
      onClose();
    }
  }, [lastTrick, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  if (!lastTrick) {
    return null;
  }
  
  const totalPoints = tricks.reduce((sum, trick) => sum + trick.points, 0);
  
  // Find human player in the trick
  const humanCard = lastTrick.cards.find(tc => !tc.player.isAI);
  const humanPlayer = humanCard?.player;
  
  // Reorganize cards for display - human always at bottom
  const getCardPosition = (trickCard: typeof lastTrick.cards[0]) => {
    if (trickCard.player.id === humanPlayer?.id) {
      return 'bottom'; // Human always at bottom
    }
    
    // If human is in the trick, arrange others relative to human
    if (humanPlayer) {
      const humanTeamId = humanPlayer.teamId;
      const cardTeamId = trickCard.player.teamId;
      
      // Partner goes to top
      if (cardTeamId === humanTeamId) {
        return 'top';
      }
      
      // Opponents go to sides based on their position relative to human
      const humanPos = humanPlayer.position;
      const cardPos = trickCard.player.position;
      
      // Simple position mapping
      const positionMap: Record<string, Record<string, string>> = {
        'south': { 'north': 'top', 'east': 'right', 'west': 'left' },
        'north': { 'south': 'top', 'west': 'right', 'east': 'left' },
        'east': { 'west': 'top', 'south': 'right', 'north': 'left' },
        'west': { 'east': 'top', 'north': 'right', 'south': 'left' }
      };
      
      return positionMap[humanPos]?.[cardPos] || 'top';
    }
    
    // Fallback to original positions if no human player
    const position = trickCard.player.position;
    return position === 'south' ? 'bottom' : 
           position === 'north' ? 'top' : 
           position === 'east' ? 'right' : 'left';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="tpv-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="tpv-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal header */}
        <div className="tpv-header">
          <div className="tpv-title">
            <span className={`tpv-team-indicator ${teamId === 'A' ? 'team-a' : 'team-b'}`}>
              Team {teamId}
            </span>
            <span className="tpv-points">{lastTrick.points} pts</span>
            <span className="tpv-total">Total: {totalPoints}</span>
          </div>
          <button
            onClick={onClose}
            className="tpv-close"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 5L5 15M5 5l10 10" />
            </svg>
          </button>
        </div>
        
        {/* Main content */}
        <div className="tpv-body">
          {/* Cross layout container */}
          <div
            className="tpv-cross-container"
            style={{
              '--card-width': 'var(--trick-pile-card-size)',
              '--card-height': 'var(--trick-pile-card-size)'
            } as React.CSSProperties}
          >
            {/* Center table decoration */}
            <div className="tpv-table-center">
              <div className="tpv-table-circle" />
              <div className="tpv-center-info">
                <span className={`tpv-suit ${lastTrick.leadSuit === Suit.Hearts || lastTrick.leadSuit === Suit.Diamonds ? 'red' : 'black'}`}>
                  {getSuitSymbol(lastTrick.leadSuit)}
                </span>
              </div>
            </div>
            
            {/* Cards in cross formation */}
            {lastTrick.cards.map((trickCard, index) => {
              const isWinner = trickCard.player.id === lastTrick.winner?.id;
              const position = getCardPosition(trickCard);
              
              return (
                <motion.div
                  key={trickCard.player.id}
                  className={`tpv-card-position tpv-${position}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: index * 0.08,
                    type: "spring",
                    damping: 20,
                    stiffness: 300
                  }}
                >
                  {/* Card container */}
                  <div className={`tpv-card-container ${isWinner ? 'winner' : ''}`}>
                    {/* Play order number */}
                    <div className="tpv-play-order">{index + 1}</div>
                    
                    {/* Winner glow effect */}
                    {isWinner && (
                      <motion.div
                        className="tpv-winner-glow"
                        animate={{ 
                          opacity: [0.4, 0.7, 0.4]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                    
                    {/* The card */}
                    <div className="tpv-card">
                      <Card
                        card={trickCard.card}
                        faceDown={false}
                        size="medium"
                      />
                    </div>
                    
                    {/* Minimal winner indicator */}
                    {isWinner && (
                      <motion.div 
                        className="tpv-winner-indicator"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          delay: 0.3,
                          type: "spring",
                          damping: 15
                        }}
                      >
                        W
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TrickPileViewer;