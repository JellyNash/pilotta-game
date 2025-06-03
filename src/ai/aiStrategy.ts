import {
  Card,
  Player,
  GameState,
  Suit,
  Rank,
  AIPersonality,
  PlayerProfile,
  TrickCard,
  Contract
} from '../core/types';
import {
  getCardValue,
  getCardStrength,
  hasSuit,
  getCardsOfSuit,
  countCardPoints,
  sortCards,
  compareCards
} from '../core/cardUtils';
import {
  getLegalPlays,
  findAllDeclarations,
  checkBelote,
  determineTrickWinner
} from '../core/gameRules';

// AI Hand evaluation for bidding
export interface HandEvaluation {
  suitStrengths: Map<Suit, number>;
  bestSuit: Suit;
  bestSuitScore: number;
  totalHighCards: number;
  declarationBonus: number;
  suggestedBid: number;
  confidence: number; // 0-1 scale
}

// Evaluate hand strength for bidding
export function evaluateHandForBidding(
  hand: Card[],
  personality: AIPersonality,
  playerProfile?: PlayerProfile
): HandEvaluation {
  const suitStrengths = new Map<Suit, number>();
  let totalHighCards = 0;
  
  // Evaluate each suit as potential trump
  for (const suit of Object.values(Suit)) {
    let suitScore = 0;
    const suitCards = getCardsOfSuit(hand, suit);
    
    // Count trump values
    for (const card of suitCards) {
      suitScore += getCardValue(card, true);
      
      // Bonus for high trumps
      if (card.rank === Rank.Jack) suitScore += 10; // Jack is very strong
      if (card.rank === Rank.Nine) suitScore += 5;  // Nine is strong
    }
    
    // Length bonus (more cards = more control)
    if (suitCards.length >= 4) suitScore += (suitCards.length - 3) * 5;
    if (suitCards.length >= 6) suitScore += 10; // Very long suit
    
    // Check for potential Belote
    if (checkBelote(suitCards, suit)) {
      suitScore += 20; // Belote points
    }
    
    suitStrengths.set(suit, suitScore);
  }
  
  // Count high cards in other suits
  for (const suit of Object.values(Suit)) {
    const nonTrumpCards = getCardsOfSuit(hand, suit);
    for (const card of nonTrumpCards) {
      if (card.rank === Rank.Ace) totalHighCards += 11;
      if (card.rank === Rank.Ten) totalHighCards += 10;
    }
  }
  
  // Find best suit
  let bestSuit = Suit.Hearts;
  let bestSuitScore = 0;
  for (const [suit, score] of suitStrengths) {
    if (score > bestSuitScore) {
      bestSuit = suit;
      bestSuitScore = score;
    }
  }
  
  // Check for declarations
  const declarations = findAllDeclarations(hand, null!);
  const declarationBonus = declarations.reduce((sum, decl) => sum + decl.points, 0);
  
  // Calculate suggested bid based on personality
  let baseBid = Math.floor((bestSuitScore + totalHighCards / 2 + declarationBonus) / 10) * 10;
  let confidence = bestSuitScore / 60; // Normalize to 0-1
  
  // Adjust for personality
  switch (personality) {
    case AIPersonality.Conservative:
      baseBid = Math.max(80, baseBid - 20);
      confidence *= 0.8;
      break;
    case AIPersonality.Aggressive:
      baseBid = Math.min(160, baseBid + 20);
      confidence *= 1.2;
      break;
    case AIPersonality.Adaptive:
      // Use player profile if available
      if (playerProfile) {
        baseBid = Math.round(baseBid * (1 + playerProfile.bidAggressiveness - 0.5));
      }
      break;
  }
  
  // Ensure valid bid
  baseBid = Math.max(80, Math.min(160, Math.round(baseBid / 10) * 10));
  
  // Consider capot for very strong hands
  if (bestSuitScore > 80 && declarationBonus > 100) {
    baseBid = 250;
    confidence = 0.9;
  }
  
  return {
    suitStrengths,
    bestSuit,
    bestSuitScore,
    totalHighCards,
    declarationBonus,
    suggestedBid: baseBid,
    confidence: Math.min(1, confidence)
  };
}

