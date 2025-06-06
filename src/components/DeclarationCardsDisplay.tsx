import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Declaration } from '../core/types';
import Card from './Card';

interface DeclarationCardsDisplayProps {
  declarations: Declaration[];
  position: 'north' | 'east' | 'south' | 'west';
  show: boolean;
}

const DeclarationCardsDisplay: React.FC<DeclarationCardsDisplayProps> = ({
  declarations,
  position,
  show
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && declarations.length > 0) {
      setIsVisible(true);

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    } else if (!show) {
      setIsVisible(false);
    }
  }, [show, declarations.length]);

  // Get positioning based on player position
  const getContainerStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      zIndex: 'var(--z-ui-overlay)', // UI overlay level
      pointerEvents: 'none'
    };

    // Position declarations in front of player's hand
    // Using responsive clamp() based offsets
    switch (position) {
      case 'south':
        return {
          ...baseStyle,
          position: 'fixed',
          bottom: 'var(--declaration-offset-v)',
          left: '50%',
          transform: 'translateX(-50%)'
        };
      case 'north':
        return {
          ...baseStyle,
          top: 'var(--declaration-offset-v)',
          left: '50%',
          transform: 'translateX(-50%)'
        };
      case 'east':
        return {
          ...baseStyle,
          right: 'var(--declaration-offset-h)',
          top: '50%',
          transform: 'translateY(-50%)'
        };
      case 'west':
        return {
          ...baseStyle,
          left: 'var(--declaration-offset-h)',
          top: '50%',
          transform: 'translateY(-50%)'
        };
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && declarations.length > 0 && (
        <motion.div
          className="declaration-cards-container"
          initial={{ opacity: 0, scale: 0.6, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.6, filter: 'blur(10px)' }}
          transition={{ 
            duration: 0.5, 
            ease: [0.23, 1, 0.32, 1]
          }}
          style={getContainerStyle()}
        >
          <div className="flex gap-2 items-center justify-center">
            {/* Group cards by declaration */}
            {declarations.map((declaration, declIndex) => (
              <motion.div
                key={declIndex}
                className="relative"
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ 
                  delay: declIndex * 0.15,
                  duration: 0.6,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                <div className="relative flex -space-x-6"> {/* Reduced overlap from -10 to -6 for better visibility */}
                  {declaration.cards.map((card, cardIndex) => {
                    // Calculate fan rotation for cards
                    const fanAngle = (cardIndex - (declaration.cards.length - 1) / 2) * 5;
                    
                    return (
                      <motion.div
                        key={`${declIndex}-${cardIndex}`}
                        className="relative"
                        initial={{ 
                          opacity: 0, 
                          y: -30,
                          rotateY: -180,
                          scale: 0
                        }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          rotateY: 0,
                          scale: 1,
                          rotate: fanAngle
                        }}
                        transition={{
                          delay: declIndex * 0.15 + cardIndex * 0.08,
                          duration: 0.5,
                          ease: [0.4, 0, 0.2, 1],
                          scale: {
                            type: "spring",
                            stiffness: 300,
                            damping: 20
                          }
                        }}
                        style={{ 
                          zIndex: `calc(var(--z-ui-overlay) + ${cardIndex})`,
                          transformOrigin: 'bottom center'
                        }}
                      >
                        {/* Subtle golden glow */}
                        <motion.div 
                          className="absolute inset-0 rounded-lg"
                          style={{
                            background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.3), transparent 70%)',
                            filter: 'blur(20px)'
                          }}
                          animate={{
                            opacity: [0.3, 0.6, 0.3],
                            scale: [1, 1.2, 1]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                        />
                        
                        <Card
                          card={card}
                          size="small" // Changed from medium to small for better fit
                          onClick={() => {}}
                          className="shadow-xl"
                        />
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Minimalist points indicator */}
                <motion.div
                  className="absolute -bottom-3 left-1/2 transform -translate-x-1/2"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ 
                    delay: declIndex * 0.15 + 0.3,
                    type: 'spring',
                    stiffness: 400,
                    damping: 15
                  }}
                >
                  <div className="bg-slate-900/90 backdrop-blur-sm text-amber-400 font-bold px-3 py-1 rounded-full text-sm shadow-lg border border-amber-400/30">
                    {declaration.points}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeclarationCardsDisplay;