import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Loader2, Bot } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [localMessages, setLocalMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm BookBot, your AI assistant. I can help you find books, check policies, or recommend your next great read! How can I help?",
    }
  ]);
  const messagesEndRef = useRef(null);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Load latest session if authenticated
  useQuery({
    queryKey: ['chat-sessions'],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      const { data } = await api.get('/ai/chat/sessions');
      if (data.sessions?.length > 0) {
        setSessionId(data.sessions[0].sessionId);
        // Load messages for that session
        const sessionRes = await api.get(`/ai/chat/sessions/${data.sessions[0].sessionId}`);
        if (sessionRes.data.session?.messages) {
          setLocalMessages(sessionRes.data.session.messages);
        }
      }
      return data;
    },
    enabled: isOpen && isAuthenticated,
  });

  const chatMutation = useMutation({
    mutationFn: async (msg) => {
      const { data } = await api.post('/ai/chat', { message: msg, sessionId });
      return data;
    },
    onSuccess: (data) => {
      if (!sessionId) setSessionId(data.sessionId);
      setLocalMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message, provider: data.provider }
      ]);
    },
    onError: () => {
      setLocalMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I am having trouble connecting right now. Please try again later.' }
      ]);
    }
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!isAuthenticated) {
      setLocalMessages((prev) => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: 'Please log in to chat with me! It helps me give you personalized recommendations.' }
      ]);
      setMessage('');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    setLocalMessages((prev) => [...prev, { role: 'user', content: message }]);
    chatMutation.mutate(message);
    setMessage('');
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-brand rounded-full shadow-brand-lg flex items-center justify-center text-white hover:scale-110 transition-transform z-40 group"
          >
            <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-2 -right-2 bg-red-500 w-4 h-4 rounded-full border-2 border-surface-900" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-surface-800 border-b border-surface-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    BookBot <Sparkles className="w-4 h-4 text-brand-400" />
                  </h3>
                  <p className="text-xs text-surface-400">Online | AI Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-surface-400 hover:text-white rounded-full hover:bg-surface-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-900/50">
              {localMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-brand text-white rounded-br-sm'
                        : 'glass-dark text-surface-100 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    {msg.provider && msg.role === 'assistant' && (
                      <span className="text-[10px] text-surface-500 mt-2 block italic">
                        Powered by {msg.provider === 'gemini' ? 'Google Gemini' : msg.provider === 'openai' ? 'OpenAI' : 'Mock AI'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="glass-dark rounded-2xl rounded-bl-sm px-4 py-3">
                    <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-surface-800 border-t border-surface-700">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isAuthenticated ? "Ask for recommendations..." : "Log in to chat..."}
                  className="flex-1 bg-surface-900 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-surface-100 placeholder-surface-400 focus:outline-none focus:border-brand-500"
                  disabled={chatMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || chatMutation.isPending}
                  className="bg-brand-500 text-white p-2.5 rounded-xl hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
