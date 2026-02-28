import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, AlertTriangle, ShieldAlert } from 'lucide-react';

// Import our new API
import { getQuickScan } from '../services/apiService';

const QuickScanPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: "Hello! I'm Swasth AI. Please describe your symptoms in detail. For example: 'I have had a severe headache and slight fever since yesterday morning.'",
      isWarning: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg = { id: Date.now(), type: 'user', text: inputValue };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setLoading(true);

    try {
      // Call the LLM backend
      const response = await getQuickScan(newUserMsg.text);
      
      let aiResponse = { 
        id: Date.now() + 1, 
        type: 'ai', 
        isEmergency: response.isEmergency || false,
        text: response.text || "I've analyzed your symptoms.",
        conditions: response.conditions || ["Condition Unknown"],
        severity: response.severity || "Moderate",
        action: response.action || "Please monitor your symptoms."
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, type: 'ai', isEmergency: false, 
        text: "Sorry, the triage engine is currently offline." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-130px)] flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 shrink-0"
      >
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Quick Triage Scan</h1>
        <p className="text-slate-600">Describe what you're feeling and our AI will provide initial guidance.</p>
        
        <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <strong>Disclaimer:</strong> Swasth AI is for informational purposes only and does not provide medical diagnosis. Always consult a doctor for medical advice.
          </p>
        </div>
      </motion.div>

      <div className="flex-1 card flex flex-col overflow-hidden p-0 border border-slate-200 shadow-sm relative">
        {/* Chat Messages Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                msg.type === 'user' ? 'bg-healthcare-blue text-white' : 'bg-teal-100 text-teal-700'
              }`}>
                {msg.type === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              
              <div className={`flex flex-col max-w-[80%] ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl ${
                  msg.type === 'user' 
                    ? 'bg-healthcare-blue text-white rounded-tr-none' 
                    : msg.isEmergency 
                      ? 'bg-red-50 border border-red-200 text-red-900 rounded-tl-none'
                      : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  
                  {msg.conditions && (
                    <div className="mt-4 space-y-3">
                      {msg.isEmergency && (
                        <div className="flex items-center gap-2 text-red-600 font-bold bg-red-100 p-2 rounded-lg">
                          <ShieldAlert size={20} />
                          EMERGENCY WARNING
                        </div>
                      )}
                      <div>
                        <span className="font-semibold block text-sm opacity-80 mb-1">Possible Conditions:</span>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {msg.conditions.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-3 border-t border-black/10 pt-3">
                        <span className="font-semibold">Severity:</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          msg.severity === 'CRITICAL' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
                        }`}>
                          {msg.severity}
                        </span>
                      </div>
                      <div className="text-sm mt-2 border-l-4 border-healthcare-blue pl-3 py-1">
                        <span className="font-semibold block text-healthcare-blue">Recommended Action:</span>
                        {msg.action}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-400 mt-1">{msg.type === 'user' ? 'You' : 'Swasth AI'}</span>
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="E.g., I've been experiencing sharp chest pain..."
              disabled={loading}
              className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-healthcare-blue/20 focus:border-healthcare-blue transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="absolute right-2 p-2 bg-healthcare-blue text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-healthcare-blue transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuickScanPage;

