# 🚀 Deployment Guide

## 📋 Pre-Deployment Checklist

- [x] Backend funktioniert lokal
- [x] Frontend funktioniert lokal
- [x] Appwrite konfiguriert
- [x] Alle API Keys vorhanden
- [x] `.gitignore` Dateien vorhanden
- [x] `.env.example` Dateien erstellt
- [x] README.md erstellt

## 🔧 Railway Deployment (Backend)

### Schritt 1: GitHub Repository vorbereiten

```bash
# Im Projekt-Root-Verzeichnis
git init
git add .
git commit -m "Initial commit: AI Research Assistant"
git branch -M main
git remote add origin https://github.com/sebastiankh1983-svg/AI_research_Assistant.git
git push -u origin main
```

### Schritt 2: Railway Project erstellen

1. Gehe zu https://railway.app
2. Klicke **"New Project"**
3. Wähle **"Deploy from GitHub repo"**
4. Login mit GitHub (falls noch nicht)
5. Authorize Railway
6. Wähle Repository: `sebastiankh1983-svg/AI_research_Assistant`

### Schritt 3: Environment Variables in Railway setzen

Im Railway Dashboard → **Variables** Tab:

```env
OPENAI_API_KEY=sk-proj-your-openai-key-here
TAVILY_API_KEY=tvly-your-tavily-key-here
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=692081340035a0d806bf
APPWRITE_DATABASE_ID=692084dc001a30feb32a
APPWRITE_COLLECTION_ID=research_notes
APPWRITE_API_KEY=your-new-appwrite-key-with-correct-scopes
PORT=3001
```

⚠️ **WICHTIG:** Verwende deine echten API Keys aus der lokalen `.env` Datei!

### Schritt 4: Deploy!

- Railway startet automatisch den Build
- Warte bis **"Success"** angezeigt wird
- Kopiere die **Railway URL**: `https://your-app.railway.app`

### Schritt 5: Teste Backend

```bash
curl https://your-app.railway.app/api/health
```

Sollte zurückgeben:
```json
{
  "status": "ok",
  "agent": true
}
```

## 🌐 Vercel Deployment (Frontend)

### Schritt 1: Frontend Environment Variables aktualisieren

Bearbeite `frontend/.env`:

```env
VITE_API_URL=https://your-app.railway.app
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=692081340035a0d806bf
```

Committe die Änderung:

```bash
git add frontend/.env
git commit -m "Update frontend API URL for production"
git push
```

### Schritt 2: Vercel Deployment

**Option A: Über Vercel Dashboard (empfohlen)**

1. Gehe zu https://vercel.com
2. Login mit GitHub
3. Klicke **"Add New"** → **"Project"**
4. Importiere: `sebastiankh1983-svg/AI_research_Assistant`
5. **Framework Preset:** Vite
6. **Root Directory:** `frontend`
7. **Environment Variables:** (füge hinzu)
   ```
   VITE_API_URL=https://your-app.railway.app
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=692081340035a0d806bf
   ```
8. Klicke **"Deploy"**

**Option B: Über CLI**

```bash
cd frontend
npm install -g vercel
vercel --prod
```

Folge den Prompts und füge Environment Variables hinzu.

### Schritt 3: Teste Frontend

Öffne die Vercel URL: `https://your-app.vercel.app`

Sollte den Login-Screen zeigen.

## 🔒 CORS Konfiguration

Wenn du CORS-Fehler bekommst, aktualisiere `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app.vercel.app'
  ],
  credentials: true
}));
```

Committe und pushe:

```bash
git add backend/server.js
git commit -m "Update CORS for production"
git push
```

Railway deployt automatisch neu.

## 📊 Railway Dashboard Überblick

**Wichtige Tabs:**
- **Deployments:** Siehe Deployment-Status und Logs
- **Variables:** Environment Variables verwalten
- **Settings:** Domain, Port, etc.
- **Metrics:** CPU, Memory, Network Usage

**Logs anschauen:**
```
Deployments → Latest Deployment → View Logs
```

## 🎬 Nach dem Deployment

### Test-Ablauf:

1. **Frontend öffnen:** https://your-app.vercel.app
2. **Account erstellen:** Email + Passwort
3. **Login**
4. **Recherche starten:** "AI Agents Trends 2025"
5. **Prüfe History Tab**
6. **Prüfe Appwrite Dashboard:** Sollte gespeicherte Documents zeigen

### Screenshots machen für Abgabe:

1. ✅ Login Screen
2. ✅ Research Chat mit Antwort
3. ✅ History View mit gespeicherten Recherchen
4. ✅ Appwrite Dashboard - Documents
5. ✅ Railway Dashboard - Deployment Success
6. ✅ Vercel Dashboard - Deployment Success

## 🐛 Troubleshooting

**Railway Build Failed:**
- Prüfe `railway.json` vorhanden
- Prüfe `backend/package.json` korrekt
- Siehe Logs: Railway Dashboard → Deployments → View Logs

**Backend startet nicht:**
- Prüfe Environment Variables in Railway
- Prüfe Logs auf Fehler
- API Keys korrekt?

**Frontend kann Backend nicht erreichen:**
- CORS konfiguriert?
- Railway URL korrekt in `VITE_API_URL`?
- Railway Backend läuft?

**Appwrite Error:**
- API Key hat richtige Scopes?
- Project ID, Database ID, Collection ID korrekt?

## 📝 Deployment URLs

**Für Abgabe dokumentieren:**

- **Backend (Railway):** https://your-app.railway.app
- **Frontend (Vercel):** https://your-app.vercel.app
- **GitHub Repo:** https://github.com/sebastiankh1983-svg/AI_research_Assistant
- **Appwrite Project:** https://cloud.appwrite.io/console/project-692081340035a0d806bf

## ✅ Deployment Complete!

Wenn alles funktioniert:

1. ✅ README.md aktualisieren mit Live URLs
2. ✅ Screenshots erstellen
3. ✅ Demo Video aufnehmen (2 Minuten)
4. ✅ Abgabe einreichen!

**Deadline: Morgen 09:00 Uhr**

Viel Erfolg! 🚀
# Dependencies
node_modules/
*/node_modules/

# Environment Variables
.env
.env.local
.env.production
backend/.env
frontend/.env
frontend/.env.local

# Build outputs
dist/
build/
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Local research notes
backend/research-notes/

# Misc
*.tsbuildinfo
.npmrc
