import {
  Card,
  Suit,
  Contract,
  TrickCard,
  AIPersonality,
  PlayerProfile,
  Trick,
  Player,
  GameState
} from '../core/types';
import {
  decideBid,
  decideCardPlay
} from './aiStrategy';

export class AIStrategy {
  constructor() {}

  makeBid(
    hand: Card[],
    currentContract: Contract | null,
    teamId: 'A' | 'B',
    teamScore: number,
    opponentScore: number,
    personality: AIPersonality,
    position: 'north' | 'south' | 'east' | 'west'
  ): { bid: number | 'pass'; trump?: Suit } {
    // Use the decideBid function from aiStrategy.ts
    const gameContext = {
      teamScore,
      opponentScore,
      targetScore: 151 // Default target score
    };

    const currentBid = currentContract ? {
      value: currentContract.value,
      trump: currentContract.trump
    } : null;

    const result = decideBid(hand, currentBid, personality, undefined, gameContext);
    
    if (!result) {
      return { bid: 'pass' };
    }

    return { bid: result.bid, trump: result.trump };
  }

  selectCard(
    legalMoves: Card[],
    hand: Card[],
    currentTrick: TrickCard[],
    completedTricks: Trick[],
    trumpSuit: Suit,
    contract: Contract,
    teamId: 'A' | 'B',
    position: 'north' | 'south' | 'east' | 'west',
    playerProfile?: PlayerProfile
  ): Card {
    // Use the decideCardPlay function from aiStrategy.ts
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
      currentTrick,
      completedTricks,
      players: [],
      teams: {
        A: { players: [], score: 0, roundScore: 0 },
        B: { players: [], score: 0, roundScore: 0 }
      }
    } as any; // Simplified game state

    const decision = decideCardPlay(
      hand,
      currentTrick,
      completedTricks.map(t => t.cards),
      trumpSuit,
      contract,
      player,
      playerProfile?.playStyle === 'aggressive' ? AIPersonality.Aggressive :
      playerProfile?.playStyle === 'conservative' ? AIPersonality.Conservative :
      AIPersonality.Balanced,
      gameState
    );

    return decision.card;
  }
}
