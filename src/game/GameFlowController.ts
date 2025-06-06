import { AppDispatch, RootState } from '../store';
import { 
  dealCards, 
  startBidding, 
  makeBid,
  doubleBid,
  redoubleBid,
  makeDeclaration,
  startPlaying,
  playCard,
  markPlayerDeclared,
  markPlayerShown,
  updateDeclarationRights,
  enableBothTeamsToShow,
  enableThirdTrickShowing,
  completeTrick,
  completeRound,
  setValidMoves,
  updatePlayerProfile,
  setEarlyTermination,
  setPhase,
  updateRoundScores
} from '../store/gameSlice';
import { soundManager } from '../utils/soundManager';
import {
  Card,
  Player,
  GamePhase,
  Contract,
  Declaration,
  DeclarationType,
  Suit,
  Rank,
  AIPersonality,
  RoundScore,
  PlayerProfile,
  Trick,
  TrickCard
} from '../core/types';
import { createDeck, shuffleDeck, dealCards as dealHands } from '../core/cardUtils';
import { 
  determineTrickWinner, 
  calculateTrickPoints,
  findAllDeclarations,
  getLegalPlays,
  calculateRoundScore as calculateBaseRoundScore,
  determineDeclarationWinner
} from '../core/gameRules';
import { AIStrategy } from '../ai/AIStrategyClass';
import { MCTSPlayer } from '../ai/MCTSPlayer';

interface MCTSState {
  currentPlayer: number;
  hands: Card[][];
  currentTrick: TrickCard[];
  completedTricks: Trick[];
  trumpSuit: Suit | null;
  contract: Contract | null;
  scores: {
    A: number;
    B: number;
  };
}

export class GameFlowController {
  private dispatch: AppDispatch;
  private getState: () => RootState;
  private aiStrategy: AIStrategy;
  private mctsPlayer: MCTSPlayer | null = null;
  private animationDelay = 600; // ms between actions for animations

  constructor(dispatch: AppDispatch, getState: () => RootState) {
    this.dispatch = dispatch;
    this.getState = getState;
    this.aiStrategy = new AIStrategy();
  }

  // Initialize MCTS for advanced AI play
  initializeMCTS(timeLimit: number = 2000, explorationConstant: number = Math.sqrt(2)) {
    this.mctsPlayer = new MCTSPlayer(timeLimit, explorationConstant);
  }

  // Main game flow control
  async runGameFlow() {
    const state = this.getState().game;
    
    switch (state.phase) {
      case GamePhase.Dealing:
        await this.handleDealing();
        break;
      case GamePhase.Bidding:
        await this.handleBidding();
        break;
      case GamePhase.Declaring:
        await this.handleDeclarations();
        break;
      case GamePhase.Playing:
        await this.handlePlaying();
        break;
      case GamePhase.Scoring:
        await this.handleScoring();
        break;
    }
  }

  // Phase handlers
  private async handleDealing() {
    const deck = shuffleDeck(createDeck());
    const hands = dealHands(deck);
    
    const state = this.getState().game;
    const playerHands: Record<string, Card[]> = {};
    
    state.players.forEach((player, index) => {
      playerHands[player.id] = hands[index];
    });
    
    this.dispatch(dealCards({ playerHands }));
    
    // Play dealing sound
    soundManager.play('cardShuffle');
    
    // Small delay for dealing animation
    await this.delay(1000);
    
    this.dispatch(startBidding());
    await this.runGameFlow();
  }

  private async handleBidding() {
    const state = this.getState().game;
    const currentPlayer = state.players[state.currentPlayerIndex];
    
    // Update valid moves for human player
    if (!currentPlayer.isAI) {
      // Human players can always pass or bid higher than current contract
      return; // Wait for human input
    }
    
    // AI makes bid
    await this.delay(this.animationDelay);
    
    const bidDecision = this.makeAIBid(currentPlayer);
    this.dispatch(makeBid(bidDecision));
    
    // Play bid sound if bid was made
    if (bidDecision.bid !== 'pass') {
      soundManager.play('bidMade');
    }
    
    // Update AI profile based on bid
    if (currentPlayer.playerProfile && bidDecision.bid !== 'pass') {
      const aggressiveness = this.calculateBidAggressiveness(bidDecision.bid as number, currentPlayer);
      this.updateAIProfile(currentPlayer.id, { bidAggressiveness: aggressiveness });
    }
    
    // Continue game flow
    await this.runGameFlow();
  }

