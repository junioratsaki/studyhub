import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/axios';

const EduBotChat = ({ subjectId }) => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([
    { id: 'welcome', sender: 'bot', text: 'Bonjour ! Je suis EduBot, votre tuteur IA. Comment puis-je vous aider avec ce sujet ?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await api.post('/ai/edubot/session', { subjectId });
        if (response.data.success) {
          const session = response.data.data;
          setSessionId(session.id);
          // Charger l'historique si existant
          if (session.messages && session.messages.length > 0) {
            const mapped = session.messages.map((m, idx) => ({
              id: `hist-${idx}`,
              sender: m.role === 'user' ? 'user' : 'bot',
              text: m.content
            }));
            setMessages([
              { id: 'welcome', sender: 'bot', text: 'Bonjour ! Je suis EduBot, votre tuteur IA. Comment puis-je vous aider avec ce sujet ?' },
              ...mapped
            ]);
          } else {
            setMessages([
              { id: 'welcome', sender: 'bot', text: 'Bonjour ! Je suis EduBot, votre tuteur IA. Comment puis-je vous aider avec ce sujet ?' }
            ]);
          }
        }
      } catch (err) {
        console.error("Erreur d'initialisation de session EduBot:", err);
      }
    };
    if (subjectId) {
      initSession();
    }
  }, [subjectId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping || !sessionId) return;

    const userMsgText = input;
    const userMsg = { id: Date.now(), sender: 'user', text: userMsgText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const botMsgId = Date.now() + 1;
    setMessages(prev => [...prev, { id: botMsgId, sender: 'bot', text: '' }]);

    try {
      const token = localStorage.getItem('accessToken');
      const streamUrl = `http://localhost:3000/api/v1/ai/edubot/stream/${sessionId}?message=${encodeURIComponent(userMsgText)}`;
      
      const response = await fetch(streamUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("HTTP error on stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleanLine = line.trim();
          if (cleanLine.startsWith('data: ')) {
            const dataStr = cleanLine.slice(6).trim();
            if (dataStr === '[DONE]') {
              setIsTyping(false);
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.token) {
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === botMsgId 
                      ? { ...msg, text: msg.text + parsed.token } 
                      : msg
                  )
                );
              } else if (parsed.error) {
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === botMsgId 
                      ? { ...msg, text: msg.text + "\n[Erreur: " + parsed.error + "]" } 
                      : msg
                  )
                );
              }
            } catch (err) {
              // Ignore partial JSON parse errors
            }
          }
        }
      }
    } catch (err) {
      console.error("Erreur de communication avec EduBot:", err);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMsgId 
            ? { ...msg, text: "Désolé, j'ai rencontré un problème pour générer la réponse. Veuillez réessayer." } 
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-iuc-dark border-l border-white/10">
      
      {/* Header */}
      <div className="h-16 border-b border-white/10 flex items-center px-6 bg-iuc-gray/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-iuc-green/20 flex items-center justify-center text-iuc-green">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">EduBot</h3>
            <p className="text-[10px] text-iuc-green flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-iuc-green animate-pulse"></span> En ligne
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.sender === 'user' ? 'bg-iuc-red text-white' : 'bg-white/10 text-iuc-green'
            }`}>
              {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            
            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-iuc-red text-white rounded-tr-sm' 
                : 'bg-iuc-gray border border-white/5 text-gray-200 rounded-tl-sm'
            }`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-iuc-green">
              <Bot size={14} />
            </div>
            <div className="p-4 rounded-2xl bg-iuc-gray border border-white/5 rounded-tl-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto hide-scrollbar">
        <button onClick={() => setInput("Peux-tu m'expliquer l'exercice 1 ?")} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-1">
          <Sparkles size={12} className="text-iuc-green" /> Expliquer l'exercice 1
        </button>
        <button onClick={() => setInput("Quelle est la formule pour la question 2 ?")} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors">
          Formule question 2
        </button>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-iuc-gray/30 border-t border-white/5">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question à l'IA..."
            className="w-full bg-iuc-dark border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-white text-sm focus:outline-none focus:border-iuc-green/50 focus:ring-1 focus:ring-iuc-green/50 transition-all placeholder:text-gray-600"
            disabled={isTyping}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping || !sessionId}
            className="absolute right-2 w-9 h-9 rounded-lg bg-iuc-green hover:bg-green-600 text-white flex items-center justify-center disabled:opacity-50 disabled:hover:bg-iuc-green transition-colors"
          >
            {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-0.5" />}
          </button>
        </form>
        <p className="text-[10px] text-center text-gray-600 mt-2">
          EduBot peut faire des erreurs. Vérifiez toujours les informations importantes.
        </p>
      </div>
    </div>
  );
};

export default EduBotChat;
