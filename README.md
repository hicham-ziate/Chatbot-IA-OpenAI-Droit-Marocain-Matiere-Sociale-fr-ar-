# Chatbot IA – Droit Marocain / Matière Sociale 🇲🇦

> Chatbot juridique bilingue (français / عربي) spécialisé en droit social marocain, propulsé par OpenAI GPT-3.5 et un système RAG sur 82 textes de loi officiels.

**Application en ligne :** https://chatbot-ia-openai-droit-marocain-matiere-07u5.onrender.com

---

## Contexte du projet

Exercice académique : développer un chatbot IA spécialisé en **droit marocain**, capable de répondre aux questions des citoyens et étudiants sur :
- Droit civil et pénal
- Droit du travail
- Fiscalité et impôts
- Procédures administratives

**Toutes les fonctionnalités bonus (niveau avancé) ont été réalisées :**
- Mémoire de conversation (historique par session)
- Intégration de 82 PDFs de lois officielles (RAG)
- Bilingue FR / AR
- Interface moderne type ChatGPT

---

## Aperçu

Application web full-stack permettant de poser des questions en **français ou en arabe** sur le **droit du travail marocain** (Code du Travail, dahirs, décrets d'application) et d'obtenir des réponses précises citant les articles pertinents, grâce à :

- **OpenAI GPT-3.5-turbo** pour la génération de réponses (choisi pour sa qualité sur le français et l'arabe juridique, et pour permettre un déploiement en ligne accessible)
- **RAG (Retrieval-Augmented Generation)** pour injecter le contexte légal exact dans chaque réponse
- Une base documentaire de **82 PDFs officiels** — 558 chunks indexés — en français et en arabe

---

## Prompt spécialisé

```
Tu es un assistant juridique expert en droit marocain, spécialisé en matière sociale
et droit du travail. Tu maîtrises le Code civil, le Code pénal, le Code du travail,
la fiscalité et les procédures administratives marocaines.

Règles de réponse :
- Réponds TOUJOURS dans la langue de l'utilisateur : français ou عربية
- Cite systématiquement les articles exacts
  (ex : Article 34 du Code du travail / الفصل 34 من مدونة الشغل)
- Structure chaque réponse : définition légale → droits et obligations
  → sanctions → exemple concret
- Sois précis, professionnel et accessible
- Si des extraits de lois sont fournis dans le contexte, base-toi dessus en priorité
- Ton point fort est la matière sociale : contrats de travail, licenciement, SMIG,
  congés, accidents du travail, syndicats, sécurité sociale
```

---

## Fonctionnalités

- **Bilingue FR / AR** — détecte automatiquement la langue et répond dans la même langue (support RTL/LTR)
- **RAG sur PDFs** — 82 textes de loi indexés, passages pertinents injectés à chaque requête
- **Citations légales** — les réponses référencent les articles avec numéros dans les deux langues
- **Mémoire de conversation** — historique par session (20 messages max, nettoyage automatique)
- **Interface chat moderne** — React avec animations, bulles de messages, indicateur de chargement, bouton de réinitialisation
- **Responsive** — modal sur desktop, plein écran sur mobile
- **Déployé en ligne** — accessible 24h/24 depuis n'importe quel appareil

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, Vite 5, CSS custom |
| Backend | Node.js, Express.js |
| IA | OpenAI API (`gpt-3.5-turbo`) |
| RAG | Moteur custom (chunking + scoring de tokens) |
| PDF | `pdf-parse` |
| HTTP | axios, cors |
| Déploiement | Render.com (Web Service + Static Site) |

---

## Structure du projet

```
├── backend/
│   ├── data/
│   │   ├── index.json              # Index RAG (82 PDFs, 558 chunks)
│   │   └── pdfs/
│   │       ├── matiere_sociale_arabe/
│   │       │   ├── dahir/ar/
│   │       │   ├── decret_application/ar/
│   │       │   └── principal/ar/
│   │       └── matiere_sociale_français/
│   │           ├── dahir/fr/
│   │           ├── decret_application/fr/
│   │           └── principal/fr/
│   ├── scripts/
│   │   └── indexer.js              # Indexe les PDFs en chunks searchables
│   ├── rag.js                      # Moteur RAG (recherche sémantique)
│   ├── server.js                   # Serveur Express (API REST)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx                 # Interface chat principale
    │   ├── App.css
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Installation et lancement

### Prérequis

- Node.js >= 18
- Une clé API OpenAI

### 1. Cloner le dépôt

```bash
git clone https://github.com/hicham-ziate/Chatbot-IA-OpenAI-Droit-Marocain-Matiere-Sociale-fr-ar-.git
cd "Chatbot-IA-OpenAI-Droit-Marocain-Matiere-Sociale-fr-ar-"
```

### 2. Configurer les variables d'environnement

Créez un fichier `.env` dans le dossier `backend/` :

```env
OPENAI_API_KEY=sk-...
PORT=3000
```

> **Important** : ne commitez jamais votre fichier `.env`. Il est déjà dans `.gitignore`.

### 3. Installer les dépendances

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Indexer les PDFs (optionnel — index.json déjà inclus)

```bash
cd backend
node scripts/indexer.js
```

Cela régénère `backend/data/index.json` utilisé par le moteur RAG.

### 5. Démarrer l'application

```bash
# Terminal 1 – Backend
cd backend
npm start          # ou : npm run dev (avec nodemon)

# Terminal 2 – Frontend
cd frontend
npm run dev
```

L'interface est accessible sur `http://localhost:5173`.

---

## API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/chat` | Envoie un message, retourne la réponse IA |
| `POST` | `/reset` | Réinitialise l'historique de session |
| `GET` | `/health` | Vérifie l'état du serveur et du RAG |

### Exemple de requête `/chat`

```json
POST /chat
{
  "message": "Quels sont les droits en cas de licenciement abusif ?",
  "sessionId": "user-abc123"
}
```

### Réponse

```json
{
  "reply": "En cas de licenciement abusif, l'article 41 du Code du travail...",
  "fromPDF": true
}
```

---

## Base documentaire (82 PDFs)

Textes juridiques officiels couvrant :

- **Code du Travail** (مدونة الشغل) — version FR et AR
- **Dahirs** (décrets royaux) relatifs au travail, apprentissage, dialogue social
- **Décrets d'application** — salaire minimum, conditions de travail, congés, travail des enfants, sécurité, contrats
- **Lois sur la formation professionnelle** et la retraite

Sources : [adala.justice.gov.ma](https://adala.justice.gov.ma), [tax.gov.ma](https://tax.gov.ma)

---

## Sécurité

- Clé API OpenAI stockée dans `.env`, jamais exposée dans le code source
- `.env` exclu du dépôt GitHub via `.gitignore`
- Aucune donnée utilisateur stockée de façon permanente

---

## Licence

Ce projet est distribué sous licence **MIT**.

---

*Projet développé dans le cadre d'un exercice académique sur le développement de chatbots IA spécialisés en droit marocain.*
