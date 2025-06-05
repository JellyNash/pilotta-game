import { createPotpieService } from '../services/potpieApi';
import { PotpieAgent } from '../types/potpie';

// Comprehensive analysis of the Pilotta game codebase using Potpie

const potpie = createPotpieService(import.meta.env.VITE_POTPIE_API_KEY);

export async function runComprehensiveAnalysis() {
  console.log('🔍 Starting Potpie Analysis of Pilotta Game...\n');
  
  try {
    // Step 1: Parse the repository
    console.log('📦 Parsing repository...');
    const { project_id } = await potpie.parseRepository('JellyNash/pilotta-game', 'main');
    
    // Wait for parsing completion
    console.log('⏳ Waiting for analysis to complete...');
    await potpie.waitForProjectReady(project_id);
    
    // Save project ID for future use
    localStorage.setItem('potpie_project_id', project_id);
    
    console.log('✅ Repository parsed successfully!\n');
    
    // Step 2: Analyze Architecture
    console.log('🏗️ ANALYZING ARCHITECTURE...');
    const architectureAnalysis = await potpie.askCodebaseQuestion(
      project_id,
      `Analyze the architecture of this Pilotta card game. What are the main components, 
      how do they interact, and what design patterns are used? Focus on:
      1. State management with Redux
      2. AI system architecture
      3. Component organization
      4. Game flow control`
    );
    console.log('Architecture Insights:', architectureAnalysis);
    
    // Step 3: AI System Deep Dive
    console.log('\n🤖 ANALYZING AI SYSTEM...');
    const aiAnalysis = await potpie.askCodebaseQuestion(
      project_id,
      `Provide a detailed analysis of the AI system in this game:
      1. How does the MCTS (Monte Carlo Tree Search) implementation work?
      2. What are the differences between AI personalities (Conservative, Aggressive, Balanced, Adaptive)?
      3. How does the AI make bidding and card playing decisions?
      4. What are potential improvements to the AI strategy?`
    );
    console.log('AI System Analysis:', aiAnalysis);
    
    // Step 4: Performance Analysis
    console.log('\n⚡ ANALYZING PERFORMANCE...');
    const performanceAnalysis = await potpie.askCodebaseQuestion(
      project_id,
      `Analyze performance aspects of this codebase:
      1. What optimizations are already implemented (memoization, animations)?
      2. Are there any potential performance bottlenecks?
      3. How is the responsive design system implemented?
      4. What could be improved for better performance?`
    );
    console.log('Performance Analysis:', performanceAnalysis);
    
    // Step 5: Code Quality Assessment
    console.log('\n📊 ASSESSING CODE QUALITY...');
    const codeQualityAnalysis = await potpie.askCodebaseQuestion(
      project_id,
      `Assess the code quality and maintainability:
      1. What are the strengths of the current implementation?
      2. Are there any code smells or technical debt?
      3. How well is TypeScript utilized?
      4. What refactoring opportunities exist?`
    );
    console.log('Code Quality Assessment:', codeQualityAnalysis);
    
    // Step 6: Testing Strategy
    console.log('\n🧪 ANALYZING TESTING NEEDS...');
    const testingAnalysis = await potpie.generateUnitTests(
      project_id,
      `Analyze the current testing situation and suggest a comprehensive testing strategy for:
      1. Game rules and logic
      2. AI decision making
      3. State management
      4. UI components
      What are the most critical areas that need test coverage?`
    );
    console.log('Testing Strategy:', testingAnalysis);
    
    // Step 7: Feature Opportunities
    console.log('\n💡 IDENTIFYING FEATURE OPPORTUNITIES...');
    const { conversation_id } = await potpie.createConversation(
      project_id,
      PotpieAgent.LowLevelDesign
    );
    
    const featureAnalysis = await potpie.sendMessage(
      conversation_id,
      `Based on the current implementation, what are the top 5 feature opportunities that would enhance the game? Consider:
      1. Multiplayer capabilities
      2. Tournament modes
      3. Statistics tracking
      4. Tutorial improvements
      5. AI training modes`
    );
    console.log('Feature Opportunities:', featureAnalysis);
    
    // Step 8: Security & Best Practices
    console.log('\n🔒 CHECKING SECURITY & BEST PRACTICES...');
    const securityAnalysis = await potpie.askCodebaseQuestion(
      project_id,
      `Review the codebase for security and best practices:
      1. Are there any security concerns?
      2. Is sensitive data properly handled?
      3. Are React best practices followed?
      4. How well does it follow TypeScript conventions?`
    );
    console.log('Security & Best Practices:', securityAnalysis);
    
    // Step 9: Documentation Assessment
    console.log('\n📚 ASSESSING DOCUMENTATION...');
    const docAnalysis = await potpie.askCodebaseQuestion(
      project_id,
      `Evaluate the documentation quality:
      1. How comprehensive is the current documentation?
      2. What areas need better documentation?
      3. Is the code self-documenting?
      4. Are there enough inline comments where needed?`
    );
    console.log('Documentation Assessment:', docAnalysis);
    
    // Step 10: Generate Improvement Roadmap
    console.log('\n🗺️ GENERATING IMPROVEMENT ROADMAP...');
    const roadmapAnalysis = await potpie.analyzeCodeChanges(
      project_id,
      `Based on all the analysis, create a prioritized roadmap for improving this Pilotta game codebase. 
      Include quick wins, medium-term improvements, and long-term architectural changes.`
    );
    console.log('Improvement Roadmap:', roadmapAnalysis);
    
    // Generate summary report
    console.log('\n📋 ANALYSIS COMPLETE!');
    console.log('='.repeat(50));
    console.log('Summary of findings will be saved to localStorage');
    
    const analysisResults = {
      timestamp: new Date().toISOString(),
      projectId: project_id,
      architecture: architectureAnalysis,
      aiSystem: aiAnalysis,
      performance: performanceAnalysis,
      codeQuality: codeQualityAnalysis,
      testing: testingAnalysis,
      features: featureAnalysis,
      security: securityAnalysis,
      documentation: docAnalysis,
      roadmap: roadmapAnalysis
    };
    
    localStorage.setItem('potpie_analysis_results', JSON.stringify(analysisResults));
    
    return analysisResults;
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    throw error;
  }
}

// Run specific targeted analyses
export async function analyzeSpecificArea(area: 'ai' | 'performance' | 'architecture' | 'bugs') {
  const projectId = localStorage.getItem('potpie_project_id');
  if (!projectId) {
    throw new Error('No project ID found. Run comprehensive analysis first.');
  }
  
  switch (area) {
    case 'ai':
      return potpie.askCodebaseQuestion(
        projectId,
        'Deep dive into the AI implementation: How can we improve the AI to be more challenging and realistic?'
      );
    
    case 'performance':
      return potpie.askCodebaseQuestion(
        projectId,
        'Identify the top 5 performance bottlenecks and suggest specific optimizations with code examples.'
      );
    
    case 'architecture':
      return potpie.askCodebaseQuestion(
        projectId,
        'Suggest architectural improvements to make the codebase more scalable and maintainable.'
      );
    
    case 'bugs':
      return potpie.debugError(
        projectId,
        'Analyze the codebase for potential bugs, edge cases, and error-prone patterns.'
      );
  }
}

// Export function to display results
export function displayAnalysisResults() {
  const results = localStorage.getItem('potpie_analysis_results');
  if (results) {
    const parsed = JSON.parse(results);
    console.log('📊 Previous Analysis Results:', parsed);
    return parsed;
  }
  return null;
}