  private async handleDeclarations() {
    const state = this.getState().game;
    
    // Detect all potential declarations for each player
    const potentialDeclarations: Map<string, Declaration[]> = new Map();
    
    for (const player of state.players) {
      const declarations = findAllDeclarations(player.hand, player);
      if (declarations.length > 0) {
        potentialDeclarations.set(player.id, declarations);
        
        // Store declarations in state for the declaration manager to use
        for (const declaration of declarations) {
          this.dispatch(makeDeclaration({
            type: declaration.type,
            cards: declaration.cards,
            points: declaration.points,
            player
          }));
        }
      }
    }
    
    // Skip declaration phase if no one has declarations
    if (potentialDeclarations.size === 0) {
      this.dispatch(startPlaying());
      await this.runGameFlow();
      return;
    }
    
    // Start playing phase - declarations will be handled during first/second tricks
    this.dispatch(startPlaying());
    await this.runGameFlow();
  }

  private async handlePlaying() {
    const state = this.getState().game;
    const currentPlayer = state.players[state.currentPlayerIndex];
    
    // If trick is complete, process it
    if (state.currentTrick.length === 4) {
      await this.processTrickCompletion();
      return;
    }
    
    // Handle declaration logic for second trick
    if (state.trickNumber === 2 && state.currentTrick.length === 0) {
      // Check which team has stronger declarations
      const teamADeclarations = state.declarations.filter(d => d.player.teamId === 'A');
      const teamBDeclarations = state.declarations.filter(d => d.player.teamId === 'B');
      
      // Check who has declared
      const teamADeclared = state.players
        .filter(p => p.teamId === 'A')
        .some(p => state.declarationTracking?.[p.id]?.hasDeclared);
      const teamBDeclared = state.players
        .filter(p => p.teamId === 'B')
        .some(p => state.declarationTracking?.[p.id]?.hasDeclared);
      
      if (teamADeclared && teamBDeclared) {
        // Determine winner
        const winner = determineDeclarationWinner(teamADeclarations, teamBDeclarations, state.trumpSuit);
        
        if (winner) {
          // Update rights - only winning team can show
          this.dispatch(updateDeclarationRights({ 
            winningTeam: winner
          }));
        } else {
          // Tie - both teams can show (they will cancel out and get 0 points)
          this.dispatch(enableBothTeamsToShow());
        }
      }
    }
    
    // Handle third trick fallback - if winning team forgot to show, give opponents the right
    if (state.trickNumber === 3 && state.currentTrick.length === 0) {
      // Check if any team declared but didn't show
      const teamADeclared = state.players
        .filter(p => p.teamId === 'A')
        .some(p => state.declarationTracking?.[p.id]?.hasDeclared);
      const teamBDeclared = state.players
        .filter(p => p.teamId === 'B')
        .some(p => state.declarationTracking?.[p.id]?.hasDeclared);
      
      const teamAShown = state.players
        .filter(p => p.teamId === 'A')
        .some(p => state.declarationTracking?.[p.id]?.hasShown);
      const teamBShown = state.players
        .filter(p => p.teamId === 'B')
        .some(p => state.declarationTracking?.[p.id]?.hasShown);
      
      // If teams declared but neither showed, determine who had stronger declarations
      if ((teamADeclared || teamBDeclared) && !teamAShown && !teamBShown) {
        const teamADeclarations = state.declarations.filter(d => d.player.teamId === 'A');
        const teamBDeclarations = state.declarations.filter(d => d.player.teamId === 'B');
        
        if (teamADeclared && teamBDeclared) {
          // Both declared - the stronger team forfeited, give rights to opponent
          const strongerTeam = determineDeclarationWinner(teamADeclarations, teamBDeclarations, state.trumpSuit);
          const fallbackTeam = strongerTeam === 'A' ? 'B' : 'A';
          
          // Give showing rights to the fallback team
          const fallbackPlayers = state.players
            .filter(p => p.teamId === fallbackTeam && state.declarationTracking?.[p.id]?.hasDeclared)
            .map(p => p.id);
          
          this.dispatch(enableThirdTrickShowing({ playerIds: fallbackPlayers }));
        } else if (teamADeclared && !teamBDeclared) {
          // Only A declared and forgot - give B the right if they have declarations
          const teamBPlayers = state.players
            .filter(p => p.teamId === 'B' && state.declarations.some(d => d.player.id === p.id))
            .map(p => p.id);
          
          if (teamBPlayers.length > 0) {
            this.dispatch(enableThirdTrickShowing({ playerIds: teamBPlayers }));
          }
        } else if (teamBDeclared && !teamADeclared) {
          // Only B declared and forgot - give A the right if they have declarations
          const teamAPlayers = state.players
            .filter(p => p.teamId === 'A' && state.declarations.some(d => d.player.id === p.id))
            .map(p => p.id);
          
          if (teamAPlayers.length > 0) {
            this.dispatch(enableThirdTrickShowing({ playerIds: teamAPlayers }));
          }
        }
      }
    }
    
    // Get legal moves
    const legalMoves = getLegalPlays(
      currentPlayer.hand,
      state.currentTrick,
      state.trumpSuit
    );
    
    // Update valid moves for UI
    this.dispatch(setValidMoves(legalMoves));
    
    // If human player, check for auto-play of last card
    if (!currentPlayer.isAI) {
      // Auto-play if only one card left and it's the only legal move
      if (currentPlayer.hand.length === 1 && legalMoves.length === 1) {
        // Add a small delay for better UX
        await this.delay(300);
        
        // Play the last card automatically
        const lastCard = legalMoves[0];
        this.dispatch(playCard({ 
          playerId: currentPlayer.id, 
          card: lastCard 
        }));
        
        // Play card sound
        soundManager.play('cardPlay');
        
        // Continue game flow
        await this.runGameFlow();
        return;
      }
      
      // Otherwise, wait for input
      return;
    }
    
    // Handle AI declarations for first trick
    if (state.trickNumber === 1 && currentPlayer.isAI) {
      const playerDeclarations = state.declarations.filter(d => d.player.id === currentPlayer.id);
      if (playerDeclarations.length > 0 && !state.declarationTracking?.[currentPlayer.id]?.hasDeclared) {
        // AI decides whether to declare (usually yes)
        const shouldDeclare = this.shouldAIDeclare(currentPlayer, playerDeclarations);
        if (shouldDeclare) {
          this.dispatch(markPlayerDeclared({ playerId: currentPlayer.id }));
          await this.delay(500);
        }
      }
    }
    
    // Handle AI showing declarations for second trick
    if (state.trickNumber === 2 && currentPlayer.isAI) {
      const tracking = state.declarationTracking?.[currentPlayer.id];
      if (tracking?.hasDeclared && !tracking.hasShown && tracking.canShow) {
        this.dispatch(markPlayerShown({ playerId: currentPlayer.id }));
        
        // Play declaration sound
        const playerDeclarations = state.declarations.filter(d => d.player.id === currentPlayer.id);
        if (playerDeclarations.some(d => d.type === DeclarationType.Belote)) {
          soundManager.play('belote');
        } else {
          soundManager.play('declaration');
        }
        
        await this.delay(1000);
      }
    }
    
    // Handle AI showing declarations for third trick (fallback)
    if (state.trickNumber === 3 && currentPlayer.isAI) {
      const tracking = state.declarationTracking?.[currentPlayer.id];
      if (tracking?.canShow && !tracking.hasShown) {
        // AI takes advantage of third trick fallback
        this.dispatch(markPlayerShown({ playerId: currentPlayer.id }));
        
        // Play declaration sound
        const playerDeclarations = state.declarations.filter(d => d.player.id === currentPlayer.id);
        if (playerDeclarations.some(d => d.type === DeclarationType.Belote)) {
          soundManager.play('belote');
        } else {
          soundManager.play('declaration');
        }
        
        await this.delay(1000);
      }
    }
    
    // AI plays card
    await this.delay(this.animationDelay);
    
    const card = await this.makeAIPlay(currentPlayer, legalMoves);
    this.dispatch(playCard({ playerId: currentPlayer.id, card }));
    
    // Play card sound
    soundManager.play('cardPlay');
    
    // Continue game flow
    await this.runGameFlow();
  }

