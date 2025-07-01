import { useState, useEffect, useCallback } from 'react';
import { ProcessedMessage, AutomationMetrics } from '../types/automation';
import { automationService } from '../services/automationService';

export const useAutomationData = (timeRange: string = '24h') => {
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null);
  const [recentMessages, setRecentMessages] = useState<ProcessedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workflowActive, setWorkflowActive] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [metricsData, messagesData, workflowStatus] = await Promise.all([
        automationService.getMetrics(timeRange),
        automationService.getRecentMessages(20),
        automationService.getWorkflowStatus()
      ]);

      setMetrics(metricsData);
      setRecentMessages(messagesData);
      setWorkflowActive(workflowStatus.active);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  const toggleWorkflow = async () => {
    try {
      const newStatus = await automationService.toggleWorkflow(!workflowActive);
      setWorkflowActive(newStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle workflow');
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh
    const refreshInterval = parseInt(import.meta.env.VITE_DASHBOARD_REFRESH_INTERVAL || '30000');
    const interval = setInterval(fetchData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    metrics,
    recentMessages,
    isLoading,
    error,
    workflowActive,
    toggleWorkflow,
    refetch: fetchData
  };
};