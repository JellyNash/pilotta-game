import React, { useRef, useEffect } from 'react';
import { Card as CardType, Suit, Rank } from '../core/types';
import { useDrag } from 'react-dnd';
import classNames from 'classnames';
import { useAccessibility } from '../accessibility';

interface CardProps {
  card: CardType;
  isValid?: boolean;
  isSelected?: boolean;
  isTrump?: boolean;
  onClick?: (card: CardType) => void;
  isDraggable?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  faceDown?: boolean;
  className?: string;
  isHovered?: boolean;
  otherCardsHovered?: boolean;
  tabIndex?: number;
  teamId?: 'team1' | 'team2';
}

const AccessibleCard: React.FC<CardProps> = ({
  card,
  isValid = false,
  isSelected = false,
  isTrump = false,
  onClick,
  isDraggable = false,
  size = 'medium',
  faceDown = false,
  className,
  isHovered = false,
  otherCardsHovered = false,
  tabIndex = -1,
  teamId
}) => {
  const { settings, announceToScreenReader } = useAccessibility();
  const cardRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'card',
    item: { card },
    canDrag: isDraggable && isValid,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const getSuitSymbol = (suit: Suit) => {
    const symbols: Record<Suit, string> = {
      [Suit.Hearts]: '♥',
      [Suit.Diamonds]: '♦',
      [Suit.Clubs]: '♣',
      [Suit.Spades]: '♠'
    };
    return symbols[suit];
  };

  const getSuitName = (suit: Suit) => {
    const names: Record<Suit, string> = {
      [Suit.Hearts]: 'Hearts',
      [Suit.Diamonds]: 'Diamonds',
      [Suit.Clubs]: 'Clubs',
      [Suit.Spades]: 'Spades'
    };
    return names[suit];
  };

  const getSuitColor = (suit: Suit) => {
    // Apply colorblind-safe colors if enabled
    if (settings.theme === 'colorblind-safe' || settings.colorblindMode !== 'none') {
      return `suit-${suit.toLowerCase()}`;
    }
    return suit === Suit.Hearts || suit === Suit.Diamonds ? 'text-red-500' : 'text-gray-900';
  };

  const getSuitPattern = (suit: Suit) => {
    if (!settings.indicators.suitPatterns) return '';
    
    const patterns: Record<Suit, string> = {
      [Suit.Hearts]: 'suit-pattern-hearts',
      [Suit.Diamonds]: 'suit-pattern-diamonds',
      [Suit.Clubs]: 'suit-pattern-clubs',
      [Suit.Spades]: 'suit-pattern-spades'
    };
    return patterns[suit];
  };

  const sizeClasses = {
    small: 'w-16 h-24 text-2xl',
    medium: 'w-20 h-28 text-3xl',
    large: 'w-24 h-32 text-4xl',
    xlarge: 'w-32 h-44 text-5xl'
  };

  const rankDisplayClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  // Calculate the actual card size based on settings
  const actualSize = settings.fontSize > 100 || settings.cardSize > 100 ? 'large' : size;

  const handleClick = () => {
    if (onClick && !faceDown) {
      onClick(card);
      if (isValid) {
        announceToScreenReader(`Playing ${card.rank} of ${getSuitName(card.suit)}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick && !faceDown) {
      e.preventDefault();
      handleClick();
    }
  };

  // Generate ARIA label
  const getAriaLabel = () => {
    if (faceDown) return 'Face down card';
    
    const parts = [
      `${card.rank} of ${getSuitName(card.suit)}`,
      `${card.value} points`
    ];
    
    if (isTrump) parts.push('Trump suit');
    if (isValid) parts.push('Playable');
    if (isSelected) parts.push('Selected');
    
    return parts.join(', ');
  };

  const cardClasses = classNames(
    'playing-card relative rounded-lg shadow-xl transition-all duration-300 select-none',
    'card-interactive game-card',
    sizeClasses[actualSize],
    {
      'bg-gradient-to-br from-white to-gray-100': !faceDown,
      'bg-gradient-to-br from-blue-900 to-blue-800': faceDown,
      'opacity-50': isDragging,
      'glow-valid': isValid && !isSelected,
      'glow-selected': isSelected,
      'glow-trump': isTrump && !isSelected && !isValid,
      'transform scale-105': isSelected,
      'hover:shadow-2xl': !faceDown && !settings.animation.reducedMotion,
      // Enhanced hover effects
      'hover:translate-y-[-16px] hover:scale-110 hover:z-50': isValid && !isDragging && !isHovered && !settings.animation.reducedMotion,
      'translate-y-[-20px] scale-115 z-50 shadow-2xl': isHovered && !isDragging,
      'opacity-70 scale-95': otherCardsHovered && !isHovered && !isSelected,
      'hover:rotate-[-2deg]': isValid && !isDragging && !settings.animation.reducedMotion,
      // Accessibility classes
      'legal-move': isValid && settings.highlighting.legalMoves,
      'dynamic-outline can-play': isValid && settings.highlighting.focusIndicators,
      [`team-band-${teamId === 'team1' ? '1' : '2'}`]: settings.highlighting.teamColors && teamId,
      'cursor-pointer': isValid || onClick,
      'focus-visible': true
    },
    className
  );

  // Combine drag ref with accessibility ref
  useEffect(() => {
    if (isDraggable && cardRef.current) {
      drag(cardRef.current);
    }
  }, [isDraggable, drag]);

  return (
    <div
      ref={cardRef}
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : "img"}
      aria-label={getAriaLabel()}
      aria-disabled={!isValid && !!onClick}
      tabIndex={onClick ? (isValid ? tabIndex : -1) : -1}
      data-card-value={card.value}
      data-card-suit={card.suit}
      data-card-rank={card.rank}
    >
      {!faceDown ? (
        <>
          {/* Card Face */}
          <div className="absolute inset-0 flex flex-col p-1">
            {/* Top Left Rank & Suit */}
            <div className="flex flex-col items-center">
              <span className={`font-bold leading-tight ${rankDisplayClasses[actualSize]} ${getSuitColor(card.suit)}`}>
                {card.rank}
              </span>
              <span className={`leading-none ${getSuitColor(card.suit)} ${getSuitPattern(card.suit)}`}>
                {getSuitSymbol(card.suit)}
              </span>
            </div>

            {/* Center Suit Symbol */}
            <div className="flex-1 flex items-center justify-center">
              <span className={`${getSuitColor(card.suit)} ${getSuitPattern(card.suit)} opacity-20`}>
                {getSuitSymbol(card.suit)}
              </span>
            </div>

            {/* Bottom Right Rank & Suit (rotated) */}
            <div className="flex flex-col items-center rotate-180">
              <span className={`font-bold leading-tight ${rankDisplayClasses[actualSize]} ${getSuitColor(card.suit)}`}>
                {card.rank}
              </span>
              <span className={`leading-none ${getSuitColor(card.suit)} ${getSuitPattern(card.suit)}`}>
                {getSuitSymbol(card.suit)}
              </span>
            </div>
          </div>

          {/* Card label for accessibility */}
          {settings.indicators.cardLabels && (
            <div className="card-label" aria-hidden="true">
              {card.rank}{getSuitSymbol(card.suit)}
            </div>
          )}

          {/* Special card indicators */}
          {isTrump && (
            <div 
              className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" 
              aria-label="Trump indicator"
            />
          )}

          {/* Play hint */}
          {settings.cognitive.playHints && isValid && (
            <div className="play-hint" aria-hidden="true">
              Play this card
            </div>
          )}
        </>
      ) : (
        <>
          {/* Card Back Design */}
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            {settings.indicators.cardBackPattern === 'high-contrast' ? (
              <div className="card-back absolute inset-0" />
            ) : settings.indicators.cardBackPattern === 'pattern1' ? (
              <div className="card-back absolute inset-0" />
            ) : settings.indicators.cardBackPattern === 'pattern2' ? (
              <div className="card-back absolute inset-0" />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-900" />
                <div className="absolute inset-2 border border-blue-700 rounded-md" />
                <div className="absolute inset-3 border border-blue-600 rounded-sm" />
                
                {/* Decorative pattern */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="grid grid-cols-2 gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-blue-500 rounded-full" />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AccessibleCard;
