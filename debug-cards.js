// Debug script to check card rendering issues
console.log('=== CARD RENDERING DEBUG ===');

// Check if cards exist in DOM
const allCards = document.querySelectorAll('.playing-card');
console.log(`Total cards found: ${allCards.length}`);

// Check card dimensions
allCards.forEach((card, index) => {
  const rect = card.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(card);
  const parent = card.closest('.ph-card-slot') || card.parentElement;
  const parentRect = parent?.getBoundingClientRect();
  
  console.log(`Card ${index + 1}:`, {
    position: `${rect.x}, ${rect.y}`,
    size: `${rect.width}x${rect.height}`,
    visible: rect.width > 0 && rect.height > 0,
    display: computedStyle.display,
    visibility: computedStyle.visibility,
    opacity: computedStyle.opacity,
    transform: computedStyle.transform,
    backgroundColor: computedStyle.backgroundColor,
    parentPosition: parentRect ? `${parentRect.x}, ${parentRect.y}` : 'N/A',
    parentSize: parentRect ? `${parentRect.width}x${parentRect.height}` : 'N/A',
    faceDown: card.dataset.faceDown,
    suit: card.dataset.cardSuit,
    rank: card.dataset.cardRank
  });
});

// Check CSS variables
const root = document.documentElement;
const cssVars = [
  '--card-width-base',
  '--card-height-base',
  '--card-base-width',
  '--card-base-height',
  '--ph-card-width',
  '--ph-card-height'
];

console.log('\nCSS Variables:');
cssVars.forEach(varName => {
  const value = getComputedStyle(root).getPropertyValue(varName);
  console.log(`${varName}: ${value || 'NOT DEFINED'}`);
});

// Check player hands
const playerHands = document.querySelectorAll('.ph-wrapper');
console.log(`\nPlayer hands found: ${playerHands.length}`);
playerHands.forEach((hand, index) => {
  const position = hand.dataset.position;
  const cards = hand.querySelectorAll('.playing-card');
  console.log(`Player ${position}: ${cards.length} cards`);
});

// Check for any error styles
const cardsWithIssues = Array.from(allCards).filter(card => {
  const rect = card.getBoundingClientRect();
  const style = window.getComputedStyle(card);
  return rect.width === 0 || rect.height === 0 || style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0;
});

if (cardsWithIssues.length > 0) {
  console.log(`\n⚠️ Found ${cardsWithIssues.length} cards with display issues!`);
}

// Export function to run in console
window.debugCards = () => {
  console.clear();
  console.log('=== LIVE CARD DEBUG ===');
  
  const cards = document.querySelectorAll('.playing-card');
  const visibleCards = Array.from(cards).filter(card => {
    const rect = card.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
  
  console.log(`Total cards: ${cards.length}`);
  console.log(`Visible cards: ${visibleCards.length}`);
  console.log(`Hidden cards: ${cards.length - visibleCards.length}`);
  
  return {
    total: cards.length,
    visible: visibleCards.length,
    hidden: cards.length - visibleCards.length,
    cards: Array.from(cards).map(card => ({
      visible: card.getBoundingClientRect().width > 0,
      suit: card.dataset.cardSuit,
      rank: card.dataset.cardRank,
      faceDown: card.dataset.faceDown
    }))
  };
};

console.log('\n💡 Run window.debugCards() in console to check card status anytime');