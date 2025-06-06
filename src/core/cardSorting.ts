import { Card, Suit } from './types';
import { naturalRankValue } from './cardRanking';

export enum SortStrategy {
  HUMAN_ALTERNATING = 'human_alternating',
  SUIT_GROUPED = 'suit_grouped',
  STRENGTH_BASED = 'strength_based'
}

const isRedSuit = (suit: Suit): boolean =>
  suit === Suit.Hearts || suit === Suit.Diamonds;

const groupCardsBySuit = (cards: Card[]): Map<Suit, Card[]> => {
  const groups = new Map<Suit, Card[]>();
  cards.forEach(card => {
    if (!groups.has(card.suit)) groups.set(card.suit, []);
    groups.get(card.suit)!.push(card);
  });
  return groups;
};

const sortCardsByRank = (cards: Card[]): Card[] =>
  cards.sort((a, b) => naturalRankValue(a.rank) - naturalRankValue(b.rank));

const arrangeSuitsAlternating = (
  suitGroups: Map<Suit, Card[]>,
  trumpSuit: Suit | null
): Suit[] => {
  const redSuits: Suit[] = [];
  const blackSuits: Suit[] = [];
  const suits = Array.from(suitGroups.keys());
  suits.forEach(suit => {
    if (suit !== trumpSuit) {
      if (isRedSuit(suit)) redSuits.push(suit);
      else blackSuits.push(suit);
    }
  });
  const arranged: Suit[] = [];
  const maxLen = Math.max(redSuits.length, blackSuits.length);
  const startRed = redSuits.length >= blackSuits.length;
  for (let i = 0; i < maxLen; i++) {
    if (startRed) {
      if (i < redSuits.length) arranged.push(redSuits[i]);
      if (i < blackSuits.length) arranged.push(blackSuits[i]);
    } else {
      if (i < blackSuits.length) arranged.push(blackSuits[i]);
      if (i < redSuits.length) arranged.push(redSuits[i]);
    }
  }
  if (trumpSuit && suitGroups.has(trumpSuit)) arranged.push(trumpSuit);
  return arranged;
};

export const sortHumanPlayerCards = (
  cards: Card[],
  trumpSuit: Suit | null
): Card[] => {
  if (cards.length === 0) return cards;
  const suitGroups = groupCardsBySuit(cards);
  suitGroups.forEach((cards, suit) => {
    suitGroups.set(suit, sortCardsByRank(cards));
  });
  const arrangedSuits = arrangeSuitsAlternating(suitGroups, trumpSuit);
  const sorted: Card[] = [];
  arrangedSuits.forEach(suit => {
    const suitCards = suitGroups.get(suit);
    if (suitCards) sorted.push(...suitCards);
  });
  return sorted;
};

const suitOrderList = (trumpSuit: Suit | null): Suit[] =>
  trumpSuit
    ? [trumpSuit, ...Object.values(Suit).filter(s => s !== trumpSuit)]
    : Object.values(Suit);

export const sortCards = (
  cards: Card[],
  trumpSuit: Suit | null,
  strategy: SortStrategy = SortStrategy.SUIT_GROUPED
): Card[] => {
  if (strategy === SortStrategy.HUMAN_ALTERNATING) {
    return sortHumanPlayerCards(cards, trumpSuit);
  }
  if (strategy === SortStrategy.STRENGTH_BASED) {
    return [...cards].sort((a, b) => {
      const suitDiff = suitOrderList(trumpSuit).indexOf(a.suit) - suitOrderList(trumpSuit).indexOf(b.suit);
      if (suitDiff !== 0) return suitDiff;
      const aIsTrump = a.suit === trumpSuit;
      const bIsTrump = b.suit === trumpSuit;
      return naturalRankValue(b.rank) - naturalRankValue(a.rank) + (aIsTrump ? 100 : 0) - (bIsTrump ? 100 : 0);
    });
  }
  return [...cards].sort((a, b) => {
    const suitDiff = suitOrderList(trumpSuit).indexOf(a.suit) - suitOrderList(trumpSuit).indexOf(b.suit);
    if (suitDiff !== 0) return suitDiff;
    return naturalRankValue(a.rank) - naturalRankValue(b.rank);
  });
};
