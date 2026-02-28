import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getMessages, sendMessage } from '../services/apiService';
import { Send, ArrowLeft, Loader, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatBox = () => {
  const { targetId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user || !user.id || !targetId) {
      navigate('/onboarding');
      return;
    }
    
    fetchChat();
    // Poll every 3 seconds for new messages
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, [user, targetId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChat = async () => {
    try {
      const res = await getMessages(user.id, targetId, user.id);
      if (res.status === 'success') {
        const sorted = res.messages.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(sorted);
      }
    } catch (err) {
      console.error("Failed fetching chat", err);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    setIsSending(true);
    const textToSend = inputText.trim();
    setInputText(""); // Optimistic clear
    
    try {
      await sendMessage(user.id, targetId, textToSend);
      fetchChat(); // immediately fetch to show
    } catch (err) {
      console.error("Failed to send message", err);
      setInputText(textToSend); // Restore on failure
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[80vh]"
      >
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                Secure Chat
                <ShieldCheck size={16} className="text-emerald-500" />
              </h2>
              <p className="text-xs text-slate-500 font-mono">End-to-End with {targetId}</p>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 flex flex-col gap-4">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Loader className="animate-spin mb-2" size={24} />
              <p className="text-sm">Connecting securely...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 max-w-sm mx-auto p-6">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck size={32} className="text-slate-300" />
              </div>
              <p className="text-sm">This is the start of your medical timeline. Messages are encrypted and stored confidentially.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.sender === user.id;
              return (
                <div key={idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`max-w-[75%] px-5 py-3 text-sm shadow-sm ${
                      isMine 
                        ? 'bg-healthcare-blue text-white rounded-2xl rounded-br-sm' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 mx-1 font-medium select-none">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="flex gap-2 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a secure message..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-healthcare-blue/20 focus:border-healthcare-blue transition-all"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="bg-healthcare-blue text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 shadow-md shadow-blue-500/20"
            >
              {isSending ? <Loader size={18} className="animate-spin" /> : <Send size={18} className="translate-x-[1px]" />}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatBox;
