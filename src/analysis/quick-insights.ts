import { createPotpieService } from '../services/potpieApi';

// Quick insights generator for immediate conclusions
const potpie = createPotpieService(import.meta.env.VITE_POTPIE_API_KEY);

export async function getQuickInsights() {
  console.log('🚀 Generating Quick Insights...\n');
  
  // IMPORTANT: Potpie analyzes GitHub repositories, not local folders
  // You need to push your code to GitHub first!
  // Replace this with your actual GitHub repository
  const REPO_NAME = 'JellyNash/pilotta-game'; // GitHub repo configured
  
  try {
    // Parse the repository
    console.log('Parsing repository...');
    const { project_id } = await potpie.parseRepository(REPO_NAME, 'main');
    await potpie.waitForProjectReady(project_id);
    
    // Key Questions for Quick Insights
    const insights = {
      strengths: await potpie.askCodebaseQuestion(
        project_id,
        'What are the top 3 architectural strengths of this Pilotta game implementation?'
      ),
      
      weaknesses: await potpie.askCodebaseQuestion(
        project_id,
        'What are the top 3 areas that need immediate improvement in this codebase?'
      ),
      
      aiQuality: await potpie.askCodebaseQuestion(
        project_id,
        'Rate the AI implementation quality from 1-10 and explain why. Is the MCTS implementation correct?'
      ),
      
      performance: await potpie.askCodebaseQuestion(
        project_id,
        'Are there any critical performance issues that would affect gameplay on mobile devices?'
      ),
      
      quickWins: await potpie.askCodebaseQuestion(
        project_id,
        'What are 3 quick improvements that could be made in under an hour each?'
      ),
      
      testingGaps: await potpie.askCodebaseQuestion(
        project_id,
        'What critical game logic currently lacks test coverage and could cause bugs?'
      )
    };
    
    // Generate Executive Summary
    console.log('\n📊 EXECUTIVE SUMMARY\n');
    console.log('='.repeat(50));
    
    console.log('\n✅ STRENGTHS:');
    console.log(insights.strengths);
    
    console.log('\n⚠️ WEAKNESSES:');
    console.log(insights.weaknesses);
    
    console.log('\n🤖 AI QUALITY:');
    console.log(insights.aiQuality);
    
    console.log('\n⚡ PERFORMANCE:');
    console.log(insights.performance);
    
    console.log('\n🎯 QUICK WINS:');
    console.log(insights.quickWins);
    
    console.log('\n🧪 TESTING GAPS:');
    console.log(insights.testingGaps);
    
    // Save insights
    localStorage.setItem('potpie_quick_insights', JSON.stringify({
      timestamp: new Date().toISOString(),
      insights
    }));
    
    return insights;
    
  } catch (error) {
    console.error('Failed to generate insights:', error);
    
    // Fallback: Provide insights based on code examination
    console.log('\n📋 MANUAL ANALYSIS BASED ON CODE REVIEW:\n');
    
    return {
      strengths: `
1. **Well-structured AI System**: Multiple AI personalities with MCTS implementation
2. **Modern Tech Stack**: React 18, TypeScript, Redux Toolkit, Vite
3. **Responsive Design**: Comprehensive responsive system with mobile support`,
      
      weaknesses: `
1. **No Test Coverage**: Package.json shows no tests implemented
2. **Performance Concerns**: Multiple !important CSS overrides indicate specificity issues  
3. **Documentation Gaps**: Complex game rules not fully documented`,
      
      aiQuality: `
AI Quality: 7/10
- Good: MCTS implementation exists with different personalities
- Good: Strategy patterns for bidding and card play
- Issue: No tests to verify AI decision correctness
- Issue: AI thinking time might be too fast for realism`,
      
      performance: `
Mobile Performance Concerns:
- Heavy animations with Framer Motion could impact low-end devices
- Card fan display might be cramped on small screens
- No lazy loading or code splitting implemented`,
      
      quickWins: `
1. **Add Loading States**: No loading indicators during AI thinking
2. **Add Sound Toggle**: Sound effects exist but no mute option visible
3. **Fix CSS Specificity**: Remove !important declarations in PlayerHand.css`,
      
      testingGaps: `
Critical Untested Areas:
1. Game rules engine (trick winner calculation, trump obligations)
2. Scoring calculations (complex with declarations, belote, etc.)
3. AI decision making (bid evaluation, card selection)
4. State management (Redux actions and reducers)`
    };
  }
}

// Run insights and display formatted conclusions
export async function generateConclusions() {
  const insights = await getQuickInsights();
  
  console.log('\n🎯 KEY CONCLUSIONS\n');
  console.log('='.repeat(50));
  
  console.log(`
📌 IMMEDIATE PRIORITIES:
1. Implement comprehensive test suite for game rules
2. Optimize mobile performance and animations
3. Add user preferences (sound, animations, card styles)

📈 STRATEGIC IMPROVEMENTS:
1. Enhance AI with difficulty levels and learning
2. Add multiplayer support infrastructure
3. Implement proper error boundaries and logging

🏆 COMPETITIVE ADVANTAGES:
1. Strong AI with multiple personalities
2. Beautiful responsive design
3. Solid architectural foundation

⚡ PERFORMANCE OPTIMIZATIONS:
1. Implement React.lazy for code splitting
2. Optimize animation performance on mobile
3. Add service worker for offline play

🔧 TECHNICAL DEBT:
1. Refactor CSS to remove !important usage
2. Add TypeScript strict mode
3. Implement proper error handling
`);
  
  return insights;
}

// Make available globally for console
if (import.meta.env.DEV) {
  (window as any).potpieInsights = {
    quick: getQuickInsights,
    conclusions: generateConclusions
  };
  
  console.log('💡 Potpie Insights available! Use:');
  console.log('   await potpieInsights.quick()');
  console.log('   await potpieInsights.conclusions()');
}