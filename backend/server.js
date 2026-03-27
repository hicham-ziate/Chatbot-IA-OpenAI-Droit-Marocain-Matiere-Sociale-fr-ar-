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

const SYSTEM_PROMPT = `Tu es un expert en droit marocain (Code civil, Code pénal, droit du travail, fiscalité, procédures administratives), avec une spécialisation approfondie en matière sociale et droit du travail.
- Réponds TOUJOURS dans la même langue que l'utilisateur : si la question est en français, réponds en français. Si la question est en arabe, réponds en arabe (الفصل 23 من مدونة الشغل).
- Cite les articles de loi pertinents avec précision (ex : Article 23 du Code du travail / الفصل 23 من مدونة الشغل)
- Donne des exemples concrets et pratiques pour illustrer tes réponses
- Structure tes réponses clairement : contexte légal, droits et obligations, sanctions éventuelles
- Reste professionnel, précis et accessible
- Si des extraits de lois sont fournis dans le contexte, base-toi dessus en priorité pour garantir une réponse juridiquement exacte
- Pour les questions en matière sociale (contrats, licenciement, SMIG, congés, accidents du travail), appuie-toi sur les textes officiels indexés`;

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
