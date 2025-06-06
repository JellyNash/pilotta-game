import { 
  Card, 
  Player, 
  Trick, 
  TrickCard, 
  GameState, 
  Suit, 
  Rank,
  Declaration,
  DeclarationType,
  DECLARATION_POINTS,
  LAST_TRICK_BONUS,
  TOTAL_POINTS_ALL_TRICKS
} from './types';
import { 
  hasSuit, 
  getCardsOfSuit, 
  compareCards, 
  getCardStrength,
  countCardPoints 
} from './cardUtils';

// Check if a card play is legal given the current trick state
export function isLegalPlay(
  card: Card, 
  hand: Card[], 
  currentTrick: TrickCard[], 
  trumpSuit: Suit | null
): boolean {
  // First card of trick - any card is legal
  if (currentTrick.length === 0) {
    return true;
  }
  
  const leadSuit = currentTrick[0].card.suit;
  const hasLeadSuit = hasSuit(hand, leadSuit);
  const hasTrump = trumpSuit ? hasSuit(hand, trumpSuit) : false;
  
  // Must follow suit if possible
  if (hasLeadSuit) {
    return card.suit === leadSuit;
  }
  
  // No lead suit - must play trump if possible
  if (hasTrump && trumpSuit) {
    // Must play trump
    if (card.suit !== trumpSuit) {
      return false;
    }
    
    // Check if must overtrump
    const trumpsInTrick = currentTrick
      .filter(tc => tc.card.suit === trumpSuit)
      .map(tc => tc.card);
    
    if (trumpsInTrick.length > 0) {
      // Find highest trump in trick
      const highestTrump = trumpsInTrick.reduce((highest, current) => 
        getCardStrength(current, true) > getCardStrength(highest, true) ? current : highest
      );
      
      // Must beat it if possible
      const myTrumps = getCardsOfSuit(hand, trumpSuit);
      const canBeat = myTrumps.some(t => 
        getCardStrength(t, true) > getCardStrength(highestTrump, true)
      );
      
      if (canBeat) {
        // This card must beat the highest trump
        return card.suit === trumpSuit && 
               getCardStrength(card, true) > getCardStrength(highestTrump, true);
      }
    }
    
    // Can play any trump
    return card.suit === trumpSuit;
  }
  
  // No lead suit, no trump - can play anything
  return true;
}

// Get all legal plays from a hand
export function getLegalPlays(
  hand: Card[], 
  currentTrick: TrickCard[], 
  trumpSuit: Suit | null
): Card[] {
  // Special handling for forced overtrump
  if (currentTrick.length > 0 && trumpSuit) {
    const leadSuit = currentTrick[0].card.suit;
    const hasLeadSuit = hasSuit(hand, leadSuit);
    
    if (!hasLeadSuit) {
      const hasTrump = hasSuit(hand, trumpSuit);
      if (hasTrump) {
        const trumpsInTrick = currentTrick
          .filter(tc => tc.card.suit === trumpSuit)
          .map(tc => tc.card);
        
        if (trumpsInTrick.length > 0) {
          // Find highest trump in trick
          const highestTrump = trumpsInTrick.reduce((highest, current) => 
            getCardStrength(current, true) > getCardStrength(highest, true) ? current : highest
          );
          
          // Get trumps that can beat it
          const myTrumps = getCardsOfSuit(hand, trumpSuit);
          const beatingTrumps = myTrumps.filter(t => 
            getCardStrength(t, true) > getCardStrength(highestTrump, true)
          );
          
          // If we have beating trumps, must play one
          if (beatingTrumps.length > 0) {
            return beatingTrumps;
          }
          
          // Otherwise can play any trump
          return myTrumps;
        }
        
        // No trump in trick yet - must play trump
        return getCardsOfSuit(hand, trumpSuit);
      }
    }
  }
  
  // Normal case - filter by legality
  return hand.filter(card => isLegalPlay(card, hand, currentTrick, trumpSuit));
}

