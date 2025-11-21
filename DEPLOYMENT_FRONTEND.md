# 🚀 Frontend Deployment Anleitung

## Railway Backend ist live! ✅
**Backend URL:** https://web-production-a898a.up.railway.app

---

## 🧪 Teste das Backend:

```bash
curl https://web-production-a898a.up.railway.app/api/health
```

Sollte antworten mit:
```json
{"status":"ok","agent":true}
```

---

## 💻 Lokales Frontend mit Railway Backend:

Das Frontend ist bereits konfiguriert! Starte es einfach:

```bash
cd frontend
npm run dev
```

Die `.env` Datei ist bereits auf die Railway URL gesetzt.

---

## 🌐 Frontend auf Vercel/Netlify deployen:

### Option 1: Vercel (Empfohlen)

1. Installiere Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Im `frontend/` Verzeichnis:
   ```bash
   cd frontend
   vercel
   ```

3. Folge den Anweisungen:
   - **Project Name:** ai-research-assistant-frontend
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Vercel wird automatisch die `.env.production` Datei verwenden

### Option 2: Netlify

1. Installiere Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Im `frontend/` Verzeichnis:
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod
   ```

3. **Wichtig:** Füge Environment Variables in Netlify hinzu:
   - Gehe zu: Site Settings → Environment Variables
   - Füge hinzu:
     - `VITE_API_URL=https://web-production-a898a.up.railway.app`
     - `VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1`
     - `VITE_APPWRITE_PROJECT_ID=692081340035a0d806bf`

---

## 🔧 CORS im Backend:

Das Backend erlaubt bereits alle Origins mit `app.use(cors())`.

Wenn du später nur bestimmte Origins erlauben willst:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://deine-vercel-domain.vercel.app'
  ]
}));
```

---

## ✅ Checkliste:

- [x] Backend auf Railway deployed
- [x] Environment Variables in Railway konfiguriert
- [x] Frontend `.env` auf Railway URL gesetzt
- [ ] Frontend lokal getestet
- [ ] Frontend auf Vercel/Netlify deployed

---

## 🐛 Troubleshooting:

### Backend antwortet nicht:
1. Checke Railway Logs
2. Stelle sicher, dass alle Environment Variables gesetzt sind
3. Prüfe, ob der Port korrekt ist (Railway setzt automatisch `PORT`)

### Frontend kann Backend nicht erreichen:
1. Prüfe Browser Console für CORS Fehler
2. Teste Backend direkt: `curl https://web-production-a898a.up.railway.app/api/health`
3. Stelle sicher, dass `.env` die richtige URL hat

### Appwrite Fehler:
1. Prüfe, ob der API Key die richtigen Permissions hat
2. Gehe zu Appwrite Console → Settings → API Keys
3. Stelle sicher, dass diese Scopes aktiv sind:
   - `databases.read`
   - `databases.write`
   - `documents.read`
   - `documents.write`
# Backend API URL (Railway)
VITE_API_URL=https://web-production-a898a.up.railway.app

# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=692081340035a0d806bf

