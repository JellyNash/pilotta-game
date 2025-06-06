# Game Logic Duplication Report

**Generated on**: January 9, 2025  
**Purpose**: Document all duplicate game logic, conflicts, and areas lacking single source of truth in the Pilotta game codebase.

## Executive Summary

This report identifies 10 major areas of duplicate game logic that need refactoring. Each section includes:
- **Finding**: Specific code duplication with file paths and line numbers
- **Tracking**: Where the duplicated logic is used
- **Display**: UI components affected
- **Problem**: Issues caused by the duplication
- **Solution**: Recommended fix with code examples

## Table of Contents

1. [Card Sorting - Three Conflicting Implementations](#1-card-sorting---three-conflicting-implementations)
2. [Belote/Rebelote Logic Split Across Files](#2-beloterebelote-logic-split-across-files)
3. [Bidding Validation Scattered Across Multiple Files](#3-bidding-validation-scattered-across-multiple-files)
4. [Legal Move Validation Duplication](#4-legal-move-validation-duplication)
5. [Score Calculation Logic Split](#5-score-calculation-logic-split)
6. [AI Strategy Wrapper Redundancy](#6-ai-strategy-wrapper-redundancy)
7. [Magic Strings Throughout Codebase](#7-magic-strings-throughout-codebase)
8. [Constants Without Single Source of Truth](#8-constants-without-single-source-of-truth)
9. [Declaration Handling Split Across System](#9-declaration-handling-split-across-system)
10. [Trump Card Ordering Inconsistencies](#10-trump-card-ordering-inconsistencies)

---

## 1. Card Sorting - Three Conflicting Implementations

### Finding:
Three separate files implement card sorting with different approaches and conflicting constants:

**File 1: `/src/utils/cardSorting.ts`**
```typescript
// Lines 4-13: RANK_ORDER with values 1-8
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

// Line 16: isRedSuit function
const isRedSuit = (suit: Suit): boolean => {
  return suit === Suit.Hearts || suit === Suit.Diamonds;
};

// Line 91: Main sorting function for human players
export const sortHumanPlayerCards = (cards: Card[], trumpSuit: Suit | null): Card[]
```

**File 2: `/src/utils/cardSortUtils.ts`**
```typescript
// Lines 12-21: RANK_ORDER with values 0-7 (CONFLICT!)
const RANK_ORDER: Record<Rank, number> = {
  [Rank.Seven]: 0,  // Different from cardSorting.ts!
  [Rank.Eight]: 1,
  [Rank.Nine]: 2,
  [Rank.Ten]: 3,
  [Rank.Jack]: 4,
  [Rank.Queen]: 5,
  [Rank.King]: 6,
  [Rank.Ace]: 7     // Different from cardSorting.ts!
};

// Line 24: Duplicate isRedSuit function
export function isRedSuit(suit: Suit): boolean {
  return suit === Suit.Hearts || suit === Suit.Diamonds;
}

// Line 59: Different sorting algorithm
export function sortCards(cards: Card[], trumpSuit?: Suit | null): Card[]
```

**File 3: `/src/core/cardUtils.ts`**
```typescript
// Lines 89-109: Yet another sorting implementation
export function sortCards(cards: Card[], trumpSuit: Suit | null = null): Card[] {
  const sorted = [...cards];
  
  // Uses getCardStrength() for ranking instead of RANK_ORDER
  sorted.sort((a, b) => {
    const suitDiff = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    if (suitDiff !== 0) return suitDiff;
    
    // Different approach using card strength
    const aIsTrump = a.suit === trumpSuit;
    const bIsTrump = b.suit === trumpSuit;
    return getCardStrength(b, aIsTrump) - getCardStrength(a, bIsTrump);
  });
}
```

### Tracking:
- `sortHumanPlayerCards()` is imported in `GameTable.tsx` (line 15)
- `sortCards()` from cardSortUtils is imported in `PlayerHandFlex.tsx` (line 10)
- `sortCards()` from cardUtils is used in AI logic files

### Display:
- Human player sees cards sorted by `sortHumanPlayerCards()` with red-black alternation
- AI uses different sorting logic from `cardUtils.ts`
- Potential for inconsistent card display between different UI components

### Problem:
1. **Conflicting RANK_ORDER values**: 1-8 vs 0-7 ranges cause different sort results
2. **Algorithm differences**: Red-black alternation vs suit grouping vs strength-based
3. **Maintenance nightmare**: Changes in one file don't propagate to others
4. **Bug potential**: Same card hand could be sorted differently in different contexts

### Solution:
```typescript
// Create /src/core/cardSorting.ts as single source of truth
export enum SortStrategy {
  HUMAN_ALTERNATING = 'human_alternating',  // Red-black alternation
  SUIT_GROUPED = 'suit_grouped',            // Group by suit
  STRENGTH_BASED = 'strength_based'         // By card strength
}

export const RANK_ORDER: Record<Rank, number> = {
  [Rank.Seven]: 0,
  [Rank.Eight]: 1,
  // ... single definition
};

export function sortCards(
  cards: Card[], 
  trumpSuit: Suit | null,
  strategy: SortStrategy = SortStrategy.SUIT_GROUPED
): Card[] {
  // Single implementation with strategy pattern
}

// Delete the other two files and update all imports
```

---

## 2. Belote/Rebelote Logic Split Across Files

### Finding:
Belote detection and announcement logic is split between game rules and state management:

**File 1: `/src/core/gameRules.ts`**
```typescript
// Lines 245-254: Simple detection function
export function checkBelote(cards: Card[], trumpSuit: Suit | null): boolean {
  if (!trumpSuit) return false;
  
  const trumpCards = getCardsOfSuit(cards, trumpSuit);
  const hasKing = trumpCards.some(c => c.rank === Rank.King);
  const hasQueen = trumpCards.some(c => c.rank === Rank.Queen);
  
  return hasKing && hasQueen;
}
```

**File 2: `/src/store/gameSlice.ts`**
```typescript
// Lines 411-459: Complex announcement tracking
if (state.trumpSuit && action.payload.card.suit === state.trumpSuit) {
  const isKing = action.payload.card.rank === 'K';
  const isQueen = action.payload.card.rank === 'Q';

  if (isKing || isQueen) {
    // Check if player has the other card
    const hasOther = player.hand.some(c =>
      c.suit === state.trumpSuit &&
      c.rank === (isKing ? 'Q' : 'K')
    );

    if (hasOther || state.beloteAnnounced?.team === player.teamId) {
      // Complex state tracking for first/second card
      if (!state.beloteAnnounced || state.beloteAnnounced.team !== player.teamId) {
        state.beloteAnnounced = {
          team: player.teamId,
          kingPlayed: isKing,
          queenPlayed: isQueen,
          announcement: 'belote'
        };
        // Notification creation...
      } else if (state.beloteAnnounced.team === player.teamId) {
        // Rebelote logic...
      }
    }
  }
}
```

### Tracking:
- `checkBelote()` is called during declaration phase (gameRules.ts:257)
- Announcement logic triggers in `playCard` reducer (gameSlice.ts:411)
- Points calculation checks `beloteAnnounced` state (gameRules.ts:379)

### Display:
- AnnouncementSystem.tsx displays "Belote!" and "Rebelote!" notifications
- ScoreBoard shows 20 points for Belote/Rebelote
- Multiple UI components check beloteAnnounced state

### Problem:
1. **Logic duplication**: Detection in gameRules, tracking in gameSlice
2. **State complexity**: Must track kingPlayed, queenPlayed, announcement type
3. **Timing issues**: Detection happens at different game phases
4. **Testing difficulty**: Logic spread makes unit testing harder

### Solution:
```typescript
// Centralize in /src/core/beloteManager.ts
export class BeloteManager {
  private beloteState = new Map<TeamId, BeloteState>();
  
  checkForBelote(card: Card, playerHand: Card[], trumpSuit: Suit | null): BeloteAnnouncement | null {
    if (!trumpSuit || card.suit !== trumpSuit) return null;
    
    const isRoyalCard = card.rank === Rank.King || card.rank === Rank.Queen;
    if (!isRoyalCard) return null;
    
    const hasPartner = this.hasPartnerCard(card, playerHand, trumpSuit);
    // Unified logic here
    
    return this.createAnnouncement(card, hasPartner);
  }
  
  // Single source for all Belote logic
}
```

---

## 3. Bidding Validation Scattered Across Multiple Files

### Finding:
Bidding validation logic is implemented in multiple places with different approaches:

**File 1: `/src/core/gameRules.ts`**
```typescript
// Lines 479-500: Core validation function
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

// Lines 503-517: Get valid bid values
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
```

**File 2: `/src/game/GameManager.ts`**
```typescript
// Lines 96-100: Different minimum bid logic
getMinimumBid() {
  const state = store.getState().game;
  if (!state.contract) return 80;
  return Math.min(state.contract.value + 10, 490); // Uses 490 instead of 250!
}
```

**File 3: `/src/components/BiddingInterface.tsx`**
```typescript
// Lines 123-124: Hardcoded values in UI
const minBid = gameManager.getMinimumBid();
const maxBid = 490; // Different max value! Should be 250 for capot

// Lines 211-225: UI creates bid options
const bidOptions = [];
for (let i = minBid; i <= 160; i += 10) {
  bidOptions.push(i);
}
// Manually adds capot option
if (!bidOptions.includes(250)) {
  bidOptions.push(250);
}
```

### Tracking:
- `isValidBid()` called by AI strategy (aiStrategy.ts:142)
- `getValidBidValues()` used in bidding phase (GameFlowController.ts:87)
- `getMinimumBid()` called by BiddingInterface component
- UI components independently validate bids

### Display:
- BiddingInterface shows bid buttons based on local logic
- Bid validation errors displayed differently in different contexts
- Inconsistent max bid values (250 vs 490)

### Problem:
1. **Magic number 490**: Appears in GameManager and BiddingInterface, but rules say 250
2. **Validation duplication**: Each layer re-implements validation
3. **Inconsistent constants**: Max bid differs between files
4. **Business logic in UI**: BiddingInterface creates bid options locally

### Solution:
```typescript
// Create /src/core/biddingRules.ts
export const BIDDING_CONSTANTS = {
  MIN_BID: 80,
  MAX_NORMAL_BID: 160,
  BID_INCREMENT: 10,
  CAPOT_BID: 250,
  // Remove 490 - it's not a valid bid
} as const;

export class BiddingValidator {
  static isValidBid(bid: number, currentHighest: number | null): boolean {
    // Single validation logic
  }
  
  static getValidBids(currentHighest: number | null): number[] {
    // Single source for valid bids
  }
  
  static getMinimumBid(currentContract: Contract | null): number {
    // Consistent minimum bid logic
  }
}

// Update all files to use BiddingValidator
```

---

## 4. Legal Move Validation Duplication

### Finding:
Legal move checking is implemented in multiple places with overlapping logic:

**File 1: `/src/core/gameRules.ts`**
```typescript
// Lines 103-178: Core legal play logic
export function isLegalPlay(
  card: Card,
  hand: Card[],
  currentTrick: TrickCard[],
  trumpSuit: Suit
): boolean {
  if (currentTrick.length === 0) return true;
  
  const leadCard = currentTrick[0].card;
  const leadSuit = leadCard.suit;
  
  // Must follow suit if possible
  if (card.suit === leadSuit) return true;
  
  const hasLeadSuit = hasSuit(hand, leadSuit);
  if (hasLeadSuit) return false;
  
  // Complex trump logic...
  if (card.suit === trumpSuit) {
    // Must play higher trump if possible
    const trumpsInTrick = currentTrick
      .filter(tc => tc.card.suit === trumpSuit)
      .map(tc => tc.card);
    
    if (trumpsInTrick.length > 0) {
      const highestTrump = trumpsInTrick.reduce((highest, current) =>
        getCardStrength(current, true) > getCardStrength(highest, true) ? current : highest
      );
      
      // Must overtrump if possible...
    }
  }
  // More logic...
}

// Lines 181-193: Get all legal plays
export function getLegalPlays(
  hand: Card[],
  currentTrick: TrickCard[],
  trumpSuit: Suit
): Card[] {
  return hand.filter(card => isLegalPlay(card, hand, currentTrick, trumpSuit));
}
```

**File 2: `/src/store/selectors.ts`**
```typescript
// Lines 33-40: Reimplements validation in selector
export const selectValidMovesForCurrentPlayer = createSelector(
  [selectCurrentPlayer, selectCurrentTrick, selectTrumpSuit],
  (currentPlayer, currentTrick, trumpSuit) => {
    if (!currentPlayer || !currentPlayer.hand || !trumpSuit) {
      return [];
    }
    // Just calls getLegalPlays, but adds extra null checks
    return getLegalPlays(currentPlayer.hand, currentTrick, trumpSuit);
  }
);
```

**File 3: `/src/game/GameFlowController.ts`**
```typescript
// Lines 298-312: Validates moves before playing
private validateMove(card: Card, player: Player): boolean {
  const state = store.getState().game;
  const legalMoves = getLegalPlays(
    player.hand,
    state.currentTrick,
    state.trumpSuit!
  );
  
  // Additional validation logic
  const isLegal = legalMoves.some(legalCard => 
    legalCard.suit === card.suit && legalCard.rank === card.rank
  );
  
  if (!isLegal) {
    console.error('Illegal move attempted');
  }
  
  return isLegal;
}
```

### Tracking:
- `isLegalPlay()` is the core function but rarely called directly
- `getLegalPlays()` called from multiple places
- Selectors add extra validation layers
- UI components check valid moves before enabling cards

### Display:
- Valid cards highlighted in PlayerHand component
- Invalid moves show error messages
- Card opacity reduced for illegal moves

### Problem:
1. **Redundant null checks**: Done in multiple layers
2. **Performance impact**: Selector recalculates on every state change
3. **Validation spread**: Core logic mixed with UI concerns
4. **Testing complexity**: Hard to test validation in isolation

### Solution:
```typescript
// Enhance /src/core/gameRules.ts
export class MoveValidator {
  private static instance: MoveValidator;
  
  validateMove(
    card: Card,
    gameState: GameState,
    player: Player
  ): ValidationResult {
    // Single validation entry point
    const { isValid, reason } = this.checkLegality(card, player.hand, gameState);
    
    return {
      isValid,
      reason,
      legalMoves: isValid ? null : this.getLegalMoves(player.hand, gameState)
    };
  }
  
  getLegalMoves(hand: Card[], gameState: GameState): Card[] {
    // Cached for performance
    const cacheKey = this.getCacheKey(hand, gameState);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    // Calculate and cache
  }
}
```

---

## 5. Score Calculation Logic Split

### Finding:
Score calculation is split between core game rules and flow controller with duplicate logic:

**File 1: `/src/core/gameRules.ts`**
```typescript
// Lines 345-459: Core score calculation
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
  const totalPoints = { A: 0, B: 0 };
  
  // If a team collected all tricks, they get 250 points
  if (teamATricks === 8) {
    totalPoints.A = TOTAL_POINTS_ALL_TRICKS; // 250
  } else if (teamBTricks === 8) {
    totalPoints.B = TOTAL_POINTS_ALL_TRICKS;
  } else {
    // Normal scoring: add trick points and last trick bonus
    trickPoints[lastTrickWinner] += LAST_TRICK_BONUS; // 10
    totalPoints.A = trickPoints.A;
    totalPoints.B = trickPoints.B;
  }
  
  // Add declarations and belote points
  totalPoints.A += declarationPoints.A + belotePoints.A;
  totalPoints.B += declarationPoints.B + belotePoints.B;
  
  // Complex contract success/failure logic...
  // Lines 396-443: Contract scoring with doubling/redoubling
}
```

**File 2: `/src/game/GameFlowController.ts`**
```typescript
// Lines 397-459: Duplicates calculation and builds RoundScore
private async completeRound() {
  const state = store.getState().game;
  
  // Calculate trick points (DUPLICATE LOGIC)
  const trickPoints = { A: 0, B: 0 };
  state.completedTricks.forEach(trick => {
    const points = this.calculateTrickPoints(trick.cards, state.trumpSuit!);
    trickPoints[trick.winner.teamId] += points;
  });
  
  // Get last trick winner (DUPLICATE)
  const lastTrick = state.completedTricks[state.completedTricks.length - 1];
  const lastTrickWinner = lastTrick.winner.teamId;
  
  // Calculate points from calculateRoundScore
  const result = calculateRoundScore(
    state,
    trickPoints,
    declarationPoints,
    belotePoints,
    lastTrickWinner
  );
  
  // Build RoundScore object (MORE DUPLICATION)
  const roundScore: RoundScore = {
    team1Score: result.A,
    team2Score: result.B,
    team1Tricks: state.completedTricks.filter(t => t.winner.teamId === 'A').length,
    team2Tricks: state.completedTricks.filter(t => t.winner.teamId === 'B').length,
    team1BasePoints: state.teams.A.roundScore,
    team2BasePoints: state.teams.B.roundScore,
    team1Declarations: teamADeclarations,
    team2Declarations: teamBDeclarations,
    team1Bonuses: declarationPoints.A + belotePoints.A,
    team2Bonuses: declarationPoints.B + belotePoints.B,
    team1AllTricks: state.completedTricks.filter(t => t.winner.teamId === 'A').length === 8,
    team2AllTricks: state.completedTricks.filter(t => t.winner.teamId === 'B').length === 8,
    contractSuccess: result.contractMade,
    rawPointsA: result.rawPoints.A,
    rawPointsB: result.rawPoints.B
  };
}
```

**File 3: `/src/core/types.ts`**
```typescript
// Lines 195-232: Score constants scattered
export const CARD_VALUES = {
  trump: {
    J: 20, 9: 14, A: 11, 10: 10, K: 4, Q: 3, 8: 0, 7: 0
  },
  regular: {
    A: 11, 10: 10, K: 4, Q: 3, J: 2, 9: 0, 8: 0, 7: 0
  }
};

export const LAST_TRICK_BONUS = 10;
export const TOTAL_POINTS_ALL_TRICKS = 250;
```

### Tracking:
- `calculateRoundScore()` called from GameFlowController
- Trick counting logic duplicated in multiple places
- Score building happens in flow controller
- UI components recalculate scores for display

### Display:
- ScoreBoard shows final scores
- RoundTransitionScreen displays score breakdown
- DetailedScoreboard recalculates for detailed view

### Problem:
1. **Logic duplication**: Trick counting repeated 6+ times in GameFlowController
2. **Data structure mismatch**: RoundScore object duplicates calculation results
3. **Performance waste**: Same calculations done multiple times
4. **Maintenance risk**: Score logic changes must be updated in multiple places

### Solution:
```typescript
// Create /src/core/scoreCalculator.ts
export class ScoreCalculator {
  private static readonly CONSTANTS = {
    LAST_TRICK_BONUS: 10,
    ALL_TRICKS_BONUS: 250,
    BELOTE_POINTS: 20
  } as const;
  
  calculateRoundScore(gameState: GameState): RoundScoreResult {
    const trickAnalysis = this.analyzeTricks(gameState.completedTricks);
    const points = this.calculatePoints(gameState, trickAnalysis);
    const contractResult = this.evaluateContract(gameState.contract, points);
    
    return {
      scores: this.applyContractResult(points, contractResult),
      breakdown: this.createBreakdown(trickAnalysis, points, contractResult),
      contractMade: contractResult.success
    };
  }
  
  private analyzeTricks(tricks: Trick[]): TrickAnalysis {
    // Single place for trick counting
    return {
      teamATricks: tricks.filter(t => t.winner.teamId === 'A'),
      teamBTricks: tricks.filter(t => t.winner.teamId === 'B'),
      lastTrickWinner: tricks[tricks.length - 1]?.winner.teamId
    };
  }
}
```

---

## 6. AI Strategy Wrapper Redundancy

### Finding:
AIStrategyClass is a thin, unnecessary wrapper around aiStrategy functions:

**File 1: `/src/ai/AIStrategyClass.ts`**
```typescript
// Entire file is a wrapper - Lines 1-98
export class AIStrategy {
  constructor() {} // Empty constructor
  
  makeBid(
    hand: Card[],
    currentContract: Contract | null,
    teamId: 'A' | 'B',
    teamScore: number,
    opponentScore: number,
    personality: AIPersonality,
    position: 'north' | 'south' | 'east' | 'west'
  ): { bid: number | 'pass'; trump?: Suit } {
    // Lines 29-47: Just calls decideBid from aiStrategy.ts
    const gameContext = {
      teamScore,
      opponentScore,
      targetScore: 151
    };
    
    const result = decideBid(hand, currentBid, personality, undefined, gameContext);
    
    if (!result) {
      return { bid: 'pass' };
    }
    
    return { bid: result.bid, trump: result.trump };
  }
  
  selectCard(
    legalMoves: Card[],
    hand: Card[],
    // ... more parameters
  ): Card {
    // Lines 61-96: Creates fake objects then calls decideCardPlay
    const player: Player = {
      id: 'ai-player',
      name: 'AI',
      isAI: true,
      hand,
      teamId,
      position
    };
    
    const gameState = {
      contract,
      trumpSuit,
      // ... builds partial game state
    } as any; // Type assertion shows the problem!
    
    const decision = decideCardPlay(/* forwards all params */);
    return decision.card;
  }
}
```

**File 2: `/src/ai/aiStrategy.ts`**
```typescript
// The actual implementation - Lines 89-165
export function decideBid(
  hand: Card[],
  currentBid: { value: number; trump: Suit } | null,
  personality: AIPersonality,
  partner?: { hand?: Card[] },
  gameContext?: { teamScore: number; opponentScore: number; targetScore: number }
): BidDecision | null {
  // Actual implementation
}

// Lines 487-571
export function decideCardPlay(
  hand: Card[],
  currentTrick: TrickCard[],
  playedTricks: TrickCard[][],
  trumpSuit: Suit,
  contract: Contract,
  player: Player,
  personality: AIPersonality,
  gameState: GameState
): CardDecision {
  // Actual implementation
}
```

### Tracking:
- AIStrategyClass imported in GameFlowController.ts
- aiStrategy functions used directly in some places
- Inconsistent usage across codebase

### Display:
- No display impact, purely internal

### Problem:
1. **Unnecessary abstraction**: Class adds no value, just forwards calls
2. **Type safety loss**: Uses `as any` to bypass TypeScript
3. **Maintenance overhead**: Changes must be made in two places
4. **Confusing architecture**: Two ways to call same functionality

### Solution:
```typescript
// Delete AIStrategyClass.ts entirely
// Update imports in GameFlowController.ts:
import { decideBid, decideCardPlay } from '../ai/aiStrategy';

// Use functions directly:
const bidDecision = decideBid(
  aiPlayer.hand,
  currentBid,
  aiPlayer.personality,
  partner,
  gameContext
);

// No wrapper needed!
```

---

## 7. Magic Strings Throughout Codebase

### Finding:
String literals are used throughout the codebase instead of constants or enums:

**Positions - Used in 24+ files:**
```typescript
// /src/store/gameSlice.ts - Lines 148-167
players: [
  { position: 'south', teamId: 'A', ... },
  { position: 'west', teamId: 'B', ... },
  { position: 'north', teamId: 'A', ... },
  { position: 'east', teamId: 'B', ... }
]

// /src/components/PlayerZone.tsx - Line 75
const positionClasses: Record<string, string> = {
  'north': 'top-4 left-1/2 -translate-x-1/2',
  'south': 'bottom-4 left-1/2 -translate-x-1/2',
  'east': 'right-4 top-1/2 -translate-y-1/2',
  'west': 'left-4 top-1/2 -translate-y-1/2'
};

// /src/ai/aiStrategy.ts - Lines 234, 298, etc.
if (position === 'north' || position === 'south') {
  // Partner logic
}
```

**Team IDs - Inconsistent usage:**
```typescript
// /src/core/types.ts - TeamId type
export type TeamId = 'A' | 'B';

// But in gameSlice.ts - Lines 681-682
scores: {
  team1: 0,  // Maps to 'A'
  team2: 0   // Maps to 'B'
}

// /src/components/ScoreBoard.tsx
<div>Team A: {scores.team1}</div>  // Confusing mapping!
<div>Team B: {scores.team2}</div>
```

**Suit Symbols - Hardcoded everywhere:**
```typescript
// /src/components/Card.tsx - Lines 89-92
const suitSymbols = {
  'hearts': '♥',
  'diamonds': '♦',
  'clubs': '♣',
  'spades': '♠'
};

// /src/utils/suitColors.ts - Duplicate definition
export const SUIT_SYMBOLS: Record<Suit, string> = {
  [Suit.Hearts]: '♥',
  [Suit.Diamonds]: '♦',
  [Suit.Clubs]: '♣',
  [Suit.Spades]: '♠'
};

// /src/components/BiddingInterface.tsx - Line 245
<span>{suit === 'hearts' ? '♥' : suit === 'diamonds' ? '♦' : ...}</span>
```

**Phase Names:**
```typescript
// Used as strings throughout:
phase === 'bidding'
phase === 'playing'
phase === 'dealing'
// No enum or constants!
```

### Tracking:
- Position strings used in 24+ files
- Team IDs inconsistent between 'A'/'B' and 'team1'/'team2'
- Suit symbols defined in multiple places
- Phase names used as raw strings

### Display:
- UI components use these strings for styling and logic
- Potential for typos causing runtime errors
- Inconsistent display of team names

### Problem:
1. **Typo risk**: 'north' vs 'North' vs 'NORTH' could cause bugs
2. **No autocomplete**: IDEs can't help with string literals
3. **Refactoring nightmare**: Changing a value requires finding all occurrences
4. **Type safety loss**: TypeScript can't catch typos in strings
5. **Inconsistent conventions**: team1/team2 vs A/B confusion

### Solution:
```typescript
// Create /src/core/constants.ts
export enum Position {
  North = 'north',
  East = 'east',
  South = 'south',
  West = 'west'
}

export enum TeamId {
  A = 'A',
  B = 'B'
}

export enum GamePhase {
  WaitingForPlayers = 'waiting',
  Dealing = 'dealing',
  Bidding = 'bidding',
  Declaring = 'declaring',
  Playing = 'playing',
  RoundEnd = 'roundEnd',
  GameOver = 'gameOver'
}

export const SUIT_SYMBOLS = {
  [Suit.Hearts]: '♥',
  [Suit.Diamonds]: '♦',
  [Suit.Clubs]: '♣',
  [Suit.Spades]: '♠'
} as const;

// Update all files to use enums:
// Before: position: 'north'
// After: position: Position.North
```

---

## 8. Constants Without Single Source of Truth

### Finding:
Game constants are hardcoded in multiple places without central definition:

**Bidding Constants:**
```typescript
// /src/components/BiddingInterface.tsx - Line 124
const maxBid = 490; // Wrong! Should be 250

// /src/core/gameRules.ts - Lines 489-491
if (bid < 80 || bid > 160) return false; // Hardcoded limits
if (bid === 250) return true; // Capot hardcoded

// /src/game/GameManager.ts - Line 99
return Math.min(state.contract.value + 10, 490); // 490 again!
```

**Animation Delays:**
```typescript
// /src/game/GameFlowController.ts - Multiple hardcoded delays
await delay(1000); // Line 234
await delay(1500); // Line 289  
await delay(2000); // Line 345
// No constants, just magic numbers

// /src/components/Card.tsx
setTimeout(() => setIsZoomed(true), 50); // Line 167
```

**Score Constants:**
```typescript
// /src/core/types.ts - Lines 231-232
export const LAST_TRICK_BONUS = 10;
export const TOTAL_POINTS_ALL_TRICKS = 250;

// But in gameRules.ts - Line 373
trickPoints[lastTrickWinner] += LAST_TRICK_BONUS; // At least uses constant

// /src/components/DetailedScoreboard.tsx
<div>Last trick: +10</div> // Hardcoded in UI!
```

**Z-Index Values (despite token system):**
```typescript
// /src/components/TrickArea.css
.trick-card {
  z-index: 10; /* Should use var(--z-index-card-base) */
}

// /src/components/PlayerHandFlex.css
.card-zoomed {
  z-index: 9999; /* Magic number! */
}
```

### Tracking:
- Constants defined in types.ts but not always used
- UI components hardcode values instead of importing
- Animation delays never centralized
- CSS still has magic numbers despite token system

### Display:
- Inconsistent timing in animations
- Potential for UI showing different values than logic
- Z-index conflicts from hardcoded values

### Problem:
1. **Update difficulty**: Changing a constant requires finding all occurrences
2. **Inconsistency risk**: Same concept with different values
3. **Documentation lack**: No central place to see all game rules
4. **Testing issues**: Can't easily test with different constants

### Solution:
```typescript
// Enhance /src/core/constants.ts
export const GAME_CONSTANTS = {
  BIDDING: {
    MIN_BID: 80,
    MAX_NORMAL_BID: 160,
    INCREMENT: 10,
    CAPOT: 250,
    // Remove 490 - it's invalid
  },
  
  SCORING: {
    LAST_TRICK_BONUS: 10,
    ALL_TRICKS_BONUS: 250,
    BELOTE_POINTS: 20,
    CONTRACT_FAILURE_PENALTY: 160,
  },
  
  ANIMATION: {
    CARD_DEAL_DELAY: 150,
    TRICK_COMPLETE_DELAY: 1500,
    ROUND_END_DELAY: 2000,
    ZOOM_TRANSITION: 50,
  },
  
  UI: {
    MAX_HAND_SIZE: 8,
    CARD_OVERLAP_PERCENT: 50,
    ZOOM_SCALE: 2,
  }
} as const;

// CSS: Use existing token system
.trick-card {
  z-index: var(--z-index-card-base);
}
```

---

## 9. Declaration Handling Split Across System

### Finding:
Declaration logic (sequences and four-of-a-kind) is split across multiple files:

**File 1: `/src/core/gameRules.ts`**
```typescript
// Lines 195-242: Core declaration finding
export function findSequences(cards: Card[]): Declaration[] {
  const declarations: Declaration[] = [];
  const suitGroups = new Map<Suit, Card[]>();
  
  // Group by suit and sort
  cards.forEach(card => {
    if (!suitGroups.has(card.suit)) {
      suitGroups.set(card.suit, []);
    }
    suitGroups.get(card.suit)!.push(card);
  });
  
  // Complex sequence detection logic...
  // Lines 211-239: Checks for 3,4,5 card sequences
  
  return declarations;
}

// Lines 257-276: Find all declarations
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
  // ...
}
```

**File 2: `/src/store/gameSlice.ts`**
```typescript
// Lines 605-679: Declaration state management
showDeclarations: (state, action) => {
  const { declarations } = action.payload;
  
  // Complex logic to prevent duplicates
  const existingDeclarationKeys = new Set(
    state.roundDeclarations.map(d => 
      `${d.player.id}-${d.type}-${d.rank || ''}-${d.cards.map(c => 
        `${c.suit}${c.rank}`).join(',')}`
    )
  );
  
  const newDeclarations = declarations.filter(declaration => {
    const key = `${declaration.player.id}-${declaration.type}-${declaration.rank || ''}-${declaration.cards.map(c => `${c.suit}${c.rank}`).join(',')}`;
    return !existingDeclarationKeys.has(key);
  });
  
  state.roundDeclarations.push(...newDeclarations);
  
  // Update scores
  declarations.forEach(declaration => {
    const team = state.teams[declaration.player.teamId];
    team.declarationScore = (team.declarationScore || 0) + declaration.points;
  });
  
  // Add notifications...
}
```

**File 3: `/src/game/GameFlowController.ts`**
```typescript
// Lines 195-289: Declaration phase management
private async handleDeclarationPhase() {
  const state = store.getState().game;
  
  // Find declarations for each player
  const allDeclarations: Declaration[] = [];
  
  for (const player of state.players) {
    const playerDeclarations = findAllDeclarations(player.hand, player);
    
    if (playerDeclarations.length > 0) {
      // Complex validation logic
      const validDeclarations = this.validateDeclarations(
        playerDeclarations,
        state.trumpSuit!
      );
      
      allDeclarations.push(...validDeclarations);
    }
  }
  
  // Compare declarations between teams
  const winningTeam = compareDeclarations(
    allDeclarations.filter(d => d.player.teamId === 'A'),
    allDeclarations.filter(d => d.player.teamId === 'B')
  );
  
  // Show only winning team's declarations
  if (winningTeam) {
    const teamDeclarations = allDeclarations.filter(
      d => d.player.teamId === winningTeam
    );
    
    this.dispatch(showDeclarations({ declarations: teamDeclarations }));
  }
}
```

**File 4: Multiple UI Components**
```typescript
// /src/components/DeclarationCardsDisplay.tsx
// Displays declaration cards visually

// /src/components/DeclarationManager.tsx  
// Manages declaration UI state

// /src/components/DeclarationViewer.tsx
// Shows declaration details
```

### Tracking:
- Core logic in gameRules.ts
- State management in gameSlice.ts
- Phase control in GameFlowController.ts
- UI split across 3+ components

### Display:
- Announcements show points during trick 1
- Cards displayed during trick 2
- Multiple components handle different aspects

### Problem:
1. **Complex deduplication**: Key generation logic is error-prone
2. **Business logic in reducer**: Declaration comparison in state management
3. **UI coupling**: Multiple components need declaration knowledge
4. **Testing difficulty**: Logic spread makes unit testing hard

### Solution:
```typescript
// Create /src/core/declarationManager.ts
export class DeclarationManager {
  private declarations = new Map<string, Declaration>();
  
  findDeclarations(hand: Card[], player: Player): Declaration[] {
    const sequences = this.findSequences(hand);
    const fours = this.findFourOfAKind(hand);
    
    return [...sequences, ...fours].map(d => ({
      ...d,
      player,
      id: this.generateId(d, player)
    }));
  }
  
  compareTeamDeclarations(teamA: Declaration[], teamB: Declaration[]): {
    winningTeam: TeamId | null;
    validDeclarations: Declaration[];
  } {
    // Single place for comparison logic
  }
  
  private generateId(declaration: Declaration, player: Player): string {
    // Consistent ID generation
    return `${player.id}-${declaration.type}-${this.hashCards(declaration.cards)}`;
  }
}

// Update gameSlice to just store results:
showDeclarations: (state, action) => {
  // Simple storage, no business logic
  state.roundDeclarations = action.payload.declarations;
  state.declarationWinner = action.payload.winningTeam;
}
```

---

## 10. Trump Card Ordering Inconsistencies

### Finding:
Trump card strength is defined differently across the codebase:

**File 1: `/src/core/types.ts`**
```typescript
// Lines 195-216: Card values definition
export const CARD_VALUES = {
  trump: {
    J: 20,  // Highest value
    9: 14,  // Second highest
    A: 11,
    10: 10,
    K: 4,
    Q: 3,
    8: 0,
    7: 0
  },
  regular: {
    A: 11,  // Highest in regular
    10: 10,
    K: 4,
    Q: 3,
    J: 2,   // Much lower than trump!
    9: 0,
    8: 0,
    7: 0
  }
};
```

**File 2: `/src/core/cardUtils.ts`**
```typescript
// Lines 15-36: Card strength calculation
export function getCardStrength(card: Card, isTrump: boolean): number {
  const rankStrength: Record<Rank, { trump: number; regular: number }> = {
    [Rank.Seven]:  { trump: 0, regular: 0 },
    [Rank.Eight]:  { trump: 1, regular: 1 },
    [Rank.Nine]:   { trump: 7, regular: 2 }, // Different order!
    [Rank.Ten]:    { trump: 5, regular: 5 },
    [Rank.Jack]:   { trump: 8, regular: 3 }, // Highest trump
    [Rank.Queen]:  { trump: 3, regular: 4 },
    [Rank.King]:   { trump: 4, regular: 6 },
    [Rank.Ace]:    { trump: 6, regular: 7 }
  };
  
  return rankStrength[card.rank][isTrump ? 'trump' : 'regular'];
}
```

**File 3: `/src/ai/aiStrategy.ts`**
```typescript
// Lines 178-189: AI uses different mental model
const trumpOrder = ['J', '9', 'A', '10', 'K', 'Q', '8', '7'];
const regularOrder = ['A', '10', 'K', 'Q', 'J', '9', '8', '7'];

// Line 234: Hardcoded trump check
if (card.rank === 'J' && card.suit === trumpSuit) {
  // Assumes Jack is highest
}
```

### Tracking:
- Card values used for scoring (CARD_VALUES)
- Card strength used for trick winning (getCardStrength)
- AI has its own ordering arrays
- UI might display based on different logic

### Display:
- Card strength affects which card wins tricks
- Incorrect ordering could show wrong winner
- AI might play suboptimally due to inconsistency

### Problem:
1. **Multiple truth sources**: Values vs strength vs AI arrays
2. **Maintenance risk**: Changing one doesn't update others
3. **Bug potential**: Different systems might disagree on winner
4. **Documentation**: No clear explanation of why different

### Solution:
```typescript
// Create /src/core/cardRanking.ts
export class CardRanking {
  // Single source of truth for card ordering
  private static readonly TRUMP_RANKING = [
    Rank.Jack,   // Strongest
    Rank.Nine,
    Rank.Ace,
    Rank.Ten,
    Rank.King,
    Rank.Queen,
    Rank.Eight,
    Rank.Seven   // Weakest
  ];
  
  private static readonly REGULAR_RANKING = [
    Rank.Ace,    // Strongest
    Rank.Ten,
    Rank.King,
    Rank.Queen,
    Rank.Jack,
    Rank.Nine,
    Rank.Eight,
    Rank.Seven   // Weakest
  ];
  
  static getStrength(card: Card, isTrump: boolean): number {
    const ranking = isTrump ? this.TRUMP_RANKING : this.REGULAR_RANKING;
    return ranking.length - ranking.indexOf(card.rank);
  }
  
  static getValue(card: Card, isTrump: boolean): number {
    // Map strength to point values
    const values = isTrump ? TRUMP_VALUES : REGULAR_VALUES;
    return values[card.rank];
  }
  
  static compareCards(a: Card, b: Card, trumpSuit: Suit | null): number {
    // Single comparison logic
  }
}

// Delete duplicate definitions and use CardRanking everywhere
```

---

## Implementation Priority

Based on game impact and risk assessment:

1. **CRITICAL - Game Breaking**:
   - Trump card ordering inconsistencies (could determine wrong winner)
   - Score calculation duplication (affects game outcome)
   - Bidding validation with 490 magic number (invalid bid value)

2. **HIGH - User Visible**:
   - Card sorting conflicts (visual inconsistencies)
   - Legal move validation (affects gameplay)
   - Belote/Rebelote split logic (scoring issues)

3. **MEDIUM - Code Quality**:
   - Magic strings (maintenance and typo risk)
   - Declaration handling split (complex but working)
   - Constants without single source

4. **LOW - Cleanup**:
   - AI Strategy wrapper redundancy (purely internal)

## Next Steps for Implementation

1. Create the following new files:
   - `/src/core/cardSorting.ts` - Unified card sorting
   - `/src/core/cardRanking.ts` - Single truth for card strength
   - `/src/core/constants.ts` - All game constants and enums
   - `/src/core/biddingRules.ts` - Centralized bidding logic
   - `/src/core/scoreCalculator.ts` - Unified scoring system
   - `/src/core/beloteManager.ts` - Belote/Rebelote logic
   - `/src/core/declarationManager.ts` - Declaration handling

2. Update imports in all affected files

3. Delete redundant files:
   - `/src/utils/cardSortUtils.ts`
   - `/src/ai/AIStrategyClass.ts`

4. Run comprehensive tests after each refactoring step

5. Update documentation to reflect new architecture