import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import {
  GamePhase,
  Player,
  Card,
  Suit,
  TrickCard,
  Declaration,
  MoveRecord,
  AIPersonality,
  PlayerProfile,
  Trick,
  RoundScore,
  GameState as BaseGameState,
  GameNotification
} from '../core/types';

// Game Settings interface
export interface GameSettings {
  cardSize: 'small' | 'medium' | 'large' | 'xlarge';
  cardStyle: 'classic' | 'modern' | 'accessible' | 'minimalist';
  soundEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  advancedAI: boolean;
  showTrickPilePoints: boolean;
  rightClickZoom: boolean;
}

// Declaration tracking interface
export interface DeclarationTracking {
  [playerId: string]: {
    hasDeclared: boolean;
    hasShown: boolean;
    canShow: boolean;
  };
}

// Extend GameState to include settings
export interface GameState extends BaseGameState {
  settings?: GameSettings;
  declarationTracking?: DeclarationTracking;
  earlyTermination?: boolean;
  zoomedCard?: string | null; // Card ID that is currently zoomed
}

// Initial player profiles for adaptive AI
const createInitialProfile = (): PlayerProfile => ({
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
});

// Initial state factory
const createInitialState = (): GameState => {
  // Load saved settings
  const savedCardSize = localStorage.getItem('cardSize') as 'small' | 'medium' | 'large' | 'xlarge' | null;
  // Create players - counterclockwise order: South -> East -> North -> West
  const players: Player[] = [
    {
      id: uuidv4(),
      name: 'You',
      isAI: false,
      hand: [],
      teamId: 'A',
      position: 'south'
    },
    {
      id: uuidv4(),
      name: 'AI Player 2',
      isAI: true,
      hand: [],
      teamId: 'B',
      position: 'east',
      aiPersonality: AIPersonality.Aggressive,
      playerProfile: createInitialProfile()
    },
    {
      id: uuidv4(),
      name: 'Partner',
      isAI: true,
      hand: [],
      teamId: 'A',
      position: 'north',
      aiPersonality: AIPersonality.Conservative,
      playerProfile: createInitialProfile()
    },
    {
      id: uuidv4(),
      name: 'AI Player 1',
      isAI: true,
      hand: [],
      teamId: 'B',
      position: 'west',
      aiPersonality: AIPersonality.Balanced,
      playerProfile: createInitialProfile()
    }
  ];

  return {
    id: uuidv4(),
    phase: GamePhase.Dealing,
    round: 1,
    targetScore: 151,
    players,
    teams: {
      A: {
        players: players.filter(p => p.teamId === 'A'),
        score: 0,
        roundScore: 0
      },
      B: {
        players: players.filter(p => p.teamId === 'B'),
        score: 0,
        roundScore: 0
      }
    },
    dealerIndex: 0,
    currentPlayerIndex: 1, // Player after dealer starts
    contract: null,
    trumpSuit: null,
    biddingHistory: [],
    consecutivePasses: 0,
    currentTrick: [],
    completedTricks: [],
    trickNumber: 1,
    declarations: [],
    beloteAnnounced: null,
    moveHistory: [],
    selectedCard: null,
    validMoves: [],
    animatingCards: [],
    scores: { team1: 0, team2: 0 },
    lastRoundScore: null,
    roundHistory: [],
    settings: {
      cardSize: savedCardSize || 'large',  // Default to large for low vision
      cardStyle: 'classic',  // Default to classic style
      soundEnabled: true,
      animationSpeed: 'normal',
      advancedAI: false,
      showTrickPilePoints: false,
      rightClickZoom: true
    },
    zoomedCard: null,
    declarationTracking: {},
    earlyTermination: false
  };
};

