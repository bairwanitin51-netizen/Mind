import React, { useState, useRef, useEffect } from 'react';
import { Icons, APP_NAME } from '../constants';
import { Memory, ChatMessage, PersonalityMode, UserProfile } from '../types';
import { chatWithBrain } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

interface ChatAssistantProps {
  memories: Memory[];
  personality: PersonalityMode;
  profile: UserProfile;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ memories, personality, profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: `Hello! I'm ${APP_NAME}. I'm in ${personality} mode. How can I assist you today?`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    // Optimistic Update
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsTyping(true);

    // Call AI Service with full history
    const aiResponseText = await chatWithBrain(userMsg.text, memories, newHistory, profile, personality);

    const aiMsg: ChatMessage = {
      id: uuidv4(),
      role: 'ai',
      text: aiResponseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur z-10 flex justify-between items-center">
        <div>
           <h2 className="text-lg font-bold text-white flex items-center gap-2">
             <Icons.Chat className="text-indigo-400" size={20} />
             AI Companion
           </h2>
           <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
             {personality} Mode Active
           </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-500/10' 
                : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50'
            }`}>
              {/* Render newlines properly */}
              <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <span className={`text-[10px] block mt-2 ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-500'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl rounded-bl-none p-4 border border-slate-700 flex gap-1.5 items-center">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative max-w-4xl mx-auto flex items-end gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all shadow-lg">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Talk to ${APP_NAME} (${personality.toLowerCase()} mode)...`}
            className="flex-1 bg-transparent text-white p-2.5 max-h-32 min-h-[44px] resize-none focus:outline-none placeholder-slate-500 text-sm md:text-base"
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors mb-0.5"
          >
            <Icons.Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;