import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '../store/hooks';
import { Suit, Player, BiddingEntry } from '../core/types';
import { GAME_CONSTANTS } from '../core/constants';
import { gameManager } from '../game/GameManager';
import { getSuitColorValue } from '../utils/suitColors';

// Bidding History Table Component
interface BiddingHistoryTableProps {
  biddingHistory: BiddingEntry[];
  players: Player[];
  humanPlayerId?: string;
  dealerIndex: number;
  getSuitColor: (suit: Suit) => string;
  getSuitSymbol: (suit: Suit) => string;
}

const BiddingHistoryTable: React.FC<BiddingHistoryTableProps> = ({
  biddingHistory,
  players,
  humanPlayerId,
  dealerIndex,
  getSuitColor,
  getSuitSymbol
}) => {
  // Get player order starting from dealer + 1
  const getPlayerOrder = () => {
    const order: Player[] = [];
    for (let i = 1; i <= 4; i++) {
      order.push(players[(dealerIndex + i) % 4]);
    }
    return order;
  };

  const playerOrder = getPlayerOrder();
  
  // Group bids by round
  const bidsByRound: BiddingEntry[][] = [];
  let currentRound: BiddingEntry[] = [];
  
  biddingHistory.forEach((bid, index) => {
    currentRound.push(bid);
    if (currentRound.length === 4 || index === biddingHistory.length - 1) {
      bidsByRound.push([...currentRound]);
      currentRound = [];
    }
  });

  return (
    <div className="bg-slate-900/50 rounded-xl p-6 overflow-y-auto">
      <table className="w-full text-base">
        <thead>
          <tr className="border-b border-slate-700/50">
            {playerOrder.map((player) => (
              <th 
                key={player.id} 
                className={`px-3 py-3 text-center font-semibold text-lg ${
                  player.id === humanPlayerId 
                    ? 'text-blue-400 bg-blue-600/10 rounded-t-lg' 
                    : 'text-slate-400'
                }`}
              >
                {player.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bidsByRound.map((round, roundIndex) => (
            <tr key={roundIndex} className="border-b border-slate-800/50">
              {playerOrder.map((player) => {
                const bid = round.find(b => b.player.id === player.id);
                return (
                  <td 
                    key={player.id} 
                    className={`px-3 py-4 text-center ${
                      player.id === humanPlayerId ? 'bg-blue-600/5' : ''
                    }`}
                  >
                    {bid ? (
                      bid.bid === 'pass' ? (
                        <span className="inline-block px-4 py-1 rounded-full bg-slate-600 text-slate-300 text-lg">Pass</span>
                      ) : bid.bid === 'double' ? (
                        <span className="inline-block px-4 py-1 rounded-full bg-red-900/30 text-red-400 font-bold text-lg">×2</span>
                      ) : bid.bid === 'redouble' ? (
                        <span className="inline-block px-4 py-1 rounded-full bg-purple-900/30 text-purple-400 font-bold text-lg">×4</span>
                      ) : (
                        <div className="inline-flex items-center justify-center space-x-1 px-4 py-1 rounded-full bg-slate-600">
                          <span className="text-white font-bold bid-text-large">{bid.bid}</span>
                          <span className="text-2xl" style={{ color: getSuitColor(bid.trump!) }}>
                            {getSuitSymbol(bid.trump!)}
                          </span>
                        </div>
                      )
                    ) : (
                      <span className="text-slate-700 text-lg">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const BiddingInterface: React.FC = () => {
  const currentPlayer = useAppSelector(state => state.game.players[state.game.currentPlayerIndex]);
  const contract = useAppSelector(state => state.game.contract);
  const biddingHistory = useAppSelector(state => state.game.biddingHistory);
  const humanPlayer = useAppSelector(state => state.game.players.find(p => !p.isAI));
  const players = useAppSelector(state => state.game.players);
  const dealerIndex = useAppSelector(state => state.game.dealerIndex);
  const isHumanTurn = !currentPlayer?.isAI;
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Determine if human team is winning the current contract
  const isHumanTeamWinning = contract && humanPlayer && contract.team === humanPlayer.teamId;
  
  // Get minimum and maximum bid values
  const minBid = gameManager.getMinimumBid();
  const maxBid = GAME_CONSTANTS.BIDDING.CAPOT;
  
  const [selectedBid, setSelectedBid] = useState<number>(minBid);
  const [selectedTrump, setSelectedTrump] = useState<Suit | null>(null);
  const [focusedElement, setFocusedElement] = useState<'bid' | 'trump' | 'actions'>('bid');
  const [isIncrementing, setIsIncrementing] = useState(false);
  const [isDecrementing, setIsDecrementing] = useState(false);
  const incrementIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const incrementTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const decrementIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const decrementTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set initial bid to minimum when component mounts or minBid changes
  useEffect(() => {
    setSelectedBid(minBid);
  }, [minBid]);
  
  // Check if double/redouble are available
  const canDouble = contract && !contract.doubled && humanPlayer?.teamId !== contract.team && isHumanTurn;
  const canRedouble = contract && contract.doubled && !contract.redoubled && humanPlayer?.teamId === contract.team && isHumanTurn;
  const isDoubled = contract?.doubled || false;


  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (incrementIntervalRef.current) clearInterval(incrementIntervalRef.current);
      if (incrementTimeoutRef.current) clearTimeout(incrementTimeoutRef.current);
      if (decrementIntervalRef.current) clearInterval(decrementIntervalRef.current);
      if (decrementTimeoutRef.current) clearTimeout(decrementTimeoutRef.current);
    };
  }, []);


  // Bid increment/decrement handlers
  const startIncrementing = () => {
    setIsIncrementing(true);
    // Single increment
    const newBid = Math.min(maxBid, selectedBid + 10);
    setSelectedBid(newBid);
    
    // Start accelerating after 300ms
    incrementTimeoutRef.current = setTimeout(() => {
      let speed = 100; // Start with 100ms intervals
      incrementIntervalRef.current = setInterval(() => {
        setSelectedBid(prev => {
          const increment = speed < 50 ? 50 : speed < 20 ? 20 : 10;
          const newValue = Math.min(maxBid, prev + increment);
          if (newValue === maxBid) {
            stopIncrementing();
          }
          return newValue;
        });
        // Accelerate
        speed = Math.max(20, speed * 0.9);
      }, speed);
    }, 300);
  };

  const stopIncrementing = () => {
    setIsIncrementing(false);
    if (incrementIntervalRef.current) {
      clearInterval(incrementIntervalRef.current);
      incrementIntervalRef.current = null;
    }
    if (incrementTimeoutRef.current) {
      clearTimeout(incrementTimeoutRef.current);
      incrementTimeoutRef.current = null;
    }
  };

  const startDecrementing = () => {
    setIsDecrementing(true);
    // Single decrement
    const newBid = Math.max(minBid, selectedBid - 10);
    setSelectedBid(newBid);
    
    // Start accelerating after 300ms
    decrementTimeoutRef.current = setTimeout(() => {
      let speed = 100; // Start with 100ms intervals
      decrementIntervalRef.current = setInterval(() => {
        setSelectedBid(prev => {
          const decrement = speed < 50 ? 50 : speed < 20 ? 20 : 10;
          const newValue = Math.max(minBid, prev - decrement);
          if (newValue === minBid) {
            stopDecrementing();
          }
          return newValue;
        });
        // Accelerate
        speed = Math.max(20, speed * 0.9);
      }, speed);
    }, 300);
  };

  const stopDecrementing = () => {
    setIsDecrementing(false);
    if (decrementIntervalRef.current) {
      clearInterval(decrementIntervalRef.current);
      decrementIntervalRef.current = null;
    }
    if (decrementTimeoutRef.current) {
      clearTimeout(decrementTimeoutRef.current);
      decrementTimeoutRef.current = null;
    }
  };

  const handleBid = async () => {
    if (isHumanTurn && selectedBid && selectedTrump) {
      await gameManager.makeBid(selectedBid, selectedTrump);
    }
  };

  const handlePass = async () => {
    if (isHumanTurn) {
      await gameManager.makeBid('pass');
    }
  };

  const handleDouble = async () => {
    if (canDouble) {
      await gameManager.doubleBid();
    }
  };

  const handleRedouble = async () => {
    if (canRedouble) {
      await gameManager.redoubleBid();
    }
  };

  const getSuitSymbol = (suit: Suit) => {
    const symbols: Record<Suit, string> = {
      [Suit.Hearts]: '♥',
      [Suit.Diamonds]: '♦',
      [Suit.Clubs]: '♣',
      [Suit.Spades]: '♠'
    };
    return symbols[suit];
  };

  const getSuitName = (suit: Suit) => {
    const names: Record<Suit, string> = {
      [Suit.Hearts]: 'Hearts',
      [Suit.Diamonds]: 'Diamonds',
      [Suit.Clubs]: 'Clubs',
      [Suit.Spades]: 'Spades'
    };
    return names[suit];
  };

  const getSuitColor = (suit: Suit) => {
    return getSuitColorValue(suit, 'modern');
  };

  if (!isHumanTurn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bidding-modal-wrapper pointer-events-none fixed inset-0 flex items-center justify-center"
      >
        <div className="bg-slate-800/90 backdrop-blur-md rounded-xl p-6 shadow-2xl pointer-events-auto">
          <p className="text-slate-300 text-lg">
            {currentPlayer?.name} is thinking...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bidding-modal-wrapper fixed inset-0 flex items-center justify-center"
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" />
      
      {/* Centered bidding card */}
      <div
        ref={containerRef}
        className="relative bg-slate-800/75 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl pointer-events-auto mx-4 bidding-container"
      >
        <div className="space-y-6">
          {/* Top Row - Suit Selection and Current Bid/Double */}
          <div className="bid-content-grid">
            {/* Left side: Suit Selection */}
            <div className={`bid-suits-section ${focusedElement === 'trump' ? 'ring-2 ring-blue-500 rounded-lg p-4' : 'p-4'}`}>
              <div className="suit-selection flex justify-start">
                {Object.values(Suit).map((suit) => (
                  <motion.button
                    key={suit}
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: 15,
                      z: 50
                    }}
                    whileTap={{ 
                      scale: 0.95,
                      rotateY: 0
                    }}
                    onClick={() => {
                      setSelectedTrump(suit);
                    }}
                    aria-label={`Select ${suit} as trump suit`}
                    aria-pressed={selectedTrump === suit}
                    style={{ transformStyle: "preserve-3d" }}
                    className={`
                      relative px-6 py-4 sm:px-7 sm:py-5 rounded-xl transition-all duration-300 touch-target transform perspective-1000
                      ${selectedTrump === suit 
                        ? 'bg-gradient-to-br from-blue-500/90 to-blue-600/90 shadow-2xl' 
                        : 'bg-gradient-to-br from-slate-700/90 to-slate-800/90 hover:from-slate-600/90 hover:to-slate-700/90 shadow-lg hover:shadow-xl'
                      }
                      border border-slate-500/30 backdrop-blur-sm overflow-hidden group suit-card-button
                    `}
                  >
                    {/* Floating particles effect */}
                    {selectedTrump === suit && (
                      <>
                        <motion.div
                          className="absolute inset-0 opacity-30"
                          animate={{
                            background: [
                              "radial-gradient(circle at 20% 80%, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 70%)",
                              "radial-gradient(circle at 80% 20%, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 70%)",
                              "radial-gradient(circle at 20% 80%, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 70%)"
                            ]
                          }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                          className="absolute inset-0 border-2 border-blue-400/50 rounded-xl"
                          animate={{
                            boxShadow: [
                              "0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.2)",
                              "0 0 30px rgba(59, 130, 246, 0.7), inset 0 0 30px rgba(59, 130, 246, 0.3)",
                              "0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.2)"
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </>
                    )}
                    
                    {/* Card shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12" />
                    
                    {/* Suit symbol with 3D effect */}
                    <motion.span 
                      className="relative z-10"
                      style={{ 
                        color: getSuitColor(suit),
                        fontSize: 'calc(var(--suit-button-size) * 0.6)'
                      }}
                      animate={selectedTrump === suit ? {
                        filter: [
                          "drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))",
                          "drop-shadow(0 0 20px rgba(59, 130, 246, 0.7))",
                          "drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))"
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {getSuitSymbol(suit)}
                    </motion.span>
                    
                    {/* Hover particle effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-white/50 rounded-full"
                          initial={{ 
                            x: Math.random() * 100 - 50, 
                            y: 60,
                            opacity: 0 
                          }}
                          animate={{ 
                            y: -20,
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2,
                            delay: i * 0.3,
                            repeat: Infinity,
                            ease: "easeOut"
                          }}
                          style={{ left: "50%" }}
                        />
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Right side: Current Bid + Double/Redouble */}
            <div className="bid-current-section flex items-stretch">
              <div
                className="flex flex-col items-center justify-between py-4 space-y-3 ml-auto"
                style={{ marginRight: 'var(--bid-margin-right)' }}
              >
                {/* Current Contract - always show to maintain height */}
                <div className={`
                  inline-flex items-center rounded-xl px-6 py-3 shadow-lg justify-center flex-1 bid-button
                  ${contract 
                    ? isHumanTeamWinning 
                      ? 'bg-green-900/30 border border-green-600/30' 
                      : 'bg-red-900/30 border border-red-600/30'
                    : 'bg-slate-700/30 border border-slate-600/30'
                  }
                `}>
                  {contract ? (
                    <>
                      <span className="text-2xl font-bold text-white mr-2">{contract.value}</span>
                      <span className="text-4xl" style={{ color: getSuitColor(contract.trump) }}>
                        {getSuitSymbol(contract.trump)}
                      </span>
                      {contract.doubled && !contract.redoubled && (
                        <span className="text-red-400 font-bold ml-3 bid-text-large">×2</span>
                      )}
                      {contract.redoubled && (
                        <span className="text-purple-400 font-bold ml-3 bid-text-large">×4</span>
                      )}
                    </>
                  ) : (
                    <span className="font-semibold text-slate-400 bid-text-primary">No bids</span>
                  )}
                </div>
                
                {/* Double/Redouble button - fixed height */}
                {(canDouble || canRedouble) ? (
                  <>
                    {canDouble && (
                      <motion.button
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0 0 30px rgba(239, 68, 68, 0.5), 0 0 60px rgba(239, 68, 68, 0.3)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        animate={{
                          boxShadow: [
                            "0 0 20px rgba(239, 68, 68, 0.3)",
                            "0 0 25px rgba(239, 68, 68, 0.4)",
                            "0 0 20px rgba(239, 68, 68, 0.3)"
                          ]
                        }}
                        transition={{
                          boxShadow: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }
                        }}
                        onClick={handleDouble}
                        className="relative px-8 py-3 bg-gradient-to-b from-red-500/90 to-red-600/90 hover:from-red-400/90 hover:to-red-500/90 text-white text-lg font-bold rounded-xl shadow-lg transition-all duration-300 mt-2 border border-red-400/30 overflow-hidden group bid-button"
                        title="Double the current bid"
                        aria-label="Double the current bid (multiply by 2)"
                      >
                        <span className="relative z-10">DOUBLE ×2</span>
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.button>
                    )}
                    
                    {canRedouble && (
                      <motion.button
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        animate={{
                          boxShadow: [
                            "0 0 20px rgba(168, 85, 247, 0.3)",
                            "0 0 30px rgba(168, 85, 247, 0.5)",
                            "0 0 20px rgba(168, 85, 247, 0.3)"
                          ]
                        }}
                        transition={{
                          boxShadow: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }
                        }}
                        onClick={handleRedouble}
                        className="relative px-8 py-3 bg-gradient-to-b from-purple-500/90 to-purple-600/90 hover:from-purple-400/90 hover:to-purple-500/90 text-white text-lg font-bold rounded-xl shadow-lg transition-all duration-300 mt-2 border border-purple-400/30 overflow-hidden group bid-button"
                        title="Redouble the current bid"
                      >
                        <span className="relative z-10">REDOUBLE ×4</span>
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.button>
                    )}
                  </>
                ) : (
                  <div className="h-[52px] mt-2 bid-button"></div>
                )}
              </div>
            </div>
          </div>

          {/* Middle Section - Bid Controls */}
          <div className={`text-center ${focusedElement === 'bid' ? 'ring-2 ring-blue-500 rounded-lg p-4' : 'p-4'}`}>
            <div className="bid-actions flex items-center justify-center">
              {/* Pass Button - Left side */}
              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)"
                }}
                whileTap={{ 
                  scale: 0.98,
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)"
                }}
                onClick={handlePass}
                className="relative px-10 py-5 bg-gradient-to-b from-slate-500/90 to-slate-600/90 hover:from-slate-400/90 hover:to-slate-500/90 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 border border-slate-400/20 backdrop-blur-sm overflow-hidden group bid-button bid-text-large"
                title="Pass"
                aria-label="Pass (skip bidding)"
              >
                <span className="relative z-10">PASS</span>
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>

              {/* Decrement Button */}
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  rotate: -5
                }}
                whileTap={{ 
                  scale: 0.95,
                  rotate: -10
                }}
                onMouseDown={startDecrementing}
                onMouseUp={stopDecrementing}
                onMouseLeave={stopDecrementing}
                onTouchStart={startDecrementing}
                onTouchEnd={stopDecrementing}
                disabled={selectedBid <= minBid}
                aria-label="Decrease bid value"
                aria-disabled={selectedBid <= minBid}
                className={`
                  relative rounded-full transition-all duration-300 touch-target flex items-center justify-center bid-step-button
                  ${selectedBid <= minBid 
                    ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' 
                    : 'bg-gradient-to-b from-slate-600/90 to-slate-700/90 hover:from-slate-500/90 hover:to-slate-600/90 text-white shadow-lg hover:shadow-xl border border-slate-500/30'
                  }
                  ${isDecrementing ? 'scale-95 shadow-inner bg-gradient-to-b from-slate-700/90 to-slate-800/90' : ''}
                `}
                title="Hold to decrease faster"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {isDecrementing && (
                  <div className="absolute inset-0 rounded-full border-2 border-slate-400/50 animate-ping" />
                )}
              </motion.button>

              {/* Bid Display */}
              <div className="relative bg-gradient-to-b from-slate-900/70 to-slate-800/70 rounded-2xl px-10 py-4 bid-number-display border border-slate-600/30 shadow-inner overflow-hidden">
                <div className="relative h-full flex items-center justify-center">
                  {/* Gradient masks for fade effect */}
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-slate-900/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-800/70 to-transparent" />
                  </div>
                  
                  {/* Number wheel container */}
                  <div className="relative">
                    <motion.div
                      key={selectedBid}
                      initial={{ y: isIncrementing ? 60 : -60 }}
                      animate={{ y: 0 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30,
                        mass: 0.5
                      }}
                      className="relative"
                    >
                      {/* Previous number (above) */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 text-transparent bg-clip-text bg-gradient-to-b from-white/30 to-slate-300/30 tabular-nums blur-[1px] font-bold bid-number-text bid-number-above">
                        {selectedBid > minBid ? selectedBid - 10 : maxBid}
                      </div>
                      
                      {/* Current number */}
                      <div className="font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300 tabular-nums relative bid-number-text">
                        {selectedBid}
                        <motion.div
                          initial={{ scaleX: 0, opacity: 0 }}
                          animate={{ scaleX: 1, opacity: 1 }}
                          exit={{ scaleX: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
                        />
                      </div>
                      
                      {/* Next number (below) */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 text-transparent bg-clip-text bg-gradient-to-b from-white/30 to-slate-300/30 tabular-nums blur-[1px] font-bold bid-number-text bid-number-below">
                        {selectedBid < maxBid ? selectedBid + 10 : minBid}
                      </div>
                    </motion.div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent to-white/5 pointer-events-none" />
              </div>

              {/* Increment Button */}
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  rotate: 5
                }}
                whileTap={{ 
                  scale: 0.95,
                  rotate: 10
                }}
                onMouseDown={startIncrementing}
                onMouseUp={stopIncrementing}
                onMouseLeave={stopIncrementing}
                onTouchStart={startIncrementing}
                onTouchEnd={stopIncrementing}
                disabled={selectedBid >= maxBid}
                aria-label="Increase bid value"
                aria-disabled={selectedBid >= maxBid}
                className={`
                  relative rounded-full transition-all duration-300 touch-target flex items-center justify-center bid-step-button
                  ${selectedBid >= maxBid 
                    ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' 
                    : 'bg-gradient-to-b from-slate-600/90 to-slate-700/90 hover:from-slate-500/90 hover:to-slate-600/90 text-white shadow-lg hover:shadow-xl border border-slate-500/30'
                  }
                  ${isIncrementing ? 'scale-95 shadow-inner bg-gradient-to-b from-slate-700/90 to-slate-800/90' : ''}
                `}
                title="Hold to increase faster"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {isIncrementing && (
                  <div className="absolute inset-0 rounded-full border-2 border-slate-400/50 animate-ping" />
                )}
              </motion.button>

              {/* Bid Button - Right side */}
              {!isDoubled && (
                <motion.button
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 12px 40px rgba(34, 197, 94, 0.4)"
                  }}
                  whileTap={{ 
                    scale: 0.98,
                    boxShadow: "0 4px 20px rgba(34, 197, 94, 0.3)"
                  }}
                  onClick={handleBid}
                  aria-label={`Bid ${selectedBid} with ${selectedTrump || 'no trump selected'}`}
                  aria-disabled={!selectedTrump}
                  className={`
                    relative px-10 py-5 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 overflow-hidden group bid-button bid-text-large
                    ${!selectedTrump
                      ? 'bg-gradient-to-b from-slate-600/50 to-slate-700/50 cursor-not-allowed opacity-60' 
                      : 'bg-gradient-to-b from-emerald-500/90 to-green-600/90 hover:from-emerald-400/90 hover:to-green-500/90 border border-green-400/30 backdrop-blur-sm'
                    }
                  `}
                  title="Place your bid"
                  disabled={!selectedTrump}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    BID
                    {selectedTrump && (
                      <span className="text-2xl" style={{ color: getSuitColor(selectedTrump) }}>
                        {getSuitSymbol(selectedTrump)}
                      </span>
                    )}
                  </span>
                  {selectedTrump && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>


          {/* Bidding History Table */}
          {biddingHistory.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <BiddingHistoryTable 
                biddingHistory={biddingHistory} 
                players={players}
                humanPlayerId={humanPlayer?.id}
                dealerIndex={dealerIndex}
                getSuitColor={getSuitColor}
                getSuitSymbol={getSuitSymbol}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BiddingInterface;
