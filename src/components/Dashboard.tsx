import React, { useState } from 'react';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  BarChart3,
  Settings,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  MessageSquare,
  Bot,
  Activity,
  Power,
  RefreshCw,
  Zap,
  Database,
  Brain,
  DollarSign,
  Cpu,
  TestTube,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAutomationData } from '../hooks/useAutomationData';
import { ProcessedMessage } from '../types/automation';
import { AITestPanel } from './AITestPanel';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType, icon, isLoading }) => {
  const changeColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-gray-400'
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-700 rounded-lg w-10 h-10"></div>
            <div>
              <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-700 rounded w-16"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-700 rounded w-12"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            {icon}
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-white text-2xl font-bold">{value}</p>
          </div>
        </div>
        <div className={`text-sm font-medium ${changeColors[changeType]}`}>
          {change}
        </div>
      </div>
    </div>
  );
};

interface ActivityItemProps {
  message: ProcessedMessage;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ message }) => {
  const typeConfig = {
    received: { icon: <MessageCircle className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    replied: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-400', bg: 'bg-green-500/10' },
    failed: { icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-400', bg: 'bg-red-500/10' },
    processing: { icon: <RefreshCw className="w-4 h-4 animate-spin" />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' }
  };

  const config = typeConfig[message.status] || typeConfig.received;
  const timeAgo = new Date(message.timestamp).toLocaleString();

  const getDomainLabel = (domain?: string) => {
    const labels = {
      websites: 'Website Inquiry',
      portfolios: 'Portfolio Request',
      projects: 'Project Inquiry',
      custom_projects: 'Custom Project',
    };
    return domain ? labels[domain as keyof typeof labels] || 'General' : 'General';
  };

  return (
    <div className="flex items-start space-x-3 p-4 hover:bg-gray-700/50 rounded-lg transition-colors">
      <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{message.input}</p>
        {message.output && (
          <p className="text-gray-300 text-xs mt-1 line-clamp-2">{message.output}</p>
        )}
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-xs text-gray-400">{timeAgo}</span>
          <span className="text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300">
            {getDomainLabel(message.domain)}
          </span>
          {message.responseTime && (
            <span className="text-xs text-gray-500">
              {message.responseTime.toFixed(1)}s
            </span>
          )}
          {message.tokenUsage && (
            <span className="text-xs text-purple-400">
              {message.tokenUsage.total} tokens
            </span>
          )}
          {message.aiModel && (
            <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full">
              {message.aiModel.split('/')[1] || message.aiModel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAITest, setShowAITest] = useState(false);
  const { metrics, recentMessages, isLoading, error, workflowActive, toggleWorkflow, refetch } = useAutomationData(timeRange);

  // Check if we're using real data or fallback
  const isUsingRealData = metrics && (metrics as any).dataSource !== 'mock';
  const dataSource = (metrics as any)?.dataSource || 'mock';

  const formatMetrics = () => {
    if (!metrics) return [];
    
    return [
      {
        title: 'Total Messages',
        value: metrics.totalMessages.toLocaleString(),
        change: '+12%',
        changeType: 'positive' as const,
        icon: <MessageSquare className="w-5 h-5 text-blue-400" />
      },
      {
        title: 'Auto Replies',
        value: metrics.autoReplies.toLocaleString(),
        change: '+8%',
        changeType: 'positive' as const,
        icon: <Bot className="w-5 h-5 text-green-400" />
      },
      {
        title: 'Response Rate',
        value: `${metrics.responseRate.toFixed(1)}%`,
        change: '+2.1%',
        changeType: 'positive' as const,
        icon: <TrendingUp className="w-5 h-5 text-purple-400" />
      },
      {
        title: 'Avg Response Time',
        value: `${metrics.avgResponseTime.toFixed(1)}s`,
        change: '-0.3s',
        changeType: 'positive' as const,
        icon: <Clock className="w-5 h-5 text-orange-400" />
      }
    ];
  };

  const formatCategoryData = () => {
    if (!metrics) return [];
    
    const total = Object.values(metrics.categoryCounts).reduce((sum, count) => sum + count, 0);
    
    return [
      { 
        name: 'Website Prices', 
        count: metrics.categoryCounts.websites, 
        percentage: (metrics.categoryCounts.websites / total * 100), 
        color: 'bg-blue-500' 
      },
      { 
        name: 'Project Types', 
        count: metrics.categoryCounts.projects, 
        percentage: (metrics.categoryCounts.projects / total * 100), 
        color: 'bg-green-500' 
      },
      { 
        name: 'Portfolio', 
        count: metrics.categoryCounts.portfolios, 
        percentage: (metrics.categoryCounts.portfolios / total * 100), 
        color: 'bg-purple-500' 
      },
      { 
        name: 'Custom Projects', 
        count: metrics.categoryCounts.customProjects, 
        percentage: (metrics.categoryCounts.customProjects / total * 100), 
        color: 'bg-orange-500' 
      }
    ];
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-500 rounded-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">WhatsApp Automation</h1>
                <p className="text-sm text-gray-400">n8n + OpenRouter AI Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Data Source Indicator */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
                isUsingRealData 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              }`}>
                {isUsingRealData ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span>{isUsingRealData ? 'Live Data' : 'Demo Mode'}</span>
              </div>
              
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowAITest(!showAITest)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Test AI Response"
              >
                <TestTube className="w-5 h-5" />
              </button>
              <button
                onClick={refetch}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={toggleWorkflow}
                className={`p-2 transition-colors ${workflowActive ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'}`}
                title={workflowActive ? 'Deactivate Workflow' : 'Activate Workflow'}
              >
                <Power className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Status Banner */}
        {!isUsingRealData && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <WifiOff className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-yellow-400 font-medium">Demo Mode Active</p>
                <p className="text-yellow-300 text-sm">
                  Dashboard is showing sample data. Update your .env file with real n8n credentials to see live data.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Test Panel */}
        {showAITest && (
          <div className="mb-8">
            <AITestPanel />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="websites">Website Prices</option>
                <option value="projects">Project Types</option>
                <option value="portfolios">Portfolio</option>
                <option value="custom_projects">Custom Projects</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              workflowActive 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              <Zap className="w-4 h-4" />
              <span>{workflowActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Activity className="w-4 h-4" />
              <span>Data source: {dataSource}</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {formatMetrics().map((metric, index) => (
            <MetricCard key={index} {...metric} isLoading={isLoading} />
          ))}
        </div>

        {/* AI Metrics */}
        {metrics?.aiMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Tokens</p>
                  <p className="text-white text-2xl font-bold">{metrics.aiMetrics.totalTokensUsed.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Cpu className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Avg Tokens/Response</p>
                  <p className="text-white text-2xl font-bold">{metrics.aiMetrics.avgTokensPerResponse}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Est. Cost</p>
                  <p className="text-white text-2xl font-bold">${metrics.aiMetrics.costEstimate.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Bot className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">AI Model</p>
                  <p className="text-white text-lg font-bold">Gemma 3-12B-IT</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Message Categories */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Message Categories</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
                          <div className="h-4 bg-gray-700 rounded w-32"></div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="h-2 bg-gray-700 rounded w-32"></div>
                          <div className="h-4 bg-gray-700 rounded w-12"></div>
                          <div className="h-4 bg-gray-700 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {formatCategoryData().map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                        <span className="text-white font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 bg-gray-700 rounded-full h-2 w-32">
                          <div
                            className={`h-2 rounded-full ${category.color}`}
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-400 text-sm w-12 text-right">{category.count}</span>
                        <span className="text-gray-500 text-sm w-12 text-right">{category.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Workflow Configuration */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">AI & Workflow Configuration</h3>
                <Database className="w-5 h-5 text-gray-400" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Workflow ID</p>
                  <p className="text-white font-mono text-sm">{import.meta.env.VITE_N8N_WORKFLOW_ID}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">WhatsApp Phone ID</p>
                  <p className="text-white font-mono text-sm">{import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">AI Model</p>
                  <p className="text-white text-sm">{import.meta.env.VITE_OPENROUTER_MODEL}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Memory Type</p>
                  <p className="text-white text-sm">Buffer Window</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">OpenRouter Credential</p>
                  <p className="text-white font-mono text-sm">{import.meta.env.VITE_OPENROUTER_CREDENTIAL_ID}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Data Source</p>
                  <p className="text-white text-sm">{dataSource}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                recentMessages.map((message) => (
                  <ActivityItem key={message.id} message={message} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`flex items-center space-x-3 p-4 rounded-lg border ${
              workflowActive 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <CheckCircle className={`w-6 h-6 ${workflowActive ? 'text-green-400' : 'text-red-400'}`} />
              <div>
                <p className={`font-medium ${workflowActive ? 'text-green-400' : 'text-red-400'}`}>
                  Automation {workflowActive ? 'Active' : 'Inactive'}
                </p>
                <p className="text-gray-400 text-sm">
                  {workflowActive ? 'All systems operational' : 'Workflow stopped'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Users className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-blue-400 font-medium">Connected Users</p>
                <p className="text-gray-400 text-sm">{metrics?.totalMessages || 0} total conversations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <Clock className="w-6 h-6 text-orange-400" />
              <div>
                <p className="text-orange-400 font-medium">Response Time</p>
                <p className="text-gray-400 text-sm">Avg {metrics?.avgResponseTime?.toFixed(1) || 0}s response</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <Brain className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-purple-400 font-medium">AI Performance</p>
                <p className="text-gray-400 text-sm">{metrics?.aiMetrics?.avgTokensPerResponse || 0} avg tokens</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;