import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  AlertCircle,
  Key,
  Database,
  Bot,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

interface ConfigurationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdate: () => void;
}

interface ConfigState {
  n8nBaseUrl: string;
  n8nWorkflowId: string;
  n8nApiKey: string;
  openRouterApiKey: string;
  openRouterModel: string;
  whatsappPhoneId: string;
  refreshInterval: string;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ 
  isOpen, 
  onClose, 
  onConfigUpdate 
}) => {
  const [config, setConfig] = useState<ConfigState>({
    n8nBaseUrl: '',
    n8nWorkflowId: '',
    n8nApiKey: '',
    openRouterApiKey: '',
    openRouterModel: '',
    whatsappPhoneId: '',
    refreshInterval: ''
  });

  const [showSecrets, setShowSecrets] = useState({
    n8nApiKey: false,
    openRouterApiKey: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testResults, setTestResults] = useState<{
    n8n: 'idle' | 'testing' | 'success' | 'error';
    openRouter: 'idle' | 'testing' | 'success' | 'error';
  }>({
    n8n: 'idle',
    openRouter: 'idle'
  });

  // Load current configuration from environment
  useEffect(() => {
    if (isOpen) {
      setConfig({
        n8nBaseUrl: import.meta.env.VITE_N8N_BASE_URL || '',
        n8nWorkflowId: import.meta.env.VITE_N8N_WORKFLOW_ID || '',
        n8nApiKey: import.meta.env.VITE_N8N_API_KEY || '',
        openRouterApiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
        openRouterModel: import.meta.env.VITE_OPENROUTER_MODEL || 'google/gemma-3-12b-it',
        whatsappPhoneId: import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '',
        refreshInterval: import.meta.env.VITE_DASHBOARD_REFRESH_INTERVAL || '30000'
      });
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof ConfigState, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setSaveStatus('idle');
  };

  const toggleSecretVisibility = (field: 'n8nApiKey' | 'openRouterApiKey') => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const testN8nConnection = async () => {
    if (!config.n8nBaseUrl || !config.n8nApiKey) {
      setTestResults(prev => ({ ...prev, n8n: 'error' }));
      return;
    }

    setTestResults(prev => ({ ...prev, n8n: 'testing' }));
    
    try {
      const response = await fetch(`${config.n8nBaseUrl}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': config.n8nApiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setTestResults(prev => ({ ...prev, n8n: 'success' }));
      } else {
        setTestResults(prev => ({ ...prev, n8n: 'error' }));
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, n8n: 'error' }));
    }
  };

  const testOpenRouterConnection = async () => {
    if (!config.openRouterApiKey) {
      setTestResults(prev => ({ ...prev, openRouter: 'error' }));
      return;
    }

    setTestResults(prev => ({ ...prev, openRouter: 'testing' }));
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${config.openRouterApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setTestResults(prev => ({ ...prev, openRouter: 'success' }));
      } else {
        setTestResults(prev => ({ ...prev, openRouter: 'error' }));
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, openRouter: 'error' }));
    }
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // In a real application, you would save these to a backend or local storage
      // For this demo, we'll update the environment variables in memory
      // Note: This requires a page reload to take effect in a real Vite app
      
      const envUpdates = {
        VITE_N8N_BASE_URL: config.n8nBaseUrl,
        VITE_N8N_WORKFLOW_ID: config.n8nWorkflowId,
        VITE_N8N_API_KEY: config.n8nApiKey,
        VITE_OPENROUTER_API_KEY: config.openRouterApiKey,
        VITE_OPENROUTER_MODEL: config.openRouterModel,
        VITE_WHATSAPP_PHONE_NUMBER_ID: config.whatsappPhoneId,
        VITE_DASHBOARD_REFRESH_INTERVAL: config.refreshInterval
      };

      // Update environment variables (this is a simulation)
      Object.entries(envUpdates).forEach(([key, value]) => {
        if (value) {
          (import.meta.env as any)[key] = value;
        }
      });

      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('success');
      
      // Trigger dashboard refresh
      setTimeout(() => {
        onConfigUpdate();
        onClose();
      }, 1500);

    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusIcon = (status: 'idle' | 'testing' | 'success' | 'error') => {
    switch (status) {
      case 'testing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />;
      case 'success':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'error':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Configuration Settings</h2>
              <p className="text-gray-400 text-sm">Update API keys, URLs, and model settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* n8n Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Database className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">n8n Configuration</h3>
              <button
                onClick={testN8nConnection}
                disabled={!config.n8nBaseUrl || !config.n8nApiKey}
                className="ml-auto flex items-center space-x-2 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {getStatusIcon(testResults.n8n)}
                <span>Test Connection</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Base URL
                </label>
                <input
                  type="url"
                  value={config.n8nBaseUrl}
                  onChange={(e) => handleInputChange('n8nBaseUrl', e.target.value)}
                  placeholder="https://your-n8n-instance.com"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Workflow ID
                </label>
                <input
                  type="text"
                  value={config.n8nWorkflowId}
                  onChange={(e) => handleInputChange('n8nWorkflowId', e.target.value)}
                  placeholder="VvT55WiJLUAoTfva"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.n8nApiKey ? 'text' : 'password'}
                    value={config.n8nApiKey}
                    onChange={(e) => handleInputChange('n8nApiKey', e.target.value)}
                    placeholder="Your n8n API key"
                    className="w-full p-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility('n8nApiKey')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showSecrets.n8nApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* OpenRouter Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Bot className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">OpenRouter AI Configuration</h3>
              <button
                onClick={testOpenRouterConnection}
                disabled={!config.openRouterApiKey}
                className="ml-auto flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {getStatusIcon(testResults.openRouter)}
                <span>Test Connection</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.openRouterApiKey ? 'text' : 'password'}
                    value={config.openRouterApiKey}
                    onChange={(e) => handleInputChange('openRouterApiKey', e.target.value)}
                    placeholder="Your OpenRouter API key"
                    className="w-full p-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility('openRouterApiKey')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showSecrets.openRouterApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  AI Model
                </label>
                <select
                  value={config.openRouterModel}
                  onChange={(e) => handleInputChange('openRouterModel', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="google/gemma-3-12b-it">Google Gemma 3 12B IT</option>
                  <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
                  <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet</option>
                  <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                  <option value="openai/gpt-4o">GPT-4o</option>
                  <option value="meta-llama/llama-3.1-8b-instruct">Llama 3.1 8B</option>
                  <option value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B</option>
                  <option value="mistralai/mistral-7b-instruct">Mistral 7B</option>
                </select>
              </div>
            </div>
          </div>

          {/* WhatsApp Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">WhatsApp Configuration</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  value={config.whatsappPhoneId}
                  onChange={(e) => handleInputChange('whatsappPhoneId', e.target.value)}
                  placeholder="702740686254207"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Dashboard Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Dashboard Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Refresh Interval (ms)
                </label>
                <select
                  value={config.refreshInterval}
                  onChange={(e) => handleInputChange('refreshInterval', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="10000">10 seconds</option>
                  <option value="30000">30 seconds</option>
                  <option value="60000">1 minute</option>
                  <option value="300000">5 minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="text-white font-medium mb-2">Configuration Help</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• <strong>n8n Base URL:</strong> Your n8n instance URL (e.g., https://your-n8n.com)</li>
                  <li>• <strong>n8n API Key:</strong> Generate in n8n Settings → API Keys</li>
                  <li>• <strong>OpenRouter API Key:</strong> Get from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer\" className="text-blue-400 hover:underline">OpenRouter Dashboard</a></li>
                  <li>• <strong>WhatsApp Phone ID:</strong> From Meta Business Manager</li>
                </ul>
                <div className="mt-3 flex space-x-4">
                  <a
                    href="https://docs.n8n.io/api/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-400 hover:underline text-sm"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>n8n API Docs</span>
                  </a>
                  <a
                    href="https://openrouter.ai/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-400 hover:underline text-sm"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>OpenRouter Docs</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            {saveStatus === 'success' && (
              <div className="flex items-center space-x-2 text-green-400">
                <Check className="w-4 h-4" />
                <span className="text-sm">Configuration saved! Reloading dashboard...</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center space-x-2 text-red-400">
                <X className="w-4 h-4" />
                <span className="text-sm">Failed to save configuration</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveConfiguration}
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save & Reload'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
