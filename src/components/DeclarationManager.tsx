import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { Declaration, GamePhase, Card as CardType } from '../core/types';
import Card from './Card';
import { markPlayerDeclared, markPlayerShown } from '../store/gameSlice';
import UnifiedAnnouncement from './UnifiedAnnouncement';
import { GameButtonPositioner } from '../layouts/UIPositioner';

interface DeclarationManagerProps {
  playerId: string;
  position: 'north' | 'east' | 'south' | 'west';
}

const DeclarationManager: React.FC<DeclarationManagerProps> = ({ playerId, position }) => {
  const dispatch = useAppDispatch();
  const gamePhase = useAppSelector(state => state.game.phase);
  const trickNumber = useAppSelector(state => state.game.trickNumber);
  const currentPlayerIndex = useAppSelector(state => state.game.currentPlayerIndex);
  const players = useAppSelector(state => state.game.players);
  const declarations = useAppSelector(state => state.game.declarations);
  const declarationTracking = useAppSelector(state => state.game.declarationTracking);
  
  const player = players.find(p => p.id === playerId);
  const isCurrentPlayer = players[currentPlayerIndex]?.id === playerId;
  const isHuman = !player?.isAI;
  const playerDeclarations = declarations.filter(d => d.player.id === playerId);
  const playerTracking = declarationTracking?.[playerId] || { hasDeclared: false, hasShown: false, canShow: false };
  
  const [showDeclarationButton, setShowDeclarationButton] = useState(false);
  const [showingCards, setShowingCards] = useState(false);
  const [showDeclarationAnnouncement, setShowDeclarationAnnouncement] = useState(false);
  
  // Check if player has potential declarations
  const hasPotentialDeclarations = playerDeclarations.length > 0;
  
  // Show declaration button logic for all three tricks
  useEffect(() => {
    if (gamePhase === GamePhase.Playing && isCurrentPlayer) {
      if (trickNumber === 1 && hasPotentialDeclarations && !playerTracking.hasDeclared) {
        // First trick - can declare
        setShowDeclarationButton(true);
      } else if (trickNumber === 2 && playerTracking.hasDeclared && !playerTracking.hasShown && playerTracking.canShow) {
        // Second trick - can show if declared and have the right
        setShowDeclarationButton(true);
      } else if (trickNumber === 3 && !playerTracking.hasShown && playerTracking.canShow && hasPotentialDeclarations) {
        // Third trick - fallback showing only if:
        // 1. Both teams declared in trick 1
        // 2. The stronger team didn't show in trick 2
        // 3. This player is from the weaker team and has been given the right
        setShowDeclarationButton(true);
      } else {
        setShowDeclarationButton(false);
      }
    } else {
      setShowDeclarationButton(false);
    }
  }, [gamePhase, trickNumber, isCurrentPlayer, hasPotentialDeclarations, playerTracking]);
  
  // Show declaration announcement when player declares
  useEffect(() => {
    if (playerTracking.hasDeclared && !playerTracking.hasShown) {
      setShowDeclarationAnnouncement(true);
    }
  }, [playerTracking.hasDeclared, playerTracking.hasShown]);
  
  const handleDeclare = () => {
    dispatch(markPlayerDeclared({ playerId }));
    setShowDeclarationButton(false);
  };
  
  const handleShow = () => {
    dispatch(markPlayerShown({ playerId }));
    setShowingCards(true);
    setShowDeclarationButton(false);
    
    // Hide after 4 seconds
    setTimeout(() => {
      setShowingCards(false);
    }, 4000);
  };
  
  const getTotalDeclarationPoints = () => {
    return playerDeclarations.reduce((sum, d) => sum + d.points, 0);
  };
  
  return (
    <>
      {/* Declaration Button using responsive positioning system */}
      <GameButtonPositioner
        playerPosition={position}
        isHuman={isHuman}
        buttonType="declare"
        show={showDeclarationButton}
      >
        <button
          className={`
            ${isHuman ? 'px-8 py-4 text-lg' : 'px-4 py-2 text-base'}
            bg-gradient-to-r from-amber-600 to-amber-700 
            hover:from-amber-700 hover:to-amber-800 
            text-white font-bold rounded-xl shadow-2xl 
            transition-all transform hover:scale-105 active:scale-95
            touch-target
          `}
          onClick={trickNumber === 1 ? handleDeclare : handleShow}
        >
          {trickNumber === 1 
            ? 'Declare!' 
            : trickNumber === 3 
            ? 'Show (Fallback)!' 
            : 'Show!'
          }
        </button>
      </GameButtonPositioner>
      
      {/* Declaration Announcement - Shows after declaring */}
      <UnifiedAnnouncement
        type="declaration"
        message={String(getTotalDeclarationPoints())}
        position={position}
        isVisible={showDeclarationAnnouncement && !playerTracking.hasShown}
        declarationValue={getTotalDeclarationPoints()}
      />
      
      {/* Show Declaration Cards with improved design */}
      <AnimatePresence>
        {showingCards && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none"
          >
            {/* Semi-transparent dark background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black pointer-events-auto"
              onClick={() => setShowingCards(false)}
            />
            
            {/* Declaration cards container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-2xl pointer-events-auto max-w-2xl border border-amber-600/30">
                <h3 className="text-2xl font-bold text-amber-300 mb-6 text-center">
                  {player?.name}'s Declarations
                </h3>
                <div className="space-y-6">
                  {playerDeclarations.map((decl, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-amber-300 font-bold text-lg">
                          {decl.type}
                        </p>
                        <p className="text-white font-bold text-xl bg-amber-600/20 px-4 py-1 rounded-full">
                          {decl.points} points
                        </p>
                      </div>
                      <div className="flex justify-center space-x-3">
                        {decl.cards.map((card, cardIndex) => (
                          <motion.div
                            key={card.id}
                            initial={{ rotateY: 180, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 + cardIndex * 0.05 }}
                            style={{ transformStyle: 'preserve-3d' }}
                          >
                            <Card
                              card={card}
                              size="medium"
                              className="shadow-xl"
                            />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center text-gray-400 mt-6 text-sm"
                >
                  Cards will hide automatically in a few seconds
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DeclarationManager;
