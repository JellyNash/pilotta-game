import { Card, Suit, Rank } from '../core/types';

// Define suit order for display
const SUIT_ORDER: Record<Suit, number> = {
  [Suit.Hearts]: 0,
  [Suit.Diamonds]: 1,
  [Suit.Clubs]: 2,
  [Suit.Spades]: 3
};

// Define rank order for sorting (Ace high)
const RANK_ORDER: Record<Rank, number> = {
  [Rank.Seven]: 0,
  [Rank.Eight]: 1,
  [Rank.Nine]: 2,
  [Rank.Ten]: 3,
  [Rank.Jack]: 4,
  [Rank.Queen]: 5,
  [Rank.King]: 6,
  [Rank.Ace]: 7
};

// Check if a suit is red
export function isRedSuit(suit: Suit): boolean {
  return suit === Suit.Hearts || suit === Suit.Diamonds;
}

// Sort cards with alternating colors for better visibility
export function sortCardsWithAlternatingColors(cards: Card[], trumpSuit?: Suit | null): Card[] {
  // First, sort cards normally
  const sortedCards = sortCards(cards, trumpSuit);
  
  // Then rearrange to alternate colors where possible
  const result: Card[] = [];
  const remaining = [...sortedCards];
  
  while (remaining.length > 0) {
    // Take the first available card
    const card = remaining.shift()!;
    result.push(card);
    
    // Try to find a card of opposite color for next position
    if (remaining.length > 0) {
      const currentIsRed = isRedSuit(card.suit);
      const oppositeColorIndex = remaining.findIndex(c => isRedSuit(c.suit) !== currentIsRed);
      
      if (oppositeColorIndex !== -1) {
        // Found opposite color, use it next
        const oppositeCard = remaining.splice(oppositeColorIndex, 1)[0];
        result.push(oppositeCard);
      }
    }
  }
  
  return result;
}

// Sort cards by suit first, then by rank within suit
export function sortCards(cards: Card[], trumpSuit?: Suit | null): Card[] {
  return [...cards].sort((a, b) => {
    // Trump cards always come first
    if (trumpSuit) {
      const aIsTrump = a.suit === trumpSuit;
      const bIsTrump = b.suit === trumpSuit;
      
      if (aIsTrump && !bIsTrump) return -1;
      if (!aIsTrump && bIsTrump) return 1;
    }
    
    // Then sort by suit
    const suitDiff = SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
    if (suitDiff !== 0) return suitDiff;
    
    // Finally sort by rank within the same suit
    return RANK_ORDER[a.rank] - RANK_ORDER[b.rank];
  });
}

// Group cards by suit for better visual organization
export function groupCardsBySuit(cards: Card[]): Map<Suit, Card[]> {
  const groups = new Map<Suit, Card[]>();
  
  cards.forEach(card => {
    if (!groups.has(card.suit)) {
      groups.set(card.suit, []);
    }
    groups.get(card.suit)!.push(card);
  });
  
  // Sort cards within each suit
  groups.forEach((suitCards, suit) => {
    groups.set(suit, suitCards.sort((a, b) => RANK_ORDER[a.rank] - RANK_ORDER[b.rank]));
  });
  
  return groups;
}

// Get spacing class based on card position and color
export function getCardSpacing(index: number, cards: Card[]): string {
  if (index === 0) return '';
  
  const currentCard = cards[index];
  const previousCard = cards[index - 1];
  
  // Check if we have same color cards in a row (not ideal for visibility)
  const currentIsRed = isRedSuit(currentCard.suit);
  const previousIsRed = isRedSuit(previousCard.suit);
  
  // Add slight extra spacing between same-color cards for better distinction
  if (currentIsRed === previousIsRed) {
    return 'ml-1'; // Small extra margin for same-color cards
  }
  
  return ''; // Normal spacing for alternating colors
}
