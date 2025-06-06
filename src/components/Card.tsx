import React, { useRef, useEffect } from 'react';
import { Card as CardType, Suit, Rank } from '../core/types';
import { useDrag } from 'react-dnd';
import classNames from 'classnames';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleCardZoom } from '../store/gameSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { getSuitColorValue, CardStyle } from '../utils/suitColors';
import './Card.css';

interface CardProps {
  card: CardType;
  isValid?: boolean;
  isSelected?: boolean;
  isKeyboardSelected?: boolean;
  isTrump?: boolean;
  onClick?: (card: CardType) => void;
  isDraggable?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'responsive';
  faceDown?: boolean;
  className?: string;
  isHovered?: boolean;
  otherCardsHovered?: boolean;
  teamId?: 'team1' | 'team2';
  // New props for responsive sizing
  width?: number;
  height?: number;
}

const Card: React.FC<CardProps> = ({
  card,
  isValid = false,
  isSelected = false,
  isKeyboardSelected = false,
  isTrump = false,
  onClick,
  isDraggable = false,
  size = 'medium',
  faceDown = false,
  className,
  isHovered = false,
  otherCardsHovered = false,
  teamId,
  width,
  height
}) => {
  const dispatch = useAppDispatch();
  const cardRef = useRef<HTMLDivElement>(null);
  const cardStyle = useAppSelector(state => state.game.settings?.cardStyle || 'classic');
  const rightClickZoomEnabled = useAppSelector(state => state.game.settings?.rightClickZoom ?? true);
  const zoomedCard = useAppSelector(state => state.game.zoomedCard);
  const isZoomed = zoomedCard === card.id;
  
  const isFaceDown = Boolean(faceDown);
  
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

  const getDisplayRank = (rank: Rank) => {
    const displayMap: Partial<Record<Rank, string>> = {
      [Rank.Jack]: 'J',
      [Rank.Queen]: 'Q',
      [Rank.King]: 'K',
      [Rank.Ace]: 'A'
    };
    return displayMap[rank] || rank;
  };
  


  const getSuitColor = (suit: Suit): string => {
    return getSuitColorValue(suit, cardStyle as CardStyle);
  };


  // Calculate card dimensions using CSS tokens
  const getCardDimensions = () => {
    if (width && height) {
      return { width, height };
    }

    // Default to fill parent container which defines card scaling
    return {
      width: '100%',
      height: '100%'
    };
  };

  const dimensions = getCardDimensions();
  
  // Handle CSS variable dimensions for responsive sizing
  const cardStyleProps: React.CSSProperties = {
    width: typeof dimensions.width === 'string' ? dimensions.width : `${dimensions.width}px`,
    height: typeof dimensions.height === 'string' ? dimensions.height : `${dimensions.height}px`,
    display: 'flex',
    flexDirection: 'column'
  };

  const handleClick = () => {
    if (onClick && !isFaceDown) {
      onClick(card);
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isFaceDown && rightClickZoomEnabled) {
      dispatch(toggleCardZoom(card.id));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick && !isFaceDown && !isDragging) {
        onClick(card);
      }
    } else if (e.key === 'Escape' && isZoomed) {
      dispatch(toggleCardZoom(card.id));
    }
  };


  const cardClasses = classNames(
    'playing-card rounded-lg shadow-xl select-none',
    'card-interactive game-card overflow-hidden',
    {
      'bg-white': !isFaceDown,
      'bg-gradient-to-br from-blue-900 to-blue-800': isFaceDown,
      'opacity-50': isDragging,
      'ring-4 ring-green-400': isValid && !isSelected,
      'ring-4 ring-blue-400 scale-105': isSelected,
      'ring-4 ring-yellow-400': isTrump && !isSelected && !isValid,
      'ring-4 ring-orange-500 shadow-orange-500/50': isKeyboardSelected,
      'hover:shadow-2xl': !isFaceDown,
      'cursor-pointer': isValid || onClick
    },
    className
  );

  useEffect(() => {
    if (isDraggable && cardRef.current) {
      drag(cardRef.current);
    }
  }, [isDraggable, drag]);

  // Font sizes use CSS custom properties
  const fontClasses = {
    main: 'card-main-text',
    mainSuit: 'card-main-suit',
    corner: 'card-corner-text',
    cornerSuit: 'card-corner-suit'
  };

  // Create ARIA label for screen readers
  const ariaLabel = isFaceDown 
    ? 'Face down card' 
    : `${card.rank} of ${card.suit}${isTrump ? ', trump suit' : ''}${isValid ? ', playable' : ''}${isSelected ? ', selected' : ''}`;

  return (
    <>
      <div
        ref={cardRef}
        className={cardClasses}
        style={cardStyleProps}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        onKeyDown={handleKeyDown}
        tabIndex={isValid || onClick ? 0 : -1}
        role="button"
        aria-label={ariaLabel}
        aria-selected={isSelected}
        aria-disabled={!isValid && !onClick}
        aria-pressed={isKeyboardSelected}
        data-card-value={card.value}
        data-card-suit={card.suit}
        data-card-rank={card.rank}
        data-face-down={isFaceDown ? 'true' : 'false'}
      >
      {!isFaceDown ? (
        <>
          <div className={`h-full w-full flex flex-col ${cardStyle === 'minimalist' ? 'bg-gray-50' : 'bg-white'} relative`}>
            {/* Corner indicators - TOP LEFT (Enlarged) */}
            <div className="absolute top-3 left-3 text-center">
              <div 
                className={`font-bold leading-none ${fontClasses.corner}`}
                style={{ 
                  fontWeight: '900',
                  fontFamily: cardStyle === 'modern' ? 'system-ui, -apple-system, sans-serif' : 'inherit',
                  color: getSuitColor(card.suit)
                }}
              >
                {getDisplayRank(card.rank)}
              </div>
              <div 
                className={`leading-none ${fontClasses.cornerSuit}`}
                style={{ 
                  fontWeight: '900',
                  marginTop: '0px',
                  color: getSuitColor(card.suit)
                }}
              >
                {getSuitSymbol(card.suit)}
              </div>
              
              {/* Extra suit indicator for accessible style */}
              {cardStyle === 'accessible' && (
                <div 
                  className="leading-none mt-1 card-corner-suit-small"
                  style={{ 
                    fontWeight: '700',
                    color: getSuitColor(card.suit)
                  }}
                >
                  {getSuitSymbol(card.suit)}
                </div>
              )}
            </div>
            

            {/* Main Rank Display - Offset slightly to bottom-right */}
            <div className="flex-1 flex items-center justify-center p-4 card-main-content">
              <div className="text-center">
                <div 
                  className={`font-black leading-none ${fontClasses.main}`}
                  style={{ 
                    textShadow: cardStyle === 'minimalist' ? 'none' : '2px 2px 3px rgba(0,0,0,0.3)',
                    fontWeight: '900',
                    fontFamily: cardStyle === 'modern' ? 'system-ui, -apple-system, sans-serif' : 'inherit',
                    color: getSuitColor(card.suit)
                  }}
                >
                  {getDisplayRank(card.rank)}
                </div>
                <div 
                  className={`leading-none ${fontClasses.mainSuit}`}
                  style={{ 
                    textShadow: cardStyle === 'minimalist' ? 'none' : '2px 2px 3px rgba(0,0,0,0.3)',
                    fontWeight: '900',
                    marginTop: '-2px',
                    color: getSuitColor(card.suit)
                  }}
                >
                  {getSuitSymbol(card.suit)}
                </div>
                
              </div>
            </div>


            {/* Trump indicator */}
            {isTrump && (
              <div
                className="absolute top-1 right-1 bg-yellow-400 rounded-full animate-pulse shadow-lg"
                style={{
                  width: 'calc(0.75rem * var(--ph-card-scale) * var(--card-scale))',
                  height: 'calc(0.75rem * var(--ph-card-scale) * var(--card-scale))'
                }}
              />
            )}
          </div>
        </>
      ) : (
        <>
          {/* Card Back Design */}
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-900" />
            <div className="absolute inset-2 border border-blue-700 rounded-md" />
            <div className="absolute inset-3 border border-blue-600 rounded-sm" />
            
            {/* Decorative pattern */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <div className="grid grid-cols-2 gap-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      </div>
      
      {/* Zoomed card overlay */}
      <AnimatePresence>
        {isZoomed && !isFaceDown && (
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
            style={{ zIndex: 'var(--z-tooltip)' }}
          >
            {/* Backdrop - clickable to close */}
            <motion.div
              className="absolute inset-0 bg-black/60 pointer-events-auto"
              onClick={(e) => {
                e.preventDefault();
                dispatch(toggleCardZoom(null));
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                dispatch(toggleCardZoom(null));
              }}
            />
            
            {/* Zoomed card */}
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 2 }}
              exit={{ scale: 1 }}
              transition={{ 
                duration: 0.2, 
                ease: [0.16, 1, 0.3, 1] // Custom easing for snappy animation
              }}
              className="relative pointer-events-auto card-zoomed-container"
            >
              <div
                className={cardClasses + ' shadow-2xl'}
                style={cardStyleProps}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClick && !isFaceDown) {
                    onClick(card);
                    dispatch(toggleCardZoom(null));
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  dispatch(toggleCardZoom(null));
                }}
              >
                {/* Same card content */}
                <div className={`h-full w-full flex flex-col ${cardStyle === 'minimalist' ? 'bg-gray-50' : 'bg-white'} relative`}>
                  {/* Corner indicators - TOP LEFT (Enlarged) */}
                  <div className="absolute top-3 left-3 text-center">
                    <div 
                      className={`font-bold leading-none ${fontClasses.corner}`}
                      style={{ 
                        fontWeight: '900',
                        fontFamily: cardStyle === 'modern' ? 'system-ui, -apple-system, sans-serif' : 'inherit',
                        color: getSuitColor(card.suit)
                      }}
                    >
                      {getDisplayRank(card.rank)}
                    </div>
                    <div 
                      className={`leading-none ${fontClasses.cornerSuit}`}
                      style={{ 
                        fontWeight: '900',
                        marginTop: '0px',
                        color: getSuitColor(card.suit)
                      }}
                    >
                      {getSuitSymbol(card.suit)}
                    </div>
                    
                    {/* Extra suit indicator for accessible style */}
                    {cardStyle === 'accessible' && (
                      <div 
                        className="leading-none mt-1 card-corner-suit-small"
                        style={{ 
                          fontWeight: '700',
                          color: getSuitColor(card.suit)
                        }}
                      >
                        {getSuitSymbol(card.suit)}
                      </div>
                    )}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 flex items-center justify-center p-4 card-main-content">
                    <div className="text-center">
                      <div 
                        className={`font-black leading-none ${fontClasses.main}`}
                        style={{ 
                          textShadow: cardStyle === 'minimalist' ? 'none' : '2px 2px 3px rgba(0,0,0,0.3)',
                          fontWeight: '900',
                          fontFamily: cardStyle === 'modern' ? 'system-ui, -apple-system, sans-serif' : 'inherit',
                          color: getSuitColor(card.suit)
                        }}
                      >
                        {getDisplayRank(card.rank)}
                      </div>
                      <div 
                        className={`leading-none ${fontClasses.mainSuit}`}
                        style={{ 
                          textShadow: cardStyle === 'minimalist' ? 'none' : '2px 2px 3px rgba(0,0,0,0.3)',
                          fontWeight: '900',
                          marginTop: '-2px',
                          color: getSuitColor(card.suit)
                        }}
                      >
                        {getSuitSymbol(card.suit)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Card;