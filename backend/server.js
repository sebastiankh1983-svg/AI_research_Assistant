import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Client as AppwriteClient, Databases, ID, Query } from 'node-appwrite';
import { ChatOpenAI } from '@langchain/openai';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import fs from 'fs/promises';
import path from 'path';

// =========================
// ENVIRONMENT VALIDATION
// =========================
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'TAVILY_API_KEY',
  'APPWRITE_ENDPOINT',
  'APPWRITE_PROJECT_ID',
  'APPWRITE_DATABASE_ID',
  'APPWRITE_COLLECTION_ID',
  'APPWRITE_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ FEHLER: Fehlende Environment-Variablen:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n📝 Bitte konfiguriere diese Variablen in Railway:');
  console.error('   Railway Dashboard → Settings → Variables');
  process.exit(1);
}

console.log('✅ All environment variables loaded');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS mit Vercel URL
app.use(cors({
  origin: function (origin, callback) {
    // Erlaubte Origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://ai-research-assistant-jet.vercel.app'
    ];

    // Wenn keine Origin (Server-to-Server) oder Origin in der Liste
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// =========================
// APPWRITE SETUP
// =========================
const appwriteClient = new AppwriteClient()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(appwriteClient);

// =========================
// LANGCHAIN TOOLS
// =========================

// 1. TAVILY SEARCH TOOL (Custom Implementation)
const tavilyTool = new DynamicStructuredTool({
  name: 'tavily_search_results_json',
  description: 'Search the web using Tavily API. Returns a list of relevant web pages with URLs and content snippets.',
  schema: z.object({
    query: z.string().describe('The search query')
  }),
  func: async ({ query }) => {
    try {
      console.log(`  🔍 Searching Tavily for: ${query}`);
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query: query,
          max_results: 5,
          include_answer: true,
          include_raw_content: false
        })
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Format results for the agent
      const results = data.results.map((result, index) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score
      }));

      console.log(`  ✅ Found ${results.length} results`);
      return JSON.stringify({ answer: data.answer, results });
    } catch (error) {
      console.error(`  ❌ Tavily search failed:`, error.message);
      return `Error searching with Tavily: ${error.message}`;
    }
  }
});

// 2. FETCH URL TOOL (Native fetch implementation)
const fetchTool = new DynamicStructuredTool({
  name: 'fetch_url',
  description: 'Fetch and read content from a URL. Use this to read full article content.',
  schema: z.object({
    url: z.string().describe('The URL to fetch')
  }),
  func: async ({ url }) => {
    try {
      console.log(`  🌐 Fetching URL: ${url}`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();

      // Extract text content (simple implementation - remove HTML tags)
      const cleanText = text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 5000); // Limit to 5000 chars

      console.log(`  ✅ Fetched ${cleanText.length} characters`);
      return cleanText;
    } catch (error) {
      console.error(`  ❌ Fetch failed:`, error.message);
      return `Error fetching URL: ${error.message}`;
    }
  }
});

// 3. FILESYSTEM TOOL (Native fs implementation)
const fsTool = new DynamicStructuredTool({
  name: 'write_file',
  description: 'Write content to a local file. Use this to save research notes locally.',
  schema: z.object({
    path: z.string().describe('File path'),
    content: z.string().describe('Content to write')
  }),
  func: async ({ path: filePath, content }) => {
    try {
      console.log(`  💾 Writing file: ${filePath}`);

      // Create directory if it doesn't exist
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      // Write file
      await fs.writeFile(filePath, content, 'utf-8');

      console.log(`  ✅ File written successfully`);
      return `File written successfully: ${filePath}`;
    } catch (error) {
      console.error(`  ❌ Write file failed:`, error.message);
      return `Error writing file: ${error.message}`;
    }
  }
});

// =========================
// LANGCHAIN MODEL WITH TOOLS
// =========================
const model = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY
});

const tools = [tavilyTool, fetchTool, fsTool];

// Bind tools to model using bindTools() method
const modelWithTools = model.bindTools(tools);