// Determine the winner of a completed trick
export function determineTrickWinner(trick: TrickCard[], trumpSuit: Suit | null): Player {
  if (trick.length !== 4) {
    throw new Error('Trick must have exactly 4 cards');
  }
  
  const leadSuit = trick[0].card.suit;
  let winningIndex = 0;
  
  for (let i = 1; i < trick.length; i++) {
    const currentWinner = trick[winningIndex].card;
    const challenger = trick[i].card;
    
    if (compareCards(challenger, currentWinner, trumpSuit, leadSuit) > 0) {
      winningIndex = i;
    }
  }
  
  return trick[winningIndex].player;
}

// Calculate points in a trick
export function calculateTrickPoints(trick: TrickCard[], trumpSuit: Suit | null): number {
  return countCardPoints(trick.map(tc => tc.card), trumpSuit);
}

// Find sequences (tierce, quarte, quinte) in a hand
export function findSequences(cards: Card[]): Declaration[] {
  const declarations: Declaration[] = [];
  const suits = Object.values(Suit);
  
  // Standard rank order for sequences
  const rankOrder = [Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, 
                     Rank.Jack, Rank.Queen, Rank.King, Rank.Ace];
  
  for (const suit of suits) {
    const suitCards = getCardsOfSuit(cards, suit);
    if (suitCards.length < 3) continue;
    
    // Sort by rank order
    const sorted = suitCards.sort((a, b) => 
      rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank)
    );
    
    // Find consecutive sequences
    let sequenceStart = 0;
    for (let i = 1; i <= sorted.length; i++) {
      const isConsecutive = i < sorted.length && 
        rankOrder.indexOf(sorted[i].rank) === rankOrder.indexOf(sorted[i-1].rank) + 1;
      
      if (!isConsecutive || i === sorted.length) {
        const sequenceLength = i - sequenceStart;
        if (sequenceLength >= 3) {
          const sequenceCards = sorted.slice(sequenceStart, i);
          let type: DeclarationType;
          let points: number;
          
          if (sequenceLength === 3) {
            type = DeclarationType.Tierce;
            points = DECLARATION_POINTS[DeclarationType.Tierce];
          } else if (sequenceLength === 4) {
            type = DeclarationType.Quarte;
            points = DECLARATION_POINTS[DeclarationType.Quarte];
          } else {
            type = DeclarationType.Quinte;
            points = DECLARATION_POINTS[DeclarationType.Quinte];
          }
          
          declarations.push({
            type,
            cards: sequenceCards,
            points,
            player: null! // Will be set by caller
          });
        }
        sequenceStart = i;
      }
    }
  }
  
  return declarations;
}

// Find carrés (four of a kind) in a hand
export function findCarres(cards: Card[]): Declaration[] {
  const declarations: Declaration[] = [];
  const rankGroups = new Map<Rank, Card[]>();
  
  // Group by rank
  for (const card of cards) {
    if (!rankGroups.has(card.rank)) {
      rankGroups.set(card.rank, []);
    }
    rankGroups.get(card.rank)!.push(card);
  }
  
  // Find groups of 4
  for (const [rank, rankCards] of rankGroups) {
    if (rankCards.length === 4) {
      const points = DECLARATION_POINTS.carre[rank];
      if (points) {
        declarations.push({
          type: DeclarationType.Carre,
          cards: rankCards,
          points,
          player: null! // Will be set by caller
        });
      }
    }
  }
  
  return declarations;
}

// Check for Belote (K+Q of trump)
export function checkBelote(cards: Card[], trumpSuit: Suit | null): boolean {
  if (!trumpSuit) return false;
  
  const trumpCards = getCardsOfSuit(cards, trumpSuit);
  const hasKing = trumpCards.some(c => c.rank === Rank.King);
  const hasQueen = trumpCards.some(c => c.rank === Rank.Queen);
  
  return hasKing && hasQueen;
}

// Find all declarations in a hand
export function findAllDeclarations(cards: Card[], player: Player): Declaration[] {
  const declarations: Declaration[] = [];
  
  // Find sequences
  const sequences = findSequences(cards);
  for (const seq of sequences) {
    seq.player = player;
    declarations.push(seq);
  }
  
  // Find carrés
  const carres = findCarres(cards);
  for (const carre of carres) {
    carre.player = player;
    declarations.push(carre);
  }
  
  return declarations;
}

