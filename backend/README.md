# Backend - AI Research Assistant

Express.js Backend mit LangChain AI Agent.

## 🚀 Start

```bash
npm install
npm start
```

## 📦 Dependencies

- `express` - Web Server
- `cors` - CORS Middleware
- `dotenv` - Environment Variables
- `@langchain/openai` - OpenAI Integration
- `@langchain/core` - LangChain Core
- `@modelcontextprotocol/sdk` - MCP Client
- `node-appwrite` - Appwrite SDK
- `zod` - Schema Validation

## 🔧 Environment Variables

Siehe `.env.example`

## 📡 API Endpoints

- `GET /api/health` - Health Check
- `POST /api/research` - Research Request
- `GET /api/history` - Get History
- `DELETE /api/history/:id` - Delete Note

