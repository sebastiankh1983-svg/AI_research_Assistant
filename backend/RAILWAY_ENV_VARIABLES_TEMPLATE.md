# 🚂 Railway Environment Variables

## Diese Variablen MUSST du in Railway konfigurieren:

**Railway Dashboard → Dein Projekt → Settings → Variables**

Füge jede Variable einzeln hinzu:

---

### 1. OPENAI_API_KEY
```
[Dein OpenAI API Key aus der .env Datei]
```

### 2. TAVILY_API_KEY
```
[Dein Tavily API Key aus der .env Datei]
```

### 3. APPWRITE_ENDPOINT
```
https://cloud.appwrite.io/v1
```

### 4. APPWRITE_PROJECT_ID
```
[Deine Appwrite Project ID: 692081340035a0d806bf]
```

### 5. APPWRITE_DATABASE_ID
```
[Deine Appwrite Database ID: 692084dc001a30feb32a]
```

### 6. APPWRITE_COLLECTION_ID
```
research_notes
```

### 7. APPWRITE_API_KEY
```
[Dein Appwrite API Key aus der .env Datei]
```

### 8. PORT (Optional - Railway setzt das automatisch)
```
3001
```

---

## ✅ So fügst du die Variablen hinzu:

1. Gehe zu Railway Dashboard
2. Öffne dein Projekt "artistic-embrace"
3. Klicke auf "Settings"
4. Scrolle zu "Variables"
5. Für jede Variable:
   - Klicke "New Variable"
   - Name: z.B. `OPENAI_API_KEY`
   - Value: Kopiere den Wert aus deiner lokalen `.env` Datei
   - Klicke "Add"

6. Nach dem Hinzufügen aller Variablen:
   - Railway startet automatisch neu
   - Dein Backend sollte dann funktionieren!

---

## 🔍 Logs überprüfen:

Nach dem Neustart in Railway:
- Gehe zu "Logs"
- Du solltest sehen: `✅ All environment variables loaded`
- Wenn nicht, fehlen noch Variablen

---

## ⚠️ WICHTIG:

Die `.env` Datei wird NICHT nach Railway hochgeladen!
Du MUSST die Variablen manuell in Railway eintragen.

**NIEMALS API-Keys in Git committen!**