  private async handleScoring() {
    const state = this.getState().game;
    
    // Calculate declaration points for each team
    const declarationPoints = { A: 0, B: 0 };
    
    // Only count declarations that were both declared AND shown
    const shownDeclarations = state.declarations.filter(d => {
      const tracking = state.declarationTracking?.[d.player.id];
      return tracking?.hasDeclared && tracking?.hasShown;
    });
    
    const teamADeclarations = shownDeclarations.filter(d => d.player.teamId === 'A');
    const teamBDeclarations = shownDeclarations.filter(d => d.player.teamId === 'B');
    
    // Determine which team wins declarations
    if (teamADeclarations.length > 0 || teamBDeclarations.length > 0) {
      const declarationWinner = determineDeclarationWinner(teamADeclarations, teamBDeclarations, state.trumpSuit);
      if (declarationWinner === 'A') {
        declarationPoints.A = teamADeclarations.reduce((sum, d) => sum + d.points, 0);
      } else if (declarationWinner === 'B') {
        declarationPoints.B = teamBDeclarations.reduce((sum, d) => sum + d.points, 0);
      }
    }
    
    // Calculate belote points
    const belotePoints = { A: 0, B: 0 };
    if (state.beloteAnnounced && state.beloteAnnounced.kingPlayed) {
      belotePoints[state.beloteAnnounced.team] = 20;
    }
    
    // Get last trick winner
    const lastTrick = state.completedTricks[state.completedTricks.length - 1];
    const lastTrickWinner = lastTrick.winner.teamId;
    
    // Calculate final scores
    const result = calculateBaseRoundScore(
      state,
      { A: state.teams.A.roundScore, B: state.teams.B.roundScore },
      declarationPoints,
      belotePoints,
      lastTrickWinner
    );
    
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
    
    this.dispatch(completeRound({ 
      teamAScore: result.A, 
      teamBScore: result.B, 
      contractMade: result.contractMade,
      roundScore
    }));
    
    // Update AI profiles based on round results
    this.updateAIProfilesAfterRound();
    
    // Pause before dealing next round so players can view the scoreboard
    await this.delay(5000);
    
    // Continue to next round or game over
    if (this.getState().game.phase === GamePhase.Dealing) {
      await this.runGameFlow();
    }
  }

