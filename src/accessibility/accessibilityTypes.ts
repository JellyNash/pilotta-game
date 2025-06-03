// Accessibility Types and Interfaces

export interface AccessibilitySettings {
  // Visual Settings
  theme: 'default' | 'high-contrast' | 'dark' | 'colorblind-safe';
  fontSize: number; // 100-200 percentage
  cardSize: number; // 100-200 percentage
  animations: {
    enabled: boolean;
    speed: number; // 0.5-2x multiplier
    reducedMotion: boolean;
  };
  
  // Contrast & Colors
  contrast: {
    enabled: boolean;
    level: 'AA' | 'AAA'; // WCAG compliance levels
  };
  colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochrome';
  suitPatterns: boolean; // Add patterns to suits
  
  // Screen Reader & Audio
  screenReader: {
    enabled: boolean;
    verbosity: 'verbose' | 'compact';
    announceAll: boolean;
  };
  audio: {
    enabled: boolean;
    volume: number; // 0-100
    cues: {
      turnPrompt: boolean;
      trickWin: boolean;
      belote: boolean;
      bidChange: boolean;
      gameEvents: boolean;
    };
    spatialAudio: boolean;
    voiceSelection: 'default' | 'male' | 'female' | 'neutral';
  };
  
  // Input & Controls
  keyboard: {
    enabled: boolean;
    customBindings: Record<string, string>;
    skipLinks: boolean;
  };
  focus: {
    visible: boolean;
    thickness: number; // 2-5px
    color: string;
  };
  
  // Haptics (Mobile)
  haptics: {
    enabled: boolean;
    intensity: number; // 0-100
  };
  
  // Visual Aids
  highlighting: {
    activeCard: boolean;
    magnification: number; // 1.0-1.5x
    legalMoves: boolean;
    teamColors: boolean;
    dynamicOutlines: boolean;
  };
  
  // Status Indicators
  indicators: {
    trumpAlwaysVisible: boolean;
    largeStatusText: boolean;
    multiModalAlerts: boolean; // Visual + Audio + Haptic
    cardLabels: boolean; // Show rank/suit text on cards
  };
  
  // Cognitive Assistance
  cognitive: {
    simplifiedMode: boolean;
    playHints: boolean;
    gameSpeed: number; // 0.5-2x multiplier for AI thinking
    practiceMode: boolean;
  };
  
  // Comfort
  comfort: {
    blueLightFilter: boolean;
    backgroundPattern: 'none' | 'subtle' | 'dots' | 'lines';
    tableFelt: 'green' | 'blue' | 'red' | 'gray' | 'high-contrast';
    cardBacks: 'default' | 'high-contrast' | 'pattern1' | 'pattern2';
  };
}

export const defaultAccessibilitySettings: AccessibilitySettings = {
  theme: 'default',
  fontSize: 100,
  cardSize: 100,
  animations: {
    enabled: true,
    speed: 1,
    reducedMotion: false,
  },
  contrast: {
    enabled: false,
    level: 'AA',
  },
  colorblindMode: 'none',
  suitPatterns: false,
  screenReader: {
    enabled: false,
    verbosity: 'compact',
    announceAll: false,
  },
  audio: {
    enabled: true,
    volume: 70,
    cues: {
      turnPrompt: true,
      trickWin: true,
      belote: true,
      bidChange: true,
      gameEvents: true,
    },
    spatialAudio: false,
    voiceSelection: 'default',
  },
  keyboard: {
    enabled: true,
    customBindings: {},
    skipLinks: false,
  },
  focus: {
    visible: true,
    thickness: 3,
    color: '#0066CC',
  },
  haptics: {
    enabled: false,
    intensity: 50,
  },
  highlighting: {
    activeCard: true,
    magnification: 1.1,
    legalMoves: false,
    teamColors: false,
    dynamicOutlines: false,
  },
  indicators: {
    trumpAlwaysVisible: false,
    largeStatusText: false,
    multiModalAlerts: false,
    cardLabels: false,
  },
  cognitive: {
    simplifiedMode: false,
    playHints: false,
    gameSpeed: 1,
    practiceMode: false,
  },
  comfort: {
    blueLightFilter: false,
    backgroundPattern: 'none',
    tableFelt: 'green',
    cardBacks: 'default',
  },
};

// Keyboard bindings
export interface KeyBindings {
  // Navigation
  nextCard: string;
  previousCard: string;
  selectCard: string;
  playCard: string;
  
  // Game actions
  pass: string;
  bid: string;
  double: string;
  declare: string;
  show: string;
  
  // UI actions
  openSettings: string;
  skipToHand: string;
  skipToTable: string;
  skipToScore: string;
  toggleTrump: string;
  readGameState: string;
  
  // Help
  help: string;
  tutorial: string;
}

export const defaultKeyBindings: KeyBindings = {
  // Navigation
  nextCard: 'ArrowRight',
  previousCard: 'ArrowLeft',
  selectCard: ' ',
  playCard: 'Enter',
  
  // Game actions
  pass: 'p',
  bid: 'b',
  double: 'd',
  declare: 'c',
  show: 'w',
  
  // UI actions
  openSettings: ',',
  skipToHand: 's',
  skipToTable: 't',
  skipToScore: 'o',
  toggleTrump: 'r',
  readGameState: 'g',
  
  // Help
  help: '?',
  tutorial: 'h',
};

// Theme definitions
export interface Theme {
  name: string;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    focus: string;
    
    // Game specific
    felt: string;
    cardFront: string;
    cardBack: string;
    
    // Suits
    hearts: string;
    diamonds: string;
    clubs: string;
    spades: string;
    
    // Teams
    team1: string;
    team2: string;
    
    // Status
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Contrast ratios
  contrasts: {
    text: number;
    largeText: number;
    ui: number;
  };
}

// ARIA labels for game elements
export interface AriaLabels {
  card: (rank: string, suit: string, value: number, isTrump: boolean) => string;
  player: (name: string, team: number, isActive: boolean) => string;
  bid: (player: string, amount: number, isDouble: boolean, isRedouble: boolean) => string;
  trick: (cards: Array<{player: string, card: string}>) => string;
  score: (team1: number, team2: number) => string;
  declaration: (type: string, cards: string, points: number) => string;
  gamePhase: (phase: string) => string;
  trump: (suit: string) => string;
}

// Suit patterns for colorblind mode
export interface SuitPattern {
  type: 'diagonal' | 'dots' | 'horizontal' | 'vertical' | 'cross';
  density: number; // 1-10
  color: string;
  strokeWidth: number;
}

export const suitPatterns: Record<string, SuitPattern> = {
  hearts: {
    type: 'dots',
    density: 5,
    color: 'currentColor',
    strokeWidth: 2,
  },
  diamonds: {
    type: 'diagonal',
    density: 7,
    color: 'currentColor',
    strokeWidth: 2,
  },
  clubs: {
    type: 'cross',
    density: 6,
    color: 'currentColor',
    strokeWidth: 2,
  },
  spades: {
    type: 'vertical',
    density: 8,
    color: 'currentColor',
    strokeWidth: 2,
  },
};
