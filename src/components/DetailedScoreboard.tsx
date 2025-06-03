import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../store/hooks';
import ContractBadge from './ContractBadge';
import { RoundScore } from '../core/types';

interface DetailedScoreboardProps {
  show: boolean;
  onClose: () => void;
}

const DetailedScoreboard: React.FC<DetailedScoreboardProps> = ({ show, onClose }) => {
  const roundHistory = useAppSelector(state => state.game.roundHistory);
  const teams = useAppSelector(state => state.game.teams);
  const targetScore = useAppSelector(state => state.game.targetScore);
  const currentRound = useAppSelector(state => state.game.round);
  
  // Calculate cumulative scores
  const getCumulativeScores = () => {
    let teamATotal = 0;
    let teamBTotal = 0;
    
    return roundHistory.map((round, index) => {
      teamATotal += round.team1Score;
      teamBTotal += round.team2Score;
      return {
        round: round,
        roundNumber: index + 1,
        teamACumulative: teamATotal,
        teamBCumulative: teamBTotal
      };
    });
  };
  
  const cumulativeScores = getCumulativeScores();
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  Game Scoreboard
                </h2>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Current totals */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-sm text-white/70">Team A</div>
                  <div className="text-3xl font-bold text-white">{teams.A.score}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-sm text-white/70">Target</div>
                  <div className="text-3xl font-bold text-white">{targetScore}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-right">
                  <div className="text-sm text-white/70">Team B</div>
                  <div className="text-3xl font-bold text-white">{teams.B.score}</div>
                </div>
              </div>
            </div>
            
            {/* Round history table */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {cumulativeScores.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  No rounds completed yet
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Table header */}
                  <div className="grid grid-cols-9 gap-4 text-sm font-semibold text-slate-400 pb-2 border-b border-slate-700">
                    <div>Round</div>
                    <div className="col-span-2 text-center">Contract</div>
                    <div className="text-center">Team A</div>
                    <div className="text-center">Team B</div>
                    <div className="text-center">A Decl.</div>
                    <div className="text-center">B Decl.</div>
                    <div className="text-center">A Total</div>
                    <div className="text-center">B Total</div>
                  </div>
                  
                  {/* Round rows */}
                  {cumulativeScores.map((data, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="grid grid-cols-9 gap-4 items-center bg-slate-700/30 rounded-lg p-3"
                    >
                      <div className="font-semibold text-white">
                        {data.roundNumber}
                      </div>
                      
                      <div className="col-span-2 flex justify-center">
                        {data.round.contract ? (
                          <ContractBadge contract={data.round.contract} size="small" />
                        ) : (
                          <span className="text-slate-500">No contract</span>
                        )}
                      </div>
                      
                      <div className={`text-center font-semibold ${
                        data.round.team1Score > data.round.team2Score ? 'text-green-400' : 'text-white'
                      }`}>
                        +{data.round.team1Score}
                      </div>
                      
                      <div className={`text-center font-semibold ${
                        data.round.team2Score > data.round.team1Score ? 'text-green-400' : 'text-white'
                      }`}>
                        +{data.round.team2Score}
                      </div>
                      
                      {/* Team A Declarations */}
                      <div className="text-center text-xs">
                        {data.round.team1Declarations && data.round.team1Declarations.length > 0 ? (
                          <div>
                            <div className="text-blue-400 font-semibold">
                              +{data.round.team1Declarations.reduce((sum, d) => sum + d.points, 0)}
                            </div>
                            <div className="text-slate-400">
                              {data.round.team1Declarations.map(d => d.type).join(', ')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </div>
                      
                      {/* Team B Declarations */}
                      <div className="text-center text-xs">
                        {data.round.team2Declarations && data.round.team2Declarations.length > 0 ? (
                          <div>
                            <div className="text-red-400 font-semibold">
                              +{data.round.team2Declarations.reduce((sum, d) => sum + d.points, 0)}
                            </div>
                            <div className="text-slate-400">
                              {data.round.team2Declarations.map(d => d.type).join(', ')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </div>
                      
                      <div className="text-center text-blue-400 font-bold">
                        {data.teamACumulative}
                      </div>
                      
                      <div className="text-center text-red-400 font-bold">
                        {data.teamBCumulative}
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Current round indicator */}
                  {currentRound > roundHistory.length && (
                    <div className="text-center text-slate-400 italic pt-4">
                      Round {currentRound} in progress...
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Footer stats */}
            <div className="border-t border-slate-700 px-6 py-4 bg-slate-900/50">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Rounds Played:</span>
                  <span className="ml-2 font-semibold text-white">{roundHistory.length}</span>
                </div>
                <div>
                  <span className="text-slate-400">Team A Wins:</span>
                  <span className="ml-2 font-semibold text-blue-400">
                    {roundHistory.filter(r => r.team1Score > r.team2Score).length}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Team B Wins:</span>
                  <span className="ml-2 font-semibold text-red-400">
                    {roundHistory.filter(r => r.team2Score > r.team1Score).length}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Contracts Made:</span>
                  <span className="ml-2 font-semibold text-green-400">
                    {roundHistory.filter(r => r.contractSuccess).length}
                  </span>
                </div>
              </div>
              
              {/* Declaration totals */}
              <div className="grid grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-slate-700">
                <div>
                  <span className="text-slate-400">Team A Declaration Total:</span>
                  <span className="ml-2 font-semibold text-blue-400">
                    {roundHistory.reduce((sum, r) => 
                      sum + (r.team1Declarations?.reduce((dSum, d) => dSum + d.points, 0) || 0), 0
                    )} pts
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Team B Declaration Total:</span>
                  <span className="ml-2 font-semibold text-red-400">
                    {roundHistory.reduce((sum, r) => 
                      sum + (r.team2Declarations?.reduce((dSum, d) => dSum + d.points, 0) || 0), 0
                    )} pts
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DetailedScoreboard;
