# 📚 Nachmittag-Projekt: AI Research Assistant mit Memory

**Deadline:** Morgen 09:00 Uhr
**Deployment:** Railway (Backend) + Vercel (Frontend)
**Dauer:** 3-4 Stunden

---

## 🎯 Was du baust

Ein **AI Research Assistant** der:
1. User-Fragen zu jedem Thema beantwortet
2. **Echte Web-Recherche** mit Tavily durchführt
3. **Artikel-Inhalte liest** mit MCP Fetch Server
4. Zusammenfassungen generiert
5. **Recherche-Notizen speichert** in Appwrite Database
6. User kann **Recherche-Historie** anzeigen

**Beispiel:**
```
User: "Recherchiere AI Agents Trends 2025"

Agent:
1. Sucht mit Tavily nach "AI Agents Trends 2025"
2. Findet 3 relevante Artikel
3. Liest jeden Artikel mit MCP Fetch
4. Erstellt Zusammenfassung
5. Speichert in Appwrite unter User-Account
6. Gibt strukturierte Antwort zurück
```

---

## 🚀 Anforderungen (MUST-HAVE)

### Backend:
- [x] Node.js + Express Server
- [x] LangChain.js v1 Agent mit createAgent()
- [x] **2 MCP Servers integriert:**
  - MCP Fetch Server (für Artikel lesen)
  - MCP Filesystem Server (für lokale Notizen)
- [x] **Tavily Search Tool** für Web-Suche
- [x] **Appwrite SDK** für Database Operations
- [x] API Endpoints:
  - `POST /api/research` - Neue Recherche starten
  - `GET /api/history` - Recherche-Historie abrufen
  - `DELETE /api/history/:id` - Notiz löschen

### Frontend:
- [x] React (Vite + TypeScript)
- [x] **Appwrite Authentication** (Email/Password Login)
- [x] Chat UI für Research Agent
- [x] **Research History View** - Zeigt gespeicherte Notizen
- [x] Loading States, Error Handling

### Deployment:
- [x] **Backend deployed auf Railway**
- [x] **Frontend deployed auf Vercel**
- [x] **Appwrite Cloud** (nicht lokal)
- [x] Environment Variables richtig konfiguriert

---

## 📋 Schritt-für-Schritt Anleitung

### TEIL 1: Appwrite Setup (30 min)

#### 1.1 Appwrite Account erstellen
```bash
# Gehe zu: https://cloud.appwrite.io
# Erstelle Account
# Erstelle neues Projekt: "research-assistant"
```

#### 1.2 Database & Collections erstellen

**Collection: `research_notes`**

| Field Name | Type | Required | Attributes |
|------------|------|----------|------------|
| userId | String | Yes | Max: 255 |
| topic | String | Yes | Max: 500 |
| summary | String | Yes | Max: 10000 |
| sources | String[] | No | Array |
| timestamp | DateTime | Yes | Default: now() |

**Permissions:**
- Read: Users (only own documents)
- Create: Users
- Update: Users (only own documents)
- Delete: Users (only own documents)

#### 1.3 Auth Setup
```
Settings → Auth → Enable Email/Password
```

#### 1.4 API Keys notieren
```
Project ID: [dein-project-id] 
Database ID: [dein-database-id] 
Collection ID: [dein-collection-id]  
API Endpoint: https://cloud.appwrite.io/v1
```

---

### TEIL 2: Backend (1h 30min)

#### 2.1 Setup
```bash
mkdir research-assistant
cd research-assistant
mkdir backend
cd backend
npm init -y
```

#### 2.2 Dependencies installieren
```bash
npm install express cors dotenv
npm install langchain @langchain/core @langchain/openai @langchain/tavily
npm install @modelcontextprotocol/sdk
npm install node-appwrite
npm install zod
```

#### 2.3 `.env` erstellen
```env
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=...
APPWRITE_DATABASE_ID=...
APPWRITE_COLLECTION_ID=...
APPWRITE_API_KEY=...
PORT=3001
```

#### 2.4 `server.js` erstellen

**WICHTIGE TEILE:**

**MCP Clients Setup:**
```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// MCP FETCH SERVER
const fetchClient = new Client({
  name: 'research-fetch-client',
  version: '1.0.0'
}, { capabilities: {} });

const fetchTransport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-fetch']
});

await fetchClient.connect(fetchTransport);

// MCP FILESYSTEM SERVER
const fsClient = new Client({
  name: 'research-fs-client',
  version: '1.0.0'
}, { capabilities: {} });

const fsTransport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-filesystem', './research-notes']
});

await fsClient.connect(fsTransport);
```

**Appwrite Integration:**
```javascript
import { Client as AppwriteClient, Databases, ID } from 'node-appwrite';

const appwriteClient = new AppwriteClient()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(appwriteClient);

// Function: Save research to Appwrite
async function saveResearch(userId, topic, summary, sources) {
  return await databases.createDocument(
    process.env.APPWRITE_DATABASE_ID,
    process.env.APPWRITE_COLLECTION_ID,
    ID.unique(),
    { userId, topic, summary, sources, timestamp: new Date().toISOString() }
  );
}
```

**Agent mit System Prompt:**
```javascript
const agent = createAgent({
  model: model,
  tools: [tavilyTool, fetchTool, fsTool], // 3 Tools!
  systemPrompt: `Du bist ein Research Assistant.

Deine Aufgabe: Recherchiere Themen für den User.

TOOLS:
- Tavily Search: Finde relevante Artikel/Quellen
- fetch_url: Lies vollständige Artikel-Inhalte
- write_file: Speichere Notizen lokal

Workflow:
1. User stellt Frage zu einem Thema
2. Benutze Tavily Search um Top 3 Quellen zu finden
3. Benutze fetch_url um jeden Artikel zu lesen
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

Sei präzise, faktisch, und zitiere Quellen.`
});
```

**API Endpoints:**
```javascript
// POST /api/research - Neue Recherche
app.post('/api/research', async (req, res) => {
  const { userId, topic } = req.body;

  // 1. Agent ausführen
  const result = await agent.invoke({
    messages: [{ role: 'user', content: topic }]
  });

  const summary = result.messages[result.messages.length - 1].content;

  // 2. Parse sources from summary (URLs extrahieren)
  const sources = extractUrls(summary);

  // 3. In Appwrite speichern
  await saveResearch(userId, topic, summary, sources);

  res.json({ summary, sources });
});

// GET /api/history - Recherche-Historie
app.get('/api/history', async (req, res) => {
  const { userId } = req.query;

  const history = await databases.listDocuments(
    process.env.APPWRITE_DATABASE_ID,
    process.env.APPWRITE_COLLECTION_ID,
    [Query.equal('userId', userId)]
  );

  res.json(history.documents);
});

// DELETE /api/history/:id
app.delete('/api/history/:id', async (req, res) => {
  await databases.deleteDocument(
    process.env.APPWRITE_DATABASE_ID,
    process.env.APPWRITE_COLLECTION_ID,
    req.params.id
  );

  res.json({ success: true });
});
```

**Helper Function:**
```javascript
function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}
```

---

### TEIL 3: Frontend (1h)

#### 3.1 Setup
```bash
cd ..
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install appwrite
```

#### 3.2 Appwrite Client Setup

**`src/appwrite.ts`:**
```typescript
import { Client, Account, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('YOUR_PROJECT_ID');

export const account = new Account(client);
export const databases = new Databases(client);
export { client };
```

#### 3.3 Components

**Komponenten die du brauchst:**
1. `Login.tsx` - Email/Password Login mit Appwrite
2. `ResearchChat.tsx` - Chat UI für Agent
3. `HistoryView.tsx` - Liste von gespeicherten Recherchen
4. `App.tsx` - Main Component mit Routing

**Beispiel `Login.tsx`:**
```typescript
import { useState } from 'react';
import { account } from './appwrite';
import { ID } from 'appwrite';

function Login({ onLogin }: { onLogin: (userId: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const handleAuth = async () => {
    try {
      if (isSignup) {
        await account.create(ID.unique(), email, password);
      }
      const session = await account.createEmailPasswordSession(email, password);
      onLogin(session.userId);
    } catch (error) {
      alert('Auth failed: ' + error.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h1>🔐 Research Assistant Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <button onClick={handleAuth} style={{ width: '100%', padding: '10px' }}>
        {isSignup ? 'Sign Up' : 'Login'}
      </button>
      <button onClick={() => setIsSignup(!isSignup)} style={{ marginTop: '10px' }}>
        {isSignup ? 'Already have account? Login' : 'Create new account'}
      </button>
    </div>
  );
}

export default Login;
```

**Beispiel `ResearchChat.tsx`:**
```typescript
import { useState } from 'react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

function ResearchChat({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const research = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, topic: input })
      });

      const data = await res.json();
      const aiMsg: Message = { role: 'ai', content: data.summary };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = { role: 'ai', content: 'Error: Backend nicht erreichbar!' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1>🔍 AI Research Assistant</h1>

      <div style={{ border: '1px solid #ccc', padding: '20px', height: '400px', overflowY: 'auto', marginBottom: '20px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: '10px', padding: '10px', backgroundColor: msg.role === 'user' ? '#007bff' : '#f0f0f0', color: msg.role === 'user' ? 'white' : 'black', borderRadius: '5px' }}>
            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}
          </div>
        ))}
        {loading && <div>🔍 Researching...</div>}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && research()}
          placeholder="z.B. 'AI Agents Trends 2025'"
          disabled={loading}
          style={{ flex: 1, padding: '10px' }}
        />
        <button onClick={research} disabled={loading} style={{ padding: '10px 20px' }}>
          Research
        </button>
      </div>
    </div>
  );
}

export default ResearchChat;
```

#### 3.4 `App.tsx` - Main Component
```typescript
import { useState, useEffect } from 'react';
import Login from './Login';
import ResearchChat from './ResearchChat';
import HistoryView from './HistoryView';
import { account } from './appwrite';

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [view, setView] = useState<'chat' | 'history'>('chat');

  useEffect(() => {
    // Check if user is already logged in
    account.get().then(user => setUserId(user.$id)).catch(() => {});
  }, []);

  if (!userId) {
    return <Login onLogin={setUserId} />;
  }

  return (
    <div>
      <nav style={{ padding: '10px', backgroundColor: '#333', color: 'white', display: 'flex', gap: '20px' }}>
        <button onClick={() => setView('chat')}>Chat</button>
        <button onClick={() => setView('history')}>History</button>
        <button onClick={() => { account.deleteSession('current'); setUserId(null); }}>Logout</button>
      </nav>

      {view === 'chat' && <ResearchChat userId={userId} />}
      {view === 'history' && <HistoryView userId={userId} />}
    </div>
  );
}

export default App;
```

---

### TEIL 4: Railway Deployment (30 min)

#### 4.1 Railway Account
```
1. Gehe zu: https://railway.app
2. Login mit GitHub
3. New Project → Deploy from GitHub repo
```

#### 4.2 Backend deployen
```
1. Pushe Code zu GitHub
2. Railway: Select repository
3. Add Environment Variables (.env Werte)
4. Deploy
5. Notiere Railway URL: https://your-app.railway.app
```

#### 4.3 Frontend Environment Variable
```env
# frontend/.env
VITE_API_URL=https://your-app.railway.app
```

Im Frontend:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

#### 4.4 Frontend auf Vercel deployen
```bash
npm install -g vercel
cd frontend
vercel --prod
```

---

## ✅ Abgabe-Checkliste

**Bis morgen 09:00 Uhr abgeben:**

### 1. GitHub Repository
- [ ] Backend Code
- [ ] Frontend Code
- [ ] README.md mit:
  - Setup Anleitung
  - Environment Variables Liste
  - Screenshots der App

### 2. Live Deployment Links
- [ ] Railway Backend URL: `https://...railway.app`
- [ ] Vercel Frontend URL: `https://...vercel.app`
- [ ] Beide URLs funktionieren!

### 3. Demo Video (2 Minuten)
- [ ] Zeige Login/Signup
- [ ] Starte eine Recherche (z.B. "AI Trends 2025")
- [ ] Zeige wie Agent Tavily benutzt
- [ ] Zeige gespeicherte Research History
- [ ] Zeige in Appwrite Dashboard dass Daten gespeichert wurden

### 4. Appwrite Screenshots
- [ ] Database Collections Screenshot
- [ ] Gespeicherte Documents Screenshot
- [ ] Auth Users Screenshot

---

## 🎯 Bewertungskriterien

| Kriterium | Punkte | Details |
|-----------|--------|---------|
| **Backend funktioniert** | 20 | Agent macht echte Recherche |
| **2 MCP Servers integriert** | 15 | Fetch + Filesystem beide funktionieren |
| **Appwrite Integration** | 15 | Auth + Database working |
| **Frontend UI** | 10 | Chat + History View |
| **Railway Deployment** | 15 | Backend deployed und erreichbar |
| **Vercel Deployment** | 10 | Frontend deployed |
| **Code Quality** | 10 | Clean code, comments, error handling |
| **Demo Video** | 5 | Zeigt alle Features |

**Total: 100 Punkte**

---

## 💡 TIPPS

### MCP Server Debugging:
```javascript
// Teste ob MCP Server connected ist:
console.log('MCP Tools:', await fetchClient.listTools());
```

### Appwrite Debugging:
```javascript
// Teste Appwrite Connection:
const result = await databases.listDocuments(dbId, collectionId);
console.log('Appwrite documents:', result);
```

### Railway Logs:
```
Railway Dashboard → Deployments → View Logs
```

### Common Errors:

**"MCP connection failed":**
- Check: `npx @modelcontextprotocol/server-fetch` läuft manuell?
- Fix: Installiere global: `npm install -g @modelcontextprotocol/server-fetch`

**"Appwrite 401 Unauthorized":**
- Check: API Key richtig kopiert?
- Check: Database/Collection IDs richtig?

**"CORS Error":**
- Backend: `app.use(cors({ origin: 'https://your-frontend.vercel.app' }))`

---

## 🚀 BONUS (Extra Punkte)

**+10 Punkte für jedes Feature:**
- [ ] **Search History Filter** - Filter nach Datum/Thema
- [ ] **Export to PDF** - Recherche als PDF exportieren
- [ ] **Share Links** - Teile Recherche mit anderen Users
- [ ] **Dark Mode** - Toggle Dark/Light Theme
- [ ] **Voice Input** - Spracheingabe für Recherche

---

## 📞 Support

**Bei Problemen:**
1. Erst Google/ChatGPT fragen
2. Dann Discord Channel: #homework-help
3. Notfall: Email an mich (nur wenn wirklich stuck)

**Keine Ausreden.**

Ihr habt alles gelernt was ihr braucht. Jetzt **BAUEN**.

Viel Erfolg! 🚀

---

**DEADLINE: Morgen 09:00 Uhr**
**NO EXCUSES. DEPLOY OR FAIL.**
