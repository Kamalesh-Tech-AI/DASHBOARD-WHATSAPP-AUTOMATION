# WhatsApp Automation Dashboard

A beautiful, production-ready dashboard for monitoring WhatsApp automation workflows powered by n8n and OpenRouter AI.

## ✨ Features

- **Real-time Dashboard**: Monitor WhatsApp automation metrics and performance
- **AI Response Testing**: Test OpenRouter AI responses with the same system prompt used in production
- **Message Analytics**: Track message categories, response rates, and user engagement
- **Workflow Management**: Monitor and control n8n workflow status
- **Token Usage Tracking**: Monitor AI token consumption and cost estimates
- **Responsive Design**: Beautiful, modern interface that works on all devices

## 🚀 Live Demo

The dashboard works in two modes:
- **Simulation Mode**: Shows realistic demo data with real-time variations
- **Live Mode**: Connects to your actual n8n instance and OpenRouter API

## 🛠️ Setup

### 1. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Update `.env` with your actual values:

```env
# n8n Configuration
VITE_N8N_BASE_URL=https://your-n8n-instance.com
VITE_N8N_WORKFLOW_ID=your_workflow_id
VITE_N8N_API_KEY=your_n8n_api_key

# OpenRouter API (for AI testing)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
VITE_OPENROUTER_MODEL=google/gemma-3-12b-it

# WhatsApp Configuration
VITE_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

## 🔧 Configuration

### n8n Integration

To connect to your n8n instance:

1. **API Key**: Generate an API key in your n8n instance
2. **Webhook Endpoints**: Set up these webhooks in your n8n workflow:
   - `/webhook/dashboard-metrics` - Returns automation metrics
   - `/webhook/dashboard-messages` - Returns recent messages
   - `/webhook/send-message` - Sends WhatsApp messages

3. **Workflow API**: Ensure your n8n instance allows API access for workflow management

### OpenRouter AI Testing

The dashboard includes a built-in AI response tester that uses the same system prompt as your production workflow:

1. Configure `VITE_OPENROUTER_API_KEY` in your environment
2. Use the "Test AI Response" panel to validate responses
3. Monitor token usage and costs in real-time

## 📊 Dashboard Features

### Metrics Tracking
- Total messages processed
- Auto-reply success rate
- Average response time
- Message categorization (websites, portfolios, projects, custom)

### AI Analytics
- Token usage tracking
- Cost estimation
- Model performance metrics
- Response time analysis

### Real-time Activity
- Live message feed
- Response status tracking
- User interaction patterns
- Workflow execution status

## 🎨 Design Features

- **Modern Dark Theme**: Professional appearance suitable for production use
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Real-time Updates**: Auto-refreshing data with configurable intervals
- **Interactive Elements**: Hover states, transitions, and micro-interactions
- **Status Indicators**: Clear visual feedback for system status

## 🔌 API Integration

The dashboard is designed to work without a backend server by connecting directly to:

1. **n8n Webhooks**: For real-time data
2. **n8n API**: For workflow management
3. **OpenRouter API**: For AI response testing

If n8n is not configured, the dashboard automatically falls back to simulation mode with realistic demo data.

## 📱 Deployment

This dashboard is optimized for static hosting platforms like:

- **Netlify** (recommended)
- **Vercel**
- **GitHub Pages**
- **AWS S3 + CloudFront**

Simply build the project and deploy the `dist` folder to your preferred platform.

## 🛡️ Security

- All API keys are handled client-side (suitable for internal dashboards)
- CORS configuration required for n8n integration
- Environment variables are prefixed with `VITE_` for Vite compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this dashboard for your own projects!

## 🆘 Support

For issues and questions:
1. Check the environment configuration
2. Verify n8n webhook endpoints
3. Test OpenRouter API connectivity
4. Review browser console for errors

The dashboard includes helpful status indicators and error messages to guide troubleshooting.
