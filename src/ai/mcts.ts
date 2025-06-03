import {
  Card,
  Player,
  GameState,
  TrickCard,
  Suit,
  Contract
} from '../core/types';
import {
  getLegalPlays,
  determineTrickWinner,
  calculateTrickPoints
} from '../core/gameRules';
import {
  removeCard,
  shuffleDeck,
  countCardPoints
} from '../core/cardUtils';

// MCTS Node for game tree
export interface MCTSNode {
  state: SimplifiedGameState;
  parent: MCTSNode | null;
  children: MCTSNode[];
  move: Card | null; // The card that led to this state
  player: string; // Player ID who made the move
  
  // MCTS statistics
  visits: number;
  totalScore: number;
  availableMoves: Card[];
  untriedMoves: Card[];
}

// Simplified game state for MCTS (only relevant info)
export interface SimplifiedGameState {
  currentTrick: TrickCard[];
  hands: Map<string, Card[]>; // All player hands (determinized)
  trumpSuit: Suit | null;
  contract: Contract | null;
  trickNumber: number;
  teamScores: { A: number; B: number };
  currentPlayerIndex: number;
  players: Array<{ id: string; teamId: 'A' | 'B' }>;
  trickWinner?: string; // For completed tricks
}

// Information set for the current player
export interface InformationSet {
  myHand: Card[];
  playedCards: Card[];
  trumpSuit: Suit | null;
  contract: Contract | null;
  currentTrick: TrickCard[];
  trickNumber: number;
  teamScores: { A: number; B: number };
  players: Array<{ id: string; teamId: 'A' | 'B' }>;
  currentPlayerIndex: number;
}

// MCTS Configuration
export interface MCTSConfig {
  explorationConstant: number; // C in UCB1 formula (typically sqrt(2))
  simulationDepth: number; // Max tricks to simulate
  timeLimit: number; // Milliseconds
  deterministicSamples: number; // Number of determinizations
}

const DEFAULT_CONFIG: MCTSConfig = {
  explorationConstant: 1.414,
  simulationDepth: 8,
  timeLimit: 2000,
  deterministicSamples: 10
};

// Main MCTS class
export class MonteCarloTreeSearch {
  private config: MCTSConfig;
  private startTime: number = 0;
  
