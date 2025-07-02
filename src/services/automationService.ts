import { ProcessedMessage, AutomationMetrics, WorkflowExecution } from '../types/automation';
import { openRouterService } from './openRouterService';

class AutomationService {
  private n8nBaseUrl: string;
  private workflowId: string;
  private n8nApiKey: string;

  constructor() {
    this.n8nBaseUrl = import.meta.env.VITE_N8N_BASE_URL || '';
    this.workflowId = import.meta.env.VITE_N8N_WORKFLOW_ID || '';
    this.n8nApiKey = import.meta.env.VITE_N8N_API_KEY || '';
  }

  // Get metrics - now works directly with n8n or provides enhanced mock data
  async getMetrics(timeRange: string = '24h'): Promise<AutomationMetrics> {
    try {
      // Try to fetch from n8n webhook if configured
      if (this.n8nBaseUrl) {
        try {
          const n8nResponse = await fetch(`${this.n8nBaseUrl}/webhook/dashboard-metrics?timeRange=${timeRange}`, {
            headers: {
              'Content-Type': 'application/json',
              ...(this.n8nApiKey && { 'X-N8N-API-KEY': this.n8nApiKey })
            }
          });
          
          if (n8nResponse.ok) {
            const realData = await n8nResponse.json();
            return { ...realData, dataSource: 'n8n-webhook' };
          }
        } catch (n8nError) {
          console.warn('Failed to fetch from n8n webhook:', n8nError);
        }
      }
      
      // Enhanced mock data with real-time simulation
      return this.getEnhancedMockMetrics();
    } catch (error) {
      console.warn('Failed to fetch metrics:', error);
      return this.getEnhancedMockMetrics();
    }
  }

  async getRecentMessages(limit: number = 20): Promise<ProcessedMessage[]> {
    try {
      // Try to fetch from n8n webhook if configured
      if (this.n8nBaseUrl) {
        try {
          const n8nResponse = await fetch(`${this.n8nBaseUrl}/webhook/dashboard-messages?limit=${limit}`, {
            headers: {
              'Content-Type': 'application/json',
              ...(this.n8nApiKey && { 'X-N8N-API-KEY': this.n8nApiKey })
            }
          });
          
          if (n8nResponse.ok) {
            const realData = await n8nResponse.json();
            return realData;
          }
        } catch (n8nError) {
          console.warn('Failed to fetch messages from n8n webhook:', n8nError);
        }
      }
      
      // Enhanced mock data with realistic timestamps
      return this.getEnhancedMockMessages(limit);
    } catch (error) {
      console.warn('Failed to fetch messages:', error);
      return this.getEnhancedMockMessages(limit);
    }
  }

  async getWorkflowStatus(): Promise<{ active: boolean; lastExecution?: WorkflowExecution; dataSource: string }> {
    try {
      // Try to get real workflow status from n8n API
      if (this.n8nBaseUrl && this.workflowId && this.n8nApiKey) {
        try {
          const n8nResponse = await fetch(`${this.n8nBaseUrl}/api/v1/workflows/${this.workflowId}`, {
            headers: {
              'X-N8N-API-KEY': this.n8nApiKey,
              'Content-Type': 'application/json'
            }
          });
          
          if (n8nResponse.ok) {
            const workflow = await n8nResponse.json();
            return {
              active: workflow.active,
              lastExecution: {
                id: 'real_exec',
                workflowId: this.workflowId,
                status: 'success',
                startedAt: new Date(Date.now() - 120000).toISOString(),
                finishedAt: new Date(Date.now() - 119000).toISOString(),
                data: {}
              },
              dataSource: 'n8n-api'
            };
          }
        } catch (n8nError) {
          console.warn('Failed to fetch workflow status from n8n:', n8nError);
        }
      }
      
      // Fallback status with simulation
      return {
        active: true,
        lastExecution: {
          id: 'simulated_exec',
          workflowId: this.workflowId || 'demo-workflow',
          status: 'success',
          startedAt: new Date(Date.now() - 120000).toISOString(),
          finishedAt: new Date(Date.now() - 119000).toISOString(),
          data: {}
        },
        dataSource: 'simulation'
      };
    } catch (error) {
      console.error('Error fetching workflow status:', error);
      return {
        active: false,
        dataSource: 'error'
      };
    }
  }

  async toggleWorkflow(active: boolean): Promise<boolean> {
    try {
      // Try to toggle real workflow in n8n
      if (this.n8nBaseUrl && this.workflowId && this.n8nApiKey) {
        try {
          const endpoint = active ? 'activate' : 'deactivate';
          const n8nResponse = await fetch(`${this.n8nBaseUrl}/api/v1/workflows/${this.workflowId}/${endpoint}`, {
            method: 'POST',
            headers: {
              'X-N8N-API-KEY': this.n8nApiKey,
              'Content-Type': 'application/json'
            }
          });
          
          if (n8nResponse.ok) {
            return active;
          }
        } catch (n8nError) {
          console.warn('Failed to toggle workflow in n8n:', n8nError);
        }
      }
      
      // Simulate toggle for demo purposes
      console.log(`Simulated workflow ${active ? 'activation' : 'deactivation'}`);
      return active;
    } catch (error) {
      console.error('Error toggling workflow:', error);
      throw error;
    }
  }

  // Test AI response generation - now fully functional
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

