// Test the new scoring logic
import { calculateRoundScore } from './src/core/gameRules';
import { GameState, Contract } from './src/core/types';

// Helper to create minimal game state for testing
const createTestGameState = (
  contract: Contract,
  completedTricks: Array<{ winner: { teamId: 'A' | 'B' } }>
): Partial<GameState> => ({
  contract,
  completedTricks: completedTricks as any
});

// Run tests
function runTests() {
  console.log('=== Testing New Scoring Logic ===\n');

  // Test 1: Normal scoring with new rounding rules
  console.log('Test 1: Normal scoring - Team A has higher remainder');
  const state1 = createTestGameState(
    { team: 'A', value: 82, doubled: false, redoubled: false } as Contract,
    [
      { winner: { teamId: 'A' } },
      { winner: { teamId: 'B' } },
      { winner: { teamId: 'A' } },
      { winner: { teamId: 'A' } },
      { winner: { teamId: 'B' } },
      { winner: { teamId: 'A' } },
      { winner: { teamId: 'A' } },
      { winner: { teamId: 'B' } }
    ]
  );
  
  const result1 = calculateRoundScore(
    state1 as GameState,
    { A: 96, B: 56 },  // Trick points before last trick bonus
    { A: 0, B: 0 },    // Declaration points
    { A: 20, B: 0 },   // Belote points
    'A'                // Last trick winner
  );
  console.log('Input: A=96+10(last)+20(belote)=126, B=56');
  console.log('Result:', result1);
  console.log('Expected: A=13 (rounds up), B=5 (rounds down)\n');

  // Test 2: All tricks collected
  console.log('Test 2: All tricks collected by Team A');
  const state2 = createTestGameState(
    { team: 'A', value: 82, doubled: false, redoubled: false } as Contract,
    Array(8).fill({ winner: { teamId: 'A' } })
  );
  
  const result2 = calculateRoundScore(
    state2 as GameState,
    { A: 152, B: 0 },  // These should be ignored
    { A: 0, B: 0 },    // Declaration points
    { A: 20, B: 0 },   // Belote points
    'A'                // Last trick winner
  );
  console.log('Input: Team A collected all tricks + 20 belote');
  console.log('Result:', result2);
  console.log('Expected: A=27 (250+20=270, /10), B=0\n');

  // Test 3: Equal remainders - team with more trick points rounds up
  console.log('Test 3: Equal remainders (both 6)');
  const state3 = createTestGameState(
    { team: 'A', value: 82, doubled: false, redoubled: false } as Contract,
    [
      { winner: { teamId: 'A' } },
      { winner: { teamId: 'A' } },
      { winner: { teamId: 'A' } },
      { winner: { teamId: 'A' } },
      { winner: { teamId: 'B' } },
      { winner: { teamId: 'B' } },
      { winner: { teamId: 'B' } },
      { winner: { teamId: 'B' } }
    ]
  );
  
  const result3 = calculateRoundScore(
    state3 as GameState,
    { A: 86, B: 66 },  // Trick points before last trick bonus
    { A: 0, B: 0 },    // Declaration points
    { A: 0, B: 0 },    // Belote points
    'A'                // Last trick winner - A gets +10
  );
  console.log('Input: A=86+10=96, B=66 (both remainder 6)');
  console.log('Result:', result3);
  console.log('Expected: A=10 (rounds up - more trick points), B=6\n');

  // Test 4: Contract failure
  console.log('Test 4: Contract failure - all points to defending team');
  const state4 = createTestGameState(
    { team: 'A', value: 82, doubled: false, redoubled: false } as Contract,
    [
      { winner: { teamId: 'B' } },
      { winner: { teamId: 'B' } },
      { winner: { teamId: 'B' } },
      { winner: { teamId: 'B' } },
      { winner: { teamId: 'B' } },
      { winner: { teamId: 'B' } },
      { winner: { teamId: 'A' } },
      { winner: { teamId: 'A' } }
    ]
  );
  
  const result4 = calculateRoundScore(
    state4 as GameState,
    { A: 30, B: 122 }, // Trick points before last trick bonus
    { A: 0, B: 0 },    // Declaration points
    { A: 20, B: 0 },   // Belote points (Team A)
    'B'                // Last trick winner
  );
  console.log('Input: A=30+20=50, B=122+10=132, contract requires 82');
  console.log('Result:', result4);
  console.log('Expected: A=0, B=19 (gets all 182 points, rounds up)\n');

  // Test 5: Different remainders
  console.log('Test 5: Different remainders - B has higher');
  const state5 = createTestGameState(
    { team: 'A', value: 82, doubled: false, redoubled: false } as Contract,
    [
      { winner: { teamId: 'A' } },
      { winner: { teamId: 'A' } },
      { winner: { teamId: 'A' } },
      { winner: { teamId: 'B' } },
      { winner: { teamId: 'B' } },
      { winner: { teamId: 'B' } },
      { winner: { teamId: 'B' } },
      { winner: { teamId: 'B' } }
    ]
  );
  
  const result5 = calculateRoundScore(
    state5 as GameState,
    { A: 63, B: 89 },  // Trick points before last trick bonus
    { A: 20, B: 0 },   // Declaration points
    { A: 0, B: 0 },    // Belote points
    'B'                // Last trick winner
  );
  console.log('Input: A=63+20=83 (rem 3), B=89+10=99 (rem 9)');
  console.log('Result:', result5);
  console.log('Expected: A=8, B=10 (B rounds up - higher remainder)\n');
}

// Export for testing
export { runTests };