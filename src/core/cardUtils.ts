import { v4 as uuidv4 } from 'uuid';
import { Card, Suit, Rank, CARD_VALUES } from './types';
import { getStrength, getValue } from './cardRanking';

// Create a single card
export function createCard(suit: Suit, rank: Rank): Card {
  return {
    suit,
    rank,
    id: uuidv4()
  };
}

// Create a standard 32-card Pilotta deck
export function createDeck(): Card[] {
  const deck: Card[] = [];
  const suits = Object.values(Suit);
  const ranks = Object.values(Rank);
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push(createCard(suit, rank));
    }
  }
  
  return deck;
}

// Fisher-Yates shuffle algorithm
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// Get card value based on trump status
export function getCardValue(card: Card, isTrump: boolean): number {
  return getValue(card, isTrump);
}

// Get card strength for comparison (higher = stronger)
export function getCardStrength(card: Card, isTrump: boolean): number {
  return getStrength(card, isTrump);
}

// Compare two cards (returns positive if card1 wins, negative if card2 wins)
export function compareCards(card1: Card, card2: Card, trumpSuit: Suit | null, leadSuit: Suit): number {
  // If one is trump and other isn't, trump wins
  if (trumpSuit) {
    const card1IsTrump = card1.suit === trumpSuit;
    const card2IsTrump = card2.suit === trumpSuit;
    
    if (card1IsTrump && !card2IsTrump) return 1;
    if (!card1IsTrump && card2IsTrump) return -1;
    
    // Both trump or both non-trump
    if (card1IsTrump && card2IsTrump) {
      return getCardStrength(card1, true) - getCardStrength(card2, true);
    }
  }
  
  // Neither is trump - only cards of lead suit can win
  if (card1.suit === leadSuit && card2.suit !== leadSuit) return 1;
  if (card1.suit !== leadSuit && card2.suit === leadSuit) return -1;
  
  // Both same suit (lead suit) - compare strength
  if (card1.suit === leadSuit && card2.suit === leadSuit) {
    return getCardStrength(card1, false) - getCardStrength(card2, false);
  }
  
  // Neither can win (both off-suit, non-trump)
  return 0;
}

// Sort cards by suit and rank for display
export function sortCards(cards: Card[], trumpSuit: Suit | null = null): Card[] {
  const sorted = [...cards];
  
  // Define suit order (trump first if exists)
  const suitOrder = trumpSuit 
    ? [trumpSuit, ...Object.values(Suit).filter(s => s !== trumpSuit)]
    : Object.values(Suit);
  
  sorted.sort((a, b) => {
    // First sort by suit
    const suitDiff = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    if (suitDiff !== 0) return suitDiff;
    
    // Then by rank strength within suit
    const aIsTrump = a.suit === trumpSuit;
    const bIsTrump = b.suit === trumpSuit;
    return getCardStrength(b, aIsTrump) - getCardStrength(a, bIsTrump);
  });
  
  return sorted;
}

// Check if a card beats another in the context of a trick
export function cardBeats(challenger: Card, defender: Card, trumpSuit: Suit | null, leadSuit: Suit): boolean {
  return compareCards(challenger, defender, trumpSuit, leadSuit) > 0;
}

// Get all cards of a specific suit from a hand
export function getCardsOfSuit(cards: Card[], suit: Suit): Card[] {
  return cards.filter(card => card.suit === suit);
}

// Check if hand contains a specific suit
export function hasSuit(cards: Card[], suit: Suit): boolean {
  return cards.some(card => card.suit === suit);
}

// Count points in a set of cards
export function countCardPoints(cards: Card[], trumpSuit: Suit | null): number {
  return cards.reduce((total, card) => {
    const isTrump = card.suit === trumpSuit;
    return total + getCardValue(card, isTrump);
  }, 0);
}

// Get string representation of card (for debugging/display)
export function cardToString(card: Card): string {
  const suitSymbols = {
    [Suit.Hearts]: '♥',
    [Suit.Diamonds]: '♦',
    [Suit.Clubs]: '♣',
    [Suit.Spades]: '♠'
  };
  return `${card.rank}${suitSymbols[card.suit]}`;
}

// Deal cards to players (Pilotta style: 3-2-3)
export function dealCards(deck: Card[], numPlayers: number = 4): Card[][] {
  const hands: Card[][] = Array(numPlayers).fill(null).map(() => []);
  const dealPattern = [3, 2, 3]; // Cards per round of dealing
  let deckIndex = 0;
  
  for (const cardsPerPlayer of dealPattern) {
    for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
      for (let i = 0; i < cardsPerPlayer; i++) {
        hands[playerIndex].push(deck[deckIndex++]);
      }
    }
  }
  
  return hands;
}

// Create a card from string representation (for testing)
export function cardFromString(str: string): Card {
  const suitMap: Record<string, Suit> = {
    '♥': Suit.Hearts,
    '♦': Suit.Diamonds,
    '♣': Suit.Clubs,
    '♠': Suit.Spades,
    'H': Suit.Hearts,
    'D': Suit.Diamonds,
    'C': Suit.Clubs,
    'S': Suit.Spades
  };
  
  const rank = str.slice(0, -1) as Rank;
  const suitChar = str.slice(-1);
  const suit = suitMap[suitChar];
  
  if (!suit || !Object.values(Rank).includes(rank)) {
    throw new Error(`Invalid card string: ${str}`);
  }
  
  return createCard(suit, rank);
}

// Check if two cards are the same (by suit and rank, not ID)
export function cardsEqual(card1: Card, card2: Card): boolean {
  return card1.suit === card2.suit && card1.rank === card2.rank;
}

// Remove a card from an array
export function removeCard(cards: Card[], cardToRemove: Card): Card[] {
  return cards.filter(card => card.id !== cardToRemove.id);
}

// Find a card in an array by suit and rank
export function findCard(cards: Card[], suit: Suit, rank: Rank): Card | undefined {
  return cards.find(card => card.suit === suit && card.rank === rank);
}
