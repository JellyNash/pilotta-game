import {
  Card,
  Suit
} from '../core/types';
import {
  getMCTSMove,
  InformationSet,
  MCTSConfig
} from './mcts';

export class MCTSPlayer {
  private config: Partial<MCTSConfig>;

  constructor(timeLimit: number = 2000, explorationConstant: number = Math.sqrt(2)) {
    this.config = {
      timeLimit,
      explorationConstant,
      simulationDepth: 8,
      deterministicSamples: 10
    };
  }

  selectCard(gameState: any, legalMoves: Card[]): Card {
    // Convert game state to information set for MCTS
    const infoSet: InformationSet = {
      myHand: legalMoves, // In this context, legalMoves are from the current player's hand
      playedCards: this.getPlayedCards(gameState),
      trumpSuit: gameState.trumpSuit,
      contract: gameState.contract,
      currentTrick: gameState.currentTrick,
      trickNumber: gameState.completedTricks.length + 1,
      teamScores: gameState.scores,
      players: gameState.players.map((p: any) => ({
        id: p.id,
        teamId: p.teamId
      })),
      currentPlayerIndex: gameState.currentPlayerIndex
    };

    // Use MCTS to select the best move
    return getMCTSMove(infoSet, this.config);
  }

  private getPlayedCards(gameState: any): Card[] {
    const playedCards: Card[] = [];
    
    // Add cards from completed tricks
    for (const trick of gameState.completedTricks) {
      for (const trickCard of trick.cards) {
        playedCards.push(trickCard.card);
      }
    }
    
    // Add cards from current trick
    for (const trickCard of gameState.currentTrick) {
      playedCards.push(trickCard.card);
    }
    
    return playedCards;
  }
}