  constructor(config: Partial<MCTSConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  // Main MCTS algorithm
  search(infoSet: InformationSet): Card {
    this.startTime = Date.now();
    
    // Create multiple determinizations of hidden information
    const determinizations = this.createDeterminizations(infoSet);
    const roots: MCTSNode[] = [];
    
    // Run MCTS on each determinization
    for (const detState of determinizations) {
      const root = this.createNode(detState, null, null, infoSet.players[infoSet.currentPlayerIndex].id);
      roots.push(root);
      
      // Run iterations until time limit
      while (Date.now() - this.startTime < this.config.timeLimit / determinizations.length) {
        this.iterate(root);
      }
    }
    
    // Aggregate results across all determinizations
    return this.selectBestMove(roots, infoSet);
  }
  
  // One iteration of MCTS
  private iterate(root: MCTSNode): void {
    // 1. Selection
    let node = this.select(root);
    
    // 2. Expansion
    if (node.untriedMoves.length > 0 && !this.isTerminal(node.state)) {
      node = this.expand(node);
    }
    
    // 3. Simulation
    const score = this.simulate(node.state);
    
    // 4. Backpropagation
    this.backpropagate(node, score);
  }
  
  // Selection phase - traverse tree using UCB1
  private select(node: MCTSNode): MCTSNode {
    while (node.children.length > 0 && node.untriedMoves.length === 0) {
      node = this.selectChild(node);
    }
    return node;
  }
  
  // Select best child using UCB1 formula
  private selectChild(node: MCTSNode): MCTSNode {
    let bestChild: MCTSNode | null = null;
    let bestValue = -Infinity;
    
    const C = this.config.explorationConstant;
    const logParentVisits = Math.log(node.visits);
    
    for (const child of node.children) {
      const exploitation = child.totalScore / child.visits;
      const exploration = C * Math.sqrt(logParentVisits / child.visits);
      const ucb1Value = exploitation + exploration;
      
      if (ucb1Value > bestValue) {
        bestValue = ucb1Value;
        bestChild = child;
      }
    }
    
    return bestChild!;
  }
  
  // Expansion phase - add new child
  private expand(node: MCTSNode): MCTSNode {
    const moveIndex = Math.floor(Math.random() * node.untriedMoves.length);
    const move = node.untriedMoves[moveIndex];
    node.untriedMoves.splice(moveIndex, 1);
    
    const newState = this.applyMove(node.state, move);
    const child = this.createNode(
      newState,
      node,
      move,
      node.state.players[node.state.currentPlayerIndex].id
    );
    
    node.children.push(child);
    return child;
  }
  
  // Simulation phase - random playout
  private simulate(state: SimplifiedGameState): number {
    let simState = this.cloneState(state);
    
    // Play out the rest of the game randomly
    while (!this.isTerminal(simState)) {
      const legalMoves = this.getLegalMovesForState(simState);
      if (legalMoves.length === 0) break;
      
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      simState = this.applyMove(simState, randomMove);
    }
    
    // Return score from perspective of the AI's team
    return this.evaluateTerminalState(simState);
  }
  
  // Backpropagation phase
  private backpropagate(node: MCTSNode | null, score: number): void {
    while (node !== null) {
      node.visits++;
      node.totalScore += score;
      node = node.parent;
    }
  }
  
  // Create determinizations of hidden information
  private createDeterminizations(infoSet: InformationSet): SimplifiedGameState[] {
    const determinizations: SimplifiedGameState[] = [];
    
    // Get all cards not in my hand or already played
    const unknownCards = this.getUnknownCards(infoSet);
    
    for (let i = 0; i < this.config.deterministicSamples; i++) {
      // Shuffle and distribute unknown cards
      const shuffled = shuffleDeck(unknownCards);
      const hands = new Map<string, Card[]>();
      
      // Set my hand
      hands.set(infoSet.players[infoSet.currentPlayerIndex].id, [...infoSet.myHand]);
      
      // Distribute remaining cards to other players
      let cardIndex = 0;
      for (let j = 0; j < infoSet.players.length; j++) {
        if (j !== infoSet.currentPlayerIndex) {
          const playerId = infoSet.players[j].id;
          const cardsNeeded = 8 - infoSet.trickNumber; // Assuming 8 cards per hand initially
          const playerHand: Card[] = [];
          
          for (let k = 0; k < cardsNeeded && cardIndex < shuffled.length; k++) {
            playerHand.push(shuffled[cardIndex++]);
          }
          
          hands.set(playerId, playerHand);
        }
      }
      
      determinizations.push({
        currentTrick: [...infoSet.currentTrick],
        hands,
        trumpSuit: infoSet.trumpSuit,
        contract: infoSet.contract,
        trickNumber: infoSet.trickNumber,
        teamScores: { ...infoSet.teamScores },
        currentPlayerIndex: infoSet.currentPlayerIndex,
        players: infoSet.players.map(p => ({ ...p }))
      });
    }
    
    return determinizations;
  }
  
  // Get all cards not visible to current player
  private getUnknownCards(infoSet: InformationSet): Card[] {
    const allCards = this.createAllCards();
    const knownCards = new Set<string>();
    
    // Add my hand
    for (const card of infoSet.myHand) {
      knownCards.add(`${card.suit}-${card.rank}`);
    }
    
    // Add played cards
    for (const card of infoSet.playedCards) {
      knownCards.add(`${card.suit}-${card.rank}`);
    }
    
    // Add current trick cards
    for (const tc of infoSet.currentTrick) {
      knownCards.add(`${tc.card.suit}-${tc.card.rank}`);
    }
    
    return allCards.filter(card => !knownCards.has(`${card.suit}-${card.rank}`));
  }
  
  // Create all 32 cards
  private createAllCards(): Card[] {
    const cards: Card[] = [];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as Suit[];
    const ranks = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    for (const suit of suits) {
      for (const rank of ranks) {
        cards.push({ suit, rank: rank as any, id: `${suit}-${rank}` });
      }
    }
    
    return cards;
  }
  
  // Apply a move to create new state
  private applyMove(state: SimplifiedGameState, card: Card): SimplifiedGameState {
    const newState = this.cloneState(state);
    const currentPlayerId = state.players[state.currentPlayerIndex].id;
    
    // Remove card from player's hand
    const playerHand = newState.hands.get(currentPlayerId)!;
    newState.hands.set(
      currentPlayerId,
      playerHand.filter(c => c.id !== card.id)
    );
    
    // Add card to trick
    newState.currentTrick.push({
      player: { id: currentPlayerId, teamId: state.players[state.currentPlayerIndex].teamId } as Player,
      card,
      order: newState.currentTrick.length
    });
    
    // Check if trick is complete
    if (newState.currentTrick.length === 4) {
      // Determine winner and update scores
      const winner = determineTrickWinner(newState.currentTrick, newState.trumpSuit);
      const trickPoints = calculateTrickPoints(newState.currentTrick, newState.trumpSuit);
      
      newState.teamScores[winner.teamId] += trickPoints;
      newState.trickWinner = winner.id;
      
      // Start new trick
      newState.currentTrick = [];
      newState.trickNumber++;
      
      // Winner leads next trick
      newState.currentPlayerIndex = newState.players.findIndex(p => p.id === winner.id);
    } else {
      // Next player
      newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % 4;
    }
    
    return newState;
  }
  
  // Clone state for simulation
  private cloneState(state: SimplifiedGameState): SimplifiedGameState {
    return {
      currentTrick: state.currentTrick.map(tc => ({ ...tc })),
      hands: new Map(Array.from(state.hands.entries()).map(([k, v]) => [k, [...v]])),
      trumpSuit: state.trumpSuit,
      contract: state.contract ? { ...state.contract } : null,
      trickNumber: state.trickNumber,
      teamScores: { ...state.teamScores },
      currentPlayerIndex: state.currentPlayerIndex,
      players: state.players.map(p => ({ ...p })),
      trickWinner: state.trickWinner
    };
  }
  
  // Create new MCTS node
  private createNode(
    state: SimplifiedGameState,
    parent: MCTSNode | null,
    move: Card | null,
    playerId: string
  ): MCTSNode {
    const legalMoves = this.getLegalMovesForState(state);
    
    return {
      state,
      parent,
      children: [],
      move,
      player: playerId,
      visits: 0,
      totalScore: 0,
      availableMoves: legalMoves,
      untriedMoves: [...legalMoves]
    };
  }
  
  // Get legal moves for current player in state
  private getLegalMovesForState(state: SimplifiedGameState): Card[] {
    const currentPlayerId = state.players[state.currentPlayerIndex].id;
    const hand = state.hands.get(currentPlayerId) || [];
    
    return getLegalPlays(hand, state.currentTrick, state.trumpSuit);
  }
  
  // Check if state is terminal
  private isTerminal(state: SimplifiedGameState): boolean {
    // Game ends after 8 tricks
    return state.trickNumber >= 8;
  }
  
  // Evaluate terminal state from AI's perspective
  private evaluateTerminalState(state: SimplifiedGameState): number {
    // Simple evaluation: difference in team scores
    // Normalize to 0-1 range
    const myTeam = state.players[0].teamId; // Assuming AI is first player
    const opponentTeam = myTeam === 'A' ? 'B' : 'A';
    
    const scoreDiff = state.teamScores[myTeam] - state.teamScores[opponentTeam];
    
    // Sigmoid function to map score difference to 0-1
    return 1 / (1 + Math.exp(-scoreDiff / 50));
  }
  
  // Select best move based on visit counts across all determinizations
  private selectBestMove(roots: MCTSNode[], infoSet: InformationSet): Card {
    const moveStats = new Map<string, { visits: number; score: number }>();
    
    // Aggregate statistics for each move across all roots
    for (const root of roots) {
      for (const child of root.children) {
        const moveKey = `${child.move!.suit}-${child.move!.rank}`;
        
        if (!moveStats.has(moveKey)) {
          moveStats.set(moveKey, { visits: 0, score: 0 });
        }
        
        const stats = moveStats.get(moveKey)!;
        stats.visits += child.visits;
        stats.score += child.totalScore;
      }
    }
    
    // Select move with highest visit count (most robust)
    let bestMove: Card | null = null;
    let bestVisits = -1;
    
    for (const [moveKey, stats] of moveStats) {
      if (stats.visits > bestVisits) {
        bestVisits = stats.visits;
        // Find the actual card object
        const [suit, rank] = moveKey.split('-');
        bestMove = infoSet.myHand.find(c => c.suit === suit && c.rank === rank) || null;
      }
    }
    
    // Fallback to first legal move if something went wrong
    if (!bestMove) {
      const legalMoves = getLegalPlays(infoSet.myHand, infoSet.currentTrick, infoSet.trumpSuit);
      bestMove = legalMoves[0];
    }
    
    return bestMove;
  }
}

// Convenience function to get best move using MCTS
export function getMCTSMove(
  infoSet: InformationSet,
  config?: Partial<MCTSConfig>
): Card {
  const mcts = new MonteCarloTreeSearch(config);
  return mcts.search(infoSet);
}
