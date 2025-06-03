import React from 'react';
import { Contract, Suit } from '../core/types';

interface ContractBadgeProps {
  contract: Contract;
  showBidder?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const ContractBadge: React.FC<ContractBadgeProps> = ({ 
  contract, 
  showBidder = false,
  size = 'medium' 
}) => {
  // Get suit symbol and color
  const getSuitDisplay = (suit: Suit) => {
    switch (suit) {
      case Suit.Hearts:
        return { symbol: '♥', color: 'text-red-500' };
      case Suit.Diamonds:
        return { symbol: '♦', color: 'text-red-500' };
      case Suit.Clubs:
        return { symbol: '♣', color: 'text-slate-800' };
      case Suit.Spades:
        return { symbol: '♠', color: 'text-slate-800' };
    }
  };
  
  const suitDisplay = getSuitDisplay(contract.trump);
  
  // Size classes
  const sizeClasses = {
    small: 'text-sm px-2 py-1',
    medium: 'text-base px-3 py-1.5',
    large: 'text-lg px-4 py-2'
  };
  
  const symbolSizeClasses = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-3xl'
  };
  
  return (
    <div className="flex items-center gap-2">
      {/* Contract value and suit */}
      <div className={`relative bg-white rounded-lg shadow-md ${sizeClasses[size]} flex items-center gap-1.5`}>
        <span className="font-bold text-slate-700">{contract.value}</span>
        <span className={`${suitDisplay.color} ${symbolSizeClasses[size]} leading-none`}>
          {suitDisplay.symbol}
        </span>
        
        {/* Double indicator - circle around the badge */}
        {contract.doubled && !contract.redoubled && (
          <div className="absolute inset-0 rounded-lg border-2 border-orange-500 -m-1" />
        )}
        
        {/* Redouble indicator - X and circle */}
        {contract.redoubled && (
          <>
            <div className="absolute inset-0 rounded-lg border-2 border-red-500 -m-1" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-red-500 font-bold text-3xl opacity-50">×</span>
            </div>
          </>
        )}
      </div>
      
      {/* Bidder name if requested */}
      {showBidder && (
        <span className="text-sm text-slate-400">
          by {contract.bidder.name}
        </span>
      )}
      
      {/* Team indicator */}
      <div className={`text-xs px-2 py-0.5 rounded-full ${
        contract.team === 'A' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
      }`}>
        Team {contract.team}
      </div>
    </div>
  );
};

export default ContractBadge;
