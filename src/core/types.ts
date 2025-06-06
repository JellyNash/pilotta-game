// Card suits and ranks
export enum Suit {
  Hearts = 'hearts',
  Diamonds = 'diamonds',
  Clubs = 'clubs',
  Spades = 'spades'
}

export enum Rank {
  Seven = '7',
  Eight = '8',
  Nine = '9',
  Ten = '10',
  Jack = 'J',
  Queen = 'Q',
  King = 'K',
  Ace = 'A'
}

// Card model
export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // Unique identifier for UI tracking
}

// Player model
export interface Player {
  id: string;
  name: string;
  isAI: boolean;
  hand: Card[];
  teamId: 'A' | 'B';
  position: 'north' | 'east' | 'south' | 'west';
  hasBelote?: boolean; // Has K+Q of trump
  // AI-specific properties
  aiPersonality?: AIPersonality;
  playerProfile?: PlayerProfile;
}

// AI Personalities
export enum AIPersonality {
  Conservative = 'conservative',
  Aggressive = 'aggressive',
  Balanced = 'balanced',
  Adaptive = 'adaptive'
}

// Player profiling for adaptation
export interface PlayerProfile {
  bidAggressiveness: number; // 0-1 scale
  trumpPreferences: Record<Suit, number>; // Frequency of trump selection
  averageBidValue: number;
  riskTolerance: number; // 0-1 scale
  declarationFrequency: number;
  playStyle: 'aggressive' | 'conservative' | 'balanced';
  gamesPlayed: number;
}

// Trick model
export interface TrickCard {
  player: Player;
  card: Card;
  order: number; // Order in which card was played (0-3)
}

export interface Trick {
  cards: TrickCard[];
  leadSuit: Suit;
  winner?: Player;
  points: number;
}

// Contract/Bid model
export interface Contract {
  bidder: Player;
  team: 'A' | 'B';
  value: number; // 80-250
  trump: Suit;
  doubled?: boolean;
  redoubled?: boolean;
}

// Declaration types
export enum DeclarationType {
  Tierce = 'tierce',
  Quarte = 'quarte',
  Quinte = 'quinte',
  Carre = 'carre',
  Belote = 'belote'
}

export interface Declaration {
  type: DeclarationType;
  cards: Card[];
  points: number;
  player: Player;
  length?: number; // For sequences
  rank?: string; // For carré
}

// Game phases
export enum GamePhase {
  Dealing = 'dealing',
  Bidding = 'bidding',
  Declaring = 'declaring',
  Playing = 'playing',
  Scoring = 'scoring',
  GameOver = 'gameOver'
}

// Bidding entry type
export interface BidEntry {
  player: Player;
  bid: number | 'pass' | 'double' | 'redouble';
  trump?: Suit;
}

// Notification type for game events
export interface GameNotification {
  type: 'belote' | 'rebelote' | 'declaration' | 'contract' | 'score';
  player: string;
  team: 'A' | 'B';
  message: string;
  timestamp?: number;
}

// Complete game state
export interface GameState {
  // Game metadata
  id: string;
  phase: GamePhase;
  round: number;
  targetScore: number;
  
  // Players and teams
  players: Player[];
  teams: {
    A: { players: Player[]; score: number; roundScore: number };
    B: { players: Player[]; score: number; roundScore: number };
  };
  
  // Current round state
  dealerIndex: number;
  currentPlayerIndex: number;
  contract: Contract | null;
  trumpSuit: Suit | null;
  
  // Bidding state
  biddingHistory: BidEntry[];
  consecutivePasses: number;
  
  // Playing state
  currentTrick: TrickCard[];
  completedTricks: Trick[];
  trickNumber: number;
  declarations: Declaration[];
  beloteAnnounced: { 
    team: 'A' | 'B'; 
    kingPlayed: boolean;
    queenPlayed?: boolean;
    announcement?: 'belote' | 'rebelote';
  } | null;
  notifications?: GameNotification[];
  
  // AI Memory (for adaptation)
  moveHistory: MoveRecord[];
  
  // UI State
  selectedCard: Card | null;
  validMoves: Card[];
  animatingCards: string[]; // Card IDs currently animating
  
  // Score tracking
  scores: Scores;
  lastRoundScore: RoundScore | null;
  roundHistory: RoundScore[];
}

// Move recording for AI learning
export interface MoveRecord {
  round: number;
  trick: number;
  player: Player;
  action: 'bid' | 'play' | 'declare';
  details: Record<string, unknown>; // Specific to action type
  gameContext: {
    score: { A: number; B: number };
    contract: Contract | null;
    trickNumber: number;
  };
}

// Card point values
export const CARD_VALUES = {
  trump: {
    [Rank.Jack]: 20,
    [Rank.Nine]: 14,
    [Rank.Ace]: 11,
    [Rank.Ten]: 10,
    [Rank.King]: 4,
    [Rank.Queen]: 3,
    [Rank.Eight]: 0,
    [Rank.Seven]: 0
  },
  nonTrump: {
    [Rank.Ace]: 11,
    [Rank.Ten]: 10,
    [Rank.King]: 4,
    [Rank.Queen]: 3,
    [Rank.Jack]: 2,
    [Rank.Nine]: 0,
    [Rank.Eight]: 0,
    [Rank.Seven]: 0
  }
};

// Declaration point values
export const DECLARATION_POINTS = {
  [DeclarationType.Tierce]: 20,
  [DeclarationType.Quarte]: 50,
  [DeclarationType.Quinte]: 100,
  [DeclarationType.Belote]: 20,
  carre: {
    [Rank.Jack]: 200,
    [Rank.Nine]: 150,
    [Rank.Ace]: 100,
    [Rank.Ten]: 100,
    [Rank.King]: 100,
    [Rank.Queen]: 100
  }
};

// Last trick bonus
export const LAST_TRICK_BONUS = 10;

// Total points when a team collects all tricks
export const TOTAL_POINTS_ALL_TRICKS = 250;

// Total available points (without declarations)
export const TOTAL_TRICK_POINTS = 162;

// Score tracking interfaces
export interface RoundScore {
  team1Score: number;
  team2Score: number;
  team1Tricks?: number;
  team2Tricks?: number;
  team1BasePoints?: number;
  team2BasePoints?: number;
  team1Declarations?: Declaration[];
  team2Declarations?: Declaration[];
  team1Bonuses?: number;
  team2Bonuses?: number;
  team1AllTricks?: boolean;
  team2AllTricks?: boolean;
  contractSuccess?: boolean;
  rawPointsA?: number;
  rawPointsB?: number;
  contract?: Contract; // Add contract details for scoreboard display
}

export interface Scores {
  team1: number;
  team2: number;
}
