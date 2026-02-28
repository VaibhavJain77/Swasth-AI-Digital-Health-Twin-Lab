import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, ActivitySquare, BrainCircuit, HeartPulse, Droplet } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const TwinIdentity = ({ data }) => {
  const { user } = useUser();
  const isDoctor = user?.role === 'doctor';
  
  // Icon mapping
  const getIcon = () => {
    switch (data.systemStress) {
      case 'High': return <AlertOctagon size={24} className="text-red-500" />;
      case 'Moderate': return <Shield size={24} className="text-amber-500" />;
      case 'Low': return <Activity size={24} className="text-green-500" />;
      default: return <Activity size={24} className="text-healthcare-blue" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="card bg-gradient-to-br from-healthcare-blue/5 to-transparent border-healthcare-blue/10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <ActivitySquare size={120} />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-healthcare-blue">Your Digital Health Twin</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{data.twinType}</h2>
          
          <p className="text-sm text-slate-600 max-w-lg">
            {isDoctor 
              ? `Patient exhibits a systemic profile matching a ${data.twinType}. Primary variance observed in metabolic and vascular pathways.`
              : data.explanation
            }
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white px-5 py-4 rounded-xl border border-slate-100 shadow-soft shrink-0">
           {getIcon()}
           <div>
             <p className="text-xs text-slate-500 font-semibold uppercase">System Stress</p>
             <p className="font-bold text-slate-800">{data.systemStress}</p>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TwinIdentity;
