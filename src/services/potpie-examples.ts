import { createPotpieService } from './potpieApi';
import { PotpieAgent } from '../types/potpie';

// Example usage of Potpie API for the Pilotta game codebase

// Initialize the service with your API key
const potpieService = createPotpieService(import.meta.env.VITE_POTPIE_API_KEY);

// Example 1: Parse the Pilotta game repository and ask questions
export async function analyzeGameCodebase() {
  try {
    // Parse the repository
    console.log('Parsing repository...');
    const { project_id } = await potpieService.parseRepository('potpie-ai/potpie', 'main');
    
    // Wait for parsing to complete
    console.log('Waiting for parsing to complete...');
    await potpieService.waitForProjectReady(project_id);
    
    // Ask questions about the codebase
    console.log('Asking about game rules...');
    const response = await potpieService.askCodebaseQuestion(
      project_id,
      'How does the bidding system work in the Pilotta game? What are the different AI personalities?'
    );
    
    console.log('Response:', response);
    return response;
  } catch (error) {
    console.error('Error analyzing codebase:', error);
    throw error;
  }
}

// Example 2: Debug a game error
export async function debugGameError(projectId: string, errorStackTrace: string) {
  try {
    const response = await potpieService.debugError(projectId, errorStackTrace);
    console.log('Debugging analysis:', response);
    return response;
  } catch (error) {
    console.error('Error debugging:', error);
    throw error;
  }
}

// Example 3: Generate unit tests for game components
export async function generateGameTests(projectId: string) {
  try {
    const response = await potpieService.generateUnitTests(
      projectId,
      'Generate unit tests for the AIStrategy class that handles bidding and card selection'
    );
    console.log('Generated tests:', response);
    return response;
  } catch (error) {
    console.error('Error generating tests:', error);
    throw error;
  }
}

// Example 4: Analyze code changes before committing
export async function analyzeGameChanges(projectId: string) {
  try {
    const response = await potpieService.analyzeCodeChanges(
      projectId,
      'I modified the card sorting algorithm and added a new AI personality. What is the impact of these changes?'
    );
    console.log('Code change analysis:', response);
    return response;
  } catch (error) {
    console.error('Error analyzing changes:', error);
    throw error;
  }
}

// Example 5: Create a low-level design for a new feature
export async function designNewFeature(projectId: string) {
  try {
    const { conversation_id } = await potpieService.createConversation(
      projectId,
      PotpieAgent.LowLevelDesign
    );
    
    const response = await potpieService.sendMessage(
      conversation_id,
      'Design a tournament mode feature where multiple games are played in succession with different AI opponents'
    );
    
    console.log('Feature design:', response);
    return response;
  } catch (error) {
    console.error('Error creating design:', error);
    throw error;
  }
}

// Example 6: Integration with game error handling
export function integrateWithGameErrorHandler() {
  // You can add this to your global error handler
  window.addEventListener('error', async (event) => {
    if (import.meta.env.DEV) { // Only in development
      try {
        // Get or create a project ID for the current codebase
        const projectId = localStorage.getItem('potpie_project_id');
        if (projectId) {
          const stackTrace = event.error?.stack || event.message;
          await debugGameError(projectId, stackTrace);
        }
      } catch (error) {
        console.error('Failed to send error to Potpie:', error);
      }
    }
  });
}

// Example 7: DevTools integration for quick codebase questions
export function createPotpieDevTool(projectId: string) {
  // Add to window for console access in development
  if (import.meta.env.DEV) {
    (window as any).potpie = {
      ask: async (question: string) => {
        try {
          const response = await potpieService.askCodebaseQuestion(projectId, question);
          console.log(response);
          return response;
        } catch (error) {
          console.error('Potpie error:', error);
          throw error;
        }
      },
      debug: async (error: string) => {
        return debugGameError(projectId, error);
      },
      generateTests: async (description: string) => {
        const response = await potpieService.generateUnitTests(projectId, description);
        return response;
      }
    };
    
    console.log('Potpie DevTools available! Use window.potpie.ask(), window.potpie.debug(), etc.');
  }
}