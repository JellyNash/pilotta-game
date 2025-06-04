import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import PlayerHand from './PlayerHand';
import TrickArea from './TrickArea';
import BeloteIndicator from './BeloteIndicator';
import DeclarationManager from './DeclarationManager';
import DeclarationViewer from './DeclarationViewer';
import UnifiedAnnouncement from './UnifiedAnnouncement';
import TrickPile from './TrickPile';
import ContractIndicator from './ContractIndicator';
import { Card as CardType, GamePhase, BidEntry } from '../core/types';
import { gameManager } from '../game/GameManager';
import { selectCard } from '../store/gameSlice';
import { 
  selectHumanPlayer, 
  selectCurrentPlayer, 
  selectIsHumanTurn,
  selectValidMovesForCurrentPlayer 
} from '../store/selectors';
import '../layouts/table-center.css';

const GameTable: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Use memoized selectors
  const players = useAppSelector(state => state.game.players);
  const humanPlayer = useAppSelector(selectHumanPlayer);
  const currentPlayer = useAppSelector(selectCurrentPlayer);
  const isHumanTurn = useAppSelector(selectIsHumanTurn);
  const validMoves = useAppSelector(selectValidMovesForCurrentPlayer);
  
  // Direct state access for non-performance-critical data
  const currentPlayerIndex = useAppSelector(state => state.game.currentPlayerIndex);
  const phase = useAppSelector(state => state.game.phase);
  const trumpSuit = useAppSelector(state => state.game.trumpSuit);
  const currentTrick = useAppSelector(state => state.game.currentTrick);
  const selectedCard = useAppSelector(state => state.game.selectedCard);
  const declarations = useAppSelector(state => state.game.declarations);
  const declarationTracking = useAppSelector(state => state.game.declarationTracking);
  const completedTricks = useAppSelector(state => state.game.completedTricks);
  const teams = useAppSelector(state => state.game.teams);
  const trickNumber = useAppSelector(state => state.game.trickNumber);
  const earlyTermination = useAppSelector(state => state.game.earlyTermination);
  const biddingHistory = useAppSelector(state => state.game.biddingHistory);
  const settings = useAppSelector(state => state.game.settings);
  
  // Track recent bids for each player
  const [recentBids, setRecentBids] = useState<Record<string, BidEntry | null>>({});
  const [showBidAnnouncements, setShowBidAnnouncements] = useState<Record<string, boolean>>({});

  // Get players by position - memoized
  const playersByPosition = React.useMemo(() => {
    const positions: Record<string, Player | undefined> = {
      north: players.find(p => p.position === 'north'),
      east: players.find(p => p.position === 'east'),
      south: players.find(p => p.position === 'south'),
      west: players.find(p => p.position === 'west')
    };
    return positions;
  }, [players]);
  
  const northPlayer = playersByPosition.north;
  const eastPlayer = playersByPosition.east;
  const southPlayer = playersByPosition.south;
  const westPlayer = playersByPosition.west;
  
  // Update recent bids when bidding history changes
  useEffect(() => {
    if (biddingHistory.length > 0 && phase === GamePhase.Bidding) {
      const latestBid = biddingHistory[biddingHistory.length - 1];
      
      // Update recent bids
      setRecentBids(prev => ({
        ...prev,
        [latestBid.player.id]: latestBid
      }));
      
      // Show announcement for this player
      setShowBidAnnouncements(prev => ({
        ...prev,
        [latestBid.player.id]: true
      }));
      
      // Hide announcement after delay
      const timer = setTimeout(() => {
        setShowBidAnnouncements(prev => ({
          ...prev,
          [latestBid.player.id]: false
        }));
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [biddingHistory, phase]);
  
  // Clear bid announcements when bidding phase ends
  useEffect(() => {
    if (phase !== GamePhase.Bidding) {
      setRecentBids({});
      setShowBidAnnouncements({});
    }
  }, [phase]);

  // Handle card selection - memoized
  const handleCardClick = React.useCallback((card: CardType) => {
    if (isHumanTurn && phase === GamePhase.Playing) {
      if (selectedCard?.id === card.id) {
        dispatch(selectCard(null));
      } else {
        dispatch(selectCard(card));
      }
    }
  }, [isHumanTurn, phase, selectedCard, dispatch]);

  // Handle card play - memoized
  const handleCardPlay = React.useCallback(async (card: CardType) => {
    if (isHumanTurn && phase === GamePhase.Playing && validMoves.some(c => c.id === card.id)) {
      await gameManager.playCard(card);
    }
  }, [isHumanTurn, phase, validMoves]);

  // Drop zone for playing cards
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'card',
    canDrop: (item: { card: CardType }) => {
      return isHumanTurn && phase === GamePhase.Playing && 
             validMoves.some(c => c.id === item.card.id);
    },
    drop: (item: { card: CardType }) => {
      handleCardPlay(item.card);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });

  // Show declarations when they occur
  const [showDeclarations, setShowDeclarations] = useState(false);
  useEffect(() => {
    if (phase === GamePhase.Declaring && declarations.length > 0) {
      setShowDeclarations(true);
      // Announce declarations to screen reader
      declarations.forEach(decl => {
      });
      const timer = setTimeout(() => setShowDeclarations(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, declarations]);

  // Click to view declarations state
  const [viewingPlayer, setViewingPlayer] = useState<string | null>(null);
  
  // Track trick winner for exit animation
  const [trickWinner, setTrickWinner] = useState<string | undefined>(undefined);
  
  // Determine trick winner when trick is complete
  useEffect(() => {
    if (currentTrick.length === 4) {
      // Simple logic to determine winner based on trump and lead suit
      // This is just for animation purposes - actual game logic handles the real winner
      const leadSuit = currentTrick[0].card.suit;
      let winningIndex = 0;
      let highestValue = 0;
      
      currentTrick.forEach((tc, index) => {
        let value = 0;
        if (tc.card.suit === trumpSuit) {
          // Trump cards beat non-trump
          value = 100 + getCardValue(tc.card.rank, true);
        } else if (tc.card.suit === leadSuit) {
          // Following suit
          value = getCardValue(tc.card.rank, false);
        }
        
        if (value > highestValue) {
          highestValue = value;
          winningIndex = index;
        }
      });
      
      setTrickWinner(currentTrick[winningIndex].player.position);
    } else {
      setTrickWinner(undefined);
    }
  }, [currentTrick, trumpSuit]);
  
  // Helper function to get card value for animation purposes
  const getCardValue = (rank: string, isTrump: boolean): number => {
    const trumpValues: Record<string, number> = {
      'J': 20, '9': 14, 'A': 11, '10': 10, 'K': 4, 'Q': 3, '8': 0, '7': 0
    };
    const nonTrumpValues: Record<string, number> = {
      'A': 11, '10': 10, 'K': 4, 'Q': 3, 'J': 2, '9': 0, '8': 0, '7': 0
    };
    return isTrump ? trumpValues[rank] || 0 : nonTrumpValues[rank] || 0;
  };

  // Track the trick number when declarations were shown
  const [shownInTrick, setShownInTrick] = useState<Record<string, number>>({});
  
  // Update when players show declarations
  useEffect(() => {
    Object.entries(declarationTracking || {}).forEach(([playerId, tracking]) => {
      if (tracking.hasShown && !shownInTrick[playerId]) {
        setShownInTrick(prev => ({ ...prev, [playerId]: trickNumber }));
      }
    });
  }, [declarationTracking, trickNumber, shownInTrick]);
  
  // Close declaration viewer when trick completes
  useEffect(() => {
    if (currentTrick.length === 4) {
      setViewingPlayer(null);
    }
  }, [currentTrick]);
  
  // Handle clicking on player areas to view declarations
  const handlePlayerClick = (playerId: string) => {
    const tracking = declarationTracking?.[playerId];
    const playerDeclarations = declarations.filter(d => d.player.id === playerId);
    
    // Only show if:
    // 1. Player has shown declarations
    // 2. We're still in the same trick where they were shown
    // 3. The trick is not yet complete (currentTrick not full)
    if (playerDeclarations.length > 0 && tracking?.hasShown) {
      const shownTrick = shownInTrick[playerId];
      if (shownTrick && shownTrick === trickNumber && currentTrick.length < 4) {
        setViewingPlayer(playerId === viewingPlayer ? null : playerId);
      }
    }
  };

  // Announce game state changes
  useEffect(() => {
    if (isHumanTurn && phase === GamePhase.Playing) {
    }
  }, [isHumanTurn, phase, validMoves.length]);

  // Get table background
  const getTableBackground = () => {
    return 'from-slate-900 via-slate-800 to-slate-900';
  };

  return (
    <div className="game-table" id="table">
      {/* Table Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getTableBackground()}`}>
        <div className="absolute inset-0 bg-black/20" />
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-5 bg-gradient-to-tr from-transparent via-white to-transparent" />
      </div>

      {/* Table Border */}
      <div className="absolute inset-4 border-4 border-slate-700/50 rounded-3xl shadow-inner" />
      
      {/* Center reference point */}
      <div className="table-center">
      
        {/* Center circle decoration */}
        <div className="center-circle border-4 border-dashed border-slate-600/30" />
      </div>
      
      {/* Contract Indicator */}
      <ContractIndicator />

      {/* North Player (Partner) */}
      {northPlayer && (
        <div className="player-seat north">
          <div 
            className="relative cursor-pointer"
            onClick={() => handlePlayerClick(northPlayer.id)}
          >
            <PlayerHand
              player={northPlayer}
              position="north"
              isCurrentPlayer={currentPlayerIndex === players.indexOf(northPlayer)}
              showCards={false}
            />
            <span className="player-label">{northPlayer.name}</span>
            <BeloteIndicator playerId={northPlayer.id} position="top" />
            <DeclarationManager playerId={northPlayer.id} position="north" />
            {recentBids[northPlayer.id] && (
              <UnifiedAnnouncement
                type={
                  recentBids[northPlayer.id]?.bid === 'pass' ? 'pass' :
                  recentBids[northPlayer.id]?.bid === 'double' ? 'double' :
                  recentBids[northPlayer.id]?.bid === 'redouble' ? 'redouble' : 'bid'
                }
                message={
                  recentBids[northPlayer.id]?.bid === 'pass' ? 'PASS' :
                  recentBids[northPlayer.id]?.bid === 'double' ? 'DOUBLE ×2' :
                  recentBids[northPlayer.id]?.bid === 'redouble' ? 'REDOUBLE ×4' :
                  String(recentBids[northPlayer.id]?.bid)
                }
                position="north"
                isVisible={showBidAnnouncements[northPlayer.id] || false}
                trumpSuit={recentBids[northPlayer.id]?.trump}
              />
            )}
            <DeclarationViewer
              show={viewingPlayer === northPlayer.id}
              playerName={northPlayer.name}
              declarations={declarations.filter(d => d.player.id === northPlayer.id)}
              position="north"
              onClose={() => setViewingPlayer(null)}
            />
          </div>
        </div>
      )}

      {/* West Player */}
      {westPlayer && (
        <div className="player-seat west">
          <div 
            className="relative cursor-pointer"
            onClick={() => handlePlayerClick(westPlayer.id)}
          >
            <PlayerHand
            player={westPlayer}
            position="west"
            isCurrentPlayer={currentPlayerIndex === players.indexOf(westPlayer)}
            showCards={false}
            />
            <span className="player-label">{westPlayer.name}</span>
            <BeloteIndicator playerId={westPlayer.id} position="left" />
            <DeclarationManager playerId={westPlayer.id} position="west" />
            {recentBids[westPlayer.id] && (
              <UnifiedAnnouncement
                type={
                  recentBids[westPlayer.id]?.bid === 'pass' ? 'pass' :
                  recentBids[westPlayer.id]?.bid === 'double' ? 'double' :
                  recentBids[westPlayer.id]?.bid === 'redouble' ? 'redouble' : 'bid'
                }
                message={
                  recentBids[westPlayer.id]?.bid === 'pass' ? 'PASS' :
                  recentBids[westPlayer.id]?.bid === 'double' ? 'DOUBLE ×2' :
                  recentBids[westPlayer.id]?.bid === 'redouble' ? 'REDOUBLE ×4' :
                  String(recentBids[westPlayer.id]?.bid)
                }
                position="west"
                isVisible={showBidAnnouncements[westPlayer.id] || false}
                trumpSuit={recentBids[westPlayer.id]?.trump}
              />
            )}
            <DeclarationViewer
              show={viewingPlayer === westPlayer.id}
              playerName={westPlayer.name}
              declarations={declarations.filter(d => d.player.id === westPlayer.id)}
              position="west"
              onClose={() => setViewingPlayer(null)}
            />
          </div>
        </div>
      )}

      {/* Center Play Area - always centered */}
      <div ref={drop} className="trick-area-centered">
        <TrickArea
          currentTrick={currentTrick}
          isDropActive={isOver && canDrop}
          trickWinner={trickWinner}
        />
      </div>

      {/* East Player */}
      {eastPlayer && (
        <div className="player-seat east">
          <div 
            className="relative cursor-pointer"
            onClick={() => handlePlayerClick(eastPlayer.id)}
          >
            <PlayerHand
            player={eastPlayer}
            position="east"
            isCurrentPlayer={currentPlayerIndex === players.indexOf(eastPlayer)}
            showCards={false}
            />
            <span className="player-label">{eastPlayer.name}</span>
            <BeloteIndicator playerId={eastPlayer.id} position="right" />
            <DeclarationManager playerId={eastPlayer.id} position="east" />
            {recentBids[eastPlayer.id] && (
              <UnifiedAnnouncement
                type={
                  recentBids[eastPlayer.id]?.bid === 'pass' ? 'pass' :
                  recentBids[eastPlayer.id]?.bid === 'double' ? 'double' :
                  recentBids[eastPlayer.id]?.bid === 'redouble' ? 'redouble' : 'bid'
                }
                message={
                  recentBids[eastPlayer.id]?.bid === 'pass' ? 'PASS' :
                  recentBids[eastPlayer.id]?.bid === 'double' ? 'DOUBLE ×2' :
                  recentBids[eastPlayer.id]?.bid === 'redouble' ? 'REDOUBLE ×4' :
                  String(recentBids[eastPlayer.id]?.bid)
                }
                position="east"
                isVisible={showBidAnnouncements[eastPlayer.id] || false}
                trumpSuit={recentBids[eastPlayer.id]?.trump}
              />
            )}
            <DeclarationViewer
              show={viewingPlayer === eastPlayer.id}
              playerName={eastPlayer.name}
              declarations={declarations.filter(d => d.player.id === eastPlayer.id)}
              position="east"
              onClose={() => setViewingPlayer(null)}
            />
          </div>
        </div>
      )}

      {/* South Player (Human) */}
      {southPlayer && (
        <div className="player-seat south">
          <div 
            className="relative"
            onClick={(e) => {
              // Only handle click if not clicking on a card
              if (!(e.target as HTMLElement).closest('.playing-card')) {
                handlePlayerClick(southPlayer.id);
              }
            }}
          >
            <PlayerHand
              player={southPlayer}
              position="south"
              isCurrentPlayer={currentPlayerIndex === players.indexOf(southPlayer)}
              showCards={true}
              onCardClick={handleCardClick}
              onCardPlay={handleCardPlay}
              selectedCard={selectedCard}
              validMoves={validMoves}
              trumpSuit={trumpSuit}
            />
            <span className="player-label">{southPlayer.name}</span>
            <BeloteIndicator playerId={southPlayer.id} position="bottom" />
            <DeclarationManager playerId={southPlayer.id} position="south" />
            {recentBids[southPlayer.id] && (
              <UnifiedAnnouncement
                type={
                  recentBids[southPlayer.id]?.bid === 'pass' ? 'pass' :
                  recentBids[southPlayer.id]?.bid === 'double' ? 'double' :
                  recentBids[southPlayer.id]?.bid === 'redouble' ? 'redouble' : 'bid'
                }
                message={
                  recentBids[southPlayer.id]?.bid === 'pass' ? 'PASS' :
                  recentBids[southPlayer.id]?.bid === 'double' ? 'DOUBLE ×2' :
                  recentBids[southPlayer.id]?.bid === 'redouble' ? 'REDOUBLE ×4' :
                  String(recentBids[southPlayer.id]?.bid)
                }
                position="south"
                isVisible={showBidAnnouncements[southPlayer.id] || false}
                trumpSuit={recentBids[southPlayer.id]?.trump}
              />
            )}
            <DeclarationViewer
              show={viewingPlayer === southPlayer.id}
              playerName={southPlayer.name}
              declarations={declarations.filter(d => d.player.id === southPlayer.id)}
              position="south"
              onClose={() => setViewingPlayer(null)}
            />
          </div>
        </div>
      )}
      
      {/* Team Trick Piles - Center-relative positioning */}
      {teams.A.wonTricks && teams.A.wonTricks.length > 0 && (
        <div className="trick-pile-container team-a">
          <TrickPile 
            tricks={teams.A.wonTricks} 
            teamId="A" 
            position="south" 
            currentTrickNumber={trickNumber}
            isLastTrickPile={completedTricks.length > 0 && completedTricks[completedTricks.length - 1].winner.teamId === 'A'}
          />
        </div>
      )}
      {teams.B.wonTricks && teams.B.wonTricks.length > 0 && (
        <div className="trick-pile-container team-b">
          <TrickPile 
            tricks={teams.B.wonTricks} 
            teamId="B" 
            position="west" 
            currentTrickNumber={trickNumber}
            isLastTrickPile={completedTricks.length > 0 && completedTricks[completedTricks.length - 1].winner.teamId === 'B'}
          />
        </div>
      )}
      
      {/* Early Termination Animation */}
      <AnimatePresence>
        {earlyTermination && settings?.animations?.cardAnimations && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              className="absolute inset-0 bg-black"
            />
            
            {/* Cards flying to center animation */}
            <motion.div className="relative z-10">
              {/* Collect all remaining cards from players' hands */}
              {players.map((player, playerIndex) => (
                <div key={player.id}>
                  {player.hand.map((card, cardIndex) => (
                    <motion.div
                      key={card.id}
                      initial={{
                        x: player.position === 'west' ? -400 : player.position === 'east' ? 400 : 0,
                        y: player.position === 'north' ? -300 : player.position === 'south' ? 300 : 0,
                        rotate: 0,
                        scale: 1
                      }}
                      animate={{
                        x: 0,
                        y: 0,
                        rotate: Math.random() * 720 - 360,
                        scale: 0.5
                      }}
                      transition={{
                        duration: 1.5,
                        delay: cardIndex * 0.05 + playerIndex * 0.1,
                        ease: "easeInOut"
                      }}
                      className="absolute"
                      style={{
                        zIndex: cardIndex + playerIndex * 20
                      }}
                    >
                      <Card
                        card={card}
                        faceDown={false}
                        size="medium"
                      />
                    </motion.div>
                  ))}
                </div>
              ))}
              
              {/* "Round Over" text */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="bg-red-600/90 text-white px-8 py-4 rounded-xl shadow-2xl">
                  <h2 className="text-3xl font-bold">Round Over!</h2>
                  <p className="text-lg mt-2">Contract cannot be made</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default GameTable;
