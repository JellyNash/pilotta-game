# Announcement System Debug Notes

## Current Issues (Session 16 - Unresolved)

### 1. All Announcements Appear at Center
- **Problem**: Every announcement renders at the same position, stacked on top of each other
- **Expected**: Each player's announcement should appear near their position (north, south, east, west)
- **Attempted Fix**: Center-based positioning with 40% radius transforms
- **Result**: Transform calculations not working - all collapse to center

### 2. Duplicate Announcements
- **Problem**: Same announcements appear multiple times
- **Attempted Fix**: Added processedIds ref to track shown announcements
- **Result**: Still seeing duplicates

### 3. Position Calculation Bug
```typescript
// Current implementation in AnnouncementSystem.tsx
const getAnnouncementPosition = (position: string) => {
  const radius = isBiddingActive && position === 'south' ? '35%' : '40%';
  
  const positions = {
    north: {
      left: '50%',
      top: '50%',
      transform: `translate(-50%, -50%) translateY(-${radius})`
    },
    // ... other positions
  };
  
  return positions[position as keyof typeof positions] || positions.north;
};
```

**Issue**: The transform string might not be applying correctly, causing all to render at center.

## Files Involved
1. `/src/components/AnnouncementSystem.tsx` - Main component
2. `/src/components/AnnouncementSystem.css` - Styling and responsive variables
3. `/src/components/GameTable.tsx` - Integration and announcement data management
4. `/src/components/DeclarationManager.tsx` - Declaration button handling

## Previous System (UnifiedAnnouncement)
- Used NotificationPositioner from UIPositioner.tsx
- Positioned between player and center (25%, 50%, 75% positions)
- Was working but too small and got covered by bidding interface

## Next Steps to Debug
1. Check if CSS transforms are being applied in browser DevTools
2. Verify position prop is being passed correctly
3. Test with fixed pixel values instead of percentages
4. Consider using absolute positioning with calculated top/left values
5. Debug why processedIds isn't preventing duplicates

## Declaration Flow Requirements
1. **Trick 1**: Player clicks "Declare!" → Show points only (e.g., "100")
2. **Trick 2**: Player clicks "Show!" → Display actual cards
3. Announcements should replace, not stack per player position