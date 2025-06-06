import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoundScore } from '../core/types';

interface ScoreBreakdownProps {
  isOpen: boolean;
  onClose: () => void;
  roundScore: RoundScore | null;
  rawPoints?: { A: number; B: number };
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ 
  isOpen, 
  onClose, 
  roundScore,
  rawPoints 
}) => {
  if (!roundScore) return null;


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Round Score Breakdown</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Team Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-400 mb-3">Team A</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Trick Points:</span>
                        <span className="text-white">{roundScore.team1BasePoints || 0}</span>
                      </div>
                      
                      {roundScore.team1Declarations && roundScore.team1Declarations.length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Declarations:</span>
                          <span className="text-white">
                            {roundScore.team1Declarations.reduce((sum, d) => sum + d.points, 0)}
                          </span>
                        </div>
                      )}
                      
                      {roundScore.team1Bonuses && roundScore.team1Bonuses > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Bonuses:</span>
                          <span className="text-white">{roundScore.team1Bonuses}</span>
                        </div>
                      )}
                      
                      <div className="border-t border-slate-600 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-slate-300">Raw Total:</span>
                          <span className="text-white font-medium">
                            {rawPoints?.A || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>÷ 10</span>
                          <span>= {roundScore.team1Score}</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-600 pt-2">
                        <div className="flex justify-between text-lg">
                          <span className="text-white font-semibold">Final Score:</span>
                          <span className="text-blue-400 font-bold">{roundScore.team1Score}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-400 mb-3">Team B</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Trick Points:</span>
                        <span className="text-white">{roundScore.team2BasePoints || 0}</span>
                      </div>
                      
                      {roundScore.team2Declarations && roundScore.team2Declarations.length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Declarations:</span>
                          <span className="text-white">
                            {roundScore.team2Declarations.reduce((sum, d) => sum + d.points, 0)}
                          </span>
                        </div>
                      )}
                      
                      {roundScore.team2Bonuses && roundScore.team2Bonuses > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Bonuses:</span>
                          <span className="text-white">{roundScore.team2Bonuses}</span>
                        </div>
                      )}
                      
                      <div className="border-t border-slate-600 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-slate-300">Raw Total:</span>
                          <span className="text-white font-medium">
                            {rawPoints?.B || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>÷ 10</span>
                          <span>= {roundScore.team2Score}</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-600 pt-2">
                        <div className="flex justify-between text-lg">
                          <span className="text-white font-semibold">Final Score:</span>
                          <span className="text-red-400 font-bold">{roundScore.team2Score}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Round Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Team A Tricks:</span>
                        <span className="text-white">{roundScore.team1Tricks || 0}/8</span>
                      </div>
                      {roundScore.team1AllTricks && (
                        <div className="text-green-400 text-xs">All tricks bonus! (250 points)</div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Team B Tricks:</span>
                        <span className="text-white">{roundScore.team2Tricks || 0}/8</span>
                      </div>
                      {roundScore.team2AllTricks && (
                        <div className="text-green-400 text-xs">All tricks bonus! (250 points)</div>
                      )}
                    </div>
                  </div>
                  
                  {roundScore.contractSuccess !== undefined && (
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Contract Result:</span>
                        <span className={`font-medium ${
                          roundScore.contractSuccess ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {roundScore.contractSuccess ? 'Success' : 'Failed'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Declarations Detail */}
                {((roundScore.team1Declarations && roundScore.team1Declarations.length > 0) ||
                  (roundScore.team2Declarations && roundScore.team2Declarations.length > 0)) && (
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Declarations</h3>
                    
                    <div className="space-y-3">
                      {roundScore.team1Declarations?.map((decl, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="text-blue-400">{decl.player.name}:</span>
                          <span className="text-white ml-2">{decl.type}</span>
                          <span className="text-green-400 ml-2">+{decl.points}</span>
                        </div>
                      ))}
                      
                      {roundScore.team2Declarations?.map((decl, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="text-red-400">{decl.player.name}:</span>
                          <span className="text-white ml-2">{decl.type}</span>
                          <span className="text-green-400 ml-2">+{decl.points}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ScoreBreakdown;
