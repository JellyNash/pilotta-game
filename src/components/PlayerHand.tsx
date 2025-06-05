import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Player, Card as CardType, Suit } from '../core/types';
import Card from './Card';
import { sortHumanPlayerCards } from '../utils/cardSorting';
import { sortCards } from '../utils/cardSortUtils';
import { useAppSelector } from '../store/hooks';
import { useKeyboardNavigation } from '../accessibility';
/* PlayerHandArcImproved.css removed - using PlayerHandFlex component instead */

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedCardIndex, isKeyboardNavigationActive } = useKeyboardNavigation();
  
  // Sort cards based on player type - MAINTAIN EXACT CURRENT BEHAVIOR
  const sortedCards = useMemo(() => {
    if (!showCards) return player.hand;
    
    if (player.isAI) {
      return sortCards(player.hand, trumpSuit);
    } else {
      // Human player gets special sorting
      return sortHumanPlayerCards(player.hand, trumpSuit);
    }
  }, [player.hand, player.isAI, trumpSuit, showCards]);


  return (
    <div 
      className="ph-wrapper"
      data-position={position}
      data-hovering={hoveredIndex !== null}
      ref={containerRef}
    >
      <div className="ph-container">
        {sortedCards.map((card, index) => {
          const isValid = validMoves.some(c => c.id === card.id);
          const isSelected = selectedCard?.id === card.id;
          const isTrump = trumpSuit === card.suit;
          const isHovered = hoveredCardId === card.id;
          const isKeyboardSelected = position === 'south' && isKeyboardNavigationActive && selectedCardIndex === index;
          
          // Only pass the card index for z-index calculation
          const cardStyle = {
            '--card-index': index,
          } as React.CSSProperties;
          
          return (
            <div
              key={card.id}
              className={`ph-card-slot ${isSelected ? 'ph-selected' : ''} ${isHovered ? 'ph-hovered' : ''} ${isKeyboardSelected ? 'ph-keyboard-selected' : ''}`}
              style={cardStyle}
              onMouseEnter={() => {
                if (showCards) {
                  setHoveredCardId(card.id);
                  setHoveredIndex(index);
                }
              }}
              onMouseLeave={() => {
                if (showCards) {
                  setHoveredCardId(null);
                  setHoveredIndex(null);
                }
              }}
            >
              <Card
                card={card}
                isValid={showCards && isValid}
                isSelected={isSelected}
                isKeyboardSelected={isKeyboardSelected}
                isTrump={isTrump}
                teamId={player.teamId as 'team1' | 'team2' | undefined}
                onClick={showCards ? () => {
                  if (onCardClick) onCardClick(card);
                  if (isValid && onCardPlay) {
                    onCardPlay(card);
                  }
                } : undefined}
                isDraggable={showCards && isValid}
                size="responsive"
                faceDown={!showCards}
                className={`${!showCards && position !== 'south' ? 'back-design' : ''} card-position-${position}`}
              />
            </div>
          );
        })}
      </div>
      
      {/* Card count badge for AI players */}
      {!showCards && player.hand.length > 0 && (
        <div className="absolute top-2 right-2 bg-slate-800/90 text-white px-2 py-1 rounded-full text-sm font-bold">
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