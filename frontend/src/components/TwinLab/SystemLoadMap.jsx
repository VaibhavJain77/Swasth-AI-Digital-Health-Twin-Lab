import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { HeartPulse, Droplet, Brain, Activity } from 'lucide-react';

const ProgressBar = ({ label, value, icon: Icon, isDoctor, exactValue }) => {
  // Determine color based on value (0-100)
  const getColor = (v) => {
    if (v < 30) return 'bg-green-500';
    if (v < 70) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  const getLabel = (v) => {
    if (v < 30) return 'Low';
    if (v < 70) return 'Moderate';
    return 'High';
  };

  const colorClass = getColor(value);
  const statusLabel = getLabel(value);

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-1.5 cursor-default group">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-slate-400 group-hover:text-healthcare-blue transition-colors" />
          <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>
        <span className="text-xs font-bold text-slate-600">
          {isDoctor ? (
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{exactValue.toFixed(2)}</span>
          ) : (
             <span className={`px-2 py-0.5 rounded-full ${colorClass.replace('bg-', 'bg-').replace('500', '100')} ${colorClass.replace('bg-', 'text-')}`}>
               {statusLabel}
             </span>
          )}
        </span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${value}%` }} 
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${colorClass}`}
        />
      </div>
    </div>
  );
};

const SystemLoadMap = ({ data }) => {
  const { user } = useUser();
  const isDoctor = user?.role === 'doctor';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="card h-full"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">System Load Map</h3>
        <p className="text-xs text-slate-500 mt-1">
          {isDoctor ? "Quantitative systemic burden cross-analysis." : "Current stress levels across primary body systems."}
        </p>
      </div>

      <div className="space-y-6">
        <ProgressBar label="Cardiovascular Load" value={data.cardio.value} exactValue={data.cardio.exact} icon={HeartPulse} isDoctor={isDoctor} />
        <ProgressBar label="Metabolic Load" value={data.metabolic.value} exactValue={data.metabolic.exact} icon={Droplet} isDoctor={isDoctor} />
        <ProgressBar label="Neurological Load" value={data.neuro.value} exactValue={data.neuro.exact} icon={Brain} isDoctor={isDoctor} />
        <ProgressBar label="Vascular Load" value={data.vascular.value} exactValue={data.vascular.exact} icon={Activity} isDoctor={isDoctor} />
      </div>
    </motion.div>
  );
};

export default SystemLoadMap;