// Slice definition
const gameSlice = createSlice({
  name: 'game',
  initialState: createInitialState(),
  reducers: {
    // Game initialization
    newGame: () => {
      return createInitialState();
    },

    setTargetScore: (state, action: PayloadAction<number>) => {
      state.targetScore = action.payload;
    },

    setAIPersonality: (state, action: PayloadAction<{
      playerId: string;
      personality: AIPersonality
    }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (player && player.isAI) {
        player.aiPersonality = action.payload.personality;
      }
    },

    // Dealing phase
    dealCards: (state, action: PayloadAction<{
      playerHands: Record<string, Card[]>
    }>) => {
      state.phase = GamePhase.Dealing;
      state.players.forEach(player => {
        player.hand = action.payload.playerHands[player.id] || [];
      });
      // Reset round-specific state
      state.contract = null;
      state.trumpSuit = null;
      state.biddingHistory = [];
      state.consecutivePasses = 0;
      state.currentTrick = [];
      state.completedTricks = [];
      state.trickNumber = 1;
      state.declarations = [];
      state.beloteAnnounced = null;
      state.validMoves = [];
      state.teams.A.roundScore = 0;
      state.teams.B.roundScore = 0;
      // Trick piles are derived from completed tricks, so no per-team arrays
      state.declarationTracking = {};
      state.earlyTermination = false;
    },

    startBidding: (state) => {
      state.phase = GamePhase.Bidding;
      // Counterclockwise: dealer + 1 in array order
      state.currentPlayerIndex = (state.dealerIndex + 1) % 4;
    },

    // Bidding phase
    makeBid: (state, action: PayloadAction<{
      playerId: string;
      bid: number | 'pass';
      trump?: Suit;
    }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (!player) return;

      // Don't allow regular bids if contract is doubled
      if (state.contract?.doubled && action.payload.bid !== 'pass') {
        return;
      }

      state.biddingHistory.push({
        player,
        bid: action.payload.bid,
        trump: action.payload.trump
      });

      if (action.payload.bid === 'pass') {
        state.consecutivePasses++;
      } else {
        state.consecutivePasses = 0;
        if (typeof action.payload.bid === 'number' && action.payload.trump) {
          state.contract = {
            bidder: player,
            team: player.teamId,
            value: action.payload.bid,
            trump: action.payload.trump,
            doubled: false,
            redoubled: false
          };
          state.trumpSuit = action.payload.trump;
        }
      }

      // Move to next player counterclockwise
      state.currentPlayerIndex = (state.currentPlayerIndex + 1) % 4;

      // Check if bidding is complete (4 consecutive passes or 3 passes after a bid)
      if (state.consecutivePasses === 4 ||
        (state.contract && state.consecutivePasses === 3)) {
        if (state.contract) {
          state.phase = GamePhase.Declaring;
        } else {
          // No contract - redeal
          state.phase = GamePhase.Dealing;
          state.dealerIndex = (state.dealerIndex + 1) % 4;
        }
      }

      // Record move for AI adaptation
      const moveRecord: MoveRecord = {
        round: state.round,
        trick: 0,
        player,
        action: 'bid',
        details: { bid: action.payload.bid, trump: action.payload.trump },
        gameContext: {
          score: { A: state.teams.A.score, B: state.teams.B.score },
          contract: state.contract,
          trickNumber: 0
        }
      };
      state.moveHistory.push(moveRecord);
    },

    doubleBid: (state, action: PayloadAction<{ playerId: string }>) => {
      if (state.contract && !state.contract.doubled) {
        const player = state.players.find(p => p.id === action.payload.playerId);
        if (player && player.teamId !== state.contract.team) {
          state.contract.doubled = true;
          state.consecutivePasses = 0; // Reset passes after double

          // Add to bidding history
          state.biddingHistory.push({
            player,
            bid: 'double',
            trump: state.contract.trump
          });

          // Move to next player
          state.currentPlayerIndex = (state.currentPlayerIndex + 1) % 4;
        }
      }
    },

    redoubleBid: (state, action: PayloadAction<{ playerId: string }>) => {
      if (state.contract && state.contract.doubled && !state.contract.redoubled) {
        const player = state.players.find(p => p.id === action.payload.playerId);
        if (player && player.teamId === state.contract.team) {
          state.contract.redoubled = true;
          state.consecutivePasses = 0; // Reset passes after redouble

          // Add to bidding history
          state.biddingHistory.push({
            player,
            bid: 'redouble',
            trump: state.contract.trump
          });

          // Move to next player
          state.currentPlayerIndex = (state.currentPlayerIndex + 1) % 4;
        }
      }
    },

    // Declaration phase
    makeDeclaration: (state, action: PayloadAction<Declaration>) => {
      state.declarations.push(action.payload);

      // Record move for AI adaptation
      const player = action.payload.player;
      const moveRecord: MoveRecord = {
        round: state.round,
        trick: 0,
        player,
        action: 'declare',
        details: { declaration: action.payload },
        gameContext: {
          score: { A: state.teams.A.score, B: state.teams.B.score },
          contract: state.contract,
          trickNumber: 0
        }
      };
      state.moveHistory.push(moveRecord);
    },

    startPlaying: (state) => {
      state.phase = GamePhase.Playing;
      // Contract bidder leads first trick
      if (state.contract) {
        const bidderIndex = state.players.findIndex(p => p.id === state.contract!.bidder.id);
        state.currentPlayerIndex = bidderIndex;
      }
    },

    // Playing phase
    selectCard: (state, action: PayloadAction<Card | null>) => {
      state.selectedCard = action.payload;
    },

    setValidMoves: (state, action: PayloadAction<Card[]>) => {
      state.validMoves = action.payload;
    },

    playCard: (state, action: PayloadAction<{
      playerId: string;
      card: Card;
    }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (!player) return;

      // Remove card from player's hand
      player.hand = player.hand.filter(c => c.id !== action.payload.card.id);

      // Add to current trick
      const trickCard: TrickCard = {
        player,
        card: action.payload.card,
        order: state.currentTrick.length
      };
      state.currentTrick.push(trickCard);

      // Add to animating cards for UI
      state.animatingCards.push(action.payload.card.id);

      // Record move for AI adaptation
      const moveRecord: MoveRecord = {
        round: state.round,
        trick: state.trickNumber,
        player,
        action: 'play',
        details: { card: action.payload.card },
        gameContext: {
          score: { A: state.teams.A.score, B: state.teams.B.score },
          contract: state.contract,
          trickNumber: state.trickNumber
        }
      };
      state.moveHistory.push(moveRecord);

      // Check for Belote announcement (King and Queen of trump suit)
      if (state.trumpSuit && action.payload.card.suit === state.trumpSuit) {
        const isKing = action.payload.card.rank === 'K';
        const isQueen = action.payload.card.rank === 'Q';

        if (isKing || isQueen) {
          // Check if player has the other card (K needs Q, Q needs K)
          const hasOther = player.hand.some(c =>
            c.suit === state.trumpSuit &&
            c.rank === (isKing ? 'Q' : 'K')
          );

          if (hasOther || state.beloteAnnounced?.team === player.teamId) {
            // First card of the pair - announce "Belote"
            if (!state.beloteAnnounced || state.beloteAnnounced.team !== player.teamId) {
              state.beloteAnnounced = {
                team: player.teamId,
                kingPlayed: isKing,
                queenPlayed: isQueen,
                announcement: 'belote'
              };
              // Add to notifications for UI to display
              if (!state.notifications) state.notifications = [];
              state.notifications.push({
                type: 'belote',
                player: player.name,
                team: player.teamId,
                message: 'Belote!',
                timestamp: Date.now()
              });
            }
            // Second card of the pair - announce "Rebelote"
            else if (state.beloteAnnounced.team === player.teamId) {
              state.beloteAnnounced.kingPlayed = state.beloteAnnounced.kingPlayed || isKing;
              state.beloteAnnounced.queenPlayed = state.beloteAnnounced.queenPlayed || isQueen;
              state.beloteAnnounced.announcement = 'rebelote';
              // Add to notifications for UI to display
              if (!state.notifications) state.notifications = [];
              state.notifications.push({
                type: 'rebelote',
                player: player.name,
                team: player.teamId,
                message: 'Rebelote!',
                timestamp: Date.now()
              });
            }
          }
        }
      }

      // Clear selected card and valid moves
      state.selectedCard = null;
      state.validMoves = [];

      // Move to next player
      if (state.currentTrick.length < 4) {
        state.currentPlayerIndex = (state.currentPlayerIndex + 1) % 4;
      }
    },

    completeTrick: (state, action: PayloadAction<{
      winner: Player;
      points: number;
    }>) => {
      // Create completed trick
      const leadSuit = state.currentTrick[0].card.suit;
      const trick: Trick = {
        cards: [...state.currentTrick],
        leadSuit,
        winner: action.payload.winner,
        points: action.payload.points
      };

      state.completedTricks.push(trick);
      state.currentTrick = [];
      state.animatingCards = [];

      // Update round scores
      const winningTeam = action.payload.winner.teamId;
      if (winningTeam === 'A') {
        state.teams.A.roundScore += action.payload.points;
      } else {
        state.teams.B.roundScore += action.payload.points;
      }

      // Winner leads next trick
      const winnerIndex = state.players.findIndex(p => p.id === action.payload.winner.id);
      state.currentPlayerIndex = winnerIndex;

      // Check if round is complete
      if (state.completedTricks.length === 8) {
        state.phase = GamePhase.Scoring;
      } else {
        state.trickNumber++;
      }
    },

    // Scoring phase
    completeRound: (state, action: PayloadAction<{
      teamAScore: number;
      teamBScore: number;
      contractMade: boolean;
      roundScore: RoundScore;
    }>) => {
      // Update total scores
      state.teams.A.score += action.payload.teamAScore;
      state.teams.B.score += action.payload.teamBScore;
      // IMPORTANT: Maintain consistent mapping - Team A = team1, Team B = team2
      state.scores.team1 = state.teams.A.score;
      state.scores.team2 = state.teams.B.score;

      // Store round score with contract details
      const roundScoreWithContract: RoundScore = {
        ...action.payload.roundScore,
        contract: state.contract || undefined
      };
      state.lastRoundScore = roundScoreWithContract;
      state.roundHistory.push(roundScoreWithContract);

      // Check for game over
      if (state.teams.A.score >= state.targetScore ||
        state.teams.B.score >= state.targetScore) {
        state.phase = GamePhase.GameOver;
      } else {
        // Next round
        state.round++;
        state.dealerIndex = (state.dealerIndex + 1) % 4;
        state.phase = GamePhase.Dealing;
      }
    },

    // AI Adaptation
    updatePlayerProfile: (state, action: PayloadAction<{
      playerId: string;
      updates: Partial<PlayerProfile>;
    }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (player && player.playerProfile) {
        Object.assign(player.playerProfile, action.payload.updates);
      }
    },

    // Animation helpers
    addAnimatingCard: (state, action: PayloadAction<string>) => {
      state.animatingCards.push(action.payload);
    },

    removeAnimatingCard: (state, action: PayloadAction<string>) => {
      state.animatingCards = state.animatingCards.filter(id => id !== action.payload);
    },

    clearAnimatingCards: (state) => {
      state.animatingCards = [];
    },

    updateSettings: (state, action: PayloadAction<Partial<{
      cardSize: 'small' | 'medium' | 'large' | 'xlarge';
      cardStyle: 'classic' | 'modern' | 'accessible' | 'minimalist';
      soundEnabled: boolean;
      animationSpeed: 'slow' | 'normal' | 'fast';
      advancedAI: boolean;
      showTrickPilePoints: boolean;
      rightClickZoom: boolean;
    }>>) => {
      if (!state.settings) {
        state.settings = {
          cardSize: 'large',  // Default to large for low vision
          cardStyle: 'classic',
          soundEnabled: true,
          animationSpeed: 'normal',
          advancedAI: false,
          showTrickPilePoints: false,
          rightClickZoom: true
        };
      }
      Object.assign(state.settings, action.payload);
    },

    // Card zoom action
    toggleCardZoom: (state, action: PayloadAction<string | null>) => {
      if (state.settings?.rightClickZoom) {
        state.zoomedCard = state.zoomedCard === action.payload ? null : action.payload;
      }
    },

    // Declaration actions
    markPlayerDeclared: (state, action: PayloadAction<{ playerId: string }>) => {
      if (!state.declarationTracking) {
        state.declarationTracking = {};
      }
      if (!state.declarationTracking[action.payload.playerId]) {
        state.declarationTracking[action.payload.playerId] = {
          hasDeclared: false,
          hasShown: false,
          canShow: false
        };
      }
      state.declarationTracking[action.payload.playerId].hasDeclared = true;
      state.declarationTracking[action.payload.playerId].canShow = true;
    },

    markPlayerShown: (state, action: PayloadAction<{ playerId: string }>) => {
      if (state.declarationTracking && state.declarationTracking[action.payload.playerId]) {
        state.declarationTracking[action.payload.playerId].hasShown = true;
        state.declarationTracking[action.payload.playerId].canShow = false;
      }
    },

    updateDeclarationRights: (state, action: PayloadAction<{
      winningTeam: 'A' | 'B';
    }>) => {
      // When a team wins declaration rights, only that team can show
      const tracking = state.declarationTracking;
      if (tracking) {
        // First, disable showing for all players
        Object.keys(tracking).forEach(playerId => {
          tracking[playerId].canShow = false;
        });

        // Then enable showing for winning team players who declared
        state.players.forEach(player => {
          if (player.teamId === action.payload.winningTeam) {
            const playerTracking = tracking[player.id];
            if (playerTracking && playerTracking.hasDeclared && !playerTracking.hasShown) {
              playerTracking.canShow = true;
            }
          }
        });
      }
    },

    enableBothTeamsToShow: (state) => {
      // Enable showing for all players who have declared but not shown (used for tied declarations)
      const tracking = state.declarationTracking;
      if (tracking) {
        state.players.forEach(player => {
          const playerTracking = tracking[player.id];
          if (playerTracking && playerTracking.hasDeclared && !playerTracking.hasShown) {
            playerTracking.canShow = true;
          }
        });
      }
    },

    enableThirdTrickShowing: (state, action: PayloadAction<{ playerIds: string[] }>) => {
      // Enable showing for third trick fallback
      if (!state.declarationTracking) {
        state.declarationTracking = {};
      }
      const tracking = state.declarationTracking;
      action.payload.playerIds.forEach(playerId => {
        if (!tracking[playerId]) {
          tracking[playerId] = {
            hasDeclared: false,
            hasShown: false,
            canShow: false
          };
        }
        tracking[playerId].canShow = true;
      });
    },

    setEarlyTermination: (state, action: PayloadAction<boolean>) => {
      state.earlyTermination = action.payload;
    },

    setPhase: (state, action: PayloadAction<GamePhase>) => {
      state.phase = action.payload;
    },

    updateRoundScores: (state, action: PayloadAction<{ teamA: number; teamB: number }>) => {
      state.teams.A.roundScore = action.payload.teamA;
      state.teams.B.roundScore = action.payload.teamB;
    },

    clearNotification: (state, action: PayloadAction<GameNotification>) => {
      if (state.notifications) {
        state.notifications = state.notifications.filter(
          n => n.timestamp !== action.payload.timestamp || n.type !== action.payload.type
        );
      }
    }
  }
});

export const {
  newGame,
  updateSettings,
  toggleCardZoom,
  setTargetScore,
  setAIPersonality,
  dealCards,
  startBidding,
  makeBid,
  doubleBid,
  redoubleBid,
  makeDeclaration,
  startPlaying,
  selectCard,
  setValidMoves,
  playCard,
  completeTrick,
  completeRound,
  updatePlayerProfile,
  clearNotification,
  addAnimatingCard,
  removeAnimatingCard,
  clearAnimatingCards,
  markPlayerDeclared,
  markPlayerShown,
  updateDeclarationRights,
  enableBothTeamsToShow,
  enableThirdTrickShowing,
  setEarlyTermination,
  setPhase,
  updateRoundScores
} = gameSlice.actions;

export default gameSlice.reducer;