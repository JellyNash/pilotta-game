import { PotpieAgent, PotpieProject, PotpieConversation, PotpieMessage } from '../types/potpie';

export class PotpieAPIService {
  private readonly baseUrl = 'https://production-api.potpie.ai';
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: any
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`Potpie API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Parse a repository and get a project ID
   */
  async parseRepository(repoName: string, branchName: string = 'main'): Promise<{ project_id: string }> {
    return this.makeRequest<{ project_id: string }>(
      '/api/v2/parse',
      'POST',
      { repo_name: repoName, branch_name: branchName }
    );
  }

  /**
   * Check the parsing status of a project
   */
  async getParsingStatus(projectId: string): Promise<{ status: string; details?: any }> {
    return this.makeRequest<{ status: string; details?: any }>(
      `/api/v2/parsing-status/${projectId}`
    );
  }

  /**
   * Wait for a project to be ready (polling)
   */
  async waitForProjectReady(projectId: string, maxAttempts: number = 30, delayMs: number = 2000): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const { status } = await this.getParsingStatus(projectId);
      if (status === 'ready') {
        return;
      }
      if (status === 'failed') {
        throw new Error('Project parsing failed');
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    throw new Error('Timeout waiting for project to be ready');
  }

  /**
   * Create a conversation with an agent
   */
  async createConversation(
    projectId: string,
    agentId: PotpieAgent
  ): Promise<{ conversation_id: string }> {
    return this.makeRequest<{ conversation_id: string }>(
      '/api/v2/conversations',
      'POST',
      {
        project_ids: [projectId],
        agent_ids: [agentId]
      }
    );
  }

  /**
   * Send a message to a conversation
   */
  async sendMessage(
    conversationId: string,
    content: string
  ): Promise<PotpieMessage> {
    return this.makeRequest<PotpieMessage>(
      `/api/v2/conversations/${conversationId}/message`,
      'POST',
      { content }
    );
  }

  /**
   * High-level method to ask a question about the codebase
   */
  async askCodebaseQuestion(
    projectId: string,
    question: string
  ): Promise<PotpieMessage> {
    const { conversation_id } = await this.createConversation(projectId, PotpieAgent.CodebaseQA);
    return this.sendMessage(conversation_id, question);
  }

  /**
   * High-level method to debug an error
   */
  async debugError(
    projectId: string,
    errorStackTrace: string
  ): Promise<PotpieMessage> {
    const { conversation_id } = await this.createConversation(projectId, PotpieAgent.Debugging);
    return this.sendMessage(conversation_id, errorStackTrace);
  }

  /**
   * High-level method to generate unit tests
   */
  async generateUnitTests(
    projectId: string,
    codeDescription: string
  ): Promise<PotpieMessage> {
    const { conversation_id } = await this.createConversation(projectId, PotpieAgent.UnitTest);
    return this.sendMessage(conversation_id, codeDescription);
  }

  /**
   * High-level method to analyze code changes
   */
  async analyzeCodeChanges(
    projectId: string,
    changesDescription: string
  ): Promise<PotpieMessage> {
    const { conversation_id } = await this.createConversation(projectId, PotpieAgent.CodeChanges);
    return this.sendMessage(conversation_id, changesDescription);
  }
}

// Export a singleton instance if API key is available
export const createPotpieService = (apiKey: string): PotpieAPIService => {
  return new PotpieAPIService(apiKey);
};