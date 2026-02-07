# Room - Générateur de Documents d'Investissement

Application web agentique basée sur l'IA pour automatiser la création de documents Word (.docx) et PowerPoint (.pptx) pour le secteur de l'investissement.

## 🚀 Fonctionnalités

- **Génération automatique de documents** : Créez des documents Word et PowerPoint professionnels en quelques clics
- **Enrichissement par IA** : Utilise OpenAI pour enrichir et structurer le contenu de manière professionnelle
- **Interface intuitive** : Formulaire simple et élégant pour saisir les informations d'investissement
- **Documents personnalisés** : Génération de documents adaptés au secteur de l'investissement avec sections pertinentes

## 🛠️ Technologies

- **React 18** : Bibliothèque UI moderne
- **Vite** : Build tool rapide et moderne
- **TypeScript** : Typage statique pour une meilleure maintenabilité
- **Tailwind CSS** : Styling moderne et responsive
- **Express** : Serveur backend pour l'API
- **OpenAI API** : Enrichissement intelligent du contenu
- **docx** : Génération de documents Word
- **pptxgenjs** : Génération de présentations PowerPoint

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Clé API OpenAI

## 🔧 Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/gaspardlgrn/Room.git
cd Room
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
```bash
cp .env.example .env
```

Éditez `.env` et ajoutez votre clé API OpenAI :
```
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo-preview
```

## 🚀 Démarrage

### Développement (Frontend + Backend)

Pour lancer le frontend et le backend simultanément :
```bash
npm run dev:all
```

Cela démarre :
- **Frontend React** sur [http://localhost:3000](http://localhost:3000)
- **Backend Express** sur [http://localhost:3001](http://localhost:3001)

### Démarrage séparé

**Frontend uniquement :**
```bash
npm run dev
```

**Backend uniquement :**
```bash
npm run dev:server
```

## 📝 Utilisation

1. Remplissez le formulaire avec les informations de l'opportunité d'investissement :
   - Nom de l'entreprise (requis)
   - Montant de l'investissement (requis)
   - Secteur (requis)
   - Description de l'opportunité (requis)
   - Métriques clés (optionnel)
   - Analyse de marché (optionnel)
   - Projections financières (optionnel)
   - Informations supplémentaires (optionnel)

2. Choisissez le type de document (Word ou PowerPoint)

3. Cliquez sur "Générer le document"

4. L'application va :
   - Enrichir le contenu avec l'IA
   - Générer le document dans le format choisi
   - Télécharger automatiquement le fichier

## 📁 Structure du projet

```
Room/
├── src/                          # Code source React
│   ├── components/
│   │   └── DocumentGenerator.tsx  # Composant principal du formulaire
│   ├── types/
│   │   └── index.ts               # Types TypeScript partagés
│   ├── App.tsx                    # Composant racine
│   ├── main.tsx                   # Point d'entrée React
│   └── index.css                  # Styles globaux
├── server/                        # Serveur Express backend
│   ├── lib/
│   │   ├── docx-generator.ts      # Logique de génération Word
│   │   └── pptx-generator.ts      # Logique de génération PowerPoint
│   ├── types/
│   │   └── index.ts               # Types TypeScript backend
│   └── index.ts                   # Serveur Express
├── index.html                     # Point d'entrée HTML
├── vite.config.ts                 # Configuration Vite
└── package.json
```

## 🔐 Variables d'environnement

- `OPENAI_API_KEY` : Votre clé API OpenAI (requis pour l'enrichissement IA)
- `OPENAI_MODEL` : Modèle OpenAI à utiliser (défaut: gpt-4-turbo-preview)
- `PORT` : Port du serveur Express (défaut: 3001)

## 📦 Build pour production

**Build du frontend :**
```bash
npm run build
```

**Démarrer le serveur backend :**
```bash
npm run server
```

Le frontend buildé sera dans le dossier `dist/` et peut être servi par n'importe quel serveur statique.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT
