import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Send, Loader2, Sparkles, User, Settings, RefreshCw, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/axios';

export default function AIChatPage() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [localMessages, setLocalMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I'm BookBot, your personal AI reading assistant. I can help you discover new books, summarize themes, or answer questions about our store policies. What kind of book are you looking for today?`,
    }
  ]);

  // Fetch past sessions
  const { data: sessionsData, refetch: refetchSessions } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: async () => {
      const { data } = await api.get('/ai/chat/sessions');
      return data.sessions;
    },
    enabled: isAuthenticated,
  });

  // Load a specific session
  const loadSession = async (id) => {
    try {
      const { data } = await api.get(`/ai/chat/sessions/${id}`);
      setSessionId(data.session.sessionId);
      setLocalMessages(data.session.messages);
    } catch (error) {
      toast.error('Failed to load chat history');
    }
  };

  // Chat Mutation
  const chatMutation = useMutation({
    mutationFn: async (msg) => {
      const { data } = await api.post('/ai/chat', { message: msg, sessionId });
      return data;
    },
    onSuccess: (data) => {
      if (!sessionId) {
        setSessionId(data.sessionId);
        refetchSessions();
      }
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

  const startNewChat = () => {
    setSessionId(null);
    setLocalMessages([
      {
        role: 'assistant',
        content: "Starting a fresh conversation. How can I assist you today?",
      }
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!isAuthenticated) {
      toast.error('Please log in to chat');
      navigate('/login');
      return;
    }

    setLocalMessages((prev) => [...prev, { role: 'user', content: message }]);
    chatMutation.mutate(message);
    setMessage('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen page-bg pt-24 pb-20 flex items-center justify-center">
        <div className="glass-dark p-8 rounded-2xl text-center max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-brand-500/20 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">AI Chat Assistant</h2>
          <p className="text-surface-300 mb-8">Please log in to get personalized book recommendations and chat with our AI.</p>
          <button onClick={() => navigate('/login')} className="btn-brand w-full">Log In to Chat</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg pt-20 flex flex-col md:flex-row h-screen">
      
      {/* Sidebar - Chat History */}
      <aside className="w-full md:w-80 border-r border-surface-800 bg-surface-900/50 flex flex-col h-full hidden md:flex shrink-0">
        <div className="p-4 border-b border-surface-800 flex items-center justify-between">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" /> BookBot
          </h2>
          <button 
            onClick={startNewChat}
            className="p-2 text-surface-400 hover:text-white bg-surface-800 rounded-lg hover:bg-surface-700 transition-colors tooltip"
            title="New Chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-4 px-2">Recent Chats</h3>
          {sessionsData?.map((session) => (
            <button
              key={session.sessionId}
              onClick={() => loadSession(session.sessionId)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-colors text-sm line-clamp-1 ${
                sessionId === session.sessionId 
                  ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                  : 'text-surface-300 hover:bg-surface-800 hover:text-white border border-transparent'
              }`}
            >
              {session.messages[0]?.content || 'New Chat'}
            </button>
          ))}
          {sessionsData?.length === 0 && (
            <p className="text-surface-500 text-sm px-2 italic">No previous chats.</p>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full bg-surface-900 relative">
        
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-surface-800 bg-surface-900/90 backdrop-blur sticky top-0 z-10 flex items-center justify-between">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" /> BookBot
          </h2>
          <button onClick={startNewChat} className="btn-outline py-1.5 px-3 text-xs flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3" /> New
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {localMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-surface-700' : 'bg-gradient-brand shadow-glow'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-surface-300" /> : <Sparkles className="w-4 h-4 text-white" />}
                </div>
                
                <div className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                  msg.role === 'user' 
                    ? 'bg-surface-800 text-white rounded-tr-sm border border-surface-700' 
                    : 'glass-dark text-surface-100 rounded-tl-sm prose prose-invert prose-p:leading-relaxed max-w-none'
                }`}>
                  {msg.content}
                  {msg.provider && msg.role === 'assistant' && (
                    <span className="text-xs text-surface-500 mt-4 block italic flex items-center gap-1 border-t border-surface-700/50 pt-2">
                      <Settings className="w-3 h-3" /> Powered by {msg.provider === 'gemini' ? 'Google Gemini' : msg.provider === 'openai' ? 'OpenAI' : 'Mock AI'}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center shrink-0 shadow-glow">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="glass-dark rounded-2xl rounded-tl-sm px-6 py-4">
                  <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 sm:p-6 border-t border-surface-800 bg-surface-900/90 backdrop-blur">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about books, authors, or genres..."
              disabled={chatMutation.isPending}
              className="w-full bg-surface-800 border border-surface-700 rounded-2xl pl-6 pr-16 py-4 text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={!message.trim() || chatMutation.isPending}
              className="absolute right-2 top-2 bottom-2 bg-brand-500 text-white p-3 rounded-xl hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-center text-xs text-surface-500 mt-3">
            BookBot can make mistakes. Consider verifying important information.
          </p>
        </div>
      </main>
    </div>
  );
}
