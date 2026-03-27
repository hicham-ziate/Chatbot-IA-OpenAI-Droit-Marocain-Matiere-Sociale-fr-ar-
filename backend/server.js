require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const { loadIndex, buildContext, hasIndex } = require("./rag");

const app = express();
app.use(cors());
app.use(express.json());

// Clé API OpenAI (depuis .env)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Tu es un assistant juridique expert en droit marocain, spécialisé en matière sociale et droit du travail. Tu maîtrises le Code civil, le Code pénal, le Code du travail, la fiscalité et les procédures administratives marocaines.

Règles de réponse :
- Réponds TOUJOURS dans la langue de l'utilisateur : français ou عربية
- Cite systématiquement les articles exacts (ex : Article 34 du Code du travail / الفصل 34 من مدونة الشغل)
- Structure chaque réponse : définition légale → droits et obligations → sanctions → exemple concret
- Sois précis, professionnel et accessible
- Si des extraits de lois sont fournis dans le contexte, base-toi dessus en priorité
- Ton point fort est la matière sociale : contrats de travail, licenciement, SMIG, congés, accidents du travail, syndicats, sécurité sociale`;

// Charger l'index RAG au démarrage
loadIndex();

// Historique des conversations par session
const sessions = {};

app.post("/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message vide" });
  }

  if (!sessions[sessionId]) {
    sessions[sessionId] = [];
  }

  // Rechercher dans les PDFs indexés (RAG)
  const ragContext = buildContext(message);

  // Construire le prompt système avec contexte RAG si disponible
  let systemPrompt = SYSTEM_PROMPT;
  if (ragContext) {
    systemPrompt += "\n\n" + ragContext;
  }

  // Ajouter le message de l'utilisateur
  sessions[sessionId].push({ role: "user", content: message });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...sessions[sessionId],
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const reply = completion.choices[0].message.content.trim();

    sessions[sessionId].push({ role: "assistant", content: reply });

    if (sessions[sessionId].length > 20) {
      sessions[sessionId] = sessions[sessionId].slice(-20);
    }

    // Indiquer si la réponse vient des PDFs
    res.json({
      reply,
      fromPDF: ragContext !== null,
    });
  } catch (error) {
    console.error("Erreur OpenAI:", error.message);
    if (error.code === "invalid_api_key") {
      res.status(401).json({ error: "Clé API OpenAI invalide" });
    } else if (error.code === "insufficient_quota") {
      res.status(429).json({ error: "Quota OpenAI dépassé" });
    } else {
      res.status(500).json({ error: "Erreur lors de la communication avec l'IA" });
    }
  }
});

app.post("/reset", (req, res) => {
  const { sessionId } = req.body;
  if (sessionId && sessions[sessionId]) {
    delete sessions[sessionId];
  }
  res.json({ success: true });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", rag: hasIndex() });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`🤖 Chatbot Droit Marocain (OpenAI + RAG) prêt`);
});
