import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrickCard } from '../core/types';
import Card from './Card';
import { useAppSelector } from '../store/hooks';

interface TrickAreaProps {
  currentTrick: TrickCard[];
  isDropActive?: boolean;
  trickWinner?: string; // Winner's position for exit animation
}

const TrickArea: React.FC<TrickAreaProps> = ({ currentTrick, isDropActive, trickWinner }) => {
  const cardSize = useAppSelector(state => state.game.settings?.cardSize || 'medium');
  
  
  
  // Get initial position based on player position
  const getInitialPosition = (position: string) => {
    switch (position) {
      case 'north': return { x: 0, y: -200 };
      case 'south': return { x: 0, y: 200 };
      case 'east': return { x: 200, y: 0 };
      case 'west': return { x: -200, y: 0 };
      default: return { x: 0, y: 0 };
    }
  };
  
  // Get exit position for collecting tricks
  const getExitPosition = () => {
    // Cards exit towards the winner's position
    switch (trickWinner) {
      case 'north': return { x: 0, y: -300, rotate: 180 };
      case 'south': return { x: 0, y: 300, rotate: 0 };
      case 'east': return { x: 300, y: 0, rotate: -90 };
      case 'west': return { x: -300, y: 0, rotate: 90 };
      default: return { x: 0, y: 0, rotate: 0 };
    }
  };
  
  // Position cards in a diamond pattern
  const getCardPosition = (order: number) => {
    const positions = [
      { x: 0, y: -60 },    // North
      { x: 60, y: 0 },     // East
      { x: 0, y: 60 },     // South
      { x: -60, y: 0 }     // West
    ];
    
    // Map player positions to trick order
    const positionMap: Record<string, number> = {
      'south': 2,
      'west': 3,
      'north': 0,
      'east': 1
    };

    // Find the position based on the player who played the card
    const trickCard = currentTrick[order];
    if (trickCard) {
      const posIndex = positionMap[trickCard.player.position];
      return positions[posIndex];
    }
    
    return positions[order] || { x: 0, y: 0 };
  };

  return (
    <div 
      className="relative w-48 h-48 flex items-center justify-center"
    >
      {/* Drop zone indicator */}
      <motion.div
        className={`
          absolute inset-0 rounded-full border-4 border-dashed transition-all
          ${isDropActive 
            ? 'border-green-400 bg-green-400/10 scale-110' 
            : 'border-slate-600/30 scale-100'
          }
        `}
        animate={{
          scale: isDropActive ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 0.5,
          repeat: isDropActive ? Infinity : 0,
        }}
      />

      {/* Center decoration */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-slate-700/20 backdrop-blur-sm" />
      </div>

      {/* Cards */}
      <AnimatePresence mode="sync">
        {currentTrick.map((trickCard, index) => {
          const position = getCardPosition(index);
          
          return (
            <motion.div
              key={`${trickCard.card.id}-${index}`}
              className="absolute"
              initial={{ 
                scale: 0.8,
                rotate: 0,
                ...getInitialPosition(trickCard.player.position),
                opacity: 0
              }}
              animate={{ 
                scale: 1,
                rotate: 0,
                x: position.x,
                y: position.y,
                opacity: 1
              }}
              exit={{
                scale: 0.5,
                ...getExitPosition(),
                opacity: 0,
                transition: { 
                  duration: 0.8,
                  ease: "easeInOut",
                  delay: index * 0.05
                }
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: index * 0.1,
                duration: 0.4
              }}
            >
              <Card
                card={trickCard.card}
                size={cardSize as 'small' | 'medium' | 'large' | 'xlarge'}
                className="shadow-2xl"
              />
              
              {/* Player indicator */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <div 
                  className="bg-slate-800/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                >
                  {trickCard.player.name}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Play instruction when it's human's turn */}
      {currentTrick.length === 0 && isDropActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <p className="text-green-400 font-medium">
            Drop card here
          </p>
        </motion.div>
      )}
      
    </div>
  );
};

export default TrickArea;
