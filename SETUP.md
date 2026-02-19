# Guide de Configuration - Room

## ✅ Étapes d'installation

### 1. Vérifier Node.js

Assurez-vous d'avoir Node.js 18+ installé :
```bash
node --version
npm --version
```

Si Node.js n'est pas installé, téléchargez-le depuis [nodejs.org](https://nodejs.org/)

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer la clé OpenAI

Éditez le fichier `.env` et ajoutez votre clé API OpenAI :
```
OPENAI_API_KEY=votre_cle_api_ici
```

### 4. Configurer Microsoft 365 (OAuth)

Créez une application dans Azure AD (Microsoft Entra ID) et renseignez :

- **Redirect URI**: `http://localhost:3001/api/microsoft/oauth/callback`
- **Scopes** (delegated): `User.Read`, `OnlineMeetingTranscript.Read.All`

Puis ajoutez dans `.env` :
```
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=http://localhost:3001/api/microsoft/oauth/callback
MICROSOFT_SCOPES=User.Read OnlineMeetingTranscript.Read.All
FRONTEND_URL=http://localhost:3000
```

### 5. Configurer Composio (applications professionnelles)

Ajoutez dans `.env` :
```
COMPOSIO_API_KEY=your_composio_api_key
COMPOSIO_BASE_URL=https://backend.composio.dev
COMPOSIO_USER_ID=room-local
```

**COMPOSIO_USER_ID** : pas besoin de le configurer manuellement si tu utilises Clerk. Quand tu es connecté, ton **user_id Clerk** est automatiquement utilisé pour lier tes comptes (Drive, Gmail, etc.). `room-local` sert uniquement de fallback (ex. sans session ou mode partagé).

### 6. Configurer Pappers (données entreprises françaises)

L'agent utilise l'API Pappers pour récupérer des données officielles (RCS, BODACC, INPI). Inscrivez-vous sur [pappers.fr/api](https://www.pappers.fr/api) pour obtenir un token.

Ajoutez dans `.env` :
```
PAPPERS_API_KEY=votre_token_pappers
```

### 7. Lancer l'application

**Option 1 : Frontend + Backend simultanément (recommandé)**
```bash
npm run dev:all
```

**Option 2 : Séparément**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend  
npm run dev:server
```

### 8. Accéder à l'application

- **Frontend** : [http://localhost:3000](http://localhost:3000)
- **Backend API** : [http://localhost:3001](http://localhost:3001)

## 🔧 Dépannage

### Port déjà utilisé
Si le port 3000 ou 3001 est déjà utilisé, vous pouvez :
- Changer le port dans `vite.config.ts` (ligne `server.port`)
- Changer le port backend avec `PORT=3002 npm run dev:server`

### Erreurs de dépendances
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erreurs TypeScript
```bash
npm run build
```

## 📝 Notes

- Le fichier `.env` est ignoré par git pour la sécurité
- La clé OpenAI est nécessaire pour l'enrichissement IA des documents
- Sans clé OpenAI, l'application fonctionnera mais utilisera les données brutes sans enrichissement
