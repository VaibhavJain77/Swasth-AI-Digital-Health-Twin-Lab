import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const HealthTrajectory = ({ data }) => {
  const { user } = useUser();
  const isDoctor = user?.role === 'doctor';

  const getStatusConfig = () => {
    switch (data.direction) {
      case 'Accelerating':
        return {
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-100',
          badgeBg: 'bg-red-500',
          icon: <TrendingDown size={28} className="text-red-500" /> // Down graph = worse health
        };
      case 'Drifting':
        return {
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          badgeBg: 'bg-amber-500',
          icon: <ArrowRight size={28} className="text-amber-500" />
        };
      case 'Stable':
      default:
        return {
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-100',
          badgeBg: 'bg-green-500',
          icon: <TrendingUp size={28} className="text-green-500" /> // Up graph = better health
        };
    }
  };

  const config = getStatusConfig();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`card border-l-4 ${config.border} relative overflow-hidden`}
      style={{ borderLeftColor: config.badgeBg.replace('bg-', '') }} // Hack for tailwind border color
    >
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full ${config.bg} opacity-50 -z-10`} />
      
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <h3 className="text-xl font-bold text-slate-900">Health Trajectory Status</h3>
             <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${config.badgeBg} shadow-sm flex items-center gap-1`}>
               {data.direction}
             </span>
           </div>
           
           <p className="text-sm text-slate-600 max-w-2xl leading-relaxed mt-3">
             {isDoctor ? (
               <span className="font-medium text-slate-800 flex items-center gap-2">
                 <AlertTriangle size={16} className={config.color} />
                 {data.clinicalExplanation}
               </span>
             ) : (
               <span className="font-medium text-slate-800 flex items-center gap-2">
                 {data.direction === 'Stable' ? <ShieldCheck size={16} className={config.color} /> : <AlertTriangle size={16} className={config.color} />}
                 {data.userExplanation}
               </span>
             )}
           </p>
        </div>

        <div className={`shrink-0 p-4 rounded-2xl ${config.bg} border ${config.border} shadow-sm hidden sm:block`}>
          {config.icon}
        </div>
      </div>
    </motion.div>
  );
};

export default HealthTrajectory;
