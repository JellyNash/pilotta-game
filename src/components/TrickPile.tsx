import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TrickPileViewer from './TrickPileViewer';
import { useAppSelector } from '../store/hooks';
import { selectTeamATricks, selectTeamBTricks } from '../store/selectors';

interface TrickPileProps {
  teamId: 'A' | 'B';
  position: 'north' | 'east' | 'south' | 'west';
  currentTrickNumber: number;
  isLastTrickPile?: boolean;
}

const TrickPile: React.FC<TrickPileProps> = ({ teamId, position, currentTrickNumber, isLastTrickPile = false }) => {
  const [showViewer, setShowViewer] = useState(false);
  const settings = useAppSelector(state => state.game.settings);
  const tricks = useAppSelector(teamId === 'A' ? selectTeamATricks : selectTeamBTricks);
  const showPoints = settings?.showTrickPilePoints || false;
  
  if (tricks.length === 0) return null;
  

  return (
    <>
      <motion.div
        className="relative cursor-pointer z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setShowViewer(true)}
      >
        {/* Card stack visual */}
        <div
          className="relative"
          style={{
            width: 'calc(var(--other-card-width) * var(--card-scale))',
            height: 'calc(var(--other-card-height) * var(--card-scale))'
          }}
        >
          {/* Shadow cards to create stack effect */}
          {tricks.slice(0, Math.min(3, tricks.length)).map((_, index) => (
            <div
              key={index}
              className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg shadow-lg"
              style={{
                transform: `translateY(${index * 2}px) translateX(${index * 1}px)`,
                zIndex: `calc(var(--z-trick-pile) - ${index})`
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
            className={`absolute -top-2 -right-2 ${
              teamId === 'A' ? 'bg-blue-500' : 'bg-red-500'
            } rounded-full flex items-center justify-center shadow-lg`}
            style={{
              width: 'calc(var(--card-width) * var(--card-scale) * 0.3)',
              height: 'calc(var(--card-width) * var(--card-scale) * 0.3)',
              fontSize: '0.75rem'
            }}
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
        
        {/* Previous trick indicator */}
        {isLastTrickPile && (
          <motion.div
            className="absolute -top-4 -right-4 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              PREVIOUS
            </div>
          </motion.div>
        )}
        
        {/* Hover text */}
        <motion.div
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
          initial={{ opacity: 0, y: -10 }}
          whileHover={{ opacity: 1, y: 0 }}
        >
          <div className="bg-black/80 text-white text-xs px-2 py-1 rounded">
            {isLastTrickPile ? 'Click to view previous trick' : 'Click to view last trick won'}
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
            isLastTrickPile={isLastTrickPile}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TrickPile;