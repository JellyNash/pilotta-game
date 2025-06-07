import React from 'react';
import { Player } from '../core/types';

interface PlayerZoneProps {
  player: Player;
  position: 'north' | 'east' | 'south' | 'west';
  children: React.ReactNode;
}

export const PlayerZone: React.FC<PlayerZoneProps> = ({
  player,
  position,
  children
}) => {
  return (
    <div 
      className={`player-zone player-zone-${position}`}
      data-player-id={player.id}
      data-position={position}
      role="region"
      aria-label={`${player.name}'s play area`}
    >
      {/* Player name label */}
      <div 
        className={`player-name-label player-name-${position}`}
      >
        {player.name}
      </div>
      
      {/* All player-related components render here */}
      {children}
    </div>
  );
};