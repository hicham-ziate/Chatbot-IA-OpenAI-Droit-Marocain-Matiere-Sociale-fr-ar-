const fs = require("fs");
const path = require("path");

const INDEX_FILE = path.join(__dirname, "data/index.json");

let index = null;

// Charger l'index au démarrage
function loadIndex() {
  if (fs.existsSync(INDEX_FILE)) {
    index = JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8"));
    console.log(`📖 RAG : ${index.length} chunks chargés depuis l'index`);
  } else {
    index = [];
    console.log("⚠️  RAG : Aucun index trouvé. Lancez 'node scripts/indexer.js'");
  }
}

// Tokeniser le texte (supporte français et arabe)
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

// Calculer le score de pertinence
function scoreChunk(queryTokens, chunk) {
  const chunkTokens = tokenize(chunk.text);
  const chunkSet = new Set(chunkTokens);
  let matches = 0;

  for (const token of queryTokens) {
    if (chunkSet.has(token)) matches++;
  }

  // Score normalisé
  return matches / Math.sqrt(chunkTokens.length + 1);
}

// Rechercher les chunks les plus pertinents
function search(query, topK = 3) {
  if (!index) loadIndex();
  if (!index || index.length === 0) return [];

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const scored = index
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(queryTokens, chunk),
    }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
}

// Construire le contexte RAG pour le prompt
function buildContext(query) {
  const results = search(query);
  if (results.length === 0) return null;

  let context = "📄 Extraits des lois marocaines pertinents :\n\n";
  results.forEach((r, i) => {
    context += `[Source: ${r.source}]\n${r.text}\n\n`;
  });

  return context;
}

// Vérifier si l'index est disponible
function hasIndex() {
  if (!index) loadIndex();
  return index && index.length > 0;
}

module.exports = { loadIndex, search, buildContext, hasIndex };
