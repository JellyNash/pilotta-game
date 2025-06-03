import { Card, Suit, Rank } from '../core/types';

// Define rank order (7 is lowest, A is highest)
const RANK_ORDER: Record<Rank, number> = {
  [Rank.Seven]: 1,
  [Rank.Eight]: 2,
  [Rank.Nine]: 3,
  [Rank.Ten]: 4,
  [Rank.Jack]: 5,
  [Rank.Queen]: 6,
  [Rank.King]: 7,
  [Rank.Ace]: 8
};

// Check if a suit is red
const isRedSuit = (suit: Suit): boolean => {
  return suit === Suit.Hearts || suit === Suit.Diamonds;
};

// Group cards by suit
const groupCardsBySuit = (cards: Card[]): Map<Suit, Card[]> => {
  const groups = new Map<Suit, Card[]>();
  
  cards.forEach(card => {
    if (!groups.has(card.suit)) {
      groups.set(card.suit, []);
    }
    groups.get(card.suit)!.push(card);
  });
  
  return groups;
};

// Sort cards within a suit by rank (7 to A)
const sortCardsByRank = (cards: Card[]): Card[] => {
  return cards.sort((a, b) => RANK_ORDER[a.rank] - RANK_ORDER[b.rank]);
};

// Arrange suits in alternating red-black pattern
const arrangeSuitsAlternating = (
  suitGroups: Map<Suit, Card[]>, 
  trumpSuit: Suit | null
): Suit[] => {
  const redSuits: Suit[] = [];
  const blackSuits: Suit[] = [];
  const suits = Array.from(suitGroups.keys());
  
  // Separate red and black suits (excluding trump)
  suits.forEach(suit => {
    if (suit !== trumpSuit) {
      if (isRedSuit(suit)) {
        redSuits.push(suit);
      } else {
        blackSuits.push(suit);
      }
    }
  });
  
  // Build alternating pattern
  const arrangedSuits: Suit[] = [];
  const maxLength = Math.max(redSuits.length, blackSuits.length);
  
  // Start with red if we have more red suits, otherwise start with black
  const startWithRed = redSuits.length >= blackSuits.length;
  
  for (let i = 0; i < maxLength; i++) {
    if (startWithRed) {
      if (i < redSuits.length) arrangedSuits.push(redSuits[i]);
      if (i < blackSuits.length) arrangedSuits.push(blackSuits[i]);
    } else {
      if (i < blackSuits.length) arrangedSuits.push(blackSuits[i]);
      if (i < redSuits.length) arrangedSuits.push(redSuits[i]);
    }
  }
  
  // Add trump suit at the end (far right)
  if (trumpSuit && suitGroups.has(trumpSuit)) {
    arrangedSuits.push(trumpSuit);
  }
  
  return arrangedSuits;
};

/**
 * Sort human player's cards according to the rules:
 * 1. Group by suit
 * 2. Sort within each suit from 7 to A
 * 3. Arrange suits in alternating red-black pattern
 * 4. Place trump suit on the far right
 */
export const sortHumanPlayerCards = (cards: Card[], trumpSuit: Suit | null): Card[] => {
  if (cards.length === 0) return cards;
  
  // Group cards by suit
  const suitGroups = groupCardsBySuit(cards);
  
  // Sort cards within each suit
  suitGroups.forEach((cards, suit) => {
    suitGroups.set(suit, sortCardsByRank(cards));
  });
  
  // Arrange suits in alternating pattern with trump at the end
  const arrangedSuits = arrangeSuitsAlternating(suitGroups, trumpSuit);
  
  // Build final sorted hand
  const sortedCards: Card[] = [];
  arrangedSuits.forEach(suit => {
    const suitCards = suitGroups.get(suit);
    if (suitCards) {
      sortedCards.push(...suitCards);
    }
  });
  
  return sortedCards;
};

/**
 * Get a display name for a suit
 */
export const getSuitDisplayName = (suit: Suit): string => {
  const names: Record<Suit, string> = {
    [Suit.Hearts]: 'Hearts',
    [Suit.Diamonds]: 'Diamonds',
    [Suit.Clubs]: 'Clubs',
    [Suit.Spades]: 'Spades'
  };
  return names[suit];
};

/**
 * Get the color of a suit for display
 */
export const getSuitColor = (suit: Suit): string => {
  return isRedSuit(suit) ? 'red' : 'black';
};
