import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Activity, Sparkles, Bot } from 'lucide-react';
import { useUser } from '../../context/UserContext';

// Import API Service to allow chat follow ups
import { getAIInsights } from '../../services/apiService';

const TwinCompanionChat = ({ aiMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useUser();

  // Initial contextual greeting based on role AND AI backend response
  useEffect(() => {
    if (aiMessage) {
       // Only set the initial message once the AI provides it
       if (messages.length === 0) {
         setMessages([
          { id: 1, text: aiMessage, sender: 'ai', timestamp: new Date() }
         ]);
       } else if (messages[0].sender === 'ai' && messages[0].text !== aiMessage) {
           // Update if the global context changes (e.g. simulated a lifestyle slider)
           setMessages(prev => {
             const newArray = [...prev];
             newArray[0] = { ...newArray[0], text: aiMessage };
             return newArray;
           });
       }
    } else if (messages.length === 0 && user) {
      // Fallback loader if API is still pending
      setMessages([
        { id: 1, text: "Syncing with your biological trajectory...", sender: 'ai', timestamp: new Date() }
      ]);
    }
  }, [user, aiMessage, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { id: Date.now(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // We pass the new prompt to the backend which passes it to Ollama
      // For this hackathon scope, we just make a new insight request with chat appended
      const payload = {
         user_role: user?.role || 'patient',
         swasth_score: 68, // Hardcoded for this mockup step, real app pulls from state
         chat_prompt: input 
      };
      const response = await getAIInsights(payload);
      
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: response.twin_message || "I process your medical queries best when linked directly to your trajectory metrics.", 
        sender: 'ai', 
        timestamp: new Date() 
      }]);
    } catch (error) {
       setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "I'm experiencing a synthetic delay. Please try again soon.", 
        sender: 'ai', 
        timestamp: new Date() 
      }]);
    }

    setIsTyping(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-healthcare-blue to-teal-500 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all focus:outline-none focus:ring-4 focus:ring-blue-300 z-50 group"
          >
            <Bot size={28} className="group-hover:scale-110 transition-transform" />
            
            {/* Notification Dot */}
            <span className="absolute top-0 right-0 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
            </span>
            
            {/* Tooltip */}
            <span className="absolute right-20 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Talk to Your Twin
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-healthcare-blue to-teal-600 px-5 py-4 flex items-center justify-between text-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <Activity size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold tracking-wide">Digital Twin</h3>
                  <p className="text-[10px] text-blue-100 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Active Sync
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-healthcare-blue text-white rounded-br-none shadow-md' 
                      : 'bg-white text-slate-800 rounded-bl-none shadow-sm border border-slate-100'
                  }`}>
                    {msg.sender === 'ai' && (
                       <Sparkles size={14} className="text-teal-500 mb-2 opacity-50 block" />
                    )}
                    <p className="leading-relaxed">{msg.text}</p>
                    <span className={`text-[10px] mt-2 block ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 rounded-bl-none shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your twin about your health..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-full py-3.5 pl-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-healthcare-blue/20 focus:border-healthcare-blue text-slate-800"
                />
                <button
                  type="submit" disabled={!input.trim()}
                  className={`absolute right-2 p-2 rounded-full transition-colors ${
                    input.trim() ? 'bg-healthcare-blue text-white' : 'bg-slate-200 text-slate-400 disabled:cursor-not-allowed'
                  }`}
                >
                  <Send size={16} className={input.trim() ? 'translate-x-0.5' : ''} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TwinCompanionChat;
