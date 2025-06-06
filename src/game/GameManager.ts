import { store } from '../store';
import { GameFlowController } from './GameFlowController';
import { newGame, setTargetScore, setAIPersonality, updateSettings } from '../store/gameSlice';
import { Card, Suit, AIPersonality } from '../core/types';

export class GameManager {
  private static instance: GameManager;
  private flowController: GameFlowController;

  private constructor() {
    this.flowController = new GameFlowController(
      store.dispatch,
      store.getState
    );
  }

  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  // Game lifecycle methods
  startNewGame(targetScore: number = 151) {
    store.dispatch(newGame());
    store.dispatch(setTargetScore(targetScore));
    this.flowController.runGameFlow();
  }

  // Configuration methods
  setAIPersonality(playerId: string, personality: AIPersonality) {
    store.dispatch(setAIPersonality({ playerId, personality }));
  }

  enableAdvancedAI(enable: boolean = true) {
    this.flowController.enableMCTS(enable);
  }

  setAnimationSpeed(speed: 'fast' | 'normal' | 'slow') {
    const delays = {
      fast: 300,
      normal: 600,
      slow: 1000
    };
    this.flowController.setAnimationDelay(delays[speed]);
    store.dispatch(updateSettings({ animationSpeed: speed }));
  }
  
  setCardScale(size: number) {
    store.dispatch(updateSettings({ cardScale: size }));
  }

  // Player actions
  async makeBid(bid: number | 'pass', trump?: Suit) {
    await this.flowController.handleHumanBid(bid, trump);
  }

  async doubleBid() {
    await this.flowController.handleHumanDouble();
  }

  async redoubleBid() {
    await this.flowController.handleHumanRedouble();
  }

  async playCard(card: Card) {
    await this.flowController.handleHumanCardPlay(card);
  }

  // Game state queries
  getGameState() {
    return store.getState().game;
  }

  getCurrentPlayer() {
    const state = store.getState().game;
    return state.players[state.currentPlayerIndex];
  }

  getHumanPlayer() {
    const state = store.getState().game;
    return state.players.find(p => !p.isAI);
  }

  isHumanTurn() {
    const state = store.getState().game;
    const currentPlayer = state.players[state.currentPlayerIndex];
    return !currentPlayer.isAI;
  }

  getValidMoves() {
    return store.getState().game.validMoves;
  }

  getMinimumBid() {
    const state = store.getState().game;
    if (!state.contract) return 80;
    return Math.min(state.contract.value + 10, 490);
  }

  canDouble() {
    const state = store.getState().game;
    const humanPlayer = this.getHumanPlayer();
    return state.contract && 
           !state.contract.doubled && 
           humanPlayer?.teamId !== state.contract.team;
  }

  canRedouble() {
    const state = store.getState().game;
    const humanPlayer = this.getHumanPlayer();
    return state.contract && 
           state.contract.doubled && 
           !state.contract.redoubled &&
           humanPlayer?.teamId === state.contract.team;
  }
}

// Export singleton instance
export const gameManager = GameManager.getInstance();
