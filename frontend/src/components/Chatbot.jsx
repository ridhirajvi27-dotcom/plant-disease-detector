import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, X, Send, Bot, User, Sparkles, RefreshCw, 
  Leaf, ShieldAlert, ShieldCheck, Copy, Check, Maximize2, Minimize2, ChevronRight, HelpCircle
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

  // Determine severity badge metadata
  const getSeverityInfo = () => {
    if (activeDisease === 'Potato___Late_blight') {
      return { label: 'High Risk (Urgent Action Needed)', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: ShieldAlert };
    }
    if (activeDisease === 'Potato___Early_blight') {
      return { label: 'Moderate Risk', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: ShieldAlert };
    }
    return { label: 'Optimal Health', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: ShieldCheck };
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
        text: `### 🌿 Welcome to AI Agronomist Assistant\n\n` +
              (predictionResult 
                ? `Current leaf diagnosis: **${displayDiseaseName}** ${confidence ? `\`(${confidence}% confidence)\`` : ''}.\n\nHow can I help you manage your crop today? Select a quick action below or ask any custom question.`
                : `Upload a plant leaf photo above for an instant CNN diagnosis, or ask me any general potato cultivation & pathology questions below!`),
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
          text: `⚠️ **Connection Error**: Unable to reach AI Agronomist API at \`${apiBaseUrl}\`. Please ensure the FastAPI backend is running.`
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
          className="group relative flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium px-5 py-3.5 rounded-2xl shadow-2xl shadow-emerald-950/50 border border-emerald-400/30 transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Open AI Agronomist Chat"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-emerald-100 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
          </div>
          <div className="text-left">
            <div className="text-xs uppercase tracking-wider text-emerald-200 font-semibold flex items-center gap-1">
              AI Agronomist <Sparkles className="w-3 h-3 text-emerald-300" />
            </div>
            <div className="text-xs font-normal text-emerald-100/90 truncate max-w-[140px]">
              {displayDiseaseName}
            </div>
          </div>
        </button>
      )}

      {/* Main Chatbot Interface Window */}
      {isOpen && (
        <div
          className={`bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden transition-all duration-300 ${
            isExpanded
              ? 'w-[90vw] md:w-[680px] h-[82vh] max-h-[780px]'
              : 'w-[360px] sm:w-[440px] h-[580px]'
          }`}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950/90 to-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white text-sm tracking-wide">AI Agronomist</h3>
                  <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
                    RAG Powered
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 ${severity.color}`}>
                    <SeverityIcon className="w-3 h-3" />
                    {displayDiseaseName}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Window Controls */}
            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                title={isExpanded ? 'Collapse' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-1 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed transition-all ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none shadow-md shadow-emerald-950/40'
                      : 'bg-slate-900/90 text-slate-100 border border-slate-800 rounded-bl-none shadow-md'
                  }`}
                >
                  {/* Rich Markdown Display */}
                  <div className="prose prose-invert prose-xs sm:prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-emerald-300 prose-strong:text-emerald-200 prose-ul:my-1 prose-li:my-0.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                  {/* Sources tag */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-emerald-400" />
                        <span className="text-slate-400">Sources:</span>
                        <span className="text-emerald-300 italic">{msg.sources.join(', ')}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(msg.text, index)}
                        className="text-slate-500 hover:text-slate-300 transition"
                        title="Copy text"
                      >
                        {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-1 shadow-md">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2 shadow-md">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Retrieving agronomic insights...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Pills Grid */}
          <div className="p-2.5 bg-slate-900/80 border-t border-slate-800/80">
            <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5 px-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Recommended Actions
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {quickActionCards.map((card, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(card.prompt)}
                  disabled={isLoading}
                  className="text-left text-xs bg-slate-800/80 hover:bg-emerald-950/60 hover:text-emerald-200 border border-slate-700/60 hover:border-emerald-600/50 text-slate-300 px-2.5 py-1.5 rounded-xl transition-all duration-200 flex items-center justify-between disabled:opacity-50 group"
                >
                  <span className="truncate">{card.label}</span>
                  <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Agronomist a question..."
              disabled={isLoading}
              className="flex-1 bg-slate-900 text-white placeholder-slate-500 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500/80 transition disabled:opacity-50 shadow-inner"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 text-white p-2.5 rounded-xl transition shadow-lg shadow-emerald-950/40 flex-shrink-0"
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
