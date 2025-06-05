export enum PotpieAgent {
  CodebaseQA = 'codebase_qna_agent',
  Debugging = 'debugging_agent',
  UnitTest = 'unit_test_agent',
  IntegrationTest = 'integration_test_agent',
  LowLevelDesign = 'LLD_agent',
  CodeChanges = 'code_changes_agent',
  CodeGeneration = 'code_generation_agent'
}

export interface PotpieProject {
  project_id: string;
  repo_name: string;
  branch_name: string;
  status: 'parsing' | 'ready' | 'failed';
  created_at?: string;
}

export interface PotpieConversation {
  conversation_id: string;
  project_ids: string[];
  agent_ids: string[];
  created_at?: string;
}

export interface PotpieMessage {
  message_id?: string;
  conversation_id: string;
  content: string;
  response?: string;
  created_at?: string;
  metadata?: Record<string, any>;
}

export interface PotpieError {
  error: string;
  message: string;
  status_code: number;
}