// Simple Agent Loop
async function runResearchAgent(topic) {
  const systemPrompt = `Du bist ein Research Assistant.

Deine Aufgabe: Recherchiere Themen für den User.

TOOLS:
- tavily_search_results_json: Finde relevante Artikel/Quellen zu einem Thema
- fetch_url: Lies vollständige Artikel-Inhalte von URLs
- write_file: Speichere Notizen lokal

Workflow:
1. User stellt Frage zu einem Thema
2. Benutze tavily_search_results_json um Top 3-5 Quellen zu finden
3. Benutze fetch_url um die wichtigsten Artikel zu lesen (max 2-3 Artikel)
4. Erstelle strukturierte Zusammenfassung (3-5 Bullet Points)
5. Liste alle Quellen auf

Format:
## [Thema]

### Zusammenfassung:
- Punkt 1
- Punkt 2
- Punkt 3

### Quellen:
1. [URL 1]
2. [URL 2]
3. [URL 3]

Sei präzise, faktisch, und zitiere Quellen.`;

  const messages = [
    new HumanMessage(systemPrompt + '\n\n' + topic)
  ];

  let iterations = 0;
  const maxIterations = 10;

  while (iterations < maxIterations) {
    iterations++;

    console.log(`🔄 Agent iteration ${iterations}/${maxIterations}`);

    const response = await modelWithTools.invoke(messages);

    // Add AI response to messages
    messages.push(response);

    // Check if tools need to be called
    if (!response.tool_calls || response.tool_calls.length === 0) {
      // No more tool calls, return final response
      console.log('✅ Agent finished - no more tool calls');
      return response.content;
    }

    console.log(`🔧 Executing ${response.tool_calls.length} tool call(s)`);

    // Execute tool calls
    for (const toolCall of response.tool_calls) {
      const tool = tools.find(t => t.name === toolCall.name);
      if (tool) {
        try {
          console.log(`  → Calling tool: ${toolCall.name}`);
          const result = await tool.func(toolCall.args);

          // Add tool result to messages
          messages.push({
            role: 'tool',
            content: result,
            tool_call_id: toolCall.id
          });
        } catch (error) {
          console.error(`  ✗ Tool ${toolCall.name} failed:`, error.message);
          messages.push({
            role: 'tool',
            content: `Error: ${error.message}`,
            tool_call_id: toolCall.id
          });
        }
      } else {
        console.warn(`  ⚠ Tool not found: ${toolCall.name}`);
      }
    }
  }

  return "Max iterations reached. Research incomplete.";
}

console.log('✅ Research Agent initialized');

// =========================
// HELPER FUNCTIONS
// =========================

function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s\)]+)/g;
  const matches = text.match(urlRegex);
  return matches ? matches.slice(0, 10) : [];
}

async function saveResearch(userId, topic, summary, sources) {
  try {
    const result = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        topic,
        summary,
        sources: sources || [],
        timestamp: new Date().toISOString()
      }
    );
    return result;
  } catch (error) {
    console.error('Error saving to Appwrite:', error);
    throw error;
  }
}

// =========================
// API ENDPOINTS
// =========================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    agent: true
  });
});

// POST /api/research - Neue Recherche starten
app.post('/api/research', async (req, res) => {
  try {
    const { userId, topic } = req.body;

    if (!userId || !topic) {
      return res.status(400).json({ error: 'userId and topic are required' });
    }

    console.log(`🔍 Starting research for user ${userId}: ${topic}`);

    // Agent ausführen
    const summary = await runResearchAgent(topic);

    // Prüfe ob eine sinnvolle Antwort kam
    if (!summary || summary.trim().length === 0) {
      console.warn('⚠️ Agent returned empty summary');
      return res.json({
        summary: 'Die Recherche konnte keine Ergebnisse liefern. Bitte versuche es mit einem anderen Thema.',
        sources: []
      });
    }

    // URLs aus der Zusammenfassung extrahieren
    const sources = extractUrls(summary);

    console.log(`✅ Research completed. Found ${sources.length} sources`);

    // In Appwrite speichern (nur wenn erfolgreich, sonst Fehler loggen)
    try {
      await saveResearch(userId, topic, summary, sources);
      console.log('💾 Saved to Appwrite successfully');
    } catch (saveError) {
      console.error('⚠️ Failed to save to Appwrite:', saveError.message);
      // Wir geben trotzdem die Antwort zurück, auch wenn das Speichern fehlschlägt
    }

    res.json({ summary, sources });

  } catch (error) {
    console.error('Error in /api/research:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/history - Recherche-Historie abrufen
app.get('/api/history', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const history = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      [Query.equal('userId', userId), Query.orderDesc('timestamp')]
    );

    res.json(history.documents);

  } catch (error) {
    console.error('Error in /api/history:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/history/:id - Notiz löschen
app.delete('/api/history/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await databases.deleteDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      id
    );

    res.json({ success: true });

  } catch (error) {
    console.error('Error in /api/history/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// SERVER START
// =========================
async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`);
      console.log(`📡 API URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
