import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, X, Send, Bot, User, Sparkles, RefreshCw, 
  Leaf, ShieldAlert, ShieldCheck, Copy, Check, Maximize2, Minimize2, ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Chatbot({ apiBaseUrl, predictionResult }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const activeDisease = predictionResult?.class || 'Potato___healthy';
  const confidence = predictionResult?.confidence ? (predictionResult.confidence * 100).toFixed(1) : null;
  const displayDiseaseName = activeDisease.replace('___', ' — ').replace('_', ' ');

  const getSeverityInfo = () => {
    if (activeDisease === 'Potato___Late_blight') {
      return { label: 'High Risk', colorClass: 'severity-high', icon: ShieldAlert };
    }
    if (activeDisease === 'Potato___Early_blight') {
      return { label: 'Moderate Risk', colorClass: 'severity-moderate', icon: ShieldAlert };
    }
    return { label: 'Healthy Crop', colorClass: 'severity-healthy', icon: ShieldCheck };
  };

  const severity = getSeverityInfo();
  const SeverityIcon = severity.icon;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    setMessages([
      {
        sender: 'bot',
        text: `### 🌿 Welcome to AI Agronomist\n\n` +
              (predictionResult 
                ? `Diagnosis Context: **${displayDiseaseName}** ${confidence ? `\`(${confidence}% confidence)\`` : ''}.\n\nHow can I help you manage your crop? Click a recommended topic below or type your question.`
                : `Upload a potato leaf photo above for instant AI diagnosis, or ask me any crop care & pathology questions below.`),
        sources: ['PlantCare RAG Knowledge Base']
      }
    ]);
  }, [predictionResult]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disease: activeDisease,
          message: query
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: data.response,
          sources: data.sources || [],
          suggestedQuestions: data.suggested_questions || []
        }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `⚠️ **Connection Error**: Unable to reach AI Agronomist API at \`${apiBaseUrl}\`. Please make sure uvicorn is running.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const quickActionCards = [
    { label: '🌱 Organic Treatments', prompt: 'How do I treat this organically?' },
    { label: '🧪 Chemical & Dosage', prompt: 'What chemical fungicides and dosages to use?' },
    { label: '🛡️ Prevention Steps', prompt: 'How to prevent this from spreading?' },
    { label: '🔍 Key Symptoms', prompt: 'What are the main symptoms of this condition?' }
  ];

  return (
    <div className="chatbot-fixed-wrapper">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-launcher-btn"
          aria-label="Open AI Agronomist Chat"
        >
          <div className="launcher-icon-wrap">
            <Bot size={24} />
            <span className="pulse-beacon" />
          </div>
          <div className="launcher-text">
            <div className="launcher-label">
              AI Agronomist <Sparkles size={12} />
            </div>
            <div className="launcher-subtitle">
              {displayDiseaseName}
            </div>
          </div>
        </button>
      )}

      {/* Main Chatbot Window */}
      {isOpen && (
        <div className={`chatbot-window-container ${isExpanded ? 'window-expanded' : 'window-normal'}`}>

          {/* Header Bar */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar-icon">
                <Bot size={20} />
              </div>
              <div className="chatbot-header-info">
                <div className="chatbot-header-title-row">
                  <h3>AI Agronomist</h3>
                  <span className="rag-badge">RAG</span>
                </div>
                <div className={`severity-tag ${severity.colorClass}`}>
                  <SeverityIcon size={12} />
                  <span>{displayDiseaseName}</span>
                  {confidence && <span className="confidence-mini">({confidence}%)</span>}
                </div>
              </div>
            </div>

            <div className="chatbot-header-controls">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="header-ctrl-btn"
                title={isExpanded ? 'Collapse' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="header-ctrl-btn header-ctrl-close"
                title="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`msg-row ${msg.sender === 'user' ? 'msg-row-user' : 'msg-row-bot'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="bot-msg-avatar">
                    <Bot size={16} />
                  </div>
                )}

                <div className={`msg-bubble ${msg.sender === 'user' ? 'msg-bubble-user' : 'msg-bubble-bot'}`}>
                  <div className="msg-markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="msg-source-footer">
                      <div className="msg-source-left">
                        <Leaf size={12} />
                        <span>Source:</span>
                        <span className="msg-source-name">{msg.sources.join(', ')}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(msg.text, index)}
                        className="copy-btn"
                        title="Copy message"
                      >
                        {copiedIndex === index ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  )}

                  {/* Suggested follow-up questions */}
                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="suggested-questions">
                      {msg.suggestedQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(q)}
                          className="suggested-q-btn"
                          disabled={isLoading}
                        >
                          {q}
                          <ChevronRight size={12} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="user-msg-avatar">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="msg-row msg-row-bot">
                <div className="bot-msg-avatar">
                  <Bot size={16} className="loading-pulse" />
                </div>
                <div className="loading-bubble">
                  <RefreshCw size={14} className="loading-spin" />
                  <span>Consulting agricultural knowledge base...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Grid */}
          <div className="quick-actions-bar">
            <div className="quick-actions-title">
              <Sparkles size={12} /> Quick Topics
            </div>
            <div className="quick-actions-grid">
              {quickActionCards.map((card, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(card.prompt)}
                  disabled={isLoading}
                  className="quick-action-pill"
                >
                  <span>{card.label}</span>
                  <ChevronRight size={12} className="pill-arrow" />
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <div className="chatbot-input-footer">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Agronomist a question..."
              disabled={isLoading}
              className="chatbot-text-input"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputMessage.trim() || isLoading}
              className="chatbot-send-btn"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
