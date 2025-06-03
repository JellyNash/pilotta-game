import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trick } from '../core/types';
import Card from './Card';
import TrickPileViewer from './TrickPileViewer';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface TrickPileProps {
  tricks: Trick[];
  teamId: 'A' | 'B';
  position: 'north' | 'east' | 'south' | 'west';
  currentTrickNumber: number;
}

const TrickPile: React.FC<TrickPileProps> = ({ tricks, teamId, position, currentTrickNumber }) => {
  const [showViewer, setShowViewer] = useState(false);
  const settings = useSelector((state: RootState) => state.game.settings);
  const cardSize = settings?.cardSize || 'medium';
  const showPoints = settings?.showTrickPilePoints || false;
  
  if (tricks.length === 0) return null;
  
  // Size classes based on card size setting
  const sizeClasses = {
    small: 'w-16 h-24',
    medium: 'w-20 h-28',
    large: 'w-24 h-32',
    xlarge: 'w-32 h-44'
  };
  
  const badgeSizes = {
    small: 'w-6 h-6 text-xs',
    medium: 'w-8 h-8 text-sm',
    large: 'w-10 h-10 text-base',
    xlarge: 'w-12 h-12 text-lg'
  };
  
  // Calculate pile position based on player position (to the RIGHT of each player)
  const getPileStyles = () => {
    switch (position) {
      case 'north':
        // Place to the right side of north player
        return 'top-20 left-[65%]';
      case 'south':
        // Place to the right side of south player
        return 'bottom-20 left-[65%]';
      case 'east':
        // Place below east player (to their right from their perspective)
        return 'top-[55%] right-20';
      case 'west':
        // Place above west player (to their right from their perspective)
        return 'top-[25%] left-20';
      default:
        return '';
    }
  };
  
  // Get team color
  const teamColor = teamId === 'A' ? 'blue' : 'red';
  
  return (
    <>
      <motion.div
        className={`absolute ${getPileStyles()} cursor-pointer z-10`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setShowViewer(true)}
      >
        {/* Card stack visual */}
        <div className={`relative ${sizeClasses[cardSize]}`}>
          {/* Shadow cards to create stack effect */}
          {tricks.slice(0, Math.min(3, tricks.length)).map((_, index) => (
            <div
              key={index}
              className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg shadow-lg"
              style={{
                transform: `translateY(${index * 2}px) translateX(${index * 1}px)`,
                zIndex: -index
              }}
            />
          ))}
          
          {/* Top card shows back - rotate based on player position */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-blue-900 to-red-900 rounded-lg shadow-xl overflow-hidden"
            style={{
              transform: position === 'east' ? 'rotate(-90deg)' : 
                         position === 'west' ? 'rotate(90deg)' : 
                         position === 'north' ? 'rotate(180deg)' : ''
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white/20 text-6xl font-bold transform rotate-12">
                ♠
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
          
          {/* Trick count badge */}
          <motion.div
            className={`absolute -top-2 -right-2 ${badgeSizes[cardSize]} ${
              teamId === 'A' ? 'bg-blue-500' : 'bg-red-500'
            } rounded-full flex items-center justify-center shadow-lg`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-white font-bold">{tricks.length}</span>
          </motion.div>
          
          {/* Points indicator - only show if enabled in settings */}
          {showPoints && (
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${
              teamId === 'A' ? 'bg-blue-600' : 'bg-red-600'
            } text-white text-xs px-2 py-1 rounded-full shadow-md`}>
              {tricks.reduce((sum, trick) => sum + trick.points, 0)} pts
            </div>
          )}
        </div>
        
        {/* Hover text */}
        <motion.div
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
          initial={{ opacity: 0, y: -10 }}
          whileHover={{ opacity: 1, y: 0 }}
        >
          <div className="bg-black/80 text-white text-xs px-2 py-1 rounded">
            Click to view last trick
          </div>
        </motion.div>
      </motion.div>
      
      {/* Trick viewer modal */}
      <AnimatePresence>
        {showViewer && (
          <TrickPileViewer
            tricks={tricks}
            teamId={teamId}
            onClose={() => setShowViewer(false)}
            currentTrickNumber={currentTrickNumber}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TrickPile;