// Decide whether to bid or pass
export function decideBid(
  hand: Card[],
  currentBid: { value: number; trump: Suit } | null,
  personality: AIPersonality,
  playerProfile?: PlayerProfile,
  gameContext?: { teamScore: number; opponentScore: number; targetScore: number }
): { bid: number; trump: Suit } | null {
  const evaluation = evaluateHandForBidding(hand, personality, playerProfile);
  
  // Adjust confidence based on game context
  let adjustedConfidence = evaluation.confidence;
  if (gameContext) {
    const scoreDiff = gameContext.teamScore - gameContext.opponentScore;
    const closeToWin = gameContext.teamScore > gameContext.targetScore * 0.8;
    
    if (scoreDiff < -50 && !closeToWin) {
      // Behind - be more aggressive
      adjustedConfidence *= 1.2;
    } else if (scoreDiff > 50 || closeToWin) {
      // Ahead or close to winning - be more conservative
      adjustedConfidence *= 0.8;
    }
  }
  
  // Decide based on confidence and current bid
  const minimumConfidence = personality === AIPersonality.Aggressive ? 0.4 : 0.6;
  
  if (adjustedConfidence < minimumConfidence) {
    return null; // Pass
  }
  
  // If no current bid, open if confident enough
  if (!currentBid) {
    if (evaluation.suggestedBid >= 80) {
      return { bid: evaluation.suggestedBid, trump: evaluation.bestSuit };
    }
    return null;
  }
  
  // Need to outbid
  const requiredBid = currentBid.value + 10;
  
  // Check if we can outbid with our preferred suit
  if (evaluation.suggestedBid >= requiredBid) {
    return { bid: requiredBid, trump: evaluation.bestSuit };
  }
  
  // Check other suits if desperate
  if (personality === AIPersonality.Aggressive && adjustedConfidence > 0.7) {
    for (const [suit, score] of evaluation.suitStrengths) {
      if (suit !== evaluation.bestSuit && score > 40) {
        return { bid: requiredBid, trump: suit };
      }
    }
  }
  
  return null; // Pass
}

// Card play strategy
export interface PlayDecision {
  card: Card;
  reasoning: string;
  confidence: number;
}

// Decide which card to play
export function decideCardPlay(
  hand: Card[],
  currentTrick: TrickCard[],
  completedTricks: TrickCard[][],
  trumpSuit: Suit | null,
  contract: Contract | null,
  player: Player,
  personality: AIPersonality,
  gameState: GameState
): PlayDecision {
  const legalPlays = getLegalPlays(hand, currentTrick, trumpSuit);
  
  // If only one legal play, no decision needed
  if (legalPlays.length === 1) {
    return {
      card: legalPlays[0],
      reasoning: 'Only legal play',
      confidence: 1.0
    };
  }
  
  // Leading the trick
  if (currentTrick.length === 0) {
    return decideLeadCard(legalPlays, hand, trumpSuit, contract, player, personality, gameState);
  }
  
  // Following in trick
  return decideFollowCard(
    legalPlays, 
    hand, 
    currentTrick, 
    trumpSuit, 
    contract, 
    player, 
    personality, 
    gameState
  );
}

// Decide which card to lead with
function decideLeadCard(
  legalPlays: Card[],
  hand: Card[],
  trumpSuit: Suit | null,
  contract: Contract | null,
  player: Player,
  personality: AIPersonality,
  gameState: GameState
): PlayDecision {
  // Simple strategy for leading
  
  // If we have high trumps and need points, lead trump
  if (trumpSuit && contract && player.teamId === contract.team) {
    const trumps = getCardsOfSuit(legalPlays, trumpSuit);
    const highTrumps = trumps.filter(c => 
      c.rank === Rank.Jack || c.rank === Rank.Nine || c.rank === Rank.Ace
    );
    
    if (highTrumps.length > 0) {
      // Lead with a high trump to draw out opponent trumps
      const card = highTrumps[0];
      return {
        card,
        reasoning: 'Leading high trump to control',
        confidence: 0.9
      };
    }
  }
  
  // Lead with sure winners (Aces in side suits)
  const nonTrumpAces = legalPlays.filter(c => 
    c.rank === Rank.Ace && c.suit !== trumpSuit
  );
  
  if (nonTrumpAces.length > 0) {
    return {
      card: nonTrumpAces[0],
      reasoning: 'Leading sure winner',
      confidence: 0.85
    };
  }
  
  // Lead low cards from long suits
  const suitCounts = new Map<Suit, number>();
  for (const card of hand) {
    suitCounts.set(card.suit, (suitCounts.get(card.suit) || 0) + 1);
  }
  
  let longestSuit: Suit | null = null;
  let maxLength = 0;
  for (const [suit, count] of suitCounts) {
    if (count > maxLength && suit !== trumpSuit) {
      longestSuit = suit;
      maxLength = count;
    }
  }
  
  if (longestSuit) {
    const suitCards = getCardsOfSuit(legalPlays, longestSuit);
    if (suitCards.length > 0) {
      // Lead lowest from long suit
      const sorted = sortCards(suitCards, trumpSuit);
      return {
        card: sorted[sorted.length - 1],
        reasoning: 'Leading from long suit',
        confidence: 0.7
      };
    }
  }
  
  // Default: lead lowest card
  const sorted = sortCards(legalPlays, trumpSuit);
  return {
    card: sorted[sorted.length - 1],
    reasoning: 'Leading low card',
    confidence: 0.5
  };
}

