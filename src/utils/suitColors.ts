import { Suit } from '../core/types';

// Define all possible suit color classes that Tailwind needs to know about
export const SUIT_COLOR_CLASSES = {
  red: {
    modern: 'text-rose-500',
    classic: 'text-red-600',
    accessible: 'text-red-700',
    minimalist: 'text-rose-500'
  },
  black: {
    modern: 'text-slate-800',
    classic: 'text-gray-900',
    accessible: 'text-gray-900',
    minimalist: 'text-slate-800'
  }
} as const;

export type CardStyle = 'modern' | 'classic' | 'accessible' | 'minimalist';

/**
 * Get the text color class for a suit based on card style
 * Returns a CSS class string that Tailwind can statically analyze
 */
export function getSuitColorClass(suit: Suit, cardStyle: CardStyle = 'modern'): string {
  const isRed = suit === Suit.Hearts || suit === Suit.Diamonds;
  const colorType = isRed ? 'red' : 'black';
  return `${SUIT_COLOR_CLASSES[colorType][cardStyle]} font-black`;
}

/**
 * Get the CSS color value for a suit (for inline styles)
 * This is safer than dynamic Tailwind classes
 */
export function getSuitColorValue(suit: Suit, cardStyle: CardStyle = 'modern'): string {
  const isRed = suit === Suit.Hearts || suit === Suit.Diamonds;
  
  const colorMap = {
    modern: { red: '#f43f5e', black: '#1e293b' },
    classic: { red: '#dc2626', black: '#111827' },
    accessible: { red: '#b91c1c', black: '#111827' },
    minimalist: { red: '#f43f5e', black: '#1e293b' }
  };
  
  return colorMap[cardStyle][isRed ? 'red' : 'black'];
}

// Export all possible class combinations for Tailwind to pick up
export const TAILWIND_SAFELIST = [
  'text-rose-500',
  'text-red-600',
  'text-red-700',
  'text-slate-800',
  'text-gray-900',
  'font-black'
];