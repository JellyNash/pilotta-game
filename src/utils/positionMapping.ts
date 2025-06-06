
/**
 * Position mapping utilities to handle different position systems across components
 */

export type GamePosition = 'north' | 'east' | 'south' | 'west';
export type UIPosition = 'top' | 'right' | 'bottom' | 'left';

/**
 * Maps game positions (compass directions) to UI positions (geometric directions)
 * Used for components that expect UI positioning like BeloteIndicator
 */
export const mapGameToUIPosition = (gamePos: GamePosition): UIPosition => {
  const mapping: Record<GamePosition, UIPosition> = {
    north: 'top',
    east: 'right', 
    south: 'bottom',
    west: 'left'
  };
  return mapping[gamePos];
};

/**
 * Maps UI positions to game positions
 * Used for reverse mapping if needed
 */
export const mapUIToGamePosition = (uiPos: UIPosition): GamePosition => {
  const mapping: Record<UIPosition, GamePosition> = {
    top: 'north',
    right: 'east',
    bottom: 'south',
    left: 'west'
  };
  return mapping[uiPos];
};

