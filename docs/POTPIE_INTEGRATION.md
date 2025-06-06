# Potpie API Integration Guide

## Overview

This guide explains how to use the Potpie API integration in the Pilotta game codebase. Potpie provides AI-powered agents that can help with code understanding, debugging, test generation, and more.

## Setup

1. **API Key Configuration**
   - Your API key is stored in the `.env` file
   - The key is accessed via `import.meta.env.VITE_POTPIE_API_KEY`
   - Never commit the `.env` file to version control

2. **Service Location**
   - Main service: `/src/services/potpieApi.ts`
   - Type definitions: `/src/types/potpie.ts`
   - Examples: `/src/services/potpie-examples.ts`

## Available Agents

### 1. Codebase Q&A Agent (`codebase_qna_agent`)
- Ask questions about the codebase
- Understand game mechanics and architecture
- Get explanations of complex logic

### 2. Debugging Agent (`debugging_agent`)
- Analyze stack traces
- Get root cause analysis
- Receive debugging suggestions

### 3. Unit Test Agent (`unit_test_agent`)
- Generate unit tests for game components
- Create test cases for AI strategies
- Test game rules and logic

### 4. Integration Test Agent (`integration_test_agent`)
- Generate integration tests
- Test game flow scenarios
- Verify component interactions

### 5. Low-Level Design Agent (`LLD_agent`)
- Design new features
- Create implementation plans
- Architecture recommendations

### 6. Code Changes Agent (`code_changes_agent`)
- Analyze impact of changes
- Identify affected components
- Suggest improvements

### 7. Code Generation Agent (`code_generation_agent`)
- Generate boilerplate code
- Create new components
- Implement features

## Usage Examples

### Basic Usage

```typescript
import { createPotpieService } from './services/potpieApi';

const potpie = createPotpieService(import.meta.env.VITE_POTPIE_API_KEY);

// Parse repository
const { project_id } = await potpie.parseRepository('your-username/pilotta-game', 'main');

// Wait for parsing
await potpie.waitForProjectReady(project_id);

// Ask a question
const answer = await potpie.askCodebaseQuestion(
  project_id,
  'How does the MCTS AI strategy work?'
);
```

### Debug an Error

```typescript
try {
  // Your game code
} catch (error) {
  const analysis = await potpie.debugError(
    project_id,
    error.stack
  );
  console.log('Debug analysis:', analysis);
}
```

### Generate Tests

```typescript
const tests = await potpie.generateUnitTests(
  project_id,
  'Generate tests for the card sorting algorithm in cardSortUtils.ts'
);
```

## DevTools Integration

In development mode, Potpie is available in the browser console:

```javascript
// Ask about the codebase
await window.potpie.ask('What AI personalities are available?');

// Debug an error
await window.potpie.debug('TypeError: Cannot read property of undefined');

// Generate tests
await window.potpie.generateTests('Tests for bidding interface');
```

## Best Practices

1. **Project Parsing**
   - Parse once and store the project ID
   - Reuse the project ID for multiple queries
   - Re-parse after major code changes

2. **Error Handling**
   - Always wrap API calls in try-catch blocks
   - Handle network errors gracefully
   - Provide fallbacks for production

3. **Performance**
   - Cache project IDs in localStorage
   - Don't call APIs in hot code paths
   - Use for development and debugging

4. **Security**
   - Never expose API keys in client code
   - Use environment variables
   - Restrict usage to development environments

## Integration Points

### 1. Game Development
- Understanding complex game rules
- Debugging AI behavior
- Analyzing performance issues

### 2. Testing
- Generate test cases for new features
- Create integration test scenarios
- Validate game logic

### 3. Documentation
- Generate documentation from code
- Explain game mechanics
- Create onboarding guides

### 4. Code Review
- Analyze changes before committing
- Identify potential issues
- Suggest improvements

## Limitations

- Potpie analyzes code, not gameplay
- Real-time game AI decisions should use existing AI system
- API calls have latency, not suitable for game loops
- Best used for development, testing, and debugging

## Future Enhancements

1. **VSCode Extension Integration**
   - Direct IDE support
   - Inline suggestions
   - Quick fixes

2. **CI/CD Integration**
   - Automated code analysis
   - PR reviews
   - Test generation

3. **Custom Agents**
   - Game-specific agents
   - Domain knowledge integration
   - Specialized analysis
