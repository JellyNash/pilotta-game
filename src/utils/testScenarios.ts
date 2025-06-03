import { Card, Suit, Rank, Declaration, DeclarationType } from '../core/types';

// Test scenarios for declaration system testing

export const createTestDeclarations = () => {
  // Sequence of 4 cards (50 points)
  const sequence4: Card[] = [
    { id: '1', suit: Suit.Hearts, rank: Rank.Jack },
    { id: '2', suit: Suit.Hearts, rank: Rank.Queen },
    { id: '3', suit: Suit.Hearts, rank: Rank.King },
    { id: '4', suit: Suit.Hearts, rank: Rank.Ace }
  ];

  // Four of a kind Jacks (200 points)
  const fourJacks: Card[] = [
    { id: '5', suit: Suit.Hearts, rank: Rank.Jack },
    { id: '6', suit: Suit.Diamonds, rank: Rank.Jack },
    { id: '7', suit: Suit.Clubs, rank: Rank.Jack },
    { id: '8', suit: Suit.Spades, rank: Rank.Jack }
  ];

  // Four of a kind 9s (150 points)
  const fourNines: Card[] = [
    { id: '9', suit: Suit.Hearts, rank: Rank.Nine },
    { id: '10', suit: Suit.Diamonds, rank: Rank.Nine },
    { id: '11', suit: Suit.Clubs, rank: Rank.Nine },
    { id: '12', suit: Suit.Spades, rank: Rank.Nine }
  ];

  // Sequence of 3 cards (20 points)
  const sequence3: Card[] = [
    { id: '13', suit: Suit.Clubs, rank: Rank.Ten },
    { id: '14', suit: Suit.Clubs, rank: Rank.Jack },
    { id: '15', suit: Suit.Clubs, rank: Rank.Queen }
  ];

  return {
    strongDeclarations: {
      fourJacks: {
        type: DeclarationType.FourOfAKind,
        cards: fourJacks,
        points: 200
      },
      fourNines: {
        type: DeclarationType.FourOfAKind,
        cards: fourNines,
        points: 150
      }
    },
    mediumDeclarations: {
      sequence4: {
        type: DeclarationType.Sequence,
        cards: sequence4,
        points: 50
      }
    },
    weakDeclarations: {
      sequence3: {
        type: DeclarationType.Sequence,
        cards: sequence3,
        points: 20
      }
    }
  };
};

// Create hands with specific declarations for testing
export const createTestHands = () => {
  const { strongDeclarations, mediumDeclarations, weakDeclarations } = createTestDeclarations();

  // Hand with strong declaration (Four Jacks)
  const strongHand: Card[] = [
    ...strongDeclarations.fourJacks.cards,
    { id: '20', suit: Suit.Hearts, rank: Rank.Ten },
    { id: '21', suit: Suit.Diamonds, rank: Rank.Ace },
    { id: '22', suit: Suit.Clubs, rank: Rank.King },
    { id: '23', suit: Suit.Spades, rank: Rank.Queen }
  ];

  // Hand with medium declaration (Sequence of 4)
  const mediumHand: Card[] = [
    ...mediumDeclarations.sequence4.cards,
    { id: '24', suit: Suit.Diamonds, rank: Rank.Seven },
    { id: '25', suit: Suit.Clubs, rank: Rank.Eight },
    { id: '26', suit: Suit.Spades, rank: Rank.Nine },
    { id: '27', suit: Suit.Diamonds, rank: Rank.Ten }
  ];

  // Hand with weak declaration (Sequence of 3)
  const weakHand: Card[] = [
    ...weakDeclarations.sequence3.cards,
    { id: '28', suit: Suit.Hearts, rank: Rank.Seven },
    { id: '29', suit: Suit.Hearts, rank: Rank.Eight },
    { id: '30', suit: Suit.Diamonds, rank: Rank.King },
    { id: '31', suit: Suit.Spades, rank: Rank.Ace },
    { id: '32', suit: Suit.Spades, rank: Rank.Seven }
  ];

  // Hand with no declarations
  const noDeclarationHand: Card[] = [
    { id: '33', suit: Suit.Hearts, rank: Rank.Seven },
    { id: '34', suit: Suit.Diamonds, rank: Rank.Eight },
    { id: '35', suit: Suit.Clubs, rank: Rank.Nine },
    { id: '36', suit: Suit.Spades, rank: Rank.Ten },
    { id: '37', suit: Suit.Hearts, rank: Rank.Queen },
    { id: '38', suit: Suit.Diamonds, rank: Rank.King },
    { id: '39', suit: Suit.Clubs, rank: Rank.Ace },
    { id: '40', suit: Suit.Spades, rank: Rank.Seven }
  ];

  return {
    strongHand,
    mediumHand,
    weakHand,
    noDeclarationHand
  };
};

// Test scenario descriptions
export const testScenarios = [
  {
    name: "Both teams declare - Team A stronger",
    setup: "Team A has Four Jacks (200pts), Team B has Sequence of 4 (50pts)",
    expected: "Only Team A can show in second trick, Team B's show button disabled"
  },
  {
    name: "Third trick fallback - Strong team forgets",
    setup: "Team A declares Four Jacks but doesn't show in second trick",
    expected: "Team B gets 'Show (Fallback)!' button in third trick"
  },
  {
    name: "Conservative AI declaration",
    setup: "Conservative AI has Sequence of 3 (20pts)",
    expected: "AI should NOT declare (threshold is 50pts)"
  },
  {
    name: "Click-to-view after showing",
    setup: "Player shows declarations in second trick",
    expected: "Clicking player area displays declaration details"
  },
  {
    name: "No declarations scenario",
    setup: "No player has any declarations",
    expected: "Game proceeds directly to playing phase, no declaration buttons appear"
  }
];

// Helper to inject test hands into game state (for development testing)
export const injectTestHands = (gameState: any, scenario: 'strong' | 'medium' | 'weak' | 'mixed') => {
  const hands = createTestHands();
  
  switch (scenario) {
    case 'strong':
      // Team A gets strong declarations
      gameState.players[0].hand = hands.strongHand;
      gameState.players[2].hand = hands.mediumHand;
      // Team B gets weak/no declarations
      gameState.players[1].hand = hands.weakHand;
      gameState.players[3].hand = hands.noDeclarationHand;
      break;
      
    case 'medium':
      // Both teams get medium declarations
      gameState.players[0].hand = hands.mediumHand;
      gameState.players[2].hand = hands.mediumHand;
      gameState.players[1].hand = hands.mediumHand;
      gameState.players[3].hand = hands.weakHand;
      break;
      
    case 'weak':
      // All players get weak/no declarations
      gameState.players[0].hand = hands.weakHand;
      gameState.players[2].hand = hands.noDeclarationHand;
      gameState.players[1].hand = hands.weakHand;
      gameState.players[3].hand = hands.noDeclarationHand;
      break;
      
    case 'mixed':
      // Mixed scenario for general testing
      gameState.players[0].hand = hands.strongHand;
      gameState.players[1].hand = hands.mediumHand;
      gameState.players[2].hand = hands.weakHand;
      gameState.players[3].hand = hands.noDeclarationHand;
      break;
  }
  
  return gameState;
};
