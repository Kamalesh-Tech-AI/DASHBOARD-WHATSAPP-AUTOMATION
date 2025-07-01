import React, { useState } from 'react';
import { Send, Loader2, Brain, Clock, Hash, DollarSign } from 'lucide-react';
import { automationService } from '../services/automationService';

export const AITestPanel: React.FC = () => {
  const [testMessage, setTestMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<{
    response: string;
    tokenUsage: { prompt: number; completion: number; total: number };
    responseTime: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!testMessage.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await automationService.testAIResponse(testMessage);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTest();
    }
  };

  const estimateCost = (tokens: number) => {
    // Rough estimate for Google Gemma pricing (adjust based on actual rates)
    const costPerToken = 0.000002; // $0.000002 per token (example)
    return (tokens * costPerToken).toFixed(6);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Brain className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">AI Response Tester</h3>
          <p className="text-gray-400 text-sm">Test your OpenRouter AI responses with the same system prompt</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Input */}
        <div className="relative">
          <textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message to test AI response... (e.g., 'Hi, I need a website for my business')"
            className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={handleTest}
            disabled={isLoading || !testMessage.trim()}
            className="absolute bottom-3 right-3 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="space-y-4">
            {/* AI Response */}
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <h4 className="text-white font-medium mb-2">AI Response:</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{response.response}</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-gray-400 text-sm">Response Time</span>
                </div>
                <p className="text-white font-bold">{response.responseTime.toFixed(2)}s</p>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 text-sm">Total Tokens</span>
                </div>
                <p className="text-white font-bold">{response.tokenUsage.total}</p>
                <p className="text-gray-500 text-xs">
                  {response.tokenUsage.prompt} + {response.tokenUsage.completion}
                </p>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400 text-sm">Est. Cost</span>
                </div>
                <p className="text-white font-bold">${estimateCost(response.tokenUsage.total)}</p>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-400 text-sm">Model</span>
                </div>
                <p className="text-white font-bold text-xs">Gemma 3-12B-IT</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Test Examples */}
        <div className="border-t border-gray-700 pt-4">
          <p className="text-gray-400 text-sm mb-3">Quick test examples:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Hi, I need a website for my business",
              "What are your portfolio prices?",
              "I want a custom AI chatbot",
              "What kind of projects do you work on?",
              "Hello there!"
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setTestMessage(example)}
                className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full hover:bg-gray-600 transition-colors"
                disabled={isLoading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};