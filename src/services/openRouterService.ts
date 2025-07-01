import { OpenRouterResponse } from '../types/automation';

class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private model: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    this.model = import.meta.env.VITE_OPENROUTER_MODEL || 'google/gemma-3-12b-it';
  }

  async generateResponse(
    prompt: string, 
    systemMessage?: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<OpenRouterResponse> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const messages = [
      ...(systemMessage ? [{ role: 'system', content: systemMessage }] : []),
      { role: 'user', content: prompt }
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'WhatsApp Automation Dashboard'
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} - ${error.error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  async getModelInfo() {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch model information');
    }

    const data = await response.json();
    return data.data.find((model: any) => model.id === this.model);
  }

  async getUsageStats(startDate?: string, endDate?: string) {
    // This would typically call OpenRouter's usage API if available
    // For now, return mock data based on your workflow
    return {
      totalRequests: 1247,
      totalTokens: 156789,
      totalCost: 2.34,
      modelBreakdown: {
        [this.model]: {
          requests: 1247,
          tokens: 156789,
          cost: 2.34
        }
      }
    };
  }

  // Test the AI response generation with your business context
  async testBusinessResponse(userMessage: string): Promise<{
    response: string;
    tokenUsage: { prompt: number; completion: number; total: number };
    responseTime: number;
  }> {
    const systemMessage = `You are a helpful assistant responsible for replying to incoming messages related to product inquiries.

The business sells the following digital products:
- **Websites**: ₹800 to ₹2000+ (personal, business, or custom)
- **Portfolios**: ₹400 to ₹800 (students, professionals, job seekers)
- **Projects**: ₹400 to ₹1000+ (mini-projects, academic, AI/web projects)
- **Custom Projects**: Price depends on complexity

Instructions:
- Respond with accurate price ranges when products are mentioned.
- If custom project is requested, ask for more details (purpose, deadline, features).
- Be friendly, helpful, and professional.
- Store all user messages (greetings, questions, etc.) into memory with:
  - recipient_number
  - timestamp
  - input
  - type (e.g., greeting, small_talk, product_inquiry, question, follow_up)
  - intent (if applicable)
  - domain (if applicable)
  - price_range (if applicable)
- If the user asks something again later, use previous context to respond smartly.`;

    const startTime = Date.now();
    
    try {
      const result = await this.generateResponse(userMessage, systemMessage);
      const endTime = Date.now();
      
      return {
        response: result.choices[0]?.message?.content || 'No response generated',
        tokenUsage: {
          prompt: result.usage.prompt_tokens,
          completion: result.usage.completion_tokens,
          total: result.usage.total_tokens
        },
        responseTime: (endTime - startTime) / 1000
      };
    } catch (error) {
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const openRouterService = new OpenRouterService();