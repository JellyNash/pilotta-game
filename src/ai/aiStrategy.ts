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
  // Analyze contract situation for leading
  const contractSituation = analyzeContractSituation(gameState, player, []);
  
  // If we have the contract and need specific points
  if (contractSituation.isContractTeam && trumpSuit) {
    const trumps = getCardsOfSuit(legalPlays, trumpSuit);
    const highTrumps = trumps.filter(c => 
      c.rank === Rank.Jack || c.rank === Rank.Nine || c.rank === Rank.Ace
    );
    
    // If we're close to making contract, lead high trumps to secure it
    if (contractSituation.pointsNeeded <= 30 && highTrumps.length > 0) {
      const card = highTrumps[0];
      return {
        card,
        reasoning: `Leading high trump, need ${contractSituation.pointsNeeded} points for contract`,
        confidence: 0.95
      };
    }
    
    // If we need many points, save high trumps for capturing opponent's high cards
    if (contractSituation.pointsNeeded > 50 && trumps.length > 0) {
      // Lead low trump to see who has what
      const sorted = sortCards(trumps, trumpSuit);
      return {
        card: sorted[sorted.length - 1],
        reasoning: 'Leading low trump to probe',
        confidence: 0.7
      };
    }
  }
  
  // If defending and contract team is close to making it
  if (!contractSituation.isContractTeam && contractSituation.pointsNeeded <= 20) {
    // Lead our high cards to take points
    const highCards = legalPlays.filter(c => 
      c.rank === Rank.Ace || c.rank === Rank.Ten || 
      (c.suit === trumpSuit && (c.rank === Rank.Jack || c.rank === Rank.Nine))
    );
    
    if (highCards.length > 0) {
      return {
        card: highCards[0],
        reasoning: 'Leading high card to deny points',
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

// Calculate contract points situation
function analyzeContractSituation(
  gameState: GameState,
  player: Player,
  currentTrick: TrickCard[]
): {
  isContractTeam: boolean;
  currentTeamPoints: number;
  opponentPoints: number;
  pointsNeeded: number;
  pointsRemaining: number;
  mustWinTrick: boolean;
  canAffordToLose: boolean;
} {
  const contract = gameState.contract;
  if (!contract) {
    return {
      isContractTeam: false,
      currentTeamPoints: 0,
      opponentPoints: 0,
      pointsNeeded: 0,
      pointsRemaining: 152,
      mustWinTrick: false,
      canAffordToLose: true
    };
  }

  const isContractTeam = player.teamId === contract.team;
  const teamPoints = gameState.teams[player.teamId].roundScore;
  const opponentTeamId = player.teamId === 'A' ? 'B' : 'A';
  const opponentPoints = gameState.teams[opponentTeamId].roundScore;
  
  // Calculate points already in the current trick
  let trickPoints = 0;
  for (const tc of currentTrick) {
    trickPoints += countCardPoints([tc.card], gameState.trumpSuit);
  }
  
  // Calculate remaining points in play
  const totalPointsPlayed = teamPoints + opponentPoints + trickPoints;
  const pointsRemaining = 152 - totalPointsPlayed + 10; // +10 for last trick
  
  let pointsNeeded = 0;
  let mustWinTrick = false;
  let canAffordToLose = true;
  
  if (isContractTeam) {
    // We have the contract - calculate what we need
    pointsNeeded = contract.value - teamPoints;
    
    // Check if we must win this trick
    const remainingTricks = 8 - gameState.completedTricks.length;
    const maxPointsIfWeLoseThis = pointsRemaining - trickPoints - (remainingTricks > 1 ? 10 : 0);
    
    mustWinTrick = teamPoints + maxPointsIfWeLoseThis < contract.value;
    canAffordToLose = teamPoints + trickPoints >= contract.value || 
                      teamPoints + pointsRemaining >= contract.value + 20; // 20 point buffer
  } else {
    // We're defending - calculate what we need to prevent
    const contractTeamPoints = gameState.teams[contract.team].roundScore;
    pointsNeeded = contract.value - contractTeamPoints;
    
    // We should try to win high-value tricks to deny points
    mustWinTrick = trickPoints >= 10 && pointsNeeded <= pointsRemaining;
    canAffordToLose = contractTeamPoints + pointsRemaining < contract.value;
  }
  
  return {
    isContractTeam,
    currentTeamPoints: teamPoints,
    opponentPoints,
    pointsNeeded,
    pointsRemaining,
    mustWinTrick,
    canAffordToLose
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
  
  // Analyze contract situation
  const contractSituation = analyzeContractSituation(gameState, player, currentTrick);
  
  // Calculate current trick value
  let trickValue = 0;
  for (const tc of currentTrick) {
    trickValue += countCardPoints([tc.card], trumpSuit);
  }
  
  // If partner is winning and we're last to play
  if (partnerWinning && currentTrick.length === 3) {
    // Check if we should throw a high value card to help make contract
    if (contractSituation.isContractTeam && contractSituation.pointsNeeded > 0) {
      // We need points - consider throwing high cards
      const highValueCards = legalPlays.filter(c => 
        countCardPoints([c], trumpSuit) >= 10
      );
      
      if (highValueCards.length > 0 && 
          trickValue + countCardPoints([highValueCards[0]], trumpSuit) <= contractSituation.pointsNeeded) {
        return {
          card: highValueCards[0],
          reasoning: `Partner winning, adding ${countCardPoints([highValueCards[0]], trumpSuit)} points for contract`,
          confidence: 0.95
        };
      }
    }
    
    // Otherwise play low
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
      // If we must win this trick for contract reasons
      if (contractSituation.mustWinTrick) {
        // Play a strong winning card
        const sorted = sortCards(winningCards, trumpSuit);
        return {
          card: sorted[0],
          reasoning: 'Must win trick for contract',
          confidence: 0.95
        };
      }
      
      // If defending and trick has high value, win it
      if (!contractSituation.isContractTeam && trickValue >= 10) {
        const sorted = sortCards(winningCards, trumpSuit);
        return {
          card: sorted[sorted.length - 1],
          reasoning: `Denying ${trickValue} points to contract team`,
          confidence: 0.9
        };
      }
      
      // Play lowest winning card
      const sorted = sortCards(winningCards, trumpSuit);
      return {
        card: sorted[sorted.length - 1],
        reasoning: 'Taking trick from opponents',
        confidence: 0.85
      };
    }
  }
  
  // Can't win - decide what to throw away based on contract situation
  const sorted = sortCards(legalPlays, trumpSuit);
  
  // If we're defending and opponent is winning a high-value trick
  if (!contractSituation.isContractTeam && !partnerWinning && trickValue >= 15) {
    // Don't give them more points - play lowest value card
    const sortedByValue = [...legalPlays].sort((a, b) => 
      countCardPoints([a], trumpSuit) - countCardPoints([b], trumpSuit)
    );
    return {
      card: sortedByValue[0],
      reasoning: `Minimizing points given (trick worth ${trickValue})`,
      confidence: 0.85
    };
  }
  
  // If we must trump but can't win, play lowest trump
  if (legalPlays[0].suit === trumpSuit && leadSuit !== trumpSuit) {
    return {
      card: sorted[sorted.length - 1],
      reasoning: 'Forced to trump, playing low',
      confidence: 0.7
    };
  }
  
  // If we have the contract and desperately need points
  if (contractSituation.isContractTeam && contractSituation.mustWinTrick) {
    // Throw our lowest card to save high cards for later
    return {
      card: sorted[sorted.length - 1],
      reasoning: 'Saving high cards for must-win tricks',
      confidence: 0.8
    };
  }
  
  // Default - play lowest card
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
