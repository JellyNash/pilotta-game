import { Rank, Suit, Card, CARD_VALUES } from './types';

export const TRUMP_RANKING: Rank[] = [
  Rank.Jack,
  Rank.Nine,
  Rank.Ace,
  Rank.Ten,
  Rank.King,
  Rank.Queen,
  Rank.Eight,
  Rank.Seven
];

export const NON_TRUMP_RANKING: Rank[] = [
  Rank.Ace,
  Rank.Ten,
  Rank.King,
  Rank.Queen,
  Rank.Jack,
  Rank.Nine,
  Rank.Eight,
  Rank.Seven
];

export const NATURAL_RANK_ORDER: Rank[] = [
  Rank.Seven,
  Rank.Eight,
  Rank.Nine,
  Rank.Ten,
  Rank.Jack,
  Rank.Queen,
  Rank.King,
  Rank.Ace
];

export function naturalRankValue(rank: Rank): number {
  return NATURAL_RANK_ORDER.indexOf(rank);
}

export function getStrength(card: Card, isTrump: boolean): number {
  const ranking = isTrump ? TRUMP_RANKING : NON_TRUMP_RANKING;
  return ranking.length - ranking.indexOf(card.rank);
}

export function getValue(card: Card, isTrump: boolean): number {
  const values = isTrump ? CARD_VALUES.trump : CARD_VALUES.nonTrump;
  return values[card.rank];
}

export function compareCards(a: Card, b: Card, trumpSuit: Suit | null, leadSuit: Suit): number {
  const aIsTrump = trumpSuit !== null && a.suit === trumpSuit;
  const bIsTrump = trumpSuit !== null && b.suit === trumpSuit;
  if (aIsTrump && !bIsTrump) return 1;
  if (!aIsTrump && bIsTrump) return -1;
  if (aIsTrump && bIsTrump) {
    return getStrength(a, true) - getStrength(b, true);
  }
  if (a.suit === leadSuit && b.suit !== leadSuit) return 1;
  if (a.suit !== leadSuit && b.suit === leadSuit) return -1;
  if (a.suit === b.suit) {
    return getStrength(a, false) - getStrength(b, false);
  }
  return 0;
}
