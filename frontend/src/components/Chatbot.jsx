import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';

export default function Chatbot({ apiBaseUrl, predictionResult }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const activeDisease = predictionResult?.class || 'Potato___healthy';
  const displayDiseaseName = activeDisease.replace('___', ' ').replace('_', ' ');

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial welcome message when component mounts or disease changes
  useEffect(() => {
    setMessages([
      {
        sender: 'bot',
        text: `Hello! I am your **AI Agronomist Assistant**.\n\n` +
              (predictionResult 
                ? `I see your leaf diagnosis was **${displayDiseaseName}** (Confidence: ${(predictionResult.confidence * 100).toFixed(1)}%).\n\nHow can I help you manage or treat this condition?`
                : `Upload a leaf image above for diagnosis, or ask me any general potato crop health question!`),
        sources: ['PlantCare RAG Knowledge Base']
      }
    ]);
  }, [predictionResult]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    // Append user message
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
          text: `⚠️ **Connection Error**: Unable to reach AI Agronomist API. Make sure the backend server is running at \`${apiBaseUrl}\`.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'How do I treat this organically?',
    'What chemical fungicides and dosages to use?',
    'How to prevent this from spreading?'
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-3.5 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
          aria-label="Open AI Agronomist Chat"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-emerald-100 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
          </div>
          <span>AI Agronomist</span>
          <Sparkles className="w-4 h-4 text-emerald-200" />
        </button>
      )}

      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[540px] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300">
          
          {/* Header */}
          <div className="bg-emerald-950/80 border-b border-emerald-800/60 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm flex items-center gap-1.5">
                  AI Agronomist Chatbot
                  <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">RAG</span>
                </h3>
                <p className="text-xs text-emerald-300/80">
                  Target Context: <span className="font-medium text-emerald-200">{displayDiseaseName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-800/50 border border-emerald-600/40 flex items-center justify-center text-emerald-300 flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700 rounded-bl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  
                  {/* Sources tag */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-700/60 text-[10px] text-slate-400 flex items-center gap-1">
                      <span>Source:</span>
                      <span className="text-emerald-400 italic">{msg.sources.join(', ')}</span>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Spinner */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-full bg-emerald-800/50 border border-emerald-600/40 flex items-center justify-center text-emerald-300 flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Consulting agricultural knowledge base...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-slate-900/90 border-t border-slate-800 flex gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap bg-slate-800 hover:bg-emerald-950/60 hover:text-emerald-300 border border-slate-700/80 hover:border-emerald-600/50 text-slate-300 px-2.5 py-1 rounded-full transition disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
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
              className="flex-1 bg-slate-800/80 text-white placeholder-slate-400 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 transition disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white p-2.5 rounded-xl transition shadow-md flex-shrink-0"
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