  // AI Decision Making
  private makeAIBid(player: Player): { playerId: string; bid: number | 'pass'; trump?: Suit } {
    const state = this.getState().game;
    const currentContract = state.contract;
    
    // Check if AI should double
    if (currentContract && !currentContract.doubled && player.teamId !== currentContract.team) {
      if (this.shouldAIDouble(player, currentContract)) {
        this.dispatch(doubleBid({ playerId: player.id }));
        return { playerId: player.id, bid: 'pass' }; // Pass after double
      }
    }
    
    // Check if AI should redouble
    if (currentContract && currentContract.doubled && !currentContract.redoubled && player.teamId === currentContract.team) {
      if (this.shouldAIRedouble(player, currentContract)) {
        this.dispatch(redoubleBid({ playerId: player.id }));
        return { playerId: player.id, bid: 'pass' }; // Pass after redouble
      }
    }
    
    // Don't make regular bids if contract is doubled
    if (currentContract?.doubled) {
      return { playerId: player.id, bid: 'pass' };
    }
    
    // Use MCTS for adaptive AI or regular strategy for others
    if (player.aiPersonality === AIPersonality.Adaptive && this.mctsPlayer) {
      // Convert to MCTS game state and get decision
      // For now, fall back to regular strategy
    }
    
    const bidDecision = this.aiStrategy.makeBid(
      player.hand,
      currentContract,
      player.teamId,
      state.teams[player.teamId].score,
      state.teams[player.teamId === 'A' ? 'B' : 'A'].score,
      player.aiPersonality || AIPersonality.Balanced,
      player.position
    );
    
    return {
      playerId: player.id,
      ...bidDecision
    };
  }

