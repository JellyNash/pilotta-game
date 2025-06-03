import { Suit, Rank } from '../core/types';
import { AccessibilitySettings } from './accessibilityTypes';

// ARIA label generators
export const ariaLabels = {
  card: (rank: string, suit: string, value: number, isTrump: boolean): string => {
    const suitName = getSuitName(suit);
    const rankName = getRankName(rank);
    let label = `${rankName} of ${suitName}`;
    if (isTrump) label += ', trump suit';
    if (value > 0) label += `, ${value} points`;
    return label;
  },
  
  player: (name: string, team: number, isActive: boolean): string => {
    let label = `${name}, Team ${team}`;
    if (isActive) label += ', currently playing';
    return label;
  },
  
  bid: (player: string, amount: number, isDouble: boolean, isRedouble: boolean): string => {
    let label = `${player} bid ${amount}`;
    if (isDouble) label += ', doubled';
    if (isRedouble) label += ', redoubled';
    return label;
  },
  
  trick: (cards: Array<{player: string, card: string}>): string => {
    const plays = cards.map(({player, card}) => `${player} played ${card}`).join(', ');
    return `Current trick: ${plays}`;
  },
  
  score: (team1: number, team2: number): string => {
    return `Score: Team 1 has ${team1} points, Team 2 has ${team2} points`;
  },
  
  declaration: (type: string, cards: string, points: number): string => {
    return `${type} declaration with ${cards}, worth ${points} points`;
  },
  
  gamePhase: (phase: string): string => {
    return `Game phase: ${phase}`;
  },
  
  trump: (suit: string): string => {
    return `Trump suit is ${getSuitName(suit)}`;
  },
};

// Helper functions
function getSuitName(suit: string): string {
  const suitNames: Record<string, string> = {
    'Hearts': 'Hearts',
    'Diamonds': 'Diamonds',
    'Clubs': 'Clubs',
    'Spades': 'Spades',
    '♥': 'Hearts',
    '♦': 'Diamonds',
    '♣': 'Clubs',
    '♠': 'Spades',
  };
  return suitNames[suit] || suit;
}

function getRankName(rank: string): string {
  const rankNames: Record<string, string> = {
    'A': 'Ace',
    'K': 'King',
    'Q': 'Queen',
    'J': 'Jack',
    '10': 'Ten',
    '9': 'Nine',
    '8': 'Eight',
    '7': 'Seven',
  };
  return rankNames[rank] || rank;
}

// Contrast ratio calculator
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): {r: number, g: number, b: number} | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance({r, g, b}: {r: number, g: number, b: number}): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Check if contrast meets WCAG standards
export function meetsWCAGContrast(
  contrast: number, 
  level: 'AA' | 'AAA', 
  largeText: boolean = false
): boolean {
  if (level === 'AA') {
    return largeText ? contrast >= 3 : contrast >= 4.5;
  } else {
    return largeText ? contrast >= 4.5 : contrast >= 7;
  }
}

// Generate high contrast color pairs
export function getHighContrastColors(theme: string): {
  background: string;
  text: string;
  accent: string;
} {
  switch (theme) {
    case 'high-contrast':
      return {
        background: '#000000',
        text: '#FFFFFF',
        accent: '#FFFF00',
      };
    case 'dark':
      return {
        background: '#1a1a1a',
        text: '#f0f0f0',
        accent: '#00bfff',
      };
    default:
      return {
        background: '#ffffff',
        text: '#000000',
        accent: '#0066cc',
      };
  }
}

