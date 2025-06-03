import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Suit } from '../core/types';
import { NotificationPositioner } from '../layouts/UIPositioner';

export type AnnouncementType = 'belote' | 'rebelote' | 'declaration' | 'bid' | 'pass' | 'double' | 'redouble';

interface UnifiedAnnouncementProps {
  type: AnnouncementType;
  message: string;
  position: 'north' | 'east' | 'south' | 'west';
  isVisible: boolean;
  trumpSuit?: Suit;
  declarationValue?: number;
}

const UnifiedAnnouncement: React.FC<UnifiedAnnouncementProps> = ({ 
  type, 
  message, 
  position, 
  isVisible,
  trumpSuit,
  declarationValue
}) => {
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowAnnouncement(true);
      const timer = setTimeout(() => {
        setShowAnnouncement(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);


  // Get background gradient based on type and declaration value
  const getBackgroundGradient = () => {
    if (type === 'belote') {
      return 'bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-400';
    } else if (type === 'rebelote') {
      return 'bg-gradient-to-br from-purple-500 to-purple-600 border-2 border-purple-400';
    } else if (type === 'declaration' && declarationValue) {
      // Gradient intensity based on declaration value
      if (declarationValue >= 150) {
        return 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 border-2 border-orange-400';
      } else if (declarationValue >= 100) {
        return 'bg-gradient-to-br from-amber-500 to-orange-600 border-2 border-amber-400';
      } else if (declarationValue >= 50) {
        return 'bg-gradient-to-br from-yellow-500 to-amber-600 border-2 border-yellow-400';
      } else {
        return 'bg-gradient-to-br from-emerald-500 to-green-600 border-2 border-emerald-400';
      }
    } else if (type === 'double') {
      return 'bg-gradient-to-br from-red-600 to-red-700 border-2 border-red-500';
    } else if (type === 'redouble') {
      return 'bg-gradient-to-br from-purple-600 to-pink-700 border-2 border-purple-500';
    } else if (type === 'pass') {
      return 'bg-gradient-to-br from-gray-600 to-gray-700 border-2 border-gray-500';
    } else {
      return 'bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600';
    }
  };

  // Get animation intensity based on declaration value
  const getAnimationVariants = () => {
    const scale = type === 'declaration' && declarationValue && declarationValue >= 100 ? 1.2 : 1;
    const rotationIntensity = type === 'declaration' && declarationValue ? 
      Math.min(declarationValue / 20, 15) : 5;

    return {
      hidden: { scale: 0, opacity: 0, y: 50 },
      visible: { 
        scale: scale, 
        opacity: 1, 
        y: 0,
        rotate: type === 'belote' ? [-rotationIntensity, rotationIntensity, -rotationIntensity, 0] : 
                [rotationIntensity, -rotationIntensity, rotationIntensity, 0]
      },
      exit: { scale: 0, opacity: 0, y: -50 }
    };
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

  // Get sparkle count based on declaration value
  const getSparkleCount = () => {
    if (type === 'declaration' && declarationValue) {
      return Math.min(Math.floor(declarationValue / 30), 8);
    }
    return type === 'belote' || type === 'rebelote' ? 5 : 0;
  };

  return (
    <AnimatePresence>
      {showAnnouncement && (
        <NotificationPositioner playerPosition={position}>
          <motion.div
            variants={getAnimationVariants()}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 25,
              rotate: { duration: 0.5, ease: "easeInOut" }
            }}
            className={`
              px-8 py-4 rounded-2xl shadow-2xl
              ${getBackgroundGradient()}
            `}
            style={{ 
              filter: 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.5))'
            }}
          >
          <div className="text-center">
            <motion.div 
              className="text-3xl font-bold text-white mb-1"
              animate={{ 
                scale: [1, 1.1, 1],
                textShadow: [
                  "0 0 10px rgba(255,255,255,0.5)",
                  "0 0 20px rgba(255,255,255,0.8)",
                  "0 0 10px rgba(255,255,255,0.5)"
                ]
              }}
              transition={{ 
                duration: type === 'declaration' && declarationValue && declarationValue >= 100 ? 0.8 : 1, 
                repeat: Infinity 
              }}
            >
              {message}
              {trumpSuit && type === 'bid' && (
                <span className={`ml-2 ${getSuitColor(trumpSuit)}`}>
                  {getSuitSymbol(trumpSuit)}
                </span>
              )}
            </motion.div>
          </div>
          
          {/* Sparkle effects */}
          {getSparkleCount() > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(getSparkleCount())].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  initial={{ 
                    x: 0, 
                    y: 0,
                    opacity: 0,
                    scale: 0
                  }}
                  animate={{ 
                    x: Math.cos(i * (360 / getSparkleCount()) * Math.PI / 180) * 60,
                    y: Math.sin(i * (360 / getSparkleCount()) * Math.PI / 180) * 60,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  style={{ 
                    left: '50%', 
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}
            </div>
          )}
          </motion.div>
        </NotificationPositioner>
      )}
    </AnimatePresence>
  );
};

export default UnifiedAnnouncement;