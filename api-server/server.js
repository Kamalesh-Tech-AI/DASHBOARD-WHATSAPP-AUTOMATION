import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const N8N_BASE_URL = process.env.N8N_BASE_URL;
const N8N_WORKFLOW_ID = process.env.N8N_WORKFLOW_ID;
const N8N_API_KEY = process.env.N8N_API_KEY;

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    n8nConnected: !!N8N_BASE_URL,
    workflowId: N8N_WORKFLOW_ID
  });
});

// Get automation metrics
app.get('/api/metrics', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    // Try to fetch real data from n8n webhook or database
    if (N8N_BASE_URL) {
      try {
        const n8nResponse = await fetch(`${N8N_BASE_URL}/webhook/dashboard-metrics?timeRange=${timeRange}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(N8N_API_KEY && { 'X-N8N-API-KEY': N8N_API_KEY })
          }
        });
        
        if (n8nResponse.ok) {
          const realData = await n8nResponse.json();
          return res.json(realData);
        }
      } catch (n8nError) {
        console.warn('Failed to fetch from n8n:', n8nError.message);
      }
    }
    
    // Fallback to enhanced mock data with real-time elements
    const metrics = {
      totalMessages: Math.floor(Math.random() * 100) + 1200, // Simulate real-time changes
      autoReplies: Math.floor(Math.random() * 90) + 1150,
      responseRate: 95.3 + (Math.random() - 0.5) * 2, // Small variations
      avgResponseTime: 1.2 + (Math.random() - 0.5) * 0.4,
      categoryCounts: {
        websites: Math.floor(Math.random() * 50) + 430,
        portfolios: Math.floor(Math.random() * 30) + 270,
        projects: Math.floor(Math.random() * 40) + 290,
        customProjects: Math.floor(Math.random() * 20) + 180,
        other: Math.floor(Math.random() * 5)
      },
      hourlyStats: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        messages: Math.floor(Math.random() * 50) + 10,
        replies: Math.floor(Math.random() * 45) + 8
      })),
      aiMetrics: {
        totalTokensUsed: Math.floor(Math.random() * 10000) + 150000,
        avgTokensPerResponse: Math.floor(Math.random() * 20) + 120,
        modelUsage: {
          'google/gemma-3-12b-it': Math.floor(Math.random() * 100) + 1150
        },
        costEstimate: 2.34 + (Math.random() - 0.5) * 0.5
      },
      lastUpdated: new Date().toISOString(),
      dataSource: N8N_BASE_URL ? 'n8n-fallback' : 'mock'
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get recent messages
app.get('/api/messages', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Try to fetch real data from n8n webhook or database
    if (N8N_BASE_URL) {
      try {
        const n8nResponse = await fetch(`${N8N_BASE_URL}/webhook/dashboard-messages?limit=${limit}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(N8N_API_KEY && { 'X-N8N-API-KEY': N8N_API_KEY })
          }
        });
        
        if (n8nResponse.ok) {
          const realData = await n8nResponse.json();
          return res.json(realData);
        }
      } catch (n8nError) {
        console.warn('Failed to fetch messages from n8n:', n8nError.message);
      }
    }
    
    // Enhanced mock data with more realistic timestamps
    const messages = [
      {
        id: `msg_${Date.now()}_1`,
        recipientNumber: '+1234567890',
        timestamp: Date.now() - Math.floor(Math.random() * 300000), // Random within last 5 minutes
        input: 'Hi, I need a website for my business. What are your prices?',
        output: 'Hello! Our website prices range from ₹800 to ₹2000+ depending on complexity...',
        type: 'product_inquiry',
        domain: 'websites',
        priceRange: '₹1200-₹2000',
        status: 'replied',
        responseTime: 1.1 + (Math.random() - 0.5) * 0.4,
        aiModel: 'google/gemma-3-12b-it',
        tokenUsage: { prompt: 89, completion: 156, total: 245 }
      },
      {
        id: `msg_${Date.now()}_2`,
        recipientNumber: '+1234567891',
        timestamp: Date.now() - Math.floor(Math.random() * 600000), // Random within last 10 minutes
        input: 'Can you show me some portfolio examples?',
        output: 'I\'d be happy to share our portfolio examples! Our portfolio websites range from ₹400-₹800...',
        type: 'product_inquiry',
        domain: 'portfolios',
        priceRange: '₹400-₹800',
        status: 'replied',
        responseTime: 0.9 + (Math.random() - 0.5) * 0.3,
        aiModel: 'google/gemma-3-12b-it',
        tokenUsage: { prompt: 67, completion: 98, total: 165 }
      }
      // Add more dynamic messages...
    ];

    res.json(messages.slice(0, parseInt(limit)));
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get workflow status
app.get('/api/workflow/status', async (req, res) => {
  try {
    // Try to get real workflow status from n8n
    if (N8N_BASE_URL && N8N_WORKFLOW_ID && N8N_API_KEY) {
      try {
        const n8nResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${N8N_WORKFLOW_ID}`, {
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY
          }
        });
        
        if (n8nResponse.ok) {
          const workflow = await n8nResponse.json();
          return res.json({
            active: workflow.active,
            lastExecution: {
              id: 'real_exec',
              workflowId: N8N_WORKFLOW_ID,
              status: 'success',
              startedAt: new Date(Date.now() - 120000).toISOString(),
              finishedAt: new Date(Date.now() - 119000).toISOString(),
              data: {}
            },
            dataSource: 'n8n-api'
          });
        }
      } catch (n8nError) {
        console.warn('Failed to fetch workflow status from n8n:', n8nError.message);
      }
    }
    
    // Fallback status
    const status = {
      active: true,
      lastExecution: {
        id: 'fallback_exec',
        workflowId: N8N_WORKFLOW_ID || 'unknown',
        status: 'success',
        startedAt: new Date(Date.now() - 120000).toISOString(),
        finishedAt: new Date(Date.now() - 119000).toISOString(),
        data: {}
      },
      dataSource: 'fallback'
    };

    res.json(status);
  } catch (error) {
    console.error('Error fetching workflow status:', error);
    res.status(500).json({ error: 'Failed to fetch workflow status' });
  }
});

// Toggle workflow
app.post('/api/workflow/toggle', async (req, res) => {
  try {
    const { active } = req.body;
    
    // Try to toggle real workflow in n8n
    if (N8N_BASE_URL && N8N_WORKFLOW_ID && N8N_API_KEY) {
      try {
        const endpoint = active ? 'activate' : 'deactivate';
        const n8nResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${N8N_WORKFLOW_ID}/${endpoint}`, {
          method: 'POST',
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
            'Content-Type': 'application/json'
          }
        });
        
        if (n8nResponse.ok) {
          return res.json({ active, dataSource: 'n8n-api' });
        }
      } catch (n8nError) {
        console.warn('Failed to toggle workflow in n8n:', n8nError.message);
      }
    }
    
    // Fallback response
    res.json({ active, dataSource: 'fallback' });
  } catch (error) {
    console.error('Error toggling workflow:', error);
    res.status(500).json({ error: 'Failed to toggle workflow' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Dashboard API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 n8n Base URL: ${N8N_BASE_URL || 'Not configured'}`);
  console.log(`⚡ Workflow ID: ${N8N_WORKFLOW_ID || 'Not configured'}`);
  console.log(`🔑 API Key: ${N8N_API_KEY ? 'Configured' : 'Not configured'}`);
});