import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { getUnreadCount } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';

const NotificationBadge = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [unreadTotal, setUnreadTotal] = useState(0);

  useEffect(() => {
    if (!user || !user.id || (!user.id.startsWith('PID') && !user.id.startsWith('DID'))) return;

    const fetchNotifications = async () => {
      try {
        const res = await getUnreadCount(user.id);
        if (res.status === 'success') {
          setUnreadTotal(res.total || 0);
        }
      } catch (err) {
        console.error("Error polling unread count", err);
      }
    };

    // Initial fetch
    fetchNotifications();

    // Poll every 5 seconds
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  return (
    <button 
      onClick={() => {
        if (user.role === 'doctor') navigate('/doctor-dashboard');
        else if (user.role === 'patient') navigate('/messages');
      }}
      className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100 mr-2"
    >
      <Bell size={20} />
      <AnimatePresence>
        {unreadTotal > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm"
          >
            {unreadTotal > 9 ? '9+' : unreadTotal}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export default NotificationBadge;
