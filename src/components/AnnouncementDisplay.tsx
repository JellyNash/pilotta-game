import React, { useEffect, useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearNotification } from '../store/gameSlice';
import { soundManager } from '../utils/soundManager';
import { GameNotification } from '../core/types';
import UnifiedAnnouncement from './UnifiedAnnouncement';

// Empty array constant to avoid creating new references
const EMPTY_NOTIFICATIONS: GameNotification[] = [];

const AnnouncementDisplay: React.FC = () => {
  const notifications = useAppSelector(state => state.game.notifications || EMPTY_NOTIFICATIONS);
  const players = useAppSelector(state => state.game.players);
  const dispatch = useAppDispatch();
  const [displayedNotifications, setDisplayedNotifications] = useState<GameNotification[]>([]);

  // Helper to get player position
  const getPlayerPosition = (playerName: string): 'north' | 'east' | 'south' | 'west' => {
    const player = players.find(p => p.name === playerName);
    return player?.position || 'north';
  };

  useEffect(() => {
    // Check for new notifications
    if (notifications.length > displayedNotifications.length) {
      const newNotification = notifications[notifications.length - 1];
      setDisplayedNotifications([...displayedNotifications, newNotification]);
      
      // Play sound for Belote/Rebelote
      if (newNotification.type === 'belote' || newNotification.type === 'rebelote') {
        soundManager.play('belote');
      }
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        setDisplayedNotifications(prev => prev.filter(n => n !== newNotification));
        dispatch(clearNotification(newNotification));
      }, 3000);
    }
  }, [notifications, displayedNotifications, dispatch]);

  return (
    <>
      {displayedNotifications.map((notification, index) => (
        <UnifiedAnnouncement
          key={`${notification.type}-${notification.timestamp || index}`}
          type={notification.type as 'belote' | 'rebelote'}
          message={notification.message}
          position={getPlayerPosition(notification.player)}
          isVisible={true}
        />
      ))}
    </>
  );
};

export default AnnouncementDisplay;