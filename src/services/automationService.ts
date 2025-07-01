import { ProcessedMessage, AutomationMetrics, WorkflowExecution } from '../types/automation';
import { openRouterService } from './openRouterService';

class AutomationService {
  private baseUrl: string;
  private n8nBaseUrl: string;
  private workflowId: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    this.n8nBaseUrl = import.meta.env.VITE_N8N_BASE_URL || '';
    this.workflowId = import.meta.env.VITE_N8N_WORKFLOW_ID || '';
  }

  // Get real metrics from your API/n8n
  async getMetrics(timeRange: string = '24h'): Promise<AutomationMetrics> {
    try {
      // Try to fetch from your API server first
      const response = await fetch(`${this.baseUrl}/metrics?timeRange=${timeRange}`);
      
      if (response.ok) {
        return await response.json();
      }
      
      // If API server is not available, try direct n8n webhook
      if (this.n8nBaseUrl) {
        const n8nResponse = await fetch(`${this.n8nBaseUrl}/webhook/dashboard-metrics?timeRange=${timeRange}`);
        if (n8nResponse.ok) {
          return await n8nResponse.json();
        }
      }
      
      throw new Error('No data source available');
    } catch (error) {
      console.warn('Failed to fetch real metrics, using fallback data:', error);
      
      // Fallback to mock data with a warning
      return this.getMockMetrics();
    }
  }

  async getRecentMessages(limit: number = 20): Promise<ProcessedMessage[]> {
    try {
      // Try to fetch from your API server first
      const response = await fetch(`${this.baseUrl}/messages?limit=${limit}`);
      
      if (response.ok) {
        return await response.json();
      }
      
      // If API server is not available, try direct n8n webhook
      if (this.n8nBaseUrl) {
        const n8nResponse = await fetch(`${this.n8nBaseUrl}/webhook/dashboard-messages?limit=${limit}`);
        if (n8nResponse.ok) {
          return await n8nResponse.json();
        }
      }
      
      throw new Error('No data source available');
    } catch (error) {
      console.warn('Failed to fetch real messages, using fallback data:', error);
      
      // Fallback to mock data with a warning
      return this.getMockMessages(limit);
    }
  }

  async getWorkflowStatus(): Promise<{ active: boolean; lastExecution?: WorkflowExecution }> {
    try {
      // Try to fetch from your API server first
      const response = await fetch(`${this.baseUrl}/workflow/status`);
      
      if (response.ok) {
        return await response.json();
      }
      
      // If API server is not available, try n8n API directly
      if (this.n8nBaseUrl && this.workflowId) {
        const n8nResponse = await fetch(`${this.n8nBaseUrl}/api/v1/workflows/${this.workflowId}`, {
          headers: {
            'X-N8N-API-KEY': import.meta.env.VITE_N8N_API_KEY || ''
          }
        });
        
        if (n8nResponse.ok) {
          const workflow = await n8nResponse.json();
          return { active: workflow.active };
        }
      }
      
      throw new Error('No data source available');
    } catch (error) {
      console.warn('Failed to fetch workflow status, using fallback:', error);
      
      return {
        active: true,
        lastExecution: {
          id: 'fallback_exec',
          workflowId: this.workflowId,
          status: 'success',
          startedAt: new Date(Date.now() - 120000).toISOString(),
          finishedAt: new Date(Date.now() - 119000).toISOString(),
          data: {}
        }
      };
    }
  }

  async toggleWorkflow(active: boolean): Promise<boolean> {
    try {
      // Try API server first
      const response = await fetch(`${this.baseUrl}/workflow/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.active;
      }
      
      // If API server is not available, try n8n API directly
      if (this.n8nBaseUrl && this.workflowId) {
        const n8nResponse = await fetch(`${this.n8nBaseUrl}/api/v1/workflows/${this.workflowId}/${active ? 'activate' : 'deactivate'}`, {
          method: 'POST',
          headers: {
            'X-N8N-API-KEY': import.meta.env.VITE_N8N_API_KEY || ''
          }
        });
        
        if (n8nResponse.ok) {
          return active;
        }
      }
      
      throw new Error('Failed to toggle workflow');
    } catch (error) {
      console.error('Error toggling workflow:', error);
      throw error;
    }
  }

  // Test AI response generation
  async testAIResponse(message: string): Promise<{
    response: string;
    tokenUsage: { prompt: number; completion: number; total: number };
    responseTime: number;
  }> {
    try {
      return await openRouterService.testBusinessResponse(message);
    } catch (error) {
      throw new Error(`AI response test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get AI usage statistics
  async getAIUsageStats() {
    try {
      return await openRouterService.getUsageStats();
    } catch (error) {
      console.error('Failed to fetch AI usage stats:', error);
      return {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        modelBreakdown: {}
      };
    }
  }

  // Helper method to categorize messages based on your workflow logic
  categorizeMessage(input: string): { domain?: string; type: string; intent?: string } {
    const lowerInput = input.toLowerCase();
    
    // Website-related keywords
    if (lowerInput.includes('website') || lowerInput.includes('site') || lowerInput.includes('web')) {
      return { domain: 'websites', type: 'product_inquiry', intent: 'pricing' };
    }
    
    // Portfolio-related keywords
    if (lowerInput.includes('portfolio') || lowerInput.includes('showcase') || lowerInput.includes('examples')) {
      return { domain: 'portfolios', type: 'product_inquiry', intent: 'examples' };
    }
    
    // Project-related keywords
    if (lowerInput.includes('project') || lowerInput.includes('development') || lowerInput.includes('build')) {
      return { domain: 'projects', type: 'product_inquiry', intent: 'inquiry' };
    }
    
    // Custom project keywords
    if (lowerInput.includes('custom') || lowerInput.includes('ai') || lowerInput.includes('chatbot') || lowerInput.includes('specific')) {
      return { domain: 'custom_projects', type: 'product_inquiry', intent: 'custom_quote' };
    }
    
    // Greeting patterns
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return { type: 'greeting' };
    }
    
    return { type: 'question' };
  }

  // Method to extract price range from AI response
  extractPriceRange(output: string): string | undefined {
    const priceRegex = /₹\d+(?:,\d+)*(?:\s*to\s*₹\d+(?:,\d+)*)?(?:\+)?/g;
    const matches = output.match(priceRegex);
    return matches ? matches[0] : undefined;
  }

  // Mock data methods (fallback)
  private getMockMetrics(): AutomationMetrics {
    return {
      totalMessages: 1247,
      autoReplies: 1189,
      responseRate: 95.3,
      avgResponseTime: 1.2,
      categoryCounts: {
        websites: 456,
        portfolios: 289,
        projects: 312,
        customProjects: 190,
        other: 0
      },
      hourlyStats: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        messages: Math.floor(Math.random() * 50) + 10,
        replies: Math.floor(Math.random() * 45) + 8
      })),
      aiMetrics: {
        totalTokensUsed: 156789,
        avgTokensPerResponse: 132,
        modelUsage: {
          'google/gemma-3-12b-it': 1189
        },
        costEstimate: 2.34
      }
    };
  }

  private getMockMessages(limit: number): ProcessedMessage[] {
    const mockMessages: ProcessedMessage[] = [
      {
        id: '1',
        recipientNumber: '+1234567890',
        timestamp: Date.now() - 120000,
        input: 'Hi, I need a website for my business. What are your prices?',
        output: 'Hello! Our website prices range from ₹800 to ₹2000+ depending on complexity. For business websites, we typically charge ₹1200-₹2000. Would you like more details about features included?',
        type: 'product_inquiry',
        domain: 'websites',
        priceRange: '₹1200-₹2000',
        status: 'replied',
        responseTime: 1.1,
        aiModel: 'google/gemma-3-12b-it',
        tokenUsage: {
          prompt: 89,
          completion: 156,
          total: 245
        }
      },
      {
        id: '2',
        recipientNumber: '+1234567891',
        timestamp: Date.now() - 300000,
        input: 'Can you show me some portfolio examples?',
        output: 'I\'d be happy to share our portfolio examples! Our portfolio websites range from ₹400-₹800. Here are some recent examples: [Portfolio links would be shared here]',
        type: 'product_inquiry',
        domain: 'portfolios',
        priceRange: '₹400-₹800',
        status: 'replied',
        responseTime: 0.9,
        aiModel: 'google/gemma-3-12b-it',
        tokenUsage: {
          prompt: 67,
          completion: 98,
          total: 165
        }
      },
      {
        id: '3',
        recipientNumber: '+1234567892',
        timestamp: Date.now() - 420000,
        input: 'I need a custom AI chatbot for my website',
        output: 'That sounds like an interesting custom project! To provide an accurate quote, I\'ll need more details: What\'s the purpose of the chatbot? What features do you need? What\'s your deadline? Custom projects vary in price based on complexity.',
        type: 'product_inquiry',
        domain: 'custom_projects',
        status: 'replied',
        responseTime: 1.5,
        aiModel: 'google/gemma-3-12b-it',
        tokenUsage: {
          prompt: 78,
          completion: 187,
          total: 265
        }
      },
      {
        id: '4',
        recipientNumber: '+1234567893',
        timestamp: Date.now() - 720000,
        input: 'What kind of projects do you work on?',
        output: 'We work on various types of projects ranging from ₹400-₹1000+: Mini-projects, Academic projects, AI/ML projects, Web applications, and more. What specific type of project are you looking for?',
        type: 'product_inquiry',
        domain: 'projects',
        priceRange: '₹400-₹1000+',
        status: 'replied',
        responseTime: 1.3,
        aiModel: 'google/gemma-3-12b-it',
        tokenUsage: {
          prompt: 56,
          completion: 134,
          total: 190
        }
      },
      {
        id: '5',
        recipientNumber: '+1234567894',
        timestamp: Date.now() - 1080000,
        input: 'Hello there!',
        output: 'Hello! Welcome to our digital services. We specialize in websites, portfolios, and custom projects. How can I help you today?',
        type: 'greeting',
        status: 'replied',
        responseTime: 0.8,
        aiModel: 'google/gemma-3-12b-it',
        tokenUsage: {
          prompt: 45,
          completion: 89,
          total: 134
        }
      }
    ];

    return mockMessages.slice(0, limit);
  }
}

export const automationService = new AutomationService();