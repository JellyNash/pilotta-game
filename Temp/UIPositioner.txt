import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 
                'top-center' | 'bottom-center' | 'center' | 'custom';

interface UIPositionerProps {
  children: ReactNode;
  position: Position;
  offset?: {
    x?: string | number;
    y?: string | number;
  };
  responsive?: {
    sm?: Partial<{ position: Position; offset: { x?: string | number; y?: string | number } }>;
    md?: Partial<{ position: Position; offset: { x?: string | number; y?: string | number } }>;
    lg?: Partial<{ position: Position; offset: { x?: string | number; y?: string | number } }>;
  };
  zIndex?: string;
  className?: string;
}

/**
 * Smart UI positioning component that handles responsive placement
 * Used for buttons, notifications, and other UI elements
 */
export const UIPositioner: React.FC<UIPositionerProps> = ({
  children,
  position,
  offset = {},
  responsive = {},
  zIndex: customZIndex = 'var(--z-ui-overlay)',
  className = ''
}) => {
  // Generate position classes based on breakpoints
  const getPositionStyles = () => {
    const positions: Record<Position, string> = {
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'top-center': 'top-4 left-1/2 -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
      'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      'custom': ''
    };

    let baseClasses = `fixed ${positions[position]}`;

    // Add responsive overrides
    Object.entries(responsive).forEach(([breakpoint, config]) => {
      if (config && config.position) {
        baseClasses += ` ${breakpoint}:${positions[config.position]}`;
      }
    });

    return baseClasses;
  };

  const style: React.CSSProperties = {
    zIndex: customZIndex,
    ...(offset.x && { marginLeft: offset.x }),
    ...(offset.y && { marginTop: offset.y })
  };

  return (
    <div className={`${getPositionStyles()} ${className}`} style={style}>
      {children}
    </div>
  );
};

// Specialized button positioner for game actions
interface GameButtonPositionerProps {
  children: ReactNode;
  playerPosition: 'north' | 'east' | 'south' | 'west';
  isHuman?: boolean;
  buttonType: 'declare' | 'bid' | 'action';
  show: boolean;
}

export const GameButtonPositioner: React.FC<GameButtonPositionerProps> = ({
  children,
  playerPosition,
  isHuman = false,
  buttonType,
  show
}) => {
  // Smart positioning based on player position and button type
  const getButtonPosition = (): { position: Position; offset?: { x?: string | number; y?: string | number } } => {
    if (isHuman && playerPosition === 'south') {
      // Human player buttons positioned for easy access
      const positions = {
        declare: { position: 'bottom-left' as Position, offset: { x: '10%', y: '-2rem' } },
        bid: { position: 'bottom-center' as Position, offset: { y: '-2rem' } },
        action: { position: 'bottom-right' as Position, offset: { x: '-10%', y: '-2rem' } }
      };
      return positions[buttonType];
    }

    // AI player buttons centered relative to their position
    const aiPositions: Record<string, { position: Position; offset?: { x?: string | number; y?: string | number } }> = {
      north: { position: 'top-center' as Position, offset: { y: '8rem' } },
      east: { position: 'custom' as Position, offset: { x: '-12rem' } },
      south: { position: 'bottom-center' as Position, offset: { y: '-8rem' } },
      west: { position: 'custom' as Position, offset: { x: '12rem' } }
    };

    return aiPositions[playerPosition] || { position: 'center' as Position };
  };

  const positionConfig = getButtonPosition();

  return (
    <AnimatePresence>
      {show && (
        <UIPositioner
          position={positionConfig.position}
          offset={positionConfig.offset}
          responsive={{
            sm: isHuman ? { offset: { x: '5%' } } : undefined,
            lg: isHuman ? { offset: { x: '15%' } } : undefined
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {children}
          </motion.div>
        </UIPositioner>
      )}
    </AnimatePresence>
  );
};

// Notification positioner with smart stacking
interface NotificationPositionerProps {
  children: ReactNode;
  playerPosition: 'north' | 'east' | 'south' | 'west';
  index?: number;
}

export const NotificationPositioner: React.FC<NotificationPositionerProps> = ({
  children,
  playerPosition,
  index = 0
}) => {
  // Calculate position between player and center
  const getNotificationPosition = () => {
    const positions = {
      north: { x: '50%', y: '25%' },
      east: { x: '75%', y: '50%' },
      south: { x: '50%', y: '75%' },
      west: { x: '25%', y: '50%' }
    };

    const basePosition = positions[playerPosition];
    
    return {
      position: 'fixed' as const,
      left: basePosition.x,
      top: basePosition.y,
      transform: 'translate(-50%, -50%)',
      zIndex: `calc(var(--z-notification) + ${index})`
    };
  };

  return (
    <div style={getNotificationPosition()}>
      {children}
    </div>
  );
};