# 🚀 Vercel Deployment Anleitung

## Frontend auf Vercel deployen

### Option 1: Vercel CLI (Schnellste Methode)

1. **Installiere Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Gehe ins Frontend-Verzeichnis:**
   ```bash
   cd frontend
   ```

3. **Login zu Vercel:**
   ```bash
   vercel login
   ```
   - Wähle deine Login-Methode (GitHub, GitLab, Email)
   - Folge den Anweisungen im Browser

4. **Deploy das Frontend:**
   ```bash
   vercel --prod
   ```
   
   **Vercel wird fragen:**
   - **Set up and deploy?** → Drücke `Y` (Yes)
   - **Which scope?** → Wähle deinen Account
   - **Link to existing project?** → `N` (No)
   - **Project name?** → `ai-research-assistant` (oder einen anderen Namen)
   - **Directory?** → `.` (current directory)
   - **Override settings?** → `N` (No)

5. **Warte auf das Deployment** (ca. 1-2 Minuten)

6. **Vercel gibt dir eine URL:**
   ```
   ✅ Production: https://ai-research-assistant-xxx.vercel.app
   ```

---

### Option 2: Vercel Dashboard (Einfacher für Anfänger)

1. **Gehe zu:** https://vercel.com

2. **Login/Sign Up** (mit GitHub empfohlen)

3. **Klicke "Add New Project"**

4. **Import Git Repository:**
   - Wähle dein GitHub Repository: `AI_research_Assistant`
   - Klicke "Import"

5. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

6. **Environment Variables hinzufügen:**
   Klicke auf "Environment Variables" und füge hinzu:
   ```
   VITE_API_URL=https://web-production-a898a.up.railway.app
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=692081340035a0d806bf
   ```

7. **Klicke "Deploy"**

8. **Warte 2-3 Minuten** bis Deployment fertig ist

9. **Deine App ist live!**
   ```
   https://ai-research-assistant-xxx.vercel.app
   ```

---

## ✅ Nach dem Deployment

### 1. Teste deine Live-App:
- Öffne die Vercel URL im Browser
- Teste Login/Signup
- Teste eine Recherche
- Checke ob Backend-Verbindung funktioniert

### 2. CORS im Backend anpassen (Falls nötig):

Falls du CORS-Fehler bekommst, aktualisiere `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ai-research-assistant-xxx.vercel.app', // Deine Vercel URL!
  ]
}));
```

Dann push zu GitHub → Railway deployed automatisch neu

---

## 🐛 Troubleshooting

### Problem: "Failed to build"
**Lösung:**
1. Checke ob `package.json` die richtigen dependencies hat
2. Teste lokal: `npm run build`
3. Wenn lokal funktioniert, aber Vercel nicht → Checke Vercel Build Logs

### Problem: "Backend nicht erreichbar"
**Lösung:**
1. Checke ob `VITE_API_URL` in Vercel Environment Variables gesetzt ist
2. Öffne Browser DevTools → Network Tab
3. Checke ob Requests an die richtige Railway URL gehen

### Problem: "Appwrite 401 Unauthorized"
**Lösung:**
1. Checke ob `VITE_APPWRITE_PROJECT_ID` korrekt ist
2. Gehe zu Appwrite Dashboard → Settings
3. Füge deine Vercel URL zu "Platforms" hinzu:
   - Platform: Web
   - Name: Vercel Production
   - Hostname: `ai-research-assistant-xxx.vercel.app`

---

## 🎯 Deployment Checklist

- [ ] Frontend lokal getestet (`npm run dev`)
- [ ] Frontend baut erfolgreich (`npm run build`)
- [ ] Vercel Account erstellt
- [ ] Frontend auf Vercel deployed
- [ ] Environment Variables in Vercel gesetzt
- [ ] Live-App funktioniert
- [ ] Login/Signup funktioniert
- [ ] Recherche funktioniert
- [ ] Backend-Verbindung funktioniert

---

## 📊 Zusammenfassung der URLs

**Backend (Railway):**
```
https://web-production-a898a.up.railway.app
```

**Frontend (Vercel):**
```
https://ai-research-assistant-xxx.vercel.app
(wird nach Deployment angezeigt)
```

**Appwrite:**
```
https://cloud.appwrite.io
Project ID: 692081340035a0d806bf
```

---

## 🎉 FERTIG!

Wenn alles funktioniert, hast du jetzt:
- ✅ Backend auf Railway
- ✅ Frontend auf Vercel
- ✅ Database auf Appwrite Cloud
- ✅ Vollständig funktionsfähige AI Research Assistant App!

**Glückwunsch! 🚀**
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}

