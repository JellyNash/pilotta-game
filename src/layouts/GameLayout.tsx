import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { zIndex } from './ResponsiveSystem';

interface GameLayoutProps {
  children: ReactNode;
  northPlayer: ReactNode;
  eastPlayer: ReactNode;
  southPlayer: ReactNode;
  westPlayer: ReactNode;
  centerArea: ReactNode;
  uiLayer?: ReactNode;
  className?: string;
}

/**
 * Modern responsive game layout using CSS Grid
 * Provides consistent positioning and responsive behavior
 */
export const GameLayout: React.FC<GameLayoutProps> = ({
  children,
  northPlayer,
  eastPlayer,
  southPlayer,
  westPlayer,
  centerArea,
  uiLayer,
  className = ''
}) => {
  return (
    <div className={`game-layout ${className}`}>
      {/* Background and decorative elements */}
      {children}
      
      {/* Main game grid */}
      <div className="game-grid">
        {/* North Player Area */}
        <div className="player-area player-north">
          {northPlayer}
        </div>

        {/* West Player Area */}
        <div className="player-area player-west">
          {westPlayer}
        </div>

        {/* Center Play Area */}
        <div className="play-area">
          {centerArea}
        </div>

        {/* East Player Area */}
        <div className="player-area player-east">
          {eastPlayer}
        </div>

        {/* South Player Area (Human) */}
        <div className="player-area player-south">
          {southPlayer}
        </div>
      </div>

      {/* UI Layer - floats above game content */}
      {uiLayer && (
        <div className="ui-layer" style={{ zIndex: zIndex.fixed }}>
          {uiLayer}
        </div>
      )}

      <style jsx>{`
        .game-layout {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          container-type: size;
        }

        .game-grid {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-columns: minmax(180px, 1fr) minmax(300px, 2fr) minmax(180px, 1fr);
          grid-template-rows: minmax(120px, 1fr) minmax(200px, 2fr) minmax(140px, 1fr);
          grid-template-areas:
            "north north north"
            "west center east"
            "south south south";
          gap: 1rem;
          padding: 1rem;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .game-grid {
            grid-template-columns: 60px 1fr 60px;
            grid-template-rows: 100px 1fr 120px;
            gap: 0.5rem;
            padding: 0.5rem;
          }
        }

        @media (min-width: 1280px) {
          .game-grid {
            grid-template-columns: minmax(200px, 1fr) minmax(400px, 3fr) minmax(200px, 1fr);
            grid-template-rows: minmax(140px, 1fr) minmax(300px, 3fr) minmax(160px, 1fr);
            gap: 1.5rem;
            padding: 1.5rem;
          }
        }

        /* Player areas */
        .player-area {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          container-type: size;
        }

        .player-north {
          grid-area: north;
          align-items: flex-start;
          padding-top: 1rem;
        }

        .player-east {
          grid-area: east;
          justify-content: flex-end;
          padding-right: 1rem;
        }

        .player-south {
          grid-area: south;
          align-items: flex-end;
          padding-bottom: 1rem;
        }

        .player-west {
          grid-area: west;
          justify-content: flex-start;
          padding-left: 1rem;
        }

        /* Center play area */
        .play-area {
          grid-area: center;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          container-type: size;
        }

        /* UI Layer for floating elements */
        .ui-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .ui-layer > * {
          pointer-events: auto;
        }

        /* Container queries for responsive components */
        @container (max-width: 400px) {
          .player-area {
            font-size: 0.875rem;
          }
        }

        @container (max-width: 300px) {
          .player-area {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

// Responsive player position helper
export interface PlayerPosition {
  position: 'north' | 'east' | 'south' | 'west';
  isHuman?: boolean;
}

export const getPlayerPositionClasses = ({ position, isHuman }: PlayerPosition): string => {
  const baseClasses = 'relative w-full h-full flex';
  
  const positionClasses = {
    north: 'justify-center items-start',
    east: 'justify-end items-center',
    south: 'justify-center items-end',
    west: 'justify-start items-center'
  };

  return `${baseClasses} ${positionClasses[position]} ${isHuman ? 'z-10' : ''}`;
};