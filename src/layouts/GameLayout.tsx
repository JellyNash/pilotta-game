import React from 'react';
import { motion } from 'framer-motion';
import './game-grid.css';
import './responsive-variables.css';

interface GameLayoutProps {
  northPlayer: React.ReactNode;
  eastPlayer: React.ReactNode;
  southPlayer: React.ReactNode;
  westPlayer: React.ReactNode;
  centerContent: React.ReactNode;
  overlays?: React.ReactNode;
}

export const GameLayout: React.FC<GameLayoutProps> = ({
  northPlayer,
  eastPlayer,
  southPlayer,
  westPlayer,
  centerContent,
  overlays
}) => {
  return (
    <div className="game-table-grid" id="game-table">
      {/* Player Areas */}
      <motion.div 
        className="player-area-north"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {northPlayer}
      </motion.div>
      
      <motion.div 
        className="player-area-east"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        {eastPlayer}
      </motion.div>
      
      <motion.div 
        className="player-area-south"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {southPlayer}
      </motion.div>
      
      <motion.div 
        className="player-area-west"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        {westPlayer}
      </motion.div>
      
      {/* Center Game Area */}
      <div className="game-center">
        {centerContent}
      </div>
      
      {/* Overlay Layer for modals and floating UI */}
      {overlays && (
        <div className="game-overlays">
          {overlays}
        </div>
      )}
    </div>
  );
};