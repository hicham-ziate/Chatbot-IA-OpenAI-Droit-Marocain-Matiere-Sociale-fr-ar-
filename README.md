# Chatbot IA – Droit Marocain / Matière Sociale 🇲🇦

> Chatbot juridique bilingue (français / عربي) spécialisé en droit social marocain, propulsé par OpenAI GPT-3.5 et un système RAG sur plus de 60 textes de loi officiels.

---

## Aperçu

Ce projet est une application web full-stack qui permet à n'importe quel utilisateur de poser des questions en **français ou en arabe** sur le **droit du travail marocain** (Code du Travail, dahirs, décrets d'application) et d'obtenir des réponses précises, citant les articles pertinents, grâce à la combinaison de :

- **OpenAI GPT-3.5-turbo** pour la génération de réponses
- **RAG (Retrieval-Augmented Generation)** pour injecter le contexte légal exact dans chaque réponse
- Une base documentaire de **60+ PDFs officiels** en français et en arabe

---

## Fonctionnalités

- **Bilingue FR / AR** — détecte automatiquement la langue de la question et répond dans la même langue (support RTL/LTR)
- **RAG sur PDFs** — les textes de loi sont indexés et les passages les plus pertinents sont recherchés à chaque requête
- **Citations légales** — les réponses référencent les articles avec numéros dans les deux langues
- **Gestion de session** — historique de conversation par utilisateur (20 messages max, nettoyage automatique)
- **Interface chat moderne** — React avec animations, bulles de messages, indicateur de chargement, bouton de réinitialisation
- **Responsive** — modal sur desktop, plein écran sur mobile

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

---

## Structure du projet

```
├── backend/
│   ├── data/
│   │   ├── index.json              # Index RAG (généré par le script)
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
│   │   ├── downloadLaws.js         # Télécharge les lois depuis les sources officielles
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
git clone https://github.com/<votre-utilisateur>/<votre-repo>.git
cd "<votre-repo>"
```

### 2. Configurer les variables d'environnement

Créez un fichier `.env` dans le dossier `backend/` :

```env
OPENAI_API_KEY=sk-...
PORT=3000
```

> **Important** : ne commitez jamais votre fichier `.env`. Ajoutez-le à `.gitignore`.

### 3. Installer les dépendances

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Indexer les PDFs (première fois uniquement)

```bash
cd backend
node scripts/indexer.js
```

Cela génère `backend/data/index.json` utilisé par le moteur RAG.

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

---

## Base documentaire

Plus de 60 textes juridiques officiels couvrant :

- **Code du Travail** (مدونة الشغل) — version FR et AR
- **Dahirs** (décrets royaux) relatifs au travail, apprentissage, dialogue social
- **Décrets d'application** — salaire minimum, conditions de travail, congés, travail des enfants, sécurité, contrats...
- **Lois sur la formation professionnelle** et la retraite

Sources : [adala.justice.gov.ma](https://adala.justice.gov.ma), [tax.gov.ma](https://tax.gov.ma)

---

## Sécurité

- Ne pas exposer la clé API OpenAI dans le code source — utilisez `.env`
- Ajouter `.env` et `backend/data/index.json` au `.gitignore`
- Envisager l'ajout d'un rate limiting (`express-rate-limit`) en production
- Aucune authentification utilisateur n'est implémentée actuellement

---

## Contribuer

Les contributions sont les bienvenues ! Pour proposer une amélioration :

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commitez vos changements (`git commit -m 'feat: ajout de ...'`)
4. Poussez la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

---

## Licence

Ce projet est distribué sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

*Projet développé dans le cadre d'une initiative d'accessibilité au droit marocain du travail.*