  private async makeAIPlay(player: Player, legalMoves: Card[]): Promise<Card> {
    const state = this.getState().game;
    
    // Use MCTS for adaptive AI
    if (player.aiPersonality === AIPersonality.Adaptive && this.mctsPlayer) {
      // Convert current state to MCTS format
      const mctsState = this.convertToMCTSState(state);
      const card = this.mctsPlayer.selectCard(mctsState, legalMoves);
      return card;
    }
    
    // Use regular AI strategy
    return this.aiStrategy.selectCard(
      legalMoves,
      player.hand,
      state.currentTrick,
      state.completedTricks,
      state.trumpSuit!,
      state.contract!,
      player.teamId,
      player.position,
      player.playerProfile
    );
  }

  // Helper methods
  private shouldAIDeclare(player: Player, declarations: Declaration[]): boolean {
    // AI usually declares unless very conservative
    if (player.aiPersonality === AIPersonality.Conservative) {
      // Conservative players might not declare weak declarations
      const totalPoints = declarations.reduce((sum, d) => sum + d.points, 0);
      return totalPoints >= 50; // Only declare if worth 50+ points
    }
    return true; // Other personalities always declare
  }
  
  private async processTrickCompletion() {
    const state = this.getState().game;
    const winner = determineTrickWinner(state.currentTrick, state.trumpSuit);
    const points = calculateTrickPoints(state.currentTrick, state.trumpSuit);
    
    await this.delay(1000); // Show completed trick
    
    // Play trick won sound
    soundManager.play('trickWon');
    
    this.dispatch(completeTrick({ winner, points }));
    
    // Check if contract is mathematically lost
    const updatedState = this.getState().game;
    if (this.checkEarlyTermination(updatedState)) {
      await this.handleEarlyTermination();
      return;
    }
    
    // Continue playing or move to scoring
    await this.runGameFlow();
  }

  private calculateBidAggressiveness(bid: number, player: Player): number {
    const baseValue = 100;
    const aggressiveness = (bid - baseValue) / 150; // Normalize to 0-1 scale
    
    // Exponential moving average
    if (player.playerProfile) {
      const alpha = 0.3; // Learning rate
      return alpha * aggressiveness + (1 - alpha) * player.playerProfile.bidAggressiveness;
    }
    
    return Math.max(0, Math.min(1, aggressiveness));
  }

  private updateAIProfile(
    playerId: string,
    updates: Partial<PlayerProfile>
  ) {
    this.dispatch(updatePlayerProfile({ playerId, updates }));
  }

  private updateAIProfilesAfterRound() {
    const state = this.getState().game;
    
    state.players.forEach(player => {
      if (player.isAI && player.playerProfile) {
        const profile = player.playerProfile;
        const gamesPlayed = profile.gamesPlayed + 1;
        
        // Analyze play style from move history
        const playerMoves = state.moveHistory.filter(m => m.player.id === player.id);
        const aggressivePlays = playerMoves.filter(m => 
          m.action === 'play' && this.isAggressivePlay(m.details.card, m.gameContext)
        ).length;
        
        const playStyle = aggressivePlays > playerMoves.length * 0.6 ? 'aggressive' :
                         aggressivePlays < playerMoves.length * 0.3 ? 'conservative' : 'balanced';
        
        // Update trump preferences based on successful contracts
        const trumpPreferences = { ...profile.trumpPreferences };
        if (state.contract && state.contract.bidder.id === player.id) {
          const trump = state.contract.trump;
          trumpPreferences[trump] = (trumpPreferences[trump] * gamesPlayed + 1) / (gamesPlayed + 1);
          
          // Normalize preferences
          const total = Object.values(trumpPreferences).reduce((a, b) => a + b, 0);
          Object.keys(trumpPreferences).forEach(suit => {
            trumpPreferences[suit as Suit] /= total;
          });
        }
        
        this.updateAIProfile(player.id, {
          gamesPlayed,
          playStyle,
          trumpPreferences
        });
      }
    });
  }

  private shouldAIDouble(player: Player, contract: Contract): boolean {
    // AI doubles based on hand strength and personality
    const handStrength = this.evaluateDefensiveStrength(player.hand, contract.trump);
    
    switch (player.aiPersonality) {
      case AIPersonality.Aggressive:
        // Aggressive AI doubles more often
        return handStrength > 0.6 && contract.value >= 100;
      case AIPersonality.Conservative:
        // Conservative AI only doubles with very strong defense
        return handStrength > 0.8 && contract.value >= 120;
      default:
        // Balanced AI
        return handStrength > 0.7 && contract.value >= 110;
    }
  }
  
