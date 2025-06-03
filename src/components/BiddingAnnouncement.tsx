import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BidEntry, Suit } from '../core/types';

interface BiddingAnnouncementProps {
  bid: BidEntry | null;
  position: 'north' | 'east' | 'south' | 'west';
  isVisible: boolean;
}

const BiddingAnnouncement: React.FC<BiddingAnnouncementProps> = ({ bid, position, isVisible }) => {
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    if (isVisible && bid) {
      setShowAnnouncement(true);
      // Keep announcement visible for 3 seconds
      const timer = setTimeout(() => {
        setShowAnnouncement(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [bid, isVisible]);

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

  const getPositionStyles = () => {
    switch (position) {
      case 'south':
        return 'bottom-32 left-1/2 transform -translate-x-1/2';
      case 'north':
        return 'top-32 left-1/2 transform -translate-x-1/2';
      case 'east':
        return 'right-32 top-1/2 transform -translate-y-1/2';
      case 'west':
        return 'left-32 top-1/2 transform -translate-y-1/2';
    }
  };

  const getAnimationVariants = () => {
    const baseVariants = {
      hidden: { 
        opacity: 0, 
        scale: 0.8,
      },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: {
          type: "spring",
          damping: 20,
          stiffness: 300
        }
      },
      exit: { 
        opacity: 0, 
        scale: 0.8,
        transition: {
          duration: 0.2
        }
      }
    };

    // Add position-specific animations
    switch (position) {
      case 'south':
        baseVariants.hidden.y = 20;
        baseVariants.visible.y = 0;
        baseVariants.exit.y = 20;
        break;
      case 'north':
        baseVariants.hidden.y = -20;
        baseVariants.visible.y = 0;
        baseVariants.exit.y = -20;
        break;
      case 'east':
        baseVariants.hidden.x = 20;
        baseVariants.visible.x = 0;
        baseVariants.exit.x = 20;
        break;
      case 'west':
        baseVariants.hidden.x = -20;
        baseVariants.visible.x = 0;
        baseVariants.exit.x = -20;
        break;
    }

    return baseVariants;
  };

  if (!bid) return null;

  const renderBidContent = () => {
    if (bid.bid === 'pass') {
      return (
        <div className="text-gray-400 font-semibold text-lg">
          PASS
        </div>
      );
    } else if (bid.bid === 'double') {
      return (
        <div className="text-red-400 font-bold text-lg flex items-center space-x-1">
          <span>DOUBLE</span>
          <span className="text-xl">×2</span>
        </div>
      );
    } else if (bid.bid === 'redouble') {
      return (
        <div className="text-purple-400 font-bold text-lg flex items-center space-x-1">
          <span>REDOUBLE</span>
          <span className="text-xl">×4</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-white font-bold text-xl">{bid.bid}</span>
          {bid.trump && (
            <span className={`text-2xl ${getSuitColor(bid.trump)}`}>
              {getSuitSymbol(bid.trump)}
            </span>
          )}
        </div>
      );
    }
  };

  return (
    <AnimatePresence>
      {showAnnouncement && (
        <motion.div
          variants={getAnimationVariants()}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`absolute ${getPositionStyles()} z-40 pointer-events-none`}
        >
          <div className="bg-slate-800/95 backdrop-blur-md rounded-xl px-6 py-3 shadow-2xl border border-slate-700/50 min-w-[120px] text-center">
            {renderBidContent()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BiddingAnnouncement;
