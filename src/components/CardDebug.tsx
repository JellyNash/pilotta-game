import React from 'react';
import { useAppSelector } from '../store/hooks';

export const CardDebug: React.FC = () => {
  const players = useAppSelector(state => state.game.players);
  const phase = useAppSelector(state => state.game.phase);
  
  return (
    <div style={{
      position: 'fixed',
      top: '100px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h3>Card Debug Info</h3>
      <p>Phase: {phase}</p>
      {players.map((player, idx) => (
        <div key={player.id}>
          <strong>{player.name} ({player.position}):</strong>
          <ul>
            <li>Cards: {player.hand.length}</li>
            <li>AI: {player.isAI ? 'Yes' : 'No'}</li>
            {player.hand.length > 0 && (
              <li>First card: {player.hand[0].rank} of {player.hand[0].suit}</li>
            )}
          </ul>
        </div>
      ))}
      <hr />
      <p>DOM Cards: {document.querySelectorAll('.playing-card').length}</p>
      <p>Visible Cards: {
        Array.from(document.querySelectorAll('.playing-card')).filter(
          card => {
            const rect = card.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          }
        ).length
      }</p>
    </div>
  );
};