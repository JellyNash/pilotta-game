import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import { getLegalPlays } from '../core/gameRules';

// Player selectors
export const selectPlayers = (state: RootState) => state.game.players;
export const selectCurrentPlayerIndex = (state: RootState) => state.game.currentPlayerIndex;

export const selectHumanPlayer = createSelector(
  [selectPlayers],
  (players) => players.find(p => !p.isAI)
);

export const selectCurrentPlayer = createSelector(
  [selectPlayers, selectCurrentPlayerIndex],
  (players, currentIndex) => players[currentIndex]
);

export const selectIsHumanTurn = createSelector(
  [selectCurrentPlayer],
  (currentPlayer) => currentPlayer && !currentPlayer.isAI
);

// Game state selectors
export const selectGamePhase = (state: RootState) => state.game.phase;
export const selectTrumpSuit = (state: RootState) => state.game.trumpSuit;
export const selectCurrentTrick = (state: RootState) => state.game.currentTrick;
export const selectContract = (state: RootState) => state.game.contract;

export const selectCompletedTricks = (state: RootState) => state.game.completedTricks;

// Valid moves selector
export const selectValidMovesForCurrentPlayer = createSelector(
  [selectCurrentPlayer, selectCurrentTrick, selectTrumpSuit],
  (currentPlayer, currentTrick, trumpSuit) => {
    if (!currentPlayer || !currentPlayer.hand || !trumpSuit) {
      return [];
    }
    return getLegalPlays(currentPlayer.hand, currentTrick, trumpSuit);
  }
);

// Sorted hand selector
export const selectSortedHand = createSelector(
  [selectHumanPlayer, selectTrumpSuit],
  (humanPlayer, trumpSuit) => {
    if (!humanPlayer || !humanPlayer.hand || !trumpSuit) {
      return [];
    }
    // Simple sort by suit then rank
    return [...humanPlayer.hand].sort((a, b) => {
      if (a.suit !== b.suit) {
        return a.suit.localeCompare(b.suit);
      }
      return a.rank.localeCompare(b.rank);
    });
  }
);

// Team scores selector
export const selectTeamScores = createSelector(
  [(state: RootState) => state.game.scores],
  (scores) => ({
    teamA: scores.team1,
    teamB: scores.team2
  })
);

export const selectTeamATricks = createSelector(
  [selectCompletedTricks],
  (tricks) => tricks.filter(t => t.winner?.teamId === 'A')
);

export const selectTeamBTricks = createSelector(
  [selectCompletedTricks],
  (tricks) => tricks.filter(t => t.winner?.teamId === 'B')
);

// Game state summary selector
export const selectGameStateSummary = createSelector(
  [selectGamePhase, selectContract, selectCurrentPlayerIndex, selectTeamScores],
  (phase, contract, currentPlayerIndex, scores) => ({
    phase,
    contract,
    currentPlayerIndex,
    scores
  })
);