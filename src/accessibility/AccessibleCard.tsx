import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType, Suit } from '../core/types';
import { useAccessibility } from './AccessibilityContext';
import { useThemeStyles, useCardSize, useAnimationPreference } from './useAccessibilityHooks';

interface AccessibleCardProps {
  card: CardType;
  isPlayable?: boolean;
  isSelected?: boolean;
  isTrump?: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  style?: React.CSSProperties;
  className?: string;
}

const suitSymbols: Record<Suit, string> = {
  [Suit.Hearts]: '♥',
  [Suit.Diamonds]: '♦',
  [Suit.Clubs]: '♣',
  [Suit.Spades]: '♠',
};

const rankLabels: Record<string, string> = {
  'A': 'Ace',
  'K': 'King',
  'Q': 'Queen',
  'J': 'Jack',
  '10': 'Ten',
  '9': 'Nine',
  '8': 'Eight',
  '7': 'Seven',
};

export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  card,
  isPlayable = false,
  isSelected = false,
  isTrump = false,
  onClick,
  onDragStart,
  onDragEnd,
  style,
  className = '',
}) => {
  const { settings } = useAccessibility();
  const themeStyles = useThemeStyles();
  const cardSize = useCardSize();
  const animation = useAnimationPreference();
  
  const suitName = Suit[card.suit];
  const rankLabel = rankLabels[card.rank] || card.rank;
  const ariaLabel = `${rankLabel} of ${suitName}${isTrump ? ', trump suit' : ''}${card.points ? `, ${card.points} points` : ''}${isPlayable ? ', playable' : ''}`;
  
  const cardStyle = {
    ...themeStyles.cardStyle,
    width: `${cardSize.width}px`,
    height: `${cardSize.height}px`,
    fontSize: `${cardSize.fontSize}px`,
    ...style,
  };
  
  const suitStyle = themeStyles.suitStyle(suitName);
  
  return (
    <motion.div
      className={`
        relative rounded-lg cursor-pointer select-none
        ${isPlayable && settings.highlighting.legalMoves ? 'legal-move' : ''}
        ${isSelected ? 'ring-4 ring-blue-500' : ''}
        ${settings.highlighting.dynamicOutlines ? 'dynamic-outline' : ''}
        ${isPlayable && settings.highlighting.dynamicOutlines ? 'playable' : ''}
        ${settings.highlighting.activeCard ? 'card-interactive' : ''}
        ${className}
      `}
      style={cardStyle}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      draggable={isPlayable}
      role="button"
      tabIndex={isPlayable ? 0 : -1}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      whileHover={animation.enabled && settings.highlighting.activeCard ? { 
        scale: settings.highlighting.magnification,
        zIndex: 10,
      } : undefined}
      whileTap={animation.enabled ? { scale: 0.95 } : undefined}
      transition={animation.enabled ? {
        duration: 0.2 * animation.duration,
        ease: 'easeOut',
      } : { duration: 0 }}
    >
      {/* Card face */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
        {/* Card label for accessibility */}
        {settings.indicators.cardLabels && (
          <div className="card-label">
            {card.rank}{suitSymbols[card.suit]}
          </div>
        )}
        
        {/* Rank */}
        <div className="text-2xl font-bold" style={themeStyles.textStyle}>
          {card.rank}
        </div>
        
        {/* Suit with pattern overlay if enabled */}
        <div 
          className={`text-4xl ${settings.suitPatterns ? `suit-pattern-${suitName.toLowerCase()}` : ''}`}
          style={suitStyle}
        >
          {suitSymbols[card.suit]}
        </div>
        
        {/* Points indicator for high contrast */}
        {settings.theme === 'high-contrast' && card.points > 0 && (
          <div className="absolute bottom-1 right-1 text-xs font-bold" style={themeStyles.textStyle}>
            {card.points}
          </div>
        )}
        
        {/* Trump indicator */}
        {isTrump && settings.indicators.trumpAlwaysVisible && (
          <div className="absolute top-1 right-1 w-4 h-4 bg-yellow-500 rounded-full" 
               aria-label="Trump card" />
        )}
      </div>
      
      {/* Team color band */}
      {settings.highlighting.teamColors && (
        <div className={`absolute inset-x-0 top-0 h-1 ${isPlayable ? 'team-band-1' : ''}`} />
      )}
    </motion.div>
  );
};

// Card back component
export const AccessibleCardBack: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { settings } = useAccessibility();
  const cardSize = useCardSize();
  
  const getBackPattern = () => {
    switch (settings.comfort.cardBacks) {
      case 'high-contrast':
        return (
          <pattern id="card-back-pattern" patternUnits="userSpaceOnUse" width="10" height="10">
            <rect width="10" height="10" fill="var(--card-bg)" />
            <circle cx="5" cy="5" r="2" fill="var(--text-primary)" />
          </pattern>
        );
      case 'pattern1':
        return (
          <pattern id="card-back-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <rect width="20" height="20" fill="var(--card-bg)" />
            <path d="M0,10 L10,0 L20,10 L10,20 Z" fill="var(--text-tertiary)" />
          </pattern>
        );
      case 'pattern2':
        return (
          <pattern id="card-back-pattern" patternUnits="userSpaceOnUse" width="15" height="15">
            <rect width="15" height="15" fill="var(--card-bg)" />
            <line x1="0" y1="0" x2="15" y2="15" stroke="var(--text-tertiary)" strokeWidth="1" />
            <line x1="0" y1="15" x2="15" y2="0" stroke="var(--text-tertiary)" strokeWidth="1" />
          </pattern>
        );
      default:
        return null;
    }
  };
  
  return (
    <div
      className={`relative rounded-lg ${className}`}
      style={{
        width: `${cardSize.width}px`,
        height: `${cardSize.height}px`,
        background: settings.comfort.cardBacks === 'default' 
          ? 'linear-gradient(45deg, var(--card-bg) 25%, var(--text-tertiary) 25%, var(--text-tertiary) 50%, var(--card-bg) 50%, var(--card-bg) 75%, var(--text-tertiary) 75%)'
          : 'url(#card-back-pattern)',
        backgroundSize: '20px 20px',
        border: '2px solid var(--card-border)',
      }}
      aria-hidden="true"
    >
      {settings.comfort.cardBacks !== 'default' && (
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>{getBackPattern()}</defs>
        </svg>
      )}
    </div>
  );
};
