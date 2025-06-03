import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../store/hooks';
import { gameManager } from '../game/GameManager';
import { doubleBid, redoubleBid } from '../store/gameSlice';
import { useAppDispatch } from '../store/hooks';

const DoubleRedoubleButtons: React.FC = () => {
  const dispatch = useAppDispatch();
  const contract = useAppSelector(state => state.game.contract);
  const phase = useAppSelector(state => state.game.phase);
  const currentPlayer = useAppSelector(state => state.game.players[state.game.currentPlayerIndex]);
  const humanPlayer = useAppSelector(state => state.game.players.find(p => !p.isAI));
  
  const canDouble = gameManager.canDouble();
  const canRedouble = gameManager.canRedouble();
  const isHumanTurn = !currentPlayer?.isAI;

  // Only show during bidding phase when appropriate
  if (!contract || phase !== 'Bidding' || !isHumanTurn) {
    return null;
  }

  const handleDouble = async () => {
    if (canDouble && humanPlayer) {
      dispatch(doubleBid({ playerId: humanPlayer.id }));
    }
  };

  const handleRedouble = async () => {
    if (canRedouble && humanPlayer) {
      dispatch(redoubleBid({ playerId: humanPlayer.id }));
    }
  };

  return (
    <AnimatePresence>
      {(canDouble || canRedouble) && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="absolute left-4 bottom-32 z-20"
        >
          {canDouble && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDouble}
              className="mb-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-lg shadow-lg transform transition-all focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <div className="flex items-center space-x-2">
                <span className="text-xl">×2</span>
                <span>Double</span>
              </div>
            </motion.button>
          )}
          
          {canRedouble && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRedouble}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg transform transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <div className="flex items-center space-x-2">
                <span className="text-xl">×4</span>
                <span>Redouble</span>
              </div>
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DoubleRedoubleButtons;