  private shouldAIRedouble(player: Player, contract: Contract): boolean {
    // AI redoubles based on confidence in making contract
    const handStrength = this.evaluateOffensiveStrength(player.hand, contract.trump);
    
    switch (player.aiPersonality) {
      case AIPersonality.Aggressive:
        // Aggressive AI redoubles with moderate confidence
        return handStrength > 0.7;
      case AIPersonality.Conservative:
        // Conservative AI rarely redoubles
        return handStrength > 0.9;
      default:
        // Balanced AI
        return handStrength > 0.8;
    }
  }
  
  private evaluateDefensiveStrength(hand: Card[], trumpSuit: Suit): number {
    let strength = 0;
    let trumpCount = 0;
    let highCardCount = 0;
    
    hand.forEach(card => {
      if (card.suit === trumpSuit) {
        trumpCount++;
        if (card.rank === Rank.Jack || card.rank === Rank.Nine) {
          strength += 0.2;
        }
      } else {
        if (card.rank === Rank.Ace || card.rank === Rank.Ten) {
          highCardCount++;
          strength += 0.1;
        }
      }
    });
    
    // Having few trumps is good for defense
    if (trumpCount <= 2) strength += 0.2;
    
    // Having high cards in side suits is good
    strength += highCardCount * 0.1;
    
    return Math.min(1, strength);
  }
  
  private evaluateOffensiveStrength(hand: Card[], trumpSuit: Suit): number {
    let strength = 0;
    let trumpCount = 0;
    let trumpStrength = 0;
    
    hand.forEach(card => {
      if (card.suit === trumpSuit) {
        trumpCount++;
        if (card.rank === Rank.Jack) trumpStrength += 0.3;
        else if (card.rank === Rank.Nine) trumpStrength += 0.2;
        else if (card.rank === Rank.Ace) trumpStrength += 0.15;
      }
    });
    
    // Long trump suit is good for offense
    if (trumpCount >= 4) strength += 0.3;
    if (trumpCount >= 5) strength += 0.2;
    
    strength += trumpStrength;
    
    return Math.min(1, strength);
  }
  
  private isAggressivePlay(
    card: Card,
    context: { trickNumber: number }
  ): boolean {
    // High cards played early or trumping partner's trick
    return card.rank === Rank.Ace || card.rank === Rank.Jack || 
           (context.trickNumber <= 4 && (card.rank === Rank.Ten || card.rank === Rank.King));
  }

  private convertToMCTSState(gameState: RootState['game']): MCTSState {
    // Convert Redux state to MCTS game state format
    // This is a placeholder - actual implementation would map all necessary fields
    return {
      currentPlayer: gameState.currentPlayerIndex,
      hands: gameState.players.map(p => p.hand),
      currentTrick: gameState.currentTrick,
      completedTricks: gameState.completedTricks,
      trumpSuit: gameState.trumpSuit,
      contract: gameState.contract,
      scores: {
        A: gameState.teams.A.roundScore,
        B: gameState.teams.B.roundScore
      }
    };
  }

  private checkEarlyTermination(state: RootState['game']): boolean {
    // Don't check early termination until at least 4 tricks are complete
    if (state.completedTricks.length < 4) return false;
    
    const remainingTricks = 8 - state.completedTricks.length;
    if (remainingTricks === 0) return false;
    
    // Calculate current scores
    const teamAScore = state.teams.A.roundScore;
    const teamBScore = state.teams.B.roundScore;
    
    // Calculate maximum possible points remaining
    // Each remaining trick can have at most 33 points (A, 10, K, Q of trump)
    // Last trick bonus is 10 points
    // Belote is 20 points
    const maxPointsPerTrick = 33;
    const lastTrickBonus = 10;
    const maxRemainingPoints = (remainingTricks * maxPointsPerTrick) + lastTrickBonus;
    
    // Check if contract team has failed
    if (state.contract) {
      const contractTeam = state.contract.team;
      const contractValue = state.contract.value;
      
      // Check if contract team has won at least one trick (to avoid reverse capot)
      const contractTeamWonTrick = state.completedTricks.some(trick => 
        trick.winner.teamId === contractTeam
      );
      
      if (!contractTeamWonTrick) {
        // Don't terminate early if contract team hasn't won any tricks yet
        // They need to avoid reverse capot (losing all tricks)
        return false;
      }
      
      if (contractTeam === 'A') {
        // Team A has the contract
        const maxPossibleA = teamAScore + maxRemainingPoints;
        if (maxPossibleA < contractValue) {
          // Team A cannot make their contract
          return true;
        }
      } else {
        // Team B has the contract
        const maxPossibleB = teamBScore + maxRemainingPoints;
        if (maxPossibleB < contractValue) {
          // Team B cannot make their contract
          return true;
        }
      }
    }
    
    // Check if one team has already won all points
    const totalPointsSoFar = teamAScore + teamBScore;
    if (teamAScore === totalPointsSoFar || teamBScore === totalPointsSoFar) {
      // One team has all the points, the other can't score anymore
      return true;
    }
    
    return false;
  }
  