// Compare two declarations to determine which is higher
export function compareDeclarations(decl1: Declaration, decl2: Declaration, trumpSuit: Suit | null): number {
  // Carrés always beat sequences
  if (decl1.type === DeclarationType.Carre && decl2.type !== DeclarationType.Carre) return 1;
  if (decl1.type !== DeclarationType.Carre && decl2.type === DeclarationType.Carre) return -1;
  
  // Both carrés - compare by rank
  if (decl1.type === DeclarationType.Carre && decl2.type === DeclarationType.Carre) {
    return decl1.points - decl2.points;
  }
  
  // Both sequences - compare by length first
  if (decl1.cards.length !== decl2.cards.length) {
    return decl1.cards.length - decl2.cards.length;
  }
  
  // Same length sequences - compare by highest card
  const rankOrder = [Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, 
                     Rank.Jack, Rank.Queen, Rank.King, Rank.Ace];
  
  const highest1 = Math.max(...decl1.cards.map(c => rankOrder.indexOf(c.rank)));
  const highest2 = Math.max(...decl2.cards.map(c => rankOrder.indexOf(c.rank)));
  
  if (highest1 !== highest2) {
    return highest1 - highest2;
  }
  
  // Same value - trump wins
  const isTrump1 = trumpSuit && decl1.cards[0].suit === trumpSuit;
  const isTrump2 = trumpSuit && decl2.cards[0].suit === trumpSuit;
  
  if (isTrump1 && !isTrump2) return 1;
  if (!isTrump1 && isTrump2) return -1;
  
  // Identical value
  return 0;
}

// Determine which team wins declarations
export function determineDeclarationWinner(
  teamADeclarations: Declaration[], 
  teamBDeclarations: Declaration[],
  trumpSuit: Suit | null
): 'A' | 'B' | null {
  if (teamADeclarations.length === 0 && teamBDeclarations.length === 0) {
    return null;
  }
  
  if (teamADeclarations.length === 0) return 'B';
  if (teamBDeclarations.length === 0) return 'A';
  
  // Find best declaration for each team
  const bestA = teamADeclarations.reduce((best, current) => 
    compareDeclarations(current, best, trumpSuit) > 0 ? current : best
  );
  
  const bestB = teamBDeclarations.reduce((best, current) => 
    compareDeclarations(current, best, trumpSuit) > 0 ? current : best
  );
  
  const comparison = compareDeclarations(bestA, bestB, trumpSuit);
  
  if (comparison > 0) return 'A';
  if (comparison < 0) return 'B';
  return null; // Tie - no one scores
}

