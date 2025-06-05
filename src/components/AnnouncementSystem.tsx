import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Suit } from '../core/types';
import './AnnouncementSystem.css';

export type AnnouncementType = 'belote' | 'rebelote' | 'declaration' | 'bid' | 'pass' | 'double' | 'redouble';

export interface AnnouncementData {
  id: string;
  type: AnnouncementType;
  message: string;
  position: 'north' | 'east' | 'south' | 'west';
  trumpSuit?: Suit;
  declarationValue?: number;
  timestamp: number;
}

interface AnnouncementSystemProps {
  announcements: AnnouncementData[];
  isBiddingActive?: boolean;
}

const AnnouncementSystem: React.FC<AnnouncementSystemProps> = ({ announcements, isBiddingActive = false }) => {
  const [activeAnnouncements, setActiveAnnouncements] = useState<AnnouncementData[]>([]);
  const [timers, setTimers] = useState<Record<string, NodeJS.Timeout>>({});
  const processedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Process new announcements
    announcements.forEach(announcement => {
      // Skip if already processed
      if (processedIds.current.has(announcement.id)) {
        return;
      }
      
      // Mark as processed
      processedIds.current.add(announcement.id);
      
      setActiveAnnouncements(prev => {
        // For each position, keep only the latest announcement
        const otherPositions = prev.filter(a => a.position !== announcement.position);
        const samePosition = prev.filter(a => a.position === announcement.position);
        
        // Clear timers for replaced announcements
        samePosition.forEach(a => {
          if (timers[a.id]) {
            clearTimeout(timers[a.id]);
            delete timers[a.id];
          }
        });
        
        return [...otherPositions, announcement];
      });
      
      // Set timer for auto-removal
      const timer = setTimeout(() => {
        setActiveAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
        setTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[announcement.id];
          return newTimers;
        });
      }, 3500);
      
      setTimers(prev => ({ ...prev, [announcement.id]: timer }));
    });
  }, [announcements]);
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Get announcement class name for CSS-based positioning
  const getAnnouncementClassName = (position: string) => {
    const isSouthBidding = isBiddingActive && position === 'south';
    return `announcement-position-${position}${isSouthBidding ? ' bidding-active' : ''}`;
  };

  // Get announcement styling based on type and value
  const getAnnouncementStyle = (type: AnnouncementType, value?: number) => {
    const styles = {
      belote: {
        bg: 'from-blue-500 via-blue-600 to-indigo-700',
        border: 'border-blue-400',
        shadow: '0 0 30px rgba(59, 130, 246, 0.6)',
        scale: 1.1
      },
      rebelote: {
        bg: 'from-purple-500 via-purple-600 to-pink-600',
        border: 'border-purple-400',
        shadow: '0 0 30px rgba(147, 51, 234, 0.6)',
        scale: 1.1
      },
      declaration: {
        bg: value && value >= 150 ? 'from-orange-500 via-red-500 to-pink-600' :
            value && value >= 100 ? 'from-amber-500 via-orange-500 to-red-500' :
            value && value >= 50 ? 'from-yellow-500 via-amber-500 to-orange-500' :
            'from-emerald-500 via-green-500 to-teal-600',
        border: value && value >= 100 ? 'border-orange-400' : 'border-emerald-400',
        shadow: value && value >= 100 ? '0 0 40px rgba(251, 146, 60, 0.7)' : '0 0 25px rgba(16, 185, 129, 0.5)',
        scale: value && value >= 100 ? 1.2 : 1
      },
      bid: {
        bg: 'from-slate-600 via-slate-700 to-slate-800',
        border: 'border-slate-500',
        shadow: '0 0 20px rgba(100, 116, 139, 0.5)',
        scale: 1
      },
      pass: {
        bg: 'from-gray-600 via-gray-700 to-gray-800',
        border: 'border-gray-500',
        shadow: '0 0 15px rgba(107, 114, 128, 0.4)',
        scale: 0.9
      },
      double: {
        bg: 'from-red-600 via-red-700 to-rose-800',
        border: 'border-red-500',
        shadow: '0 0 35px rgba(239, 68, 68, 0.7)',
        scale: 1.15
      },
      redouble: {
        bg: 'from-purple-600 via-pink-600 to-rose-700',
        border: 'border-purple-500',
        shadow: '0 0 40px rgba(168, 85, 247, 0.8)',
        scale: 1.2
      }
    };

    return styles[type] || styles.bid;
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
    return suit === Suit.Hearts || suit === Suit.Diamonds ? 'text-red-400' : 'text-slate-900';
  };

  return (
    <div className={`announcement-system pointer-events-none ${isBiddingActive ? 'bidding-active' : ''}`}>
      <AnimatePresence mode="popLayout">
        {activeAnnouncements.map((announcement) => {
          const style = getAnnouncementStyle(announcement.type, announcement.declarationValue);
          const positionClass = getAnnouncementClassName(announcement.position);

          // Enhanced animation variations
          const isHighValue = (announcement.declarationValue && announcement.declarationValue >= 100) ||
                            announcement.type === 'belote' || 
                            announcement.type === 'rebelote' ||
                            announcement.type === 'double' ||
                            announcement.type === 'redouble';

          // Get animation directions based on position
          const animationVars = {
            north: { x: 0, y: -30 },
            south: { x: 0, y: 30 },
            east: { x: 30, y: 0 },
            west: { x: -30, y: 0 }
          };
          const animDir = animationVars[announcement.position as keyof typeof animationVars];

          return (
            <motion.div
              key={`${announcement.position}-${announcement.id}`}
              className={`announcement-container ${positionClass}`}
              style={{ zIndex: 100 }}
              initial={{ 
                opacity: 0,
                scale: 0,
                x: animDir.x,
                y: animDir.y,
                filter: 'blur(10px)'
              }}
              animate={{ 
                opacity: 1,
                scale: style.scale,
                x: 0,
                y: 0,
                filter: 'blur(0px)',
                rotate: isHighValue ? [0, -3, 3, -1, 1, 0] : 0
              }}
              exit={{ 
                opacity: 0,
                scale: 0.3,
                x: animDir.x,
                y: animDir.y,
                rotate: announcement.position === 'north' || announcement.position === 'south' ? 15 : -15,
                filter: 'blur(10px)'
              }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 25,
                mass: 0.5,
                rotate: {
                  duration: 0.6,
                  ease: [0.23, 1, 0.32, 1]
                },
                filter: {
                  type: 'tween',
                  duration: 0.3,
                  ease: 'easeOut'
                }
              }}
            >
              <div
                className={`
                  announcement-card rounded-3xl
                  bg-gradient-to-br ${style.bg}
                  border-2 ${style.border}
                  backdrop-blur-xl
                `}
                style={{
                  boxShadow: `${style.shadow}, inset 0 1px 1px rgba(255,255,255,0.1)`,
                  minWidth: 'var(--announcement-min-width)',
                  padding: 'var(--announcement-padding-y) var(--announcement-padding-x)',
                  background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%), ${style.bg}`
                }}
              >
                {/* Glow effect layer */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: `radial-gradient(circle at center, ${
                      announcement.type === 'declaration' && announcement.declarationValue && announcement.declarationValue >= 150 ? 'rgba(251, 146, 60, 0.3)' :
                      announcement.type === 'belote' ? 'rgba(59, 130, 246, 0.3)' :
                      announcement.type === 'rebelote' ? 'rgba(147, 51, 234, 0.3)' :
                      'transparent'
                    }, transparent 70%)`,
                    filter: 'blur(20px)'
                  }}
                  animate={isHighValue ? {
                    opacity: [0.5, 1, 0.5]
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />

                {/* Main message with enhanced animation */}
                <motion.div
                  className="text-center relative z-10"
                  animate={isHighValue ? {
                    scale: [1, 1.08, 1],
                    y: [0, -2, 0]
                  } : {
                    scale: [1, 1.02, 1]
                  }}
                  transition={{
                    duration: isHighValue ? 1.2 : 2,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.6, 1]
                  }}
                >
                  <div className="font-bold text-white drop-shadow-lg" style={{
                    fontSize: announcement.type === 'declaration' ? 
                      'calc(var(--announcement-font-size) * 1.5)' : 
                      'var(--announcement-font-size)',
                    textShadow: isHighValue ? '0 0 20px rgba(255,255,255,0.5)' : '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {announcement.message}
                    {announcement.trumpSuit && announcement.type === 'bid' && (
                      <motion.span 
                        className={`ml-3 ${getSuitColor(announcement.trumpSuit)}`} 
                        style={{
                          fontSize: 'var(--announcement-suit-size)',
                          display: 'inline-block'
                        }}
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      >
                        {getSuitSymbol(announcement.trumpSuit)}
                      </motion.span>
                    )}
                  </div>
                </motion.div>

                {/* Enhanced visual effects for high-value announcements */}
                {isHighValue && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                    {/* Particle effects */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          left: `${10 + i * 10}%`,
                          top: '50%',
                          width: '3px',
                          height: '3px',
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, white 0%, transparent 70%)'
                        }}
                        animate={{
                          y: [0, -40, 40, 0],
                          x: [0, (i % 2 === 0 ? 10 : -10), (i % 2 === 0 ? -10 : 10), 0],
                          opacity: [0, 1, 1, 0],
                          scale: [0, 1.5, 1.5, 0]
                        }}
                        transition={{
                          duration: 2.5,
                          delay: i * 0.15,
                          repeat: Infinity,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                      />
                    ))}
                    
                    {/* Multiple shimmer waves */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
                        transform: 'skewX(-25deg)'
                      }}
                      animate={{
                        x: ['-200%', '200%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                        repeatDelay: 1
                      }}
                    />
                    
                    {/* Edge glow */}
                    <motion.div
                      className="absolute inset-0 rounded-3xl"
                      style={{
                        border: '1px solid',
                        borderColor: announcement.type === 'belote' ? 'rgba(59, 130, 246, 0.5)' :
                                    announcement.type === 'rebelote' ? 'rgba(147, 51, 234, 0.5)' :
                                    'rgba(251, 146, 60, 0.5)'
                      }}
                      animate={{
                        opacity: [0.3, 1, 0.3]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    />
                  </div>
                )}

                {/* Subtle effects for regular announcements */}
                {!isHighValue && (
                  <motion.div
                    className="absolute inset-0 rounded-3xl"
                    style={{
                      background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                      transform: 'scale(1.1)'
                    }}
                    animate={{
                      opacity: [0, 0.5, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AnnouncementSystem;