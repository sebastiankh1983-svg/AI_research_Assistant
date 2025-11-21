# 🔍 AI Research Assistant

Ein intelligenter Research Assistant, der mit AI-gestützter Web-Recherche arbeitet.

## 🚀 Features

- ✅ **AI-gestützte Recherche** mit GPT-4o-mini
- ✅ **Echte Web-Suche** mit Tavily API
- ✅ **Artikel-Inhalte lesen** mit MCP Fetch Server
- ✅ **Lokale Notizen** mit MCP Filesystem Server
- ✅ **User Authentication** mit Appwrite
- ✅ **Recherche-Historie** in Appwrite Database
- ✅ **React Frontend** mit TypeScript
- ✅ **Deployed** auf Railway (Backend) + Vercel (Frontend)

## 📦 Tech Stack

**Backend:**
- Node.js + Express
- LangChain.js (AI Agent Framework)
- OpenAI GPT-4o-mini
- Tavily API (Web Search)
- MCP Servers (Fetch + Filesystem)
- Appwrite SDK (Auth + Database)

**Frontend:**
- React + TypeScript
- Vite
- Appwrite Client SDK

## 🛠️ Setup Lokal

### Backend

1. **Dependencies installieren:**
```bash
cd backend
npm install
```

2. **Environment Variables:**
Kopiere `.env.example` zu `.env` und fülle die Werte aus:
```bash
cp .env.example .env
```

Benötigte API Keys:
- `OPENAI_API_KEY`: https://platform.openai.com/api-keys
- `TAVILY_API_KEY`: https://tavily.com
- `APPWRITE_*`: https://cloud.appwrite.io

3. **Backend starten:**
```bash
npm start
```

Backend läuft auf: http://localhost:3001

### Frontend

1. **Dependencies installieren:**
```bash
cd frontend
npm install
```

2. **Environment Variables:**
Erstelle `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
```

3. **Frontend starten:**
```bash
npm run dev
```

Frontend läuft auf: http://localhost:5173

## 🚢 Deployment

### Backend → Railway

1. Pushe Code zu GitHub
2. Gehe zu https://railway.app
3. Erstelle neues Projekt → Deploy from GitHub
4. Wähle Repository aus
5. Füge alle Environment Variables hinzu (aus `.env.example`)
6. Deploy!

Railway erkennt automatisch die `railway.json` Config.

### Frontend → Vercel

```bash
cd frontend
npm install -g vercel
vercel --prod
```

Oder über Vercel Dashboard:
1. Import GitHub Repository
2. Framework Preset: Vite
3. Environment Variables hinzufügen
4. Deploy!

## 📋 Environment Variables für Railway

Füge diese Variables in Railway hinzu:

```
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=...
APPWRITE_DATABASE_ID=...
APPWRITE_COLLECTION_ID=research_notes
APPWRITE_API_KEY=...
PORT=3001
```

## 🎯 Appwrite Setup

1. Erstelle Account auf https://cloud.appwrite.io
2. Erstelle neues Projekt
3. **Database erstellen:**
   - Name: `research_db`
   - Collection: `research_notes`

4. **Collection Attributes:**
   - `userId` (String, required, max: 255)
   - `topic` (String, required, max: 500)
   - `summary` (String, required, max: 10000)
   - `sources` (String Array)
   - `timestamp` (DateTime, required)

5. **Permissions:**
   - Read: Users (only own documents)
   - Create: Users
   - Update: Users (only own documents)
   - Delete: Users (only own documents)

6. **Auth aktivieren:**
   - Settings → Auth → Email/Password

7. **API Key erstellen:**
   - Settings → API Keys → Create API Key
   - Scopes: `databases.read`, `databases.write`, `documents.read`, `documents.write`, `collections.read`

## 🧪 Testen

1. **Backend Health Check:**
```bash
curl http://localhost:3001/api/health
```

2. **Frontend öffnen:**
- Gehe zu http://localhost:5173
- Erstelle Account
- Teste Recherche: "AI Agents Trends 2025"
- Prüfe History Tab

## 📝 API Endpoints

**Backend API:**

- `GET /api/health` - Health Check
- `POST /api/research` - Neue Recherche starten
  ```json
  {
    "userId": "user-id",
    "topic": "Your research topic"
  }
  ```
- `GET /api/history?userId=xxx` - Recherche-Historie abrufen
- `DELETE /api/history/:id` - Notiz löschen

## 🎬 Demo

**Live URLs:**
- Backend: https://your-app.railway.app
- Frontend: https://your-app.vercel.app

## 📸 Screenshots

### Login Screen
![Login](./screenshots/login.png)

### Research Chat
![Chat](./screenshots/chat.png)

### Research History
![History](./screenshots/history.png)

### Appwrite Dashboard
![Appwrite](./screenshots/appwrite.png)

## 🐛 Troubleshooting

**Backend startet nicht:**
- Prüfe `.env` Datei vorhanden
- Prüfe alle API Keys korrekt

**MCP Connection Failed:**
- MCP Server wird automatisch mit `npx` gestartet
- Kein manueller Install nötig

**Appwrite 401 Error:**
- Prüfe API Key hat richtige Scopes
- Prüfe Project ID, Database ID, Collection ID korrekt

**CORS Error:**
- Railway URL in `backend/server.js` CORS config hinzufügen
- Oder `cors()` ohne Restrictions verwenden

## 📄 Lizenz

MIT

## 👨‍💻 Autor

Sebastian KH
- GitHub: [@sebastiankh1983-svg](https://github.com/sebastiankh1983-svg)

## 🙏 Credits

- OpenAI GPT-4o-mini
- Tavily API
- Appwrite
- LangChain.js
- Model Context Protocol (MCP)

