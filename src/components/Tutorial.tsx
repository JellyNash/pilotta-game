import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Suit, Rank } from '../core/types';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      title: "Welcome to Pilotta!",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">
            Pilotta is a trick-taking card game from Cyprus, played with 4 players in 2 teams.
          </p>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">The Goal</h4>
            <p className="text-slate-400">
              Be the first team to reach the target score (usually 151 points) by winning tricks and making contracts.
            </p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Teams</h4>
            <p className="text-slate-400">
              You and your partner (North) form Team 1. The AI players (East & West) form Team 2.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Card Values",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 mb-4">
            Card values change based on whether they're trump or not:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Trump Cards</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Jack (J)</span><span className="text-yellow-400">20 points</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Nine (9)</span><span className="text-yellow-400">14 points</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ace (A)</span><span>11 points</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ten (10)</span><span>10 points</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>King (K)</span><span>4 points</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Queen (Q)</span><span>3 points</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Eight, Seven</span><span>0 points</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Non-Trump Cards</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Ace (A)</span><span>11 points</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ten (10)</span><span>10 points</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>King (K)</span><span>4 points</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Queen (Q)</span><span>3 points</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Jack (J)</span><span>2 points</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Others</span><span>0 points</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            💡 Note how Jack and Nine become the strongest trump cards!
          </p>
        </div>
      )
    },
    {
      title: "Bidding Phase",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">
            Teams compete to set the contract by bidding:
          </p>
          <div className="space-y-3">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">How to Bid</h4>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• Minimum bid is 80 points</li>
                <li>• Bids increase by 10 (80, 90, 100...)</li>
                <li>• Choose a trump suit with your bid</li>
                <li>• Or pass if you don't want to bid</li>
              </ul>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Winning the Bid</h4>
              <p className="text-sm text-slate-400">
                The highest bidder sets the contract. Their team must score at least that many points to succeed.
              </p>
            </div>
            <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-amber-400 mb-2">Double & Redouble</h4>
              <p className="text-sm text-amber-200">
                Opponents can double the contract, and the contract team can redouble, multiplying the stakes!
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Playing Tricks",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">
            The contract winner leads the first trick. Then:
          </p>
          <div className="space-y-3">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Basic Rules</h4>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• Must follow suit if possible</li>
                <li>• Trump beats all other suits</li>
                <li>• Higher card wins within the same suit</li>
                <li>• Trick winner leads the next trick</li>
              </ul>
            </div>
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-red-400 mb-2">⚠️ Forced Overtrump Rule</h4>
              <p className="text-sm text-red-200">
                If you can't follow suit and your partner isn't winning the trick, you MUST play a trump if you have one!
              </p>
            </div>
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-2">Last Trick Bonus</h4>
              <p className="text-sm text-blue-200">
                The last trick is worth an extra 10 points!
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Declarations",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">
            Special card combinations earn bonus points:
          </p>
          <div className="space-y-3">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Sequences</h4>
              <div className="space-y-1 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>3 cards in sequence</span><span className="text-green-400">20 points</span>
                </div>
                <div className="flex justify-between">
                  <span>4 cards in sequence</span><span className="text-green-400">50 points</span>
                </div>
                <div className="flex justify-between">
                  <span>5 cards in sequence</span><span className="text-green-400">100 points</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Four of a Kind (Carré)</h4>
              <div className="space-y-1 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>Four Jacks</span><span className="text-green-400">200 points</span>
                </div>
                <div className="flex justify-between">
                  <span>Four Nines</span><span className="text-green-400">150 points</span>
                </div>
                <div className="flex justify-between">
                  <span>Four Aces/10s/Kings/Queens</span><span className="text-green-400">100 points</span>
                </div>
              </div>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-400 mb-2">Belote</h4>
              <p className="text-sm text-yellow-200">
                King + Queen of trump suit = 20 points. Announce "Belote" when playing them!
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Scoring",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">
            After all 8 tricks are played:
          </p>
          <div className="space-y-3">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Contract Success</h4>
              <p className="text-sm text-slate-400">
                If the contract team scores ≥ their bid:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-400">
                <li>• Both teams keep their points</li>
                <li>• Add declaration bonuses</li>
              </ul>
            </div>
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-red-400 mb-2">Contract Failure</h4>
              <p className="text-sm text-red-200">
                If the contract team scores less than their bid:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-red-200">
                <li>• They score 0 points</li>
                <li>• Opponents get all 162 points</li>
                <li>• Plus any declarations</li>
              </ul>
            </div>
            <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-400 mb-2">Special: Capot</h4>
              <p className="text-sm text-purple-200">
                If one team wins all 8 tricks, they get 90 bonus points!
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Tips & Strategy",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">
            Become a better Pilotta player:
          </p>
          <div className="space-y-3">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">💡 Bidding Tips</h4>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• Count your high cards and trump length</li>
                <li>• Consider your partner's position</li>
                <li>• Don't overbid - failing costs you everything!</li>
              </ul>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">🎯 Playing Tips</h4>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• Lead with trump to draw out opponents' trumps</li>
                <li>• Save high trumps for crucial tricks</li>
                <li>• Remember which cards have been played</li>
                <li>• Communicate with your partner through plays</li>
              </ul>
            </div>
            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-2">🤖 AI Personalities</h4>
              <p className="text-sm text-green-200">
                Each AI has a unique style: Conservative, Aggressive, or Balanced. 
                They'll also adapt to your playing patterns over time!
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

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

          {/* Tutorial Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">How to Play Pilotta</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {pages[currentPage].title}
                    </h3>
                    {pages[currentPage].content}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="bg-slate-900 px-6 py-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all
                      ${currentPage === 0
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                      }
                    `}
                  >
                    Previous
                  </button>

                  {/* Page Indicators */}
                  <div className="flex space-x-2">
                    {pages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index)}
                        className={`
                          w-2 h-2 rounded-full transition-all
                          ${index === currentPage
                            ? 'bg-blue-500 w-6'
                            : 'bg-slate-600 hover:bg-slate-500'
                          }
                        `}
                      />
                    ))}
                  </div>

                  {currentPage === pages.length - 1 ? (
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                    >
                      Start Playing!
                    </button>
                  ) : (
                    <button
                      onClick={nextPage}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Tutorial;
