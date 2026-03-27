import { useState, useRef, useEffect } from "react";
import axios from "axios";

// Génère un ID de session unique
const generateSessionId = () => Math.random().toString(36).substring(2, 15);

// Icône robot SVG
const BotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="8" width="18" height="12" rx="3" fill="#4A90D9" />
    <rect x="8" y="3" width="8" height="6" rx="2" fill="#4A90D9" />
    <circle cx="9" cy="13" r="2" fill="white" />
    <circle cx="15" cy="13" r="2" fill="white" />
    <rect x="9" y="17" width="6" height="1.5" rx="0.75" fill="white" />
    <line x1="12" y1="3" x2="12" y2="8" stroke="#4A90D9" strokeWidth="1.5" />
    <circle cx="12" cy="2.5" r="1.5" fill="#4A90D9" />
    <rect x="1" y="11" width="2" height="4" rx="1" fill="#4A90D9" />
    <rect x="21" y="11" width="2" height="4" rx="1" fill="#4A90D9" />
  </svg>
);

// Icône de chargement
const LoadingDots = () => (
  <div className="loading-dots">
    <span></span>
    <span></span>
    <span></span>
  </div>
);

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Bonjour, comment puis-je vous aider en matière de droit marocain ?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [sessionId] = useState(generateSessionId);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { sender: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setIsLoading(true);

    try {
      const res = await axios.post("https://chatbot-ia-openai-droit-marocain-matiere.onrender.com/chat", {
        message: trimmed,
        sessionId,
      });
      const botMsg = { sender: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errText =
        error.response?.data?.error ||
        "Une erreur s'est produite. Vérifiez qu'Ollama est bien démarré.";
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `⚠️ ${errText}`, isError: true },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetConversation = async () => {
    try {
      await axios.post("https://chatbot-ia-openai-droit-marocain-matiere.onrender.com/reset", { sessionId });
    } catch {}
    setMessages([
      {
        sender: "bot",
        text: "Bonjour, comment puis-je vous aider en matière de droit marocain ?",
      },
    ]);
  };

  // Formate le texte avec retours à la ligne et listes
  const formatText = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <div key={i} className="list-item">
            <span className="bullet">-</span>
            <span>{line.slice(2)}</span>
          </div>
        );
      }
      if (line.trim() === "") return <br key={i} />;
      return <p key={i}>{line}</p>;
    });
  };

  if (!isOpen) {
    return (
      <div className="page-bg">
        <button className="reopen-btn" onClick={() => setIsOpen(true)}>
          <BotIcon />
          <span>Ouvrir le chatbot</span>
        </button>
      </div>
    );
  }

  return (
    <div className="page-bg">
      <div className="chat-modal">
        {/* Header */}
        <div className="chat-header">
          <h2>Chatbot Droit Marocain</h2>
          <div className="header-actions">
            <button
              className="reset-btn"
              onClick={resetConversation}
              title="Nouvelle conversation"
            >
              ↺
            </button>
            <button
              className="close-btn"
              onClick={() => setIsOpen(false)}
              title="Fermer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Zone de messages */}
        <div className="messages-area">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-row ${msg.sender === "user" ? "user-row" : "bot-row"}`}
            >
              {msg.sender === "bot" && (
                <div className="bot-avatar">
                  <BotIcon />
                </div>
              )}

              <div
                className={`message-bubble ${
                  msg.sender === "user" ? "user-bubble" : "bot-bubble"
                } ${msg.isError ? "error-bubble" : ""}`}
              >
                {msg.sender === "bot"
                  ? formatText(msg.text)
                  : <p>{msg.text}</p>}
              </div>

              {msg.sender === "user" && (
                <div className="user-avatar">Vous</div>
              )}
            </div>
          ))}

          {/* Indicateur de chargement */}
          {isLoading && (
            <div className="message-row bot-row">
              <div className="bot-avatar">
                <BotIcon />
              </div>
              <div className="message-bubble bot-bubble">
                <LoadingDots />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        <div className="input-area">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question sur le droit marocain..."
            disabled={isLoading}
          />
          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={isLoading || !message.trim()}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
