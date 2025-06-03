import React, { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '../core/types';
import { useContainerQuery } from '../hooks/useResponsive';

interface ResponsiveCardHandProps {
  cards: CardType[];
  position: 'north' | 'east' | 'south' | 'west';
  isHuman?: boolean;
  showCards?: boolean;
  selectedCard?: CardType | null;
  validMoves?: CardType[];
  onCardClick?: (card: CardType) => void;
  onCardPlay?: (card: CardType) => void;
  renderCard: (card: CardType, index: number, total: number) => React.ReactNode;
}

/**
 * Responsive card hand that adapts to container size
 * Uses container queries for true component-level responsiveness
 */
export const ResponsiveCardHand: React.FC<ResponsiveCardHandProps> = ({
  cards,
  position,
  isHuman = false,
  showCards = false,
  selectedCard,
  validMoves = [],
  onCardClick,
  onCardPlay,
  renderCard
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: containerWidth, height: containerHeight } = useContainerQuery(containerRef);

  // Calculate responsive card layout
  const layout = useMemo(() => {
    if (!containerWidth || !containerHeight) {
      return { cardWidth: 60, cardHeight: 90, overlap: 0.5, fanAngle: 0 };
    }

    // Adaptive sizing based on container and card count
    const isVertical = position === 'east' || position === 'west';
    const availableSpace = isVertical ? containerHeight : containerWidth;
    const cardCount = cards.length;

    // Calculate optimal card size
    let baseCardWidth = isHuman ? 80 : 60;
    let baseCardHeight = baseCardWidth * 1.4; // Standard card ratio

    // Scale based on available space
    if (availableSpace < 600) {
      baseCardWidth *= 0.8;
      baseCardHeight *= 0.8;
    } else if (availableSpace > 1200) {
      baseCardWidth *= 1.2;
      baseCardHeight *= 1.2;
    }

    // Calculate overlap to fit all cards
    const totalWidthNeeded = baseCardWidth * cardCount;
    const overlap = totalWidthNeeded > availableSpace 
      ? Math.max(0.3, 1 - (availableSpace - baseCardWidth) / (totalWidthNeeded - baseCardWidth))
      : 0;

    // Fan angle for human player (south position)
    const fanAngle = isHuman && !isVertical ? Math.min(30, cardCount * 2) : 0;

    return {
      cardWidth: baseCardWidth,
      cardHeight: baseCardHeight,
      overlap,
      fanAngle,
      containerWidth,
      containerHeight
    };
  }, [containerWidth, containerHeight, cards.length, position, isHuman]);

  // Calculate card positions with responsive logic
  const getCardTransform = (index: number, total: number) => {
    const { cardWidth, overlap, fanAngle } = layout;
    const center = (total - 1) / 2;
    const offset = index - center;

    if (position === 'south' && isHuman) {
      // Human player - fan layout
      const xSpacing = cardWidth * (1 - overlap);
      const x = offset * xSpacing;
      const rotation = (offset * fanAngle) / total;
      const y = Math.abs(offset) * 2; // Slight arc

      return {
        x,
        y,
        rotate: rotation,
        scale: selectedCard?.id === cards[index].id ? 1.1 : 1
      };
    }

    // AI players - linear layout
    const isVertical = position === 'east' || position === 'west';
    if (isVertical) {
      const ySpacing = layout.cardHeight * (1 - overlap) * 0.3;
      return {
        x: 0,
        y: offset * ySpacing,
        rotate: position === 'east' ? 90 : -90,
        scale: 1
      };
    } else {
      const xSpacing = cardWidth * (1 - overlap);
      return {
        x: offset * xSpacing,
        y: 0,
        rotate: 0,
        scale: 1
      };
    }
  };

  // Hover animation for human player
  const getHoverAnimation = (index: number) => {
    if (!isHuman || !showCards) return {};

    return {
      whileHover: {
        y: -20,
        scale: 1.05,
        zIndex: 50,
        transition: { type: 'spring', stiffness: 400, damping: 25 }
      }
    };
  };

  const containerClasses = `
    relative flex items-center justify-center
    ${position === 'south' ? 'pb-4' : ''}
    ${position === 'north' ? 'pt-4' : ''}
    ${position === 'east' ? 'pr-4' : ''}
    ${position === 'west' ? 'pl-4' : ''}
  `;

  return (
    <div ref={containerRef} className={containerClasses} style={{ width: '100%', height: '100%' }}>
      <div className="relative" style={{ 
        width: layout.containerWidth || 'auto',
        height: layout.cardHeight
      }}>
        {cards.map((card, index) => {
          const transform = getCardTransform(index, cards.length);
          const isValid = validMoves.some(m => m.id === card.id);
          
          return (
            <motion.div
              key={card.id}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                width: layout.cardWidth,
                height: layout.cardHeight,
                marginLeft: -layout.cardWidth / 2,
                marginTop: -layout.cardHeight / 2,
                zIndex: index + (selectedCard?.id === card.id ? 100 : 0)
              }}
              initial={false}
              animate={transform}
              {...getHoverAnimation(index)}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={() => isHuman && showCards && onCardClick?.(card)}
              onDoubleClick={() => isHuman && showCards && isValid && onCardPlay?.(card)}
            >
              {renderCard(card, index, cards.length)}
            </motion.div>
          );
        })}
      </div>

      <style jsx>{`
        @container (max-width: 400px) {
          .relative {
            transform: scale(0.8);
          }
        }

        @container (min-width: 1000px) {
          .relative {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};