# Pilotta - Cypriot Card Game

A modern web implementation of Pilotta (Πιλόττα), the popular Cypriot trick-taking card game, built with React, TypeScript, and Redux.

![Pilotta Game](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🎮 Game Overview

Pilotta is a partnership trick-taking card game for 4 players, similar to Belote. Players bid to set a contract, with the highest bidder choosing the trump suit. The game features unique elements like declarations (sequences and sets) and the special Belote announcement.

## ✨ Features

### Core Gameplay
- **Full Pilotta Rules**: Including forced overtrump, declarations, and Belote
- **Multiple Game Modes**: 101, 151, or 201 target points
- **Smart AI Opponents**: Four different AI personalities
- **MCTS AI**: Advanced Monte Carlo Tree Search for challenging gameplay

### AI Personalities
- **Conservative**: Careful bidding, defensive play
- **Aggressive**: Bold bidding, offensive strategies  
- **Balanced**: Adaptive middle-ground approach
- **Adaptive**: Learns and adjusts to your play style

### User Experience
- **Drag & Drop**: Intuitive card playing with touch support
- **Smooth Animations**: Powered by Framer Motion
- **Sound Effects**: Immersive audio feedback
- **Interactive Tutorial**: 7-page guide for new players
- **Score Breakdown**: Detailed point calculations
- **Round Transitions**: Beautiful between-round animations
- **Victory Celebrations**: Particle effects for wins
- **Smart Card Sorting**: Human player cards organized by rank with alternating colors
- **Visual Bidding**: Animated announcements show each player's bid
- **Enhanced Declarations**: Large buttons and beautiful card reveal animations

### Customization
- **Difficulty Levels**: Easy, Normal, Hard
- **Animation Speed**: Fast, Normal, Slow
- **Sound Controls**: Toggle effects on/off
- **MCTS Toggle**: Enable/disable advanced AI

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pilotta-game.git
cd pilotta-game

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open at `http://localhost:3000`

### Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🎯 How to Play

### Basic Rules
1. **Dealing**: Each player receives 8 cards (3-2-3 pattern)
2. **Bidding**: Players bid for the contract (80-250 points)
3. **Declarations**: Announce sequences and sets for bonus points
4. **Playing**: 8 tricks following suit/trump rules
5. **Scoring**: Points from tricks, declarations, and bonuses

### Special Features
- **Belote**: King and Queen of trumps = 20 bonus points
- **Declarations**: 
  - Tierce (3 cards): 20 points
  - Quarte (4 cards): 50 points  
  - Quinte (5 cards): 100 points
  - Carré (4 of a kind): 100-200 points
- **Last Trick**: 10 bonus points
- **Contract Failure**: Defending team gets all points

### Controls
- **Click** or **Drag** cards to play
- **Pass/Bid** buttons during bidding
- **Double/Redouble** when applicable
- Access **Settings** and **Tutorial** from header

## 🎮 Recent Improvements

### Smart Card Organization
- Cards automatically sorted from 7 to A within each suit
- Alternating red-black suit pattern for better visibility  
- Trump suit always positioned on the far right
- Smooth reorganization when trump changes

### Enhanced UI/UX
- **Bidding Announcements**: Visual feedback shows what each player bid
- **Declaration Buttons**: 2-3x larger for human player, positioned for easy access
- **Card Reveals**: 3D flip animations when showing declarations
- **Perfect Centering**: Bidding interface positioned exactly in the middle

## 🛠️ Technical Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React DnD** for drag-and-drop

### Architecture
- **Core Engine**: Game rules and validation
- **AI System**: Strategy and MCTS implementation
- **State Management**: Redux with typed actions
- **Component Library**: Reusable UI components
- **Sound System**: Centralized audio management

### File Structure
```
src/
├── ai/                 # AI strategies and MCTS
├── components/         # React components
│   ├── DeclarationManager.tsx   # Enhanced declarations
│   └── CardSortingDemo.tsx      # Sorting demonstration
├── core/              # Game engine and rules
├── game/              # Game flow controllers
├── store/             # Redux state management
├── utils/             # Utilities
│   ├── soundManager.ts    # Audio management
│   └── cardSorting.ts     # Smart card organization
└── App.tsx            # Main application
```

## 🤖 AI Implementation

### Strategy Layers
1. **Hand Evaluation**: Analyzes card strength and potential
2. **Bidding Logic**: Personality-based bid decisions
3. **Card Selection**: Optimal play considering game state
4. **Partner Cooperation**: Team-aware strategies

### MCTS Features
- Information set sampling
- UCB1 selection policy
- Determinization for hidden information
- Configurable time limits

## 🎨 Customization

### Modifying AI Behavior
Edit AI personalities in `src/ai/aiStrategy.ts`:
```typescript
case AIPersonality.Conservative:
  baseBid = Math.max(80, baseBid - 20);
  confidence *= 0.8;
  break;
```

### Adding Sound Effects
Add new sounds in `src/utils/soundManager.ts`:
```typescript
sounds: {
  cardPlay: '/sounds/card-play.mp3',
  // Add your sound here
}
```

### Styling Changes
Modify Tailwind classes in components or update `tailwind.config.js`

## 📝 Development

### Running Tests
```bash
npm run test        # Run unit tests
npm run test:watch  # Watch mode
```

### Code Quality
```bash
npm run lint        # ESLint
npm run type-check  # TypeScript
```

### Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Known Issues

Currently none reported. Please open an issue if you find any bugs.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Card game rules based on traditional Cypriot Pilotta
- UI inspired by modern card game applications
- AI techniques adapted from game theory research

## 📞 Contact

For questions or suggestions, please open an issue on GitHub.

---

Made with ❤️ for the Cypriot card game community
