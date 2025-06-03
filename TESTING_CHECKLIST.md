# Pilotta Game Testing Checklist

## Current Implementation Status

### Completed Features ✅
1. **Two-Phase Declaration System**
   - [x] First trick: Players can declare
   - [x] Second trick: Players who declared can show
   - [x] Declaration tracking in Redux state
   - [x] AI players decide whether to declare

2. **UI Components**
   - [x] DeclarationManager with declare/show buttons
   - [x] Declaration banners above player cards
   - [x] DeclarationViewer for click-to-view functionality
   - [x] Horizontal bidding interface
   - [x] Card exit animations towards trick winner

3. **Game Logic**
   - [x] Declaration competition between teams
   - [x] Only winning team's declarations count
   - [x] Third trick fallback logic implemented
   - [x] Proper scoring for shown declarations only

## Testing Scenarios

### 1. Basic Declaration Flow
- [ ] Player has declarations (e.g., sequence of 3+ cards)
- [ ] "Declare!" button appears in first trick
- [ ] Clicking "Declare!" marks player as declared
- [ ] Declaration banner shows "Declared!"
- [ ] "Show!" button appears in second trick
- [ ] Clicking "Show!" reveals declaration cards
- [ ] Declaration points are counted in scoring

### 2. Declaration Competition
- [ ] Both teams declare in first trick
- [ ] System determines stronger declarations
- [ ] Only winning team gets showing rights
- [ ] Losing team cannot show in second trick
- [ ] Correct team's declarations count in scoring

### 3. Third Trick Fallback
- [ ] Stronger team declares but forgets to show
- [ ] Weaker team gets showing rights in third trick
- [ ] "Show (Fallback)!" button appears for eligible players
- [ ] Fallback team can show and score their declarations

### 4. Click-to-View Functionality
- [ ] Clicking on player area shows DeclarationViewer
- [ ] Only shows if player has shown declarations
- [ ] Shows after second trick even if not shown
- [ ] Displays declaration type, cards, and points
- [ ] Click to close functionality works

### 5. AI Behavior
- [ ] AI players automatically declare based on personality
- [ ] Conservative AI only declares strong declarations (50+ pts)
- [ ] Other personalities always declare when possible
- [ ] AI shows declarations when they have rights
- [ ] AI takes advantage of third trick fallback

### 6. Edge Cases
- [ ] No declarations - game proceeds normally
- [ ] Only one team has declarations
- [ ] Player declares but has no valid declarations (should not happen)
- [ ] Multiple declarations per player
- [ ] Belote (King-Queen of trump) handling

### 7. Visual Polish
- [ ] Declaration buttons positioned correctly for all players
- [ ] Animations smooth and non-jarring
- [ ] Banners don't overlap with cards
- [ ] Card exit animations work correctly
- [ ] No visual glitches during state transitions

## Known Issues to Fix

1. **Testing Coverage**
   - Need to thoroughly test third trick fallback scenarios
   - Verify AI behavior in all declaration situations
   - Test edge cases with multiple declarations

2. **Visual Polish**
   - Fine-tune button and banner positioning
   - Ensure animations are smooth on all screen sizes
   - Test mobile responsiveness

3. **Performance**
   - Check for any performance issues with animations
   - Verify state updates are efficient
   - Test with different browser environments

## Test Execution Plan

1. **Manual Testing**
   - Run through each scenario above
   - Document any issues found
   - Test on different screen sizes

2. **AI Testing**
   - Set up games with different AI personalities
   - Verify AI declaration behavior
   - Test AI vs AI games

3. **Edge Case Testing**
   - Create specific scenarios for edge cases
   - Test error handling
   - Verify game state consistency

## Notes for Testing

- Use browser developer tools to inspect Redux state
- Check console for any errors or warnings
- Test with different card sizes in settings
- Verify sound effects play correctly
- Test with animations disabled/enabled
