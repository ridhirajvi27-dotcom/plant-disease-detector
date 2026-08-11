import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, X, Send, Bot, User, Sparkles, RefreshCw, 
  Leaf, ShieldAlert, ShieldCheck, Copy, Check, Maximize2, Minimize2, ChevronRight, CornerDownLeft
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
      return { label: 'High Risk', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30', icon: ShieldAlert };
    }
    if (activeDisease === 'Potato___Early_blight') {
      return { label: 'Moderate Risk', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30', icon: ShieldAlert };
    }
    return { label: 'Healthy Crop', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', icon: ShieldCheck };
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
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-launcher-btn"
          aria-label="Open AI Agronomist Chat"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 text-emerald-300 group-hover:scale-110 transition-transform duration-300" />
            <span className="pulse-beacon" />
          </div>
          <div className="text-left">
            <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
              AI Agronomist <Sparkles className="w-3 h-3 text-emerald-300" />
            </div>
            <div className="text-xs font-medium text-slate-200 truncate max-w-[140px]">
              {displayDiseaseName}
            </div>
          </div>
        </button>
      )}

      {/* Main Chatbot Window */}
      {isOpen && (
        <div
          className={`chatbot-window-container ${
            isExpanded ? 'window-expanded' : 'window-normal'
          }`}
        >
          {/* Header Bar */}
          <div className="chatbot-header">
            <div className="flex items-center gap-3">
              <div className="chatbot-avatar-icon">
                <Bot className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm tracking-wide">AI Agronomist</h3>
                  <span className="rag-badge">RAG</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`severity-tag ${severity.color}`}>
                    <SeverityIcon className="w-3 h-3" />
                    {displayDiseaseName}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="header-ctrl-btn"
                title={isExpanded ? 'Collapse' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="header-ctrl-btn hover:text-rose-400"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="bot-msg-avatar">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`msg-bubble ${
                    msg.sender === 'user' ? 'msg-bubble-user' : 'msg-bubble-bot'
                  }`}
                >
                  <div className="prose prose-invert prose-xs sm:prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="msg-source-footer">
                      <div className="flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-emerald-400" />
                        <span>Source:</span>
                        <span className="text-emerald-300 italic">{msg.sources.join(', ')}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(msg.text, index)}
                        className="copy-btn"
                        title="Copy message"
                      >
                        {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="user-msg-avatar">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="bot-msg-avatar">
                  <Bot className="w-4 h-4 animate-pulse text-emerald-400" />
                </div>
                <div className="loading-bubble">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Consulting agricultural knowledge base...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Grid */}
          <div className="quick-actions-bar">
            <div className="quick-actions-title">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Quick Topics
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {quickActionCards.map((card, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(card.prompt)}
                  disabled={isLoading}
                  className="quick-action-pill"
                >
                  <span className="truncate">{card.label}</span>
                  <ChevronRight className="w-3 h-3 pill-arrow" />
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
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
