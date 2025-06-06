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

export const GAME_CONSTANTS = {
  BIDDING: {
    MIN_BID: 80,
    MAX_NORMAL_BID: 160,
    INCREMENT: 10,
    CAPOT: 250
  },
  SCORING: {
    LAST_TRICK_BONUS: 10,
    ALL_TRICKS_BONUS: 250
  }
} as const;