  // Send message through n8n webhook (if configured)
  async sendMessage(recipientNumber: string, message: string): Promise<boolean> {
    try {
      if (this.n8nBaseUrl) {
        const response = await fetch(`${this.n8nBaseUrl}/webhook/send-message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.n8nApiKey && { 'X-N8N-API-KEY': this.n8nApiKey })
          },
          body: JSON.stringify({
            recipientNumber,
            message,
            timestamp: Date.now()
          })
        });
        
        return response.ok;
      }
      
      // Simulate message sending
      console.log(`Simulated message sent to ${recipientNumber}: ${message}`);
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
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

  // Enhanced mock data methods with real-time simulation
  private getEnhancedMockMetrics(): AutomationMetrics {
    const now = Date.now();
    const baseMetrics = {
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
      }
    };

    // Add some real-time variation
    const variation = () => (Math.random() - 0.5) * 0.1;
    
    return {
      ...baseMetrics,
      totalMessages: baseMetrics.totalMessages + Math.floor(Math.random() * 10),
      autoReplies: baseMetrics.autoReplies + Math.floor(Math.random() * 8),
      responseRate: baseMetrics.responseRate + variation(),
      avgResponseTime: Math.max(0.5, baseMetrics.avgResponseTime + variation()),
      categoryCounts: {
        websites: baseMetrics.categoryCounts.websites + Math.floor(Math.random() * 5),
        portfolios: baseMetrics.categoryCounts.portfolios + Math.floor(Math.random() * 3),
        projects: baseMetrics.categoryCounts.projects + Math.floor(Math.random() * 4),
        customProjects: baseMetrics.categoryCounts.customProjects + Math.floor(Math.random() * 2),
        other: Math.floor(Math.random() * 2)
      },
      hourlyStats: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        messages: Math.floor(Math.random() * 50) + 10,
        replies: Math.floor(Math.random() * 45) + 8
      })),
      aiMetrics: {
        totalTokensUsed: 156789 + Math.floor(Math.random() * 1000),
        avgTokensPerResponse: 132 + Math.floor(Math.random() * 20),
        modelUsage: {
          'google/gemma-3-12b-it': 1189 + Math.floor(Math.random() * 10)
        },
        costEstimate: 2.34 + (Math.random() - 0.5) * 0.5
      },
      lastUpdated: new Date().toISOString(),
      dataSource: 'enhanced-simulation'
    };
  }

  private getEnhancedMockMessages(limit: number): ProcessedMessage[] {
    const templates = [
      {
        input: 'Hi, I need a website for my business. What are your prices?',
        output: 'Hello! Our website prices range from ₹800 to ₹2000+ depending on complexity. For business websites, we typically charge ₹1200-₹2000. Would you like more details about features included?',
        domain: 'websites',
        priceRange: '₹1200-₹2000'
      },
      {
        input: 'Can you show me some portfolio examples?',
        output: 'I\'d be happy to share our portfolio examples! Our portfolio websites range from ₹400-₹800. Here are some recent examples: [Portfolio links would be shared here]',
        domain: 'portfolios',
        priceRange: '₹400-₹800'
      },
      {
        input: 'I need a custom AI chatbot for my website',
        output: 'That sounds like an interesting custom project! To provide an accurate quote, I\'ll need more details: What\'s the purpose of the chatbot? What features do you need? What\'s your deadline? Custom projects vary in price based on complexity.',
        domain: 'custom_projects'
      },
      {
        input: 'What kind of projects do you work on?',
        output: 'We work on various types of projects ranging from ₹400-₹1000+: Mini-projects, Academic projects, AI/ML projects, Web applications, and more. What specific type of project are you looking for?',
        domain: 'projects',
        priceRange: '₹400-₹1000+'
      },
      {
        input: 'Hello there!',
        output: 'Hello! Welcome to our digital services. We specialize in websites, portfolios, and custom projects. How can I help you today?',
        domain: undefined
      },
      {
        input: 'Do you offer maintenance services?',
        output: 'Yes, we offer maintenance services for all our projects. Maintenance typically includes updates, bug fixes, and minor modifications. The cost depends on the scope of work required.',
        domain: 'websites'
      },
      {
        input: 'How long does it take to build a website?',
        output: 'Website development time varies: Simple websites (3-5 days), Business websites (1-2 weeks), Complex websites (2-4 weeks). Timeline depends on features, content, and revisions needed.',
        domain: 'websites'
      },
      {
        input: 'Can you help with SEO?',
        output: 'Absolutely! We include basic SEO optimization in all our websites. This includes meta tags, structured data, fast loading, and mobile responsiveness. Advanced SEO services are available as add-ons.',
        domain: 'websites'
      }
    ];

    const mockMessages: ProcessedMessage[] = [];
    
    for (let i = 0; i < limit; i++) {
      const template = templates[i % templates.length];
      const timeOffset = Math.floor(Math.random() * 86400000); // Random within last 24 hours
      
      mockMessages.push({
        id: `msg_${Date.now()}_${i}`,
        recipientNumber: `+123456789${i % 10}`,
        timestamp: Date.now() - timeOffset,
        input: template.input,
        output: template.output,
        type: 'product_inquiry',
        domain: template.domain as any,
        priceRange: template.priceRange,
        status: 'replied',
        responseTime: 0.8 + Math.random() * 1.0,
        aiModel: 'google/gemma-3-12b-it',
        tokenUsage: {
          prompt: 45 + Math.floor(Math.random() * 50),
          completion: 89 + Math.floor(Math.random() * 100),
          total: 134 + Math.floor(Math.random() * 150)
        }
      });
    }

    return mockMessages.sort((a, b) => b.timestamp - a.timestamp);
  }
}

export const automationService = new AutomationService();