  private async handleEarlyTermination() {
    const state = this.getState().game;
    
    // Play special sound
    soundManager.play('roundOver');
    
    // Calculate remaining points
    const teamAScore = state.teams.A.roundScore;
    const teamBScore = state.teams.B.roundScore;
    const totalPointsSoFar = teamAScore + teamBScore;
    const remainingPoints = 152 - totalPointsSoFar + 10; // Including last trick bonus
    
    // Award remaining points based on contract
    let finalTeamAScore = teamAScore;
    let finalTeamBScore = teamBScore;
    
    if (state.contract) {
      const contractTeam = state.contract.team;
      if (contractTeam === 'A') {
        // Team A has contract but can't make it - Team B gets all points
        finalTeamBScore += remainingPoints;
      } else {
        // Team B has contract but can't make it - Team A gets all points
        finalTeamAScore += remainingPoints;
      }
    }
    
    // Trigger early termination in state
    this.dispatch(setEarlyTermination(true));
    
    // Wait for animation
    await this.delay(3000);
    
    // Move directly to scoring with adjusted scores
    this.dispatch(updateRoundScores({ teamA: finalTeamAScore, teamB: finalTeamBScore }));
    this.dispatch(setPhase(GamePhase.Scoring));
    
    await this.runGameFlow();
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for UI interaction
  async handleHumanBid(bid: number | 'pass', trump?: Suit) {
    const state = this.getState().game;
    const currentPlayer = state.players[state.currentPlayerIndex];
    
    if (!currentPlayer.isAI && state.phase === GamePhase.Bidding) {
      this.dispatch(makeBid({ 
        playerId: currentPlayer.id, 
        bid, 
        trump 
      }));
      await this.runGameFlow();
    }
  }

  async handleHumanDouble() {
    const state = this.getState().game;
    const currentPlayer = state.players[state.currentPlayerIndex];
    
    if (!currentPlayer.isAI && state.phase === GamePhase.Bidding) {
      this.dispatch(doubleBid({ playerId: currentPlayer.id }));
      await this.runGameFlow();
    }
  }

  async handleHumanRedouble() {
    const state = this.getState().game;
    const currentPlayer = state.players[state.currentPlayerIndex];
    
    if (!currentPlayer.isAI && state.phase === GamePhase.Bidding) {
      this.dispatch(redoubleBid({ playerId: currentPlayer.id }));
      await this.runGameFlow();
    }
  }

  async handleHumanCardPlay(card: Card) {
    const state = this.getState().game;
    const currentPlayer = state.players[state.currentPlayerIndex];
    
    if (!currentPlayer.isAI && state.phase === GamePhase.Playing) {
      // Validate move
      const legalMoves = getLegalPlays(
        currentPlayer.hand,
        state.currentTrick,
        state.trumpSuit
      );
      
      if (legalMoves.some(c => c.id === card.id)) {
        this.dispatch(playCard({ 
          playerId: currentPlayer.id, 
          card 
        }));
        
        // Play card sound
        soundManager.play('cardPlay');
        
        await this.runGameFlow();
      }
    }
  }

  // Configuration methods
  setAnimationDelay(delay: number) {
    this.animationDelay = delay;
  }

  enableMCTS(enable: boolean = true) {
    if (enable && !this.mctsPlayer) {
      this.initializeMCTS();
    } else if (!enable) {
      this.mctsPlayer = null;
    }
  }
}