// Audio cue manager
export class AudioCueManager {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  
  constructor(private settings: AccessibilitySettings) {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.updateVolume();
    }
  }
  
  updateVolume() {
    if (this.gainNode) {
      this.gainNode.gain.value = this.settings.audio.volume / 100;
    }
  }
  
  async playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext || !this.gainNode || !this.settings.audio.enabled) return;
    
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.connect(this.gainNode);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }
  
  // Predefined cues
  turnPrompt() {
    if (this.settings.audio.cues.turnPrompt) {
      this.playTone(440, 200); // A4 for 200ms
    }
  }
  
  trickWin() {
    if (this.settings.audio.cues.trickWin) {
      this.playTone(523, 150); // C5
      setTimeout(() => this.playTone(659, 150), 150); // E5
    }
  }
  
  belote() {
    if (this.settings.audio.cues.belote) {
      this.playTone(523, 100); // C5
      setTimeout(() => this.playTone(659, 100), 100); // E5
      setTimeout(() => this.playTone(784, 200), 200); // G5
    }
  }
  
  bidChange() {
    if (this.settings.audio.cues.bidChange) {
      this.playTone(330, 100); // E4
    }
  }
  
  error() {
    if (this.settings.audio.cues.gameEvents) {
      this.playTone(220, 300, 'square'); // A3 with square wave
    }
  }
  
  success() {
    if (this.settings.audio.cues.gameEvents) {
      this.playTone(440, 100); // A4
      setTimeout(() => this.playTone(554, 100), 100); // C#5
      setTimeout(() => this.playTone(659, 200), 200); // E5
    }
  }
}

// Keyboard navigation helper
export class KeyboardNavigationManager {
  private focusableElements: HTMLElement[] = [];
  private currentIndex = 0;
  
  register(element: HTMLElement) {
    if (!this.focusableElements.includes(element)) {
      this.focusableElements.push(element);
    }
  }
  
  unregister(element: HTMLElement) {
    const index = this.focusableElements.indexOf(element);
    if (index > -1) {
      this.focusableElements.splice(index, 1);
    }
  }
  
  focusNext() {
    if (this.focusableElements.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length;
    this.focusableElements[this.currentIndex]?.focus();
  }
  
  focusPrevious() {
    if (this.focusableElements.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.focusableElements.length) % this.focusableElements.length;
    this.focusableElements[this.currentIndex]?.focus();
  }
  
  focusFirst() {
    if (this.focusableElements.length > 0) {
      this.currentIndex = 0;
      this.focusableElements[0].focus();
    }
  }
  
  focusLast() {
    if (this.focusableElements.length > 0) {
      this.currentIndex = this.focusableElements.length - 1;
      this.focusableElements[this.currentIndex].focus();
    }
  }
}

// Simplified mode visibility helper
export function shouldShowInSimplifiedMode(elementType: string): boolean {
  const essentialElements = [
    'hand',
    'table',
    'score',
    'trump',
    'current-player',
    'play-button',
    'bid-button',
  ];
  
  return essentialElements.includes(elementType);
}

// Generate theme CSS variables
export function generateThemeVariables(settings: AccessibilitySettings): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // Apply card size
  variables['--card-size'] = `${settings.cardSize}`;
  
  // Apply animation speed
  variables['--animation-speed'] = `${1 / settings.animations.speed}`;
  
  // Apply focus styles
  variables['--focus-thickness'] = `${settings.focus.thickness}px`;
  variables['--focus-color'] = settings.focus.color;
  
  // Apply magnification
  variables['--card-magnification'] = `${settings.highlighting.magnification}`;
  
  // Apply comfort settings
  if (settings.comfort.blueLightFilter) {
    document.documentElement.setAttribute('data-blue-light-filter', 'true');
  }
  
  document.documentElement.setAttribute('data-background-pattern', settings.comfort.backgroundPattern);
  document.documentElement.setAttribute('data-table-felt', settings.comfort.tableFelt);
  
  // Apply simplified mode
  if (settings.cognitive.simplifiedMode) {
    document.documentElement.setAttribute('data-simplified', 'true');
  }
  
  // Apply large text
  if (settings.indicators.largeStatusText) {
    document.documentElement.setAttribute('data-large-text', 'true');
  }
  
  return variables;
}
