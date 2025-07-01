export interface WhatsAppMessage {
  id: string;
  from: string;
  timestamp: number;
  text: {
    body: string;
  };
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
}

export interface ProcessedMessage {
  id: string;
  recipientNumber: string;
  timestamp: number;
  input: string;
  output?: string;
  type: 'greeting' | 'small_talk' | 'product_inquiry' | 'question' | 'follow_up';
  intent?: string;
  domain?: 'websites' | 'portfolios' | 'projects' | 'custom_projects';
  priceRange?: string;
  status: 'received' | 'processing' | 'replied' | 'failed';
  responseTime?: number;
  aiModel?: string;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface AutomationMetrics {
  totalMessages: number;
  autoReplies: number;
  responseRate: number;
  avgResponseTime: number;
  categoryCounts: {
    websites: number;
    portfolios: number;
    projects: number;
    customProjects: number;
    other: number;
  };
  hourlyStats: Array<{
    hour: number;
    messages: number;
    replies: number;
  }>;
  aiMetrics: {
    totalTokensUsed: number;
    avgTokensPerResponse: number;
    modelUsage: {
      [model: string]: number;
    };
    costEstimate: number;
  };
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'success' | 'error' | 'waiting';
  startedAt: string;
  finishedAt?: string;
  data: any;
}

export interface N8nWorkflowConfig {
  id: string;
  name: string;
  active: boolean;
  nodes: Array<{
    id: string;
    name: string;
    type: string;
    parameters: any;
  }>;
  connections: any;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AIAgentConfig {
  model: string;
  systemMessage: string;
  temperature?: number;
  maxTokens?: number;
  memoryType: 'buffer' | 'window' | 'summary';
}