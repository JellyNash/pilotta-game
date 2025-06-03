import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../store/hooks';
import { Suit } from '../core/types';

interface BeloteIndicatorProps {
  playerId: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

const BeloteIndicator: React.FC<BeloteIndicatorProps> = ({ playerId, position }) => {
  const player = useAppSelector(state => 
    state.game.players.find(p => p.id === playerId)
  );
  const contract = useAppSelector(state => state.game.contract);
  
  if (!player?.hasBelote || !contract) return null;

  const getSuitSymbol = (suit: Suit) => {
    const symbols: Record<Suit, string> = {
      [Suit.Hearts]: '♥',
      [Suit.Diamonds]: '♦',
      [Suit.Clubs]: '♣',
      [Suit.Spades]: '♠'
    };
    return symbols[suit];
  };

  const getSuitColor = (suit: Suit) => {
    return suit === Suit.Hearts || suit === Suit.Diamonds ? 'text-red-500' : 'text-gray-900';
  };

  const positionClasses = {
    top: 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full -mt-2',
    right: 'right-0 top-1/2 transform translate-x-full -translate-y-1/2 ml-2',
    bottom: 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-2',
    left: 'left-0 top-1/2 transform -translate-x-full -translate-y-1/2 -ml-2'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        className={`absolute ${positionClasses[position]} z-30`}
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full px-3 py-1 shadow-lg border-2 border-yellow-300"
        >
          <div className="flex items-center space-x-1">
            <span className="text-sm font-bold text-white">Belote!</span>
            <span className={`text-lg ${getSuitColor(contract.trump)}`}>
              {getSuitSymbol(contract.trump)}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BeloteIndicator;
