import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '../store/hooks';
import DetailedScoreboard from './DetailedScoreboard';
import ContractBadge from './ContractBadge';

interface RoundTransitionScreenProps {
  onComplete: () => void;
}

const RoundTransitionScreen: React.FC<RoundTransitionScreenProps> = ({ onComplete }) => {
  const round = useAppSelector(state => state.game.round);
  const scores = useAppSelector(state => state.game.scores);
  const lastRoundScore = useAppSelector(state => state.game.lastRoundScore);
  const contract = useAppSelector(state => state.game.contract);
  const [showDetailedScoreboard, setShowDetailedScoreboard] = useState(false);

  // Handle click anywhere to dismiss
  const handleDismiss = (e: React.MouseEvent) => {
    // Don't dismiss if clicking on buttons or detailed scoreboard
    if ((e.target as HTMLElement).closest('button') || showDetailedScoreboard) {
      return;
    }
    onComplete();
  };

  // Also allow keyboard dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        if (!showDetailedScoreboard) {
          onComplete();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onComplete, showDetailedScoreboard]);

  const team1Score = lastRoundScore?.team1Score || 0;
  const team2Score = lastRoundScore?.team2Score || 0;
  const contractSuccess = lastRoundScore?.contractSuccess;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center z-50 cursor-pointer"
      onClick={handleDismiss}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-2xl w-full mx-4"
      >
        {/* Round Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6"
        >
          <h2 className="text-4xl font-bold text-white mb-2">
            Round {round - 1} Complete
          </h2>
          {contract && (
            <div className="flex justify-center">
              <ContractBadge contract={contract} showBidder={true} />
            </div>
          )}
        </motion.div>

        {/* Contract Result */}
        {contractSuccess !== undefined && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
            className={`text-center mb-6 p-4 rounded-xl ${
              contractSuccess 
                ? 'bg-green-500/20 border-2 border-green-500' 
                : 'bg-red-500/20 border-2 border-red-500'
            }`}
          >
            <p className={`text-2xl font-bold ${
              contractSuccess ? 'text-green-400' : 'text-red-400'
            }`}>
              Contract {contractSuccess ? 'Made!' : 'Failed!'}
            </p>
          </motion.div>
        )}

        {/* Round Scores */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 gap-6 mb-6"
        >
          <div className="bg-slate-700/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Team 1</h3>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring" }}
              className="text-3xl font-bold text-white"
            >
              +{team1Score}
            </motion.p>
          </div>
          
          <div className="bg-slate-700/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Team 2</h3>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.0, type: "spring" }}
              className="text-3xl font-bold text-white"
            >
              +{team2Score}
            </motion.p>
          </div>
        </motion.div>

        {/* Total Scores */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="border-t border-slate-600 pt-4"
        >
          <h3 className="text-sm text-slate-400 text-center mb-2">Total Scores</h3>
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <p className="text-sm text-blue-400">Team 1</p>
              <p className="text-2xl font-bold text-white">{scores.team1}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-red-400">Team 2</p>
              <p className="text-2xl font-bold text-white">{scores.team2}</p>
            </div>
          </div>
        </motion.div>

        {/* View Detailed Scoreboard Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="flex justify-center mt-6"
        >
          <button
            onClick={() => setShowDetailedScoreboard(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-lg"
          >
            View Full Scoreboard
          </button>
        </motion.div>
        
        {/* Click to continue indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-slate-400 text-lg font-medium animate-pulse">
            Click anywhere to continue
          </p>
        </motion.div>
      </motion.div>
      
      {/* Detailed Scoreboard Modal */}
      <DetailedScoreboard 
        show={showDetailedScoreboard} 
        onClose={() => setShowDetailedScoreboard(false)} 
      />
    </motion.div>
  );
};

export default RoundTransitionScreen;