// Decide which card to play when following
function decideFollowCard(
  legalPlays: Card[],
  hand: Card[],
  currentTrick: TrickCard[],
  trumpSuit: Suit | null,
  contract: Contract | null,
  player: Player,
  personality: AIPersonality,
  gameState: GameState
): PlayDecision {
  // Safety check - should not happen, but defensive programming
  if (currentTrick.length === 0) {
    const sorted = sortCards(legalPlays, trumpSuit);
    return {
      card: sorted[0],
      reasoning: 'Error: No lead card, playing highest',
      confidence: 0.5
    };
  }
  
  const leadSuit = currentTrick[0].card.suit;
  
  // Determine current winner
  const trickSoFar = [...currentTrick];
  let currentWinnerIndex = 0;
  for (let i = 1; i < trickSoFar.length; i++) {
    if (compareCards(
      trickSoFar[i].card, 
      trickSoFar[currentWinnerIndex].card, 
      trumpSuit, 
      leadSuit
    ) > 0) {
      currentWinnerIndex = i;
    }
  }
  
  const currentWinner = trickSoFar[currentWinnerIndex].player;
  const partnerWinning = currentWinner.teamId === player.teamId;
  
  // If partner is winning and we're last to play, play low
  if (partnerWinning && currentTrick.length === 3) {
    const sorted = sortCards(legalPlays, trumpSuit);
    return {
      card: sorted[sorted.length - 1],
      reasoning: 'Partner winning, playing low',
      confidence: 0.9
    };
  }
  
  // Try to win if opponents are winning
  if (!partnerWinning) {
    // Find cards that can win
    const winningCards = legalPlays.filter(card => {
      return compareCards(
        card, 
        trickSoFar[currentWinnerIndex].card, 
        trumpSuit, 
        leadSuit
      ) > 0;
    });
    
    if (winningCards.length > 0) {
      // Play lowest winning card
      const sorted = sortCards(winningCards, trumpSuit);
      return {
        card: sorted[sorted.length - 1],
        reasoning: 'Taking trick from opponents',
        confidence: 0.85
      };
    }
  }
  
  // Can't win or don't need to - play low
  const sorted = sortCards(legalPlays, trumpSuit);
  
  // If we must trump but can't win, play lowest trump
  if (legalPlays[0].suit === trumpSuit && leadSuit !== trumpSuit) {
    return {
      card: sorted[sorted.length - 1],
      reasoning: 'Forced to trump, playing low',
      confidence: 0.7
    };
  }
  
  // Play lowest card
  return {
    card: sorted[sorted.length - 1],
    reasoning: 'Cannot win, playing low',
    confidence: 0.6
  };
}

// Update player profile based on observed behavior
export function updatePlayerProfile(
  profile: PlayerProfile,
  moveHistory: any[],
  gameResult: { won: boolean; finalScore: number }
): PlayerProfile {
  // This is a simplified version - in reality, you'd use more sophisticated analysis
  
  const recentBids = moveHistory
    .filter(m => m.action === 'bid' && m.details.bid !== 'pass')
    .slice(-10);
  
  if (recentBids.length > 0) {
    const avgBid = recentBids.reduce((sum, m) => sum + m.details.bid, 0) / recentBids.length;
    profile.averageBidValue = profile.averageBidValue * 0.7 + avgBid * 0.3; // Exponential smoothing
    
    // Update aggressiveness
    const highBids = recentBids.filter(m => m.details.bid >= 120).length;
    const aggressiveness = highBids / recentBids.length;
    profile.bidAggressiveness = profile.bidAggressiveness * 0.7 + aggressiveness * 0.3;
  }
  
  // Update games played
  profile.gamesPlayed++;
  
  // Determine play style based on patterns
  if (profile.bidAggressiveness > 0.6) {
    profile.playStyle = 'aggressive';
  } else if (profile.bidAggressiveness < 0.4) {
    profile.playStyle = 'conservative';
  } else {
    profile.playStyle = 'balanced';
  }
  
  return profile;
}

// Create initial player profile
export function createInitialProfile(): PlayerProfile {
  return {
    bidAggressiveness: 0.5,
    trumpPreferences: {
      [Suit.Hearts]: 0.25,
      [Suit.Diamonds]: 0.25,
      [Suit.Clubs]: 0.25,
      [Suit.Spades]: 0.25
    },
    averageBidValue: 100,
    riskTolerance: 0.5,
    declarationFrequency: 0.3,
    playStyle: 'balanced',
    gamesPlayed: 0
  };
}
