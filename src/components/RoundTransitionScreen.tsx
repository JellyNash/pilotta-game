import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '../store/hooks';
import DetailedScoreboard from './DetailedScoreboard';
import ContractBadge from './ContractBadge';
import './RoundTransitionScreen.css';

interface RoundTransitionScreenProps {
  onComplete: () => void;
}

const RoundTransitionScreen: React.FC<RoundTransitionScreenProps> = ({ onComplete }) => {
  const round = useAppSelector(state => state.game.round);
  const scores = useAppSelector(state => state.game.scores);
  const lastRoundScore = useAppSelector(state => state.game.lastRoundScore);
  const contract = useAppSelector(state => state.game.contract);
  const [showDetailedScoreboard, setShowDetailedScoreboard] = useState(false);

  // Auto-dismiss after 5.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showDetailedScoreboard) {
        onComplete();
      }
    }, 5500);

    return () => clearTimeout(timer);
  }, [onComplete, showDetailedScoreboard]);

  const team1Score = lastRoundScore?.team1Score || 0;
  const team2Score = lastRoundScore?.team2Score || 0;
  const contractSuccess = lastRoundScore?.contractSuccess;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="round-transition-overlay"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="round-transition-modal"
      >
        {/* Round Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="round-transition-header"
        >
          <h2 className="round-transition-title">
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
            className={`round-transition-contract-result ${contractSuccess ? 'success' : 'failed'}`}
          >
            <p className={`round-transition-contract-text ${contractSuccess ? 'success' : 'failed'}`}>
              Contract {contractSuccess ? 'Made!' : 'Failed!'}
            </p>
          </motion.div>
        )}

        {/* Round Scores */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="round-transition-scores"
        >
          <div className="round-transition-team-score">
            <h3 className="round-transition-team-name team1">Team 1</h3>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring" }}
              className="round-transition-team-points"
            >
              +{team1Score}
            </motion.p>
          </div>
          
          <div className="round-transition-team-score">
            <h3 className="round-transition-team-name team2">Team 2</h3>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.0, type: "spring" }}
              className="round-transition-team-points"
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
          className="round-transition-totals"
        >
          <h3 className="round-transition-totals-header">Total Scores</h3>
          <div className="round-transition-totals-scores">
            <div className="round-transition-total-team">
              <p className="round-transition-total-label team1">Team 1</p>
              <p className="round-transition-total-score">{scores.team1}</p>
            </div>
            <div className="round-transition-total-team">
              <p className="round-transition-total-label team2">Team 2</p>
              <p className="round-transition-total-score">{scores.team2}</p>
            </div>
          </div>
        </motion.div>

        {/* View Detailed Scoreboard Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="round-transition-button-container"
        >
          <button
            onClick={() => setShowDetailedScoreboard(true)}
            className="round-transition-button"
          >
            View Full Scoreboard
          </button>
        </motion.div>
        
        {/* Auto-dismiss timer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="round-transition-timer"
        >
          <p className="round-transition-timer-text">
            Next round starting...
          </p>
          <div className="round-transition-timer-bar">
            <div className="round-transition-timer-progress" />
          </div>
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
