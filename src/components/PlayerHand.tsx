import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Player, Card as CardType, Suit } from '../core/types';
import Card from './Card';
import { sortHumanPlayerCards } from '../utils/cardSorting';
import { sortCards } from '../utils/cardSortUtils';
import { useAppSelector } from '../store/hooks';
import { useAccessibility } from '../accessibility';

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
  const { settings, announceToScreenReader } = useAccessibility();
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [focusedCardIndex, setFocusedCardIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const cardSize = useAppSelector(state => state.game.settings?.cardSize || 'medium');
  const accessibilityCardSize = settings?.cardSize || 100;
  const isHorizontal = position === 'north' || position === 'south';
  
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

  // Update container dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate responsive card dimensions and arc parameters
  const cardLayout = useMemo(() => {
    const cardCount = sortedCards.length;
    if (cardCount === 0) return { cards: [], availableWidth: 0 };

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
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

    // Apply accessibility scaling
    cardWidth *= (accessibilityCardSize / 100);
    cardHeight *= (accessibilityCardSize / 100);

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
  }, [sortedCards, isHorizontal, position, containerDimensions.width, containerDimensions.height, accessibilityCardSize, hoveredCardId]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!showCards || !settings?.keyboard?.enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      let newIndex = focusedCardIndex;
      let handled = false;

      switch (e.key) {
        case 'ArrowLeft':
          if (isHorizontal || position === 'west') {
            newIndex = Math.max(0, focusedCardIndex - 1);
            handled = true;
          }
          break;
        case 'ArrowRight':
          if (isHorizontal || position === 'east') {
            newIndex = Math.min(sortedCards.length - 1, focusedCardIndex + 1);
            handled = true;
          }
          break;
        case 'ArrowUp':
          if (!isHorizontal && position === 'east') {
            newIndex = Math.max(0, focusedCardIndex - 1);
            handled = true;
          } else if (!isHorizontal && position === 'west') {
            newIndex = Math.min(sortedCards.length - 1, focusedCardIndex + 1);
            handled = true;
          }
          break;
        case 'ArrowDown':
          if (!isHorizontal && position === 'east') {
            newIndex = Math.min(sortedCards.length - 1, focusedCardIndex + 1);
            handled = true;
          } else if (!isHorizontal && position === 'west') {
            newIndex = Math.max(0, focusedCardIndex - 1);
            handled = true;
          }
          break;
        case 'Home':
          newIndex = 0;
          handled = true;
          break;
        case 'End':
          newIndex = sortedCards.length - 1;
          handled = true;
          break;
        case 'Enter':
        case ' ':
          const currentCard = sortedCards[focusedCardIndex];
          const isValid = validMoves.some(c => c.id === currentCard.id);
          if (isValid && onCardPlay) {
            e.preventDefault();
            onCardPlay(currentCard);
            announceToScreenReader(`Played ${currentCard.rank} of ${currentCard.suit}`);
            handled = true;
          }
          break;
      }

      if (handled) {
        e.preventDefault();
        setFocusedCardIndex(newIndex);
        
        // Focus the card element
        const cardElements = containerRef.current?.querySelectorAll('[role="button"]');
        if (cardElements && cardElements[newIndex]) {
          (cardElements[newIndex] as HTMLElement).focus();
        }

        // Announce card to screen reader
        const card = sortedCards[newIndex];
        announceToScreenReader(`${card.rank} of ${card.suit}, ${newIndex + 1} of ${sortedCards.length}`);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showCards, focusedCardIndex, sortedCards, validMoves, onCardPlay, isHorizontal, position, settings?.keyboard?.enabled, announceToScreenReader]);

  const getContainerStyle = () => {
    const style: React.CSSProperties = {
      display: 'flex',
      position: 'relative',
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center'
    };

    return style;
  };

  return (
    <div 
      className="player-hand relative"
      ref={containerRef}
      data-position={position}
      id={position === 'south' ? 'hand' : undefined}
      role="region"
      aria-label={`${player.name}'s hand`}
      style={{
        width: isHorizontal ? '100%' : 'auto',
        height: !isHorizontal ? '100%' : 'auto'
      }}
    >
      {/* Player Name & Indicator */}
      <div className={`absolute whitespace-nowrap z-20 ${
        position === 'north' ? 'bottom-full mb-1' :
        position === 'south' ? 'top-full mt-1' :
        position === 'east' ? 'right-full mr-1' :
        'left-full ml-1'
      } ${isHorizontal ? 'left-1/2 transform -translate-x-1/2' : 'top-1/2 transform -translate-y-1/2'}`}>
        <div className={`
          px-2 py-1 rounded text-sm font-medium transition-all shadow-lg
          ${isCurrentPlayer 
            ? 'bg-blue-600 text-white shadow-blue-600/50' 
            : 'bg-slate-700/90 text-slate-300'
          }
        `}>
          {player.name}
          {player.teamId && (
            <span className="ml-1 text-xs opacity-75">Team {player.teamId}</span>
          )}
        </div>
      </div>

      {/* Cards Container */}
      <div 
        style={getContainerStyle()}
        role="group"
        aria-label="Cards in hand"
        className="cards-container"
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
            
            // Calculate adjusted position when hovering
            let adjustedX = item.x;
            if (position === 'south' && hoveredCardId !== null && cardLayout.availableWidth) {
              const hoveredIndex = sortedCards.findIndex(c => c.id === hoveredCardId);
              if (hoveredIndex >= 0) {
                // If this card is to the right of hovered card, shift it right
                if (index > hoveredIndex) {
                  // Add extra spacing to make room for the hovered card
                  const extraSpacing = 30; // Fixed pixel amount for consistent spacing
                  adjustedX += extraSpacing;
                }
              }
            }

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
                className="card-wrapper"
                onMouseEnter={() => showCards && setHoveredCardId(item.card.id)}
                onMouseLeave={() => showCards && setHoveredCardId(null)}
              >
                <Card
                  card={item.card}
                  isValid={showCards && isValid}
                  isSelected={isSelected}
                  isTrump={isTrump}
                  teamId={player.teamId as 'team1' | 'team2' | undefined}
                  tabIndex={showCards && index === focusedCardIndex ? 0 : -1}
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

      {/* Card count for hidden hands */}
      {!showCards && player.hand.length > 0 && (
        <div 
          aria-label={`${player.name} has ${player.hand.length} cards`}
          className={`
          absolute bg-slate-800/90 text-white text-xs px-2 py-0.5 rounded-full shadow-lg z-20
          ${position === 'north' ? 'top-full mt-0.5 left-1/2 transform -translate-x-1/2' :
            position === 'south' ? 'bottom-full mb-0.5 left-1/2 transform -translate-x-1/2' :
            position === 'east' ? 'left-full ml-0.5 top-1/2 transform -translate-y-1/2' :
            'right-full mr-0.5 top-1/2 transform -translate-y-1/2'}
        `}>
          {player.hand.length}
        </div>
      )}
      
      {/* Screen reader announcement for valid moves */}
      {showCards && validMoves.length > 0 && (
        <span className="sr-only" role="status" aria-live="polite">
          {validMoves.length} playable card{validMoves.length !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default PlayerHand;