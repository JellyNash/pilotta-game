import { useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { playCard } from '../store/gameSlice';
import { useAccessibility } from './AccessibilityContext';

export const useKeyboardNavigation = () => {
  const dispatch = useAppDispatch();
  const { settings, announceToScreenReader } = useAccessibility();
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  
  const currentPlayer = useAppSelector(state => state.game.currentPlayer);
  const currentPhase = useAppSelector(state => state.game.currentPhase);
  const humanPlayerHand = useAppSelector(state => {
    const humanPlayer = state.game.players.find(p => p.isHuman);
    return humanPlayer?.hand || [];
  });

  const isHumanTurn = currentPlayer === 'south' && currentPhase === 'playing';

  // Select card with keyboard
  const selectCard = useCallback((index: number) => {
    if (!settings.keyboard.enabled || !isHumanTurn) return;
    
    const clampedIndex = Math.max(0, Math.min(index, humanPlayerHand.length - 1));
    setSelectedCardIndex(clampedIndex);
    
    const card = humanPlayerHand[clampedIndex];
    if (card) {
      announceToScreenReader(
        `Selected ${card.rank} of ${card.suit}. Press Enter or Space to play.`,
        'polite'
      );
    }
  }, [settings.keyboard.enabled, isHumanTurn, humanPlayerHand, announceToScreenReader]);

  // Play selected card
  const playSelectedCard = useCallback(() => {
    if (!settings.keyboard.enabled || !isHumanTurn || selectedCardIndex === null) return;
    
    const card = humanPlayerHand[selectedCardIndex];
    if (card) {
      dispatch(playCard({ playerId: 'south', card }));
      announceToScreenReader(`Played ${card.rank} of ${card.suit}`, 'assertive');
      setSelectedCardIndex(null);
    }
  }, [settings.keyboard.enabled, isHumanTurn, selectedCardIndex, humanPlayerHand, dispatch, announceToScreenReader]);

  // Keyboard event handler
  useEffect(() => {
    if (!settings.keyboard.enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isHumanTurn) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (selectedCardIndex === null) {
            selectCard(0);
          } else {
            selectCard(selectedCardIndex - 1);
          }
          break;
          
        case 'ArrowRight':
          e.preventDefault();
          if (selectedCardIndex === null) {
            selectCard(0);
          } else {
            selectCard(selectedCardIndex + 1);
          }
          break;
          
        case 'Home':
          e.preventDefault();
          selectCard(0);
          break;
          
        case 'End':
          e.preventDefault();
          selectCard(humanPlayerHand.length - 1);
          break;
          
        case 'Enter':
        case ' ':
          e.preventDefault();
          playSelectedCard();
          break;
          
        case 'Escape':
          e.preventDefault();
          setSelectedCardIndex(null);
          announceToScreenReader('Card selection cancelled', 'polite');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboard.enabled, isHumanTurn, selectedCardIndex, selectCard, playSelectedCard, humanPlayerHand.length, announceToScreenReader]);

  // Reset selection when it's not human turn
  useEffect(() => {
    if (!isHumanTurn) {
      setSelectedCardIndex(null);
    }
  }, [isHumanTurn]);

  return {
    selectedCardIndex,
    selectCard,
    playSelectedCard,
    isKeyboardNavigationActive: settings.keyboard.enabled && isHumanTurn
  };
};