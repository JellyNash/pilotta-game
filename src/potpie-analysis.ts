import { PotpieAPIService } from './services/potpieApi';
import { PotpieAgent } from './types/potpie';

// Initialize Potpie API
const potpieApi = new PotpieAPIService(import.meta.env.VITE_POTPIE_API_KEY);

// GitHub repository details
const REPO_NAME = 'JellyNash/pilotta-game';
const BRANCH_NAME = 'main';

export async function analyzePilottaGame() {
  console.log('🔍 Starting Potpie analysis of Pilotta Game...\n');

  try {
    // Step 1: Parse the repository
    console.log('📦 Parsing repository...');
    const { project_id } = await potpieApi.parseRepository(REPO_NAME, BRANCH_NAME);
    console.log(`✅ Repository parsed successfully! Project ID: ${project_id}\n`);

    // Store project ID for future use
    localStorage.setItem('potpie_project_id', project_id);

    // Step 2: Get project details
    console.log('📊 Fetching project details...');
    const project = await potpieApi.getProject(project_id);
    console.log(`✅ Project: ${project.repo_name}`);
    console.log(`   Branch: ${project.branch_name}`);
    console.log(`   Total files: ${project.total_files}`);
    console.log(`   Status: ${project.status}\n`);

    // Step 3: Create conversations for different analyses
    console.log('💬 Creating analysis conversations...\n');

    // Architecture Analysis
    console.log('🏗️  Analyzing architecture...');
    const archConv = await potpieApi.createConversation(
      project_id,
      PotpieAgent.CodebaseQA,
      'Architecture Analysis'
    );
    
    const archAnalysis = await potpieApi.sendMessage(
      project_id,
      archConv.conversation_id,
      PotpieAgent.CodebaseQA,
      `Analyze the architecture of this Pilotta card game. Focus on:
      1. Overall architecture patterns and design decisions
      2. State management with Redux
      3. Component hierarchy and organization
      4. Game logic implementation
      5. AI player implementation
      6. Any architectural improvements needed`
    );
    console.log('Architecture Analysis:', archAnalysis.response.answer);
    console.log('\n---\n');

    // Performance Analysis
    console.log('⚡ Analyzing performance...');
    const perfConv = await potpieApi.createConversation(
      project_id,
      PotpieAgent.Debugging,
      'Performance Analysis'
    );
    
    const perfAnalysis = await potpieApi.sendMessage(
      project_id,
      perfConv.conversation_id,
      PotpieAgent.Debugging,
      `Analyze potential performance issues in this React-based card game:
      1. Component re-rendering issues
      2. Memory leaks or inefficient memory usage
      3. Animation performance
      4. State management optimization opportunities
      5. Bundle size concerns`
    );
    console.log('Performance Analysis:', perfAnalysis.response.answer);
    console.log('\n---\n');

    // Code Quality Analysis
    console.log('🎯 Analyzing code quality...');
    const qualityConv = await potpieApi.createConversation(
      project_id,
      PotpieAgent.CodeReview,
      'Code Quality Review'
    );
    
    const qualityAnalysis = await potpieApi.sendMessage(
      project_id,
      qualityConv.conversation_id,
      PotpieAgent.CodeReview,
      `Review the code quality and suggest improvements:
      1. Code duplication issues
      2. Type safety improvements
      3. Error handling gaps
      4. Code organization and modularity
      5. Best practices violations`
    );
    console.log('Code Quality Analysis:', qualityAnalysis.response.answer);
    console.log('\n---\n');

    // Bug Detection
    console.log('🐛 Detecting potential bugs...');
    const bugConv = await potpieApi.createConversation(
      project_id,
      PotpieAgent.Debugging,
      'Bug Detection'
    );
    
    const bugAnalysis = await potpieApi.sendMessage(
      project_id,
      bugConv.conversation_id,
      PotpieAgent.Debugging,
      `Identify potential bugs or issues in the codebase:
      1. Game rule implementation issues
      2. State synchronization problems
      3. UI/UX bugs
      4. Edge cases not handled
      5. Concurrency or timing issues`
    );
    console.log('Bug Analysis:', bugAnalysis.response.answer);
    console.log('\n---\n');

    // Testing Strategy
    console.log('🧪 Suggesting testing strategy...');
    const testConv = await potpieApi.createConversation(
      project_id,
      PotpieAgent.UnitTest,
      'Testing Strategy'
    );
    
    const testAnalysis = await potpieApi.sendMessage(
      project_id,
      testConv.conversation_id,
      PotpieAgent.UnitTest,
      `Suggest a comprehensive testing strategy:
      1. Critical components that need unit tests
      2. Game logic test scenarios
      3. Integration test requirements
      4. E2E test scenarios for gameplay
      5. Performance test recommendations`
    );
    console.log('Testing Strategy:', testAnalysis.response.answer);
    console.log('\n---\n');

    // CSS Analysis
    console.log('🎨 Analyzing CSS issues...');
    const cssConv = await potpieApi.createConversation(
      project_id,
      PotpieAgent.CodeReview,
      'CSS Analysis'
    );
    
    const cssAnalysis = await potpieApi.sendMessage(
      project_id,
      cssConv.conversation_id,
      PotpieAgent.CodeReview,
      `Analyze CSS issues in this codebase:
      1. Find all uses of !important and suggest refactoring
      2. Identify CSS specificity conflicts and overrides
      3. Find responsive design issues and overflow problems
      4. Detect z-index conflicts and stacking context issues
      5. Identify unused CSS and redundant declarations
      6. Check for CSS performance problems
      7. Review CSS architecture and maintainability`
    );
    console.log('CSS Analysis:', cssAnalysis.response.answer);
    console.log('\n---\n');

    console.log('✅ Potpie analysis complete!');
    
    return {
      projectId: project_id,
      analyses: {
        architecture: archAnalysis.response.answer,
        performance: perfAnalysis.response.answer,
        codeQuality: qualityAnalysis.response.answer,
        bugs: bugAnalysis.response.answer,
        testing: testAnalysis.response.answer,
        css: cssAnalysis.response.answer
      }
    };

  } catch (error) {
    console.error('❌ Error during Potpie analysis:', error);
    throw error;
  }
}

// Run analysis if this file is executed directly
if (import.meta.env.DEV) {
  analyzePilottaGame().catch(console.error);
}