// TEST VERSION - Funktioniert ohne OpenAI/Tavily API Keys
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Client as AppwriteClient, Databases, ID, Query } from 'node-appwrite';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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
    message: 'Backend läuft (Test-Modus ohne AI)'
  });
});

// POST /api/research - MOCK VERSION (ohne OpenAI/Tavily)
app.post('/api/research', async (req, res) => {
  try {
    const { userId, topic } = req.body;

    if (!userId || !topic) {
      return res.status(400).json({ error: 'userId and topic are required' });
    }

    console.log(`🔍 Mock research for user ${userId}: ${topic}`);

    // MOCK RESPONSE (keine echte AI)
    const summary = `# ${topic}

## Zusammenfassung (Test-Modus):
- Dies ist eine Test-Antwort, da keine API Keys konfiguriert sind
- Um echte Recherchen durchzuführen, benötigst du:
  - OpenAI API Key (für GPT-4)
  - Tavily API Key (für Web-Suche)
- Die Appwrite-Integration funktioniert bereits!
- Login/Logout funktioniert ✅
- Historie-Speicherung funktioniert ✅

## Quellen:
1. https://example.com/source1
2. https://example.com/source2

**Hinweis:** Füge echte API Keys in backend/.env hinzu für vollständige Funktionalität.`;

    const sources = extractUrls(summary);

    console.log(`✅ Mock research completed`);

    // In Appwrite speichern
    await saveResearch(userId, topic, summary, sources);

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
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`⚠️  TEST MODE: No AI (OpenAI/Tavily keys missing)`);
  console.log(`✅ Appwrite integration active`);
});
