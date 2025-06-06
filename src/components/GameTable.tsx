import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { GameLayout } from '../layouts/GameLayout';
import { PlayerZone } from './PlayerZone';
import PlayerHandFlex from './PlayerHandFlex';
import TrickArea from './TrickArea';
import BeloteIndicator from './BeloteIndicator';
import DeclarationManager from './DeclarationManager';
import DeclarationCardsDisplay from './DeclarationCardsDisplay';
import AnnouncementSystem, { AnnouncementData } from './AnnouncementSystem';
import TrickPile from './TrickPile';
import ContractIndicator from './ContractIndicator';
import { Card as CardType, GamePhase, Player } from '../core/types';
import { gameManager } from '../game/GameManager';
import { selectCard } from '../store/gameSlice';
import { selectTeamATricks, selectTeamBTricks } from '../store/selectors';
import { mapGameToUIPosition } from '../utils/positionMapping';
import { v4 as uuidv4 } from 'uuid';

const GameTable: React.FC = () => {
  const dispatch = useAppDispatch();
    // Selectors
  const players = useAppSelector(state => state.game.players);
  const currentPlayerIndex = useAppSelector(state => state.game.currentPlayerIndex);
  const isHumanTurn = useAppSelector(state => !state.game.players[state.game.currentPlayerIndex]?.isAI);
  const validMoves = useAppSelector(state => state.game.validMoves);
  
  // State
  const phase = useAppSelector(state => state.game.phase);
  const trumpSuit = useAppSelector(state => state.game.trumpSuit);
  const currentTrick = useAppSelector(state => state.game.currentTrick);
  const selectedCard = useAppSelector(state => state.game.selectedCard);
  const declarations = useAppSelector(state => state.game.declarations);
  const declarationTracking = useAppSelector(state => state.game.declarationTracking);
  const completedTricks = useAppSelector(state => state.game.completedTricks);
  const teams = useAppSelector(state => state.game.teams);
  const teamATricks = useAppSelector(selectTeamATricks);
  const teamBTricks = useAppSelector(selectTeamBTricks);
  const trickNumber = useAppSelector(state => state.game.trickNumber);
  const earlyTermination = useAppSelector(state => state.game.earlyTermination);
  const biddingHistory = useAppSelector(state => state.game.biddingHistory);
  const settings = useAppSelector(state => state.game.settings);
  const notifications = useAppSelector(state => state.game.notifications || []);
  
  // Debug logging
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('GameTable render - players:', players.map(p => ({
        name: p.name,
        position: p.position,
        cards: p.hand.length
      })));
      console.log('Teams data:', {
        teamA: teams.A,
        teamB: teams.B,
        teamATricks: teamATricks.length,
        teamBTricks: teamBTricks.length
      });
    }
  }, [players, teams, teamATricks, teamBTricks]);
  // Track viewing state
  const [trickWinner, setTrickWinner] = useState<string | undefined>(undefined);
  const [shownInTrick, setShownInTrick] = useState<Record<string, number>>({});
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);

  // Get players by position
  const playersByPosition = React.useMemo(() => {
    const positions: Record<string, Player | undefined> = {
      north: players.find(p => p.position === 'north'),
      east: players.find(p => p.position === 'east'),
      south: players.find(p => p.position === 'south'),
      west: players.find(p => p.position === 'west')
    };
    return positions;
  }, [players]);
  
  const { north: northPlayer, east: eastPlayer, south: southPlayer, west: westPlayer } = playersByPosition;
    // Update bidding announcements when bidding history changes
  useEffect(() => {
    if (biddingHistory.length > 0 && phase === GamePhase.Bidding) {
      const latestBid = biddingHistory[biddingHistory.length - 1];
      
      // Add to announcements for new system
      const announcementData: AnnouncementData = {
        id: uuidv4(),
        type: latestBid.bid === 'pass' ? 'pass' :
              latestBid.bid === 'double' ? 'double' :
              latestBid.bid === 'redouble' ? 'redouble' : 'bid',
        message: latestBid.bid === 'pass' ? 'PASS' :
                 latestBid.bid === 'double' ? 'DOUBLE ×2' :
                 latestBid.bid === 'redouble' ? 'REDOUBLE ×4' :
                 String(latestBid.bid),
        position: latestBid.player.position,
        trumpSuit: latestBid.trump,
        timestamp: Date.now()
      };
      setAnnouncements((prev: AnnouncementData[]) => [...prev, announcementData]);
    }
  }, [biddingHistory, phase]);
  
  // Clear announcements when bidding phase ends
  useEffect(() => {
    if (phase !== GamePhase.Bidding) {
      setAnnouncements([]);
    }
  }, [phase]);
  
  // Track shown notification timestamps to prevent duplicates
  const [shownNotificationTimestamps, setShownNotificationTimestamps] = useState<Set<number>>(new Set());

  // Handle notifications for Belote/Rebelote
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
        // Skip if timestamp is undefined or already shown
      if (latestNotification.timestamp === undefined || shownNotificationTimestamps.has(latestNotification.timestamp)) {
        return;
      }
      
      const player = players.find(p => p.name === latestNotification.player);
      
      if (player && (latestNotification.type === 'belote' || latestNotification.type === 'rebelote')) {
        const announcementData: AnnouncementData = {
          id: uuidv4(),
          type: latestNotification.type,
          message: latestNotification.message,
          position: player.position,
          trumpSuit: trumpSuit || undefined,
          timestamp: latestNotification.timestamp
        };        setAnnouncements(prev => [...prev, announcementData]);
        setShownNotificationTimestamps(prev => new Set([...prev, latestNotification.timestamp!]));
      }
    }
  }, [notifications, players, trumpSuit, shownNotificationTimestamps]);
  
  // Track which declaration announcements have been shown
  const [shownDeclarationIds, setShownDeclarationIds] = useState<Set<string>>(new Set());

  // Handle declaration announcements - show points when declared (trick 1)
  useEffect(() => {
    if (!declarationTracking || phase !== GamePhase.Playing || trickNumber !== 1) return;
    
    Object.entries(declarationTracking).forEach(([playerId, tracking]) => {
      if (tracking.hasDeclared && !shownDeclarationIds.has(playerId)) {
        const player = players.find(p => p.id === playerId);
        const playerDeclarations = declarations.filter(d => d.player.id === playerId);
        
        if (player && playerDeclarations.length > 0) {
          const totalPoints = playerDeclarations.reduce((sum, d) => sum + d.points, 0);
          const announcementData: AnnouncementData = {
            id: uuidv4(),
            type: 'declaration',
            message: `${totalPoints}`,
            position: player.position,
            declarationValue: totalPoints,
            timestamp: Date.now()
          };
          setAnnouncements(prev => [...prev, announcementData]);
          setShownDeclarationIds(prev => new Set([...prev, playerId]));
        }
      }
    });
  }, [declarationTracking, players, declarations, shownDeclarationIds, phase, trickNumber]);
  // Handle declaration showing in trick 2
  useEffect(() => {
    if (phase === GamePhase.Playing && trickNumber === 2 && declarationTracking) {
      // In the second trick, players should show their cards
      // This is handled by DeclarationViewer component which is already in place
      // We just need to ensure shownInTrick is updated
      Object.entries(declarationTracking).forEach(([playerId, tracking]) => {
        if (tracking.hasDeclared && !shownInTrick[playerId]) {
          setShownInTrick(prev => ({ ...prev, [playerId]: 2 }));
        }
      });
    }
  }, [phase, trickNumber, declarationTracking, shownInTrick]);

  // Handle card selection
  const handleCardClick = React.useCallback((card: CardType) => {
    if (isHumanTurn && phase === GamePhase.Playing) {
      if (selectedCard?.id === card.id) {
        dispatch(selectCard(null));
      } else {
        dispatch(selectCard(card));
      }
    }
  }, [isHumanTurn, phase, selectedCard, dispatch]);

  // Handle card play
  const handleCardPlay = React.useCallback(async (card: CardType) => {
    if (isHumanTurn && phase === GamePhase.Playing && validMoves.some(c => c.id === card.id)) {
      await gameManager.playCard(card);
    }
  }, [isHumanTurn, phase, validMoves]);


  // Determine trick winner when trick is complete
  useEffect(() => {
    if (currentTrick.length === 4) {
      const leadSuit = currentTrick[0].card.suit;
      let winningIndex = 0;
      let highestValue = 0;
      
      currentTrick.forEach((tc, index) => {
        let value = 0;
        if (tc.card.suit === trumpSuit) {
          value = 100 + getCardValue(tc.card.rank, true);
        } else if (tc.card.suit === leadSuit) {
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
  
  // Helper function to get card value
  const getCardValue = (rank: string, isTrump: boolean): number => {
    const trumpValues: Record<string, number> = {
      'J': 20, '9': 14, 'A': 11, '10': 10, 'K': 4, 'Q': 3, '8': 0, '7': 0
    };
    const nonTrumpValues: Record<string, number> = {
      'A': 11, '10': 10, 'K': 4, 'Q': 3, 'J': 2, '9': 0, '8': 0, '7': 0
    };
    return isTrump ? trumpValues[rank] || 0 : nonTrumpValues[rank] || 0;
  };

  // Update declaration tracking
  useEffect(() => {
    Object.entries(declarationTracking || {}).forEach(([playerId, tracking]) => {
      if (tracking.hasShown && !shownInTrick[playerId]) {
        setShownInTrick(prev => ({ ...prev, [playerId]: trickNumber }));
      }
    });
  }, [declarationTracking, trickNumber, shownInTrick]);
  
  // Render player zone content
  const renderPlayerZone = (player: Player | undefined, position: 'north' | 'east' | 'south' | 'west') => {
    if (!player) return null;
    
    const isHuman = !player.isAI;
    const playerDeclarations = declarations.filter(d => d.player.id === player.id);
    
    return (
      <PlayerZone player={player} position={position}>
        {/* Player Hand */}
        <PlayerHandFlex
          player={player}
          position={position}
          isCurrentPlayer={currentPlayerIndex === players.indexOf(player)}
          showCards={isHuman}
          onCardClick={isHuman ? handleCardClick : undefined}
          onCardPlay={isHuman ? handleCardPlay : undefined}
          selectedCard={selectedCard}
          validMoves={validMoves}
          trumpSuit={trumpSuit}
        />
          {/* Belote Indicator */}
        <BeloteIndicator playerId={player.id} position={mapGameToUIPosition(position)} />
        
        {/* Declaration Manager */}
        <DeclarationManager playerId={player.id} position={position} />
        
        {/* Declaration Cards Display - shows winning declarations in trick 2 */}
        <DeclarationCardsDisplay
          declarations={playerDeclarations}
          position={position}
          show={
            phase === GamePhase.Playing && 
            trickNumber === 2 && 
            declarationTracking?.[player.id]?.hasShown === true &&
            playerDeclarations.length > 0
          }
          isHumanPlayer={isHuman}
        />
        
      </PlayerZone>
    );
  };

  // Center content
  const centerContent = (
    <>
      {/* Trick Area */}
      <TrickArea
        currentTrick={currentTrick}
        isDropActive={false}
        trickWinner={trickWinner}
      />
    </>
  );

  // Overlays
  const overlays = (
    <>
      {/* Announcement System */}
      <AnnouncementSystem 
        announcements={announcements} 
        isBiddingActive={phase === GamePhase.Bidding && isHumanTurn}
      />
      
      {/* Contract Indicator - manages its own responsive positioning */}
      <ContractIndicator />
        {/* Team B Trick Pile - Upper Left */}
      {teamBTricks.length > 0 && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 lg:top-6 lg:left-6 z-10">
          <TrickPile
            teamId="B"
            position="north"
            currentTrickNumber={trickNumber}
            isLastTrickPile={completedTricks.length > 0 && completedTricks[completedTricks.length - 1]?.winner?.teamId === 'B'}
          />
        </div>
      )}
      
      {/* Team A Trick Pile - Lower Right (Human's team) */}
      {teamATricks.length > 0 && (
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 lg:bottom-6 lg:right-6 z-10">
          <TrickPile
            teamId="A"
            position="south"
            currentTrickNumber={trickNumber}
            isLastTrickPile={completedTricks.length > 0 && completedTricks[completedTricks.length - 1]?.winner?.teamId === 'A'}
          />
        </div>
      )}
      
      {/* Early Termination Animation */}
      <AnimatePresence>
        {earlyTermination && settings?.animationSpeed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              className="absolute inset-0 bg-black"
            />
            
            <motion.div className="relative z-10">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="bg-red-600/90 text-white px-8 py-4 rounded-xl shadow-2xl"
              >
                <h2 className="text-3xl font-bold">Round Over!</h2>
                <p className="text-lg mt-2">Contract cannot be made</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <GameLayout
      northPlayer={renderPlayerZone(northPlayer, 'north')}
      eastPlayer={renderPlayerZone(eastPlayer, 'east')}
      southPlayer={renderPlayerZone(southPlayer, 'south')}
      westPlayer={renderPlayerZone(westPlayer, 'west')}
      centerContent={centerContent}
      overlays={overlays}
    />
  );
};

export default GameTable;