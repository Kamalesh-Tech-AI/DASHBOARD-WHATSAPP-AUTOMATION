# WhatsApp Dashboard API Server

Simple Express.js API server to provide data for the WhatsApp automation dashboard.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your actual values

4. Start the server:
```bash
npm run dev
```

## Endpoints

- `GET /api/health` - Health check
- `GET /api/metrics?timeRange=24h` - Get automation metrics
- `GET /api/messages?limit=20` - Get recent messages
- `GET /api/workflow/status` - Get workflow status
- `POST /api/workflow/toggle` - Toggle workflow active state

## Integration with n8n

Replace the mock data with actual calls to your n8n webhooks or database.