// Calculate round score including contract success/failure
export function calculateRoundScore(
  gameState: GameState,
  trickPoints: { A: number; B: number },
  declarationPoints: { A: number; B: number },
  belotePoints: { A: number; B: number },
  lastTrickWinner: 'A' | 'B'
): { A: number; B: number; contractMade: boolean; rawPoints: { A: number; B: number } } {
  const contract = gameState.contract!;
  const contractTeam = contract.team;
  const defendingTeam = contractTeam === 'A' ? 'B' : 'A';
  
  // Check if one team collected all tricks
  const teamATricks = gameState.completedTricks.filter(t => t.winner.teamId === 'A').length;
  const teamBTricks = gameState.completedTricks.filter(t => t.winner.teamId === 'B').length;
  
  // Calculate total points for each team
  const totalPoints = {
    A: 0,
    B: 0
  };
  
  // If a team collected all tricks, they get 250 points
  if (teamATricks === 8) {
    totalPoints.A = TOTAL_POINTS_ALL_TRICKS;
  } else if (teamBTricks === 8) {
    totalPoints.B = TOTAL_POINTS_ALL_TRICKS;
  } else {
    // Normal scoring: add trick points and last trick bonus
    trickPoints[lastTrickWinner] += LAST_TRICK_BONUS;
    totalPoints.A = trickPoints.A;
    totalPoints.B = trickPoints.B;
  }
  
  // Add declarations and belote points (always added)
  totalPoints.A += declarationPoints.A + belotePoints.A;
  totalPoints.B += declarationPoints.B + belotePoints.B;
  
  // Check if contract was made
  const contractMade = totalPoints[contractTeam] >= contract.value;
  
  // Apply contract rules
  if (!contractMade) {
    // Contract failed - defending team gets contract value based on double/redouble + all points
    const allPoints = totalPoints.A + totalPoints.B;
    
    // Calculate bonus based on double/redouble status
    let contractBonus = contract.value;
    if (contract.doubled) {
      if (contract.redoubled) {
        // Redoubled: 4x contract value
        contractBonus = contract.value * 4;
      } else {
        // Doubled: 2x contract value
        contractBonus = contract.value * 2;
      }
    } else {
      // Normal (not doubled): 1x contract value
      contractBonus = contract.value;
    }
    
    // Debug logging for contract failure scoring
    if (import.meta.env.DEV) {
      console.log('Contract Failed Scoring Debug:', {
        contractTeam,
        defendingTeam,
        contractValue: contract.value,
        contractBonus,
        teamAPointsBefore: totalPoints.A,
        teamBPointsBefore: totalPoints.B,
        allPoints,
        finalDefendingPoints: contractBonus + allPoints
      });
    }
    
    // Contract team gets 0 points
    totalPoints[contractTeam] = 0;
    
    // Defending team gets: contract bonus + all actual points (162 + announcements)
    totalPoints[defendingTeam] = contractBonus + allPoints;
  }
  
  // Store raw points before division
  const rawPoints = { ...totalPoints };
  
  // Handle doubled/redoubled contracts for successful contracts only
  if (contractMade && contract.doubled) {
    const multiplier = contract.redoubled ? 4 : 2;
    totalPoints.A *= multiplier;
    totalPoints.B *= multiplier;
  }
  
  // Apply new rounding rules
  const remainderA = totalPoints.A % 10;
  const remainderB = totalPoints.B % 10;
  
  const finalPoints = {
    A: Math.floor(totalPoints.A / 10),
    B: Math.floor(totalPoints.B / 10)
  };
  
  // Determine who rounds up based on highest remainder
  if (remainderA > remainderB) {
    finalPoints.A = Math.ceil(totalPoints.A / 10);
  } else if (remainderB > remainderA) {
    finalPoints.B = Math.ceil(totalPoints.B / 10);
  } else if (remainderA === remainderB && remainderA > 0) {
    // Equal remainders - the team with more trick-taking points rounds up
    if (trickPoints.A > trickPoints.B) {
      finalPoints.A = Math.ceil(totalPoints.A / 10);
    } else {
      finalPoints.B = Math.ceil(totalPoints.B / 10);
    }
  }
  
  // IMPORTANT: If contract failed, ensure contract team has 0 points
  if (!contractMade) {
    finalPoints[contractTeam] = 0;
    
    if (import.meta.env.DEV) {
      console.log('Final Contract Failed Scores:', {
        contractTeam,
        defendingTeam,
        finalPointsA: finalPoints.A,
        finalPointsB: finalPoints.B,
        contractMade: false
      });
    }
  }
  
  return {
    A: finalPoints.A,
    B: finalPoints.B,
    contractMade,
    rawPoints: totalPoints
  };
}

// Check if game is over
export function isGameOver(gameState: GameState): 'A' | 'B' | null {
  const { teams, targetScore } = gameState;
  
  if (teams.A.score >= targetScore) return 'A';
  if (teams.B.score >= targetScore) return 'B';
  
  return null;
}

// Validate a bid
export function isValidBid(
  bid: number, 
  currentHighestBid: number | null,
  isCapot: boolean = false
): boolean {
  if (isCapot) {
    return bid === 250;
  }
  
  // Valid bids are 80-160 in increments of 10, plus 250 (capot)
  if (bid === 250) return true;
  if (bid < 80 || bid > 160) return false;
  if (bid % 10 !== 0) return false;
  
  // Must be higher than current bid
  if (currentHighestBid !== null && bid <= currentHighestBid) {
    return false;
  }
  
  return true;
}

// Get next valid bid values
export function getValidBidValues(currentHighestBid: number | null): number[] {
  const validBids: number[] = [];
  
  const start = currentHighestBid ? currentHighestBid + 10 : 80;
  
  for (let bid = start; bid <= 160; bid += 10) {
    validBids.push(bid);
  }
  
  // Always allow capot
  if (!validBids.includes(250)) {
    validBids.push(250);
  }
  
  return validBids;
}
