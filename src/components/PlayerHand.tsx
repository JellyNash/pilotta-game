import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Player, Card as CardType, Suit } from '../core/types';
import Card from './Card';
import { sortHumanPlayerCards } from '../utils/cardSorting';
import { sortCards } from '../utils/cardSortUtils';
import { useAppSelector } from '../store/hooks';
import { useViewportSize } from '../hooks/useViewportSize';

interface PlayerHandProps {
  player: Player;
  position: 'north' | 'east' | 'south' | 'west';
  isCurrentPlayer: boolean;
  showCards: boolean;
  onCardClick?: (card: CardType) => void;
  onCardPlay?: (card: CardType) => void;
  selectedCard?: CardType | null;
  validMoves?: CardType[];
  trumpSuit?: Suit | null;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  position,
  isCurrentPlayer,
  showCards,
  onCardClick,
  onCardPlay,
  selectedCard,
  validMoves = [],
  trumpSuit
}) => {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const cardSize = useAppSelector(state => state.game.settings?.cardSize || 'medium');
  const isHorizontal = position === 'north' || position === 'south';
  const viewport = useViewportSize();
  
  // Sort cards based on player type
  // Human player gets special sorting with alternating colors and trump on right
  // AI players get simple sorting
  const sortedCards = useMemo(() => {
    if (!showCards) return player.hand;
    
    if (player.isAI) {
      // Simple sorting for AI players
      return sortCards(player.hand, trumpSuit);
    } else {
      // Special sorting for human player
      return sortHumanPlayerCards(player.hand, trumpSuit);
    }
  }, [player.hand, player.isAI, trumpSuit, showCards]);

  // Update container dimensions on resize with batched reads
  useEffect(() => {
    const updateDimensions = () => {
      requestAnimationFrame(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setContainerDimensions({ width: rect.width, height: rect.height });
        }
      });
    };

    updateDimensions();
    // Use the viewport size hook instead of direct resize listener
    // This batches resize events
    return () => {};
  }, [viewport]);

  // Calculate responsive card dimensions and arc parameters
  const cardLayout = useMemo(() => {
    const cardCount = sortedCards.length;
    if (cardCount === 0) return { cards: [], availableWidth: 0 };

    const viewportWidth = viewport?.width || 1200;
    const viewportHeight = viewport?.height || 800;
    
    // Available space for cards (with padding)
    const availableWidth = isHorizontal 
      ? Math.min(viewportWidth * 0.8, 1200) 
      : Math.min(viewportHeight * 0.4, 500);
    const availableHeight = isHorizontal 
      ? Math.min(viewportHeight * 0.25, 300)
      : Math.min(viewportWidth * 0.2, 250);

    // Base card dimensions
    const aspectRatio = 0.7; // Standard playing card ratio
    let cardWidth: number;
    let cardHeight: number;

    if (isHorizontal) {
      // Calculate card size to fit all cards without overlap
      const maxCardWidth = availableWidth / cardCount;
      const maxCardHeight = availableHeight * 0.8; // Leave space for arc
      
      // Determine limiting factor
      if (maxCardWidth / aspectRatio > maxCardHeight) {
        cardHeight = maxCardHeight;
        cardWidth = cardHeight * aspectRatio;
      } else {
        cardWidth = maxCardWidth;
        cardHeight = cardWidth / aspectRatio;
      }
      
      // Apply minimum and maximum sizes
      cardWidth = Math.max(60, Math.min(120, cardWidth));
      cardHeight = Math.max(84, Math.min(168, cardHeight));
    } else {
      // Vertical layout
      cardWidth = Math.min(100, availableHeight * 0.8);
      cardHeight = cardWidth / aspectRatio;
      
      // Apply minimum and maximum sizes
      cardWidth = Math.max(60, Math.min(100, cardWidth));
      cardHeight = Math.max(84, Math.min(140, cardHeight));
    }

    // Card scaling removed (was part of accessibility system)

    // Calculate arc parameters
    const totalWidth = cardWidth * cardCount;
    const needsArc = totalWidth > availableWidth * 0.9;
    
    // Arc radius calculation
    let arcRadius = 0;
    let arcAngle = 0;
    let cardSpacing = cardWidth * 0.85; // Tighter spacing

    // Always use arc for human player (south position)
    if (isHorizontal && position === 'south') {
      // Calculate downward arc to fit cards
      const targetWidth = availableWidth * 0.85;
      arcAngle = Math.min(30, cardCount * 2.5); // Angle for visible arc
      arcRadius = targetWidth * 0.8; // Larger radius for gentler curve
      
      // Adjust card spacing based on arc
      const arcLength = (arcAngle * Math.PI / 180) * arcRadius;
      cardSpacing = Math.min(arcLength / (cardCount - 1), cardWidth * 0.9);
    }

    // Calculate individual card positions
    const cards = sortedCards.map((card, index) => {
      let x = 0;
      let y = 0;
      let rotation = 0;

      if (isHorizontal) {
        if (position === 'south') {
          // Always use downward arc for human player
          const normalizedIndex = (index - (cardCount - 1) / 2) / ((cardCount - 1) / 2);
          
          // Calculate x position along arc - always use compressed spacing
          // Use a fixed total width based on max cards (8) to keep consistent spacing
          const maxCards = 8;
          const baseWidth = availableWidth * 0.28;
          const scaleFactor = Math.min(1, cardCount / maxCards);
          x = normalizedIndex * (baseWidth * scaleFactor);
          
          // Calculate y for downward parabolic arc (HIGHEST at edges - frown shape)
          const arcDepth = 50; // Increased pixels of arc depth for more visible effect
          y = -arcDepth * (1 - normalizedIndex * normalizedIndex);
          
          // Slight rotation following the arc
          rotation = normalizedIndex * 10;
        } else {
          // Linear layout with slight fan
          const centerOffset = (index - (cardCount - 1) / 2);
          x = centerOffset * cardSpacing;
          y = Math.abs(centerOffset) * 2; // Slight elevation at edges
          rotation = centerOffset * 2; // Slight fan
        }
      } else {
        // Vertical layout
        const centerOffset = (index - (cardCount - 1) / 2);
        if (position === 'west') {
          y = centerOffset * (cardHeight * 0.3);
          rotation = -90 + centerOffset * 2;
        } else {
          y = centerOffset * (cardHeight * 0.3);
          rotation = 90 - centerOffset * 2;
        }
      }

      return {
        card,
        x,
        y,
        rotation,
        width: cardWidth,
        height: cardHeight,
        zIndex: index
      };
    });

    return { cards, arcRadius, cardWidth, cardHeight, availableWidth };
  }, [sortedCards, isHorizontal, position, containerDimensions.width, containerDimensions.height, viewport]);

  // Calculate hover adjustments separately to avoid recalculating base layout
  const hoverAdjustments = useMemo(() => {
    if (position !== 'south' || !hoveredCardId || !cardLayout.availableWidth) {
      return {};
    }

    const hoveredIndex = sortedCards.findIndex(c => c.id === hoveredCardId);
    if (hoveredIndex < 0) return {};

    const adjustments: Record<string, number> = {};
    const extraSpacing = 30; // Fixed pixel amount for consistent spacing

    // Calculate adjustments for cards to the right of hovered card
    sortedCards.forEach((card, index) => {
      if (index > hoveredIndex) {
        adjustments[card.id] = extraSpacing;
      }
    });

    return adjustments;
  }, [position, hoveredCardId, sortedCards, cardLayout.availableWidth]);


  const containerStyle = useMemo(() => ({
    display: 'flex',
    position: 'relative',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  } as React.CSSProperties), []);

  return (
    <div 
      className={`player-hand-container ${isHorizontal ? 'horizontal' : 'vertical'}`}
      ref={containerRef}
      data-position={position}
      id={position === 'south' ? 'hand' : undefined}
    >
      {/* Player Name & Indicator are now handled by GameTable component */}

      {/* Cards Container */}
      <div 
        style={containerStyle}
        className="cards-container contain-layout"
      >
        <div className="relative" style={{ 
          width: isHorizontal ? '100%' : 'auto',
          height: isHorizontal ? `${cardLayout?.cardHeight || 168}px` : '100%',
          paddingBottom: position === 'south' && cardLayout?.arcRadius ? '40px' : '0'
        }}>
          {cardLayout.cards.map((item, index) => {
            const isValid = validMoves.some(c => c.id === item.card.id);
            const isSelected = selectedCard?.id === item.card.id;
            const isTrump = trumpSuit === item.card.suit;
            const isHovered = hoveredCardId === item.card.id;
            const otherCardsHovered = hoveredCardId !== null && hoveredCardId !== item.card.id;
            
            // Use pre-calculated hover adjustments
            const adjustedX = item.x + (hoverAdjustments[item.card.id] || 0);

            return (
              <motion.div
                key={item.card.id}
                initial={false} // Skip initial animation for instant display
                animate={{ 
                  scale: isHovered ? 1.1 : 1, // 10% larger when hovered
                  opacity: 1,
                  x: adjustedX,
                  y: isHovered ? item.y - 20 : item.y, // 20% lift when hovered
                  rotate: item.rotation
                }}
                transition={{ 
                  delay: 0, // Remove staggered delays for instant response
                  type: "tween", // Use tween for more predictable animations
                  duration: 0.15, // Fast, consistent duration
                  ease: "easeOut"
                }}
                style={{ 
                  position: 'absolute',
                  left: isHorizontal ? '50%' : 'auto',
                  top: isHorizontal ? 'auto' : '50%',
                  transform: isHorizontal 
                    ? 'translateX(-50%)' 
                    : 'translateY(-50%)',
                  transformOrigin: position === 'south' ? 'center bottom' : 'center center',
                  zIndex: isSelected ? 40 : item.zIndex + 10, // Removed hover z-index change
                }}
                className="card-wrapper will-change-transform transform-gpu"
                onMouseEnter={() => showCards && setHoveredCardId(item.card.id)}
                onMouseLeave={() => showCards && setHoveredCardId(null)}
              >
                <Card
                  card={item.card}
                  isValid={showCards && isValid}
                  isSelected={isSelected}
                  isTrump={isTrump}
                  teamId={player.teamId as 'team1' | 'team2' | undefined}
                  onClick={showCards ? () => {
                    if (onCardClick) onCardClick(item.card);
                    // Auto-play on valid card click
                    if (isValid && onCardPlay) {
                      onCardPlay(item.card);
                    }
                  } : undefined}
                  isDraggable={showCards && isValid}
                  size="responsive"
                  width={item.width}
                  height={item.height}
                  faceDown={!showCards}
                  isHovered={isHovered}
                  otherCardsHovered={otherCardsHovered}
                  className={!showCards && position !== 'south' ? 'rotate-180' : ''}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Card count badge */}
      {!showCards && player.hand.length > 0 && (
        <div className="player-badge bg-slate-800/90 text-white">
          {player.hand.length}
        </div>
      )}
      
    </div>
  );
};

// Memoize PlayerHand component with custom comparison
export default memo(PlayerHand, (prevProps, nextProps) => {
  // Deep comparison for arrays - check length and IDs only
  const sameHand = prevProps.player.hand.length === nextProps.player.hand.length &&
    prevProps.player.hand.every((card, idx) => card.id === nextProps.player.hand[idx]?.id);
  
  const sameValidMoves = prevProps.validMoves?.length === nextProps.validMoves?.length &&
    (prevProps.validMoves || []).every((card, idx) => card?.id === nextProps.validMoves?.[idx]?.id);
  
  return (
    prevProps.player.id === nextProps.player.id &&
    prevProps.player.name === nextProps.player.name &&
    prevProps.player.isAI === nextProps.player.isAI &&
    prevProps.player.teamId === nextProps.player.teamId &&
    sameHand &&
    prevProps.position === nextProps.position &&
    prevProps.isCurrentPlayer === nextProps.isCurrentPlayer &&
    prevProps.showCards === nextProps.showCards &&
    prevProps.selectedCard?.id === nextProps.selectedCard?.id &&
    sameValidMoves &&
    prevProps.trumpSuit === nextProps.trumpSuit
  );
});