import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Declaration } from '../core/types';
import Card from './Card';

interface DeclarationViewerProps {
  show: boolean;
  playerName: string;
  declarations: Declaration[];
  position: 'north' | 'east' | 'south' | 'west';
  onClose: () => void;
}

const DeclarationViewer: React.FC<DeclarationViewerProps> = ({
  show,
  playerName,
  declarations,
  position,
  onClose
}) => {
  // Calculate position for the popup based on player position
  const getPopupPosition = () => {
    switch (position) {
      case 'north':
        return 'top-40 left-1/2 transform -translate-x-1/2';
      case 'south':
        return 'bottom-40 left-1/2 transform -translate-x-1/2';
      case 'east':
        return 'right-40 top-1/2 transform -translate-y-1/2';
      case 'west':
        return 'left-40 top-1/2 transform -translate-y-1/2';
    }
  };

  return (
    <AnimatePresence>
      {show && declarations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`absolute ${getPopupPosition()} z-50`}
          onClick={onClose}
        >
          <div className="bg-slate-900/95 backdrop-blur-md rounded-xl p-6 shadow-2xl border-2 border-amber-500/40 transform scale-110">
            <h3 className="text-2xl font-bold text-amber-300 mb-4">
              {playerName}'s Declarations
            </h3>
            <div className="space-y-4">
              {declarations.map((decl, index) => (
                <div key={index} className="bg-slate-800/70 rounded-lg p-4">
                  <p className="text-amber-100 font-bold text-lg mb-3">
                    {decl.type} - {decl.points} points
                  </p>
                  <div className="flex space-x-2">
                    {decl.cards.map((card) => (
                      <Card
                        key={card.id}
                        card={card}
                        size="medium"
                        className="transform scale-110"
                      />
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t-2 border-slate-700">
                <p className="text-amber-300 font-bold text-xl">
                  Total: {declarations.reduce((sum, d) => sum + d.points, 0)} points
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-3 text-center font-medium">
              Click to close
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeclarationViewer;
