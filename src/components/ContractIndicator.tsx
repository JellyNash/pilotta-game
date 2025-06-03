import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../store/hooks';
import { GamePhase, Suit } from '../core/types';

const ContractIndicator: React.FC = () => {
  const phase = useAppSelector(state => state.game.phase);
  const contract = useAppSelector(state => state.game.contract);
  const biddingHistory = useAppSelector(state => state.game.biddingHistory);
  const trumpSuit = useAppSelector(state => state.game.trumpSuit);
  
  const [previousContract, setPreviousContract] = useState<any>(null);
  const [showCrash, setShowCrash] = useState(false);
  
  // Track contract changes for crash animation
  useEffect(() => {
    if (contract && previousContract && 
        (contract.value !== previousContract.value || 
         contract.trump !== previousContract.trump)) {
      setShowCrash(true);
      setTimeout(() => setShowCrash(false), 600);
    }
    setPreviousContract(contract ? { ...contract } : null);
  }, [contract]);
  
  // Get the current winning bid during bidding phase
  const getCurrentBid = () => {
    if (phase === GamePhase.Bidding && contract) {
      return contract;
    }
    return null;
  };
  
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
  
  const currentBid = getCurrentBid();
  
  // Don't show during dealing or if no contract exists
  if (phase === GamePhase.Dealing || (!currentBid && !trumpSuit)) {
    return null;
  }
  
  return (
    <div className="absolute top-4 right-4 z-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentBid?.value}-${currentBid?.trump || trumpSuit}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Main container */}
          <div className="bg-gradient-to-br from-amber-900/90 to-amber-800/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 min-w-[160px]">
            {/* Title */}
            <div className="text-amber-100 text-sm font-semibold mb-2 text-center">
              {phase === GamePhase.Bidding ? 'Current Bid' : 'Contract'}
            </div>
            
            {/* Contract details */}
            <div className="flex items-center justify-center space-x-3">
              {/* Bid value */}
              <div className="text-white text-4xl font-bold">
                {currentBid?.value || contract?.value}
              </div>
              
              {/* Trump suit */}
              <div className={`text-5xl ${getSuitColor(currentBid?.trump || trumpSuit!)}`}>
                {getSuitSymbol(currentBid?.trump || trumpSuit!)}
              </div>
            </div>
            
            {/* Double/Redouble indicator */}
            {(currentBid?.doubled || contract?.doubled) && (
              <div className="mt-2 text-center">
                {(currentBid?.redoubled || contract?.redoubled) ? (
                  <span className="text-purple-400 text-lg font-bold animate-pulse">
                    REDOUBLED (×4)
                  </span>
                ) : (
                  <span className="text-red-400 text-lg font-bold animate-pulse">
                    DOUBLED (×2)
                  </span>
                )}
              </div>
            )}
            
            {/* Bidder info (after bidding) */}
            {phase !== GamePhase.Bidding && contract && (
              <div className="mt-3 pt-3 border-t border-amber-700/50">
                <div className="text-amber-200 text-xs text-center">
                  by {contract.bidder.name}
                </div>
              </div>
            )}
          </div>
          
          {/* Crash animation overlay */}
          <AnimatePresence>
            {showCrash && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 pointer-events-none"
              >
                {/* Glass shatter effect */}
                <div className="relative w-full h-full">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: 0, y: 0, rotate: 0 }}
                      animate={{
                        x: (Math.random() - 0.5) * 200,
                        y: (Math.random() - 0.5) * 200,
                        rotate: Math.random() * 360,
                        opacity: 0
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      <div
                        className="absolute bg-gradient-to-br from-amber-400/30 to-amber-600/30 backdrop-blur-sm"
                        style={{
                          width: '40%',
                          height: '40%',
                          top: `${(i % 3) * 33}%`,
                          left: `${Math.floor(i / 3) * 33}%`,
                          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
                          transform: `rotate(${i * 45}deg)`
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
                
                {/* Impact burst */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 3 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-20 h-20 bg-gradient-radial from-amber-300/40 to-transparent rounded-full blur-xl" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ContractIndicator;
